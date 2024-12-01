import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export const checkIfBooked = async (daySelected, item, AllDoctorInfo) => {
  let isAppMade = false;
  //   Query a reference to a subcollection
  const querySnapshot = await getDocs(
    collection(
      db,
      "Doctors",
      AllDoctorInfo.item.doctorId,
      "clinicAppointmentsUnregisteredDocCol"
    )
  );
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    let data = doc.data();
    console.log(doc.id, " => ", data);
    if (
      data.daySelected === daySelected &&
      data.timeSelected.starttime === item.starttime &&
      data.timeSelected.endtime === item.endtime
    ) {
      console.log(
        "YES THE PATIENT ALREADY MADE AN APPOINTMENT FOR THIS DAY AND TIME"
      );
      isAppMade = true;
    } else {
      console.log(
        "NO THE PATIENT ALREADY MADE AN APPOINTMENT FOR THIS DAY AND TIME"
      );
      isAppMade = false;
    }
  });
  return isAppMade;
};
