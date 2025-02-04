import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleGetGuestDetails } from "./loginAsGuestHelper";


export const storeData = async (locationDB, value) => {
    try {
      await AsyncStorage.setItem(locationDB, value);
    } catch (e) {
      // saving error
    }
  };

export const getTutorialData = async (locationDB) => {
    const value = await AsyncStorage.getItem(locationDB);
    console.log("-----")
    console.log(value)
    return value
  }


export  const addAppointmentToGuest = async (doctorId, clinicId, appointmentId, timeSelected, daySelected, isGuest, values, completePhoneNumber) => {
  // let appointment = {
  //   doctorId, 
  //   clinicId,
  //   appointmentId,
  //   timeSelected,
  //   daySelected,
 
  // };


  // console.log('appointment------');
  // console.log( appointment);
  
  console.log('-----START ADD TO guestLoginDetails------');
  
  const guestDetails = await handleGetGuestDetails()
  
  // let myAppointments = [...guestDetails.myAppointments]
  let clinicsHistory = [...guestDetails.clinicsHistory]
  
  // myAppointments.push(appointment);
  clinicsHistory.push(clinicId);

  // guestDetails.myAppointments = myAppointments
  // guestDetails.clinicsHistory = clinicsHistory
  guestDetails.phoneNumberCountry = completePhoneNumber
  guestDetails.phoneNumber = values.phoneNumber
  guestDetails.basicInfoData.firstName = values.firstName
  guestDetails.basicInfoData.lastName = values.lastName
  guestDetails.basicInfoData.gender = values.gender
  guestDetails.basicInfoData.state = values.state
  guestDetails.basicInfoData.country = values.country
  guestDetails.basicInfoData.town = values.town
  guestDetails.basicInfoData.age = values.age

  let guestDetailsToAdd = guestDetails
  console.log('-----END ADD TO guestLoginDetails------');
  console.log(guestDetails);

  console.log('-----END ADD TO guestLoginDetails------');
  console.log(guestDetailsToAdd);

  AsyncStorage.setItem('guestLoginDetails', JSON.stringify(guestDetailsToAdd))
  };