import Constants from "expo-constants";
import { Platform } from "react-native";

import { NEXT_OBLIO_INVOICE_API_URL, NEXT_OBLIO_INVOICE_SHARED_SECRET } from "./constant";

export type OblioClientAddress = {
  line1: string;
  city: string;
  state: string; // judet
  postal_code: string;
  country: string;
};

export type OblioClientCustomerPF = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: OblioClientAddress;
};

export type OblioInvoiceItem = {
  name: string;
  description?: string;
  quantity: number;
  unitAmount: number; // RON
  measuringUnit?: string;
  vatName?: string;
  vatPercentage?: number;
  vatIncluded?: boolean;
  productType?: string;
};

export type CreateOblioInvoiceRequest = {
  requestId: string;
  transactionId: string;
  uid?: string | null;
  customer: OblioClientCustomerPF;
  // Optional: if omitted, Next.js will derive the invoice line(s) from Stripe + meta.feature/productCode.
  items?: OblioInvoiceItem[];
  // Optional hint to let server choose the right product name/description.
  productCode?: string;
  invoice?: {
    issueDate?: string; // YYYY-MM-DD
    language?: "RO";
    currency?: "RON";
    precision?: number;
    sendEmail?: boolean;
  };
  meta?: Record<string, any>;
};

function getConfig() {
  const extra = Constants.expoConfig?.extra as any;
  const url =
    extra?.billing?.nextInvoiceApiUrl ||
    extra?.nextInvoiceApiUrl ||
    NEXT_OBLIO_INVOICE_API_URL ||
    "";
  const secret =
    extra?.billing?.nextInvoiceApiSecret ||
    extra?.nextInvoiceApiSecret ||
    NEXT_OBLIO_INVOICE_SHARED_SECRET ||
    "";
  return { url, secret };
}

function todayYYYYMMDD() {
  return new Date().toISOString().slice(0, 10);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function createOblioInvoiceViaNext(params: Omit<CreateOblioInvoiceRequest, "requestId">) {
  const requestId = `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const { url: baseUrl, secret } = getConfig();

  console.log(`[OblioInvoice][${requestId}] start`, {
    platform: Platform.OS,
    hasBaseUrl: Boolean(baseUrl),
    hasSecret: Boolean(secret),
    transactionId: params.transactionId,
    productCode: params.productCode,
    feature: params.meta?.feature,
  });

  if (!baseUrl) {
    throw new Error("Missing NEXT invoice API base URL (NEXT_OBLIO_INVOICE_API_URL / expo extra).");
  }
  if (!secret) {
    throw new Error("Missing NEXT invoice API shared secret (NEXT_OBLIO_INVOICE_SHARED_SECRET / expo extra).");
  }
  if (!params.transactionId) {
    throw new Error("Missing transactionId");
  }
  if (!params.customer?.firstName || !params.customer?.lastName) {
    throw new Error("Missing customer firstName/lastName");
  }
  if (!params.customer?.email || !params.customer?.phone) {
    throw new Error("Missing customer email/phone");
  }
  const a = params.customer?.address;
  if (!a?.line1 || !a?.city || !a?.state || !a?.postal_code || !a?.country) {
    throw new Error("Missing customer address fields (line1/city/state/postal_code/country)");
  }
  // items are optional; server can derive them from Stripe + meta.feature/productCode.

  const cleanBase = baseUrl.replace(/\/$/, "");
  // Be tolerant: some configs may already include the full path.
  const endpoint = cleanBase.includes("/api/oblio/invoice")
    ? cleanBase
    : `${cleanBase}/api/oblio/invoice`;

  const payload: CreateOblioInvoiceRequest = {
    requestId,
    transactionId: params.transactionId,
    uid: params.uid || null,
    customer: params.customer,
    items: params.items,
    productCode: params.productCode,
    invoice: {
      issueDate: todayYYYYMMDD(),
      language: "RO",
      currency: "RON",
      precision: 2,
      sendEmail: true,
      ...(params.invoice || {}),
    },
    meta: {
      app: "TarrotByAI",
      platform: Platform.OS,
      ...params.meta,
    },
  };

  // Log a safe summary (no secrets)
  console.log(`[OblioInvoice][${requestId}] payload summary`, {
    transactionId: payload.transactionId,
    productCode: payload.productCode,
    feature: payload.meta?.feature,
    customer: {
      firstName: payload.customer?.firstName,
      lastName: payload.customer?.lastName,
      emailMasked: payload.customer?.email ? payload.customer.email.replace(/(.{2}).+(@.+)/, "$1***$2") : null,
      phoneMasked: payload.customer?.phone ? payload.customer.phone.slice(0, 3) + "***" : null,
      city: payload.customer?.address?.city,
      state: payload.customer?.address?.state,
      postal_code: payload.customer?.address?.postal_code,
      country: payload.customer?.address?.country,
    },
  });

  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(payload),
  };

  let lastErr: any = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const attemptTag = `attempt_${attempt}`;
    try {
      console.log(`[OblioInvoice][${requestId}] ${attemptTag} -> POST ${endpoint}`);
      const res = await fetchWithTimeout(endpoint, init, 20000);
      const text = await res.text();

      console.log(`[OblioInvoice][${requestId}] ${attemptTag} <- status=${res.status}`);

      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (e) {
        console.warn(`[OblioInvoice][${requestId}] ${attemptTag} response not json`, {
          textPreview: text?.slice(0, 200),
        });
      }

      if (!res.ok) {
        console.error(`[OblioInvoice][${requestId}] ${attemptTag} non-2xx`, {
          status: res.status,
          body: json || text,
        });
        // retry only on 5xx
        if (res.status >= 500 && attempt < 2) {
          await sleep(500);
          continue;
        }
        throw new Error(`Next invoice API error (status ${res.status})`);
      }

      console.log(`[OblioInvoice][${requestId}] ${attemptTag} success`, {
        transactionId: payload.transactionId,
        oblio: json?.oblio,
      });
      return json;
    } catch (err: any) {
      lastErr = err;
      console.error(`[OblioInvoice][${requestId}] ${attemptTag} failed`, {
        name: err?.name,
        message: err?.message,
      });
      if (attempt < 2) {
        await sleep(500);
        continue;
      }
    }
  }

  throw lastErr || new Error("Unknown invoice error");
}


