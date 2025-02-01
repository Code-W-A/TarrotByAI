import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { authentication, db, storage } from "../../firebase";
import { deleteObject, ref } from "firebase/storage";
import {
  EmailAuthProvider,
  deleteUser,
  getAuth,
  reauthenticateWithCredential,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Alert } from "react-native";
import { handleSignOut } from "./handleSignOut";
import { useNavigation } from "@react-navigation/native";
import i18n from "../../i18n";

const handleRecentLoginAndDelete = async (
  isPatient,
  imgId,
  currentPassword,
  email,
  navigation,
  doctorImg
) => {
  const auth = authentication;
  const user = auth.currentUser;
  console.log("------handleRecentLoginAndDelete------");
  console.log(auth.currentUser.email);
  console.log(currentPassword);
  console.log("-------imgid----");
  console.log(imgId);
  // console.log(user.email)
  const credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    currentPassword
  );
  console.log("-------123142----");
  const result = await reauthenticateWithCredential(
    auth.currentUser,
    credential
  );

  try {
    // User re-authenticated.

    let imageRef;

    //DELETE USER FROM FIREBASE STORAGE
    if (isPatient) {
      imageRef = ref(storage, `images/patients/${imgId}`);
      deleteObject(imageRef)
        .then(() => {
          // File deleted successfully
          console.log("File deleted successfully from storage...");
        })
        .catch((error) => {
          console.log("Error ON File deleted from storage...", error);
          // Uh-oh, an error occurred!
        });
      console.log("DELETE PATIENT FROM STORAGE....");
    } else {
      console.log("DELETE CLINIC FROM STORAGE....");
      console.log(imgId);
      console.log(doctorImg);

      if (doctorImg.length > 0) {
        for (let z = 0; z < doctorImg.length; z++) {
          imageRef = ref(
            storage,
            `images/clinics/${user.uid}/doctors/${doctorImg[z]}`
          );
          deleteObject(imageRef)
            .then(() => {
              // File deleted successfully
              console.log("File deleted successfully from storage...");
            })
            .catch((error) => {
              console.log("Error ON File deleted from storage...", error);
              // Uh-oh, an error occurred!
            });
        }
      }

      for (let i = 0; i < imgId.length; i++) {
        console.log("DELETE img....");
        console.log(user.uid);
        console.log(imgId[i].img);
        imageRef = ref(storage, `images/clinics/${user.uid}/${imgId[i].img}/`);
        deleteObject(imageRef)
          .then(() => {
            // File deleted successfully
            console.log("File deleted successfully from storage...");
          })
          .catch((error) => {
            console.log("Error ON File deleted from storage...", error);
            // Uh-oh, an error occurred!
          });

        //  }
      }
    }

    //DELETE DOCTORS FROM CLINIC FROM COLLECTIONS
    if (!isPatient) {
      let doctorIdsToDelete = [];
      const querySnapshot = await getDocs(
        collection(db, "Users", user.uid, "Doctors")
      );
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data().doctorId);

        doctorIdsToDelete.push(doc.data().doctorId);
      });

      for (let i = 0; i < doctorIdsToDelete.length; i++) {
        //Delete APPOINTMENTS from USERS COLLECTION IN THE SAME TIME OF THE DOCTOR
        const subcollectionRefAppointments = collection(
          db,
          "Users",
          user.uid,
          "Doctors",
          doctorIdsToDelete[i],
          "clinicAppointmentsUnregistered"
        );
        const querySnapshotAppointments = await getDocs(
          subcollectionRefAppointments
        );
        for (const doc of querySnapshotAppointments.docs) {
          await deleteDoc(doc.ref);
        }

        //Delete DOCTORS from USERS COLLECTION IN THE SAME TIME
        const subcollectionRefDoctors = collection(
          db,
          "Users",
          user.uid,
          "Doctors"
        );
        const querySnapshotDoctors = await getDocs(subcollectionRefDoctors);
        for (const doc of querySnapshotDoctors.docs) {
          await deleteDoc(doc.ref);
        }

        //DELETE DOCTOR FROM CLINIC FROM Doctors COLLECTIONS
        const subcollectionRefAppointmentsDoctors = collection(
          db,
          "Doctors",
          doctorIdsToDelete[i],
          "clinicAppointmentsUnregisteredDocCol"
        );
        const querySnapshotAppointmentsDoctors = await getDocs(
          subcollectionRefAppointmentsDoctors
        );
        for (const doc of querySnapshotAppointmentsDoctors.docs) {
          await deleteDoc(doc.ref);
        }

        //DELETE CHATS FROM CLINIC COLLECTIONS
        const subcollectionRefChats = collection(
          db,
          "Users",
          user.uid,
          "Chats"
        );
        const querySnapshotChats = await getDocs(subcollectionRefChats);
        for (const doc of querySnapshotChats.docs) {
          await deleteDoc(doc.ref);
        }

        await deleteDoc(doc(db, "Doctors", doctorIdsToDelete[i]));
      }
    }

    //DELETE USER FROM FIREBASE FIRESTORE

    console.log("test...uid");
    console.log(user);
    // console.log(user.uid);

    const subcollectionRefClinics = collection(
      db,
      "Users",
      user.uid,
      "clinicsPatientsUnregistered"
    ); // Replace with your actual collection and document ID

    try {
      const querySnapshotClinics = await getDocs(subcollectionRefClinics);

      for (const doc of querySnapshotClinics.docs) {
        await deleteDoc(doc.ref);
      }

      console.log("All documents in the subcollection have been deleted.");
    } catch (error) {
      console.error("Error deleting documents:", error);
    }

    await deleteDoc(doc(db, "Users", user.uid));

    //DELETE USER FROM FIREBASE AUTHENTIFICATION

    deleteUser(result.user)
      .then(() => {
        // User deleted.
        console.log("User deleted FROM AUTH");
      })
      .then(() => {
        handleSignOut(navigation, true);
      })
      .catch((error) => {
        console.log("ERROR User deleted FROM AUTH", error);
        // An error ocurred
        // ...
      });
  } catch (err) {
    // An error ocurred
    // ...

    console.log(
      "an ERROR occured inside delete function of account.........",
      err
    );

    if (err.code == "auth/wrong-password") {
      Alert.alert(
        i18n.translate("wrongCurrentPass"),
        i18n.translate("wrongCurrentPassMessage"),
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    } else if (err.code == "auth/too-many-requests") {
      Alert.alert(
        i18n.translate("tooManyWrongCurrentPassEntries"),
        i18n.translate("tooManyWrongCurrentPassEntriesMessage"),
        [
          {
            text: i18n.translate("logout"),
            onPress: () => handleSignOut(navigation, true),
          },
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]
      );
    } else {
      Alert.alert(
        i18n.translate("problemOccured"),
        i18n.translate("problemOccuredMessage"),
        [
          {
            text: i18n.translate("contact"),
            onPress: () => navigation.navigate(screenName.Feedback),
          },
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]
      );
    }
    //  return false
  }

  //  return true
};

export const deleteAccount = async (
  isPatient,
  imgId,
  currentPassword,
  email,
  navigation,
  doctorImg?
) => {
  console.log("------------------");
  // console.log(isPatient)
  // console.log(imgId)
  console.log(currentPassword);
  console.log(email);
  //DELETE USER START
  handleRecentLoginAndDelete(
    isPatient,
    imgId,
    currentPassword,
    email,
    navigation,
    doctorImg
  );
};
