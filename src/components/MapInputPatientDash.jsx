import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Dimensions } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { labels } from "../utils/labels";
import i18n from "../../i18n";
import { colors } from "../utils/colors";
import * as Location from "expo-location";

export default function MapInputPatientDash({
  notifyChange,
  setLocation,
  ref,
  value,
  noLocation,
  setCity,
  city,
}) {
  useEffect(() => {
    // setClinicAddress(clinicAddressLocation.clinicAddress);
    console.log("-------------------", noLocation);
    // console.log('-------------------', clinicAddressLocation.clinicAddress);
    // console.log('-------------------', clinicAddress);
  }, []);

  // const internalInputRef = useRef();
  // useImperativeHandle(ref, () => ({
  //   blur: () => {
  //     internalInputRef.current.blur();
  //   }
  // }));

  return (
    <GooglePlacesAutocomplete
      filterReverseGeocodingByTypes={[
        "locality",
        "administrative_area_level_3",
      ]}
      placeholder={
        noLocation
          ? i18n.translate("noLocationAdded")
          : i18n.translate("searchLocation")
      }
      placeholderTextColor={"red"}
      minLength={2}
      autoFocus={true}
      returnKeyType={"search"}
      listViewDisplayed={false}
      fetchDetails={true}
      textInputProps={{
        placeholderTextColor: noLocation ? "red" : colors.lightGray,
        returnKeyType: "search",
        value: value,
        onChangeText: (text) => {
          console.log("inputing in google autocomplete");
          console.log(text);
          if (text.length === 0) {
            setLocation(text);
          }
          setLocation(text);
        },
      }}
      onPress={async (data, details = null) => {
        let latitude = details.geometry.location.lat;
        let longitude = details.geometry.location.lng;
        let coordObj = { latitude, longitude };
        const address = await Location.reverseGeocodeAsync(coordObj);
        let city = address[0].city;
        console.log("set locations....");
        console.log(data.description);
        setLocation(data.description);
        console.log(city);
        setCity(city);
      }}
      query={{
        key: "AIzaSyDLMmE3p_s7JQebQz4a12YEIYIMILqI06U",
        language: "en",
        types: "(cities)", // Specify that you want to get only city results
      }}
      nearbyPlacesAPI="GooglePlacesSearch"
      debounce={300}
      styles={{
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
          // marginRight: 45,
          borderBottomWidth: 1,
          borderBottomColor: "#ced4da",

          width: Dimensions.get("window").width / 1.45,
          height: 40,
          zIndex: 10,
        },
        listView: {
          top: 45.5,
          zIndex: 10,
          position: "absolute",
          color: "black",
          backgroundColor: "white",
          width: "100%",
        },
        textInputContainer: {
          // marginRight: 45,
          borderBottomWidth: 1,
          borderBottomColor: "#ced4da",
          width: Dimensions.get("window").width / 1.45,
          zIndex: 10,
          height: 40,
        },
      }}
    />
  );
}
