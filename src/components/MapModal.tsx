import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import { Badge, Text, TextInput } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "../utils/colors";
import { Entypo } from "@expo/vector-icons";
import ClinicDetailsCard from "./ClinicComponents";
import { useNavigation } from "@react-navigation/native";
import { screenName } from "../utils/screenName";
import DoctorDetailsCard from "./doctorComponents";

export default function MapModal({
  isVisible,
  setIsVisible,
  doctorsAround,
  patientLocation,
  isDoctors,
  children,
  toggleModal,
  isGoBack,
}) {
  const [mapType, setMapType] = useState("standard");
  const [selectedItem, setSelectedItem] = useState([]);
  const navigation = useNavigation();
  //OR HYBRID
  useEffect(() => {
    // console.log("selectedItem...",selectedItem[0].clinicDoctors)
    // console.log("doctorsAround...",doctorsAround[0].isClinic)
    // console.log("selectedItem...", selectedItem[0].clinicDoctors.length)
  });

  let coordsArr = [];

  // return(
  //   <View>
  //     <Text>
  //       asda
  //     </Text>
  //   </View>
  // )

  return (
    // <View style={styles.container}>

    <Modal visible={isVisible}></Modal>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
});
