import {
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  addDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  where,
  query,
  collectionGroup,
  startAt,
} from "firebase/firestore";
import { authentication, db } from "../../firebase";

// ------ BACKUP ANALIZE ----
import AsyncStorage from "@react-native-async-storage/async-storage";
// ------------- BACKUP ANALIZE ASTROGRAME ------------

/* Backup pentru analiza personală (userData) */
export const backupAnalizeAstrogramaNatalaPersonalaToFirestore = async () => {
  try {
    console.log("🔥 [Personala] Firestore inițializat.");

    // Recuperează detaliile utilizatorului (ex: phone, email)
    const userDetailsJson = await AsyncStorage.getItem("userDetails");
    console.log("📥 [Personala] userDetailsJson:", userDetailsJson);
    const parsedUserDetailsData = userDetailsJson
      ? JSON.parse(userDetailsJson)
      : null;
    console.log("🔍 [Personala] Parsed userDetails:", parsedUserDetailsData);

    // Recuperează analiza personală (userData)
    const userDataJson = await AsyncStorage.getItem("userData");
    console.log("📥 [Personala] userDataJson...starting parse...");
    const parsedUserData = userDataJson ? JSON.parse(userDataJson) : null;
    console.log("🔍 [Personala] Parsed userData id:", parsedUserData?.id);

    if (parsedUserData && parsedUserData.id) {
      console.log(
        `🔄 [Personala] Se pregătește backup pentru analiza personală cu id: ${parsedUserData.id}`
      );
      const personalCollectionRef = collection(
        db,
        "analizeAstrogramaNatalaPersonala"
      );

      // Folosim telefonul pentru a găsi toate backup-urile personale existente
      const personalQueryAll = query(
        personalCollectionRef,
        where("phone", "==", parsedUserDetailsData?.phone)
      );
      console.log(
        "🔍 [Personala] Executăm query pentru backup-urile existente..."
      );
      const personalSnapshotAll = await getDocs(personalQueryAll);

      let backupExistsForCurrent = false;
      // Ștergem documentele vechi care nu au originalId egal cu noul parsedUserData.id
      for (const docSnap of personalSnapshotAll.docs) {
        const data = docSnap.data();
        if (data.originalId !== parsedUserData.id) {
          await deleteDoc(
            doc(db, "analizeAstrogramaNatalaPersonala", docSnap.id)
          );
          console.log(
            `🗑️ [Personala] Șters backup vechi cu originalId ${data.originalId}`
          );
        } else {
          backupExistsForCurrent = true;
        }
      }

      if (!backupExistsForCurrent) {
        console.log(
          "🆕 [Personala] Nu există backup pentru analiza curentă. Se va crea unul nou."
        );
        const backupPersonalData = {
          ...parsedUserData,
          originalId: parsedUserData.id,
          ...parsedUserDetailsData,
        };
        console.log("📤 [Personala] Date backup:", backupPersonalData);

        const personalDocRef = await addDoc(
          personalCollectionRef,
          backupPersonalData
        );
        console.log(
          "✅ [Personala] Document adăugat. DocumentRef id:",
          personalDocRef.id
        );

        await updateDoc(
          doc(db, "analizeAstrogramaNatalaPersonala", personalDocRef.id),
          {
            documentId: personalDocRef.id,
          }
        );
        console.log(
          "✅ [Personala] Documentul actualizat cu documentId:",
          personalDocRef.id
        );
      } else {
        // Dacă backup-ul pentru noul parsedUserData.id există, verificăm dacă trebuie actualizat
        const personalQuery = query(
          personalCollectionRef,
          where("originalId", "==", parsedUserData.id)
        );
        const personalSnapshot = await getDocs(personalQuery);
        const existingDoc = personalSnapshot.docs[0];
        const firestoreData = existingDoc.data();
        console.log("ℹ️ [Personala] Backup existent găsit:", firestoreData);
        if (firestoreData.isPaid !== parsedUserData.isPaid) {
          console.log(
            "🔄 [Personala] Detected update (isPaid changed). Actualizăm documentul..."
          );
          const updatedData = {
            ...parsedUserData,
            originalId: parsedUserData.id,
            ...parsedUserDetailsData,
          };
          await updateDoc(existingDoc.ref, updatedData);
          console.log("✅ [Personala] Documentul a fost actualizat.");
        } else {
          console.log(
            "✅ [Personala] Backup existent și nu necesită actualizare."
          );
        }
      }
    } else {
      console.log(
        "⚠️ [Personala] Nu există date pentru analiza personală sau lipsește id-ul."
      );
    }
  } catch (error) {
    console.error(
      "❌ [Personala] Eroare la backup-ul analizelor în Firestore:",
      error
    );
  }
};

/* Backup pentru analizele celorlalte persoane (personsDataAstrograma) */
export const backupAnalizeAstrogramaNatalaOthersToFirestore = async () => {
  try {
    console.log("🔥 [Others] Firestore inițializat.");

    // Recuperează userDetails
    const userDetailsJson = await AsyncStorage.getItem("userDetails");
    console.log("📥 [Others] userDetailsJson:", userDetailsJson);
    const parsedUserDetailsData = userDetailsJson
      ? JSON.parse(userDetailsJson)
      : null;
    console.log("🔍 [Others] Parsed userDetails:", parsedUserDetailsData);

    // Recuperează analizele celorlalte persoane (personsDataAstrograma)
    const personsDataAstrogramaJson = await AsyncStorage.getItem(
      "personsDataAstrograma"
    );
    console.log(
      "📥 [Others] personsDataAstrogramaJson...starting parse...",
      personsDataAstrogramaJson
    );
    let parsedPersonsDataAstrograma = personsDataAstrogramaJson
      ? JSON.parse(personsDataAstrogramaJson)
      : [];
    if (!Array.isArray(parsedPersonsDataAstrograma)) {
      parsedPersonsDataAstrograma = [parsedPersonsDataAstrograma];
    }
    console.log(
      "🔍 [Others] Parsed personsDataAstrograma first id:",
      parsedPersonsDataAstrograma[0]?.id
    );

    const othersCollectionRef = collection(db, "analizeAstrogramaNatalaOthers");
    for (const analysis of parsedPersonsDataAstrograma) {
      if (analysis && analysis.id) {
        console.log(
          `🔄 [Others] Verificăm backup pentru analiza cu id: ${analysis.id}`
        );
        const othersQuery = query(
          othersCollectionRef,
          where("originalId", "==", analysis.id)
        );
        const othersSnapshot = await getDocs(othersQuery);
        console.log(
          `📄 [Others] Pentru analiza cu id ${analysis.id}, s-au găsit: ${othersSnapshot.docs.length} documente.`
        );
        if (othersSnapshot.empty) {
          console.log(
            `🆕 [Others] Nu există backup pentru analiza cu id ${analysis.id}. Se va crea unul.`
          );
          const backupOthersData = {
            ...analysis,
            originalId: analysis.id,
            ...parsedUserDetailsData,
          };
          console.log("📤 [Others] Date backup:", backupOthersData);

          const othersDocRef = await addDoc(
            othersCollectionRef,
            backupOthersData
          );
          console.log(
            "✅ [Others] Document adăugat. DocumentRef id:",
            othersDocRef.id
          );

          await updateDoc(
            doc(db, "analizeAstrogramaNatalaOthers", othersDocRef.id),
            {
              documentId: othersDocRef.id,
            }
          );
          console.log(
            `✅ [Others] Documentul actualizat cu documentId: ${othersDocRef.id}`
          );
        } else {
          const existingDoc = othersSnapshot.docs[0];
          const firestoreData = existingDoc.data();
          console.log(
            `ℹ️ [Others] Backup existent găsit pentru analiza cu id ${analysis.id}:`,
            firestoreData
          );
          if (firestoreData.isPaid !== analysis.isPaid) {
            console.log(
              `🔄 [Others] Detected update pentru analiza cu id ${analysis.id} (isPaid changed). Actualizăm documentul...`
            );
            const updatedData = {
              ...analysis,
              originalId: analysis.id,
              ...parsedUserDetailsData,
            };
            await updateDoc(existingDoc.ref, updatedData);
            console.log(
              `✅ [Others] Documentul pentru analiza cu id ${analysis.id} a fost actualizat.`
            );
          } else {
            console.log(
              `✅ [Others] Backup pentru analiza cu id ${analysis.id} există deja și nu necesită actualizare.`
            );
          }
        }
      } else {
        console.log(
          "⚠️ [Others] Obiectul de analiză nu are un id valid. Se sare peste backup.",
          analysis
        );
      }
    }
    console.log("🎉 [Others] Procesul de backup s-a încheiat.");
  } catch (error) {
    console.error(
      "❌ [Others] Eroare la backup-ul analizelor în Firestore:",
      error
    );
  }
};

// RETRIEVE ANALIZE ASTROGRAME

// export const retrieveBackupsByPhone = async () => {
//   try {
//     console.log("🔥 [Retrieval] Firestore inițializat.");

//     // Recuperează detaliile utilizatorului (ex: phone, email)
//     const userDetailsJson = await AsyncStorage.getItem("userDetails");
//     console.log("📥 [Retrieval] userDetailsJson:", userDetailsJson);
//     const parsedUserDetailsData = userDetailsJson
//       ? JSON.parse(userDetailsJson)
//       : null;
//     console.log("🔍 [Retrieval] Parsed userDetails:", parsedUserDetailsData);

//     if (!parsedUserDetailsData || !parsedUserDetailsData.phone) {
//       console.log("⚠️ [Retrieval] Phone nu este disponibil în userDetails.");
//       return;
//     }

//     const phone = parsedUserDetailsData.phone;
//     console.log(`🔍 [Retrieval] Căutare documente pentru phone: ${phone}`);

//     // --- Recuperare documente pentru analiza personală ---
//     const personalCollectionRef = collection(
//       db,
//       "analizeAstrogramaNatalaPersonala"
//     );
//     const personalQuery = query(
//       personalCollectionRef,
//       where("phone", "==", phone)
//     );
//     console.log("🔍 [Retrieval] Executăm query pentru analiza personală...");
//     const personalSnapshot = await getDocs(personalQuery);
//     const personalDocs = personalSnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     console.log("✅ [Retrieval] Documente personale găsite:", personalDocs);

//     // --- Recuperare documente pentru analizele others ---
//     const othersCollectionRef = collection(db, "analizeAstrogramaNatalaOthers");
//     const othersQuery = query(othersCollectionRef, where("phone", "==", phone));
//     console.log("🔍 [Retrieval] Executăm query pentru analizele others...");
//     const othersSnapshot = await getDocs(othersQuery);
//     const othersDocs = othersSnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     console.log("✅ [Retrieval] Documente others găsite:", othersDocs);

//     return { personalDocs, othersDocs };
//   } catch (error) {
//     console.error(
//       "❌ [Retrieval] Eroare la retrieval-ul documentelor din Firestore:",
//       error
//     );
//   }
// };

/* Retrieve pentru analiza personală (analizeAstrogramaNatalaPersonala) */
export const retrieveAnalizeAstrogramaNatalaPersonalaByPhone = async () => {
  try {
    console.log("🔥 [Retrieval Personala] Firestore inițializat.");

    const userDetailsJson = await AsyncStorage.getItem("userDetails");
    console.log("📥 [Retrieval Personala] userDetailsJson:", userDetailsJson);
    const parsedUserDetailsData = userDetailsJson
      ? JSON.parse(userDetailsJson)
      : null;
    console.log(
      "🔍 [Retrieval Personala] Parsed userDetails:",
      parsedUserDetailsData
    );

    if (!parsedUserDetailsData || !parsedUserDetailsData.phone) {
      console.log("⚠️ [Retrieval Personala] Phone nu este disponibil.");
      return;
    }

    const phone = parsedUserDetailsData.phone;
    console.log(
      `🔍 [Retrieval Personala] Căutare documente pentru phone: ${phone}`
    );

    const personalCollectionRef = collection(
      db,
      "analizeAstrogramaNatalaPersonala"
    );
    const personalQuery = query(
      personalCollectionRef,
      where("phone", "==", phone)
    );
    console.log("🔍 [Retrieval Personala] Executăm query...");
    const personalSnapshot = await getDocs(personalQuery);
    const personalDocs = personalSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("✅ [Retrieval Personala] Documente găsite:", personalDocs);
    return personalDocs;
  } catch (error) {
    console.error("❌ [Retrieval Personala] Eroare:", error);
  }
};

/* Retrieve pentru analizele celorlalte persoane (analizeAstrogramaNatalaOthers) */
export const retrieveAnalizeAstrogramaNatalaOthersByPhone = async () => {
  try {
    console.log("🔥 [Retrieval Others] Firestore inițializat.");

    const userDetailsJson = await AsyncStorage.getItem("userDetails");
    console.log("📥 [Retrieval Others] userDetailsJson:", userDetailsJson);
    const parsedUserDetailsData = userDetailsJson
      ? JSON.parse(userDetailsJson)
      : null;
    console.log(
      "🔍 [Retrieval Others] Parsed userDetails:",
      parsedUserDetailsData
    );

    if (!parsedUserDetailsData || !parsedUserDetailsData.phone) {
      console.log("⚠️ [Retrieval Others] Phone nu este disponibil.");
      return;
    }

    const phone = parsedUserDetailsData.phone;
    console.log(
      `🔍 [Retrieval Others] Căutare documente pentru phone: ${phone}`
    );

    const othersCollectionRef = collection(db, "analizeAstrogramaNatalaOthers");
    const othersQuery = query(othersCollectionRef, where("phone", "==", phone));
    console.log("🔍 [Retrieval Others] Executăm query...");
    const othersSnapshot = await getDocs(othersQuery);
    const othersDocs = othersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("✅ [Retrieval Others] Documente găsite:", othersDocs);
    return othersDocs;
  } catch (error) {
    console.error("❌ [Retrieval Others] Eroare:", error);
  }
};

// ------ BACKUP ANALIZE SINASTRIE -------

/* Backup pentru datele personale (sinastrie one person)
   Se citește din AsyncStorage cheia "personsData" */
export const backupAnalizeSinastrieOnePersonToFirestore = async () => {
  try {
    console.log("🔥 [Sinastrie One] Firestore inițializat.");

    // Recuperează detaliile utilizatorului (ex: phone, email)
    const userDetailsJson = await AsyncStorage.getItem("userDetails");
    console.log("📥 [Sinastrie One] userDetailsJson:", userDetailsJson);
    const parsedUserDetailsData = userDetailsJson
      ? JSON.parse(userDetailsJson)
      : null;
    console.log(
      "🔍 [Sinastrie One] Parsed userDetails:",
      parsedUserDetailsData
    );

    // Recuperează datele personale din AsyncStorage (cheia "personsData")
    const personsDataJson = await AsyncStorage.getItem("personsData");
    console.log("📥 [Sinastrie One] personsDataJson:", personsDataJson);
    let parsedPersonsData = personsDataJson ? JSON.parse(personsDataJson) : [];
    if (!Array.isArray(parsedPersonsData)) {
      parsedPersonsData = [parsedPersonsData];
    }
    console.log(
      "🔍 [Sinastrie One] Parsed personsData first id:",
      parsedPersonsData[0]?.id
    );

    const onePersonCollectionRef = collection(db, "analizeSinastrieOnePerson");

    // Pentru fiecare obiect din parsedPersonsData se face backup
    for (const person of parsedPersonsData) {
      if (person && person.id) {
        console.log(
          `🔄 [Sinastrie One] Verificăm backup pentru persoana cu id: ${person.id}`
        );
        const q = query(
          onePersonCollectionRef,
          where("originalId", "==", person.id)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          console.log(
            `🆕 [Sinastrie One] Nu există backup pentru persoana cu id ${person.id}. Se creează backup.`
          );
          const backupData = {
            ...person,
            originalId: person.id,
            ...parsedUserDetailsData,
          };
          console.log("📤 [Sinastrie One] Date backup:", backupData);
          const docRef = await addDoc(onePersonCollectionRef, backupData);
          console.log(
            "✅ [Sinastrie One] Document adăugat. DocRef id:",
            docRef.id
          );
          await updateDoc(doc(db, "analizeSinastrieOnePerson", docRef.id), {
            documentId: docRef.id,
          });
        } else {
          const existingDoc = snapshot.docs[0];
          const firestoreData = existingDoc.data();
          console.log(
            "ℹ️ [Sinastrie One] Backup existent găsit:",
            firestoreData
          );
          if (firestoreData.isPaid !== person.isPaid) {
            console.log(
              "🔄 [Sinastrie One] Update detectat. Actualizăm documentul..."
            );
            const updatedData = {
              ...person,
              originalId: person.id,
              ...parsedUserDetailsData,
            };
            await updateDoc(existingDoc.ref, updatedData);
            console.log("✅ [Sinastrie One] Documentul a fost actualizat.");
          } else {
            console.log("✅ [Sinastrie One] Backup existent, fără modificări.");
          }
        }
      } else {
        console.log("⚠️ [Sinastrie One] Date invalide, se sare peste:", person);
      }
    }
    console.log("🎉 [Sinastrie One] Procesul de backup s-a încheiat.");
  } catch (error) {
    console.error("❌ [Sinastrie One] Eroare la backup:", error);
  }
};

/* Backup pentru datele celorlalte persoane (sinastrie others)
   Se citește din AsyncStorage cheia "personsDataOthers" */
export const backupAnalizeSinastrieOthersToFirestore = async () => {
  try {
    console.log("🔥 [Sinastrie Others] Firestore inițializat.");

    // Recuperează detaliile utilizatorului
    const userDetailsJson = await AsyncStorage.getItem("userDetails");
    console.log("📥 [Sinastrie Others] userDetailsJson:", userDetailsJson);
    const parsedUserDetailsData = userDetailsJson
      ? JSON.parse(userDetailsJson)
      : null;
    console.log(
      "🔍 [Sinastrie Others] Parsed userDetails:",
      parsedUserDetailsData
    );

    // Recuperează datele pentru alți participanți (din "personsDataOthers")
    const personsDataOthersJson = await AsyncStorage.getItem(
      "personsDataOthers"
    );
    console.log(
      "📥 [Sinastrie Others] personsDataOthersJson:",
      personsDataOthersJson
    );
    let parsedPersonsDataOthers = personsDataOthersJson
      ? JSON.parse(personsDataOthersJson)
      : [];
    if (!Array.isArray(parsedPersonsDataOthers)) {
      parsedPersonsDataOthers = [parsedPersonsDataOthers];
    }
    console.log(
      "🔍 [Sinastrie Others] Parsed personsDataOthers first id:",
      parsedPersonsDataOthers[0]?.id
    );

    const othersCollectionRef = collection(db, "analizeSinastrieOthers");

    for (const analysis of parsedPersonsDataOthers) {
      if (analysis && analysis.id) {
        console.log(
          `🔄 [Sinastrie Others] Verificăm backup pentru analiza cu id: ${analysis.id}`
        );
        const q = query(
          othersCollectionRef,
          where("originalId", "==", analysis.id)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          console.log(
            `🆕 [Sinastrie Others] Nu există backup pentru analiza cu id ${analysis.id}. Se creează backup.`
          );
          const backupData = {
            ...analysis,
            originalId: analysis.id,
            ...parsedUserDetailsData,
          };
          console.log("📤 [Sinastrie Others] Date backup:", backupData);
          const docRef = await addDoc(othersCollectionRef, backupData);
          console.log(
            "✅ [Sinastrie Others] Document adăugat. DocRef id:",
            docRef.id
          );
          await updateDoc(doc(db, "analizeSinastrieOthers", docRef.id), {
            documentId: docRef.id,
          });
        } else {
          const existingDoc = snapshot.docs[0];
          const firestoreData = existingDoc.data();
          console.log(
            `ℹ️ [Sinastrie Others] Backup existent găsit pentru analiza cu id ${analysis.id}:`,
            firestoreData
          );
          if (firestoreData.isPaid !== analysis.isPaid) {
            console.log(
              `🔄 [Sinastrie Others] Update detectat pentru analiza cu id ${analysis.id}. Actualizăm documentul...`
            );
            const updatedData = {
              ...analysis,
              originalId: analysis.id,
              ...parsedUserDetailsData,
            };
            await updateDoc(existingDoc.ref, updatedData);
            console.log(
              `✅ [Sinastrie Others] Documentul pentru analiza cu id ${analysis.id} a fost actualizat.`
            );
          } else {
            console.log(
              `✅ [Sinastrie Others] Backup existent și nu necesită actualizare pentru analiza cu id ${analysis.id}.`
            );
          }
        }
      } else {
        console.log(
          "⚠️ [Sinastrie Others] Date invalide pentru analiză, se sare peste:",
          analysis
        );
      }
    }
    console.log("🎉 [Sinastrie Others] Procesul de backup s-a încheiat.");
  } catch (error) {
    console.error("❌ [Sinastrie Others] Eroare la backup:", error);
  }
};

// ---RETRIEVE SINASTRIES----

/* Retrieve pentru analiza personală (analizeSinastrieOnePerson) */
export const retrieveAnalizeSinastrieOnePersonByPhone = async () => {
  try {
    console.log("🔥 [Retrieval Sinastrie One] Firestore inițializat.");
    const userDetailsJson = await AsyncStorage.getItem("userDetails");
    console.log(
      "📥 [Retrieval Sinastrie One] userDetailsJson:",
      userDetailsJson
    );
    const parsedUserDetailsData = userDetailsJson
      ? JSON.parse(userDetailsJson)
      : null;
    console.log(
      "🔍 [Retrieval Sinastrie One] Parsed userDetails:",
      parsedUserDetailsData
    );
    if (!parsedUserDetailsData || !parsedUserDetailsData.phone) {
      console.log("⚠️ [Retrieval Sinastrie One] Phone nu este disponibil.");
      return;
    }
    const phone = parsedUserDetailsData.phone;
    console.log(
      `🔍 [Retrieval Sinastrie One] Căutare documente pentru phone: ${phone}`
    );
    const collectionRef = collection(db, "analizeSinastrieOnePerson");
    const q = query(collectionRef, where("phone", "==", phone));
    console.log("🔍 [Retrieval Sinastrie One] Executăm query...");
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log("✅ [Retrieval Sinastrie One] Documente găsite:", docs);
    return docs;
  } catch (error) {
    console.error("❌ [Retrieval Sinastrie One] Eroare:", error);
  }
};

/* Retrieve pentru analizele celorlalte persoane (analizeSinastrieOthers) */
export const retrieveAnalizeSinastrieOthersByPhone = async () => {
  try {
    console.log("🔥 [Retrieval Sinastrie Others] Firestore inițializat.");
    const userDetailsJson = await AsyncStorage.getItem("userDetails");
    console.log(
      "📥 [Retrieval Sinastrie Others] userDetailsJson:",
      userDetailsJson
    );
    const parsedUserDetailsData = userDetailsJson
      ? JSON.parse(userDetailsJson)
      : null;
    console.log(
      "🔍 [Retrieval Sinastrie Others] Parsed userDetails:",
      parsedUserDetailsData
    );
    if (!parsedUserDetailsData || !parsedUserDetailsData.phone) {
      console.log("⚠️ [Retrieval Sinastrie Others] Phone nu este disponibil.");
      return;
    }
    const phone = parsedUserDetailsData.phone;
    console.log(
      `🔍 [Retrieval Sinastrie Others] Căutare documente pentru phone: ${phone}`
    );
    const collectionRef = collection(db, "analizeSinastrieOthers");
    const q = query(collectionRef, where("phone", "==", phone));
    console.log("🔍 [Retrieval Sinastrie Others] Executăm query...");
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log("✅ [Retrieval Sinastrie Others] Documente găsite:", docs);
    return docs;
  } catch (error) {
    console.error("❌ [Retrieval Sinastrie Others] Eroare:", error);
  }
};
