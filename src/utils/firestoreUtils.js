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
import { handleDeleteAccount } from "./authUtils";

const auth = authentication;
export const userLocation = `Users/${
  auth.currentUser ? auth.currentUser.uid : ""
}`; // Calea către document

export const handleUpdateFirestore = async (location, updatedData) => {
  try {
    const ref = doc(db, location);

    await updateDoc(ref, updatedData);
  } catch (err) {
    console.log("Error on...handleUpdateFirestore...", err);
  }
};
export const handleUploadFirestore = async (data, location) => {
  try {
    console.log("test....");
    const ref = doc(db, location);
    console.log(location);
    console.log(data);
    await setDoc(ref, data);
  } catch (err) {
    console.log("Error on...handleUploadFirestore...", err);
  }
};

export const handleUploadRating = async (data, location) => {
  try {
    console.log("test.infor in handle upload firestore...");
    console.log(location);
    console.log(data);

    // Crează un nou document în colecție cu un ID generat automat
    const docRef = doc(collection(db, location));

    // preia length of location collection

    // Adaugă ID-ul generat în obiectul data
    const newData = {
      rate: data,
    };

    // Face upload cu noul obiect de date care include ID-ul documentului
    await setDoc(docRef, newData);

    console.log(`Documentul cu ID-ul ${docRef.id} a fost adăugat cu succes.`);
    return newData;
  } catch (err) {
    console.log("Eroare la handleUploadFirestore...", err);
  }
};

export const handleQueryRandom = async (location, id) => {
  console.log("start query firestore location...", location);
  console.log("start query firestore id...", id);
  let obj = {}; // Specificați tipul de obiecte pe care îl conține matricea
  const q = query(collection(db, location), where("id", "==", id));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    // arr.push(doc.data().data);
    obj = { ...doc.data() };
  });
  return obj;
};
export const handleQueryToken = async (location, token) => {
  console.log("start query firestore location...", location);
  console.log("start query firestore token...", token);

  const q = query(collection(db, location), where("token", "==", token));
  const querySnapshot = await getDocs(q);

  // Dacă querySnapshot nu este gol, înseamnă că există documente care corespund interogării
  const exists = !querySnapshot.empty;

  // Loghează dacă tokenul a fost găsit sau nu
  console.log(exists ? "Tokenul a fost găsit." : "Tokenul nu a fost găsit.");

  return exists; // Returnează true dacă tokenul există, altfel false
};

//ADD A DOCUMENT IN THE SUBCOLLECTION
export const handleUploadFirestoreSubcollection = async (data, location) => {
  console.log("create subcollection history...", data);
  try {
    const createdAt = Date.now();

    const currentDate = new Date();
    const formattedDate =
      currentDate.getDate().toString().padStart(2, "0") +
      "." +
      (currentDate.getMonth() + 1).toString().padStart(2, "0") +
      "." +
      currentDate.getFullYear();
    console.log(formattedDate);
    // Obține ultimele cifre ale timestamp-ului curent
    const timestamp = new Date().getTime().toString().slice(-5);

    // Generează un număr aleator între 0 și 99
    const randomComponent = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");

    // Creează ID-ul combinând o parte din ștampelul de timp și componenta aleatoare
    const uniqueId = `${timestamp}${randomComponent}`.slice(0, 7);

    console.log("ID unic:", uniqueId);
    let dataObj = {
      data,
      id: uniqueId,
      date: formattedDate,
      createdAt,
    };

    await addDoc(collection(db, location), dataObj);
    // console.log(location);
    // console.log(data);
    // await setDoc(ref, data);
  } catch (err) {
    console.log("Error on...handleUploadFirestore...", err);
  }
};

export const handleDeleteFirestore = async (location, currentPassword) => {
  try {
    const ref = doc(db, location);

    await deleteDoc(ref).then(() => {
      handleDeleteAccount(currentPassword);
    });
  } catch (err) {
    console.log("Error on...handleDeleteFirestore...", err);
  }
};

//get firestore docs from a collection
export const handleGetFirestore = async (location) => {
  let arr = []; // Specificați tipul de obiecte pe care îl conține matricea
  try {
    const querySnapshot = await getDocs(collection(db, location));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, ` ${location} => `, doc.data());
      arr.push(doc.data()); // Presupunem că fiecare document conține un câmp "data"
    });
  } catch (error) {
    console.error("Error fetching documents: ", error);
    // Aici poți, de asemenea, să returnezi un mesaj de eroare sau să arunci o excepție, în funcție de cum preferi să gestionezi erorile
    // throw error; // Pentru a arunca eroarea mai departe, dacă este necesar
  }

  return arr;
};

export const handleQueryFirestoreVarianteCarti = async (
  location,
  carte,
  categorie
) => {
  console.log("start query firestore...");
  let arr = []; // Specificați tipul de obiecte pe care îl conține matricea
  const q = query(
    collection(db, location),
    where("carte", "==", carte),
    where("categorie", "==", categorie)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    arr.push(doc.data().data);
  });
  return arr;
};

export const handleQueryFirestoreGeneral = async (
  location,
  queryParamOne,
  elementOne = null,
  queryParamTwo = null,
  elementTwo = null
) => {
  console.log("start query firestore pentru elementOne...", elementOne);
  console.log("start query firestore pentru elementTwo...", elementTwo);
  let arr = []; // Specificați tipul de obiecte pe care îl conține matricea, de exemplu: let arr = [{}];
  let conditions = [];

  conditions.push(collection(db, location));

  if (elementOne) {
    conditions.push(where(queryParamOne, "==", elementOne));
  }

  if (elementTwo) {
    conditions.push(where(queryParamTwo, "==", elementTwo));
  }

  const q = query(...conditions);

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    // console.log(doc.id, " => ", doc.data());
    arr.push(doc.data()); // Dacă dorești să adaugi un anumit câmp, specifică, de exemplu: doc.data().numeCamp
  });
  return arr;
};

export const handlePaginateFirestore = (location) => {
  const auth = authentication;
  const citiesRef = collection(db, "Users", auth.currentUser.uid, location);
  const q = query(citiesRef, startAt(1000000));
};

export const updateArticleWithTimestamp = async (
  articleId,
  firstUploadDate,
  firstUploadTime
) => {
  console.log("firstUploadDate...", firstUploadDate);
  console.log("firstUploadDate...", typeof firstUploadDate);
  console.log("firstUploadTime...", firstUploadTime);
  console.log("firstUploadTime...", typeof firstUploadTime);
  console.log("articleId...", articleId);
  console.log("articleId...", typeof articleId);
  // Parsează data și ora într-un obiect Date
  const dateParts = firstUploadDate.split("-");
  const timeParts = firstUploadTime.split(":");
  const date = new Date(
    dateParts[2],
    dateParts[1] - 1,
    dateParts[0],
    timeParts[0],
    timeParts[1]
  );

  // // Obține referința documentului
  const articleRef = doc(db, "BlogArticole", articleId);

  try {
    // Actualizează documentul cu un nou câmp care stochează data și ora ca un Timestamp Firebase
    await updateDoc(articleRef, {
      firstUploadTimestamp: date, // Firebase va converti automat obiectele Date în Timestamp
    });
    console.log("Document successfully updated with timestamp!");
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};
