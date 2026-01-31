import { authentication, db, storage } from "../../firebase";
// import { collection, query, where } from "firebase/firestore";
import {
  doc,
  collection,
  query,
  where,
  collectionGroup,
  orderBy,
  updateDoc,
  DocumentReference,
  arrayUnion,
  arrayRemove,
  startAt,
  endAt,
  limit,
  endBefore,
  startAfter,
} from "firebase/firestore";
import moment from "moment";

import { ref, getDownloadURL, listAll } from "firebase/storage";
import { checkCollectionExists } from "./checkIfCollectionExists";
import { getRating } from "./ratingCalc";
import { getDocPreferCache, getDocsPreferCache } from "./firestoreCache";
import { logDebug } from "./Logger";

const auth = authentication;
const DEFAULT_QUERY_LIMIT = 50;
const MESSAGE_PAGE_LIMIT = 50;
const APPOINTMENTS_PAGE_LIMIT = 50;
const isClinicLike = (data) =>
  Boolean(data?.isClinic) ||
  Boolean(data?.clinicInfoData) ||
  Boolean(data?.clinicAddressLocation);

export const retrieveClinicData = async () => {
  let phoneNumber;
  let email;
  let hasProfile;
  let isClinic;
  let aboutClinicData;
  let basicInfoData;
  let clinicInfoData;
  let contactData;
  let termsConditions;
  let clinicAddressLocation;
  let clinicReviews;
  let clinicImages = [];
  let oldClinicImages = [];
  let clinicMainImage = {};

  const docRef = doc(db, "Users", auth.currentUser.uid);
  const docSnap = await getDocPreferCache(docRef);

  try {
    if (docSnap.exists()) {
      clinicReviews = docSnap.data().clinicReviews;

      if (docSnap.data().clinicImages) {
        oldClinicImages = docSnap.data().clinicImages;
        logDebug("old...", oldClinicImages);

        if (
          docSnap.data().clinicImagesURI &&
          docSnap.data().clinicImagesURI.length > 0
        ) {
          clinicImages = docSnap.data().clinicImagesURI;
          for (let i = 0; i < docSnap.data().clinicImagesURI.length; i++) {
            if (docSnap.data().clinicImagesURI[i].isMainImg === true) {
              clinicMainImage = {
                img: docSnap.data().clinicImagesURI[i].img,
                isMainImg: docSnap.data().clinicImagesURI[i].isMainImg,
              };
            }
          }
        }
      }

      phoneNumber = docSnap.data().phoneNumber;
      email = docSnap.data().email;
      hasProfile = docSnap.data().hasProfile;
      isClinic = docSnap.data().isClinic;
      aboutClinicData = docSnap.data().aboutClinicData || "";
      basicInfoData = docSnap.data().basicInfoData || "";
      clinicInfoData = docSnap.data().clinicInfoData || "";
      contactData = docSnap.data().contactData || "";
      termsConditions = docSnap.data().termsConditions || "";
      clinicAddressLocation = docSnap.data().clinicAddressLocation || "";
    } else {
      logDebug("No such document!");
    }
  } catch (err) {
    logDebug("Error retrieveClinicData...", err);
  }

  return {
    phoneNumber,
    email,
    hasProfile,
    isClinic,
    aboutClinicData,
    basicInfoData,
    clinicInfoData,
    contactData,
    termsConditions,
    clinicAddressLocation,
    clinicMainImage,
    clinicImages,
    oldClinicImages,
    clinicReviews,
  };
};

export const retrieveClinicTimeSlots = async () => {
  let allDays;

  logDebug("auth.currentUser", auth.currentUser.uid);

  const docRef = doc(db, "Users", auth.currentUser.uid);
  const docSnap = await getDocPreferCache(docRef);
  try {
    if (docSnap.exists()) {
      allDays = docSnap.data().allDays;
    } else {
      logDebug("No such document!");
    }
  } catch (err) {
    logDebug("Error retrieveClinicData...", err);
  }
  return {
    allDays,
  };
};

const getDaysArray = (function () {
  const names = Object.freeze([
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]);
  return (year, month) => {
    const monthIndex = month - 1;
    const date = new Date(year, monthIndex, 1);
    const result = [];

    while (date.getMonth() == monthIndex) {
      // result.push(`${date.getDate()}-${names[date.getDay()]}`);
      result.push(`${names[date.getDay()]}`);
      date.setDate(date.getDate() + 1);
    }
    return result;
  };
})();

export const retrieveClinicCalendarTimes = async () => {
  let allDays;
  const checkableDate = moment(new Date()).format("YYYY-MM-DD");

  logDebug("auth.currentUser", auth.currentUser.uid);

  const docRef = doc(db, "Users", auth.currentUser.uid);
  const docSnap = await getDocPreferCache(docRef);

  logDebug("data...");
  logDebug(docSnap.data());
  try {
    if (docSnap.exists()) {
      allDays = docSnap.data().allDays;
    } else {
      logDebug("No such document!");
    }
  } catch (err) {
    logDebug("Error retrieveClinicData...", err);
  }

  const date = new Date();
  const currentYear = date.getFullYear();

  let arrMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let resultArrMonths = [];
  let arrFinalArrays = [];
  let finalObj = [];

  for (let i = 1; i <= arrMonths.length; i++) {
    let arrSecond = [];
    let arrFinal = [];
    let nr = 0;

    let res = getDaysArray(currentYear, i);

    for (let x = 0; x < allDays.length; x++) {
      arrSecond.push(allDays[x].val);
    }

    let tryTestArr = [];

    tryTestArr = res.reduce(function (a, e, i) {
      for (let variable of arrSecond) {
        if (e === variable) a.push(i + 1);
      }

      return a;
    }, []);

    arrFinal = tryTestArr;
    arrFinalArrays.push(arrFinal);
  }

  let obj = {};

  for (let z = 0; z < arrFinalArrays.length; z++) {
    for (let y = 0; y < arrFinalArrays[z].length; y++) {
      const date = moment(new Date(currentYear, z, arrFinalArrays[z][y]));
      const newDate = moment(date).format("YYYY-MM-DD");
      if (newDate > checkableDate) {
        obj[newDate] = { selected: true };
      } else {
      }
    }
  }

  logDebug("obj...");
  logDebug(obj);
  // return obj;
};

export const retrieveDoctorCalendarTimes = async (doctorId) => {
  logDebug("doctorId...", doctorId);
  let allDays;
  const checkableDate = moment(new Date()).format("YYYY-MM-DD");

  // logDebug('auth.currentUser', auth.currentUser.uid);

  const docRef = doc(db, "Users", auth.currentUser.uid, "Doctors", doctorId);
  const docSnap = await getDocPreferCache(docRef);
  try {
    if (docSnap.exists()) {
      allDays = docSnap.data().allDays;
    } else {
      logDebug("No such document!");
    }
  } catch (err) {
    logDebug("Error retrieveClinicData...", err);
  }

  const date = new Date();
  const currentYear = date.getFullYear();

  let arrMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let resultArrMonths = [];
  let arrFinalArrays = [];
  let finalObj = [];

  for (let i = 1; i <= arrMonths.length; i++) {
    let arrSecond = [];
    let arrFinal = [];
    let nr = 0;

    let res = getDaysArray(currentYear, i);

    for (let x = 0; x < allDays.length; x++) {
      arrSecond.push(allDays[x].val);
    }

    let tryTestArr = [];

    tryTestArr = res.reduce(function (a, e, i) {
      for (let variable of arrSecond) {
        if (e === variable) a.push(i + 1);
      }

      return a;
    }, []);

    arrFinal = tryTestArr;
    arrFinalArrays.push(arrFinal);
  }

  let obj = {};

  for (let z = 0; z < arrFinalArrays.length; z++) {
    for (let y = 0; y < arrFinalArrays[z].length; y++) {
      const date = moment(new Date(currentYear, z, arrFinalArrays[z][y]));
      const newDate = moment(date).format("YYYY-MM-DD");
      if (newDate > checkableDate) {
        obj[newDate] = { selected: true };
      } else {
      }
    }
  }
  // logDebug(obj);
  return obj;
};

export const retrieveTypeOfUser = async (uid) => {
  let userType = "";
  const docRef = doc(db, "Users", uid);
  const docSnap = await getDocPreferCache(docRef);
  try {
    if (isClinicLike(docSnap.data())) {
      userType = "isClinic";
    } else {
      userType = "isPatient";
    }
  } catch (err) {
    logDebug("Error retrieveTypeOfUser...", err);
  }

  return userType;
};

export const retrieveClinics = async () => {
  auth.currentUser.uid;
  let linkId;
  let clinics = [];
  const userQuery = query(
    collection(db, "Users"),
    where("owner_uid", "==", auth.currentUser.uid),
    limit(1)
  );
  const userSnapshot = await getDocsPreferCache(userQuery);
  userSnapshot.forEach((doc) => {
    linkId = doc.data().linkId;
  });

  if (linkId) {
    const clinicsQuery = query(
      collection(db, "Users"),
      where("owner_uid", "==", linkId)
    );
    const clinicsSnapshot = await getDocsPreferCache(clinicsQuery);
    clinicsSnapshot.forEach((doc) => {
      clinics.push(doc.data());
    });
  }
  logDebug("clinics...", clinics);

  return clinics;
};

export const retrieveClinicsForPatientDashboard = async (city) => {
  logDebug("start....retrieveClinicsForPatientDashboard....");

  let clinics = [];
  try {

    let startQueryClinics = Date.now() / 1000;

    logDebug("city....");
    logDebug(city);

    const q = query(
      collection(db, "Users"),
      where("clinicCity", "==", city),
      limit(DEFAULT_QUERY_LIMIT)
    );
    logDebug(
      "END... startQueryClinics",
      Date.now() / 1000 - startQueryClinics
    );

    let startQuerySnapshot = Date.now() / 1000;
    const querySnapshot = await getDocsPreferCache(q);

    logDebug("test before querySnapshot");
    querySnapshot.forEach((doc) => {
      logDebug("test querySnapshot");
      logDebug(doc.data());
      // doc.data() is never undefined for query doc snapshots
  

      if (isClinicLike(doc.data())) {
        let clinicImages = [];
        const clinicReviews = Array.isArray(doc.data().clinicReviews)
          ? doc.data().clinicReviews
          : [];
        let ratingMedia = getRating(clinicReviews);

        logDebug("test here rating...")
        logDebug(ratingMedia)

        let data = doc.data();
        data.ratingMedia = ratingMedia;
        data.numberOfReviews = clinicReviews.length;


        clinics.push(data);
      }
    });

    logDebug("test after querySnapshot");
    logDebug(clinics);
    //   for(let i = 0; i < clinics.length; i ++) {

    // }

    logDebug(
      "END... querySnapshot GET CLINICS",
      Date.now() / 1000 - startQuerySnapshot
    );

    let startLoopQueryClinics = Date.now() / 1000;
    for (let z = 0; z < clinics.length; z++) {
      let clinicDoctors = [];
      let clinicImages = [];
      let clinicMainImage;

      const clinicImagesUri = Array.isArray(clinics[z].clinicImagesURI)
        ? clinics[z].clinicImagesURI
        : [];
      logDebug("test here");
      logDebug(clinicImagesUri);
      for (let i = 0; i < clinicImagesUri.length; i++) {
        if (clinicImagesUri[i].isMainImg) {
          clinicMainImage = {
            img: clinicImagesUri[i].img,
            isMainImg: clinicImagesUri[i].isMainImg,
          };
        } else {
          clinicImages.push({
            img: clinicImagesUri[i].img,
            isMainImg: clinicImagesUri[i].isMainImg,
          });
        }
      }
      clinics[z].clinicImages = clinicImages;
      clinics[z].clinicMainImage = clinicMainImage;

      //   CHECK here FOR PERFORMANCE ISSUES
      const querySnapshot = await getDocsPreferCache(
        query(
          collection(db, "Users", clinics[z].owner_uid, "Doctors"),
          limit(DEFAULT_QUERY_LIMIT)
        )
      );
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        logDebug(doc.id, "doctorpushed=====>", doc.data());
        let data = doc.data();
        let ratingMedia = getRating(data.doctorReviews)

        logDebug("test here rating...")
        logDebug(ratingMedia)

        data.ratingMedia = ratingMedia;
        data.numberOfReviews = data.doctorReviews.length;
        clinicDoctors.push(data);
      });

      clinics[z].clinicDoctors = [...clinicDoctors];
    }

    logDebug(
      "END... startLoopQueryClinics",
      Date.now() / 1000 - startLoopQueryClinics
    );
  } catch (error) {
    logDebug("error on...retrieveClinicsForPatientDashboard....", error);
  }

  return clinics;
};

export const retrieveDoctorsForPatientDashboard = async (city) => {
  let allDoctors = [];
  try {
    const doctorsQuery = query(
      collection(db, "Doctors"),
      where("clinicCity", "==", city),
      limit(DEFAULT_QUERY_LIMIT)
    );
    const querySnapshot = await getDocsPreferCache(doctorsQuery);

    const doctorPromises = querySnapshot.docs.map(async (doc) => {
      let actualLoopDoctor = doc.data();
      let sum = 0;
      let ratingMedia;

      const doctorReviews = Array.isArray(actualLoopDoctor.doctorReviews)
        ? actualLoopDoctor.doctorReviews
        : [];
      for (let i = 0; i < doctorReviews.length; i++) {
        sum += doctorReviews[i].rating;
      }
      ratingMedia = doctorReviews.length ? sum / doctorReviews.length : 0;

      let data = actualLoopDoctor;
      data.ratingMedia = ratingMedia;
      data.numberOfReviews = doctorReviews.length;
      let clinicAppointmentsUnregistered = [];
      let clinicAppointments = [];

      const appointmentUnregisteredColRef = collection(
        db,
        "Doctors",
        actualLoopDoctor.doctorId,
        "clinicAppointmentsUnregisteredDocCol"
      );
      const appointmentColRef = collection(
        db,
        "Doctors",
        actualLoopDoctor.doctorId,
        "clinicAppointmentsDocCol"
      );

      const appointmentUnregisteredColExists = await checkCollectionExists(
        appointmentUnregisteredColRef
      );
      const appointmentColExists = await checkCollectionExists(
        appointmentColRef
      );

      if (appointmentUnregisteredColExists) {
        logDebug("appointmentUnregisteredColExists.......");
        const appointmentSnapshotUnregistered = await getDocsPreferCache(
          query(appointmentUnregisteredColRef, limit(APPOINTMENTS_PAGE_LIMIT))
        );
        appointmentSnapshotUnregistered.forEach((appointmentDoc) => {
          clinicAppointmentsUnregistered.push(appointmentDoc.data());
        });
      }

      if (appointmentColExists) {
        logDebug("appointmentColExists.......");

        const appointmentSnapshot = await getDocsPreferCache(
          query(appointmentColRef, limit(APPOINTMENTS_PAGE_LIMIT))
        );
        appointmentSnapshot.forEach((appointmentDoc) => {
          clinicAppointments.push(appointmentDoc.data());
        });
      }

      data.clinicAppointmentsUnregistered = clinicAppointmentsUnregistered;
      data.clinicAppointments = clinicAppointments;

      return data;
    });

    allDoctors = await Promise.all(doctorPromises);
  } catch (error) {
    logDebug("Error in retrieveDoctorsForPatientDashboard:", error);
  }

  return allDoctors;
};

// GET ALL THE CLINICS FOR THE PATIENT IN SEARCH DASHBOARD SCREEN

// COMMENTED OUT FOR CREATING ANOTHER FUNCTION ->
// export const retrieveClinicsForPatientDashboard = async () => {

//   auth.currentUser.uid;

//   const q = query(collection(db, 'Users'));

//   const querySnapshot = await getDocsPreferCache(q);
//   let clinics = [];

//   querySnapshot.forEach(async doc => {
//     // logDebug(doc);
//     // doc.data() is never undefined for query doc snapshots
//     let sum = 0;
//     let ratingMedia = 0;
//     if (doc.data().isClinic) {
//       let clinicImages = []
//       for(let i =0; i < doc.data().clinicReviews.length; i ++){
//         // logDebug("--------------------------",doc.data())
//         sum = sum + doc.data().clinicReviews[i].rating;
//       }
//       ratingMedia = sum / doc.data().clinicReviews.length;
//       // logDebug("ratingMedia...", ratingMedia)
//       let data = doc.data();
//       data.ratingMedia = ratingMedia;
//       data.numberOfReviews = doc.data().clinicReviews.length;
//       // logDebug("data...", data);
//       sum = 0;
//       ratingMedia = 0;

//       clinics.push(data);
//       // logDebug("data...", data)
//     }
//   });

//   for(let z = 0;  z < clinics.length ; z ++){
//     let clinicImages = [];
//     let clinicMainImage;

//     for(let i=0; i < clinics[z].clinicImages.length; i ++){
//       const reference = ref(
//         storage,
//         `images/clinics/${clinics[z].owner_uid}/${clinics[z].clinicImages[i].img}`
//       );
//       await getDownloadURL(reference).then((x) => {
//         // clinicImages.push(x);
//         clinicImages.push({img: x, isMainImg: clinics[z].clinicImages[i].isMainImg})
//         if(clinics[z].clinicImages[i].isMainImg === true){
//           clinicMainImage={img: x, isMainImg: clinics[z].clinicImages[i].isMainImg}
//         }
//       })

//     }
//     clinics[z].clinicImages = clinicImages
//     clinics[z].clinicMainImage = clinicMainImage
//   }

//   let start = Date. now() / 1000
//   logDebug("-----------------------------------------")
//   logDebug("STARTTTT retrieveClinicDoctors LOOP")
//   logDebug("LOOP LENGTH", clinics.length)

//   for (let i = 0; i < clinics.length; i++) {
//     logDebug("LOOP NUMBER", i)
// const clinicDoctors = await retrieveClinicDoctors(clinics[i].owner_uid);

//     for(let z=0; z < clinicDoctors.clinicDoctors.length; z ++){

//       let doctorImg = "";
//       let oldDoctorImg = "";
//       const reference = ref(
//         storage,
//         `images/clinics/${clinics[i].owner_uid}/doctors/${clinicDoctors.clinicDoctors[z].doctorImg}`
//       );
//       await getDownloadURL(reference).then((x) => {
//         // clinicImages.push(x);
//         oldDoctorImg = clinicDoctors.clinicDoctors[z].doctorImg;
//         doctorImg = x

//       })

//       clinicDoctors.clinicDoctors[z].doctorImg = doctorImg
//       clinicDoctors.clinicDoctors[z].oldDoctorImg = oldDoctorImg
//     }
//     clinics[i].clinicsDoctors = clinicDoctors;

//   }

//   logDebug("END retrieveClinicDoctors LOOP", Date.now() / 1000 - start )
//   logDebug("-----------------------------------------")

//   let clinicDoctors = [];

//   return clinics;
// };
// COMMENTED OUT FOR CREATING ANOTHER FUNCTION <-

// GET ALL THE DOCTORS FROM THE CLINIC
export const retrieveClinicDoctors = async (clinicId?: any) => {
  let clinicDoctors = [];
  let querySnapshot;
  let docRef;
  let docSnap;

  logDebug(clinicId);
  if (clinicId) {
    querySnapshot = await getDocsPreferCache(
      query(
        collection(db, "Users", clinicId, "Doctors"),
        limit(DEFAULT_QUERY_LIMIT)
      )
    );
    docRef = doc(db, "Users", clinicId);
  } else {
    querySnapshot = await getDocsPreferCache(
      query(
        collection(db, "Users", auth.currentUser.uid, "Doctors"),
        limit(DEFAULT_QUERY_LIMIT)
      )
    );
    docRef = doc(db, "Users", auth.currentUser.uid);
  }

  try {
    docSnap = await getDocPreferCache(docRef);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // logDebug()
      clinicDoctors.push(doc.data());
    });

    for (let i = 0; i < clinicDoctors.length; i++) {
      if (clinicId) {
        let doctorImage = "";
        let oldDoctorImage = "";
        const reference = ref(
          storage,
          `images/clinics/${clinicId}/doctors/${clinicDoctors[i].doctorImg}`
        );
        // await getDownloadURL(reference).then((x) => {
        //   // clinicImages.push(x);
        //   doctorImage = x;
        // })
        // logDebug("doctorImage...", doctorImage)
        oldDoctorImage = clinicDoctors[i].doctorImg;
        clinicDoctors[i].doctorImg = clinicDoctors[i].doctorImgURI;
        clinicDoctors[i].oldDoctorImage = oldDoctorImage;

        clinicDoctors[i].clinicAddressLocation =
          docSnap.data().clinicAddressLocation;
      } else {
        let doctorImage = "";
        let oldDoctorImage = "";

        // const reference = ref(
        //   storage,
        //   `images/clinics/${auth.currentUser.uid}/doctors/${clinicDoctors[i].doctorImg}`
        //   );
        //   await getDownloadURL(reference).then((x) => {
        //     // clinicImages.push(x);
        //     doctorImage = x;
        //   })

        // logDebug("doctorImage...", doctorImage)
        oldDoctorImage = clinicDoctors[i].doctorImg;
        clinicDoctors[i].doctorImg = clinicDoctors[i].doctorImgURI;
        clinicDoctors[i].oldDoctorImage = oldDoctorImage;

        clinicDoctors[i].clinicAddressLocation =
          docSnap.data().clinicAddressLocation;
      }
    }
  } catch (err) {
    logDebug("Error retrieveClinicDoctors...", err);
  }

  return clinicDoctors;
};

export const retrieveClinicPatients = async (clinicId?) => {
  try {
    let finalPatients = [];

    if (clinicId) {
      const clinicPatientsRef = collection(
        db,
        "Users",
        clinicId,
        "clinicsPatients"
      );
      const clinicPatientsUnregisteredRef = collection(
        db,
        "Users",
        clinicId,
        "clinicsPatientsUnregistered"
      );

      const [clinicPatientsSnapshot, clinicPatientsUnregisteredSnapshot] =
        await Promise.all([
          getDocsPreferCache(
            query(clinicPatientsRef, limit(DEFAULT_QUERY_LIMIT))
          ),
          getDocsPreferCache(
            query(clinicPatientsUnregisteredRef, limit(DEFAULT_QUERY_LIMIT))
          ),
        ]);

      if (!clinicPatientsSnapshot.empty) {
        const queryClinicsPatients = clinicPatientsSnapshot.docs.map((doc) =>
          doc.data()
        );
        finalPatients = finalPatients.concat(queryClinicsPatients);
      } else {
        logDebug('Colecția "clinicsPatients" nu există sau este goală.');
      }

      if (!clinicPatientsUnregisteredSnapshot.empty) {
        const queryClinicsPatientsUnregistered =
          clinicPatientsUnregisteredSnapshot.docs.map((doc) => doc.data());
        finalPatients = finalPatients.concat(queryClinicsPatientsUnregistered);
      } else {
        logDebug(
          'Colecția "clinicsPatientsUnregistered" nu există sau este goală.'
        );
      }
    } else {
      const userClinicsPatientsRef = collection(
        db,
        "Users",
        auth.currentUser.uid,
        "clinicsPatients"
      );
      const userClinicsPatientsUnregisteredRef = collection(
        db,
        "Users",
        auth.currentUser.uid,
        "clinicsPatientsUnregistered"
      );

      const [
        userClinicsPatientsSnapshot,
        userClinicsPatientsUnregisteredSnapshot,
      ] = await Promise.all([
        getDocsPreferCache(
          query(userClinicsPatientsRef, limit(DEFAULT_QUERY_LIMIT))
        ),
        getDocsPreferCache(
          query(userClinicsPatientsUnregisteredRef, limit(DEFAULT_QUERY_LIMIT))
        ),
      ]);

      if (!userClinicsPatientsSnapshot.empty) {
        const queryUserClinicsPatients = userClinicsPatientsSnapshot.docs.map(
          (doc) => doc.data()
        );
        finalPatients = finalPatients.concat(queryUserClinicsPatients);
      } else {
        logDebug('Colecția "clinicsPatients" nu există sau este goală.');
      }

      if (!userClinicsPatientsUnregisteredSnapshot.empty) {
        const queryUserClinicsPatientsUnregistered =
          userClinicsPatientsUnregisteredSnapshot.docs.map((doc) => doc.data());
        finalPatients = finalPatients.concat(
          queryUserClinicsPatientsUnregistered
        );
      } else {
        logDebug(
          'Colecția "clinicsPatientsUnregistered" nu există sau este goală.'
        );
      }
    }

    logDebug("finalPatients:", finalPatients);
    return finalPatients;
  } catch (err) {
    logDebug("Eroare în retrieveClinicPatients:", err);
    return [];
  }
};

export const retrieveInfoAboutPatientsFromClinic = async (
  phoneN,
  patientId
) => {
  let patients = [];
  let clinicsById = [];
  let patientInfo;
  let aboutDoctor;
  let doctorId;
  let doctorImg;
  let clinicId;
  let clinicAddressLocation;
  let clinicInfoData;
  let clinicPhoneNumber;
  let clinicImages = [];
  let appointmentsArr = [];
  let clinicHistoryArr = [];
  let booleanCheckHasAnyApp = [];

  let patientPhoneNumber;

  const clinicsQuery = query(
    collection(db, "Users"),
    where("isClinic", "==", true),
    limit(DEFAULT_QUERY_LIMIT)
  );
  let querySnapshot = await getDocsPreferCache(clinicsQuery);
  if (querySnapshot.empty) {
    const fallbackQuery = query(
      collection(db, "Users"),
      limit(DEFAULT_QUERY_LIMIT)
    );
    querySnapshot = await getDocsPreferCache(fallbackQuery);
  }
  querySnapshot.forEach((doc) => {
    if (isClinicLike(doc.data())) {
      logDebug(doc.data());
      clinicsById.push(doc.data());
    }
  });

  for (let i = 0; i < clinicsById.length; i++) {
    logDebug("------START SEARCH IN CLINIC----------");
    // logDebug("clinicsById[i]...", clinicsById[i].phoneNumber)
    clinicPhoneNumber = clinicsById[i].phoneNumber;
    clinicInfoData = clinicsById[i].clinicInfoData;
    clinicAddressLocation = clinicsById[i].clinicAddressLocation;
    clinicId = clinicsById[i].owner_uid;

    clinicImages = clinicsById[i].clinicImages;

    let booleanCheckIsInClinics = [];

    const querySnapshotDoctors = await getDocsPreferCache(
      query(
        collection(db, "Users", clinicId, "Doctors"),
        limit(DEFAULT_QUERY_LIMIT)
      )
    );
    querySnapshotDoctors.forEach((doc) => {
      logDebug("------START SEARCH IN DOCTOR----------");
      // logDebug("info about doctor...", doc.data())

      aboutDoctor = doc.data().doctorInfoData;
      doctorId = doc.data().doctorId;
      doctorImg = doc.data().doctorImg;

      const clinicAppointments = Array.isArray(doc.data().clinicAppointments)
        ? doc.data().clinicAppointments
        : [];
      if (clinicAppointments.length > 0) {
        clinicAppointments.forEach((appointment) => {
          logDebug("------START SEARCH IN DOCTOR APPOINTMENT----------");
          if (appointment.patientInfo) {
            if (appointment.patientInfo.phoneNumber === phoneN) {
              booleanCheckIsInClinics.push(true);
              patientInfo = appointment;
              patientPhoneNumber = appointment.patientInfo.phoneNumber;
              // const appointmentInfo = {patientId, doctorId, doctorImg, appointmentId: patientInfo.appointmentId, clinicId, daySelected: patientInfo.daySelected,  isApproved: patientInfo.isApproved, timeSelected:{endtime: patientInfo.timeSelected.endtime, starttime: patientInfo.timeSelected.starttime}}
              const appointmentInfo = {
                patientId,
                doctorId,
                appointmentId: patientInfo.appointmentId,
                clinicId,
                daySelected: patientInfo.daySelected,
                isApproved: patientInfo.isApproved,
                timeSelected: {
                  endtime: patientInfo.timeSelected.endtime,
                  starttime: patientInfo.timeSelected.starttime,
                },
              };
              appointmentsArr.push(appointmentInfo);
            } else {
              booleanCheckIsInClinics.push(false);
            }
          }
        });
      }
    });

    if (booleanCheckIsInClinics.includes(true)) {
      // const clinicHistoryInfo = {clinicId}
      clinicHistoryArr.push(clinicId);
      booleanCheckHasAnyApp.push(true);
    } else {
      booleanCheckHasAnyApp.push(false);
    }
  }

  let basicInfoData;
  if (patientInfo) {
    basicInfoData = patientInfo.patientInfo.basicInfoData;
  }
  // let phoneNumber = patientInfo.phoneNumber
  // logDebug(basicInfoData)
  // logDebug(appointment.patientInfo.phoneNumber)

  // ----- START CHANGE APPOINTMENT LOOK IN DOCTORS COLLECTION AND SUBCOLLECTION

  for (let i = 0; i < appointmentsArr.length; i++) {
    // const appointmentInfo = {patientId, doctorId, appointmentId: patientInfo.appointmentId, clinicId, daySelected: patientInfo.daySelected,  isApproved: patientInfo.isApproved, timeSelected:{endtime: patientInfo.timeSelected.endtime, starttime: patientInfo.timeSelected.starttime}}

    //SUBCOLLECTION
    const docRef = doc(
      db,
      "Users",
      appointmentsArr[i].clinicId,
      "Doctors",
      appointmentsArr[i].doctorId
    );
    const docSnap = await getDocPreferCache(docRef);

    if (docSnap.exists()) {
      let docAppointments = docSnap.data().clinicAppointments;
      // logDebug("Document data:", docAppointments);
      for (let z = 0; z < docAppointments.length; z++) {
        if (
          docAppointments[z].appointmentId === appointmentsArr[i].appointmentId
        ) {
          docAppointments[z] = appointmentsArr[i].patientId;
        }
      }
    } else {
      // docSnap.data() will be undefined in this case
      logDebug("No such document!");
    }

    //COLLECTION
    const docRefDoc = doc(db, "Doctors", appointmentsArr[i].doctorId);
    const docSnapDoc = await getDocPreferCache(docRefDoc);

    if (docSnapDoc.exists()) {
      let docAppointments = docSnapDoc.data().clinicAppointments;
      // logDebug("Document data:", docAppointments);
      for (let z = 0; z < docAppointments.length; z++) {
        if (
          docAppointments[z].appointmentId === appointmentsArr[i].appointmentId
        ) {
          docAppointments[z] = appointmentsArr[i].patientId;
        }
      }
    } else {
      // docSnap.data() will be undefined in this case
      logDebug("No such document!");
    }
  }

  if (booleanCheckHasAnyApp.includes(true)) {
    return {
      basicInfoData,
      appointmentsArr,
      clinicHistoryArr,
      patientPhoneNumber,
    };
  } else {
    return false;
  }

  // } else {
  //   return booleanCheck
  // }
};

export const retrieveClinicMessages = async (clinicsPatient) => {
  let messages = [];

  const collectionRef = collection(
    db,
    "Chats",
    `${auth.currentUser.uid}-${clinicsPatient.owner_uid}`,
    "Messages"
  );

  const q = query(
    collectionRef,
    orderBy("createdAt", "desc"),
    limit(MESSAGE_PAGE_LIMIT)
  );

  const querySnapshot = await getDocsPreferCache(q);

  querySnapshot.forEach((doc) => {
    messages.push(doc.data());
  });

  return messages;
};


export const retrievePatientClinicHistory = async () => {
  const citiesRef = collection(db, "cities");

  // Create a query against the collection.
  const q = query(
    citiesRef,
    where("state", "==", "CA"),
    limit(DEFAULT_QUERY_LIMIT)
  );
  
}

export const retrievePatientData = async (guestDetails) => {
  let phoneNumber;
  let email;
  let hasProfile;
  let isClinic;
  let isPatient;
  let owner_uid;
  let patientImage;
  let oldPatientImage = "";
  let basicInfoData;

  let termsConditions;

  try {
    const docRef = doc(db, "Users", auth.currentUser.uid);
    const docSnap = await getDocPreferCache(docRef);
    if (docSnap.exists()) {
      logDebug(docSnap.data().patientImg);
      if (docSnap.data().patientImg) {
        oldPatientImage = docSnap.data().patientImg;
        patientImage = docSnap.data().patientImgURI;
      }

      phoneNumber = docSnap.data().phoneNumber;
      email = docSnap.data().email;
      hasProfile = docSnap.data().hasProfile;
      isClinic = docSnap.data().isClinic;
      isPatient = docSnap.data().isPatient;
      owner_uid = docSnap.data().owner_uid;
      basicInfoData = docSnap.data().basicInfoData
        ? docSnap.data().basicInfoData
        : "";
      termsConditions = docSnap.data().termsConditions
        ? docSnap.data().termsConditions
        : "";
    } else {
      logDebug("No such document!");
    }
  } catch (err) {
    logDebug("Error retrievePatientData...", err);
  }

  let obj = {
    phoneNumber,
    email,
    hasProfile,
    isClinic,
    isPatient,
    owner_uid,
    basicInfoData,
    termsConditions,
    patientImage,
    oldPatientImage,
  };

  if (obj.isPatient === undefined && guestDetails) {
    return guestDetails;
  } else {
    return obj;
  }
};

export const retrievePatientAppointments = async (
  getAllUpcomming,
  getAllPast
) => {
  let myAppointments = {};
  let upcommingAppointments = [];
  let pastAppointments = [];

  // const docRef = doc(db, 'Users', auth.currentUser.uid);
  // const docSnap = await getDocPreferCache(docRef);

  // logDebug(moment.utc().valueOf())
  let currentTime = moment().valueOf();
  logDebug("test....");
  logDebug(moment(currentTime).format("DD MM YYYY hh:mm"));
  try {
    // Query the first page of docs
    const docRef = collection(
      db,
      "Users",
      auth.currentUser.uid,
      "myAppointments"
    );
    let qUpcomming;
    let qPast;

    if (getAllUpcomming) {
      qUpcomming = query(
        docRef,
        orderBy("dateToQuery"),
        where("dateToQuery", ">", currentTime),
        limit(APPOINTMENTS_PAGE_LIMIT)
      );
      qPast = query(
        docRef,
        orderBy("dateToQuery"),
        where("dateToQuery", "<", currentTime),
        limit(3)
      );
    } else if (getAllPast) {
      qUpcomming = query(
        docRef,
        orderBy("dateToQuery"),
        where("dateToQuery", ">", currentTime),
        limit(3)
      );
      qPast = query(
        docRef,
        orderBy("dateToQuery"),
        where("dateToQuery", "<", currentTime),
        limit(APPOINTMENTS_PAGE_LIMIT)
      );
    } else {
      qUpcomming = query(
        docRef,
        orderBy("dateToQuery"),
        where("dateToQuery", ">", currentTime),
        limit(3)
      );
      qPast = query(
        docRef,
        orderBy("dateToQuery"),
        where("dateToQuery", "<", currentTime),
        limit(3)
      );
    }

    const querySnapshotUpcomming = await getDocsPreferCache(qUpcomming);
    querySnapshotUpcomming.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // logDebug(doc.id, " =====================> ", doc.data());
      upcommingAppointments.push(doc.data());
    });

    const querySnapshotPast = await getDocsPreferCache(qPast);
    querySnapshotPast.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // logDebug(doc.id, " =====================> ", doc.data());
      pastAppointments.push(doc.data());
    });

    if (pastAppointments.length > 0) {
      let patientInfo;

      //GET PATIENT INFO
      const docRefPatient = doc(db, "Users", pastAppointments[0].patientId);
      const docSnapPatient = await getDocPreferCache(docRefPatient);

      if (docSnapPatient.exists()) {
        delete docSnapPatient.data().clinicsHistory;
        delete docSnapPatient.data().pastAppointments;
        patientInfo = docSnapPatient.data();
      }

      for (let i = 0; i < pastAppointments.length; i++) {
        const start = Date.now();
        logDebug("STart....");

        pastAppointments[i].patientInfo = patientInfo;

        //GET DOCTOR INFO

        const docRefDoctor = doc(db, "Doctors", pastAppointments[i].doctorId);
        const docSnapDoctor = await getDocPreferCache(docRefDoctor);

        if (docSnapDoctor.exists()) {
          let clinicAddressLocation =
            docSnapDoctor.data().clinicAddressLocation;

          pastAppointments[i].doctorInfo = docSnapDoctor.data();
        }

        //GET CLINIC INFO

        const docRefClinic = doc(db, "Users", pastAppointments[i].clinicId);
        const docSnapClinic = await getDocPreferCache(docRefClinic);

        if (docSnapClinic.exists()) {
          pastAppointments[i].clinicInfo = docSnapClinic.data();
        }

        const end = Date.now();
        logDebug(`Execution time GET CLINIC INFO: ${end - start} ms`);
      }
    }

    if (upcommingAppointments.length > 0) {
      let patientInfo;

      //GET PATIENT INFO
      const docRefPatient = doc(
        db,
        "Users",
        upcommingAppointments[0].patientId
      );
      const docSnapPatient = await getDocPreferCache(docRefPatient);

      if (docSnapPatient.exists()) {
        delete docSnapPatient.data().clinicsHistory;
        delete docSnapPatient.data().upcommingAppointments;
        patientInfo = docSnapPatient.data();
      }

      for (let i = 0; i < upcommingAppointments.length; i++) {
        const start = Date.now();
        logDebug("STart....");

        upcommingAppointments[i].patientInfo = patientInfo;

        //GET DOCTOR INFO

        const docRefDoctor = doc(
          db,
          "Doctors",
          upcommingAppointments[i].doctorId
        );
        const docSnapDoctor = await getDocPreferCache(docRefDoctor);

        if (docSnapDoctor.exists()) {
          let clinicAddressLocation =
            docSnapDoctor.data().clinicAddressLocation;

          upcommingAppointments[i].doctorInfo = docSnapDoctor.data();
        }

        //GET CLINIC INFO

        const docRefClinic = doc(
          db,
          "Users",
          upcommingAppointments[i].clinicId
        );
        const docSnapClinic = await getDocPreferCache(docRefClinic);

        if (docSnapClinic.exists()) {
          upcommingAppointments[i].clinicInfo = docSnapClinic.data();
        }

        const end = Date.now();
        logDebug(`Execution time GET CLINIC INFO: ${end - start} ms`);
      }
    }

    myAppointments = { pastAppointments, upcommingAppointments };
    // Set the "capital" field of the city 'DC'

    logDebug("success.....");
    logDebug(myAppointments);
    return myAppointments;
  } catch (err) {
    logDebug("Error retrievePatientAppointments...", err);
  }
};

export const retrieveClinicAppointments = async () => {
  try {
    let clinicAppointments = [];

    const docRef = doc(db, "Users", auth.currentUser.uid);
    const docSnap = await getDocPreferCache(docRef);

    const doctorsRef = collection(db, "Doctors");
    const q = query(
      doctorsRef,
      where("clinicId", "==", auth.currentUser.uid),
      limit(DEFAULT_QUERY_LIMIT)
    );
    const querySnapshotDocs = await getDocsPreferCache(q);

    for (const docLoops of querySnapshotDocs.docs) {
      logDebug(docLoops.id, " => ", docLoops.data());

      const clinicAppointmentsUnregisteredRef = collection(
        db,
        "Doctors",
        docLoops.id,
        "clinicAppointmentsUnregisteredDocCol"
      );
      const clinicAppointmentsRef = collection(
        db,
        "Doctors",
        docLoops.id,
        "clinicAppointments"
      );

      const [
        clinicAppointmentsUnregisteredSnapshot,
        clinicAppointmentsSnapshot,
      ] = await Promise.all([
        getDocsPreferCache(
          query(clinicAppointmentsUnregisteredRef, limit(APPOINTMENTS_PAGE_LIMIT))
        ),
        getDocsPreferCache(
          query(clinicAppointmentsRef, limit(APPOINTMENTS_PAGE_LIMIT))
        ),
      ]);

      if (!clinicAppointmentsUnregisteredSnapshot.empty) {
        clinicAppointmentsUnregisteredSnapshot.forEach(async (docLoop) => {
          logDebug(docLoop.id, " ========ss> ", docLoop.data());

          const clinicAppointmentsUnregistered = docLoop.data();
          logDebug("test mere here...");
          logDebug(clinicAppointmentsUnregistered);

          const doctorRef = doc(
            db,
            "Users",
            auth.currentUser.uid,
            "Doctors",
            clinicAppointmentsUnregistered.doctorId
          );
          const doctorSnap = await getDocPreferCache(doctorRef);
          if (doctorSnap.exists()) {
            delete doctorSnap.data().clinicAppointments;
            clinicAppointmentsUnregistered.doctorInfo = doctorSnap.data();
          }
          logDebug("to push-----");
          logDebug(clinicAppointmentsUnregistered);
          clinicAppointments.push(clinicAppointmentsUnregistered);
        });
      } else {
        logDebug('Colecția "clinicAppointmentsUnregistered" este goală.');
      }

      if (!clinicAppointmentsSnapshot.empty) {
        clinicAppointmentsSnapshot.forEach(async (docLoop) => {
          logDebug(docLoop.id, " => ", docLoop.data());

          const clinicAppointment = docLoop.data();

          // GET INFO ABOUT PATIENT
          const patientRef = doc(db, "Users", clinicAppointment.patientId);
          const patientSnap = await getDocPreferCache(patientRef);
          if (patientSnap.exists()) {
            delete patientSnap.data().clinicsHistory;
            delete patientSnap.data().myAppointments;
            clinicAppointment.patientInfo = patientSnap.data();

            const reference = ref(
              storage,
              `images/patients/${patientSnap.data().patientImg}`
            );
            const downloadURL = await getDownloadURL(reference);
            clinicAppointment.patientInfo.patientImg = downloadURL;
          }

          // GET INFO ABOUT DOCTOR
          const doctorRef = doc(
            db,
            "Users",
            auth.currentUser.uid,
            "Doctors",
            clinicAppointment.doctorId
          );
          const doctorSnap = await getDocPreferCache(doctorRef);
          if (doctorSnap.exists()) {
            delete doctorSnap.data().clinicAppointments;
            clinicAppointment.doctorInfo = doctorSnap.data();
          }

          clinicAppointments.push(clinicAppointment);
        });
      } else {
        logDebug('Colecția "clinicAppointments" este goală.');
      }
    }
    logDebug("clinicAppointments----");
    logDebug(clinicAppointments);
    return {
      clinicAppointments,
    };
  } catch (err) {
    logDebug("Error retrieveClinicAppointments...", err);
  }
};

export const retrieveApprovedClinicAppointments = async () => {
  let approvedClinicAppointments = [];
  let todayAppointments = [];
  let upcommingAppointments = [];

  try {
    const doctorsRef = collection(db, "Doctors");
    const q = query(
      doctorsRef,
      where("clinicId", "==", auth.currentUser.uid),
      limit(DEFAULT_QUERY_LIMIT)
    );
    const querySnapshotDocs = await getDocsPreferCache(q);

    for (const docLoops of querySnapshotDocs.docs) {
      logDebug(docLoops.id, " => ", docLoops.data());

      const clinicAppointmentsUnregisteredRef = collection(
        db,
        "Doctors",
        docLoops.id,
        "clinicAppointmentsUnregisteredDocCol"
      );

      const clinicAppointmentsUnregisteredSnapshot = await getDocsPreferCache(
        query(
          clinicAppointmentsUnregisteredRef,
          limit(APPOINTMENTS_PAGE_LIMIT)
        )
      );

      if (!clinicAppointmentsUnregisteredSnapshot.empty) {
        clinicAppointmentsUnregisteredSnapshot.forEach(async (docLoop) => {
          logDebug(docLoop.id, " ========ss> ", docLoop.data());

          const clinicAppointmentsUnregistered = docLoop.data();
          logDebug("test mere here...");
          logDebug(clinicAppointmentsUnregistered);

          const doctorRef = doc(
            db,
            "Users",
            auth.currentUser.uid,
            "Doctors",
            clinicAppointmentsUnregistered.doctorId
          );
          const doctorSnap = await getDocPreferCache(doctorRef);
          if (doctorSnap.exists()) {
            delete doctorSnap.data().clinicAppointments;
            clinicAppointmentsUnregistered.doctorInfo = doctorSnap.data();
          }

          if (clinicAppointmentsUnregistered.isApproved) {
            const currentDate = new Date();
            const appointmentDateParts =
              clinicAppointmentsUnregistered.daySelected.split("-");
            const appointmentDate = new Date(
              parseInt(appointmentDateParts[2]),
              parseInt(appointmentDateParts[1]) - 1,
              parseInt(appointmentDateParts[0])
            );

            logDebug("to push-----");
            logDebug(appointmentDate);
            logDebug(currentDate);
            approvedClinicAppointments.push(clinicAppointmentsUnregistered);

            if (appointmentDate > currentDate) {
              logDebug("is greater...");
              logDebug(clinicAppointmentsUnregistered);
              upcommingAppointments.push(clinicAppointmentsUnregistered);
            } else if (
              appointmentDate.toDateString() === currentDate.toDateString()
            ) {
              todayAppointments.push(clinicAppointmentsUnregistered);
            }
          }
        });
      } else {
        logDebug('Colecția "clinicAppointmentsUnregistered" este goală.');
      }
    }

    logDebug("approvedClinicAppointments----");
    logDebug(approvedClinicAppointments);
    logDebug("upcommingAppointments----");
    logDebug(upcommingAppointments);
    logDebug("todayAppointments----");
    logDebug(todayAppointments);

    return {
      approvedClinicAppointments,
      upcommingAppointments,
      todayAppointments,
    };
  } catch (err) {
    logDebug("Error retrieveClinicAppointments...", err);
  }
};

export const retrieveApprovedDoctorAppointments = async (
  doctorId,
  doctorTimes,
  allDays
) => {
  let allDoctorAppointments = [];
  let allDoctorAppointmentsUnregistered = [];
  let approvedDoctorAppointments = [];
  let todayAppointments = [];
  let upcommingAppointments = [];
  let doctorCalendarTimes = doctorTimes;

  // const docRef = doc(db, 'Users', auth.currentUser.uid, "Doctors", doctorId);

  try {
    logDebug("Start....this");
    const clinicAppointmentsRef = collection(
      db,
      "Users",
      auth.currentUser.uid,
      "Doctors",
      doctorId,
      "clinicAppointments"
    );
    const clinicAppointmentsUnregisteredRef = collection(
      db,
      "Users",
      auth.currentUser.uid,
      "Doctors",
      doctorId,
      "clinicAppointmentsUnregistered"
    );

    const [clinicAppointments, clinicAppointmentsUnregistered] =
      await Promise.all([
        getDocsPreferCache(
          query(clinicAppointmentsRef, limit(APPOINTMENTS_PAGE_LIMIT))
        ),
        getDocsPreferCache(
          query(
            clinicAppointmentsUnregisteredRef,
            limit(APPOINTMENTS_PAGE_LIMIT)
          )
        ),
      ]);

    if (!clinicAppointments.empty) {
      const queryDoctorAppointments = clinicAppointments.docs.map((doc) =>
        doc.data()
      );
      allDoctorAppointments = allDoctorAppointments.concat(
        queryDoctorAppointments
      );
    } else {
      logDebug('Colecția "clinicAppointments" nu există sau este goală.');
    }

    if (!clinicAppointmentsUnregistered.empty) {
      const queryDoctorAppointmentsUnregistered =
        clinicAppointmentsUnregistered.docs.map((doc) => doc.data());
      logDebug("test before error....");
      logDebug(queryDoctorAppointmentsUnregistered);
      allDoctorAppointmentsUnregistered =
        allDoctorAppointmentsUnregistered.concat(
          queryDoctorAppointmentsUnregistered
        );
    } else {
      logDebug(
        'Colecția "clinicAppointmentsUnregistered" nu există sau este goală.'
      );
    }

    // allDoctorAppointments = docSnap.data().clinicAppointments;

    // allDoctorAppointmentsUnregistered = docSnap.data().clinicAppointmentsUnregistered;

    for (let i = 0; i < allDoctorAppointments.length; i++) {
      let patientInfo;
      if (allDoctorAppointments[i].isApproved) {
        const patientRef = doc(db, "Users", allDoctorAppointments[i].patientId);
        const patientSnap = await getDocPreferCache(patientRef);
        if (patientSnap.exists()) {
          patientInfo = patientSnap.data();
          delete patientInfo.clinicsHistory;
          delete patientInfo.myAppointments;
          const reference = ref(
            storage,
            `images/patients/${patientInfo.patientImg}`
          );
          await getDownloadURL(reference).then((x) => {
            // clinicImages.push(x);
            patientInfo.patientImg = x;
          });

          allDoctorAppointments[i].patientInfo = patientInfo;
        }
        approvedDoctorAppointments.push(allDoctorAppointments[i]);
        logDebug("YES....");
      }
    }

    for (let i = 0; i < allDoctorAppointmentsUnregistered.length; i++) {
      if (allDoctorAppointmentsUnregistered[i].isApproved) {
        allDoctorAppointmentsUnregistered[i].isUnregistered = true;
        approvedDoctorAppointments.push(allDoctorAppointmentsUnregistered[i]);
      }
    }

    const relativeToUserDate = moment().local().format("DD-MM-YYYY");
    const approvedAppointments = approvedDoctorAppointments;

    for (let i = 0; i < approvedAppointments.length; i++) {
      // if (approvedAppointments[i].daySelected === '07-04-2023') {
      if (approvedAppointments[i].daySelected === relativeToUserDate) {
        todayAppointments.push(approvedAppointments[i]);
      } else upcommingAppointments.push(approvedAppointments[i]);
    }

    // logDebug('todaydAppointments...', todayAppointments);
    // logDebug('upcommingAppointments...', upcommingAppointments);

    logDebug("-----------------START HERE------------------");
    for (const date in doctorCalendarTimes) {
      logDebug("...date.....", date);
      const newDate = moment(date).format("DD-MM-YYYY");
      const timeSPackCheck = [];
      for (let i = 0; i < approvedDoctorAppointments.length; i++) {
        logDebug(
          "------approvedDoctorAppointments[i].daySelected------",
          approvedDoctorAppointments[i].daySelected
        );
        logDebug("------newDate------", newDate);
        if (newDate === approvedDoctorAppointments[i].daySelected) {
          timeSPackCheck.push(approvedDoctorAppointments[i].timeSelected);
          // doctorCalendarTimes[date].selectedColor = 'red';
        }
      }
      logDebug(
        "---------------timeSPackCheck----------------",
        timeSPackCheck
      );

      for (let i = 0; i < allDays.length; i++) {
        // logDebug("---------------allDays----------------", allDays[i])
        // logDebug("doctorCalendarTimes[i]...", doctorCalendarTimes[i])
        if (timeSPackCheck.length === allDays[i].timeSPack.length) {
          logDebug("YASSS");
          doctorCalendarTimes[date].selectedColor = "red";
        }
      }
    }
  } catch (err) {
    logDebug(
      "Error APPROVED CLINIC APPOINTMENTS RETRIEVE FROM FIREBASE...",
      err
    );
  }

  // setChangedDays(doctorTimes);

  // logDebug("-----------doctorCalendarTimes/////", doctorCalendarTimes)

  return {
    doctorCalendarTimes,
    approvedDoctorAppointments,
    upcommingAppointments,
    todayAppointments,
  };
};

export const retrieveClinicsOfPatient = async () => {
  let clinics = [];

  const docRef = doc(db, "Users", auth.currentUser.uid);
  const docSnap = await getDocPreferCache(docRef);
  try {
    if (docSnap.exists()) {
      clinics = docSnap.data().clinicsHistory;
    }
  } catch (err) {
    logDebug("Error retrieving clinics history of patient...", err);
  }
  return clinics;
};

export const retrievePatientForReviews = async (
  otherReviews,
  isClinicReviews
) => {
  let patientsIds = [];

  try {
    let patientsWithReviews = [];
    const patientIds = Array.from(
      new Set(otherReviews.map((review) => review.patientId).filter(Boolean))
    );
    const chunkSize = 10;
    for (let i = 0; i < patientIds.length; i += chunkSize) {
      const chunk = patientIds.slice(i, i + chunkSize);
      const q = query(
        collection(db, "Users"),
        where("owner_uid", "in", chunk)
      );
      const querySnapshot = await getDocsPreferCache(q);
      querySnapshot.forEach((doc) => {
        for (let j = 0; j < otherReviews.length; j++) {
          if (doc.data().owner_uid === otherReviews[j].patientId) {
            patientsWithReviews.push({
              ...otherReviews[j],
              patientImg: doc.data().patientImg,
            });
          }
        }
      });
    }
    for (let i = 0; i < patientsWithReviews.length; i++) {
      const reference = ref(
        storage,
        `images/patients/${patientsWithReviews[i].patientImg}`
      );
      await getDownloadURL(reference).then((x) => {
        // clinicImages.push(x);
        patientsWithReviews[i].patientImg = x;
      });
    }

    logDebug("-----------TEST-------------");

    logDebug(patientsWithReviews);
    const sortedOtherReviews = patientsWithReviews.sort((a, b) => {
      return b.rating - a.rating;
    });
    return sortedOtherReviews;
  } catch (err) {
    logDebug("error retrievePatientForReviews....", err);
  }
};
