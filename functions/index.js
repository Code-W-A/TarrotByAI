const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Expo} = require("expo-server-sdk");
const stripe = require("stripe")(functions.config().stripe.secret_key);
const https = require("https");

// Creează o nouă instanță a Expo SDK
const expo = new Expo();

admin.initializeApp();

const db = admin.firestore();

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
              resolve({statusCode: res.statusCode, json});
            } catch (e) {
              resolve({statusCode: res.statusCode, json: null, raw: data});
            }
          });
        },
    );
    req.on("error", reject);
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
              resolve({statusCode: res.statusCode, json});
            } catch (e) {
              resolve({statusCode: res.statusCode, json: null, raw: data});
            }
          });
        },
    );
    req.on("error", reject);
    req.write(body);
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

/**
 * Validates coupon from Firestore doc coupons/singleton and returns discount percent.
 * Note: isCuponUsed === true means coupon is allowed.
 * @param {string} runId
 * @param {string} couponCode
 * @return {Promise<{couponAllowed: boolean, couponCode: string, discountPercent: number}>}
 */
async function validateCouponAndComputeDiscount(runId, couponCode) {
  const entered = String(couponCode || "").trim().toUpperCase();
  if (!entered) return {couponAllowed: false, couponCode: "", discountPercent: 0};

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

exports.checkAndSendNotifications = functions.pubsub
    .schedule("every 120 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      const runId = `checkAndSendNotifications-${Date.now().toString(36)}`;
      console.log(`[${runId}] start`);
      const now = new Date();
      const offset = 2;
      now.setHours(now.getHours() + offset);

      const parts = now.toISOString().split("T")[0].split("-");
      const dateString = `${parts[2]}-${parts[1]}-${parts[0]}`;
      let article = {};

      const hours = now.getHours().toString().padStart(2, "0");
      // Rotunjește minutele în jos la cel mai apropiat multiplu de 5
      const minutes = Math.floor(now.getMinutes() / 5) * 5;
      const timeString = `${hours}:${minutes.toString().padStart(2, "0")}`;

      console.log("timeString.....", timeString);
      console.log("dateString.....", dateString);
      const b = "BlogArticole";
      const articlesSnapshot = await admin
          .firestore()
          .collection(b)
          .where("firstUploadDate", "==", dateString)
          .where("firstUploadtime", "==", timeString)
          .get();

      if (articlesSnapshot.empty) {
        console.log("Niciun articol programat pentru acum.");
        return;
      }

      articlesSnapshot.forEach((doc) => (article = doc.data()));

      console.log("articol primit...", article);

      const tokens = [];
      const u = "userTokens";
      const userTokensSnap = await admin.firestore().collection(u).get();
      userTokensSnap.forEach((doc) => tokens.push(doc.data()));
      console.log(`[${runId}] fetched tokens: ${tokens.length}`);

      // Impărțirea tokenurilor în batch-uri
      const BATCH_SIZE = 100;
      for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        const batch = tokens.slice(i, i + BATCH_SIZE);

        const messages = batch.map((user) => {
          const {token, language, isIos} = user;
          // Determină limbajul în funcție de condițiile specificate
          if (isIos === undefined || isIos === false) {
            let languageKey;
            if (language === "hi") {
              languageKey = "hu";
            } else if (language === "id") {
              languageKey = "ru";
            } else if (language === "ru") {
              languageKey = "rusa";
            } else {
              languageKey = language;
            }
            console.log("language key from userusers...", languageKey);
            console.log("art info with lang...", article.info[languageKey]);
            return {
              to: token,
              sound: "default",
              title: article.info[languageKey].nume,
              body: article.info[languageKey].descriere,
            };
          } else {
            console.log("isIos present..don't add to messages for android..");
          }
        }).filter(Boolean);
        console.log(`[${runId}] batch messages: ${messages.length}`);
        // Trimite un batch de notificări
        try {
          const chunks = expo.chunkPushNotifications(messages);
          const tickets = [];
          console.log(`[${runId}] chunks to send: ${chunks.length}`);

          for (const chunk of chunks) {
            try {
              console.log(`[${runId}] sending chunk size=${chunk.length}`);
              const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
              tickets.push(...ticketChunk);
              console.log(`[${runId}] sent chunk, receipts: ${ticketChunk.length}`);
            } catch (error) {
              console.error(`[${runId}] Eroare la trimiterea notificărilor: ${error}`);
            }
          }
        } catch (error) {
          console.error(`[${runId}] Eroare:`, error);
        }
      }
      console.log(`[${runId}] done`);
    });
exports.checkAndSendNotificationsIos = functions.pubsub
    .schedule("every 90 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      const runId = `checkAndSendNotificationsIos-${Date.now().toString(36)}`;
      console.log(`[${runId}] start`);
      const now = new Date();
      const offset = 2;
      now.setHours(now.getHours() + offset);

      const parts = now.toISOString().split("T")[0].split("-");
      const dateString = `${parts[2]}-${parts[1]}-${parts[0]}`;
      let article = {};

      const hours = now.getHours().toString().padStart(2, "0");
      // Rotunjește minutele în jos la cel mai apropiat multiplu de 5
      const minutes = Math.floor(now.getMinutes() / 5) * 5;
      const timeString = `${hours}:${minutes.toString().padStart(2, "0")}`;

      console.log("timeString.....", timeString);
      console.log("dateString.....", dateString);
      const b = "BlogArticole";
      const articlesSnapshot = await admin
          .firestore()
          .collection(b)
          .where("firstUploadDate", "==", dateString)
          .where("firstUploadtime", "==", timeString)
          .get();

      if (articlesSnapshot.empty) {
        console.log("Niciun articol programat pentru acum.");
        return;
      }

      articlesSnapshot.forEach((doc) => (article = doc.data()));

      console.log("articol primit...", article);

      const tokens = [];
      const u = "userTokens";
      const userTokensSnap = await admin
          .firestore()
          .collection(u)
          .where("isIos", "==", true)
          .get(); // Adaugă filtrul pentru isIos
      userTokensSnap.forEach((doc) => tokens.push(doc.data()));
      console.log(`[${runId}] fetched iOS tokens: ${tokens.length}`);

      // Impărțirea tokenurilor în batch-uri
      const BATCH_SIZE = 100;
      for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        const batch = tokens.slice(i, i + BATCH_SIZE);

        const messages = batch.map((token) => {
        // Determină limbajul în funcție de condițiile specificate
          let languageKey;
          if (token.language === "hi") {
            languageKey = "hu";
          } else if (token.language === "id") {
            languageKey = "ru";
          } else if (token.language === "ru") {
            languageKey = "rusa";
          } else {
            languageKey = token.language;
          }
          console.log("language key from userTokens...", languageKey);
          console.log("articole info with lang...", article.info[languageKey]);
          return {
            to: token.token,
            sound: "default",
            title: article.info[languageKey].nume,
            body: article.info[languageKey].descriere,
          };
        }).filter(Boolean);
        console.log(`[${runId}] batch messages: ${messages.length}`);
        // Trimite un batch de notificări
        try {
          const chunks = expo.chunkPushNotifications(messages);
          const tickets = [];
          console.log(`[${runId}] chunks to send: ${chunks.length}`);

          for (const chunk of chunks) {
            try {
              console.log(`[${runId}] sending chunk size=${chunk.length}`);
              const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
              tickets.push(...ticketChunk);
              console.log(`[${runId}] sent chunk, receipts: ${ticketChunk.length}`);
            } catch (error) {
              console.error(`[${runId}] Eroare la trimiterea notificărilor: ${error}`);
            }
          }
        } catch (error) {
          console.error(`[${runId}] Eroare:`, error);
        }
      }
      console.log(`[${runId}] done`);
    });

exports.sendRandomNotification = functions.pubsub
    .schedule("every 100 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      const runId = `sendRandomNotification-${Date.now().toString(36)}`;
      console.log(`[${runId}] 📢 start trimitere notificări random`);

      // 1️⃣ Obține toate notificările din Firestore
      const loc = "RegularNotifications";
      const nS = await admin.firestore().collection(loc).get();
      const notifications = [];

      nS.forEach((doc) => notifications.push(doc.data()));

      if (notifications.length === 0) {
        console.log("⚠️ Nici o notificare disponibilă în baza de date.");
        return;
      }

      // Selectează o notificare aleatorie
      const randomIndex = Math.floor(Math.random() * notifications.length);
      const selectedNotification = notifications[randomIndex];

      // 2️⃣ Obține tokenurile utilizatorilor pentru notificări push
      const tS = await admin.firestore().collection("userTokens").get();
      const users = [];

      tS.forEach((doc) => users.push(doc.data()));
      console.log(`[${runId}] fetched users: ${users.length}`);

      if (users.length === 0) {
        console.log("⚠️ Niciun token de notificare disponibil.");
        return false;
      }

      // 3️⃣ Construiește mesajele pentru utilizatori
      const messages = [];
      users.forEach((user) => {
        const {token, language, isIos} = user;

        if (selectedNotification && (isIos === undefined || isIos === false)) {
        // Fallback la engleză dacă limba utilizatorului nu există
          const langInfo =
          selectedNotification.info[language] ||
          selectedNotification.info["en"];
          if (!langInfo) {
            console.warn(
                `⚠️ Nu există pentru limba ${language}, nici fallback pe en.`,
            );
            return;
          }

          const nume = langInfo.nume || selectedNotification.info["en"].nume;
          const descriere =
          langInfo.descriere || selectedNotification.info["en"].descriere;

          if (Expo.isExpoPushToken(token)) {
            messages.push({
              to: token,
              sound: "default",
              title: `${nume} - rand notification`,
              body: descriere,
              data: {nume, descriere},
            });
          } else {
            console.error(`❌ Token invalid pentru notificări Expo: ${token}`);
          }
        }
      });

      if (messages.length === 0) {
        console.log("⚠️ Niciun mesaj valid pentru a trimite notificări.");
        return false;
      }

      // 4️⃣ Împărțim notificările în loturi de max. 100
      const chunks = expo.chunkPushNotifications(messages, 100);
      console.log(`[${runId}] chunks to send: ${chunks.length}, messages: ${messages.length}`);

      // 🔹 Funcție pentru a trimite fiecare lot cu întârziere
      const sendBatchedNotifications = async () => {
        let totalSent = 0;
        for (let i = 0; i < chunks.length; i++) {
          try {
            console.log(`[${runId}] 📤 Trimitere batch ${i + 1}/${chunks.length}... size=${chunks[i].length}`);
            const tC = await expo.sendPushNotificationsAsync(chunks[i]);
            totalSent += tC.length;
            console.log(`[${runId}] ✅ Batch ${i + 1} trimis. Total: ${totalSent}`);

            // 🔹 Adaugă o întârziere de 1 secundă între loturi
            if (i < chunks.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error(`[${runId}] ❌ Eroare la trimiterea batch-ului ${i + 1}:`, error);
          }
        }
        console.log(`[${runId}] 🚀 Notificări trimise cu succes. Total trimise: ${totalSent}`);
      };

      // 🔹 Executăm trimiterea notificărilor cu întârziere
      await sendBatchedNotifications();
      console.log(`[${runId}] done`);
    });

exports.sendRegularNotificationsIos = functions.pubsub
    .schedule("every 90 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
    // Obține toate notificările din Firestore
      const loc = "RegularNotifications";
      const nS = await admin.firestore().collection(loc).get();
      const notifications = [];
      nS.forEach((doc) => notifications.push(doc.data()));
      const randomIndex = Math.floor(Math.random() * notifications.length);
      const selectedNotification = notifications[randomIndex];

      if (notifications.length === 0) {
        console.log("Nici o notificare disponibilă în baza de date.");
        return;
      }

      // Obține doar tokenurile de utilizator pentru iOS
      const tS = await admin
          .firestore()
          .collection("userTokens")
          .where("isIos", "==", true)
          .get(); // Adaugă filtrul pentru isIos
      const users = [];
      tS.forEach((doc) => users.push(doc.data()));

      if (users.length === 0) {
        console.log("Niciun token de notificare disponibil.");
        return false;
      }

      const messages = [];
      users.forEach((user) => {
        const {token, language, isIos} = user;
        if (selectedNotification && isIos) {
          if (Expo.isExpoPushToken(token)) {
            messages.push({
              to: token,
              sound: "default",
              title: selectedNotification.info[language].nume,
              body: selectedNotification.info[language].descriere,
              data: {withSome: "data"},
            });
          } else {
            console.error(`Token ${token} is not a valid Expo push token`);
          }
        }
      });

      if (messages.length === 0) {
        console.log("Niciun mesaj valid pentru a trimite notificări.");
        return false;
      }

      // Trimite notificările în batch-uri
      // Pentru a evita eroarea Expo "All push notification messages in the same request must be for the same project",
      // trimitem câte un mesaj per request (fără a amesteca proiecte diferite în același request)
      let totalSent = 0;
      for (const msg of messages) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync([msg]);
          totalSent += ticketChunk.length;
          // Mic throttling ca bună practică
          await new Promise((r) => setTimeout(r, 100));
        } catch (error) {
          console.error(`Eroare la trimiterea notificării individuale: ${error}`);
        }
      }

      console.log(`Notificări trimise cu succes. total: ${totalSent}`);
    });

exports.sendRandomAfirmatii = functions
    .runWith({timeoutSeconds: 300, memory: "512MB"}) // 5 minute timeout
    .pubsub.schedule("every 60 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      console.log(
          "📢 Începerea procesului de trimitere a afirmațiilor pozitive...",
      );

      const loc = "AfirmatiiPozitive";
      const nS = await admin.firestore().collection(loc).get();
      const notifications = [];

      nS.forEach((doc) => notifications.push(doc.data()));

      if (notifications.length === 0) {
        console.log("⚠️ Nici o notificare disponibilă în baza de date.");
        return;
      }

      const randomIndex = Math.floor(Math.random() * notifications.length);
      const selectedNotification = notifications[randomIndex];
      if (!selectedNotification || !selectedNotification.info) {
        console.log("⚠️ Notificare selectată invalidă sau fără câmpul info.");
        return false;
      }

      const tS = await admin.firestore().collection("userTokens").get();
      const users = [];

      tS.forEach((doc) => users.push(doc.data()));

      if (users.length === 0) {
        console.log("⚠️ Niciun token de notificare disponibil.");
        return false;
      }

      const messages = [];
      users.forEach((user) => {
        const {token, language, isIos} = user;

        if (selectedNotification && (isIos === undefined || isIos === false)) {
          const info = selectedNotification.info || {};
          const preferredLang = language || "en";
          const langInfo = info[preferredLang] || info.en || info.ro || Object.values(info)[0];
          if (!langInfo) {
            console.warn(`⚠️ Lipsesc textele pentru limbă. language=${language}`);
            return;
          }

          const nume = langInfo.nume || (info.en && info.en.nume) || (info.ro && info.ro.nume) || "";
          const descriere = langInfo.descriere || (info.en && info.en.descriere) || (info.ro && info.ro.descriere) || "";

          if (Expo.isExpoPushToken(token)) {
            messages.push({
              to: token,
              sound: "default",
              title: nume,
              body: descriere,
              data: {nume, descriere, type: "AfirmatiiPozitive"},
            });
          } else {
            console.error(`❌ Token invalid pentru notificări Expo: ${token}`);
          }
        }
      });

      if (messages.length === 0) {
        console.log("⚠️ Niciun mesaj valid pentru a trimite notificări.");
        return false;
      }
      // Trimite individual pentru a evita amestecul de proiecte Expo în același request
      let totalSent = 0;
      for (const msg of messages) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync([msg]);
          totalSent += ticketChunk.length;
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error("❌ Eroare la trimiterea notificării individuale:", error);
        }
      }
      console.log(`🚀 Notificări trimise cu succes. Total trimise: ${totalSent}`);
    });

exports.sendRegularAfirmatiiIos = functions.pubsub
    .schedule("every 120 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
    // Obține toate notificările din Firestore
      const loc = "AfirmatiiPozitive";
      const nS = await admin.firestore().collection(loc).get();
      const notifications = [];
      nS.forEach((doc) => notifications.push(doc.data()));
      const randomIndex = Math.floor(Math.random() * notifications.length);
      const selectedNotification = notifications[randomIndex];

      if (notifications.length === 0) {
        console.log("Nici o notificare disponibilă în baza de date.");
        return;
      }

      // Obține doar tokenurile de utilizator pentru iOS
      const tS = await admin
          .firestore()
          .collection("userTokens")
          .where("isIos", "==", true)
          .get(); // Adaugă filtrul pentru isIos
      const users = [];
      tS.forEach((doc) => users.push(doc.data()));

      if (users.length === 0) {
        console.log("Niciun token de notificare disponibil.");
        return false;
      }

      const messages = [];
      users.forEach((user) => {
        const {token, language, isIos} = user;
        if (selectedNotification && isIos) {
          const info = (selectedNotification && selectedNotification.info) || {};
          const preferredLang = language || "en";
          const langInfo = info[preferredLang] || info.en || info.ro || Object.values(info)[0];
          if (!langInfo) {
            console.log("selectN has undefined for all fallbacks", info);
            return;
          }
          const nume = langInfo.nume || (info.en && info.en.nume) || (info.ro && info.ro.nume) || "";
          const descriere = langInfo.descriere || (info.en && info.en.descriere) || (info.ro && info.ro.descriere) || "";
          if (Expo.isExpoPushToken(token)) {
            messages.push({
              to: token,
              sound: "default",
              title: nume,
              body: descriere,
              data: {nume, descriere, type: "AfirmatiiPozitive"},
            });
          } else {
            console.error(`Token ${token} is not a valid Expo push token`);
          }
        }
      });

      if (messages.length === 0) {
        console.log("Niciun mesaj valid pentru a trimite notificări.");
        return false;
      }

      // Trimite notificările în batch-uri
      // Evită amestecul de proiecte diferite într-un singur request către Expo
      let totalSent = 0;
      for (const msg of messages) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync([msg]);
          totalSent += ticketChunk.length;
          await new Promise((r) => setTimeout(r, 100));
        } catch (error) {
          console.error(`Eroare la trimiterea notificării individuale: ${error}`);
        }
      }

      console.log(`Notificări trimise cu succes. total: ${totalSent}`);
    });

exports.sendHoroscopeNotificationsAndroid = functions.pubsub
    .schedule("every 80 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      const collectionRef = db.collection("NotificariHoroscop");

      const nS = await collectionRef.get();
      const notifications = [];
      nS.forEach((doc) => notifications.push(doc.data()));
      const randomIndex = Math.floor(Math.random() * notifications.length);
      const selectedNotification = notifications[randomIndex];

      if (notifications.length === 0) {
        console.log("Nicio notificare disponibilă în baza de date.");
        return;
      }

      const tS = await admin.firestore().collection("userTokens").get();
      const users = [];
      tS.forEach((doc) => users.push(doc.data()));

      if (users.length === 0) {
        console.log("Niciun token de notificare disponibil.");
        return false;
      }

      const messages = [];
      users.forEach((user) => {
        const {token, language, isIos} = user;
        if (selectedNotification && (isIos === undefined || isIos === false)) {
          const nume = selectedNotification.info[language].nume;
          const descriere = selectedNotification.info[language].descriere;
          if (Expo.isExpoPushToken(token)) {
            messages.push({
              to: token,
              sound: "default",
              title: nume,
              body: descriere,
              data: {nume, descriere, type: "NotificariHoroscop"},
            });
          } else {
            console.error(`Token ${token} is not a valid Expo push token`);
          }
        }
      });

      if (messages.length === 0) {
        console.log("Niciun mesaj valid pentru a trimite notificări.");
        return false;
      }

      // Evită amestecarea tokenurilor din proiecte diferite într-un singur request
      let totalSent = 0;
      for (const msg of messages) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync([msg]);
          totalSent += ticketChunk.length;
          await new Promise((r) => setTimeout(r, 100));
        } catch (error) {
          console.error(`Eroare la trimiterea notificării individuale: ${error}`);
        }
      }

      console.log(`Notificări trimise cu succes. total: ${totalSent}`);
    });

exports.sendHoroscopeNotificationsIos = functions.pubsub
    .schedule("every 85 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      const collectionRef = db.collection("NotificariHoroscop");

      const nS = await collectionRef.get();
      const notifications = [];
      nS.forEach((doc) => notifications.push(doc.data()));
      const randomIndex = Math.floor(Math.random() * notifications.length);
      const selectedNotification = notifications[randomIndex];

      if (notifications.length === 0) {
        console.log("Nicio notificare disponibilă în baza de date.");
        return;
      }

      const tS = await admin
          .firestore()
          .collection("userTokens")
          .where("isIos", "==", true)
          .get();
      const users = [];
      tS.forEach((doc) => users.push(doc.data()));

      if (users.length === 0) {
        console.log("Niciun token de notificare disponibil.");
        return false;
      }

      const messages = [];
      users.forEach((user) => {
        const {token, language, isIos} = user;
        if (selectedNotification && isIos) {
          const nume = selectedNotification.info[language].nume;
          const descriere = selectedNotification.info[language].descriere;
          if (Expo.isExpoPushToken(token)) {
            messages.push({
              to: token,
              sound: "default",
              title: nume,
              body: descriere,
              data: {nume, descriere, type: "NotificariHoroscop"},
            });
          } else {
            console.error(`Token ${token} is not a valid Expo push token`);
          }
        }
      });

      if (messages.length === 0) {
        console.log("Niciun mesaj valid pentru a trimite notificări.");
        return false;
      }

      // Evită amestecul de proiecte diferite într-un singur request
      let totalSent = 0;
      for (const msg of messages) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync([msg]);
          totalSent += ticketChunk.length;
          await new Promise((r) => setTimeout(r, 100));
        } catch (error) {
          console.error(`Eroare la trimiterea notificării individuale: ${error}`);
        }
      }

      console.log(`Notificări trimise cu succes. total: ${totalSent}`);
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

      // Obținem toți userii (pentru a filtra manual isIos === false sau undefined)
      console.log("[ANDROID] - Obținem toți userii din userTokens...");
      const tS = await admin.firestore().collection("userTokens").get();
      const users = [];
      tS.forEach((doc) => users.push(doc.data()));

      console.log(`[ANDROID] - Număr total de useri găsiți: ${users.length}`);

      if (users.length === 0) {
        console.log("[ANDROID] - Niciun token de notificare disponibil.");
        return null;
      }

      const messages = [];

      // Iterăm prin fiecare user
      users.forEach((user, index) => {
        const {token, language, isIos} = user;
        console.log(`[ANDROID] - User #${index + 1} => language: ${language}, isIos: ${isIos}, token: ${token}`);

        // Filtrăm utilizatorii care sunt Android (isIos===false) sau isIos e nedefinit
        if (isIos === false || isIos === undefined) {
        // Fallback la "ro" dacă nu are language
          const userLanguage = language || "ro";
          console.log(`[ANDROID] - Limba utilizator: ${userLanguage}`);

          // Căutăm datele de limbă în docData.info
          const langData = docData.info[userLanguage] || docData.info["ro"];
          if (!langData) {
            console.log(`[ANDROID] - Lipsesc datele pentru limba ${userLanguage}. Fallback pe "ro"??`);
            return;
          }

          const {nume, descriere} = langData;
          console.log(`[ANDROID] - notă: ${nume}, descriere: ${descriere}`);

          if (Expo.isExpoPushToken(token)) {
            messages.push({
              to: token,
              sound: "default",
              title: nume || "Notificare",
              body: descriere || "",
              data: {type: "NotificariManuale", ...docData},
            });
            console.log(`[ANDROID] - Mesaj pregătit pentru token: ${token}`);
          } else {
            console.error(`[ANDROID] - Tokenul ${token} nu este valid pentru Expo.`);
          }
        } else {
          console.log(`[ANDROID] - User #${index + 1} este iOS, deci nu primește notificări Android.`);
        }
      });

      console.log(`[ANDROID] - Total mesaje pregătite: ${messages.length}`);

      if (messages.length === 0) {
        console.log("[ANDROID] - Niciun mesaj valid pentru trimitere.");
        return null;
      }

      // Trimitem notificările în bucăți (chunks)
      const chunks = expo.chunkPushNotifications(messages);
      console.log(`[ANDROID] - Avem ${chunks.length} chunk-uri de trimis.`);
      const tickets = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`[ANDROID] - Trimitem chunk-ul #${i + 1} care conține ${chunk.length} mesaje.`);

        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          console.log(`[ANDROID] - Chunk-ul #${i + 1} trimis cu succes. Rezultat:`, ticketChunk);
        } catch (error) {
          console.error(`[ANDROID] - Eroare la trimiterea chunk-ului #${i + 1}: ${error}`);
        }
      }

      console.log(`[ANDROID] - Notificări Android trimise cu succes. Total ticket-uri: ${tickets.length}`);
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

      // Preluăm doar userii iOS
      console.log("[iOS] - Obținem toți userii iOS din userTokens...");
      const tS = await admin
          .firestore()
          .collection("userTokens")
          .where("isIos", "==", true)
          .get();

      const users = [];
      tS.forEach((doc) => users.push(doc.data()));
      console.log(`[iOS] - Număr total de useri iOS găsiți: ${users.length}`);

      if (users.length === 0) {
        console.log("[iOS] - Niciun token de notificare iOS disponibil.");
        return null;
      }

      const messages = [];

      users.forEach((user, index) => {
        const {token, language} = user;
        console.log(`[iOS] - User #${index + 1} => language: ${language}, token: ${token}`);

        // Fallback la "ro" dacă userLanguage nu există
        const userLanguage = language || "ro";
        console.log(`[iOS] - Limba utilizator: ${userLanguage}`);

        // Verificăm dacă există datele pentru limba respectivă
        const langData = docData.info[userLanguage] || docData.info["ro"];
        if (!langData) {
          console.log(`[iOS] - Lipsesc datele pentru limba ${userLanguage}.`);
          return;
        }

        const {nume, descriere} = langData;
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

      // Trimitem notificările în bucăți (chunks)
      const chunks = expo.chunkPushNotifications(messages);
      console.log(`[iOS] - Avem ${chunks.length} chunk-uri de trimis.`);
      const tickets = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`[iOS] - Trimitem chunk-ul #${i + 1} care conține ${chunk.length} mesaje.`);

        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          console.log(`[iOS] - Chunk-ul #${i + 1} trimis cu succes. Rezultat:`, ticketChunk);
        } catch (error) {
          console.error(`[iOS] - Eroare la trimiterea chunk-ului #${i + 1}: ${error}`);
        }
      }

      console.log(`[iOS] - Notificări iOS trimise cu succes. Total ticket-uri: ${tickets.length}`);
      return null;
    });


// -----------------PAYMENT LIVE START----------
exports.createPaymentIntent = functions.https.onCall(async (data ) => {
  const runId = `createPaymentIntent-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const {amount, currency, firstName, lastName, email, phone, productCode, couponCode} = data;

  try {
    let customer;
    const product = mapProduct(productCode);
    const coupon = await validateCouponAndComputeDiscount(runId, couponCode);
    const baseAmountBani = typeof amount === "number" ? amount : product.baseAmountBani;
    const finalAmountBani = coupon.couponAllowed ?
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
      metadata: {
        productCode: String(productCode || ""),
        couponCode: coupon.couponAllowed ? coupon.couponCode : "",
        couponPercent: coupon.couponAllowed ? String(coupon.discountPercent) : "0",
      },
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
    console.error(`[${runId}] Eroare createPaymentIntent:`, {stripeDetails, error});
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError(
        "internal",
        "Nu s-a putut crea PaymentIntent.",
    );
  }
});

exports.createInvoiceAfterPayment = functions.https.onCall(
    async (data ) => {
      const {transactionId, firstName, lastName, address} = data;

      try {
      // 1) Verificăm PaymentIntent
        const tId = transactionId;
        const paymentIntent = await stripe.paymentIntents.retrieve(tId);
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

        console.log("InvoiceItem creat:", invoiceItem);

        // 4) Creează Invoice
        const invoice = await stripe.invoices.create({
          customer,
          auto_advance: true, // Finalizează automat
          pending_invoice_items_behavior: "include", // Include
          collection_method: "send_invoice", // Factură trimisă manual
          days_until_due: 0,
        });

        console.log("Invoice creată:", invoice);

        // 5) Marchez factura ca plătită manual
        const paidInvoice = await stripe.invoices.pay(invoice.id, {
          paid_out_of_band: true,
        });

        console.log("Invoice marcată ca plătită:", paidInvoice);

        // 6) Trimit factura prin email
        const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);
        console.log("Factura trimisă prin email:", sentInvoice);

        return {
          message: "Factura a fost creată, plătită și trimisă prin email!",
          invoiceId: paidInvoice.id,
        };
      } catch (error) {
        console.error("Eroare createInvoiceAfterPayment:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Nu am putut crea și trimite factura.",
        );
      }
    },
);

exports.capturePaymentIntent = functions.https.onCall(async (data) => {
  const {transactionId} = data;
  try {
    // Retrieve PaymentIntent using stripeTest
    const tId= transactionId;
    const paymentIntent = await stripe.paymentIntents.retrieve(tId);
    console.log("PaymentIntent status before capture:", paymentIntent.status);

    // Dacă PaymentIntent-ul este deja capturat (status: "succeeded")
    if (paymentIntent.status === "succeeded") {
      return {captured: true, paymentIntent};
    }

    // Altfel, capturează PaymentIntent-ul
    const capturedPaymentIntent = await stripe.paymentIntents.capture(tId);
    return {captured: true, paymentIntent: capturedPaymentIntent};
  } catch (error) {
    console.error("Eroare la capturarea PaymentIntent:", error);
    throw new functions.https.HttpsError("internal", "Nu putut captur plata");
  }
});
// -----------------PAYMENT LIVE end----------

// -----------------OBLIO INVOICE (Firebase Functions)----------
exports.createOblioInvoiceAfterPayment = functions
    .runWith({timeoutSeconds: 60, memory: "512MB"})
    .https.onCall(async (data) => {
      const runId = `createOblioInvoice-${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const {transactionId, customer, productCode, coupon} = data || {};

      try {
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
        const issueDate = new Date().toISOString().slice(0, 10);
        const dueDate = issueDate;
        const product = mapProduct(productCode);

        const safeCoupon = coupon && coupon.couponAllowed ? {
          couponAllowed: true,
          couponCode: String(coupon.couponCode || ""),
          discountPercent: Number(coupon.discountPercent) || 0,
        } : {couponAllowed: false};

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
          language: "RO",
          currency: "EUR",
          precision: 2,
          sendEmail: 1,
          mentions,
          collect,
          client: {
            name: `${customer.firstName} ${customer.lastName}`,
            address: customer.address.line1,
            city: customer.address.city,
            state: customer.address.state,
            country: customer.address.country,
            email: customer.email,
            phone: customer.phone,
            vatPayer: false,
            save: 1,
          },
          products: [
            {
              name: product.name,
              description: product.description,
              quantity: 1,
              price: grossTotal,
              measuringUnit: "bucată",
              productType: "Serviciu",
              vatName: "Normala",
              vatPercent: 21,
              vatIncluded: true,
            },
          ],
        };

        console.log(`[${runId}] oblio invoice payload summary`, {
          cif: payload.cif,
          seriesName: payload.seriesName,
          issueDate,
          dueDate,
          total: grossTotal,
          client: {name: payload.client.name, city: payload.client.city, state: payload.client.state, country: payload.client.country},
          productCode: String(productCode || ""),
          mentions,
        });

        // Invoice create endpoint per Oblio docs
        const {statusCode, json, raw} = await oblioPostJson("https://www.oblio.eu/api/docs/invoice", payload, token);
        console.log(`[${runId}] oblio invoice response`, {statusCode, jsonPreview: json ? {status: json.status, statusMessage: json.statusMessage} : null});

        if (statusCode !== 200 || !json || json.status !== 200) {
          console.error(`[${runId}] oblio invoice failed`, {statusCode, json, raw});
          throw new Error("Oblio invoice create failed");
        }

        const result = {
          transactionId: String(transactionId),
          oblio: json.data || json,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          grossTotal,
          productCode: String(productCode || ""),
          coupon: safeCoupon,
        };
        await invoiceRef.set(result);
        return result;
      } catch (err) {
        console.error(`[${runId}] createOblioInvoiceAfterPayment error`, err);
        if (err instanceof functions.https.HttpsError) throw err;
        throw new functions.https.HttpsError("internal", "Nu am putut crea factura Oblio.");
      }
    });

// -----------------PAYMENT test START----------
const stripeTest = require("stripe")(functions.config().stripe.test_secret_key);

exports.createPaymentIntentTest = functions.https.onCall(
    async (data ) => {
      const {amount, currency, firstName, lastName, email, phone} = data;

      try {
        let customer;
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
          amount,
          currency: currency || "ron",
          customer: customer.id,
          payment_method_types: ["card"],
          capture_method: "manual", // Fondurile autorizate inițial
        });

        return {
          clientSecret: paymentIntent.client_secret,
          transactionId: paymentIntent.id,
        };
      } catch (error) {
        console.error("Eroare createPaymentIntentTest:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Nu s-a putut crea PaymentIntent (TEST).",
        );
      }
    },
);

exports.capturePaymentIntentTest = functions.https.onCall(async (data) => {
  const {transactionId} = data;
  try {
    // Retrieve PaymentIntent using stripeTest
    const tId= transactionId;
    const paymentIntent = await stripeTest.paymentIntents.retrieve(tId);
    console.log("PaymentIntent status before capture:", paymentIntent.status);

    // Dacă PaymentIntent-ul este deja capturat (status: "succeeded")
    if (paymentIntent.status === "succeeded") {
      return {captured: true, paymentIntent};
    }

    // Altfel, capturează PaymentIntent-ul
    const capturedPaymentIntent = await stripeTest.paymentIntents.capture(tId);
    return {captured: true, paymentIntent: capturedPaymentIntent};
  } catch (error) {
    console.error("Eroare la capturarea PaymentIntent:", error);
    throw new functions.https.HttpsError("internal", "Nu putut captur plata");
  }
});


exports.createInvoiceAfterPaymentTest = functions.https.onCall(
    async (data ) => {
      const {transactionId, firstName, lastName, address} = data;

      try {
        const paymentIntent = await stripeTest.paymentIntents.retrieve(
            transactionId,
        );
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

        console.log("InvoiceItem creat (TEST):", invoiceItem);

        const invoice = await stripeTest.invoices.create({
          customer,
          auto_advance: true,
          pending_invoice_items_behavior: "include",
          collection_method: "send_invoice",
          days_until_due: 0,
        });

        console.log("Invoice creată (TEST):", invoice);

        const paidInvoice = await stripeTest.invoices.pay(invoice.id, {
          paid_out_of_band: true,
        });

        console.log("Invoice marcată ca plătită (TEST):", paidInvoice);

        const sentInvoice = await stripeTest.invoices.sendInvoice(invoice.id);
        console.log("Factura trimisă prin email (TEST):", sentInvoice);

        return {
          message: "Factura a fost creată, (TEST)!",
          invoiceId: paidInvoice.id,
        };
      } catch (error) {
        console.error("Eroare createInvoiceAfterPaymentTest:", error);
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

// Configurare transportator email (exemplu folosind Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "webdynamicx@gmail.com",
    pass: "ypeb yvmi ygat lahn",
  },
});

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
  const {email, pdfHtml, fullName} = data;
  if (!email || !pdfHtml) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Email or PDF content is missing.",
    );
  }

  try {
    // Generate PDF from HTML
    const pdfBuffer = await generatePdfBuffer(pdfHtml);

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
    await transporter.sendMail(mailOptions);
    return {success: true, message: "Email sent successfully."};
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError("internal", "Error sending email.");
  }
};

exports.sendPdfEmail = functions
    .runWith({
      memory: "512MB", // Crește limita de memorie la 512MB
      timeoutSeconds: 60, // (Opțional)
    })
    .https.onCall(sendPdfEmail);

// Sincronizează în mod sigur token-ul Expo din `Users/{uid}.expoToken` în colecția `userTokens`
// - Nu schimbă logica existentă de trimitere
// - Evită duplicatele prin căutare după `token`
// - Actualizează doar `language` dacă îl poate deduce din documentul User
exports.syncExpoTokenToUserTokens = functions.firestore
    .document("Users/{uid}")
    .onWrite(async (change, context) => {
      try {
        // const before = change.before.exists ? change.before.data() : null;
        const after = change.after.exists ? change.after.data() : null;

        if (!after) {
          return null;
        }

        const rawToken = after.expoToken;
        if (!rawToken) {
          // Niciun token prezent în document
          return null;
        }

        const tokenString = typeof rawToken === "string" ? rawToken : (rawToken && rawToken.data);
        if (!tokenString) {
          return null;
        }

        const languageCandidate = after.actualLanguage || after.language || null;

        const uTokens = admin.firestore().collection("userTokens");
        const existingSnap = await uTokens.where("token", "==", tokenString).get();

        if (!existingSnap.empty) {
          // Există deja un doc pentru acest token; actualizează doar limba dacă e disponibilă
          const docRef = existingSnap.docs[0].ref;
          if (languageCandidate) {
            await docRef.update({language: languageCandidate});
          }
          return null;
        }

        // Creează în siguranță un document nou pentru token-ul lipsă
        const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
        const data = {token: tokenString};
        if (languageCandidate) {
          data.language = languageCandidate;
        }
        await uTokens.doc(id).set(data);

        return null;
      } catch (err) {
        console.error("syncExpoTokenToUserTokens error", err);
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
        let updated = 0;
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

          const languageCandidate = user.actualLanguage || user.language || null;

          const uTokens = db.collection("userTokens");
          const existingSnap = await uTokens.where("token", "==", tokenString).limit(1).get();
          if (!existingSnap.empty) {
            const ref = existingSnap.docs[0].ref;
            if (languageCandidate) {
              await ref.update({language: languageCandidate});
              updated++;
            } else {
              skipped++;
            }
          } else {
            const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
            const data = {token: tokenString};
            if (languageCandidate) data.language = languageCandidate;
            await uTokens.doc(id).set(data);
            created++;
          }
        }

        const nextCursor = snap.size > 0 ? lastDocId : null;
        console.log(`[${runId}] processed=${processed} created=${created} updated=${updated} skipped=${skipped} nextCursor=${nextCursor}`);
        res.json({processed, created, updated, skipped, nextCursor});
      } catch (err) {
        console.error("backfillUserTokens error", err);
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

exports.sendVideoPublishedNotifications = functions.pubsub
    .schedule("every 5 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async () => {
      const runId = `sendVideoPublishedNotifications-${Date.now().toString(36)}`;
      const now = admin.firestore.Timestamp.now();

      const videosSnap = await admin
          .firestore()
          .collection("videosVideoModule")
          .where("isPublished", "==", true)
          .where("publishAt", "<=", now)
          .where("notificationSentAt", "==", null)
          .get();

      if (videosSnap.empty) {
        console.log(`[${runId}] no scheduled videos`);
        return null;
      }

      const userTokensSnap = await admin.firestore().collection("userTokens").get();
      const tokens = [];
      userTokensSnap.forEach((doc) => tokens.push(doc.data()));

      if (tokens.length === 0) {
        console.log(`[${runId}] no user tokens`);
        return null;
      }

      let batch = admin.firestore().batch();
      let batchCount = 0;

      for (const videoDoc of videosSnap.docs) {
        const videoData = videoDoc.data() || {};
        const messages = [];
        const languageDistribution = {};
        tokens.forEach((user) => {
          const {token, language} = user;
          if (Expo.isExpoPushToken(token)) {
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
          } else {
            console.error(`[VideoPublished] Token invalid: ${token}`);
          }
        });

        console.log(
            `[${runId}] video=${videoDoc.id} messages=${messages.length} langDistribution=${JSON.stringify(languageDistribution)}`,
        );

        if (messages.length > 0) {
          const chunks = expo.chunkPushNotifications(messages);
          for (const chunk of chunks) {
            try {
              await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {
              console.error("[VideoPublished] Eroare la trimitere chunk:", error);
            }
          }
        }

        batch.update(videoDoc.ref, {notificationSentAt: now});
        batchCount += 1;

        if (batchCount >= 450) {
          await batch.commit();
          batch = admin.firestore().batch();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      console.log(`[${runId}] notified videos: ${videosSnap.size}`);
      return null;
    });
