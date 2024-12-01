import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GeneralProps } from "../interfaces/generalProps";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { NavBar, NavBarPatient } from "../common/commonComponents";
import { useSelector } from "react-redux";
import { colors } from "../utils/colors";
import {
  clinicSettingsSections,
  patientSettingsSections,
  settingsSections,
} from "../utils/constant";
import { screenName } from "../utils/screenName";
import { deleteAccount } from "../utils/deleteAccount";
import CheckCurrentPasswordModal from "../components/CheckCurrentPasswordModal";
import { authentication } from "../../firebase";
import CustomLoader from "../components/customLoader";
import i18n from "../../i18n";
import { handleSignOut } from "../utils/handleSignOut";
import { LinearGradient } from "expo-linear-gradient";
import { H6fontBoldPrimary } from "../components/commonText";

interface Props {}

export const SettingsPage: React.FC<Props> = ({}): JSX.Element => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctorsImages, setDoctorsImages] = useState([]);

  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params;

  const patientInfoDB = useSelector((state) => state.patientInfoData);
  const { patientInformation } = patientInfoDB;
  const clinicInfoDB = useSelector((state) => state.clinicInfoData);
  const { clinicInformation } = clinicInfoDB;
  const allClinicDoctors = useSelector((state) => state.clinicDoctors);
  const { clinicDoctorsInfo, loading } = allClinicDoctors;

  let disableModal;

  const handleDelete = () => {};

  const auth = authentication;
  useEffect(() => {}, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CustomLoader isLoading={isLoading} />
      <LinearGradient
    colors={["#000000", "#434343"]} // Înlocuiește cu culorile gradientului tău
    style={{flex:1}}
  >

      <ScrollView contentContainerStyle={styles.container}>
      <View style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
       <H6fontBoldPrimary>{i18n.translate("settings")}</H6fontBoldPrimary> 
              
  <Image
    source={require('../../assets/headerIcon.png')}
    style={{width: 300, height: 200}}
    resizeMode="contain" // Aceasta va asigura că întreaga imagine se va încadra în spațiul disponibil, păstrând proporțiile.
  />
</View>
      

        {true &&
          clinicSettingsSections.map(({ header, items }) => (
            <View style={styles.section} key={header}>
              {/* <Text style={styles.sectionHeader}>{header}</Text> */}
              {items.map(
                ({ label, icon, type, value, color, screenName }, index) => {
                  if (type === "signout") {
                    return (
                      <TouchableOpacity
                        key={label}
                        onPress={() => {
                          // handle onPress
                          if (type === "signout") {
                            Alert.alert(
                              i18n.translate("deleteAccount"),
                              i18n.translate("sureUWantToDelete"),
                              [
                                {
                                  text: i18n.translate("cancel"),
                                  onPress: () => console.log("Cancel Pressed"),
                                  style: "cancel",
                                },
                                {
                                  text: "OK",
                                  onPress: () => {
                                    handleSignOut().then(() => {
                                      navigation.navigate(screenName);
                                    });
                                  },
                                },
                              ]
                            );
                          }
                        }}
                      >
                        <View style={styles.row}>
                          <View
                            style={[styles.rowIcon, { backgroundColor: color }]}
                          >
                            {/* <FeatherIcon color="#fff" name={icon} size={18} /> */}
                            {icon === "document-text-outline" ? (
                              <Ionicons name={icon} size={20} color="white" />
                            ) : icon === "trash-outline" ? (
                              <Ionicons name={icon} size={20} color="white" />
                            ) : (
                              <MaterialIcons
                                name={icon}
                                size={20}
                                color="white"
                              />
                            )}
                          </View>

                          <Text style={styles.rowLabel}>{label}</Text>

                          <View style={styles.rowSpacer} />

                          {type === "boolean" && <Switch value={value} />}
                        </View>
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <TouchableOpacity
                        key={label}
                        onPress={() => {
                          // handle onPress
                          if (screenName === "deleteAccount") {
                            Alert.alert(
                              i18n.translate("deleteAccount"),
                              i18n.translate("sureUWantToDelete"),
                              [
                                {
                                  text: i18n.translate("cancel"),
                                  onPress: () => console.log("Cancel Pressed"),
                                  style: "cancel",
                                },
                                {
                                  text: "OK",
                                  onPress: () => {
                                    setModalVisible(true);
                                    // deleteAccount(true, patientInformation.oldPatientImage, navigation)
                                  },
                                },
                              ]
                            );
                          } else {
                            navigation.navigate(screenName);
                          }
                        }}
                      >
                        <View style={styles.row}>
                          <View
                            style={[styles.rowIcon, { backgroundColor: color }]}
                          >
                            {/* <FeatherIcon color="#fff" name={icon} size={18} /> */}
                            {icon === "document-text-outline" ? (
                              <Ionicons name={icon} size={20} color="white" />
                            ) : icon === "trash-outline" ? (
                              <Ionicons name={icon} size={20} color="white" />
                            ) : (
                              <MaterialIcons
                                name={icon}
                                size={20}
                                color="white"
                              />
                            )}
                          </View>

                          <Text style={styles.rowLabel}>{label}</Text>

                          <View style={styles.rowSpacer} />

                          {type === "boolean" && <Switch value={value} />}
                          {/* 
                      {type === 'link' && (
                        <FeatherIcon
                          color="#0c0c0c"
                          name="chevron-right"
                          size={22}
                        />
                      )} */}
                        </View>
                      </TouchableOpacity>
                    );
                  }
                }
              )}
            </View>
          ))}
      </ScrollView>
      <CheckCurrentPasswordModal
        setIsModalVisible={setModalVisible}
        isModalVisible={modalVisible}
        handleDeleteAccount={(currentPassword, email) => {
          try {
            if (params.isClinicSettings) {
              setIsLoading(true);
              console.log("Test here...");

              deleteAccount(
                false,
                clinicInformation.oldClinicImages,
                currentPassword,
                email,
                navigation,
                doctorsImages
              ).then(() => {
                setIsLoading(false);
                console.log("-----s---------");
                // console.log(disableModal)
                setModalVisible(false);
              });
            } else {
              console.log(patientInformation.email);
              setIsLoading(true);

              deleteAccount(
                true,
                patientInformation.oldPatientImage,
                currentPassword,
                patientInformation.email,
                navigation
              ).then(() => {
                setIsLoading(false);
                setModalVisible(false);
              });

              // if(disableModal){
              //   setModalVisible(false)
              // }
            }
          } catch (err) {
            console.log("there was an error delleting an account...", err);
          }
        }}
      />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingVertical: 24,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#9e9e9e",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  profile: {
    padding: 24,
    backgroundColor: "transparent",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 9999,
  },
  profileAvatarWrapper: {
    position: "relative",
  },
  profileAction: {
    position: "absolute",
    right: -4,
    bottom: -10,
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: "transparent",
  },
  profileName: {
    marginTop: 20,
    fontSize: 19,
    // fontWeight: "600",
    // color: "#414d63",
    textAlign: "center",
  },
  profileAddress: {
    marginTop: 5,
    fontSize: 16,
    color: "#989898",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 50,
    backgroundColor: "transparent",
    borderRadius: 8,
    marginBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "400",
    color: "white",
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
});
