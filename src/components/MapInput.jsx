import React, { useEffect, useState } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import i18n from "../../i18n";

import { H14fontRegularRed } from "./commonText";

export default function MapInput({
  notifyChange,
  clinicAddressLocation,
  clinicAddress,
  setClinicAddress,
  noCoordsSelected,
}) {
  useEffect(() => {
    console.log("-------------------", clinicAddressLocation);
    console.log("-------------------", clinicAddressLocation.clinicAddress);
    console.log("-------------------", clinicAddress);
  }, []);
  return (
    <>
      {noCoordsSelected && (
        <View>
          <H14fontRegularRed styles={{}}>
            {i18n.translate("addClinicAddress")}
          </H14fontRegularRed>
        </View>
      )}

      <GooglePlacesAutocomplete
        placeholder={i18n.translate("searchAddress")}
        minLength={2} // minimum length of text to search
        autoFocus={true}
        returnKeyType={"search"} // Can be left out for default return key
        listViewDisplayed={false} // true/false/undefined
        fetchDetails={true}
        textInputProps={{
          value: clinicAddress,
          onChangeText: (text) => {
            console.log(
              "inputing text in google autocmplete clini info settings...."
            );
            console.log(text);
            setClinicAddress(text);
          },
        }}
        onPress={async (data, details = null) => {
          let latitude = details.geometry.location.lat;
          let longitude = details.geometry.location.lng;
          let coordObj = { latitude, longitude };
          const address = await Location.reverseGeocodeAsync(coordObj);

          let city = address[0].city;
          console.log("pressed....");
          console.log(data.description);
          setClinicAddress(data.description);
          notifyChange(details.geometry.location, data.description, city);
        }}
        query={{
          key: "AIzaSyDLMmE3p_s7JQebQz4a12YEIYIMILqI06U",
          language: "en",
        }}
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={300}
        styles={{
          container: {
            position: "absolute",
            top: "1.5%",
            left: 0,
            right: "2%",
            zIndex: 1,
            paddingHorizontal: "15%",
            // paddingLeft:"5%"
          },
          description: {
            color: "#000",
            fontSize: 16,
            zIndex: 10,
          },
          predefinedPlacesDescription: {
            fontSize: 16,
            zIndex: 10,
          },
          predefinedPlacesDescription: {
            color: "#3caf50",
            zIndex: 10,
          },
          textInput: {
            height: 40,

            borderColor: "#CFCFCF",
            borderRadius: 5,
            borderWidth: 1,
            // marginTop: 5,
            // marginBottom: 10,
            zIndex: 10,
          },
          // listView: {
          //   position: "absolute",
          //   top: "90.5%",
          //   left: 0,
          //   right: "2%",
          //   zIndex: 10,
          //   paddingHorizontal: "5%",
          // },
        }}
      />
    </>
  );
}
