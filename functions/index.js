const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Expo} = require("expo-server-sdk");

// Creează o nouă instanță a Expo SDK
const expo = new Expo();

admin.initializeApp();

const db = admin.firestore();

exports.checkAndSendNotifications = functions.pubsub
    .schedule("every 5 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async (context) => {
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
        });
        // Trimite un batch de notificări
        try {
          const chunks = expo.chunkPushNotifications(messages);
          const tickets = [];

          for (const chunk of chunks) {
            try {
              const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
              tickets.push(...ticketChunk);
            } catch (error) {
              console.error(`Eroare la trimiterea notificărilor: ${error}`);
            }
          }
        } catch (error) {
          console.error("Eroare:", error);
        }
      }
    });
exports.checkAndSendNotificationsIos = functions.pubsub
    .schedule("every 5 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async (context) => {
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
        });
        // Trimite un batch de notificări
        try {
          const chunks = expo.chunkPushNotifications(messages);
          const tickets = [];

          for (const chunk of chunks) {
            try {
              const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
              tickets.push(...ticketChunk);
            } catch (error) {
              console.error(`Eroare la trimiterea notificărilor: ${error}`);
            }
          }
        } catch (error) {
          console.error("Eroare:", error);
        }
      }
    });

exports.sendRandomNotification = functions.pubsub
    .schedule("every 120 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async (context) => {
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
              data: {nume, descriere},
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
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(`Eroare la trimiterea notificărilor: ${error}`);
        }
      }

      console.log(`Notificări trimise cu succes. total: ${tickets.length}`);
    });
exports.sendRegularNotificationsIos = functions.pubsub
    .schedule("every 120 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async (context) => {
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
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(`Eroare la trimiterea notificărilor: ${error}`);
        }
      }

      console.log(`Notificări trimise cu succes. total: ${tickets.length}`);
    });

exports.sendRandomAfirmatii = functions.pubsub
    .schedule("every 120 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async (context) => {
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
          if (
            selectedNotification.info[language] === undefined ||
          selectedNotification.info[language].nume === undefined ||
          selectedNotification.info[language].descriere === undefined
          ) {
            console.log("selectN has undefined", selectedNotification.info);
          } else {
            if (Expo.isExpoPushToken(token)) {
              const nume = selectedNotification.info[language].nume;
              const descriere = selectedNotification.info[language].descriere;
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
        }
      });

      if (messages.length === 0) {
        console.log("Niciun mesaj valid pentru a trimite notificări.");
        return false;
      }

      // Trimite notificările în batch-uri
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(`Eroare la trimiterea notificărilor: ${error}`);
        }
      }

      console.log(`Notificări trimise cu succes. total: ${tickets.length}`);
    });

exports.sendRegularAfirmatiiIos = functions.pubsub
    .schedule("every 120 minutes")
    .timeZone("Europe/Bucharest")
    .onRun(async (context) => {
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
          if (
            selectedNotification.info[language] === undefined ||
          selectedNotification.info[language].nume === undefined ||
          selectedNotification.info[language].descriere === undefined
          ) {
            console.log("selectN has undefined", selectedNotification.info);
          } else {
            if (Expo.isExpoPushToken(token)) {
              const nume = selectedNotification.info[language].nume;
              const descriere = selectedNotification.info[language].descriere;
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
        }
      });

      if (messages.length === 0) {
        console.log("Niciun mesaj valid pentru a trimite notificări.");
        return false;
      }

      // Trimite notificările în batch-uri
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(`Eroare la trimiterea notificărilor: ${error}`);
        }
      }

      console.log(`Notificări trimise cu succes. total: ${tickets.length}`);
    });

exports.sendHoroscopeNotificationsAndroid = functions.pubsub
    .schedule("every 24 hours")
    .timeZone("Europe/Bucharest")
    .onRun(async (context) => {
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

      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(`Eroare la trimiterea notificărilor: ${error}`);
        }
      }

      console.log(`Notificări trimise cu succes. total: ${tickets.length}`);
    });

exports.sendHoroscopeNotificationsIos = functions.pubsub
    .schedule("every 24 hours")
    .timeZone("Europe/Bucharest")
    .onRun(async (context) => {
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

      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(`Eroare la trimiterea notificărilor: ${error}`);
        }
      }

      console.log(`Notificări trimise cu succes. total: ${tickets.length}`);
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
            ro: {
              descriere: "Vezi ce îți prezic astrele!",
              nume: "🔭 Privește în viitor",
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
