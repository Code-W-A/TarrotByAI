const buffer = require("buffer");
// Node.js 20 removed `buffer.SlowBuffer`. Some transitive deps (ex: `buffer-equal-constant-time`)
// still reference it at require-time. Provide a safe fallback to keep Functions loading.
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Expo} = require("expo-server-sdk");
const stripe = require("stripe")(functions.config().stripe.secret_key);
const https = require("https");

// Creează o nouă instanță a Expo SDK
const expo = new Expo();

admin.initializeApp();

const db = admin.firestore();
const TERMINAL_EXPO_TOKEN_ERRORS = new Set([
  "DeviceNotRegistered",
  "InvalidExpoPushToken",
]);
const DEFAULT_LEGACY_TOKEN_FALLBACK_LIMIT = 300;
const VIDEO_NOTIFICATION_STATE_PENDING = "pending";
const VIDEO_NOTIFICATION_STATE_SENT = "sent";

/**
 * Normalizes Expo/EAS project id values.
 * @param {*} value
 * @return {string}
 */
function normalizePushProjectId(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

/**
 * Resolves allowed project ids for notification targeting.
 * @return {string[]}
 */
function resolveConfiguredPushProjectIds() {
  const notificationsCfg = functions.config().notifications || {};
  const configured = [
    notificationsCfg.project_id,
    notificationsCfg.expo_project_id,
  ];
  const configuredList = Array.isArray(notificationsCfg.project_ids) ?
    notificationsCfg.project_ids :
    typeof notificationsCfg.project_ids === "string" ?
      notificationsCfg.project_ids.split(",") :
      [];

  const unique = new Set();
  [...configured, ...configuredList].forEach((value) => {
    const normalized = normalizePushProjectId(value);
    if (normalized) unique.add(normalized);
  });
  return Array.from(unique.values());
}

/**
 * Normalizes a phone number for lookup.
 * @param {string} phone
 * @return {string}
 */
function normalizeContactPhone(phone) {
  if (typeof phone !== "string") {
    return "";
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    return "";
  }

  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  if (!digitsOnly) {
    return "";
  }

  return digitsOnly.startsWith("00") ? digitsOnly.slice(2) : digitsOnly;
}

/**
 * Normalizes an email address for lookup.
 * @param {string} email
 * @return {string}
 */
function normalizeContactEmail(email) {
  if (typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
}

/**
 * Converts arbitrary values to Stripe metadata-safe strings.
 * @param {*} value
 * @return {string}
 */
function toStripeMetadataString(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim().slice(0, 500);
}

/**
 * Removes empty values from Stripe metadata payloads.
 * @param {Object} metadata
 * @return {Object}
 */
function buildStripeMetadata(metadata) {
  return Object.entries(metadata || {}).reduce((accumulator, [key, value]) => {
    const normalizedValue = toStripeMetadataString(value);
    if (normalizedValue) {
      accumulator[key] = normalizedValue;
    }
    return accumulator;
  }, {});
}

/**
 * Masks an email for logs.
 * @param {string} email
 * @return {string}
 */
function maskEmailForLogs(email) {
  const normalized = normalizeContactEmail(email);
  if (!normalized || !normalized.includes("@")) {
    return "";
  }
  const [localPart, domainPart] = normalized.split("@");
  if (!localPart || !domainPart) {
    return "";
  }
  const visibleLocal = localPart.length <= 2 ?
    `${localPart[0] || "*"}*` :
    `${localPart.slice(0, 2)}***`;
  return `${visibleLocal}@${domainPart}`;
}

/**
 * Masks a phone for logs.
 * @param {string} phone
 * @return {string}
 */
function maskPhoneForLogs(phone) {
  const normalized = normalizeContactPhone(phone);
  if (!normalized) {
    return "";
  }
  if (normalized.length <= 4) {
    return `***${normalized.slice(-2)}`;
  }
  return `***${normalized.slice(-4)}`;
}

/**
 * Builds a safe error summary for logs.
 * @param {*} error
 * @return {Object}
 */
function summarizeErrorForLogs(error) {
  if (!error || typeof error !== "object") {
    return {message: String(error || "")};
  }
  return {
    name: error.name || "",
    message: error.message || "",
    code: error.code || "",
    type: error.type || "",
    rawType: error.rawType || "",
    param: error.param || "",
    requestId: error.requestId || "",
    stack: typeof error.stack === "string" ? error.stack.split("\n").slice(0, 4).join(" | ") : "",
  };
}

/**
 * Extracts a sanitized Oblio payload summary for logs.
 * @param {Object} payload
 * @return {Object}
 */
function buildOblioPayloadLogSummary(payload) {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  const client = payload.client || {};
  const products = Array.isArray(payload.products) ? payload.products : [];
  const firstProduct = products[0] || {};
  return {
    cif: payload.cif || "",
    seriesName: payload.seriesName || "",
    issueDate: payload.issueDate || "",
    dueDate: payload.dueDate || "",
    currency: payload.currency || "",
    spvExtern: payload.spvExtern,
    idempotencyKey: payload.idempotencyKey || "",
    mentions: payload.mentions || "",
    client: {
      name: client.name || "",
      cif: client.cif || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      country: client.country || "",
      emailMasked: maskEmailForLogs(client.email),
      phoneMasked: maskPhoneForLogs(client.phone),
    },
    collect: payload.collect || null,
    firstProduct: {
      name: firstProduct.name || "",
      quantity: firstProduct.quantity || "",
      price: firstProduct.price || "",
      vatName: firstProduct.vatName || "",
      vatPercentage: firstProduct.vatPercentage || "",
      vatIncluded: firstProduct.vatIncluded,
    },
  };
}

/**
 * Retrieves a Stripe customer when present.
 * @param {Object} stripeClient
 * @param {string|Object|null} customerRef
 * @param {string} runId
 * @return {Promise<Object|null>}
 */
async function fetchStripeCustomerSafe(stripeClient, customerRef, runId) {
  try {
    const customerId = typeof customerRef === "string" ?
      customerRef :
      customerRef && typeof customerRef === "object" ? customerRef.id : "";

    if (!customerId) {
      return null;
    }

    const customer = await stripeClient.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      return null;
    }

    return customer;
  } catch (error) {
    console.warn(`[${runId}] failed to retrieve stripe customer`, {error: error && error.message});
    return null;
  }
}

/**
 * Upserts the purchase entitlement ledger for a Stripe payment.
 * @param {Object} params
 * @return {Promise<Object|null>}
 */
async function upsertPurchaseEntitlement({
  stripeClient,
  transactionId,
  paymentIntent = null,
  customerData = {},
  metadata = {},
  source = "",
  runId = "purchaseEntitlement",
}) {
  const normalizedTransactionId = toStripeMetadataString(
      transactionId || paymentIntent && paymentIntent.id,
  );

  if (!normalizedTransactionId) {
    console.log(`[${runId}] skip entitlement upsert - missing transactionId`);
    return null;
  }

  const paymentIntentSnapshot = paymentIntent ||
    await stripeClient.paymentIntents.retrieve(normalizedTransactionId);

  const stripeCustomer = await fetchStripeCustomerSafe(
      stripeClient,
      paymentIntentSnapshot.customer,
      runId,
  );

  const mergedMetadata = {
    ...(paymentIntentSnapshot.metadata || {}),
    ...(metadata || {}),
  };

  const rawEmail = toStripeMetadataString(
      customerData.email ||
      stripeCustomer && stripeCustomer.email ||
      mergedMetadata.customerEmail,
  );
  const rawPhone = toStripeMetadataString(
      customerData.phone ||
      stripeCustomer && stripeCustomer.phone ||
      mergedMetadata.customerPhone,
  );
  const rawName = toStripeMetadataString(
      customerData.name ||
      [customerData.firstName, customerData.lastName].filter(Boolean).join(" ") ||
      stripeCustomer && stripeCustomer.name,
  );
  const analysisId = toStripeMetadataString(
      mergedMetadata.analysisId || customerData.analysisId,
  );
  const analysisType = toStripeMetadataString(
      mergedMetadata.analysisType || customerData.analysisType,
  );
  const ownerUid = toStripeMetadataString(
      mergedMetadata.ownerUid || customerData.ownerUid,
  );
  const productCode = toStripeMetadataString(
      mergedMetadata.productCode || customerData.productCode,
  );
  const docId = `stripe_${normalizedTransactionId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const entitlementRef = db.collection("purchaseEntitlements").doc(docId);
  const entitlementSnap = await entitlementRef.get();

  const entitlementPayload = {
    transactionId: normalizedTransactionId,
    provider: "stripe",
    legacy: false,
    status: toStripeMetadataString(paymentIntentSnapshot.status),
    productCode,
    amount: typeof paymentIntentSnapshot.amount === "number" ?
      paymentIntentSnapshot.amount :
      null,
    currency: toStripeMetadataString((paymentIntentSnapshot.currency || "").toLowerCase()),
    stripeCustomerId: toStripeMetadataString(
        typeof paymentIntentSnapshot.customer === "string" ?
          paymentIntentSnapshot.customer :
          paymentIntentSnapshot.customer && paymentIntentSnapshot.customer.id,
    ),
    customer: {
      name: rawName,
      email: rawEmail,
      emailLower: normalizeContactEmail(rawEmail),
      phone: rawPhone,
      phoneNormalized: normalizeContactPhone(rawPhone),
    },
    analysis: {
      analysisId,
      analysisType,
    },
    ownerUid,
    coupon: {
      code: toStripeMetadataString(mergedMetadata.couponCode),
      percent: toStripeMetadataString(mergedMetadata.couponPercent),
      source: toStripeMetadataString(mergedMetadata.couponSource),
    },
    legal: {
      termsVersion: toStripeMetadataString(mergedMetadata.termsVersion),
      privacyVersion: toStripeMetadataString(mergedMetadata.privacyVersion),
      digitalContentWaiverAccepted:
        toStripeMetadataString(mergedMetadata.digitalContentWaiverAccepted) === "true",
      legalAcceptedAt: toStripeMetadataString(mergedMetadata.legalAcceptedAt),
      immediateExecutionAcceptedAt: toStripeMetadataString(
          mergedMetadata.immediateExecutionAcceptedAt,
      ),
      withdrawalWaiverAcceptedAt: toStripeMetadataString(
          mergedMetadata.withdrawalWaiverAcceptedAt,
      ),
    },
    source: {
      lastWriter: toStripeMetadataString(source),
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (!entitlementSnap.exists) {
    entitlementPayload.createdAt = admin.firestore.FieldValue.serverTimestamp();
  }

  await entitlementRef.set(entitlementPayload, {merge: true});

  console.log(`[${runId}] purchase entitlement upserted`, {
    docId,
    transactionId: normalizedTransactionId,
    analysisId,
    analysisType,
    productCode,
    status: entitlementPayload.status,
    source,
  });

  return {
    docId,
    transactionId: normalizedTransactionId,
  };
}

/**
 * Normalizes whitespace in free-text values.
 * @param {string} value
 * @return {string}
 */
function normalizeOblioText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
}

/**
 * Removes Romanian diacritics for comparisons.
 * @param {string} value
 * @return {string}
 */
function stripDiacritics(value) {
  return normalizeOblioText(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normalizes the client country for Oblio/SPV checks.
 * @param {string} country
 * @return {string}
 */
function normalizeOblioCountry(country) {
  const cleanedCountry = normalizeOblioText(country);
  const normalizedCountry = stripDiacritics(cleanedCountry).toLowerCase();

  if (!cleanedCountry) {
    return "";
  }

  if (normalizedCountry === "ro" || normalizedCountry === "romania") {
    return "Romania";
  }

  return cleanedCountry;
}

/**
 * Extracts the Bucharest sector from a free-text value when present.
 * @param {string} value
 * @return {string}
 */
function extractBucharestSector(value) {
  const normalizedValue = stripDiacritics(value).toLowerCase();
  const sectorMatch = normalizedValue.match(/sector(?:ul)?\s*([1-6])/);

  return sectorMatch ? `Sector ${sectorMatch[1]}` : "";
}

/**
 * Normalizes the county/state value for Oblio/SPV.
 * @param {string} state
 * @return {string}
 */
function normalizeOblioState(state) {
  const cleanedState = normalizeOblioText(state);
  const normalizedState = stripDiacritics(cleanedState).toLowerCase();

  if (!cleanedState) {
    return "";
  }

  if (
    normalizedState === "bucuresti" ||
    normalizedState === "municipiul bucuresti" ||
    normalizedState.startsWith("bucuresti sector")
  ) {
    return "Bucuresti";
  }

  return cleanedState;
}

/**
 * Normalizes the locality/city value for Oblio/SPV.
 * @param {string} city
 * @param {string} state
 * @return {string}
 */
function normalizeOblioCity(city, state) {
  const cleanedCity = normalizeOblioText(city);
  const sectorFromCity = extractBucharestSector(cleanedCity);
  const sectorFromState = extractBucharestSector(state);

  if (sectorFromCity) {
    return sectorFromCity;
  }

  if (sectorFromState) {
    return sectorFromState;
  }

  return cleanedCity;
}

/**
 * Builds a normalized PF client payload for Oblio.
 * @param {Object} customer
 * @return {Object}
 */
function buildNormalizedOblioPfClient(customer) {
  const firstName = normalizeOblioText(customer && customer.firstName);
  const lastName = normalizeOblioText(customer && customer.lastName);
  const email = normalizeOblioText(customer && customer.email);
  const phone = normalizeOblioText(customer && customer.phone);
  const addressLine = normalizeOblioText(customer && customer.address && customer.address.line1);
  const state = normalizeOblioState(customer && customer.address && customer.address.state);
  const city = normalizeOblioCity(customer && customer.address && customer.address.city, state);
  const country = normalizeOblioCountry(customer && customer.address && customer.address.country);

  return {
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
    email,
    phone,
    address: {
      line1: addressLine,
      city,
      state,
      postalCode: normalizeOblioText(customer && customer.address && customer.address.postal_code),
      country,
    },
  };
}

/**
 * Evaluates whether a PF invoice can be auto-sent to SPV.
 * @param {Object} normalizedClient
 * @return {{isEligible: boolean, reasons: string[], clientCif: string}}
 */
function evaluatePfSpvAutoSend(normalizedClient) {
  const reasons = [];
  const normalizedCountry = stripDiacritics(normalizedClient.address.country).toLowerCase();
  const normalizedState = stripDiacritics(normalizedClient.address.state).toLowerCase();
  const city = normalizeOblioText(normalizedClient.address.city);

  if (normalizedCountry !== "romania") {
    reasons.push("non_ro_country");
  }

  if (
    !normalizedClient.fullName ||
    !normalizedClient.address.line1 ||
    !city ||
    !normalizedClient.address.state ||
    !normalizedClient.address.country
  ) {
    reasons.push("missing_required_client_data");
  }

  if (normalizedState === "bucuresti" && !/^Sector [1-6]$/i.test(city)) {
    reasons.push("bucharest_requires_sector_city");
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
    clientCif: normalizedCountry === "romania" ? "-" : "",
  };
}

exports.getPurchaseEntitlementsByContact = functions.https.onCall(async (data) => {
  const runId = `getPurchaseEntitlementsByContact-${Date.now().toString(36)}`;
  const rawPhone = toStripeMetadataString(data && data.phone);
  const rawEmail = toStripeMetadataString(data && data.email);
  const normalizedPhone = normalizeContactPhone(rawPhone);
  const normalizedEmail = normalizeContactEmail(rawEmail);

  if (!normalizedPhone && !normalizedEmail && !rawPhone) {
    console.log(`[${runId}] skip - missing contact data`);
    return {entitlements: []};
  }

  const queries = [];
  const entitlementsRef = db.collection("purchaseEntitlements");

  if (normalizedEmail) {
    queries.push(entitlementsRef.where("customer.emailLower", "==", normalizedEmail).get());
  }
  if (normalizedPhone) {
    queries.push(entitlementsRef.where("customer.phoneNormalized", "==", normalizedPhone).get());
  }
  if (rawPhone) {
    queries.push(entitlementsRef.where("customer.phone", "==", rawPhone).get());
  }

  const snapshots = await Promise.all(queries);
  const entitlementsByDocId = new Map();

  snapshots.forEach((snapshot) => {
    snapshot.forEach((docSnap) => {
      entitlementsByDocId.set(docSnap.id, {
        id: docSnap.id,
        ...docSnap.data(),
      });
    });
  });

  const entitlements = Array.from(entitlementsByDocId.values());

  console.log(`[${runId}] returning purchase entitlements`, {
    normalizedEmail,
    normalizedPhone,
    count: entitlements.length,
  });

  return {entitlements};
});

// ----------------- OBLIO HELPERS -----------------
/**
 * POST to Oblio with x-www-form-urlencoded body.
 * @param {string} url
 * @param {Object} formObj
 * @param {string|null} token
 * @return {Promise<Object>}
 */
function oblioPostForm(url, formObj, token = null) {
  const body = new URLSearchParams(formObj).toString();
  const requestId = `oblioPostForm-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  console.log(`[${requestId}] Oblio POST form start`, {
    url,
    hasToken: Boolean(token),
    formKeys: Object.keys(formObj || {}),
    bodySize: body.length,
  });
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
        {
          method: "POST",
          hostname: u.hostname,
          path: u.pathname + u.search,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(body),
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => {
            try {
              const json = JSON.parse(data || "{}");
              console.log(`[${requestId}] Oblio POST form end`, {
                statusCode: res.statusCode,
                hasJson: Boolean(json),
              });
              resolve({statusCode: res.statusCode, json});
            } catch (e) {
              console.warn(`[${requestId}] Oblio POST form non-json response`, {
                statusCode: res.statusCode,
                rawPreview: String(data || "").slice(0, 500),
              });
              resolve({statusCode: res.statusCode, json: null, raw: data});
            }
          });
        },
    );
    req.on("error", (error) => {
      console.error(`[${requestId}] Oblio POST form request error`, summarizeErrorForLogs(error));
      reject(error);
    });
    req.write(body);
    req.end();
  });
}

/**
 * POST to Oblio with JSON body.
 * @param {string} url
 * @param {Object} payload
 * @param {string} token
 * @return {Promise<Object>}
 */
function oblioPostJson(url, payload, token) {
  const body = JSON.stringify(payload);
  const requestId = `oblioPostJson-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  console.log(`[${requestId}] Oblio POST json start`, {
    url,
    hasToken: Boolean(token),
    bodySize: body.length,
  });
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
        {
          method: "POST",
          hostname: u.hostname,
          path: u.pathname + u.search,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
            "Authorization": `Bearer ${token}`,
          },
        },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => {
            try {
              const json = JSON.parse(data || "{}");
              console.log(`[${requestId}] Oblio POST json end`, {
                statusCode: res.statusCode,
                hasJson: Boolean(json),
              });
              resolve({statusCode: res.statusCode, json});
            } catch (e) {
              console.warn(`[${requestId}] Oblio POST json non-json response`, {
                statusCode: res.statusCode,
                rawPreview: String(data || "").slice(0, 500),
              });
              resolve({statusCode: res.statusCode, json: null, raw: data});
            }
          });
        },
    );
    req.on("error", (error) => {
      console.error(`[${requestId}] Oblio POST json request error`, summarizeErrorForLogs(error));
      reject(error);
    });
    req.write(body);
    req.end();
  });
}

/**
 * GET JSON from Oblio.
 * @param {string} url
 * @param {string} token
 * @return {Promise<Object>}
 */
function oblioGetJson(url, token) {
  const requestId = `oblioGetJson-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  console.log(`[${requestId}] Oblio GET start`, {
    url,
    hasToken: Boolean(token),
  });
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
        {
          method: "GET",
          hostname: u.hostname,
          path: u.pathname + u.search,
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => {
            try {
              const json = JSON.parse(data || "{}");
              console.log(`[${requestId}] Oblio GET end`, {
                statusCode: res.statusCode,
                hasJson: Boolean(json),
              });
              resolve({statusCode: res.statusCode, json});
            } catch (e) {
              console.warn(`[${requestId}] Oblio GET non-json response`, {
                statusCode: res.statusCode,
                rawPreview: String(data || "").slice(0, 500),
              });
              resolve({statusCode: res.statusCode, json: null, raw: data});
            }
          });
        },
    );
    req.on("error", (error) => {
      console.error(`[${requestId}] Oblio GET request error`, summarizeErrorForLogs(error));
      reject(error);
    });
    req.end();
  });
}

/**
 * Gets OAuth access token from Oblio.
 * @param {string} runId
 * @return {Promise<string>}
 */
async function getOblioAccessToken(runId) {
  const cfg = functions.config().oblio || {};
  const clientId = cfg.client_id;
  const clientSecret = cfg.client_secret;
  if (!clientId || !clientSecret) {
    throw new Error("Missing Oblio config: oblio.client_id / oblio.client_secret");
  }
  const {statusCode, json, raw} = await oblioPostForm(
      "https://www.oblio.eu/api/authorize/token",
      {client_id: clientId, client_secret: clientSecret},
  );
  if (statusCode !== 200 || !json || !json.access_token) {
    console.error(`[${runId}] Oblio token error`, {statusCode, json, raw});
    throw new Error("Oblio auth failed");
  }
  return json.access_token;
}

/**
 * Resolves the default VAT rate from Oblio, with a safe fallback to config/current behavior.
 * @param {{token: string, cif: string, runId: string}} params
 * @return {Promise<{name: string, percentage: number}>}
 */
async function resolveOblioVatRate({token, cif, runId}) {
  const cfg = functions.config().oblio || {};
  const fallbackName = normalizeOblioText(cfg.vat_name) || "Normala";
  const fallbackPercentage = Number(cfg.vat_percentage);
  const safeFallbackPercentage = Number.isFinite(fallbackPercentage) ?
    fallbackPercentage :
    21;

  try {
    const url = `https://www.oblio.eu/api/nomenclature/vat_rates?cif=${encodeURIComponent(String(cif || ""))}`;
    const {statusCode, json, raw} = await oblioGetJson(url, token);
    const rates = json && Array.isArray(json.data) ? json.data : [];
    const defaultRate = rates.find((rate) => rate && rate.default) || rates[0];
    const resolvedPercentage = Number(defaultRate && defaultRate.percent);
    const resolvedName = normalizeOblioText(defaultRate && defaultRate.name);

    if (statusCode === 200 && resolvedName && Number.isFinite(resolvedPercentage)) {
      console.log(`[${runId}] resolved Oblio VAT rate`, {
        vatName: resolvedName,
        vatPercentage: resolvedPercentage,
      });
      return {
        name: resolvedName,
        percentage: resolvedPercentage,
      };
    }

    console.warn(`[${runId}] invalid Oblio VAT response, using fallback`, {
      statusCode,
      json,
      raw,
      fallbackName,
      fallbackPercentage: safeFallbackPercentage,
    });
  } catch (error) {
    console.warn(`[${runId}] failed to resolve Oblio VAT rate, using fallback`, {
      error: error && error.message,
      fallbackName,
      fallbackPercentage: safeFallbackPercentage,
    });
  }

  return {
    name: fallbackName,
    percentage: safeFallbackPercentage,
  };
}

/**
 * Maps productCode to product metadata and base amount (bani).
 * @param {string} productCode
 * @return {{name: string, description: string, baseAmountBani: number}}
 */
function mapProduct(productCode) {
  switch (productCode) {
    case "astrogama_natala":
      // Amounts are in the smallest currency unit (cents for EUR)
      return {name: "Analiză Astrogramă", description: "Serviciu digital - analiză astrologică", baseAmountBani: 1000};
    case "astrogama_natala_other_person":
      return {name: "Analiză Astrogramă (altă persoană)", description: "Serviciu digital - analiză astrologică", baseAmountBani: 1000};
    case "sinastrie_relatie":
      return {name: "Analiză Sinastrie", description: "Serviciu digital - analiză sinastrie", baseAmountBani: 1500};
    case "sinastrie_relatie_others":
      return {name: "Analiză Sinastrie (altă persoană)", description: "Serviciu digital - analiză sinastrie", baseAmountBani: 1500};
    default:
      return {name: "Analiză", description: "Serviciu digital", baseAmountBani: 1500};
  }
}

const HARDCODED_FIXED_COUPONS = {
  TEST2LEI: {fixedAmountBani: 100, couponSource: "hardcoded_1eur"}, // 1.00 EUR
  TEST3LEI: {fixedAmountBani: 60, couponSource: "hardcoded_0_6eur"}, // 0.60 EUR (~3 lei)
};

/**
 * Validates coupon from Firestore doc coupons/singleton and returns discount percent.
 * Note: isCuponUsed === true means coupon is allowed.
 * @param {string} runId
 * @param {string} couponCode
 * @return {Promise<Object>}
 */
async function validateCouponAndComputeDiscount(runId, couponCode) {
  const entered = String(couponCode || "").trim().toUpperCase();
  if (!entered) return {couponAllowed: false, couponCode: "", discountPercent: 0};

  const hardcoded = HARDCODED_FIXED_COUPONS[entered];
  if (hardcoded) {
    return {
      couponAllowed: true,
      couponCode: entered,
      discountPercent: 0,
      fixedAmountBani: Number(hardcoded.fixedAmountBani) || 0,
      couponSource: String(hardcoded.couponSource || ""),
    };
  }

  const snap = await admin.firestore().doc("coupons/singleton").get();
  if (!snap.exists) {
    console.warn(`[${runId}] coupon doc missing`);
    return {couponAllowed: false, couponCode: entered, discountPercent: 0};
  }
  const data = snap.data() || {};
  const allowed = data.isCuponUsed === true;
  const stored = String(data.cuponCode || "").trim().toUpperCase();
  const percent = Number(data.discountPercent);

  if (!allowed) return {couponAllowed: false, couponCode: entered, discountPercent: 0};
  if (!stored || stored !== entered) return {couponAllowed: false, couponCode: entered, discountPercent: 0};
  if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) return {couponAllowed: false, couponCode: entered, discountPercent: 0};

  return {couponAllowed: true, couponCode: stored, discountPercent: percent};
}

const normalizeNotificationLanguage = (language) => {
  if (typeof language !== "string") {
    return "";
  }

  const normalized = language.trim().toLowerCase();
  if (!normalized) {
    return "";
  }

  return normalized.split(/[-_]/)[0];
};

const mapLegacyLanguageKey = (language) => {
  const normalizedLanguage = normalizeNotificationLanguage(language);
  if (normalizedLanguage === "hi") return "hu";
  if (normalizedLanguage === "id") return "ru";
  if (normalizedLanguage === "ru") return "rusa";
  return normalizedLanguage;
};

const sanitizeNotificationText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const resolveNotificationInfo = (info, language, logPrefix = "Push", context = {}) => {
  const normalizedLanguage = normalizeNotificationLanguage(language);
  const mappedLanguage = mapLegacyLanguageKey(normalizedLanguage);
  const safeInfo = info && typeof info === "object" ? info : {};
  const candidateKeys = [mappedLanguage, normalizedLanguage, "ro", "en"].filter(
      (lang, index, arr) => Boolean(lang) && arr.indexOf(lang) === index,
  );

  let resolvedLanguageKey = "";
  let resolvedInfo = null;

  for (const lang of candidateKeys) {
    if (safeInfo[lang] && typeof safeInfo[lang] === "object") {
      resolvedLanguageKey = lang;
      resolvedInfo = safeInfo[lang];
      break;
    }
  }

  if (!resolvedInfo) {
    const fallbackEntry = Object.entries(safeInfo).find(([, value]) => value && typeof value === "object");
    if (fallbackEntry) {
      resolvedLanguageKey = fallbackEntry[0];
      resolvedInfo = fallbackEntry[1];
    }
  }

  if (!resolvedInfo) {
    console.warn(`[${logPrefix}] missing notification localization`, {
      requestedLanguage: language || null,
      normalizedLanguage: normalizedLanguage || null,
      availableLanguages: Object.keys(safeInfo),
      ...context,
    });
    return null;
  }

  const fallbackEnglish = safeInfo.en && typeof safeInfo.en === "object" ? safeInfo.en : null;
  const fallbackRomanian = safeInfo.ro && typeof safeInfo.ro === "object" ? safeInfo.ro : null;

  return {
    nume:
      sanitizeNotificationText(resolvedInfo.nume) ||
      sanitizeNotificationText(fallbackRomanian && fallbackRomanian.nume) ||
      sanitizeNotificationText(fallbackEnglish && fallbackEnglish.nume),
    descriere:
      sanitizeNotificationText(resolvedInfo.descriere) ||
      sanitizeNotificationText(fallbackRomanian && fallbackRomanian.descriere) ||
      sanitizeNotificationText(fallbackEnglish && fallbackEnglish.descriere),
    resolvedLanguageKey,
    normalizedLanguage,
  };
};

const BLOG_NOTIFICATION_TIME_ZONE = "Europe/Bucharest";
const BLOG_NOTIFICATION_MIN_SCHEDULED_TS = admin.firestore.Timestamp.fromDate(
    new Date("2026-03-14T21:00:00+02:00"),
);

/**
 * Extracts date parts in a target time zone.
 * @param {Date} date
 * @param {string} timeZone
 * @return {Object}
 */
function getFormatterParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  return formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = Number(part.value);
    }
    return acc;
  }, {});
}

/**
 * Computes timezone offset in milliseconds for a specific date.
 * @param {Date} date
 * @param {string} timeZone
 * @return {number}
 */
function getTimeZoneOffsetMillis(date, timeZone) {
  const parts = getFormatterParts(date, timeZone);
  const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
  );
  return asUtc - date.getTime();
}

/**
 * Converts a local date/time in a named timezone to UTC milliseconds.
 * @param {{year: number, month: number, day: number, hour: number, minute: number}} parts
 * @param {string} timeZone
 * @return {number}
 */
function zonedDateTimeToUtcMillis(parts, timeZone) {
  const utcGuess = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      0,
  );
  const offset = getTimeZoneOffsetMillis(new Date(utcGuess), timeZone);
  let resolved = utcGuess - offset;
  const secondOffset = getTimeZoneOffsetMillis(new Date(resolved), timeZone);
  if (secondOffset !== offset) {
    resolved = utcGuess - secondOffset;
  }
  return resolved;
}

/**
 * Parses a scheduled article date string.
 * @param {string} dateValue
 * @return {{year: number, month: number, day: number}|null}
 */
function parseScheduledDate(dateValue) {
  if (typeof dateValue !== "string") return null;
  const normalized = dateValue.trim();
  if (!normalized) return null;

  let match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  match = normalized.match(/^(\d{2})[-./](\d{2})[-./](\d{4})$/);
  if (match) {
    return {
      year: Number(match[3]),
      month: Number(match[2]),
      day: Number(match[1]),
    };
  }

  return null;
}

/**
 * Parses a scheduled article time string.
 * @param {string} timeValue
 * @return {{hour: number, minute: number}|null}
 */
function parseScheduledTime(timeValue) {
  if (typeof timeValue !== "string") return null;
  const normalized = timeValue.trim();
  if (!normalized) return null;

  const match = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return {hour, minute};
}

/**
 * Resolves an article's scheduled publish time to UTC milliseconds.
 * @param {Object} article
 * @return {number}
 */
function getArticleScheduledMillis(article) {
  const dateParts = parseScheduledDate(article && article.dataProgramata);
  const timeParts = parseScheduledTime(article && article.timpProgramat);
  if (!dateParts || !timeParts) {
    return 0;
  }

  return zonedDateTimeToUtcMillis(
      {
        ...dateParts,
        ...timeParts,
      },
      BLOG_NOTIFICATION_TIME_ZONE,
  );
}

/**
 * Loads scheduled blog articles that were not sent for a platform.
 * @param {string} runId Unique identifier for this run.
 * @param {string} platformSentField Field name that marks sent status.
 * @return {Promise<{pending: Array<Object>, nowTs: FirebaseFirestore.Timestamp}>}
 */
async function getPendingBlogArticles(runId, platformSentField) {
  const nowTs = admin.firestore.Timestamp.now();
  const nowMillis = nowTs.toMillis();
  const snapshot = await admin
      .firestore()
      .collection("BlogArticole")
      .where("firstUploadTimestamp", "<=", nowTs)
      .orderBy("firstUploadTimestamp", "asc")
      .limit(500)
      .get();

  const minScheduledMillis = BLOG_NOTIFICATION_MIN_SCHEDULED_TS.toMillis();
  const pending = snapshot.docs
      .map((doc) => {
        const data = doc.data() || {};
        const scheduledMillis = getArticleScheduledMillis(data);
        return {
          id: doc.id,
          docRef: doc.ref,
          scheduledMillis,
          ...data,
        };
      })
      .filter((item) => {
        if (item[platformSentField]) return false;
        if (!item.scheduledMillis) return false;
        return (
          item.scheduledMillis > minScheduledMillis &&
          item.scheduledMillis <= nowMillis
        );
      })
      .sort((a, b) => {
        const scheduleDiff = a.scheduledMillis - b.scheduledMillis;
        if (scheduleDiff !== 0) return scheduleDiff;
        return String(a.id).localeCompare(String(b.id));
      });

  console.log(
      `[${runId}] pending BlogArticole`,
      pending.map((item) => ({
        id: item.id,
        dataProgramata: item.dataProgramata || null,
        timpProgramat: item.timpProgramat || null,
        scheduledAt:
          item.scheduledMillis ? new Date(item.scheduledMillis).toISOString() : null,
        firstUploadDate: item.firstUploadDate || null,
        firstUploadtime: item.firstUploadtime || null,
        firstUploadTimestamp: item.firstUploadTimestamp || null,
        notificationSentAt: item.notificationSentAt || null,
        [platformSentField]: item[platformSentField] || null,
      })),
  );
  console.log(
      `[${runId}] blog notification min scheduled cutoff`,
      BLOG_NOTIFICATION_MIN_SCHEDULED_TS.toDate().toISOString(),
  );

  return {pending, nowTs};
}

/**
 * Reads a manual request parameter from JSON body or query string.
 * @param {Object} req
 * @param {string} key
 * @return {*}
 */
function readManualRequestParam(req, key) {
  if (req && req.body && typeof req.body === "object" && req.body[key] !== undefined) {
    return req.body[key];
  }

  if (req && req.query && req.query[key] !== undefined) {
    return req.query[key];
  }

  return undefined;
}

/**
 * Parses a boolean-like flag.
 * @param {*} value
 * @param {boolean=} defaultValue
 * @return {boolean}
 */
function parseBooleanFlag(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "n", "off"].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

/**
 * Normalizes an optional string input.
 * @param {*} value
 * @return {string}
 */
function parseOptionalString(value) {
  if (value === undefined || value === null) {
    return "";
  }

  const normalized = String(value).trim();
  return normalized || "";
}

/**
 * Resolves the shared secret used for manual notification endpoints.
 * @return {string|null}
 */
function getNotificationRequestSecret() {
  return (
    (functions.config().backfill && functions.config().backfill.secret) ||
    (functions.config().notifications && functions.config().notifications.secret) ||
    null
  );
}

/**
 * Validates the secret for a manual notification request.
 * @param {Object} req
 * @return {boolean}
 */
function isNotificationRequestAuthorized(req) {
  const configuredSecret = getNotificationRequestSecret();
  if (!configuredSecret) {
    return true;
  }

  const providedSecret =
    req.header("x-backfill-secret") ||
    req.header("x-notifications-secret") ||
    readManualRequestParam(req, "secret") ||
    null;

  return providedSecret === configuredSecret;
}

/**
 * Builds a lightweight preview of push messages.
 * @param {Array<Object>} messages
 * @param {number=} limit
 * @return {Array<Object>}
 */
function previewNotificationMessages(messages, limit = 5) {
  return messages.slice(0, limit).map((msg) => ({
    to: msg.to,
    title: msg.title,
    body: msg.body,
    type: msg.data && msg.data.type ? msg.data.type : null,
  }));
}

/**
 * Filters prepared messages to a single Expo token when requested.
 * @param {Array<Object>} messages
 * @param {string=} targetToken
 * @return {{targetToken: string, originalCount: number, filteredCount: number, messages: Array<Object>}}
 */
function filterMessagesByTargetToken(messages, targetToken) {
  const normalizedTargetToken = normalizeVideoRecipientToken(targetToken);
  if (!normalizedTargetToken) {
    return {
      targetToken: "",
      originalCount: messages.length,
      filteredCount: messages.length,
      messages,
    };
  }

  const filteredMessages = messages.filter((message) => message && message.to === normalizedTargetToken);
  return {
    targetToken: normalizedTargetToken,
    originalCount: messages.length,
    filteredCount: filteredMessages.length,
    messages: filteredMessages,
  };
}

/**
 * Sends prepared push notifications or previews them in dry-run mode.
 * @param {Array<Object>} messages
 * @param {Object=} options
 * @return {Promise<Object>}
 */
async function deliverNotificationMessages(messages, options = {}) {
  const runId = options.runId || `deliverNotificationMessages-${Date.now().toString(36)}`;
  const dryRun = Boolean(options.dryRun);
  const sendMode = options.sendMode || "single";
  const delayMs = Number.isFinite(options.delayMs) ? options.delayMs : 0;

  if (dryRun) {
    console.log(`[${runId}] dryRun - skipping actual send`, {
      preparedMessages: messages.length,
      sendMode,
    });
    return {
      dryRun: true,
      preparedMessages: messages.length,
      sentTickets: 0,
      sendCalls: 0,
      chunks: sendMode === "chunked" ? expo.chunkPushNotifications(messages).length : messages.length,
      preview: previewNotificationMessages(messages),
    };
  }

  let sentTickets = 0;
  let sendCalls = 0;
  let chunks = 0;
  let invalidMarked = 0;

  const tokenDocMap = options.tokenDocMap instanceof Map ? options.tokenDocMap : new Map();
  const collectTerminalTokenFailures = (sentMessages, tickets) => {
    const disabled = [];
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i] || {};
      if (ticket.status !== "error") continue;
      const errorCode =
        (ticket && ticket.details && ticket.details.error) ||
        (ticket && ticket.message) ||
        "unknown";
      if (!TERMINAL_EXPO_TOKEN_ERRORS.has(errorCode)) continue;
      const token = sentMessages[i] && sentMessages[i].to;
      if (!token) continue;
      disabled.push({token, errorCode});
    }
    return disabled;
  };

  if (sendMode === "chunked") {
    const messageChunks = expo.chunkPushNotifications(messages);
    chunks = messageChunks.length;
    for (let i = 0; i < messageChunks.length; i++) {
      const chunk = messageChunks[i];
      try {
        console.log(`[${runId}] sending chunk ${i + 1}/${messageChunks.length} size=${chunk.length}`);
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        sendCalls += 1;
        sentTickets += ticketChunk.length;
        const disabledCandidates = collectTerminalTokenFailures(chunk, ticketChunk);
        if (disabledCandidates.length > 0) {
          invalidMarked += await markUserTokensDisabledByExpoFeedback(
              disabledCandidates,
              {
                runId,
                tokenDocMap,
              },
          );
        }
        console.log(`[${runId}] sent chunk ${i + 1}/${messageChunks.length} tickets=${ticketChunk.length}`);
      } catch (error) {
        console.error(`[${runId}] failed sending chunk ${i + 1}/${messageChunks.length}`, error);
      }

      if (delayMs > 0 && i < messageChunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  } else {
    chunks = messages.length;
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync([message]);
        sendCalls += 1;
        sentTickets += ticketChunk.length;
        const disabledCandidates = collectTerminalTokenFailures([message], ticketChunk);
        if (disabledCandidates.length > 0) {
          invalidMarked += await markUserTokensDisabledByExpoFeedback(
              disabledCandidates,
              {
                runId,
                tokenDocMap,
              },
          );
        }
      } catch (error) {
        console.error(`[${runId}] failed sending single notification ${i + 1}/${messages.length}`, error);
      }

      if (delayMs > 0 && i < messages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  return {
    dryRun: false,
    preparedMessages: messages.length,
    sentTickets,
    sendCalls,
    chunks,
    invalidMarked,
    preview: previewNotificationMessages(messages),
  };
}

/**
 * Selects a notification document from a collection.
 * @param {Object} options
 * @return {Promise<Object>}
 */
async function selectNotificationDocument(options) {
  const collectionName = options.collectionName;
  const selectedId = parseOptionalString(options.selectedId);
  const runId = options.runId || `selectNotificationDocument-${Date.now().toString(36)}`;

  if (selectedId) {
    const docSnap = await admin.firestore().collection(collectionName).doc(selectedId).get();
    if (!docSnap.exists) {
      throw new Error(`Notification document not found: ${collectionName}/${selectedId}`);
    }
    return {
      selectedNotification: docSnap.data() || {},
      selectedNotificationId: docSnap.id,
      totalCandidates: 1,
      selectionMode: "explicit",
    };
  }

  const snapshot = await admin.firestore().collection(collectionName).get();
  const docs = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    data: docSnap.data() || {},
  }));

  if (docs.length === 0) {
    console.log(`[${runId}] no notification docs in ${collectionName}`);
    return {
      selectedNotification: null,
      selectedNotificationId: "",
      totalCandidates: 0,
      selectionMode: "random",
    };
  }

  const randomIndex = Math.floor(Math.random() * docs.length);
  return {
    selectedNotification: docs[randomIndex].data,
    selectedNotificationId: docs[randomIndex].id,
    totalCandidates: docs.length,
    selectionMode: "random",
  };
}

/**
 * Runs a localized notification job for a single collection/platform pair.
 * @param {Object} options
 * @return {Promise<Object>}
 */
async function runRandomLocalizedNotificationJob(options) {
  const source = options.source || "scheduler";
  const dryRun = Boolean(options.dryRun);
  const targetToken = parseOptionalString(options.targetToken);
  const platform = options.platform === "ios" ? "ios" : "android";
  const runName = options.runName || "manualNotificationJob";
  const runId = `${runName}-${source}-${Date.now().toString(36)}`;

  const selection = await selectNotificationDocument({
    collectionName: options.collectionName,
    selectedId: options.notificationId,
    runId,
  });

  if (!selection.selectedNotification) {
    return {
      runId,
      platform,
      collectionName: options.collectionName,
      totalCandidates: selection.totalCandidates,
      preparedMessages: 0,
      dryRun,
      targetToken: targetToken || null,
    };
  }

  const selectedNotification = selection.selectedNotification;
  const info = selectedNotification.info || {};
  if (!info || typeof info !== "object") {
    console.log(`[${runId}] selected notification has no info payload`, {
      collectionName: options.collectionName,
      notificationId: selection.selectedNotificationId,
    });
    return {
      runId,
      platform,
      collectionName: options.collectionName,
      notificationId: selection.selectedNotificationId,
      totalCandidates: selection.totalCandidates,
      preparedMessages: 0,
      dryRun,
      targetToken: targetToken || null,
      reason: "missing-info",
    };
  }

  let users = [];
  let recipientStats = null;
  let tokenDocMap = new Map();

  const recipientDocs = await loadPushRecipientDocs({platform, runId});
  const recipientBuild = buildDedupedPushRecipients(
      recipientDocs.docs,
      {logPrefix: `${runId}-${platform}`},
  );
  users = recipientBuild.recipients;
  tokenDocMap = recipientBuild.tokenDocMap;
  recipientStats = {
    ...recipientBuild.stats,
    rawDocsRead: recipientDocs.stats.rawDocsRead,
    legacyFallbackDocs: recipientDocs.stats.legacyFallbackDocs,
    projectIdsUsed: recipientDocs.stats.projectIdsUsed,
  };

  console.log(`[${runId}] recipient stats`, recipientStats);
  if (users.length === 0) {
    return {
      runId,
      platform,
      collectionName: options.collectionName,
      notificationId: selection.selectedNotificationId,
      totalCandidates: selection.totalCandidates,
      preparedMessages: 0,
      dryRun,
      targetToken: targetToken || null,
      recipientStats,
    };
  }

  const messages = [];
  users.forEach((user) => {
    const {token, language} = user;
    const localizedInfo = resolveNotificationInfo(
        info,
        language,
        runId,
        {notificationType: options.notificationType},
    );
    if (!localizedInfo) {
      return;
    }

    const {nume, descriere} = localizedInfo;
    if (!Expo.isExpoPushToken(token)) {
      console.error(`[${runId}] invalid Expo push token`, {token});
      return;
    }

    messages.push({
      to: token,
      sound: "default",
      title: nume,
      body: descriere,
      data: options.buildDataPayload ?
        options.buildDataPayload({nume, descriere, selectedNotification, user}) :
        {nume, descriere, type: options.notificationType},
    });
  });

  const filtered = filterMessagesByTargetToken(messages, targetToken);
  const delivery = await deliverNotificationMessages(filtered.messages, {
    runId,
    dryRun,
    sendMode: options.sendMode || "single",
    delayMs: options.delayMs || 0,
    tokenDocMap,
  });

  return {
    runId,
    platform,
    collectionName: options.collectionName,
    notificationType: options.notificationType,
    notificationId: selection.selectedNotificationId || null,
    selectionMode: selection.selectionMode,
    totalCandidates: selection.totalCandidates,
    recipientStats,
    targetToken: filtered.targetToken || null,
    originalPreparedMessages: filtered.originalCount,
    filteredPreparedMessages: filtered.filteredCount,
    ...delivery,
  };
}

/**
 * Runs the blog push notification job for a platform.
 * @param {Object} options
 * @return {Promise<Object>}
 */
async function runBlogNotificationJob(options) {
  const platform = options.platform === "ios" ? "ios" : "android";
  const source = options.source || "scheduler";
  const dryRun = Boolean(options.dryRun);
  const targetToken = parseOptionalString(options.targetToken);
  const markAsSent = options.markAsSent === undefined ? !dryRun : Boolean(options.markAsSent);
  const runId = `blogNotifications-${platform}-${source}-${Date.now().toString(36)}`;
  const platformSentField = platform === "ios" ?
    "notificationSentAtIos" :
    "notificationSentAtAndroid";

  const {pending: pendingArticles, nowTs} = await getPendingBlogArticles(
      runId,
      platformSentField,
  );

  if (pendingArticles.length === 0) {
    return {
      runId,
      platform,
      pendingArticles: 0,
      processedArticles: 0,
      markedArticles: 0,
      preparedMessages: 0,
      dryRun,
      targetToken: targetToken || null,
    };
  }

  let recipients = [];
  let recipientStats = null;
  let tokenDocMap = new Map();
  const recipientDocs = await loadPushRecipientDocs({platform, runId});
  const recipientBuild = buildDedupedPushRecipients(
      recipientDocs.docs,
      {logPrefix: `${runId}-${platform}`},
  );
  recipients = recipientBuild.recipients;
  tokenDocMap = recipientBuild.tokenDocMap;
  recipientStats = {
    ...recipientBuild.stats,
    rawDocsRead: recipientDocs.stats.rawDocsRead,
    legacyFallbackDocs: recipientDocs.stats.legacyFallbackDocs,
    projectIdsUsed: recipientDocs.stats.projectIdsUsed,
  };

  let processedArticles = 0;
  let markedArticles = 0;
  let totalPreparedMessages = 0;
  let totalSentTickets = 0;
  const articleSummaries = [];

  for (const article of pendingArticles) {
    const messages = recipients.map((user) => {
      const languageKey = mapLegacyLanguageKey(user.language);
      const localizedInfo =
        (article.info && article.info[languageKey]) ||
        (article.info && article.info.ro) ||
        (article.info && article.info.en);
      if (!localizedInfo) {
        console.warn(`[${runId}] missing blog localization`, {
          articleId: article.id,
          languageKey,
        });
        return null;
      }

      return {
        to: user.token,
        sound: "default",
        title: localizedInfo.nume,
        body: localizedInfo.descriere,
        data: {
          type: "BlogArticole",
          articleId: article.id,
          firstUploadDate: article.firstUploadDate || null,
          firstUploadtime: article.firstUploadtime || null,
        },
      };
    }).filter(Boolean);

    const filtered = filterMessagesByTargetToken(messages, targetToken);
    if (filtered.messages.length === 0) {
      articleSummaries.push({
        articleId: article.id,
        originalPreparedMessages: filtered.originalCount,
        filteredPreparedMessages: 0,
        sentTickets: 0,
        markedAsSent: false,
      });
      continue;
    }

    processedArticles += 1;
    totalPreparedMessages += filtered.filteredCount;
    const delivery = await deliverNotificationMessages(filtered.messages, {
      runId: `${runId}-${article.id}`,
      dryRun,
      sendMode: "chunked",
      delayMs: 0,
      tokenDocMap,
    });
    totalSentTickets += delivery.sentTickets;

    let markedAsSent = false;
    if (markAsSent && !dryRun && !targetToken) {
      await article.docRef.update({
        [platformSentField]: nowTs,
        notificationSentAt: nowTs,
      });
      markedArticles += 1;
      markedAsSent = true;
    }

    articleSummaries.push({
      articleId: article.id,
      originalPreparedMessages: filtered.originalCount,
      filteredPreparedMessages: filtered.filteredCount,
      sentTickets: delivery.sentTickets,
      markedAsSent,
      preview: delivery.preview,
    });
  }

  return {
    runId,
    platform,
    pendingArticles: pendingArticles.length,
    processedArticles,
    markedArticles,
    preparedMessages: totalPreparedMessages,
    sentTickets: totalSentTickets,
    dryRun,
    markAsSent: markAsSent && !targetToken,
    targetToken: targetToken || null,
    recipientStats,
    articles: articleSummaries.slice(0, 20),
  };
}

exports.checkAndSendNotifications = functions.pubsub
    .schedule("every 120 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      await runBlogNotificationJob({
        platform: "android",
        source: "scheduler",
        dryRun: false,
        markAsSent: true,
      });
      return null;
    });
exports.checkAndSendNotificationsIos = functions.pubsub
    .schedule("every 90 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      await runBlogNotificationJob({
        platform: "ios",
        source: "scheduler",
        dryRun: false,
        markAsSent: true,
      });
      return null;
    });

exports.sendRandomNotification = functions.pubsub
    .schedule("every 100 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      await runRandomLocalizedNotificationJob({
        source: "scheduler",
        dryRun: false,
        platform: "android",
        runName: "sendRandomNotification",
        collectionName: "RegularNotifications",
        notificationType: "RegularNotifications",
        sendMode: "chunked",
        delayMs: 1000,
        buildDataPayload: ({nume, descriere}) => ({nume, descriere}),
      });
      return null;
    });

exports.sendRegularNotificationsIos = functions.pubsub
    .schedule("every 90 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      await runRandomLocalizedNotificationJob({
        source: "scheduler",
        dryRun: false,
        platform: "ios",
        runName: "sendRegularNotificationsIos",
        collectionName: "RegularNotifications",
        notificationType: "RegularNotifications",
        sendMode: "single",
        delayMs: 100,
        buildDataPayload: () => ({withSome: "data"}),
      });
      return null;
    });

exports.sendRandomAfirmatii = functions
    .runWith({timeoutSeconds: 300, memory: "512MB"}) // 5 minute timeout
    .pubsub.schedule("every 60 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      await runRandomLocalizedNotificationJob({
        source: "scheduler",
        dryRun: false,
        platform: "android",
        runName: "sendRandomAfirmatii",
        collectionName: "AfirmatiiPozitive",
        notificationType: "AfirmatiiPozitive",
        sendMode: "single",
        delayMs: 100,
        buildDataPayload: ({nume, descriere}) => ({
          nume,
          descriere,
          type: "AfirmatiiPozitive",
        }),
      });
      return null;
    });

exports.sendRegularAfirmatiiIos = functions.pubsub
    .schedule("every 120 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      await runRandomLocalizedNotificationJob({
        source: "scheduler",
        dryRun: false,
        platform: "ios",
        runName: "sendRegularAfirmatiiIos",
        collectionName: "AfirmatiiPozitive",
        notificationType: "AfirmatiiPozitive",
        sendMode: "single",
        delayMs: 100,
        buildDataPayload: ({nume, descriere}) => ({
          nume,
          descriere,
          type: "AfirmatiiPozitive",
        }),
      });
      return null;
    });

exports.sendHoroscopeNotificationsAndroid = functions.pubsub
    .schedule("every 80 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      await runRandomLocalizedNotificationJob({
        source: "scheduler",
        dryRun: false,
        platform: "android",
        runName: "sendHoroscopeNotificationsAndroid",
        collectionName: "NotificariHoroscop",
        notificationType: "NotificariHoroscop",
        sendMode: "single",
        delayMs: 100,
        buildDataPayload: ({nume, descriere}) => ({
          nume,
          descriere,
          type: "NotificariHoroscop",
        }),
      });
      return null;
    });

exports.sendHoroscopeNotificationsIos = functions.pubsub
    .schedule("every 85 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      await runRandomLocalizedNotificationJob({
        source: "scheduler",
        dryRun: false,
        platform: "ios",
        runName: "sendHoroscopeNotificationsIos",
        collectionName: "NotificariHoroscop",
        notificationType: "NotificariHoroscop",
        sendMode: "single",
        delayMs: 100,
        buildDataPayload: ({nume, descriere}) => ({
          nume,
          descriere,
          type: "NotificariHoroscop",
        }),
      });
      return null;
    });

exports.createNotificariHoroscop = functions.https.onRequest(
    async (req, res) => {
      const collectionRef = db.collection("NotificariHoroscop");

      const documents = [
        {
          info: {
            bg: {
              descriere: "Вашият хороскоп е готов. Вижте какво ви очаква днес!",
              nume: "🔮 Вижте хороскопа си",
            },
            cs: {
              descriere: "Horoskop připraven. Zjistěte, co vás čeká!",
              nume: "🔮 Podívejte se na svůj horoskop",
            },
            de: {
              descriere:
              "Ihr Horoskop ist bereit. Sehen Sie, was Sie heute erwartet!",
              nume: "🔮 Sehen Sie sich Ihr Horoskop an",
            },
            el: {
              descriere:
              "Το ωροσκόπιό σας είναι έτοιμο. Δείτε τι σας περιμένει σήμερα!",
              nume: "🔮 Δείτε το ωροσκόπιό σας",
            },
            en: {
              descriere: "Your horoscope is ready. See what awaits you today!",
              nume: "🔮 Check your horoscope",
            },
            es: {
              descriere:
              "Tu horóscopo está listo. ¡Descubre lo que te depara hoy!",
              nume: "🔮 Mira tu horóscopo",
            },
            fr: {
              descriere:
              "Votre horoscope est prêt. Voyez ce qui vous attend aujourd'hui!",
              nume: "🔮 Consultez votre horoscope",
            },
            hi: {
              descriere:
              "आपका राशिफल तैयार है। देखें आज आपका क्या इंतजार कर रहा है!",
              nume: "🔮 अपना राशिफल देखें",
            },
            hr: {
              descriere:
              "Vaš horoskop je spreman. Pogledajte što vas čeka danas!",
              nume: "🔮 Pogledajte svoj horoskop",
            },
            id: {
              descriere:
              "Horoskop Anda siap. Lihat apa yang menanti Anda hari ini!",
              nume: "🔮 Periksa horoskop Anda",
            },
            it: {
              descriere: "Oroscopo pronto. Scopri cosa ti aspetta!",
              nume: "🔮 Guarda il tuo oroscopo",
            },
            pl: {
              descriere:
              "Twój horoskop jest gotowy. Zobacz, co cię czeka dzisiaj!",
              nume: "🔮 Zobacz swój horoskop",
            },
            ro: {
              descriere: "Horoscopul tău este gata. Vezi ce te așteaptă azi!",
              nume: "🔮 Verifică-ți horoscopul",
            },
            ru: {
              descriere: "Ваш гороскоп готов. Узнайте, что вас ждет сегодня!",
              nume: "🔮 Проверьте свой гороскоп",
            },
            tr: {
              descriere: "Burcunuz hazır. Bugün sizi ne bekliyor görün!",
              nume: "🔮 Burcunuzu kontrol edin",
            },
            ar: {
              descriere: "برجك جاهز. اكتشف ما ينتظرك اليوم!",
              nume: "🔮 تحقق من برجك",
            },
            sq: {
              descriere: "Horoskopi yt është gati. Shiko çfarë të pret sot!",
              nume: "🔮 Kontrollo horoskopin tënd",
            },
            sk: {
              descriere: "Horoskop pripravený. Zistite, čo vás čaká!",
              nume: "🔮 Pozrite si svoj horoskop",
            },
          },
        },
        {
          info: {
            bg: {
              descriere: "Открийте тайните на вашия ден с хороскопа!",
              nume: "✨ Вижте какво ви очаква",
            },
            cs: {
              descriere: "Objevte tajemství svého dne s horoskopem!",
              nume: "✨ Zjistěte, co vás dnes čeká",
            },
            de: {
              descriere:
              "Entdecken Sie die Geheimnisse Ihres Tages mit Ihrem Horoskop!",
              nume: "✨ Sehen Sie, was Sie erwartet",
            },
            el: {
              descriere:
              "Ανακαλύψτε τα μυστικά της ημέρας σας με το ωροσκόπιό σας!",
              nume: "✨ Δείτε τι σας περιμένει",
            },
            en: {
              descriere: "Discover your day's secrets with your horoscope!",
              nume: "✨ See what awaits you",
            },
            es: {
              descriere: "¡Descubre los secretos de tu día con tu horóscopo!",
              nume: "✨ Mira lo que te depara",
            },
            fr: {
              descriere:
              "Découvrez les secrets de votre journée avec votre horoscope!",
              nume: "✨ Voyez ce qui vous attend",
            },
            hi: {
              descriere: "अपने दिन के रहस्यों की खोज करें अपने राशिफल के साथ!",
              nume: "✨ देखें आज आपका क्या इंतजार कर रहा है",
            },
            hr: {
              descriere: "Otkrijte tajne svog dana s horoskopom!",
              nume: "✨ Pogledajte što vas čeka danas",
            },
            id: {
              descriere: "Temukan rahasia hari Anda dengan horoskop Anda!",
              nume: "✨ Lihat apa yang menanti Anda",
            },
            it: {
              descriere:
              "Scopri i segreti della tua giornata con il tuo oroscopo!",
              nume: "✨ Scopri cosa ti aspetta",
            },
            pl: {
              descriere: "Odkryj tajemnice swojego dnia z horoskopem!",
              nume: "✨ Zobacz, co cię czeka",
            },
            ro: {
              descriere: "Descoperă secretele zilei tale cu horoscopul tău!",
              nume: "✨ Vezi ce te așteaptă",
            },
            ru: {
              descriere: "Откройте секреты своего дня с вашим гороскопом!",
              nume: "✨ Узнайте, что вас ждет",
            },
            tr: {
              descriere: "Gününüzün sırlarını burcunuzla keşfedin!",
              nume: "✨ Sizi ne bekliyor görün",
            },
            ar: {
              descriere: "اكتشف أسرار يومك مع برجك!",
              nume: "✨ اكتشف ما ينتظرك",
            },
            sq: {
              descriere: "Zbulo sekretet e ditës tënde me horoskopin tënd!",
              nume: "✨ Shiko çfarë të pret",
            },
            sk: {
              descriere: "Objavte tajomstvá svojho dňa s horoskopom!",
              nume: "✨ Zistite, čo vás čaká dnes",
            },
          },
        },
        {
          info: {
            bg: {
              descriere: "Вижте хороскопа си и се подгответе за деня!",
              nume: "🌟 Подгответе се за деня",
            },
            cs: {
              descriere: "Podívejte se na svůj horoskop a připravte se na den!",
              nume: "🌟 Připravte se na den",
            },
            de: {
              descriere: "Sehen Sie Ihr Horoskop und bereiten Sie sich vor!",
              nume: "🌟 Bereiten Sie sich auf den Tag vor",
            },
            el: {
              descriere: "Ετοιμαστείτε για την ημέρα με το ωροσκόπιό σας!",
              nume: "🌟 Ετοιμαστείτε για την ημέρα",
            },
            en: {
              descriere: "Check your horoscope and get ready for the day!",
              nume: "🌟 Get ready for the day",
            },
            es: {
              descriere: "¡Consulta tu horóscopo y prepárate para el día!",
              nume: "🌟 Prepárate para el día",
            },
            fr: {
              descriere:
              "Consultez votre horoscope et préparez-vous pour la journée!",
              nume: "🌟 Préparez-vous pour la journée",
            },
            hi: {
              descriere: "अपना राशिफल देखें और दिन के लिए तैयार हो जाएं!",
              nume: "🌟 दिन के लिए तैयार हो जाएं",
            },
            hr: {
              descriere: "Pogledajte svoj horoskop i pripremite se za dan!",
              nume: "🌟 Pripremite se za dan",
            },
            id: {
              descriere: "Periksa horoskop Anda dan bersiaplah untuk hari ini!",
              nume: "🌟 Bersiaplah untuk hari ini",
            },
            it: {
              descriere: "Guarda il tuo oroscopo e preparati per la giornata!",
              nume: "🌟 Preparati per la giornata",
            },
            pl: {
              descriere: "Sprawdź swój horoskop i przygotuj się na dzień!",
              nume: "🌟 Przygotuj się na dzień",
            },
            ro: {
              descriere:
              "Verifică-ți horoscopul și pregătește-te pentru ziua ta!",
              nume: "🌟 Pregătește-te pentru zi",
            },
            ru: {
              descriere: "Проверьте свой гороскоп и подготовьтесь к дню!",
              nume: "🌟 Подготовьтесь к дню",
            },
            tr: {
              descriere: "Burcunuzu kontrol edin ve gününüz için hazırlanın!",
              nume: "🌟 Gün için hazırlanın",
            },
            ar: {
              descriere: "تحقق من برجك واستعد ليومك!",
              nume: "🌟 استعد ليومك",
            },
            sq: {
              descriere: "Kontrollo horoskopin dhe përgatitu për ditën tënde!",
              nume: "🌟 Përgatitu për ditën",
            },
            sk: {
              descriere: "Pozrite si svoj horoskop a pripravte sa na deň!",
              nume: "🌟 Pripravte sa na deň",
            },
          },
        },
        {
          info: {
            bg: {
              descriere: "Започнете деня с вашия хороскоп!",
              nume: "🌅 Започнете деня си",
            },
            cs: {
              descriere: "Začněte svůj den s horoskopem!",
              nume: "🌅 Začněte svůj den",
            },
            de: {
              descriere: "Beginnen Sie den Tag mit Ihrem Horoskop!",
              nume: "🌅 Beginnen Sie Ihren Tag",
            },
            el: {
              descriere: "Ξεκινήστε τη μέρα σας με το ωροσκόπιό σας!",
              nume: "🌅 Ξεκινήστε τη μέρα σας",
            },
            en: {
              descriere: "Start your day with your horoscope!",
              nume: "🌅 Start your day",
            },
            es: {
              descriere: "¡Empieza tu día con tu horóscopo!",
              nume: "🌅 Empieza tu día",
            },
            fr: {
              descriere: "Commencez votre journée avec votre horoscope!",
              nume: "🌅 Commencez votre journée",
            },
            hi: {
              descriere: "अपने दिन की शुरुआत अपने राशिफल के साथ करें!",
              nume: "🌅 अपने दिन की शुरुआत करें",
            },
            hr: {
              descriere: "Započnite svoj dan s horoskopom!",
              nume: "🌅 Započnite svoj dan",
            },
            id: {
              descriere: "Mulailah hari Anda dengan horoskop Anda!",
              nume: "🌅 Mulailah hari Anda",
            },
            it: {
              descriere: "Inizia la tua giornata con il tuo oroscopo!",
              nume: "🌅 Inizia la tua giornata",
            },
            pl: {
              descriere: "Rozpocznij dzień ze swoim horoskopem!",
              nume: "🌅 Rozpocznij swój dzień",
            },
            ro: {
              descriere: "Începe-ți ziua cu horoscopul tău!",
              nume: "🌅 Începe-ți ziua",
            },
            ru: {
              descriere: "Начните день с вашего гороскопа!",
              nume: "🌅 Начните день",
            },
            tr: {
              descriere: "Gününüzü burcunuzla başlayın!",
              nume: "🌅 Güne başlayın",
            },
            ar: {
              descriere: "ابدأ يومك مع برجك!",
              nume: "🌅 ابدأ يومك",
            },
            sq: {
              descriere: "Niseni ditën me horoskopin tënd!",
              nume: "🌅 Fillo ditën",
            },
            sk: {
              descriere: "Začnite deň so svojím horoskopom!",
              nume: "🌅 Začnite svoj deň",
            },
          },
        },
        {
          info: {
            bg: {
              descriere: "Научете какво ви очаква днес според звездите!",
              nume: "🌠 Какво казват звездите",
            },
            cs: {
              descriere: "Zjistěte, co vás dnes čeká podle hvězd!",
              nume: "🌠 Co říkají hvězdy",
            },
            de: {
              descriere:
              "Erfahren Sie, was die Sterne heute für Sie bereithalten!",
              nume: "🌠 Was sagen die Sterne",
            },
            el: {
              descriere: "Τι σας λένε τα αστέρια σήμερα;",
              nume: "🌠 Τι λένε τα αστέρια",
            },
            en: {
              descriere: "Find out what the stars have in store for you today!",
              nume: "🌠 What the stars say",
            },
            es: {
              descriere: "¡Descubre qué te deparan las estrellas hoy!",
              nume: "🌠 Qué dicen las estrellas",
            },
            fr: {
              descriere:
              "Découvrez ce que les étoiles vous réservent aujourd'hui!",
              nume: "🌠 Que disent les étoiles",
            },
            hi: {
              descriere: "जानें आज आपके लिए सितारे क्या कहते हैं!",
              nume: "🌠 सितारे क्या कहते हैं",
            },
            hr: {
              descriere: "Saznajte što vam zvijezde danas spremaju!",
              nume: "🌠 Što kažu zvijezde",
            },
            id: {
              descriere:
              "Cari tahu apa yang bintang katakan untuk Anda hari ini!",
              nume: "🌠 Apa kata bintang",
            },
            it: {
              descriere: "Scopri cosa ti riservano le stelle oggi!",
              nume: "🌠 Cosa dicono le stelle",
            },
            pl: {
              descriere: "Dowiedz się, co dziś mówią gwiazdy!",
              nume: "🌠 Co mówią gwiazdy",
            },
            ro: {
              descriere: "Află ce îți rezervă astrele astăzi!",
              nume: "🌠 Ce spun astrele",
            },
            ru: {
              descriere: "Узнайте, что вам предсказывают звезды сегодня!",
              nume: "🌠 Что говорят звезды",
            },
            tr: {
              descriere: "Yıldızların bugün senin için ne söylediğini öğren!",
              nume: "🌠 Yıldızlar ne söylüyor",
            },
            ar: {
              descriere: "اكتشف ماذا تخبئ لك النجوم اليوم!",
              nume: "🌠 ماذا تقول النجوم",
            },
            sq: {
              descriere: "Mëso çfarë të rezervojnë yjet sot!",
              nume: "🌠 Çfarë thonë yjet",
            },
            sk: {
              descriere: "Zistite, čo vám dnes hovoria hviezdy!",
              nume: "🌠 Čo hovoria hviezdy",
            },
          },
        },
        {
          info: {
            bg: {
              descriere: "Вашият дневен хороскоп е тук!",
              nume: "📅 Вижте дневния хороскоп",
            },
            cs: {
              descriere: "Váš denní horoskop je tady!",
              nume: "📅 Zkontrolujte denní horoskop",
            },
            de: {
              descriere: "Ihr Tageshoroskop ist hier!",
              nume: "📅 Sehen Sie sich Ihr Tageshoroskop an",
            },
            el: {
              descriere: "Το ημερήσιο ωροσκόπιό σας είναι εδώ!",
              nume: "📅 Δείτε το ημερήσιο ωροσκόπιό σας",
            },
            en: {
              descriere: "Your daily horoscope is here!",
              nume: "📅 Check your daily horoscope",
            },
            es: {
              descriere: "¡Tu horóscopo diario está aquí!",
              nume: "📅 Consulta tu horóscopo diario",
            },
            fr: {
              descriere: "Votre horoscope du jour est ici!",
              nume: "📅 Consultez votre horoscope quotidien",
            },
            hi: {
              descriere: "आपका दैनिक राशिफल यहाँ है!",
              nume: "📅 अपना दैनिक राशिफल देखें",
            },
            hr: {
              descriere: "Vaš dnevni horoskop je ovdje!",
              nume: "📅 Pogledajte svoj dnevni horoskop",
            },
            id: {
              descriere: "Horoskop harian Anda ada di sini!",
              nume: "📅 Periksa horoskop harian Anda",
            },
            it: {
              descriere: "Il tuo oroscopo giornaliero è qui!",
              nume: "📅 Guarda il tuo oroscopo quotidiano",
            },
            pl: {
              descriere: "Twój dzienny horoskop jest tutaj!",
              nume: "📅 Sprawdź swój dzienny horoskop",
            },
            ro: {
              descriere: "Horoscopul tău zilnic este aici!",
              nume: "📅 Verifică-ți horoscopul zilnic",
            },
            ru: {
              descriere: "Ваш ежедневный гороскоп уже здесь!",
              nume: "📅 Проверьте свой ежедневный гороскоп",
            },
            tr: {
              descriere: "Günlük burcun burada!",
              nume: "📅 Günlük burcunu kontrol et",
            },
            ar: {
              descriere: "برجك اليومي هنا!",
              nume: "📅 تحقق من برجك اليومي",
            },
            sq: {
              descriere: "Horoskopi yt ditor është këtu!",
              nume: "📅 Kontrollo horoskopin tënd ditor",
            },
            sk: {
              descriere: "Váš denný horoskop je tu!",
              nume: "📅 Skontrolujte svoj denný horoskop",
            },
          },
        },
        {
          info: {
            bg: {
              descriere: "Погледнете какво ви предсказват звездите!",
              nume: "🔭 Погледнете към бъдещето",
            },
            cs: {
              descriere: "Podívejte se, co vám hvězdy předpovídají!",
              nume: "🔭 Pohleďte do budoucnosti",
            },
            de: {
              descriere: "Schauen Sie, was die Sterne für Sie vorhersagen!",
              nume: "🔭 Blicken Sie in die Zukunft",
            },
            el: {
              descriere: "Δείτε τι σας προβλέπουν τα αστέρια!",
              nume: "🔭 Δείτε το μέλλον",
            },
            en: {
              descriere: "See what the stars predict for you!",
              nume: "🔭 Look into the future",
            },
            es: {
              descriere: "¡Mira qué predicen las estrellas para ti!",
              nume: "🔭 Mira hacia el futuro",
            },
            fr: {
              descriere: "Voyez ce que les étoiles prédisent pour vous!",
              nume: "🔭 Regardez vers l'avenir",
            },
            hi: {
              descriere: "देखें सितारे आपके लिए क्या भविष्यवाणी करते हैं!",
              nume: "🔭 भविष्य की ओर देखें",
            },
            hr: {
              descriere: "Pogledajte što vam zvijezde predviđaju!",
              nume: "🔭 Pogledajte u budućnost",
            },
            id: {
              descriere: "Lihat apa yang bintang ramalkan untuk Anda!",
              nume: "🔭 Lihat ke masa depan",
            },
            it: {
              descriere: "Guarda cosa predicono le stelle per te!",
              nume: "🔭 Guarda nel futuro",
            },
            pl: {
              descriere: "Zobacz, co gwiazdy ci przepowiadają!",
              nume: "🔭 Spójrz w przyszłość",
            },
            ru: {
              descriere: "Узнайте, что предсказывают звезды!",
              nume: "🔭 Взгляд в будущее",
            },
            tr: {
              descriere: "Yıldızların sana neler söylediğini gör!",
              nume: "🔭 Geleceğe Bakış",
            },
            ar: {
              descriere: "اكتشف ما تخبئه لك النجوم!",
              nume: "🔭 نظرة إلى المستقبل",
            },
            sq: {
              descriere: "Shiko çfarë parashikojnë yjet për ty!",
              nume: "🔭 Shikim në të ardhmen",
            },
            sk: {
              descriere: "Pozrite sa, čo vám predpovedajú hviezdy!",
              nume: "🔭 Pozrite sa do budúcnosti",
            },
          },
        },
      ];

      try {
        for (const doc of documents) {
          await collectionRef.add(doc);
        }
        res.status(200).send("NotificariHoroscop created successfully!");
      } catch (error) {
        console.error("Error creating collection: ", error);
        res.status(500).send("Error creating collection");
      }
    },
);

// TRIMITERE NOTIFICARI MANUALE ANDROID

exports.sendManualNotificationsAndroid = functions.runWith({timeoutSeconds: 300, memory: "512MB"}).firestore
    .document("NotificariManuale/{docId}")
    .onCreate(async (snap, context) => {
      console.log("[ANDROID] - Declanșat onCreate pentru NotificariManuale");

      // Preluăm datele documentului nou creat
      const docData = snap.data();
      if (!docData) {
        console.log("[ANDROID] - Nu a fost găsită nicio notificare (docData e null/undefined).");
        return null;
      }

      console.log("[ANDROID] - Document Data:", JSON.stringify(docData));

      console.log("[ANDROID] - Obținem userii Android eligibili din userTokens...");
      const recipientDocs = await loadPushRecipientDocs({
        platform: "android",
        runId: "ANDROID",
      });
      const recipientBuild = buildAndroidNotificationRecipients(
          recipientDocs.docs,
          "ANDROID",
      );
      const users = recipientBuild.recipients;
      const tokenDocMap = recipientBuild.tokenDocMap;
      const recipientStats = recipientBuild.stats;
      recipientStats.rawDocsRead = recipientDocs.stats.rawDocsRead;
      recipientStats.legacyFallbackDocs = recipientDocs.stats.legacyFallbackDocs;
      recipientStats.projectIdsUsed = recipientDocs.stats.projectIdsUsed;

      console.log("[ANDROID] - Recipient stats:", recipientStats);
      console.log(`[ANDROID] - Număr total de useri Android unici găsiți: ${users.length}`);

      if (recipientStats.rawUserTokenDocs === 0) {
        console.log("[ANDROID] - Niciun document userTokens disponibil.");
        return null;
      }

      if (users.length === 0) {
        console.log("[ANDROID] - Niciun token de notificare disponibil.");
        return null;
      }

      const messages = [];

      // Iterăm prin fiecare user
      users.forEach((user, index) => {
        const {token, language, isIos} = user;
        console.log(`[ANDROID] - User #${index + 1} => language: ${language}, isIos: ${isIos}, token: ${token}`);

        const localizedInfo = resolveNotificationInfo(
            docData.info,
            language,
            "ANDROID",
            {notificationType: "NotificariManuale"},
        );
        if (!localizedInfo) {
          console.log(`[ANDROID] - Lipsesc datele pentru limba ${language}.`);
          return;
        }

        const {nume, descriere, resolvedLanguageKey} = localizedInfo;
        console.log(`[ANDROID] - Limba utilizator rezolvată: ${resolvedLanguageKey}`);
        console.log(`[ANDROID] - notă: ${nume}, descriere: ${descriere}`);

        messages.push({
          to: token,
          sound: "default",
          title: nume || "Notificare",
          body: descriere || "",
          data: {type: "NotificariManuale", ...docData},
        });
        console.log(`[ANDROID] - Mesaj pregătit pentru token: ${token}`);
      });

      console.log(`[ANDROID] - Total mesaje pregătite: ${messages.length}`);

      if (messages.length === 0) {
        console.log("[ANDROID] - Niciun mesaj valid pentru trimitere.");
        return null;
      }

      const delivery = await deliverNotificationMessages(messages, {
        runId: `manual-android-${snap.id}`,
        dryRun: false,
        sendMode: "chunked",
        tokenDocMap,
      });
      console.log("[ANDROID] - delivery summary", delivery);
      return null;
    });


// TRIMITERE NOTIFICARI MANUALE IOS

exports.sendManualNotificationsIos = functions.runWith({timeoutSeconds: 300, memory: "512MB"}).firestore
    .document("NotificariManuale/{docId}")
    .onCreate(async (snap, context) => {
      console.log("[iOS] - Declanșat onCreate pentru NotificariManuale");

      // Preluăm datele documentului nou creat
      const docData = snap.data();
      if (!docData) {
        console.log("[iOS] - Nu a fost găsită nicio notificare (docData e null/undefined).");
        return null;
      }

      console.log("[iOS] - Document Data:", JSON.stringify(docData));

      console.log("[iOS] - Obținem userii iOS eligibili din userTokens...");
      const recipientDocs = await loadPushRecipientDocs({
        platform: "ios",
        runId: "iOS",
      });
      const recipientBuild = buildDedupedPushRecipients(
          recipientDocs.docs,
          {logPrefix: "iOS"},
      );
      const users = recipientBuild.recipients;
      const tokenDocMap = recipientBuild.tokenDocMap;
      const recipientStats = {
        ...recipientBuild.stats,
        rawDocsRead: recipientDocs.stats.rawDocsRead,
        legacyFallbackDocs: recipientDocs.stats.legacyFallbackDocs,
        projectIdsUsed: recipientDocs.stats.projectIdsUsed,
      };
      console.log("[iOS] - recipient stats:", recipientStats);
      console.log(`[iOS] - Număr total de useri iOS găsiți: ${users.length}`);

      if (users.length === 0) {
        console.log("[iOS] - Niciun token de notificare iOS disponibil.");
        return null;
      }

      const messages = [];

      users.forEach((user, index) => {
        const {token, language} = user;
        console.log(`[iOS] - User #${index + 1} => language: ${language}, token: ${token}`);

        const localizedInfo = resolveNotificationInfo(
            docData.info,
            language,
            "iOS",
            {notificationType: "NotificariManuale"},
        );
        if (!localizedInfo) {
          console.log(`[iOS] - Lipsesc datele pentru limba ${language}.`);
          return;
        }

        const {nume, descriere, resolvedLanguageKey} = localizedInfo;
        console.log(`[iOS] - Limba utilizator rezolvată: ${resolvedLanguageKey}`);
        console.log(`[iOS] - notă: ${nume}, descriere: ${descriere}`);

        if (Expo.isExpoPushToken(token)) {
          messages.push({
            to: token,
            sound: "default",
            title: nume || "Notificare",
            body: descriere || "",
            data: {type: "NotificariManuale", ...docData},
          });
          console.log(`[iOS] - Mesaj pregătit pentru token: ${token}`);
        } else {
          console.error(`[iOS] - Tokenul ${token} nu este valid pentru Expo.`);
        }
      });

      console.log(`[iOS] - Total mesaje pregătite: ${messages.length}`);

      if (messages.length === 0) {
        console.log("[iOS] - Niciun mesaj valid pentru trimitere.");
        return null;
      }

      const delivery = await deliverNotificationMessages(messages, {
        runId: `manual-ios-${snap.id}`,
        dryRun: false,
        sendMode: "chunked",
        tokenDocMap,
      });
      console.log("[iOS] - delivery summary", delivery);
      return null;
    });


// -----------------PAYMENT LIVE START----------
exports.createPaymentIntent = functions.https.onCall(async (data ) => {
  const runId = `createPaymentIntent-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const {
    amount,
    currency,
    firstName,
    lastName,
    email,
    phone,
    productCode,
    couponCode,
    analysisId,
    analysisType,
    ownerUid,
    termsVersion,
    privacyVersion,
    digitalContentWaiverAccepted,
    legalAcceptedAt,
    immediateExecutionAcceptedAt,
    withdrawalWaiverAcceptedAt,
  } = data || {};

  console.log(`[${runId}] request received`, {
    productCode: String(productCode || ""),
    amount: typeof amount === "number" ? amount : null,
    currency: String(currency || ""),
    couponCodeEntered: String(couponCode || "").trim().toUpperCase(),
    analysisId: String(analysisId || ""),
    analysisType: String(analysisType || ""),
    ownerUid: String(ownerUid || ""),
    legal: {
      termsVersion: String(termsVersion || ""),
      privacyVersion: String(privacyVersion || ""),
      digitalContentWaiverAccepted: Boolean(digitalContentWaiverAccepted),
      legalAcceptedAt: String(legalAcceptedAt || ""),
      immediateExecutionAcceptedAt: String(immediateExecutionAcceptedAt || ""),
      withdrawalWaiverAcceptedAt: String(withdrawalWaiverAcceptedAt || ""),
    },
    customer: {
      emailMasked: maskEmailForLogs(email),
      phoneMasked: maskPhoneForLogs(phone),
      firstName: String(firstName || ""),
      lastName: String(lastName || ""),
    },
  });

  try {
    let customer;
    const product = mapProduct(productCode);
    const coupon = await validateCouponAndComputeDiscount(runId, couponCode);
    const baseAmountBani = typeof amount === "number" ? amount : product.baseAmountBani;
    const couponFixedAmount = Number(coupon && coupon.fixedAmountBani);
    const hasFixedAmountCoupon = Boolean(
        coupon &&
        coupon.couponAllowed &&
        Number.isFinite(couponFixedAmount) &&
        couponFixedAmount > 0,
    );
    const finalAmountBani = hasFixedAmountCoupon ?
      Math.round(couponFixedAmount) :
      coupon.couponAllowed ?
        Math.max(1, Math.round(baseAmountBani * (100 - coupon.discountPercent) / 100)) :
        baseAmountBani;
    // Force EUR for all purchases (requested pricing is in EUR).
    const finalCurrency = "eur";

    if (currency && String(currency).toLowerCase() !== finalCurrency) {
      console.warn(`[${runId}] ignoring client currency override`, {provided: currency, enforced: finalCurrency});
    }

    console.log(`[${runId}] start`, {productCode, baseAmountBani, finalAmountBani, finalCurrency, coupon});

    // Stripe has minimum charge amounts per currency. Avoid opaque "amount too small" errors.
    const minAmountByCurrency = {
      eur: 50, // 0.50 EUR
      usd: 50, // 0.50 USD
      ron: 200, // 2.00 RON (typical Stripe minimum)
    };
    const minAmount = minAmountByCurrency[finalCurrency];
    if (typeof minAmount === "number" && finalAmountBani < minAmount) {
      console.warn(`[${runId}] amount below minimum`, {finalCurrency, finalAmountBani, minAmount});
      throw new functions.https.HttpsError(
          "failed-precondition",
          `Suma minimă pentru ${finalCurrency.toUpperCase()} este ${(minAmount / 100).toFixed(2)}. (Ai ${(finalAmountBani / 100).toFixed(2)})`,
      );
    }

    // 🔥 Verifică dacă clientul există deja
    const existingCustomers = await stripe.customers.list({email});

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]; // Reutilizăm clientul existent
      console.log(`✅ Client existent găsit: ${customer.id}`);

      // 🔥 Asigură că `preferred_locales` este setat corect
      await stripe.customers.update(customer.id, {
        preferred_locales: ["ro"],
      });
    } else {
      // 🔥 Creăm un client nou cu `preferred_locales: ["ro"]`
      customer = await stripe.customers.create({
        name: `${firstName} ${lastName}`,
        email,
        phone,
        preferred_locales: ["ro"], // 🔥 Setăm limba clientului
      });
      console.log(`✅ Client nou creat: ${customer.id}`);
    }

    // 🔥 Creăm PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmountBani, // bani
      currency: finalCurrency,
      customer: customer.id,
      payment_method_types: ["card"],
      capture_method: "manual", // Fondurile autorizate inițial
      metadata: buildStripeMetadata({
        productCode: String(productCode || ""),
        couponCode: coupon.couponAllowed ? coupon.couponCode : "",
        couponPercent: coupon.couponAllowed ? String(coupon.discountPercent) : "0",
        couponSource: coupon.couponAllowed ? String(coupon.couponSource || "") : "",
        analysisId,
        analysisType,
        ownerUid,
        customerEmail: email,
        customerPhone: phone,
        customerEmailLower: normalizeContactEmail(email),
        customerPhoneNormalized: normalizeContactPhone(phone),
        termsVersion,
        privacyVersion,
        digitalContentWaiverAccepted,
        legalAcceptedAt,
        immediateExecutionAcceptedAt,
        withdrawalWaiverAcceptedAt,
      }),
    });

    console.log(`[${runId}] paymentIntent created`, {
      transactionId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customerId: paymentIntent.customer,
      couponApplied: coupon,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      transactionId: paymentIntent.id,
      amountBaniApplied: finalAmountBani,
      coupon,
    };
  } catch (error) {
    const stripeDetails = error && typeof error === "object" ? {
      type: error.type,
      code: error.code,
      param: error.param,
      message: error.message,
      rawType: error.rawType,
      requestId: error.requestId,
    } : null;
    console.error(`[${runId}] Eroare createPaymentIntent:`, {
      stripeDetails,
      error: summarizeErrorForLogs(error),
    });
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError(
        "internal",
        "Nu s-a putut crea PaymentIntent.",
    );
  }
});

exports.createInvoiceAfterPayment = functions.https.onCall(
    async (data ) => {
      const runId = `createInvoiceAfterPayment-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const {transactionId, firstName, lastName, address} = data;
      console.log(`[${runId}] request received`, {
        transactionId: String(transactionId || ""),
        firstName: String(firstName || ""),
        lastName: String(lastName || ""),
        address: address || null,
      });

      try {
      // 1) Verificăm PaymentIntent
        const tId = transactionId;
        const paymentIntent = await stripe.paymentIntents.retrieve(tId);
        console.log(`[${runId}] paymentIntent loaded`, {
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerId: paymentIntent.customer,
        });
        if (paymentIntent.status !== "succeeded") {
          throw new functions.https.HttpsError(
              "failed-precondition",
              "Plata nu a fost finalizată.",
          );
        }

        const customer = paymentIntent.customer;

        // 🔥 Setăm `preferred_locales: ["ro"]` înainte de generarea facturii
        await stripe.customers.update(customer, {
          preferred_locales: ["ro"],
        });

        // 2) Actualizăm adresa clientului
        if (address) {
          await stripe.customers.update(customer, {
            address: {
              line1: address.line1 || "",
              city: address.city || "",
              state: address.state || "",
              postal_code: address.postal_code || "",
              country: address.country || "",
            },
          });
        }

        // 3) Creează InvoiceItem bazat pe PaymentIntent
        const invoiceItem = await stripe.invoiceItems.create({
          customer,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          description: `Factura pentru ${firstName} ${lastName}`,
        });

        console.log(`[${runId}] invoiceItem created`, {
          id: invoiceItem && invoiceItem.id ? invoiceItem.id : "",
          amount: invoiceItem && invoiceItem.amount ? invoiceItem.amount : null,
          currency: invoiceItem && invoiceItem.currency ? invoiceItem.currency : "",
        });

        // 4) Creează Invoice
        const invoice = await stripe.invoices.create({
          customer,
          auto_advance: true, // Finalizează automat
          pending_invoice_items_behavior: "include", // Include
          collection_method: "send_invoice", // Factură trimisă manual
          days_until_due: 0,
        });

        console.log(`[${runId}] invoice created`, {
          id: invoice && invoice.id ? invoice.id : "",
          status: invoice && invoice.status ? invoice.status : "",
        });

        // 5) Marchez factura ca plătită manual
        const paidInvoice = await stripe.invoices.pay(invoice.id, {
          paid_out_of_band: true,
        });

        console.log(`[${runId}] invoice paid`, {
          id: paidInvoice && paidInvoice.id ? paidInvoice.id : "",
          status: paidInvoice && paidInvoice.status ? paidInvoice.status : "",
        });

        // 6) Trimit factura prin email
        const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);
        console.log(`[${runId}] invoice email sent`, {
          id: sentInvoice && sentInvoice.id ? sentInvoice.id : "",
          status: sentInvoice && sentInvoice.status ? sentInvoice.status : "",
        });

        return {
          message: "Factura a fost creată, plătită și trimisă prin email!",
          invoiceId: paidInvoice.id,
        };
      } catch (error) {
        console.error(`[${runId}] Eroare createInvoiceAfterPayment`, summarizeErrorForLogs(error));
        throw new functions.https.HttpsError(
            "internal",
            "Nu am putut crea și trimite factura.",
        );
      }
    },
);

exports.capturePaymentIntent = functions.https.onCall(async (data) => {
  const runId = `capturePaymentIntent-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const {
    transactionId,
    productCode,
    analysisId,
    analysisType,
    ownerUid,
    firstName,
    lastName,
    email,
    phone,
  } = data || {};

  console.log(`[${runId}] request received`, {
    transactionId: String(transactionId || ""),
    productCode: String(productCode || ""),
    analysisId: String(analysisId || ""),
    analysisType: String(analysisType || ""),
    ownerUid: String(ownerUid || ""),
    customer: {
      emailMasked: maskEmailForLogs(email),
      phoneMasked: maskPhoneForLogs(phone),
      firstName: String(firstName || ""),
      lastName: String(lastName || ""),
    },
  });

  try {
    // Retrieve PaymentIntent using stripeTest
    const tId= transactionId;
    const paymentIntent = await stripe.paymentIntents.retrieve(tId);
    console.log(`[${runId}] paymentIntent status before capture`, {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customerId: paymentIntent.customer,
    });

    // Dacă PaymentIntent-ul este deja capturat (status: "succeeded")
    if (paymentIntent.status === "succeeded") {
      await upsertPurchaseEntitlement({
        stripeClient: stripe,
        transactionId: tId,
        paymentIntent,
        customerData: {firstName, lastName, email, phone, analysisId, analysisType, ownerUid, productCode},
        metadata: {productCode, analysisId, analysisType, ownerUid},
        source: "capturePaymentIntent.alreadySucceeded",
        runId,
      });
      console.log(`[${runId}] capture skipped, already succeeded`, {
        transactionId: tId,
      });
      return {captured: true, paymentIntent};
    }

    // Altfel, capturează PaymentIntent-ul
    const capturedPaymentIntent = await stripe.paymentIntents.capture(tId);
    await upsertPurchaseEntitlement({
      stripeClient: stripe,
      transactionId: tId,
      paymentIntent: capturedPaymentIntent,
      customerData: {firstName, lastName, email, phone, analysisId, analysisType, ownerUid, productCode},
      metadata: {productCode, analysisId, analysisType, ownerUid},
      source: "capturePaymentIntent.captured",
      runId,
    });
    console.log(`[${runId}] capture success`, {
      transactionId: tId,
      status: capturedPaymentIntent.status,
      amount: capturedPaymentIntent.amount,
      currency: capturedPaymentIntent.currency,
    });
    return {captured: true, paymentIntent: capturedPaymentIntent};
  } catch (error) {
    console.error(`[${runId}] Eroare la capturarea PaymentIntent:`, summarizeErrorForLogs(error));
    throw new functions.https.HttpsError("internal", "Nu putut captur plata");
  }
});
// -----------------PAYMENT LIVE end----------

// -----------------OBLIO INVOICE (Firebase Functions)----------
exports.createOblioInvoiceAfterPayment = functions
    .runWith({timeoutSeconds: 60, memory: "512MB"})
    .https.onCall(async (data) => {
      const runId = `createOblioInvoice-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const {
        transactionId,
        customer,
        productCode,
        coupon,
        analysisId,
        analysisType,
        ownerUid,
      } = data || {};

      try {
        console.log(`[${runId}] request received`, {
          transactionId: String(transactionId || ""),
          productCode: String(productCode || ""),
          analysisId: String(analysisId || ""),
          analysisType: String(analysisType || ""),
          ownerUid: String(ownerUid || ""),
          coupon: coupon && typeof coupon === "object" ? {
            couponAllowed: Boolean(coupon.couponAllowed),
            couponCode: String(coupon.couponCode || ""),
            discountPercent: Number(coupon.discountPercent) || 0,
          } : null,
          customer: customer && typeof customer === "object" ? {
            firstName: String(customer.firstName || ""),
            lastName: String(customer.lastName || ""),
            emailMasked: maskEmailForLogs(customer.email),
            phoneMasked: maskPhoneForLogs(customer.phone),
            address: customer.address || null,
          } : null,
        });

        if (!transactionId) {
          throw new functions.https.HttpsError("invalid-argument", "Missing transactionId");
        }
        if (!customer || !customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
          throw new functions.https.HttpsError("invalid-argument", "Missing customer fields");
        }
        if (
          !customer.address ||
          !customer.address.line1 ||
          !customer.address.city ||
          !customer.address.state ||
          !customer.address.postal_code ||
          !customer.address.country
        ) {
          throw new functions.https.HttpsError("invalid-argument", "Missing customer address fields");
        }

        const invoiceRef = admin.firestore().collection("oblioInvoices").doc(String(transactionId));
        const existing = await invoiceRef.get();
        if (existing.exists) {
          console.log(`[${runId}] idempotency hit`, {transactionId});
          return existing.data();
        }

        // Stripe verify
        const pi = await stripe.paymentIntents.retrieve(String(transactionId));
        console.log(`[${runId}] stripe paymentIntent`, {status: pi.status, currency: pi.currency, amount: pi.amount});
        if (pi.status !== "succeeded") {
          throw new functions.https.HttpsError("failed-precondition", "Payment not succeeded");
        }
        if ((pi.currency || "").toLowerCase() !== "eur") {
          throw new functions.https.HttpsError("failed-precondition", "Payment currency is not EUR");
        }
        const grossTotal = Number(pi.amount) / 100;

        const cfg = functions.config().oblio || {};
        const oblioCif = cfg.cif;
        const oblioSeries = cfg.series;
        if (!oblioCif || !oblioSeries) {
          throw new Error("Missing Oblio config: oblio.cif / oblio.series");
        }

        const token = await getOblioAccessToken(runId);
        console.log(`[${runId}] oblio token acquired`, {tokenPresent: Boolean(token)});
        const issueDate = new Date().toISOString().slice(0, 10);
        const dueDate = issueDate;
        const product = mapProduct(productCode);
        const normalizedClient = buildNormalizedOblioPfClient(customer);
        const spvAutoSend = evaluatePfSpvAutoSend(normalizedClient);
        const vatRate = await resolveOblioVatRate({
          token,
          cif: oblioCif,
          runId,
        });
        const oblioIdempotencyKey = `stripe_${String(transactionId).replace(/[^a-zA-Z0-9_-]/g, "_")}`;

        const safeCoupon = coupon && coupon.couponAllowed ? {
          couponAllowed: true,
          couponCode: String(coupon.couponCode || ""),
          discountPercent: Number(coupon.discountPercent) || 0,
        } : {couponAllowed: false};

        await upsertPurchaseEntitlement({
          stripeClient: stripe,
          transactionId,
          paymentIntent: pi,
          customerData: {
            ...customer,
            analysisId,
            analysisType,
            ownerUid,
            productCode,
          },
          metadata: {
            productCode,
            analysisId,
            analysisType,
            ownerUid,
            couponCode: safeCoupon.couponAllowed ? safeCoupon.couponCode : "",
            couponPercent: safeCoupon.couponAllowed ? String(safeCoupon.discountPercent) : "0",
          },
          source: "createOblioInvoiceAfterPayment",
          runId,
        });

        const mentions = safeCoupon.couponAllowed ?
          `Cupon: ${safeCoupon.couponCode} (-${safeCoupon.discountPercent}%) | STRIPE ${transactionId}` :
          `STRIPE ${transactionId}`;

        // Mark invoice as collected/paid in Oblio (so it doesn't appear as "neîncasată").
        // Oblio supports adding a `collect` object when issuing the invoice.
        // Reference: Oblio API docs (Incasare factura) https://www.oblio.eu/api
        const collect = {
          type: "Card",
          // Some collection types require a document number; use a deterministic value tied to Stripe.
          documentNumber: String(transactionId).replace(/[^a-zA-Z0-9]/g, "").slice(-16),
          value: grossTotal,
          issueDate,
          mentions: `Plată Stripe ${transactionId}`,
        };

        // Guarantee exact totals: vatIncluded=true and price=grossTotal
        const payload = {
          cif: String(oblioCif),
          seriesName: String(oblioSeries),
          issueDate,
          dueDate,
          deliveryDate: issueDate,
          collectDate: issueDate,
          language: "RO",
          currency: "EUR",
          precision: 2,
          sendEmail: 1,
          spvExtern: spvAutoSend.isEligible ? 1 : 0,
          idempotencyKey: oblioIdempotencyKey,
          mentions,
          internalNote: `Emisa prin Firebase Functions | Stripe ${transactionId}`,
          collect,
          client: {
            ...(spvAutoSend.clientCif ? {cif: spvAutoSend.clientCif} : {}),
            name: normalizedClient.fullName,
            address: normalizedClient.address.line1,
            city: normalizedClient.address.city,
            state: normalizedClient.address.state,
            country: normalizedClient.address.country,
            email: normalizedClient.email,
            phone: normalizedClient.phone,
            vatPayer: 0,
            save: 1,
          },
          products: [
            {
              name: product.name,
              description: product.description,
              quantity: 1,
              price: grossTotal,
              measuringUnit: "buc",
              productType: "Serviciu",
              vatName: vatRate.name,
              vatPercentage: vatRate.percentage,
              vatIncluded: 1,
            },
          ],
        };

        console.log(`[${runId}] oblio invoice payload summary`, {
          cif: payload.cif,
          seriesName: payload.seriesName,
          issueDate,
          dueDate,
          total: grossTotal,
          client: {
            name: payload.client.name,
            cif: payload.client.cif || "",
            city: payload.client.city,
            state: payload.client.state,
            country: payload.client.country,
          },
          productCode: String(productCode || ""),
          mentions,
          spvExtern: payload.spvExtern,
          spvReasons: spvAutoSend.reasons,
          vatName: vatRate.name,
          vatPercentage: vatRate.percentage,
        });
        console.log(`[${runId}] oblio invoice payload transmitted`, buildOblioPayloadLogSummary(payload));

        if (!spvAutoSend.isEligible) {
          console.warn(`[${runId}] invoice emitted without SPV auto-send eligibility`, {
            transactionId: String(transactionId),
            reasons: spvAutoSend.reasons,
            client: {
              name: payload.client.name,
              cif: payload.client.cif || "",
              city: payload.client.city,
              state: payload.client.state,
              country: payload.client.country,
            },
          });
        }

        // Invoice create endpoint per Oblio docs
        const {statusCode, json, raw} = await oblioPostJson("https://www.oblio.eu/api/docs/invoice", payload, token);
        console.log(`[${runId}] oblio invoice response`, {
          statusCode,
          jsonPreview: json ? {
            status: json.status,
            statusMessage: json.statusMessage,
            seriesName: json.data && json.data.seriesName,
            number: json.data && json.data.number,
          } : null,
          rawPreview: String(raw || "").slice(0, 800),
        });

        if (statusCode !== 200 || !json || json.status !== 200) {
          console.error(`[${runId}] oblio invoice failed`, {statusCode, json, raw});
          throw new Error("Oblio invoice create failed");
        }

        const result = {
          transactionId: String(transactionId),
          oblio: json.data || json,
          oblioDocument: {
            seriesName: json && json.data && json.data.seriesName ?
              String(json.data.seriesName) :
              String(oblioSeries),
            number: json && json.data && json.data.number ?
              String(json.data.number) :
              "",
            link: json && json.data && json.data.link ?
              String(json.data.link) :
              "",
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          grossTotal,
          productCode: String(productCode || ""),
          coupon: safeCoupon,
          spv: {
            autoSendRequested: payload.spvExtern === 1,
            eligible: spvAutoSend.isEligible,
            reasons: spvAutoSend.reasons,
          },
          clientSnapshot: {
            name: payload.client.name,
            cif: payload.client.cif || "",
            address: payload.client.address,
            city: payload.client.city,
            state: payload.client.state,
            country: payload.client.country,
            email: payload.client.email,
            phone: payload.client.phone,
          },
        };
        await invoiceRef.set(result);
        console.log(`[${runId}] createOblioInvoiceAfterPayment success`, {
          transactionId: String(transactionId),
          oblioSeries: result.oblioDocument.seriesName,
          oblioNumber: result.oblioDocument.number,
          oblioLink: result.oblioDocument.link,
          grossTotal,
          coupon: safeCoupon,
          spvEligible: spvAutoSend.isEligible,
          spvReasons: spvAutoSend.reasons,
        });
        return result;
      } catch (err) {
        console.error(`[${runId}] createOblioInvoiceAfterPayment error`, summarizeErrorForLogs(err));
        if (err instanceof functions.https.HttpsError) throw err;
        throw new functions.https.HttpsError("internal", "Nu am putut crea factura Oblio.");
      }
    });

// -----------------PAYMENT test START----------
const stripeTest = require("stripe")(functions.config().stripe.test_secret_key);

exports.createPaymentIntentTest = functions.https.onCall(
    async (data ) => {
      const runId = `createPaymentIntentTest-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const {
        amount,
        currency,
        firstName,
        lastName,
        email,
        phone,
        productCode,
        couponCode,
        analysisId,
        analysisType,
        ownerUid,
        termsVersion,
        privacyVersion,
        digitalContentWaiverAccepted,
        legalAcceptedAt,
        immediateExecutionAcceptedAt,
        withdrawalWaiverAcceptedAt,
      } = data || {};

      console.log(`[${runId}] request received`, {
        productCode: String(productCode || ""),
        amount: typeof amount === "number" ? amount : null,
        currency: String(currency || ""),
        couponCodeEntered: String(couponCode || "").trim().toUpperCase(),
        analysisId: String(analysisId || ""),
        analysisType: String(analysisType || ""),
        ownerUid: String(ownerUid || ""),
        legal: {
          termsVersion: String(termsVersion || ""),
          privacyVersion: String(privacyVersion || ""),
          digitalContentWaiverAccepted: Boolean(digitalContentWaiverAccepted),
          legalAcceptedAt: String(legalAcceptedAt || ""),
          immediateExecutionAcceptedAt: String(immediateExecutionAcceptedAt || ""),
          withdrawalWaiverAcceptedAt: String(withdrawalWaiverAcceptedAt || ""),
        },
        customer: {
          emailMasked: maskEmailForLogs(email),
          phoneMasked: maskPhoneForLogs(phone),
          firstName: String(firstName || ""),
          lastName: String(lastName || ""),
        },
      });

      try {
        let customer;
        const product = mapProduct(productCode);
        const coupon = await validateCouponAndComputeDiscount(runId, couponCode);
        const baseAmountBani = typeof amount === "number" ? amount : product.baseAmountBani;
        const couponFixedAmount = Number(coupon && coupon.fixedAmountBani);
        const hasFixedAmountCoupon = Boolean(
            coupon &&
            coupon.couponAllowed &&
            Number.isFinite(couponFixedAmount) &&
            couponFixedAmount > 0,
        );
        const finalAmountBani = hasFixedAmountCoupon ?
          Math.round(couponFixedAmount) :
          coupon.couponAllowed ?
            Math.max(1, Math.round(baseAmountBani * (100 - coupon.discountPercent) / 100)) :
            baseAmountBani;
        const finalCurrency = hasFixedAmountCoupon ? "eur" : (currency || "ron");
        const existingCustomers = await stripeTest.customers.list({email});

        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
          console.log(`✅ Client existent găsit (TEST): ${customer.id}`);

          await stripeTest.customers.update(customer.id, {
            preferred_locales: ["ro"],
          });
        } else {
          customer = await stripeTest.customers.create({
            name: `${firstName} ${lastName}`,
            email,
            phone,
            preferred_locales: ["ro"],
          });
          console.log(`✅ Client nou creat (TEST): ${customer.id}`);
        }

        const paymentIntent = await stripeTest.paymentIntents.create({
          amount: finalAmountBani,
          currency: finalCurrency,
          customer: customer.id,
          payment_method_types: ["card"],
          capture_method: "manual", // Fondurile autorizate inițial
          metadata: buildStripeMetadata({
            productCode: String(productCode || ""),
            couponCode: coupon.couponAllowed ? coupon.couponCode : "",
            couponPercent: coupon.couponAllowed ? String(coupon.discountPercent) : "0",
            couponSource: coupon.couponAllowed ? String(coupon.couponSource || "") : "",
            analysisId,
            analysisType,
            ownerUid,
            customerEmail: email,
            customerPhone: phone,
            customerEmailLower: normalizeContactEmail(email),
            customerPhoneNormalized: normalizeContactPhone(phone),
            termsVersion,
            privacyVersion,
            digitalContentWaiverAccepted,
            legalAcceptedAt,
            immediateExecutionAcceptedAt,
            withdrawalWaiverAcceptedAt,
          }),
        });

        console.log(`[${runId}] paymentIntent created`, {
          transactionId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerId: paymentIntent.customer,
          couponApplied: coupon,
        });

        return {
          clientSecret: paymentIntent.client_secret,
          transactionId: paymentIntent.id,
          amountBaniApplied: finalAmountBani,
          coupon,
        };
      } catch (error) {
        console.error(`[${runId}] Eroare createPaymentIntentTest`, summarizeErrorForLogs(error));
        throw new functions.https.HttpsError(
            "internal",
            "Nu s-a putut crea PaymentIntent (TEST).",
        );
      }
    },
);

exports.capturePaymentIntentTest = functions.https.onCall(async (data) => {
  const runId = `capturePaymentIntentTest-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const {
    transactionId,
    productCode,
    analysisId,
    analysisType,
    ownerUid,
    firstName,
    lastName,
    email,
    phone,
  } = data || {};

  console.log(`[${runId}] request received`, {
    transactionId: String(transactionId || ""),
    productCode: String(productCode || ""),
    analysisId: String(analysisId || ""),
    analysisType: String(analysisType || ""),
    ownerUid: String(ownerUid || ""),
    customer: {
      emailMasked: maskEmailForLogs(email),
      phoneMasked: maskPhoneForLogs(phone),
      firstName: String(firstName || ""),
      lastName: String(lastName || ""),
    },
  });

  try {
    // Retrieve PaymentIntent using stripeTest
    const tId= transactionId;
    const paymentIntent = await stripeTest.paymentIntents.retrieve(tId);
    console.log(`[${runId}] paymentIntent status before capture`, {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customerId: paymentIntent.customer,
    });

    // Dacă PaymentIntent-ul este deja capturat (status: "succeeded")
    if (paymentIntent.status === "succeeded") {
      await upsertPurchaseEntitlement({
        stripeClient: stripeTest,
        transactionId: tId,
        paymentIntent,
        customerData: {firstName, lastName, email, phone, analysisId, analysisType, ownerUid, productCode},
        metadata: {productCode, analysisId, analysisType, ownerUid},
        source: "capturePaymentIntentTest.alreadySucceeded",
        runId,
      });
      console.log(`[${runId}] capture skipped, already succeeded`, {
        transactionId: tId,
      });
      return {captured: true, paymentIntent};
    }

    // Altfel, capturează PaymentIntent-ul
    const capturedPaymentIntent = await stripeTest.paymentIntents.capture(tId);
    await upsertPurchaseEntitlement({
      stripeClient: stripeTest,
      transactionId: tId,
      paymentIntent: capturedPaymentIntent,
      customerData: {firstName, lastName, email, phone, analysisId, analysisType, ownerUid, productCode},
      metadata: {productCode, analysisId, analysisType, ownerUid},
      source: "capturePaymentIntentTest.captured",
      runId,
    });
    console.log(`[${runId}] capture success`, {
      transactionId: tId,
      status: capturedPaymentIntent.status,
      amount: capturedPaymentIntent.amount,
      currency: capturedPaymentIntent.currency,
    });
    return {captured: true, paymentIntent: capturedPaymentIntent};
  } catch (error) {
    console.error(`[${runId}] Eroare la capturarea PaymentIntent:`, summarizeErrorForLogs(error));
    throw new functions.https.HttpsError("internal", "Nu putut captur plata");
  }
});


exports.createInvoiceAfterPaymentTest = functions.https.onCall(
    async (data ) => {
      const runId = `createInvoiceAfterPaymentTest-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const {transactionId, firstName, lastName, address} = data;
      console.log(`[${runId}] request received`, {
        transactionId: String(transactionId || ""),
        firstName: String(firstName || ""),
        lastName: String(lastName || ""),
        address: address || null,
      });

      try {
        const paymentIntent = await stripeTest.paymentIntents.retrieve(
            transactionId,
        );
        console.log(`[${runId}] paymentIntent loaded`, {
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerId: paymentIntent.customer,
        });
        if (paymentIntent.status !== "succeeded") {
          throw new functions.https.HttpsError(
              "failed-precondition",
              "Plata nu a fost finalizată (TEST).",
          );
        }

        const customer = paymentIntent.customer;

        await stripeTest.customers.update(customer, {
          preferred_locales: ["ro"],
        });

        if (address) {
          await stripeTest.customers.update(customer, {
            address: {
              line1: address.line1 || "",
              city: address.city || "",
              state: address.state || "",
              postal_code: address.postal_code || "",
              country: address.country || "",
            },
          });
        }

        const invoiceItem = await stripeTest.invoiceItems.create({
          customer,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          description: `Factura pentru ${firstName} ${lastName} (TEST)`,
        });

        console.log(`[${runId}] invoiceItem created`, {
          id: invoiceItem && invoiceItem.id ? invoiceItem.id : "",
          amount: invoiceItem && invoiceItem.amount ? invoiceItem.amount : null,
          currency: invoiceItem && invoiceItem.currency ? invoiceItem.currency : "",
        });

        const invoice = await stripeTest.invoices.create({
          customer,
          auto_advance: true,
          pending_invoice_items_behavior: "include",
          collection_method: "send_invoice",
          days_until_due: 0,
        });

        console.log(`[${runId}] invoice created`, {
          id: invoice && invoice.id ? invoice.id : "",
          status: invoice && invoice.status ? invoice.status : "",
        });

        const paidInvoice = await stripeTest.invoices.pay(invoice.id, {
          paid_out_of_band: true,
        });

        console.log(`[${runId}] invoice paid`, {
          id: paidInvoice && paidInvoice.id ? paidInvoice.id : "",
          status: paidInvoice && paidInvoice.status ? paidInvoice.status : "",
        });

        const sentInvoice = await stripeTest.invoices.sendInvoice(invoice.id);
        console.log(`[${runId}] invoice email sent`, {
          id: sentInvoice && sentInvoice.id ? sentInvoice.id : "",
          status: sentInvoice && sentInvoice.status ? sentInvoice.status : "",
        });

        return {
          message: "Factura a fost creată, (TEST)!",
          invoiceId: paidInvoice.id,
        };
      } catch (error) {
        console.error(`[${runId}] Eroare createInvoiceAfterPaymentTest`, summarizeErrorForLogs(error));
        throw new functions.https.HttpsError(
            "internal",
            "Nu am putut crea și trimite factura (TEST).",
        );
      }
    },
);

// -----------------PAYMENT test END----------

// -----------------SEND EMAIL PDF----------

const nodemailer = require("nodemailer");
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const SUPPORT_INBOX_EMAIL = "webdynamicx@gmail.com";
const MAX_SUPPORT_FIELD_LENGTH = 240;
const MAX_SUPPORT_MESSAGE_LENGTH = 2500;
const ALLOWED_SUPPORT_PRODUCT_CODES = new Set([
  "natal_astrogram",
  "other_person_astrogram",
  "synastry_personal",
  "synastry_others",
  "daily_horoscope",
  "premium_video_subscription",
  "other",
]);

// Configurare transportator email (exemplu folosind Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SUPPORT_INBOX_EMAIL,
    pass: "ypeb yvmi ygat lahn",
  },
});

/**
 * Trims and normalizes a single-line support field.
 * @param {*} value
 * @param {number} maxLength
 * @return {string}
 */
function trimSupportField(value, maxLength = MAX_SUPPORT_FIELD_LENGTH) {
  const normalized = String(value || "")
      .replace(/\s+/g, " ")
      .trim();

  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3)}...`;
}

/**
 * Trims and normalizes a multiline support field.
 * @param {*} value
 * @param {number} maxLength
 * @return {string}
 */
function trimSupportMultiline(value, maxLength = MAX_SUPPORT_MESSAGE_LENGTH) {
  const normalized = String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3)}...`;
}

/**
 * Validates the reply email entered in the support form.
 * @param {string} email
 * @return {boolean}
 */
function isValidSupportEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

/**
 * Builds a short ticket reference for purchase support emails.
 * @return {string}
 */
function buildPurchaseSupportTicketRef() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SUPPORT-${timePart}-${randomPart}`;
}

/**
 * Builds the plain-text email body for a purchase support request.
 * @param {Object} payload
 * @return {string}
 */
function buildPurchaseSupportEmailBody(payload) {
  return [
    "Buna,",
    "",
    "A fost trimisa o noua cerere de suport pentru achizitii din aplicatie.",
    "",
    `Cod ticket: ${payload.ticketRef}`,
    "",
    "Date client:",
    `- Nume: ${payload.fullName || "-"}`,
    `- Email raspuns: ${payload.replyEmail || "-"}`,
    `- Telefon: ${payload.phone || "-"}`,
    "",
    "Problema descrisa:",
    payload.issueDescription || "-",
    "",
    "Context achizitie:",
    `- Produs: ${payload.productCode || "-"}`,
    `- ID tranzactie Stripe: ${payload.transactionId || "-"}`,
    `- Analysis ID: ${payload.analysisId || "-"}`,
    `- Cod eroare / referinta: ${payload.errorRef || "-"}`,
    "",
    "Context tehnic:",
    `- Ecran: ${payload.screenName || "-"}`,
    `- Sectiune sursa: ${payload.sourceSection || "-"}`,
    `- Limba: ${payload.language || "-"}`,
    `- Platforma: ${payload.platform || "-"}`,
    `- Versiune app: ${payload.appVersion || "-"}`,
    `- Owner UID: ${payload.ownerUid || "-"}`,
    `- Submitted at: ${payload.submittedAt || "-"}`,
    `- Server received at: ${new Date().toISOString()}`,
    "",
    "Consimtamant GDPR:",
    `- Acceptat: ${payload.gdprAccepted ? "da" : "nu"}`,
    `- GDPR accepted at: ${payload.gdprAcceptedAt || "-"}`,
    `- Privacy version: ${payload.privacyVersion || "-"}`,
  ].join("\n");
}

/**
 * Generates a PDF buffer from the provided HTML content using Puppeteer.
 *
 * @param {string} htmlContent - The HTML content to convert into a PDF.
 * @return {Promise<Buffer>} - A promise that resolves with the PDF buffer.
 */
async function generatePdfBuffer(htmlContent) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, {waitUntil: "networkidle0"});
  const pdfBuffer = await page.pdf({format: "A4"});
  await browser.close();
  return pdfBuffer;
}

const sendPurchaseSupportEmailCallable = async (data) => {
  const runId = `sendPurchaseSupportEmail-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const payload = data && typeof data === "object" ? data : {};
  const replyEmail = trimSupportField(payload.replyEmail, 120).toLowerCase();
  const issueDescription = trimSupportMultiline(payload.issueDescription, 2000);
  const gdprAccepted = payload.gdprAccepted === true;
  const fullName = trimSupportField(payload.fullName, 120);
  const phone = trimSupportField(payload.phone, 40);
  const productCodeRaw = trimSupportField(payload.productCode, 40);
  const productCode = ALLOWED_SUPPORT_PRODUCT_CODES.has(productCodeRaw) ?
    productCodeRaw :
    (productCodeRaw ? "other" : "");
  const transactionId = trimSupportField(payload.transactionId, 120);
  const analysisId = trimSupportField(payload.analysisId, 120);
  const errorRef = trimSupportField(payload.errorRef, 120);
  const screenName = trimSupportField(payload.screenName, 80) || "PersonsScreen";
  const sourceSection = trimSupportField(payload.sourceSection, 120) || "digital_astrology_update_card";
  const language = trimSupportField(payload.language, 24) || "ro";
  const platformValue = trimSupportField(payload.platform, 64);
  const appVersion = trimSupportField(payload.appVersion, 32);
  const ownerUid = trimSupportField(payload.ownerUid, 120);
  const submittedAt = trimSupportField(payload.submittedAt, 64);
  const gdprAcceptedAt = trimSupportField(payload.gdprAcceptedAt, 64);
  const privacyVersion = trimSupportField(payload.privacyVersion, 32);

  console.log(`[${runId}] request received`, {
    replyEmailMasked: maskEmailForLogs(replyEmail),
    productCode,
    hasIssueDescription: Boolean(issueDescription),
    gdprAccepted,
    screenName,
  });

  if (!replyEmail || !isValidSupportEmail(replyEmail)) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid reply email is required.",
    );
  }

  if (!issueDescription) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Issue description is required.",
    );
  }

  if (issueDescription.length < 10) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Issue description must have at least 10 characters.",
    );
  }

  if (!gdprAccepted) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "GDPR consent is required.",
    );
  }

  const ticketRef = buildPurchaseSupportTicketRef();

  try {
    const mailOptions = {
      from: SUPPORT_INBOX_EMAIL,
      to: SUPPORT_INBOX_EMAIL,
      replyTo: replyEmail,
      subject: `Cerere suport achizitii: ${ticketRef}`,
      text: buildPurchaseSupportEmailBody({
        ticketRef,
        fullName,
        replyEmail,
        phone,
        issueDescription,
        productCode,
        transactionId,
        analysisId,
        errorRef,
        screenName,
        sourceSection,
        language,
        platform: platformValue,
        appVersion,
        ownerUid,
        submittedAt,
        gdprAccepted,
        gdprAcceptedAt,
        privacyVersion,
      }),
    };

    const sendInfo = await transporter.sendMail(mailOptions);
    console.log(`[${runId}] support email sent`, {
      ticketRef,
      messageId: sendInfo && sendInfo.messageId ? sendInfo.messageId : "",
      accepted: sendInfo && Array.isArray(sendInfo.accepted) ? sendInfo.accepted : [],
      rejected: sendInfo && Array.isArray(sendInfo.rejected) ? sendInfo.rejected : [],
    });

    return {
      success: true,
      ticketRef,
    };
  } catch (error) {
    console.error(`[${runId}] Error sending support email`, summarizeErrorForLogs(error));
    throw new functions.https.HttpsError(
        "internal",
        "Error sending support email.",
    );
  }
};

/**
 * Cloud function to send a PDF email with the astrological analysis.
 *
 * @param {Object} data - The data payload for the function.
 * @param {string} data.email - The recipient's email address.
 * @param {string} data.pdfHtml - The HTML content to be converted into a PDF.
 * @param {string} [data.fullName] - The full name of the recipient.
 * @param {Object} context - The function context.
 * @return {Promise<Object>} - A promise that resolves with the result object.
 * @throws {functions.https.HttpsError} - If the email
 */
const sendPdfEmail = async (data ) => {
  const runId = `sendPdfEmail-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const {email, pdfHtml, fullName} = data;
  console.log(`[${runId}] request received`, {
    emailMasked: maskEmailForLogs(email),
    hasPdfHtml: Boolean(pdfHtml),
    htmlLength: typeof pdfHtml === "string" ? pdfHtml.length : 0,
    fullName: String(fullName || ""),
  });
  if (!email || !pdfHtml) {
    console.warn(`[${runId}] invalid argument`, {
      hasEmail: Boolean(email),
      hasPdfHtml: Boolean(pdfHtml),
    });
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Email or PDF content is missing.",
    );
  }

  try {
    // Generate PDF from HTML
    const pdfBuffer = await generatePdfBuffer(pdfHtml);
    console.log(`[${runId}] pdf generated`, {
      bytes: pdfBuffer && pdfBuffer.length ? pdfBuffer.length : 0,
    });

    // Configure email options with minimal English text
    const mailOptions = {
      from: "webdynamicx@gmail.com",
      to: email,
      subject: "Astrological Analysis PDF",
      text:
        `Hi ${fullName || ""},\n` +
        `Attached is your PDF report.\n` +
        `Technical issues: webdynamicx@gmail.com`,
      attachments: [
        {
          filename: "RaportAnaliza.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Send the email
    const sendInfo = await transporter.sendMail(mailOptions);
    console.log(`[${runId}] email sent`, {
      messageId: sendInfo && sendInfo.messageId ? sendInfo.messageId : "",
      accepted: sendInfo && Array.isArray(sendInfo.accepted) ? sendInfo.accepted : [],
      rejected: sendInfo && Array.isArray(sendInfo.rejected) ? sendInfo.rejected : [],
    });
    return {success: true, message: "Email sent successfully."};
  } catch (error) {
    console.error(`[${runId}] Error sending email`, summarizeErrorForLogs(error));
    throw new functions.https.HttpsError("internal", "Error sending email.");
  }
};

exports.sendPdfEmail = functions
    .runWith({
      memory: "512MB", // Crește limita de memorie la 512MB
      timeoutSeconds: 60, // (Opțional)
    })
    .https.onCall(sendPdfEmail);

exports.sendPurchaseSupportEmail = functions
    .runWith({
      memory: "256MB",
      timeoutSeconds: 60,
    })
    .https.onCall(sendPurchaseSupportEmailCallable);

// Sincronizează în mod sigur token-ul Expo din `Users/{uid}.expoToken` în colecția `userTokens`
// - Evită duplicatele prin căutare după `token`
// - Pentru documente userTokens deja existente: NU suprascrie `language` — limba pentru push este
//   setată de client (upsertUserTokenMetadata / GreetingBar). `Users.actualLanguage` poate fi în urmă
//   față de limba aleasă în app și rescria greșit limba notificărilor.
// - Pentru token nou: setează `language` inițial din User dacă există (până la primul sync din app).
exports.syncExpoTokenToUserTokens = functions.firestore
    .document("Users/{uid}")
    .onWrite(async (change, context) => {
      const runId = `syncExpoTokenToUserTokens-${Date.now().toString(36)}`;
      try {
        // const before = change.before.exists ? change.before.data() : null;
        const after = change.after.exists ? change.after.data() : null;

        if (!after) {
          console.log(`[${runId}] skip - user doc deleted`, {uid: context.params.uid});
          return null;
        }

        const rawToken = after.expoToken;
        if (!rawToken) {
          // Niciun token prezent în document
          console.log(`[${runId}] skip - user has no expoToken`, {uid: context.params.uid});
          return null;
        }

        const tokenString = typeof rawToken === "string" ? rawToken : (rawToken && rawToken.data);
        if (!tokenString) {
          console.log(`[${runId}] skip - expoToken could not be normalized`, {uid: context.params.uid});
          return null;
        }

        const languageCandidate = normalizeNotificationLanguage(
            after.actualLanguage || after.language || "",
        );
        const configuredProjectId = resolveConfiguredPushProjectIds()[0] || "";
        const projectId =
          normalizePushProjectId(after.projectId) ||
          normalizePushProjectId(after.expoProjectId) ||
          configuredProjectId;
        const isIos = typeof after.isIos === "boolean" ? after.isIos : undefined;

        const uTokens = admin.firestore().collection("userTokens");
        const existingSnap = await uTokens.where("token", "==", tokenString).get();

        if (!existingSnap.empty) {
          const updatePromises = [];
          existingSnap.docs.forEach((docSnap) => {
            const current = docSnap.data() || {};
            const nextUpdate = {
              lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
              disabled: false,
              lastErrorCode: admin.firestore.FieldValue.delete(),
            };
            if (projectId && normalizePushProjectId(current.projectId) !== projectId) {
              nextUpdate.projectId = projectId;
            }
            if (typeof isIos === "boolean" && current.isIos !== isIos) {
              nextUpdate.isIos = isIos;
            }
            updatePromises.push(docSnap.ref.set(nextUpdate, {merge: true}));
          });
          if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
          }
          console.log(`[${runId}] existing userTokens for token — skip language overwrite (client-owned)`, {
            uid: context.params.uid,
            tokenDocsMatched: existingSnap.size,
            userDocLanguageHint: languageCandidate || null,
          });
          return null;
        }

        // Creează în siguranță un document nou pentru token-ul lipsă
        const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
        const data = {
          token: tokenString,
          disabled: false,
          lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (languageCandidate) {
          data.language = languageCandidate;
        }
        if (projectId) data.projectId = projectId;
        if (typeof isIos === "boolean") data.isIos = isIos;
        await uTokens.doc(id).set(data);

        console.log(`[${runId}] created missing token doc`, {
          uid: context.params.uid,
          docId: id,
          language: languageCandidate || null,
        });

        return null;
      } catch (err) {
        console.error(`[${runId}] syncExpoTokenToUserTokens error`, err);
        return null;
      }
    });

// Backfill: copiază token-urile din Users/{uid}.expoToken în colecția userTokens, paginat
exports.backfillUserTokens = functions
    .runWith({timeoutSeconds: 540, memory: "512MB"})
    .https.onRequest(async (req, res) => {
      const runId = `backfillUserTokens-${Date.now().toString(36)}`;
      try {
        const configuredSecret = (functions.config().backfill && functions.config().backfill.secret) || null;
        const providedSecret = req.header("x-backfill-secret") || req.query.secret || null;
        if (configuredSecret && providedSecret !== configuredSecret) {
          console.warn(`[${runId}] unauthorized request`);
          res.status(401).json({error: "unauthorized"});
          return;
        }

        const pageSize = Math.min(parseInt(req.query.pageSize) || 500, 1000);
        const cursor = req.query.cursor || null;

        let q = db.collection("Users").orderBy(admin.firestore.FieldPath.documentId()).limit(pageSize);
        if (cursor) {
          const cursorSnap = await db.collection("Users").doc(cursor).get();
          if (cursorSnap.exists) {
            q = q.startAfter(cursorSnap);
          }
        }

        const snap = await q.get();
        let processed = 0;
        let created = 0;
        let skipped = 0;
        let lastDocId = null;

        for (const docSnap of snap.docs) {
          lastDocId = docSnap.id;
          const user = docSnap.data() || {};
          processed++;

          const rawToken = user.expoToken;
          if (!rawToken) {
            skipped++;
            continue;
          }
          const tokenString = typeof rawToken === "string" ? rawToken : (rawToken && rawToken.data);
          if (!tokenString) {
            skipped++;
            continue;
          }

          const languageCandidate = normalizeNotificationLanguage(
              user.actualLanguage || user.language || "",
          );
          const configuredProjectId = resolveConfiguredPushProjectIds()[0] || "";
          const projectId =
            normalizePushProjectId(user.projectId) ||
            normalizePushProjectId(user.expoProjectId) ||
            configuredProjectId;
          const isIos = typeof user.isIos === "boolean" ? user.isIos : undefined;

          const uTokens = db.collection("userTokens");
          const existingSnap = await uTokens.where("token", "==", tokenString).get();
          if (!existingSnap.empty) {
            const updatePromises = [];
            existingSnap.docs.forEach((tokenDoc) => {
              const current = tokenDoc.data() || {};
              const nextUpdate = {
                lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
                disabled: false,
                lastErrorCode: admin.firestore.FieldValue.delete(),
              };
              if (projectId && normalizePushProjectId(current.projectId) !== projectId) {
                nextUpdate.projectId = projectId;
              }
              if (typeof isIos === "boolean" && current.isIos !== isIos) {
                nextUpdate.isIos = isIos;
              }
              updatePromises.push(tokenDoc.ref.set(nextUpdate, {merge: true}));
            });
            if (updatePromises.length > 0) {
              await Promise.all(updatePromises);
            }
            // Nu rescrie language pe tokenuri existente — aceeași regulă ca syncExpoTokenToUserTokens.
            skipped++;
          } else {
            const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
            const data = {
              token: tokenString,
              disabled: false,
              lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            if (languageCandidate) data.language = languageCandidate;
            if (projectId) data.projectId = projectId;
            if (typeof isIos === "boolean") data.isIos = isIos;
            await uTokens.doc(id).set(data);
            created++;
          }
        }

        const nextCursor = snap.size > 0 ? lastDocId : null;
        const updated = 0;
        console.log(`[${runId}] processed=${processed} created=${created} updated=${updated} skipped=${skipped} nextCursor=${nextCursor}`);
        res.json({processed, created, updated, skipped, nextCursor});
      } catch (err) {
        console.error("backfillUserTokens error", err);
        res.status(500).json({error: "internal"});
      }
    });

// Backfill: setează `language: "ro"` pe documentele `userTokens` (paginat). Secret: `backfill.secret`.
// Apel repetat cu `cursor=<nextCursor>` până când `done` este true.
// Ex.: GET .../backfillUserTokensLanguageRo?dryRun=1&pageSize=500
//      GET .../backfillUserTokensLanguageRo?secret=...&cursor=<id>
exports.backfillUserTokensLanguageRo = functions
    .runWith({timeoutSeconds: 540, memory: "512MB"})
    .https.onRequest(async (req, res) => {
      const runId = `backfillUserTokensLanguageRo-${Date.now().toString(36)}`;
      try {
        const configuredSecret =
          (functions.config().backfill && functions.config().backfill.secret) || null;
        const providedSecret =
          req.header("x-backfill-secret") || req.query.secret || null;
        if (configuredSecret && providedSecret !== configuredSecret) {
          console.warn(`[${runId}] unauthorized request`);
          res.status(401).json({error: "unauthorized"});
          return;
        }

        const dryRun =
          req.query.dryRun === "1" ||
          String(req.query.dryRun || "").toLowerCase() === "true";
        const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 500, 1000);
        const cursor = req.query.cursor || null;

        let q = db
            .collection("userTokens")
            .orderBy(admin.firestore.FieldPath.documentId())
            .limit(pageSize);
        if (cursor) {
          const cursorSnap = await db.collection("userTokens").doc(cursor).get();
          if (!cursorSnap.exists) {
            res.status(400).json({error: "invalid_cursor", runId});
            return;
          }
          q = q.startAfter(cursorSnap);
        }

        const snap = await q.get();
        let examined = 0;
        let alreadyRo = 0;
        let wouldUpdate = 0;
        let updated = 0;
        let lastDocId = null;

        const toUpdateRefs = [];

        for (const docSnap of snap.docs) {
          lastDocId = docSnap.id;
          examined++;
          const data = docSnap.data() || {};
          const current = normalizeNotificationLanguage(data.language);
          if (current === "ro") {
            alreadyRo++;
            continue;
          }
          wouldUpdate++;
          if (!dryRun) {
            toUpdateRefs.push(docSnap.ref);
          }
        }

        if (!dryRun && toUpdateRefs.length > 0) {
          const batchLimit = 450;
          for (let i = 0; i < toUpdateRefs.length; i += batchLimit) {
            const batch = db.batch();
            const slice = toUpdateRefs.slice(i, i + batchLimit);
            slice.forEach((ref) => batch.update(ref, {language: "ro"}));
            await batch.commit();
            updated += slice.length;
          }
        }

        const nextCursor =
          snap.size > 0 && lastDocId ? lastDocId : null;
        const done = snap.size < pageSize;

        console.log(
            `[${runId}] examined=${examined} alreadyRo=${alreadyRo} wouldUpdate=${wouldUpdate} dryRun=${dryRun} updated=${dryRun ? 0 : updated} nextCursor=${nextCursor} done=${done}`,
        );

        res.json({
          runId,
          dryRun,
          examined,
          alreadyRo,
          wouldUpdate,
          updated: dryRun ? 0 : updated,
          nextCursor,
          done,
        });
      } catch (err) {
        console.error("backfillUserTokensLanguageRo error", err);
        res.status(500).json({error: "internal"});
      }
    });

// Backfill one-time pentru notificationState pe videosVideoModule.
// Reguli:
//  - sent, dacă notificationSentAt există
//  - pending, dacă isPublished=true și notificationSentAt lipsește
//  - sent pentru restul documentelor (stare explicită, fără impact pe query-ul scheduler)
exports.backfillVideoNotificationState = functions
    .runWith({timeoutSeconds: 540, memory: "512MB"})
    .https.onRequest(async (req, res) => {
      const runId = `backfillVideoNotificationState-${Date.now().toString(36)}`;
      try {
        const configuredSecret =
          (functions.config().backfill && functions.config().backfill.secret) || null;
        const providedSecret =
          req.header("x-backfill-secret") || req.query.secret || null;
        if (configuredSecret && providedSecret !== configuredSecret) {
          console.warn(`[${runId}] unauthorized request`);
          res.status(401).json({error: "unauthorized"});
          return;
        }

        const dryRun =
          req.query.dryRun === "1" ||
          String(req.query.dryRun || "").toLowerCase() === "true";
        const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 300, 500);
        const cursor = req.query.cursor || null;

        let queryRef = db
            .collection("videosVideoModule")
            .orderBy(admin.firestore.FieldPath.documentId())
            .limit(pageSize);
        if (cursor) {
          const cursorSnap = await db.collection("videosVideoModule").doc(cursor).get();
          if (!cursorSnap.exists) {
            res.status(400).json({error: "invalid_cursor", runId});
            return;
          }
          queryRef = queryRef.startAfter(cursorSnap);
        }

        const snap = await queryRef.get();
        let examined = 0;
        let skippedInternal = 0;
        let unchanged = 0;
        let wouldSetPending = 0;
        let wouldSetSent = 0;
        let updated = 0;
        let lastDocId = null;
        const refsToPending = [];
        const refsToSent = [];

        for (const docSnap of snap.docs) {
          lastDocId = docSnap.id;
          if (docSnap.id.startsWith("_")) {
            skippedInternal += 1;
            continue;
          }
          examined += 1;
          const data = docSnap.data() || {};
          const hasNotificationSentAt =
            data.notificationSentAt !== null &&
            data.notificationSentAt !== undefined &&
            data.notificationSentAt !== "";
          const nextState = hasNotificationSentAt ?
            VIDEO_NOTIFICATION_STATE_SENT :
            data.isPublished === true ?
              VIDEO_NOTIFICATION_STATE_PENDING :
              VIDEO_NOTIFICATION_STATE_SENT;
          if (data.notificationState === nextState) {
            unchanged += 1;
            continue;
          }
          if (nextState === VIDEO_NOTIFICATION_STATE_PENDING) {
            wouldSetPending += 1;
            refsToPending.push(docSnap.ref);
            continue;
          }
          wouldSetSent += 1;
          refsToSent.push(docSnap.ref);
        }

        if (!dryRun) {
          const batchLimit = 450;
          const refsToUpdate = [
            ...refsToPending.map((ref) => ({ref, state: VIDEO_NOTIFICATION_STATE_PENDING})),
            ...refsToSent.map((ref) => ({ref, state: VIDEO_NOTIFICATION_STATE_SENT})),
          ];
          for (let i = 0; i < refsToUpdate.length; i += batchLimit) {
            const batch = db.batch();
            const slice = refsToUpdate.slice(i, i + batchLimit);
            for (const item of slice) {
              batch.update(item.ref, {notificationState: item.state});
            }
            await batch.commit();
            updated += slice.length;
          }
        }

        const nextCursor =
          snap.size > 0 && lastDocId ? lastDocId : null;
        const done = snap.size < pageSize;

        console.log(
            `[${runId}] examined=${examined} skippedInternal=${skippedInternal} unchanged=${unchanged} wouldSetPending=${wouldSetPending} wouldSetSent=${wouldSetSent} updated=${dryRun ? 0 : updated} dryRun=${dryRun} nextCursor=${nextCursor} done=${done}`,
        );

        res.json({
          runId,
          dryRun,
          examined,
          skippedInternal,
          unchanged,
          wouldSetPending,
          wouldSetSent,
          updated: dryRun ? 0 : updated,
          nextCursor,
          done,
        });
      } catch (err) {
        console.error("backfillVideoNotificationState error", err);
        res.status(500).json({error: "internal"});
      }
    });

// Backfill simplu pentru marcarea articolelor vechi ca "notificate"
// Marchează BlogArticole cu firstUploadTimestamp <= now:
//  - notificationSentAt
//  - notificationSentAtAndroid
//  - notificationSentAtIos
exports.backfillBlogArticleNotificationMarkers = functions
    .runWith({timeoutSeconds: 540, memory: "512MB"})
    .https.onRequest(async (req, res) => {
      const runId = `backfillBlogMarkers-${Date.now().toString(36)}`;
      try {
        const configuredSecret =
          (functions.config().backfill && functions.config().backfill.secret) ||
          null;
        const providedSecret =
          req.header("x-backfill-secret") ||
          req.query.secret ||
          null;
        if (configuredSecret && providedSecret !== configuredSecret) {
          console.warn(`[${runId}] unauthorized request`);
          res.status(401).json({error: "unauthorized"});
          return;
        }

        const dryRun = String(req.query.dryRun || "false") === "true";
        const pageSize = Math.min(parseInt(req.query.pageSize) || 300, 500);
        const cursor = req.query.cursor || null;
        const now = admin.firestore.Timestamp.now();

        let queryRef = db
            .collection("BlogArticole")
            .where("firstUploadTimestamp", "<=", now)
            .orderBy("firstUploadTimestamp", "asc")
            .limit(pageSize);

        if (cursor) {
          const cursorSnap = await db.collection("BlogArticole").doc(cursor).get();
          if (cursorSnap.exists) {
            queryRef = queryRef.startAfter(cursorSnap);
          }
        }

        const snap = await queryRef.get();
        let processed = 0;
        let marked = 0;
        let alreadyMarked = 0;
        let skipped = 0;
        let lastDocId = null;

        const batch = db.batch();
        for (const docSnap of snap.docs) {
          lastDocId = docSnap.id;
          processed += 1;
          const data = docSnap.data() || {};
          const missingAnyMarker =
            !data.notificationSentAt ||
            !data.notificationSentAtAndroid ||
            !data.notificationSentAtIos;

          if (!missingAnyMarker) {
            alreadyMarked += 1;
            continue;
          }

          if (dryRun) {
            marked += 1;
            continue;
          }

          batch.update(docSnap.ref, {
            notificationSentAt: now,
            notificationSentAtAndroid: now,
            notificationSentAtIos: now,
          });
          marked += 1;
        }

        if (!dryRun && marked > 0) {
          await batch.commit();
        }

        if (processed === 0) {
          skipped += 1;
        }

        const nextCursor = snap.size > 0 ? lastDocId : null;
        console.log(
            `[${runId}] processed=${processed} marked=${marked} alreadyMarked=${alreadyMarked} skipped=${skipped} dryRun=${dryRun} nextCursor=${nextCursor}`,
        );
        res.json({
          processed,
          marked,
          alreadyMarked,
          skipped,
          dryRun,
          pageSize,
          nextCursor,
          now: now.toDate().toISOString(),
        });
      } catch (err) {
        console.error("backfillBlogArticleNotificationMarkers error", err);
        res.status(500).json({error: "internal"});
      }
    });

// Notificare când un video devine vizibil (publishAt)
const normalizeLangCode = (language) => {
  if (typeof language !== "string") {
    return "";
  }
  const cleaned = language.trim().toLowerCase();
  if (!cleaned) {
    return "";
  }
  return cleaned.split(/[-_]/)[0];
};

const safeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const resolveVideoNotificationCopy = (videoData, userLanguage) => {
  const normalizedUserLanguage = normalizeLangCode(userLanguage);
  const languageOrder = [normalizedUserLanguage, "ro", "en"].filter(
      (lang, index, arr) => Boolean(lang) && arr.indexOf(lang) === index,
  );

  const locales = videoData && typeof videoData.locales === "object" ?
    videoData.locales :
    {};

  let localizedFields = null;
  let resolvedLanguage = "base";

  for (const lang of languageOrder) {
    const exactFields = locales[lang];
    if (exactFields && typeof exactFields === "object") {
      localizedFields = exactFields;
      resolvedLanguage = lang;
      break;
    }

    const fallbackKey = Object.keys(locales).find(
        (key) => normalizeLangCode(key) === lang,
    );
    if (fallbackKey) {
      const fallbackFields = locales[fallbackKey];
      if (fallbackFields && typeof fallbackFields === "object") {
        localizedFields = fallbackFields;
        resolvedLanguage = lang;
        break;
      }
    }
  }

  const localizedTitle = safeText(localizedFields && localizedFields.title);
  const localizedBody = safeText(
      localizedFields && localizedFields.description,
  );
  const fallbackTitle = safeText(videoData && videoData.title);
  const fallbackBody = safeText(videoData && videoData.description);

  return {
    title: localizedTitle || fallbackTitle || "Videoclip nou",
    body: localizedBody || fallbackBody || "",
    resolvedLanguage,
  };
};

const normalizeVideoRecipientToken = (token) => {
  if (typeof token !== "string") {
    return "";
  }

  return token.trim();
};

const hasRecipientMetadataValue = (fieldName, value) => {
  if (fieldName === "isIos") {
    return typeof value === "boolean";
  }

  return typeof value === "string" && value.trim().length > 0;
};

const normalizeUserTokenDocEntries = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.docs)) {
    return input.docs.map((docSnap) => ({
      id: docSnap.id,
      data: docSnap.data() || {},
      ref: docSnap.ref,
    }));
  }
  return [];
};

/**
 * Marks token docs as disabled using Expo terminal feedback.
 * @param {Array<{token: string, errorCode: string}>} failures
 * @param {Object=} options
 * @return {Promise<number>}
 */
async function markUserTokensDisabledByExpoFeedback(failures, options = {}) {
  if (!Array.isArray(failures) || failures.length === 0) return 0;
  const runId = options.runId || `markUserTokensDisabled-${Date.now().toString(36)}`;
  const tokenDocMap = options.tokenDocMap instanceof Map ? options.tokenDocMap : new Map();
  const tokenErrors = new Map();

  failures.forEach(({token, errorCode}) => {
    const normalizedToken = normalizeVideoRecipientToken(token);
    if (!normalizedToken) return;
    if (!tokenErrors.has(normalizedToken)) {
      tokenErrors.set(normalizedToken, errorCode || "terminal_error");
    }
  });

  if (tokenErrors.size === 0) return 0;
  const refs = [];
  for (const [token] of tokenErrors.entries()) {
    const mappedRefs = tokenDocMap.get(token);
    if (Array.isArray(mappedRefs) && mappedRefs.length > 0) {
      mappedRefs.forEach((ref) => refs.push({ref, token}));
      continue;
    }
    const snap = await admin.firestore()
        .collection("userTokens")
        .where("token", "==", token)
        .limit(20)
        .get();
    snap.docs.forEach((docSnap) => refs.push({ref: docSnap.ref, token}));
  }

  if (refs.length === 0) return 0;
  let marked = 0;
  let batch = admin.firestore().batch();
  let ops = 0;

  for (const {ref, token} of refs) {
    const lastErrorCode = tokenErrors.get(token) || "terminal_error";
    batch.set(ref, {
      disabled: true,
      disabledAt: admin.firestore.FieldValue.serverTimestamp(),
      lastErrorCode,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});
    marked += 1;
    ops += 1;
    if (ops >= 400) {
      await batch.commit();
      batch = admin.firestore().batch();
      ops = 0;
    }
  }
  if (ops > 0) {
    await batch.commit();
  }
  console.warn(`[${runId}] disabled invalid push tokens`, {marked});
  return marked;
}

/**
 * Loads recipient token docs with project/platform/disabled filters.
 * @param {Object=} options
 * @return {Promise<{docs: Array<Object>, stats: Object}>}
 */
async function loadPushRecipientDocs(options = {}) {
  const runId = options.runId || `loadPushRecipientDocs-${Date.now().toString(36)}`;
  const platform = options.platform || "android";
  const usePlatformFilter = platform === "ios" || platform === "android";
  const isIos = platform === "ios";
  const fallbackLimit = Number.isFinite(options.fallbackLimit) ?
    Math.max(0, options.fallbackLimit) :
    DEFAULT_LEGACY_TOKEN_FALLBACK_LIMIT;
  const projectIds = resolveConfiguredPushProjectIds();
  const userTokensRef = admin.firestore().collection("userTokens");
  const docsById = new Map();
  let rawDocsRead = 0;

  const logIndexHelp = (label, err, meta = {}) => {
    const message =
      err && typeof err.message === "string" && err.message.length > 0 ?
        err.message :
        String(err);
    console.error(`[${runId}] Firestore query failed (${label})`, {
      message,
      // Firestore includes the index-create URL in `message` for FAILED_PRECONDITION.
      // Logging it verbatim makes it easy to click from Cloud Functions logs.
      ...meta,
    });
    if (err && err.stack) {
      console.error(`[${runId}] Firestore query stack (${label})`, {
        stackTop: String(err.stack).split("\n").slice(0, 6).join(" | "),
      });
    }
  };

  const pushSnapshot = (snap) => {
    snap.docs.forEach((docSnap) => {
      rawDocsRead += 1;
      if (!docsById.has(docSnap.id)) {
        docsById.set(docSnap.id, {
          id: docSnap.id,
          data: docSnap.data() || {},
          ref: docSnap.ref,
        });
      }
    });
  };

  if (projectIds.length > 0) {
    for (const projectId of projectIds) {
      let scopedQuery = userTokensRef
          .where("projectId", "==", projectId)
          .where("disabled", "==", false);
      if (usePlatformFilter) {
        scopedQuery = scopedQuery.where("isIos", "==", isIos);
      }
      try {
        const snap = await scopedQuery.get();
        pushSnapshot(snap);
      } catch (err) {
        logIndexHelp("userTokens scoped by projectId", err, {
          platform,
          isIos: usePlatformFilter ? isIos : null,
          projectId,
          projectIdsUsed: projectIds.length,
        });
        throw err;
      }
    }
  } else {
    console.warn(`[${runId}] notifications.project_id not configured; fallback query by platform only.`);
    let scopedQuery = userTokensRef.where("disabled", "==", false);
    if (usePlatformFilter) {
      scopedQuery = scopedQuery.where("isIos", "==", isIos);
    }
    try {
      const snap = await scopedQuery.get();
      pushSnapshot(snap);
    } catch (err) {
      logIndexHelp("userTokens fallback (no projectId configured)", err, {
        platform,
        isIos: usePlatformFilter ? isIos : null,
        projectIdsUsed: projectIds.length,
      });
      throw err;
    }
  }

  let legacyFallbackDocs = 0;
  if (fallbackLimit > 0) {
    let legacyQuery = userTokensRef.where("disabled", "==", false);
    if (usePlatformFilter) {
      legacyQuery = legacyQuery.where("isIos", "==", isIos);
    }
    try {
      const legacySnap = await legacyQuery.limit(fallbackLimit).get();
      legacySnap.docs.forEach((docSnap) => {
        rawDocsRead += 1;
        const data = docSnap.data() || {};
        const hasProject = normalizePushProjectId(data.projectId).length > 0;
        if (hasProject) return;
        if (!docsById.has(docSnap.id)) {
          docsById.set(docSnap.id, {id: docSnap.id, data, ref: docSnap.ref});
          legacyFallbackDocs += 1;
        }
      });
    } catch (err) {
      logIndexHelp("userTokens legacy fallback", err, {
        platform,
        isIos: usePlatformFilter ? isIos : null,
        fallbackLimit,
      });
      throw err;
    }
  }

  return {
    docs: Array.from(docsById.values()),
    stats: {
      rawDocsRead,
      projectIdsUsed: projectIds.length,
      legacyFallbackDocs,
    },
  };
}

/**
 * Builds a deduped recipient list for push notifications.
 * @param {FirebaseFirestore.QuerySnapshot} userTokensSnap
 * @param {Object=} options
 * @param {function(Object): boolean=} options.includeRecipient
 * @param {string=} options.logPrefix
 * @return {{recipients: Array<Object>, stats: Object}}
 */
function buildDedupedPushRecipients(userTokensSnap, options = {}) {
  const includeRecipient = typeof options.includeRecipient === "function" ?
    options.includeRecipient :
    () => true;
  const logPrefix = options.logPrefix || "PushDedupe";
  const rawDocs = normalizeUserTokenDocEntries(userTokensSnap)
      .sort((left, right) => left.id.localeCompare(right.id));

  const recipientsByToken = new Map();
  const tokenDocMap = new Map();
  const conflictTokens = new Set();
  let validTokenDocs = 0;
  let invalidTokenDocs = 0;
  let duplicateTokenDocsCollapsed = 0;
  let metadataConflictsSeen = 0;
  let filteredOutDisabled = 0;

  rawDocs.forEach(({id, data, ref}) => {
    const normalizedToken = normalizeVideoRecipientToken(data.token);
    if (!normalizedToken) {
      invalidTokenDocs += 1;
      return;
    }

    if (!Expo.isExpoPushToken(normalizedToken)) {
      invalidTokenDocs += 1;
      console.error(`[${logPrefix}] Token invalid in userTokens doc ${id}: ${normalizedToken}`);
      return;
    }

    if (!includeRecipient(data)) {
      return;
    }

    if (data && data.disabled === true) {
      filteredOutDisabled += 1;
      return;
    }

    validTokenDocs += 1;
    if (!tokenDocMap.has(normalizedToken)) {
      tokenDocMap.set(normalizedToken, []);
    }
    if (ref) tokenDocMap.get(normalizedToken).push(ref);

    if (!recipientsByToken.has(normalizedToken)) {
      recipientsByToken.set(normalizedToken, {
        token: normalizedToken,
        language: hasRecipientMetadataValue("language", data.language) ?
          normalizeNotificationLanguage(data.language) :
          "",
        isIos: typeof data.isIos === "boolean" ? data.isIos : undefined,
        projectId: hasRecipientMetadataValue("projectId", data.projectId) ?
          data.projectId :
          "",
        sourceDocId: id,
      });
      return;
    }

    duplicateTokenDocsCollapsed += 1;
    const recipient = recipientsByToken.get(normalizedToken);

    ["language", "isIos", "projectId"].forEach((fieldName) => {
      const nextValue = fieldName === "language" ?
        normalizeNotificationLanguage(data[fieldName]) :
        data[fieldName];
      if (!hasRecipientMetadataValue(fieldName, nextValue)) {
        return;
      }

      if (
        hasRecipientMetadataValue(fieldName, recipient[fieldName]) &&
        recipient[fieldName] !== nextValue
      ) {
        metadataConflictsSeen += 1;
        conflictTokens.add(normalizedToken);
        console.warn(
            `[${logPrefix}] recipient metadata conflict token=${normalizedToken} field=${fieldName} keep=${recipient[fieldName]} next=${nextValue} sourceDoc=${id}`,
        );
      }

      recipient[fieldName] = nextValue;
      recipient.sourceDocId = id;
    });
  });

  return {
    recipients: Array.from(recipientsByToken.values()),
    tokenDocMap,
    stats: {
      rawUserTokenDocs: rawDocs.length,
      validTokenDocs,
      uniqueDedupedTokens: recipientsByToken.size,
      duplicateTokenDocsCollapsed,
      invalidTokenDocs,
      filteredOutDisabled,
      metadataConflictsSeen,
      conflictTokens: conflictTokens.size,
    },
  };
}

/**
 * Builds a deduped recipient list for video notifications.
 * @param {FirebaseFirestore.QuerySnapshot} userTokensSnap
 * @return {{recipients: Array<Object>, stats: Object}}
 */
function buildVideoNotificationRecipients(userTokensSnap) {
  return buildDedupedPushRecipients(userTokensSnap, {
    logPrefix: "VideoPublished",
  });
}

/**
 * Builds a deduped Android recipient list for push notifications.
 * @param {FirebaseFirestore.QuerySnapshot} userTokensSnap
 * @param {string=} logPrefix
 * @return {{recipients: Array<Object>, stats: Object}}
 */
function buildAndroidNotificationRecipients(userTokensSnap, logPrefix = "AndroidPush") {
  return buildDedupedPushRecipients(userTokensSnap, {
    includeRecipient: (data) => data && (data.isIos === undefined || data.isIos === false),
    logPrefix,
  });
}

/**
 * Sends notifications for published videos with due publish time and pending state.
 * @param {Object} options Execution options.
 * @param {string=} options.source Trigger source label.
 * @param {boolean=} options.dryRun If true, do not send or mark.
 * @param {string=} options.targetToken Optional Expo token filter for manual tests.
 * @param {boolean=} options.markAsSent Whether to mark matched docs as sent.
 * @param {number=} options.pageSize Optional query page size (50-200).
 * @return {Promise<object>} Execution summary.
 */
async function runVideoPublishedNotifications(options) {
  const source = options && options.source ? options.source : "scheduler";
  const dryRun = Boolean(options && options.dryRun);
  const targetToken = parseOptionalString(options && options.targetToken);
  const markAsSent = options && options.markAsSent !== undefined ?
    Boolean(options.markAsSent) :
    !dryRun;
  const rawPageSize = Number.parseInt(options && options.pageSize, 10);
  const pageSize = Number.isFinite(rawPageSize) ?
    Math.min(Math.max(rawPageSize, 50), 200) :
    100;
  const runId =
    `sendVideoPublishedNotifications-${source}-${Date.now().toString(36)}`;
  const now = admin.firestore.Timestamp.now();
  console.log(`[${runId}] start`, {
    now: now.toDate().toISOString(),
    dryRun,
    targetToken: targetToken || null,
    markAsSent,
    pageSize,
  });

  const buildPendingVideosQuery = (cursorDoc) => {
    let queryRef = admin
        .firestore()
        .collection("videosVideoModule")
        .where("isPublished", "==", true)
        .where("notificationState", "==", VIDEO_NOTIFICATION_STATE_PENDING)
        .where("publishAt", "<=", now)
        .orderBy("publishAt", "asc")
        .limit(pageSize);
    if (cursorDoc) {
      queryRef = queryRef.startAfter(cursorDoc);
    }
    return queryRef;
  };

  let pageCursor = null;
  let currentPage = await buildPendingVideosQuery().get();
  if (currentPage.empty) {
    console.log(`[${runId}] no pending published videos with publishAt <= now`);
    return {runId, candidateVideos: 0, pendingToNotify: 0, dryRun};
  }

  const recipientDocs = await loadPushRecipientDocs({platform: "all", runId});
  const recipientBuild = buildVideoNotificationRecipients(recipientDocs.docs);
  const recipients = recipientBuild.recipients;
  const tokenDocMap = recipientBuild.tokenDocMap;
  const recipientStats = recipientBuild.stats;
  recipientStats.rawDocsRead = recipientDocs.stats.rawDocsRead;
  recipientStats.legacyFallbackDocs = recipientDocs.stats.legacyFallbackDocs;
  recipientStats.projectIdsUsed = recipientDocs.stats.projectIdsUsed;
  console.log(`[${runId}] recipient stats`, recipientStats);

  if (recipientStats.rawUserTokenDocs === 0) {
    console.log(`[${runId}] no userTokens docs`);
    return {
      runId,
      candidateVideos: currentPage.size,
      pendingToNotify: 0,
      rawUserTokenDocs: recipientStats.rawUserTokenDocs,
      validTokenDocs: recipientStats.validTokenDocs,
      uniqueDedupedTokens: recipientStats.uniqueDedupedTokens,
      duplicateTokenDocsCollapsed: recipientStats.duplicateTokenDocsCollapsed,
      invalidTokenDocs: recipientStats.invalidTokenDocs,
      metadataConflictsSeen: recipientStats.metadataConflictsSeen,
      conflictTokens: recipientStats.conflictTokens,
      dryRun,
      targetToken: targetToken || null,
      markAsSent: markAsSent && !targetToken,
    };
  }

  if (recipients.length === 0) {
    console.log(`[${runId}] no valid deduped recipients`);
    return {
      runId,
      candidateVideos: currentPage.size,
      pendingToNotify: 0,
      rawUserTokenDocs: recipientStats.rawUserTokenDocs,
      validTokenDocs: recipientStats.validTokenDocs,
      uniqueDedupedTokens: recipientStats.uniqueDedupedTokens,
      duplicateTokenDocsCollapsed: recipientStats.duplicateTokenDocsCollapsed,
      invalidTokenDocs: recipientStats.invalidTokenDocs,
      metadataConflictsSeen: recipientStats.metadataConflictsSeen,
      conflictTokens: recipientStats.conflictTokens,
      dryRun,
      targetToken: targetToken || null,
      markAsSent: markAsSent && !targetToken,
    };
  }

  let batch = admin.firestore().batch();
  let batchCount = 0;
  let candidateVideos = 0;
  let pendingToNotify = 0;
  let sentChunks = 0;
  let pagesScanned = 0;
  const candidateDetails = [];

  while (!currentPage.empty) {
    pagesScanned += 1;
    candidateVideos += currentPage.size;
    for (const videoDoc of currentPage.docs) {
      const videoData = videoDoc.data() || {};
      if (candidateDetails.length < 50) {
        const publishAtIso =
          videoData.publishAt && typeof videoData.publishAt.toDate === "function" ?
            videoData.publishAt.toDate().toISOString() :
            null;
        const notificationSentAtIso =
          videoData.notificationSentAt &&
          typeof videoData.notificationSentAt.toDate === "function" ?
            videoData.notificationSentAt.toDate().toISOString() :
            videoData.notificationSentAt || null;
        candidateDetails.push({
          videoId: videoDoc.id,
          publishAt: publishAtIso,
          notificationSentAt: notificationSentAtIso,
          notificationState: videoData.notificationState || null,
        });
      }

      pendingToNotify += 1;
      const messages = [];
      const languageDistribution = {};
      const publishAtIso =
        videoData.publishAt && typeof videoData.publishAt.toDate === "function" ?
          videoData.publishAt.toDate().toISOString() :
          null;
      console.log(`[${runId}] processing video`, {
        videoId: videoDoc.id,
        publishAt: publishAtIso,
        hasLocales: Boolean(videoData && videoData.locales),
        page: pagesScanned,
      });
      recipients.forEach((recipient) => {
        const {token, language} = recipient;
        const {title, body, resolvedLanguage} = resolveVideoNotificationCopy(
            videoData,
            language,
        );
        languageDistribution[resolvedLanguage] =
          (languageDistribution[resolvedLanguage] || 0) + 1;
        messages.push({
          to: token,
          sound: "default",
          title,
          body,
          data: {type: "VideoPublished", videoId: videoDoc.id},
        });
      });

      const filtered = filterMessagesByTargetToken(messages, targetToken);

      console.log(
          `[${runId}] video=${videoDoc.id} messages=${messages.length} filteredMessages=${filtered.filteredCount} langDistribution=${JSON.stringify(languageDistribution)}`,
      );

      let successfulTickets = 0;
      let invalidMarkedForVideo = 0;
      if (!dryRun && filtered.messages.length > 0) {
        const chunks = expo.chunkPushNotifications(filtered.messages);
        console.log(`[${runId}] video=${videoDoc.id} chunks=${chunks.length}`);
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          try {
            const tickets = await expo.sendPushNotificationsAsync(chunk);
            sentChunks += 1;
            successfulTickets += tickets.filter((ticket) =>
              ticket && ticket.status === "ok",
            ).length;
            const disabledCandidates = [];
            for (let j = 0; j < tickets.length; j++) {
              const ticket = tickets[j] || {};
              if (ticket.status !== "error") continue;
              const errorCode =
                (ticket && ticket.details && ticket.details.error) ||
                (ticket && ticket.message) ||
                "unknown";
              if (!TERMINAL_EXPO_TOKEN_ERRORS.has(errorCode)) continue;
              const token = chunk[j] && chunk[j].to;
              if (!token) continue;
              disabledCandidates.push({token, errorCode});
            }
            if (disabledCandidates.length > 0) {
              invalidMarkedForVideo += await markUserTokensDisabledByExpoFeedback(
                  disabledCandidates,
                  {runId: `${runId}-${videoDoc.id}`, tokenDocMap},
              );
            }
            console.log(
                `[${runId}] video=${videoDoc.id} chunk ${i + 1}/${chunks.length} sent tickets=${tickets.length} successfulTickets=${successfulTickets}`,
            );
          } catch (error) {
            const errorCode = error && error.code ? String(error.code) : "";
            if (errorCode === "PUSH_TOO_MANY_EXPERIENCE_IDS") {
              console.warn(
                  `[${runId}] video=${videoDoc.id} mixed Expo project ids in chunk ${i + 1}/${chunks.length}; retrying one-by-one`,
              );
              for (const singleMessage of chunk) {
                try {
                  const singleTickets =
                    await expo.sendPushNotificationsAsync([singleMessage]);
                  const singleOkCount = singleTickets.filter((ticket) =>
                    ticket && ticket.status === "ok",
                  ).length;
                  successfulTickets += singleOkCount;
                  const ticket = singleTickets[0] || {};
                  const errorCode =
                    (ticket && ticket.details && ticket.details.error) ||
                    (ticket && ticket.message) ||
                    "unknown";
                  if (ticket.status === "error" && TERMINAL_EXPO_TOKEN_ERRORS.has(errorCode)) {
                    invalidMarkedForVideo += await markUserTokensDisabledByExpoFeedback(
                        [{token: singleMessage.to, errorCode}],
                        {runId: `${runId}-${videoDoc.id}`, tokenDocMap},
                    );
                  }
                } catch (singleError) {
                  console.error(
                      `[${runId}] [VideoPublished] single-token send failed for video=${videoDoc.id}`,
                      singleError,
                  );
                }
              }
              continue;
            }
            console.error(
                `[${runId}] [VideoPublished] Eroare la trimitere chunk ${i + 1}/${chunks.length}:`,
                error,
            );
          }
        }
      }
      if (invalidMarkedForVideo > 0) {
        console.warn(`[${runId}] video=${videoDoc.id} disabled invalid tokens=${invalidMarkedForVideo}`);
      }

      if (!dryRun && filtered.messages.length === 0) {
        console.log(`[${runId}] skip marking video`, {
          videoId: videoDoc.id,
          reason: "no-valid-messages",
        });
        continue;
      }

      if (!dryRun && successfulTickets === 0) {
        console.log(`[${runId}] skip marking video`, {
          videoId: videoDoc.id,
          reason: "no-successful-tickets",
        });
        continue;
      }

      if (!dryRun && markAsSent && !targetToken) {
        batch.update(videoDoc.ref, {
          notificationState: VIDEO_NOTIFICATION_STATE_SENT,
          notificationSentAt: now,
        });
        batchCount += 1;
        console.log(`[${runId}] marked video as notified`, {
          videoId: videoDoc.id,
          notificationState: VIDEO_NOTIFICATION_STATE_SENT,
          notificationSentAt: now.toDate().toISOString(),
        });
      }

      if (batchCount >= 450) {
        await batch.commit();
        batch = admin.firestore().batch();
        batchCount = 0;
      }
    }

    if (currentPage.size < pageSize) {
      break;
    }
    pageCursor = currentPage.docs[currentPage.docs.length - 1];
    currentPage = await buildPendingVideosQuery(pageCursor).get();
  }

  console.log(`[${runId}] candidate videos: ${candidateVideos}`, {
    pagesScanned,
    sample: candidateDetails,
    sampleLimit: 50,
  });

  if (pendingToNotify === 0) {
    console.log(`[${runId}] no videos pending notification`);
    return {
      runId,
      candidateVideos,
      pendingToNotify,
      rawUserTokenDocs: recipientStats.rawUserTokenDocs,
      validTokenDocs: recipientStats.validTokenDocs,
      uniqueDedupedTokens: recipientStats.uniqueDedupedTokens,
      duplicateTokenDocsCollapsed: recipientStats.duplicateTokenDocsCollapsed,
      invalidTokenDocs: recipientStats.invalidTokenDocs,
      metadataConflictsSeen: recipientStats.metadataConflictsSeen,
      conflictTokens: recipientStats.conflictTokens,
      dryRun,
    };
  }

  if (!dryRun && batchCount > 0) {
    await batch.commit();
  }

  console.log(
      `[${runId}] finished pending=${pendingToNotify} pagesScanned=${pagesScanned} rawUserTokenDocs=${recipientStats.rawUserTokenDocs} validTokenDocs=${recipientStats.validTokenDocs} uniqueDedupedTokens=${recipientStats.uniqueDedupedTokens} duplicateTokenDocsCollapsed=${recipientStats.duplicateTokenDocsCollapsed} invalidTokenDocs=${recipientStats.invalidTokenDocs} metadataConflictsSeen=${recipientStats.metadataConflictsSeen} conflictTokens=${recipientStats.conflictTokens} sentChunks=${sentChunks} dryRun=${dryRun}`,
  );
  return {
    runId,
    candidateVideos,
    pendingToNotify,
    rawUserTokenDocs: recipientStats.rawUserTokenDocs,
    validTokenDocs: recipientStats.validTokenDocs,
    uniqueDedupedTokens: recipientStats.uniqueDedupedTokens,
    duplicateTokenDocsCollapsed: recipientStats.duplicateTokenDocsCollapsed,
    invalidTokenDocs: recipientStats.invalidTokenDocs,
    metadataConflictsSeen: recipientStats.metadataConflictsSeen,
    conflictTokens: recipientStats.conflictTokens,
    sentChunks,
    pagesScanned,
    dryRun,
    targetToken: targetToken || null,
    markAsSent: markAsSent && !targetToken,
  };
}

/**
 * Dispatches a named manual notification job.
 * @param {string} job
 * @param {Object=} options
 * @return {Promise<Object>}
 */
async function runManualNotificationJob(job, options = {}) {
  switch (job) {
    case "blog-android":
      return runBlogNotificationJob({
        platform: "android",
        source: options.source || "manual",
        dryRun: options.dryRun,
        targetToken: options.targetToken,
        markAsSent: options.markAsSent,
      });
    case "blog-ios":
      return runBlogNotificationJob({
        platform: "ios",
        source: options.source || "manual",
        dryRun: options.dryRun,
        targetToken: options.targetToken,
        markAsSent: options.markAsSent,
      });
    case "regular-android":
      return runRandomLocalizedNotificationJob({
        source: options.source || "manual",
        dryRun: options.dryRun,
        targetToken: options.targetToken,
        notificationId: options.notificationId,
        platform: "android",
        runName: "sendRandomNotification",
        collectionName: "RegularNotifications",
        notificationType: "RegularNotifications",
        sendMode: "chunked",
        delayMs: 1000,
        buildDataPayload: ({nume, descriere}) => ({nume, descriere}),
      });
    case "regular-ios":
      return runRandomLocalizedNotificationJob({
        source: options.source || "manual",
        dryRun: options.dryRun,
        targetToken: options.targetToken,
        notificationId: options.notificationId,
        platform: "ios",
        runName: "sendRegularNotificationsIos",
        collectionName: "RegularNotifications",
        notificationType: "RegularNotifications",
        sendMode: "single",
        delayMs: 100,
        buildDataPayload: () => ({withSome: "data"}),
      });
    case "afirmatii-android":
      return runRandomLocalizedNotificationJob({
        source: options.source || "manual",
        dryRun: options.dryRun,
        targetToken: options.targetToken,
        notificationId: options.notificationId,
        platform: "android",
        runName: "sendRandomAfirmatii",
        collectionName: "AfirmatiiPozitive",
        notificationType: "AfirmatiiPozitive",
        sendMode: "single",
        delayMs: 100,
        buildDataPayload: ({nume, descriere}) => ({
          nume,
          descriere,
          type: "AfirmatiiPozitive",
        }),
      });
    case "afirmatii-ios":
      return runRandomLocalizedNotificationJob({
        source: options.source || "manual",
        dryRun: options.dryRun,
        targetToken: options.targetToken,
        notificationId: options.notificationId,
        platform: "ios",
        runName: "sendRegularAfirmatiiIos",
        collectionName: "AfirmatiiPozitive",
        notificationType: "AfirmatiiPozitive",
        sendMode: "single",
        delayMs: 100,
        buildDataPayload: ({nume, descriere}) => ({
          nume,
          descriere,
          type: "AfirmatiiPozitive",
        }),
      });
    case "horoscope-android":
      return runRandomLocalizedNotificationJob({
        source: options.source || "manual",
        dryRun: options.dryRun,
        targetToken: options.targetToken,
        notificationId: options.notificationId,
        platform: "android",
        runName: "sendHoroscopeNotificationsAndroid",
        collectionName: "NotificariHoroscop",
        notificationType: "NotificariHoroscop",
        sendMode: "single",
        delayMs: 100,
        buildDataPayload: ({nume, descriere}) => ({
          nume,
          descriere,
          type: "NotificariHoroscop",
        }),
      });
    case "horoscope-ios":
      return runRandomLocalizedNotificationJob({
        source: options.source || "manual",
        dryRun: options.dryRun,
        targetToken: options.targetToken,
        notificationId: options.notificationId,
        platform: "ios",
        runName: "sendHoroscopeNotificationsIos",
        collectionName: "NotificariHoroscop",
        notificationType: "NotificariHoroscop",
        sendMode: "single",
        delayMs: 100,
        buildDataPayload: ({nume, descriere}) => ({
          nume,
          descriere,
          type: "NotificariHoroscop",
        }),
      });
    case "video-published":
      return runVideoPublishedNotifications({
        source: options.source || "manual",
        dryRun: options.dryRun,
        targetToken: options.targetToken,
        markAsSent: options.markAsSent,
        pageSize: options.pageSize,
      });
    default:
      throw new Error(`Unsupported manual notification job: ${job}`);
  }
}

/**
 * Validates safety constraints for manual notification requests.
 * @param {Object} options
 * @return {string}
 */
function validateManualNotificationRequestOptions(options) {
  if (!options.dryRun && !options.targetToken && !options.allowBroadcast) {
    return "Live send requires targetToken or allowBroadcast=true.";
  }

  if (options.targetToken && options.markAsSent) {
    return "markAsSent cannot be used together with targetToken.";
  }

  return "";
}

exports.sendVideoPublishedNotifications = functions.pubsub
    .schedule("every 5 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      await runVideoPublishedNotifications({source: "scheduler"});
      return null;
    });

exports.sendVideoPublishedNotificationsManual = functions
    .runWith({timeoutSeconds: 540, memory: "512MB"})
    .https.onRequest(async (req, res) => {
      try {
        if (!isNotificationRequestAuthorized(req)) {
          res.status(401).json({error: "unauthorized"});
          return;
        }

        const dryRun = parseBooleanFlag(readManualRequestParam(req, "dryRun"), true);
        const targetToken = parseOptionalString(readManualRequestParam(req, "targetToken"));
        const allowBroadcast = parseBooleanFlag(
            readManualRequestParam(req, "allowBroadcast"),
            false,
        );
        const markAsSent = parseBooleanFlag(
            readManualRequestParam(req, "markAsSent"),
            false,
        );
        const pageSizeRaw = Number.parseInt(readManualRequestParam(req, "pageSize"), 10);
        const pageSize = Number.isFinite(pageSizeRaw) ? pageSizeRaw : undefined;
        const validationError = validateManualNotificationRequestOptions({
          dryRun,
          targetToken,
          allowBroadcast,
          markAsSent,
        });
        if (validationError) {
          res.status(400).json({error: validationError});
          return;
        }

        const result = await runVideoPublishedNotifications({
          source: "manual",
          dryRun,
          targetToken,
          markAsSent,
          pageSize,
        });
        res.json(result);
      } catch (error) {
        console.error("sendVideoPublishedNotificationsManual error", error);
        res.status(500).json({error: "internal"});
      }
    });

exports.runNotificationJobManual = functions
    .runWith({timeoutSeconds: 540, memory: "512MB"})
    .https.onRequest(async (req, res) => {
      try {
        if (!isNotificationRequestAuthorized(req)) {
          res.status(401).json({error: "unauthorized"});
          return;
        }

        const job = parseOptionalString(readManualRequestParam(req, "job"));
        if (!job) {
          res.status(400).json({error: "Missing required param: job"});
          return;
        }

        const dryRun = parseBooleanFlag(readManualRequestParam(req, "dryRun"), true);
        const targetToken = parseOptionalString(readManualRequestParam(req, "targetToken"));
        const allowBroadcast = parseBooleanFlag(
            readManualRequestParam(req, "allowBroadcast"),
            false,
        );
        const markAsSent = parseBooleanFlag(
            readManualRequestParam(req, "markAsSent"),
            false,
        );
        const pageSizeRaw = Number.parseInt(readManualRequestParam(req, "pageSize"), 10);
        const pageSize = Number.isFinite(pageSizeRaw) ? pageSizeRaw : undefined;
        const notificationId = parseOptionalString(
            readManualRequestParam(req, "notificationId"),
        );

        const validationError = validateManualNotificationRequestOptions({
          dryRun,
          targetToken,
          allowBroadcast,
          markAsSent,
        });
        if (validationError) {
          res.status(400).json({error: validationError});
          return;
        }

        const result = await runManualNotificationJob(job, {
          source: "manual",
          dryRun,
          targetToken,
          markAsSent,
          pageSize,
          notificationId,
        });

        res.json({
          job,
          dryRun,
          targetToken: targetToken || null,
          allowBroadcast,
          markAsSent: markAsSent && !targetToken,
          pageSize: pageSize || null,
          notificationId: notificationId || null,
          result,
        });
      } catch (error) {
        console.error("runNotificationJobManual error", error);
        res.status(500).json({
          error: "internal",
          message: error && error.message ? error.message : "Unexpected error",
        });
      }
    });
