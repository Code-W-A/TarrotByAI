import { getDistance, getPreciseDistance } from "geolib";
import { _getLocationAsync } from "../services/location-service";
import {
  retrieveClinicsForPatientDashboard,
  retrieveDoctorsForPatientDashboard,
} from "./getFirebaseData";
import * as Location from "expo-location";
import i18n from "../../i18n";
/*
 * 1. getDistance, Calculates the distance between two geo coordinates.
 * 2. getPreciseDistance, Calculates the distance between two geo coordinates.
 *    This method is more accurate then getDistance, especially for long distances
 *    but it is also slower. It is using the Vincenty inverse formula for ellipsoids.
 */

export const calculateDistance = (patientLocation, doctorClinicLocation) => {
  let dis = getDistance(
    patientLocation,
    doctorClinicLocation
    // {latitude: 20.0504188, longitude: 64.4139099},
    // {latitude: 51.528308, longitude: -0.3817765},
  );
  alert(`Distance\n\n${dis} Meter`);
  alert(`Distance\n\n${dis / 1000} KM`);
};

export const calculatePreciseDistance = (
  patientLocation,
  doctorClinicLocation
) => {
  //   console.log('patientLocation...', patientLocation);
  //   console.log('doctorClinicLocation...', doctorClinicLocation);
  let pdis = getPreciseDistance(patientLocation, doctorClinicLocation);
  let distance;
  let distanceInMeters;
  let distanceType;
  let stringDistance;
  if (pdis < 1000) {
    // console.log(`Distance\n\n${pdis} Meter`);
    distance = pdis;
    let parts = distance.toString().split(".");
    let num = `${parts[0]}`;
    stringDistance = num;
    distanceInMeters = pdis;
    distanceType = i18n.translate("meters");
  } else {
    // console.log(`Distance\n\n${pdis / 1000} KM`);
    distance = pdis / 1000;
    let parts = distance.toString().split(".");
    let num = `${parts[0]},${parts[1]} `;
    stringDistance = num;
    distanceInMeters = pdis;
    distanceType = "KM";
  }
  return { distance, distanceInMeters, stringDistance, distanceType };
};

export const handleGetPatientLocation = async (sliderValue) => {
  console.log("slider value....", sliderValue);
  try {
    let start = Date.now() / 1000;
    const patientLocation = await _getLocationAsync();
    console.log("END... _getLocationAsync", patientLocation);
    const patientCoords = {
      latitude: patientLocation.coords.latitude,
      longitude: patientLocation.coords.longitude,
    };

    // GET CLINICS START
    console.log("Pretesttest....location...");
    console.log(patientCoords);

    let address;
    try {
      address = await Location.reverseGeocodeAsync(patientCoords);
      // Handle the address data here
    } catch (error) {
      console.error(
        "Error while reverse geocoding in getting clinics and doctors around.....:",
        error
      );
      // Handle the error gracefully, e.g., show an error message to the user
    }

    console.log("test....location...");
    console.log(address);

    let STARTretrieveClinicsForPatientDashboard = Date.now() / 1000;
    const clinics = await retrieveClinicsForPatientDashboard(address[0].city);
    console.log(
      "END... retrieveClinicsForPatientDashboard",
      Date.now() / 1000 - STARTretrieveClinicsForPatientDashboard
    );

    console.log("test---clinics");
    console.log(clinics);

    // GET CLINICS FINISH

    // GET DOCTORS START

    const addressForDoctors = await Location.reverseGeocodeAsync(patientCoords);

    let STARTretrieveDoctorsForPatientDashboard = Date.now() / 1000;
    const doctors = await retrieveDoctorsForPatientDashboard(
      addressForDoctors[0].city
    );
    console.log(
      "END... retrieveDoctorsForPatientDashboard",
      Date.now() / 1000 - STARTretrieveDoctorsForPatientDashboard
    );

    // GET DOCTORS FINISH

    // FIND OUT DISTANCE TO PATIENT OF DOCTORS...START

    let STARTDISTANCETOPATIENTOFDOCTORS = Date.now() / 1000;
    for (let i = 0; i < doctors.length; i++) {
      // console.log(doctors[i])

      const doctorClinicLocation = {
        latitude: doctors[i].clinicAddressLocation.clinicCoords.lat,
        longitude: doctors[i].clinicAddressLocation.clinicCoords.lng,
      };
      const distanceToPatient = calculatePreciseDistance(
        patientCoords,
        doctorClinicLocation
      );

      doctors[i].distanceToPatient = distanceToPatient;
    }
    console.log(
      "END... STARTDISTANCETOPATIENTOF___DOCTORS",
      Date.now() / 1000 - STARTDISTANCETOPATIENTOFDOCTORS
    );
    // FIND OUT DISTANCE TO PATIENT OF DOCTORS...START

    //FIND OUT DISTANCE TO PATIENT OF CLINICS...START
    let STARTDISTANCETOPATIENTOFCLINICS = Date.now() / 1000;
    for (let i = 0; i < clinics.length; i++) {
      const doctorClinicLocation = {
        latitude: clinics[i].clinicAddressLocation.clinicCoords.lat,
        longitude: clinics[i].clinicAddressLocation.clinicCoords.lng,
      };

      const distanceToPatient = calculatePreciseDistance(
        patientCoords,
        doctorClinicLocation
      );

      clinics[i].distanceToPatient = distanceToPatient;
    }
    console.log(
      "END... STARTDISTANCETOPATIENTOF___CLINICS",
      Date.now() / 1000 - STARTDISTANCETOPATIENTOFCLINICS
    );
    //FIND OUT DISTANCE TO PATIENT OF CLINICS...END

    // SORT DOCTORS BY DISTANCE TO PATIENT........START

    const doctorsAroundPatient = doctors.sort(function (a, b) {
      return (
        a.distanceToPatient.distanceInMeters -
        b.distanceToPatient.distanceInMeters
      );
    });

    // SORT DOCTORS BY DISTANCE TO PATIENT........END

    // SORT CLINICS BY DISTANCE TO PATIENT........START
    const clinicsAroundPatient = clinics.sort(function (a, b) {
      return (
        a.distanceToPatient.distanceInMeters -
        b.distanceToPatient.distanceInMeters
      );
    });
    // SORT CLINICS BY DISTANCE TO PATIENT........END

    // < IF SLIDERVALUE EXISTS FILTER BY DISTANCE IN METERS >

    sliderValue = 0;
    console.log("before slider activate...");
    console.log(sliderValue);
    if (sliderValue > 0) {
      console.log("slider activate...");
      let doctorsAround = doctorsAroundPatient.filter(
        (doc) => doc.distanceToPatient.distanceInMeters <= sliderValue
      );
      let clinicsAround = clinicsAroundPatient.filter(
        (doc) => doc.distanceToPatient.distanceInMeters <= sliderValue
      );
      return {
        doctorsAroundPatient: doctorsAround,
        clinicsAroundPatient: clinicsAround,
      };
    } else {
      // return clinicsAroundPatient;
      return { doctorsAroundPatient, clinicsAroundPatient };
    }
  } catch (err) {
    console.log(
      "error handleGetPatientLocation....return {doctorsAroundPatient, clinicsAroundPatient}",
      err
    );
  }
};
