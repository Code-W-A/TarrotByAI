import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export const MyMapView = (props: any) => {
  console.log("Asdasddasd");
  console.log(props.region);
  console.log(props.clinicCoords);
  return (
    <MapView
      style={{ height: "100%", width: "100%" }}
      region={props.region}
      showsUserLocation={true}
      provider={PROVIDER_GOOGLE}
      onPress={props.handleMapPress}
      // onPress={() => console.log("mappressed...")}
      // onRegionChange={reg => props.onRegionChange(reg)}
    >
      <Marker
        coordinate={
          props.clinicCoords.lat
            ? {
                latitude: props.clinicCoords.lat,
                longitude: props.clinicCoords.lng,
              }
            : props.region
        }
      />
    </MapView>
  );
};
