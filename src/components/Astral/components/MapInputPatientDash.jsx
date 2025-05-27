import React, { useEffect, useRef, useState } from "react";
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
  calculateTimeZone,
  currentStep, // Adaugăm currentStep ca prop
}) {
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
          if (text !== adress) {
            setAdress(text);
          }
          // console.log(text);
          // if (text.length === 0) {
          //   setAdress(text);
          // }
          // setAdress(text);
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
        calculateTimeZone(
          details.geometry.location.lat,
          details.geometry.location.lng
        );
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
          color: '#FFD700',
          paddingHorizontal: 16,
          fontSize: 16,
          fontFamily: 'Lora',
          borderWidth: 1.5,
          borderColor: '#FFD700',
          backgroundColor: '#fff',
          borderRadius: 22,
          shadowColor: '#FFD700',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        },
        textInputContainer: {
          paddingHorizontal: 0,
          paddingTop: 12,
          backgroundColor: 'transparent',
          borderBottomWidth: 0,
          alignItems: 'center',
        },
        listView: {
          backgroundColor: 'white',
          position: 'absolute',
          zIndex: 1000,
          top: '90%',
          width: '100%',
        },
        description: {
          fontWeight: 'bold',
          color: '#FFD700',
          fontFamily: 'Lora',
        },
        predefinedPlacesDescription: {
          color: '#1faadb',
        },
      }}
    />
  );
}
