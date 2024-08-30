import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Geocoder from 'react-native-geocoding';
// import Geolocation from '@react-native-community/geolocation';

// export const getLocation = () => {
//   return new Promise((resolve, reject) => {
//     // navigator.geolocation.getCurrentPosition(
//     Geolocation.getCurrentPosition(
//       data => resolve(data.coords),
//       err => reject(err),
//     );
//   });
// };

export const _getLocationAsync = async () => {
 
  let {status} = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') {
    console.log('Permission not granted');
  }
  let location = await Location.getCurrentPositionAsync({});
  // const address = await reverseGeocode(location);
  // setLocation(location);
  // console.log(address);
  // console.log(location);
  return location;
};

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
    console.log('error on reverseGeocodedAddress', err);
  }

  return reverseGeocodedAddress;
};

export const geocodeLocationByCoords = (lat, long) => {
  return new Promise((resolve, reject) => {
    Geocoder.from(lat, long)
      .then(json => {
        const addressComponent = json.results[0].address_components[0];
        resolve(addressComponent);
      })
      .catch(error => reject(error));
  });
};
