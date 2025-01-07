import { useDispatch } from "react-redux";
import { authentication, db, storage } from "../../firebase";
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
} from "firebase/firestore";
import {
  handleGetGuestDetails,
  handleLoginAsGuest,
} from "./loginAsGuestHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const auth = authentication;

export const uploadClinicProfile = async (
  // basicInfoData,
  aboutClinicData,
  clinicInfoData,
  contactData,
  clinicAddressLocation,
  clinicImages,
  clinicImagesURI,
  clinicCity,
  clinicAddressArray,
  clinicAddress
) => {
  console.log("---------------");
  // console.log('basicInfoData', basicInfoData);
  console.log("aboutMeData", aboutClinicData);
  console.log("clinicInfoData", clinicInfoData);
  console.log("contactData", contactData);
  try {
    // <<< --- START --- ADD CITY TO DOCTORS IN ORDER FOR THE QUERY IN PATIENT DASHBOARD TO BE SUCCESSFULL >>>
    console.log("--- START --- ADD CITY TO DOCTORS");
    let allDoctorIds = [];

    const querySnapshot = await getDocs(
      collection(db, "Users", auth.currentUser.uid, "Doctors")
    );
    querySnapshot.forEach((document) => {
      // doc.data() is never undefined for query doc snapshots

      console.log("DOCTOR ID =============>>>>>>>> ", document.data().doctorId);
      allDoctorIds.push(document.data().doctorId);
    });
    console.log("-----------for loop doctor ids.....");
    for (let i = 0; i < allDoctorIds.length; i++) {
      console.log("-----------for loop doctor ids.....");
      console.log(allDoctorIds[i]);
      console.log(clinicAddressLocation);
      console.log(clinicCity);

      const docRefDoctor = doc(
        db,
        "Users",
        auth.currentUser.uid,
        "Doctors",
        allDoctorIds[i]
      );
      await updateDoc(docRefDoctor, {
        clinicCity,
        clinicAddressArray,
        clinicAddressLocation,
        clinicAddress,
      });

      const docRefDoctorPrimaryCollection = doc(db, "Doctors", allDoctorIds[i]);
      await updateDoc(docRefDoctorPrimaryCollection, {
        clinicCity,
        clinicAddressArray,
        clinicAddressLocation,
        clinicAddress,
      });
    }

    // <<< --- END --- ADD CITY TO DOCTORS IN ORDER FOR THE QUERY IN PATIENT DASHBOARD TO BE SUCCESSFULL >>>

    const docRef = doc(db, "Users", auth.currentUser.uid);
    await updateDoc(docRef, {
      // basicInfoData,
      aboutClinicData,
      clinicInfoData,
      contactData,
      clinicAddressLocation,
      clinicAddressArray,
      updatedAt: serverTimestamp(),
      hasProfile: true,
      clinicImages,
      clinicImagesURI,
      clinicCity,
      clinicAddress,
    });
  } catch (err) {
    console.log("error uploading clinic profile", err);
  }
};

export const uploadDoctorProfile = async (
  doctorInfoData,
  allDays,
  doctorImg,
  doctorImgURI,
  servicesList
) => {
  console.log("---------------");
  console.log("doctorInfoData", doctorInfoData);
  console.log("allDays", allDays);

  try {
    // GET THE CLINIC CITY FROM CLINIC REFERENCE TO ADD TO DOCTOR
    console.log("one...");
    const docRefClinic = doc(db, "Users", auth.currentUser.uid);
    const docSnap = await getDoc(docRefClinic);
    let clinicCity = docSnap.data().clinicCity;
    let clinicAddressLocation = docSnap.data().clinicAddressLocation;
    let clinicAddress = docSnap.data().clinicAddressLocation.clinicAddress;
    let clinicAddressArray = docSnap.data().clinicAddressArray;
    let clinicId = docSnap.data().owner_uid;

    //ADD A DOCUMENT IN THE SUBCOLLECTION "Doctors"
    console.log("two...");

    const docRef = await addDoc(
      collection(db, "Users", auth.currentUser.uid, "Doctors"),
      doctorInfoData
    );
    console.log(allDays);

    let objToAdd = {
      doctorInfoData,
      allDays,
      doctorId: docRef.id,
      doctorReviews: [],
      doctorImg,
      clinicAppointments: [],
      doctorImgURI,
      clinicCity,
      clinicAddressArray,
      clinicAddressLocation,
      clinicId,
      clinicAddress,
      servicesList,
    };

    console.log(objToAdd);

    await setDoc(docRef, objToAdd);

    // Add a new document in the collection "Doctors"
    console.log("three...");
    await setDoc(doc(db, "Doctors", docRef.id), objToAdd);

    // await setDoc(docRef, allDays);
    // return docRef.id;
    // console.log('Document written with ID: ', docRef.id);
  } catch (err) {
    console.log("error uploading doctor profile", err);
  }
};

export const updateDoctorProfile = async (
  doctorDocId,
  doctorInfoData,
  allDays,
  doctorImg,
  doctorImgURI,
  servicesList
) => {
  console.log("---------------");
  console.log("doctorInfoData", doctorInfoData);
  console.log("doctorDocId", doctorDocId);
  console.log("allDays", allDays);

  try {
    let objToAdd = {
      doctorInfoData,
      allDays,
      doctorAppointments: [],
      updatedAt: serverTimestamp(),
      doctorImg,
      doctorImgURI,
      servicesList,
    };

    console.log("objToAdd");
    console.log(doctorImg);
    console.log(doctorImgURI);

    //UPDATE TO SUBCOLECTION OF USERS -- CLINC --
    const doctorRefClinic = doc(
      db,
      "Users",
      auth.currentUser.uid,
      "Doctors",
      doctorDocId
    );
    await updateDoc(doctorRefClinic, objToAdd);

    //UPDATE TO COLECTION OF DOCTORS

    const doctorRef = doc(db, "Doctors", doctorDocId);
    await updateDoc(doctorRef, objToAdd);
  } catch (err) {
    console.log("error uploading doctor profile", err);
  }
};

export const uploadClinicTimeSlots = async (allDays) => {
  console.log("---------------");
  console.log("allDays uploading....", allDays);

  try {
    const docRef = doc(db, "Users", auth.currentUser.uid);
    await updateDoc(docRef, {
      allDays,
      updatedAt: serverTimestamp(),
      hasProfile: true,
    });
  } catch (err) {
    console.log("error uploading time slots", err);
  }
};

export const uploadExpoPushToken = async (expoToken) => {
  console.log("---------------");
  console.log("expoToken uploading....", expoToken);

  try {
    const docRef = doc(db, "Users", auth.currentUser.uid);
    await updateDoc(docRef, {
      expoToken,
    });
  } catch (err) {
    console.log("error uploading expoToken", err);
  }
};

export const uploadFeedback = async (userType, feedback) => {
  console.log("------UPLOADING FEEDBACK TO FIREBASE---------");

  console.log(feedback);
  try {
    if (userType === "patient") {
      const docRef = doc(db, "Feedback", "Patients");
      await updateDoc(docRef, {
        [Date.now()]: feedback,
      });
    } else if (userType === "clinic") {
      const docRef = doc(db, "Feedback", "Clinics");
      await updateDoc(docRef, {
        [Date.now()]: feedback,
      });
    }

    return true;
  } catch (err) {
    console.log("error uploading feedback", err);
  }
};

export const uploadApprovedAppointment = async (patientData, hasOwnerUid) => {
  console.log("-------uploadApprovedAppointment----");
  console.log(patientData.appointmentId);
  let allPatientAppointments = [];
  let newPatientAppointmentData;

  //CHECK TO SEE IF APPOINTMENT HAS THE UID OF PATIENT IN ORDER TO CHECK PATIENTS APPOINTMENTS
  if (hasOwnerUid) {
    console.log("test... 1");

    //Get patients appointments

    const docRef = doc(db, "Users", patientData.patientId);
    const docSnap = await getDoc(docRef);

    console.log("patientData.patientId...");
    console.log(patientData.patientId);
    try {
      if (docSnap.exists()) {
        // Query a reference to a subcollection
        const querySnapshot = await getDocs(
          collection(db, "Users", patientData.patientId, "myAppointments")
        );
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, " => ", doc.data());
          let obj = doc.data();
          obj.documentId = doc.id;
          if (patientData.appointmentId === obj.appointmentId) {
            allPatientAppointments.push(obj);
          }
        });
      } else {
        console.log("No such document!");
      }
    } catch (err) {
      console.log("Error retrievePatientAppointments...for approval", err);
    }
    console.log("test... 3");
    console.log("allPatientAppointments....");
    console.log(allPatientAppointments);
    let actualPatientAppointment;

    //Filter patients appointments to get the appointment to the actual clinic, actual day, actual time
    try {
      for (let item of allPatientAppointments) {
        console.log("test... 3.LOOPS");

        console.log("test... 4");

        // Change approval
        if (patientData.appointmentId === item.appointmentId) {
          item.isApproved = !item.isApproved;
        }

        console.log("test... 6");

        //replace document in subcollection
        try {
          console.log("test... 7");
          const appRef = doc(
            db,
            "Users",
            patientData.patientId,
            "myAppointments",
            item.documentId
          );

          // Set the "capital" field of the city 'DC'
          await updateDoc(appRef, item);

          // const docRef = doc(db, 'Users', patientData.patientId);
          // await updateDoc(docRef, {
          //   myAppointments: arrayUnion(item),
          // });
        } catch (err) {
          console.log(
            "error uploading patient NEW APPOINTMENT WITH APROVE",
            err
          );
        }
      }
    } catch (err) {
      console.log(
        "error on loop Filter patients on toggle approved...appointment",
        err
      );
    }
  }

  // START CHANGE APPROVAL IN DOCTOR COLLECTION AND SUBCOLLECTION APPOINTMENTS

  let docAppointments = [];
  const docRefDoc = doc(
    db,
    "Users",
    auth.currentUser.uid,
    "Doctors",
    patientData.doctorId
  );
  const docSnapDoc = await getDoc(docRefDoc);

  try {
    if (docSnapDoc.exists()) {
      for (let i = 0; i < docSnapDoc.data().clinicAppointments.length; i++) {
        let appointment = docSnapDoc.data().clinicAppointments[i];
        if (appointment.appointmentId === patientData.appointmentId) {
          appointment.isApproved = !patientData.isApproved;
        }
        docAppointments.push(appointment);
      }
      // console.log(docAppointments[1].isApproved)
      // console.log(docAppointments[2].isApproved)
    } else {
      console.log("No such document!");
    }
  } catch (err) {
    console.log("Error retrieveClinicData...", err);
  }

  console.log("docAppointments...");
  console.log(docAppointments);

  try {
    // change approval in doctor appointments of appointment in Doctors subcollection

    const docRef = doc(
      db,
      "Users",
      auth.currentUser.uid,
      "Doctors",
      patientData.doctorId
    );
    await updateDoc(docRef, {
      clinicAppointments: docAppointments,
    });

    // change approval in doctor appointments of appointment in Doctors Collection
    const docRefDoctor = doc(db, "Doctors", patientData.doctorId);
    await updateDoc(docRefDoctor, {
      clinicAppointments: docAppointments,
    });

    console.log("deleting...", patientData.appointmentId);
  } catch (err) {
    console.log("error DELETING patient APPOINTMENT BEFORE UPLOAD", err);
  }
};

export const uploadApprovedUnregisteredAppointment = async (patientData) => {
  console.log("-------uploadApprovedUnregisteredAppointment----");
  console.log(patientData.doctorId);
  let allPatientAppointments;
  let newPatientAppointmentData;

  // START CHANGE APPROVAL IN DOCTOR COLLECTION AND SUBCOLLECTION APPOINTMENTS

  let docAppointments = [];

  const docRefDoc = doc(
    db,
    "Users",
    patientData.clinicId,
    "Doctors",
    patientData.doctorId
  );
  const docSnapDoc = await getDoc(docRefDoc);

  try {
    const querySnapshot = await getDocs(
      collection(
        db,
        "Users",
        patientData.clinicId,
        "Doctors",
        patientData.doctorId,
        "clinicAppointmentsUnregistered"
      )
    );

    if (!querySnapshot.empty) {
      // Query exists, perform your logic here
      console.log("Query exists!");
      querySnapshot.forEach(async (docLoop) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());

        let appointment = docLoop.data();

        if (appointment.appointmentId === patientData.appointmentId) {
          appointment.isApproved = !patientData.isApproved;

          const doctorSubcollectionRef = doc(
            db,
            "Users",
            auth.currentUser.uid,
            "Doctors",
            patientData.doctorId,
            "clinicAppointmentsUnregistered",
            docLoop.id
          );
          const doctorCollectionRef = doc(
            db,
            "Doctors",
            patientData.doctorId,
            "clinicAppointmentsUnregisteredDocCol",
            docLoop.id
          );
          console.log("uploading... appointemnt");
          console.log(appointment);

          await updateDoc(doctorSubcollectionRef, appointment);
          await updateDoc(doctorCollectionRef, appointment);
        }
      });
    } else {
      // Query does not exist
      console.log("Query does not exist.");
    }
  } catch (err) {
    console.log("Error uploadApprovedUnregisteredAppointment...", err);
  }

  console.log("docAppointments...");
  console.log(docAppointments);

  // try {

  //   // change approval in doctor appointments of appointment in Doctors subcollection

  //   const docRef = doc(db, 'Users', auth.currentUser.uid, "Doctors", patientData.doctorId);
  //   await updateDoc(docRef, {
  //     clinicAppointmentsUnregistered:  docAppointments,
  //   });

  //   // change approval in doctor appointments of appointment in Doctors Collection
  //   const docRefDoctor = doc(db, "Doctors", patientData.doctorId);
  //   await updateDoc(docRefDoctor, {
  //     clinicAppointmentsUnregistered:  docAppointments,
  //   });

  // } catch (err) {
  //   console.log('error updateDoc patient UNREGISTERED APPOINTMENT', err);
  // }
};

export const uploadTermsConditionsClinicPatient = async (
  textTermsConditions,
  isAccepted
) => {
  console.log("---------------");
  console.log("textTermsConditions...", textTermsConditions);
  console.log("isAccepted...", isAccepted);
  const termsConditions = { isAccepted, text: textTermsConditions };
  try {
    const docRef = doc(db, "Users", auth.currentUser.uid);
    await updateDoc(docRef, {
      termsConditions,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.log("error uploading termsConditions Clinic", err);
  }
};

export const uploadPatientProfile = async (
  basicInfoData,
  patientImg,
  patientImgURI
) => {
  // const dispatch = useDispatch();
  console.log("-------basicInfoData--------");
  console.log("basicInfoData", basicInfoData);

  try {
    const docRef = doc(db, "Users", auth.currentUser.uid);
    await updateDoc(docRef, {
      basicInfoData,
      updatedAt: serverTimestamp(),
      hasProfile: true,
      patientImg,
      patientImgURI,
    });
  } catch (err) {
    console.log("error uploading patient profile", err);
  }
  // dispatch(getPatientInfo());
};

export const updateClinicPhoneNumber = async (phoneNumber) => {
  // const dispatch = useDispatch();
  console.log("---------------");
  console.log("phoneNumber", phoneNumber);

  try {
    const docRef = doc(db, "Users", auth.currentUser.uid);
    await updateDoc(docRef, {
      phoneNumber,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.log("error updating clinic phone number", err);
  }
};

export const updateClinicEmail = async (email) => {
  // const dispatch = useDispatch();
  console.log("---------------");
  console.log("email", email);

  try {
    const docRef = doc(db, "Users", auth.currentUser.uid);
    await updateDoc(docRef, {
      email,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.log("error updating clinic phone number", err);
  }
};

export const uploadDoctorReview = async (
  clinic_uid,
  doctorId,
  patientPhoneNumber,
  reviewId,
  reviewName,
  rating,
  dateReview,
  comment,
  patientName
) => {
  console.log("-------uploadDoctorReview SAU CLINIC--------");

  if (doctorId === false) {
    console.log("here.....");
    const review = {
      reviewId,
      patientPhoneNumber,
      isReview: true,
      reviewName,
      rating,
      dateReview,
      comment,
      patientName,
    };

    console.log("upload....", review);
    try {
      const docRef = doc(db, "Users", clinic_uid);
      await updateDoc(docRef, {
        clinicReviews: arrayUnion(review),
      });
    } catch (err) {
      console.log("error uploading clinic REVIEW", err);
    }
  } else {
    console.log("test here....");
    const review = {
      reviewId,
      doctorId,
      patientPhoneNumber,
      isReview: true,
      reviewName,
      rating,
      dateReview,
      comment,
      patientName,
    };

    console.log(review);
    try {
      //UPLOAD REVIEW IN THE DOCTOR IN CLINICS
      const docRef = doc(db, "Users", clinic_uid, "Doctors", doctorId);
      await updateDoc(docRef, {
        doctorReviews: arrayUnion(review),
      });

      //UPLOAD REVIEW IN THE DOCTOR IN DOCTOR COLLECTION
      const docRefDoctor = doc(db, "Doctors", doctorId);
      await updateDoc(docRefDoctor, {
        doctorReviews: arrayUnion(review),
      });
    } catch (err) {
      console.log("error uploading doctor REVIEW", err);
    }
  }
};

export const deleteDoctorReview = async (clinic_uid, doctorId, review) => {
  console.log("-------deleteDoctorReview SAU CLINIC--------");
  console.log(review);

  // console.log(clinic_uid)
  // console.log(doctorId)
  console.log(review);
  console.log(clinic_uid);

  if (doctorId === false) {
    try {
      const docRef = doc(db, "Users", clinic_uid);
      console.log("before remove up");
      await updateDoc(docRef, {
        clinicReviews: arrayRemove(review),
      });
    } catch (err) {
      console.log("error arrayRemove doctor REVIEW", err);
    }
  } else {
    console.log("else....");
    console.log(review);
    try {
      const docRef = doc(db, "Users", clinic_uid, "Doctors", doctorId);
      console.log("before remove");
      await updateDoc(docRef, {
        doctorReviews: arrayRemove(review),
      });

      const docRefDoctor = doc(db, "Doctors", doctorId);
      await updateDoc(docRefDoctor, {
        doctorReviews: arrayRemove(review),
      });
    } catch (err) {
      console.log("error arrayRemove doctor REVIEW", err);
    }
  }
};

console.log("---------------");
export const uploadAppointmentDataToPatient = async (
  dateToQuery,
  doctorId,
  clinicId,
  appointmentId,
  timeSelected,
  daySelected,
  isGuest?,
  values?,
  phoneNumber?
) => {
  console.log("--------------uploadAppointmentDataTo PATIENT---------------");

  try {
    if (isGuest) {
      let appointment = {
        doctorId,
        clinicId,
        timeSelected,
        daySelected,
        dateToQuery,
      };

      console.log("appointment------");
      console.log(appointment);

      console.log("-----START ADD TO guestLoginDetails------");

      const guestDetails = await handleGetGuestDetails();

      let myAppointments = [...guestDetails.myAppointments];
      let clinicsHistory = [...guestDetails.clinicsHistory];

      myAppointments.push(appointment);
      clinicsHistory.push(clinicId);

      guestDetails.myAppointments = myAppointments;
      guestDetails.clinicsHistory = clinicsHistory;
      guestDetails.phoneNumberCountry = phoneNumber;
      guestDetails.phoneNumber = values.phoneNumber;
      guestDetails.basicInfoData.firstName = values.firstName;
      guestDetails.basicInfoData.lastName = values.lastName;
      guestDetails.basicInfoData.gender = values.gender;
      guestDetails.basicInfoData.state = values.state;
      guestDetails.basicInfoData.country = values.country;
      guestDetails.basicInfoData.town = values.town;
      guestDetails.basicInfoData.age = values.age;

      let guestDetailsToAdd = guestDetails;
      console.log("-----END ADD TO guestLoginDetails------");
      console.log(guestDetails);

      console.log("-----END ADD TO guestLoginDetails------");
      console.log(guestDetailsToAdd);

      AsyncStorage.setItem(
        "guestLoginDetails",
        JSON.stringify(guestDetailsToAdd)
      );
    } else {
      let appointment = {
        doctorId,
        clinicId,
        timeSelected,
        daySelected,
        isApproved: false,
        patientId: auth.currentUser.uid,
        appointmentId,
        dateToQuery,
      };

      console.log("appointment---");
      console.log(appointment);

      await addDoc(
        collection(db, "Users", auth.currentUser.uid, "myAppointments"),
        appointment
      );

      // const docRef = doc(db, 'Users', auth.currentUser.uid);
      // await updateDoc(docRef, {
      //   myAppointments: arrayUnion(appointment),
      // });

      // change CLINICS in PATIENT CLINIC HISTORY
      let clinicsHistory = [];
      const docRefDoc = doc(db, "Users", auth.currentUser.uid);
      const docSnapDoc = await getDoc(docRefDoc);
      if (docSnapDoc.exists() && docSnapDoc.data().clinicsHistory) {
        if (docSnapDoc.data().clinicsHistory.length === 0) {
          await updateDoc(docRefDoc, {
            clinicsHistory: arrayUnion(clinicId),
          });
        }
        const clinics = docSnapDoc.data().clinicsHistory;
        for (let i = 0; i < clinics.length; i++) {
          // let clinic = docSnapDoc.data().clinicsHistory[i];
          if (clinics[i] === clinicId) {
            console.log("clinics1...", clinics.length);
            clinics.pop(clinics[i]);
            console.log("clinics2...", clinics.length);
            let newClinics = [...clinics, clinicId];
            console.log("newClinics...", newClinics.length);
            await updateDoc(docRefDoc, {
              clinicsHistory: newClinics,
            });
          }
        }
        await updateDoc(docRefDoc, {
          clinicsHistory: arrayUnion(clinicId),
        });
      } else {
        console.log("No such document! First UPLOAD");
        await updateDoc(docRefDoc, {
          clinicsHistory: arrayUnion(clinicId),
        });
      }
    }
  } catch (err) {
    console.log("error uploadAppointmentDataTo PATIENT...", err);
  }
};

export const uploadAppointmentDataToClinic = async (
  clinic_uid,
  doctor_uid,
  daySelected,
  timeSelected,
  patientId,
  appointmentId,
  dateToQuery
) => {
  console.log("-------uploadAppointmentDataTo CLINIC--------");

  const appointment = {
    appointmentId,
    timeSelected,
    daySelected,
    patientId,
    doctorId: doctor_uid,
    isApproved: false,
    dateToQuery,
  };

  try {
    //UPLOAD APPOINTMENT TO DOCTOR SUBCOLECTION
    // CHANGED FROM ARRAY ELEMENT IN DOCUMENT TO DOCUMENT IN COLLECTION ----->

    // const docRef = doc(db, 'Users', clinic_uid, "Doctors", doctor_uid);
    // await updateDoc(docRef, {
    //   clinicAppointments: arrayUnion(appointment),

    // });
    await addDoc(
      collection(
        db,
        "Users",
        clinic_uid,
        "Doctors",
        doctor_uid,
        "clinicAppointments"
      ),
      appointment
    );

    //UPLOAD APPOINTMENT TO DOCTOR COLECTION
    // CHANGED FROM ARRAY ELEMENT IN DOCUMENT TO DOCUMENT IN COLLECTION ----->

    // const docRefDoctor = doc(db, "Doctors", doctor_uid);
    //   await updateDoc(docRefDoctor, {
    //     clinicAppointments: arrayUnion(appointment),

    // });
    await addDoc(
      collection(db, "Doctors", doctor_uid, "clinicAppointments"),
      appointment
    );

    // UPLOAD APPOINTMENT TO CLINIC COLLECTION
    // CHANGED FROM ARRAY ELEMENT IN DOCUMENT TO DOCUMENT IN COLLECTION ----->

    // const docRefClinic = doc(db, 'Users', clinic_uid);
    // await updateDoc(docRefClinic, {
    //   clinicsPatients: arrayUnion(patientId),

    // });

    await addDoc(
      collection(db, "Users", clinic_uid, "clinicsPatients"),
      appointment
    );

    // CREATE CHAT ----------->

    // console.log("chat create...", clinic_uid);
    // const collectionIdChats = "Chats";
    // const documentIdChats = `${clinic_uid}-${patientId}`;
    // const valueChats = {};
    // setDoc(doc(db, collectionIdChats, documentIdChats), {
    //   valueChats,
    //   clinicId: clinic_uid,
    //   patientId: patientId,
    // });
  } catch (err) {
    console.log("error uploading patient profile", err);
  }
};

export const uploadCreateAppointmentToClinic = async (
  clinic_uid,
  doctor_uid,
  daySelected,
  timeSelected,
  phoneNumber,
  patientInfo,
  appointmentId,
  oldClinicsPatients,
  isApproved,
  oldPhoneNumber,
  selectedServices
) => {
  try {
    // let phoneNumber = patientInfo.phoneNumber;
    console.log("-------uploadAppointmentDataTo CLINIC--------");

    console.log("-------patientInfo--------");
    console.log(patientInfo);
    console.log(phoneNumber);

    const arrayFieldPatientInfo = {
      basicInfoData: {
        age: patientInfo.age,
        country: patientInfo.country,
        firstName: patientInfo.firstName,
        gender: patientInfo.gender,
        lastName: patientInfo.lastName,
        phonenumber: "",
        state: patientInfo.state,
        town: patientInfo.town,
      },
      email: "",
      hasProfile: false,
      isClinic: false,
      isPatient: true,
      oldPatientImage: "",
      patientImage: "",
      phoneNumber: phoneNumber,
      doctorId: doctor_uid,
      clinicId: clinic_uid,
      isUnregistered: true,
    };

    const appointment = {
      appointmentId,
      daySelected,
      isApproved: isApproved,
      patientInfo: arrayFieldPatientInfo,
      phoneNumber: phoneNumber,
      timeSelected,
      doctorId: doctor_uid,
      clinicId: clinic_uid,
      isUnregistered: true,
      selectedServices,
    };

    console.log("-------appointment--------");
    console.log(appointment);
    console.log("-------arrayFieldPatientInfo--------");
    console.log(arrayFieldPatientInfo);

    await setDoc(
      doc(
        db,
        "Users",
        clinic_uid,
        "Doctors",
        doctor_uid,
        "clinicAppointmentsUnregistered",
        appointmentId.toString()
      ),
      appointment
    );

    await setDoc(
      doc(
        db,
        "Doctors",
        doctor_uid,
        "clinicAppointmentsUnregisteredDocCol",
        appointmentId.toString()
      ),
      appointment
    );

    let patientsFirstNames = [];
    let patientsLastNames = [];
    let patientsAge = [];
    let patientsPhoneNumber = [];
    for (let i = 0; i < oldClinicsPatients.length; i++) {
      patientsFirstNames.push(oldClinicsPatients[i].firstname);
      patientsLastNames.push(oldClinicsPatients[i].lastname);
      patientsAge.push(oldClinicsPatients[i].age);

      patientsPhoneNumber.push(oldClinicsPatients[i].phoneNumber);
    }
    console.log("patientInfo.phoneNumber...", patientInfo.phoneNumber);
    console.log("patientsPhoneNumber...", patientsPhoneNumber);

    if (patientsPhoneNumber.includes(phoneNumber)) {
      console.log("Already exists...");
    } else if (
      patientsPhoneNumber.includes(oldPhoneNumber) &&
      !patientsPhoneNumber.includes(phoneNumber)
    ) {
      console.log("old one exists, but not the new one...");
      console.log(oldPhoneNumber);
      console.log(phoneNumber);

      const oldDocRef = doc(
        db,
        "Users",
        clinic_uid,
        "clinicsPatientsUnregistered",
        oldPhoneNumber.toString()
      );
      const newDocRef = doc(
        db,
        "Users",
        clinic_uid,
        "clinicsPatientsUnregistered",
        phoneNumber.toString()
      );

      // Step 1: Delete the old document
      await deleteDoc(oldDocRef);

      // Step 2: Set the new document with updated data
      await setDoc(newDocRef, arrayFieldPatientInfo);

      // UPDATE PHONE NUMBER IN ALL APPOINTMENTS UNDER DOCTORS SUB---COLLECTION

      const museums = query(
        collectionGroup(db, "clinicAppointmentsUnregisteredDocCol"),
        where("phoneNumber", "==", oldPhoneNumber)
      );
      const querySnapshot = await getDocs(museums);
      const batch = writeBatch(db);

      querySnapshot.forEach((doc) => {
        const docRef = doc.ref;
        batch.update(docRef, { phoneNumber: phoneNumber });
      });

      await batch.commit();

      // UPDATE PHONE NUMBER IN ALL APPOINTMENTS UNDER DOCTORS COLLECTION

      console.log("oldPhone....");
      console.log(oldPhoneNumber);

      const museumsCol = query(
        collectionGroup(db, "clinicAppointmentsUnregistered"),
        where("phoneNumber", "==", oldPhoneNumber)
      );
      const querySnapshotCol = await getDocs(museumsCol);
      const batchCol = writeBatch(db);

      querySnapshotCol.forEach((doc) => {
        const docRef = doc.ref;
        batchCol.update(docRef, { phoneNumber: phoneNumber });
      });

      await batchCol.commit();
    } else {
      console.log("Does not exist...");

      await setDoc(
        doc(
          db,
          "Users",
          clinic_uid,
          "clinicsPatientsUnregistered",
          phoneNumber.toString()
        ),
        arrayFieldPatientInfo
      );
    }

    // CREATE CHAT ----------->

    // console.log("chat create...", clinic_uid);
    // const collectionIdChats = "Chats";
    // const documentIdChats = `${phoneNumber}`;
    // const valueChats = {};
    // setDoc(doc(db, "Users", clinic_uid, "Chats", documentIdChats), {
    //   valueChats,
    //   phoneNumber: phoneNumber,
    // });
  } catch (err) {
    console.log(
      "error uploading clinic appointment to doctor col and subcol",
      err
    );
  }
};
