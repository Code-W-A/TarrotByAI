import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import { colors } from "../../../utils/colors";
import { fetchTimeZone } from "../../../utils/AstralUtils/fetchNatalWheelChart";
import i18n from "../../../../i18n";

export default function MapInputPatientDash({
  notifyChange,
  setLocation,
  ref,
  value,
  setAdress,
  setLong,
  setLat,
  place,
  adress,
}) {
  useEffect(() => {
    // Placeholder for additional logic
  }, []);

  return (
    <GooglePlacesAutocomplete
      placeholder={i18n.translate("CautaAdresa")}
      minLength={2}
      autoFocus={true}
      returnKeyType="search"
      listViewDisplayed="auto"
      fetchDetails={true}
      textInputProps={{
        placeholderTextColor: colors.grayText,
        returnKeyType: "search",
        value: adress,
        onChangeText: (text) => {
          console.log("inputing in google autocomplete");
          console.log(text);
          if (text.length === 0) {
            setAdress(text);
          }
          setAdress(text);
        },
      }}
      onFail={(error) =>
        console.log("error...ON GOOGLE PLACES AUTOCMPLETE...", error)
      }
      onNotFound={() => console.log("no results")}
      onPress={async (data, details = null) => {
        let latitude = details.geometry.location.lat;
        let longitude = details.geometry.location.lng;
        let coordObj = { latitude, longitude };
        console.log("data....", data);
        // const address = await Location.reverseGeocodeAsync(coordObj);

        console.log("set locations....", data);
        setAdress(data.description);
        setLocation(data.description);
        setLat(details.geometry.location.lat);
        setLong(details.geometry.location.lng);
      }}
      query={{
        key: "AIzaSyBRgP4D08BVgzw4oyWfZZ9Rx2mjNouePj4",
        language: "en",
        // types: "(cities)",
      }}
      debounce={800}
      styles={{
        textInput: {
          height: 55,
          color: "#fff", // Text color
          paddingHorizontal: 10,
          fontSize: 15, // Adjust font size to match other inputs
          borderWidth: 0.5,
          borderColor: colors.primary3, // Border color
          backgroundColor: colors.primary3, // Background color
          borderRadius: 35, // Rounded corners
        },
        textInputContainer: {
          paddingHorizontal: 0,
          paddingTop: 12, // Padding top for container
          backgroundColor: "transparent", // Make the container background transparent
          borderBottomWidth: 0, // Remove bottom border if not needed
          alignItems: "center",
        },
        listView: {
          backgroundColor: "white",
          position: "absolute", // Confirm it's positioned absolutely
          zIndex: 1000, // Increase zIndex to ensure it's on top
          top: "90%", // Adjust the top position as necessary
          width: "100%", // Make sure it spans the width
        },
        description: {
          fontWeight: "bold",
        },
        predefinedPlacesDescription: {
          color: "#1faadb",
        },
      }}
    />
  );
}
