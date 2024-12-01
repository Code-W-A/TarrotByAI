import * as Location from "expo-location";

export const reverseGeocode = async (longitude, latitude) => {
  // console.log('asdadssd');
  let reverseGeocodedAddress;
  try {
    reverseGeocodedAddress = await Location.reverseGeocodeAsync({
      longitude: longitude,
      latitude: latitude,
    });
    // console.log('Reverse Geocode:');
    // console.log(reverseGeocodedAddress);
  } catch (err) {
    console.log("error on reverseGeocodedAddress", err);
  }

  return reverseGeocodedAddress;
};
