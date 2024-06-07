import React, { Fragment, useEffect } from "react";
import {
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { GeneralProps } from "../../interfaces/generalProps";
import { Route } from "@react-navigation/native";
import { NavBar, NavBarPatient } from "../../common/commonComponents";
import {
  CardSurface,
  CommonLineDotted,
  MainContainer,
  RowView,
} from "../../components/commonViews";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
// import Icon from 'react-native-vector-icons/FontAwesome';
import {
  H10fontRegularBlack,
  H14fontRegularBlackk,
  H6fontRegularBlack,
  H6fontRegularBlue,
  H7fontMediumBlack,
  H8fontMediumBlack,
  H8fontMediumBlue,
  H8fontMediumLightBlack,
  H9fontMediumBlack,
  H9fontMediumBlue,
  H9fontRegularGray,
} from "../../components/commonText";
import { colors } from "../../utils/colors";
import { screenName } from "../../utils/screenName";
// import {DevWidth} from '../../utils/device';
import { Dimensions } from "react-native";

import Patient from "../../../assets/images/patient.svg";
import Patient7 from "../../../assets/images/blank-profile.svg";
import {
  retrieveClinicDoctors,
  retrieveClinicPatients,
} from "../../utils/getFirebaseData";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, Searchbar } from "react-native-paper";
import { labels } from "../../utils/labels";
import { getClinicDoctors } from "../../actions/clinicActions";
import { TouchableHighlight } from "react-native-gesture-handler";
import { deleteDoctorFromClinic } from "../../utils/deleteFirebaseData";
import i18n from "../../../i18n";

import { extendMoment } from "moment-range";
import Moment from "moment";
import { initiateSMSDeleteDoctor } from "../../utils/initiateSms";
import useRevenueCat from "../../hooks/useRevenueCat";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const ClinicDoctors: React.FC<Props> = ({ navigation, route }): JSX.Element => {
  const { currentOffering, customerInfo, isProMember } = useRevenueCat();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [isDescending, setIsDescending] = React.useState(false);
  const [searchedDoctors, setSearchedDoctors] = React.useState([]);
  const [thirdQuery, setThirdQuery] = React.useState<string>("");

  const momentExtended = extendMoment(Moment);

  const allClinicDoctors = useSelector((state) => state.clinicDoctors);
  const { clinicDoctorsInfo, loading } = allClinicDoctors;

  const dispatch = useDispatch();

  const handleFinalDeleteDoctor = (doctorId, doctorImg) => {
    console.log("final", doctorId);
    deleteDoctorFromClinic(doctorId, doctorImg);
    dispatch(getClinicDoctors());
    // setTimeout(() => {
    // }, 1200);
  };

  const handleDeleteDoctor = (doctorId, doctorImg, item) => {
    let phoneNumbers = [];
    console.log("item-----");
    // console.log(item.clinicAppointments)

    for (let i = 0; i < item.clinicAppointments.length; i++) {
      phoneNumbers.push(item.clinicAppointments[i].phoneNumber);
    }

    if (item.clinicAppointmentsUnregistered) {
      for (let i = 0; i < item.clinicAppointmentsUnregistered.length; i++) {
        phoneNumbers.push(item.clinicAppointmentsUnregistered[i].phoneNumber);
      }
      console.log(phoneNumbers);
      if (item.clinicAppointmentsUnregistered.length > 0) {
        Alert.alert(
          i18n.translate("doctorHasAppoitments"),
          i18n.translate("doctorHasAppoitmentsMessage"),
          [
            {
              text: i18n.translate("cancel"),
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: i18n.translate("deleteDoctor"),
              onPress: () => {
                handleFinalDeleteDoctor(doctorId, doctorImg);
                // handleFinalDeleteDoctor(doctorId, doctorImg, true)
              },
            },
            {
              text: i18n.translate("sendReminderAndDeleteDoctor"),
              onPress: () => {
                initiateSMSDeleteDoctor(
                  phoneNumbers,
                  item.doctorInfoData.firstname,
                  item.doctorInfoData.lastname
                ).then(() => {
                  handleFinalDeleteDoctor(doctorId, doctorImg);
                });
              },
            },
          ]
        );
        return;
      }
    }
    if (item.clinicAppointments.length > 0) {
      Alert.alert(
        i18n.translate("doctorHasAppoitments"),
        i18n.translate("doctorHasAppoitmentsMessage"),
        [
          {
            text: i18n.translate("cancel"),
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: i18n.translate("deleteDoctor"),
            onPress: () => handleFinalDeleteDoctor(doctorId, doctorImg, true),
          },
          {
            text: i18n.translate("sendReminder"),
            onPress: () => {
              initiateSMSDeleteDoctor(
                phoneNumbers,
                item.doctorInfoData.firstname,
                item.doctorInfoData.lastname
              ).then(() => {
                handleFinalDeleteDoctor(doctorId, doctorImg);
              });
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      i18n.translate("removeDoctor"),
      i18n.translate("removeDoctorMessage"),
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => handleFinalDeleteDoctor(doctorId, doctorImg, false),
        },
      ]
    );
  };

  const handleSearchApp = (txt) => {
    console.log("-------------Searching.......-------------");
    let searchResult;
    try {
      searchResult = clinicDoctorsInfo.filter((app) => {
        let fullDocName =
          app.doctorInfoData.firstname + " " + app.doctorInfoData.lastname;
        return (
          fullDocName.toLowerCase().includes(txt.toLowerCase()) ||
          app.doctorInfoData.specializations
            .toLowerCase()
            .includes(txt.toLowerCase()) ||
          app.doctorInfoData.services.toLowerCase().includes(txt.toLowerCase())
        );
      });

      if (txt.length === 0) {
        setSearchedDoctors([]);
      } else {
        setSearchedDoctors(searchResult);
      }
    } catch (err) {
      console.log("error...searching appointemnts in handle search....", err);
    }
  };

  // FOR ADDING FILTERS IN THE FUTURE
  const handleApplyFilter = (isDescending?) => {
    // console.log(sortBy)

    let newArrApp = [];
    let arrayToFilter = [];
    if (thirdQuery.length > 0) {
      console.log("is searching with text...");

      arrayToFilter = searchedDoctors;
    } else {
      arrayToFilter = clinicDoctorsInfo;
    }

    //START SORT
    newArrApp = arrayToFilter.sort((a, b) => {
      if (isDescending) {
        return a.doctorInfoData.firstname.localeCompare(
          b.doctorInfoData.firstname
        );
      } else {
        return b.doctorInfoData.firstname.localeCompare(
          a.doctorInfoData.firstname
        );
      }
    });

    setSearchedDoctors(newArrApp);
  };

  useEffect(() => {
    console.log("---isProMember------------------------");
    console.log(isProMember);
    // console.log(clinicDoctorsInfo[0].servicesList)

    // retrieveClinicDocto6rs()
  }, []);

  const dialContact = (number) => {
    if (Platform.OS === "ios") {
      number = `telprompt:${number}`;
      console.log("IOS...");
    } else {
      console.log("ANDROID...");
      number = `tel:${number}`;
    }
    Linking.openURL(number);
  };

  if (loading) {
    return (
      <View style={[styles.containerLoader, styles.horizontal]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Fragment>
      <MainContainer>
        <NavBar
          title={i18n.translate("clinicDoctors")}
          navHeight={80}
          isModal={false}
          isTermsAccepted={true}
          isGoBack={route.params && route.params.isGoBack}
          isFirstDoctors={route.params && route.params.isFirstDoctors}
        />

        <View
          style={{
            height: 85,
            backgroundColor: "white",
            padding: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            // alignItems: 'center',
            width: "100%",
          }}
        >
          <View
            style={{
              height: "100%",
              width: "60%",
              backgroundColor: "white",
              // padding: 10,
              // alignItems: 'center',
              flexDirection: "row",
            }}
          >
            <CardSurface
              style={{
                borderRadius: 40,
                height: 60,
                width: 60,
                backgroundColor: "white",
              }}
            >
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                {/* <Patient height={35} width={28} /> */}
                {/* <Fontisto name="doctor" size={36} color={colors.facebook} /> */}
                <Image
                  style={{ height: 60, width: 60, bottom: 5 }}
                  source={require("../../images/professionals.png")}
                />
              </View>
            </CardSurface>
            <View style={{ paddingLeft: 10, paddingTop: 5, width: "80%" }}>
              <H8fontMediumBlack>
                {i18n.translate("clinicDoctorsList")}
              </H8fontMediumBlack>
              <H9fontRegularGray>{clinicDoctorsInfo.length}</H9fontRegularGray>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              // if (isProMember || clinicDoctorsInfo.length === 0) {
              navigation.navigate(screenName.DoctorProfileSettings);
              //   } else {
              //     navigation.navigate(screenName.Subscription);
              //   }
              // }}
            }}
            style={{ width: "auto" }}
          >
            <CardSurface
              style={{
                borderRadius: 20,
                height: 30,
                Width: "100%",
                backgroundColor: colors.white,
                paddingHorizontal: 0,
                paddingVertical: 0,
                justifyContent: "space-around",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Feather
                name="user-plus"
                size={18}
                color="black"
                style={{ paddingLeft: 4, marginLeft: "2%" }}
              />
              <H9fontMediumBlack style={{ paddingRight: 4 }}>
                {i18n.translate("addDoctor")}
              </H9fontMediumBlack>
            </CardSurface>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Searchbar
            placeholder={i18n.translate("search")}
            onChangeText={(query: string) => {
              setThirdQuery(query);
              handleSearchApp(query);
            }}
            value={thirdQuery}
            style={{ margin: 4, width: "85%", marginTop: 10 }}
          />

          {
            <TouchableOpacity
              onPress={() => {
                handleApplyFilter(!isDescending);
                setIsDescending(!isDescending);
              }}
            >
              {isDescending ? (
                <MaterialCommunityIcons
                  name="sort-descending"
                  size={24}
                  color="black"
                />
              ) : (
                <MaterialCommunityIcons
                  name="sort-ascending"
                  size={24}
                  color="black"
                />
              )}
            </TouchableOpacity>
          }
        </View>

        {/* <DoctorFilters sortBy={sortBy} unregisteredPatient={unregisteredPatient} setUnregisteredPatient={setUnregisteredPatient} handleApplyFilter={handleApplyFilter} selectedRange={selectedRange} setModalVisible={setModalVisible} modalVisible={ modalVisible} setSortBy={setSortBy} setRange={setRange} setRegisteredPatient={setRegisteredPatient} registeredPatient = {registeredPatient}/> */}

        <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
          {searchedDoctors.length !== 0 && searchedDoctors ? (
            <View style={{ paddingHorizontal: 10, paddingTop: 5 }}>
              {searchedDoctors.map((item, index) => (
                <CardSurface
                  key={index}
                  style={{
                    height: "auto",
                    backgroundColor: "white",
                    borderRadius: 10,
                    paddingHorizontal: 15,
                  }}
                >
                  <RowView
                    style={{
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        maxWidth: "65%",
                      }}
                    >
                      <H9fontMediumBlack numberOfLines={2}>
                        {item.doctorInfoData && item.doctorInfoData.firstname}{" "}
                        {item.doctorInfoData && item.doctorInfoData.lastname}
                      </H9fontMediumBlack>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",

                        justifyContent: "space-between",
                        width: "34%",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate(screenName.DoctorCalendarTime, {
                            item,
                          })
                        }
                        style={{ width: 30, borderRadius: 20 }}
                      >
                        <CardSurface
                          style={{
                            borderRadius: 20,
                            height: 30,
                            Width: "100%",
                            backgroundColor: colors.blue,
                            paddingHorizontal: 0,
                            paddingVertical: 0,
                            justifyContent: "space-around",
                            alignItems: "center",
                            flexDirection: "row",
                          }}
                        >
                          <Feather name="calendar" size={20} color="white" />
                        </CardSurface>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate(
                            screenName.DoctorProfileSettings,
                            {
                              item,
                            }
                          )
                        }
                        style={{ width: 30, borderRadius: 20 }}
                      >
                        <CardSurface
                          style={{
                            borderRadius: 20,
                            height: 30,
                            Width: "100%",
                            backgroundColor: colors.green,
                            paddingHorizontal: 0,
                            paddingVertical: 0,
                            justifyContent: "space-around",
                            alignItems: "center",
                            flexDirection: "row",
                          }}
                        >
                          <Feather name="edit" size={20} color="white" />
                        </CardSurface>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleDeleteDoctor(item.doctorId, item.doctorId)
                        }
                        style={{ width: 30, borderRadius: 20 }}
                      >
                        <CardSurface
                          style={{
                            borderRadius: 20,
                            height: 30,
                            Width: "100%",
                            backgroundColor: colors.red,
                            paddingHorizontal: 0,
                            paddingVertical: 0,
                            justifyContent: "space-around",
                            alignItems: "center",
                            flexDirection: "row",
                          }}
                        >
                          <Feather name="trash" size={20} color="white" />
                        </CardSurface>
                      </TouchableOpacity>
                    </View>
                  </RowView>
                  <CommonLineDotted />
                  <RowView>
                    <View
                      style={{
                        // padding: 5,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          height: 80,
                          width: 80,
                          borderRadius: 60,
                          overflow: "hidden",
                          marginTop: 5,
                        }}
                      >
                        {item.doctorImg ? (
                          <Image
                            source={{ uri: item.doctorImg }}
                            style={{ height: "100%", width: "100%" }}
                          />
                        ) : (
                          <Patient7 height={60} width={60} />
                        )}
                      </View>

                      <View style={{ paddingLeft: 10 }}>
                        {/* <H8fontMediumBlack>
                          {item.doctorInfoData && item.doctorInfoData.firstname}{' '}
                          {item.doctorInfoData && item.doctorInfoData.lastname}
                        </H8fontMediumBlack> */}
                        <RowView
                          style={{
                            width: Dimensions.get("window").width / 1.53,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              paddingVertical: 5,
                            }}
                          >
                            <H8fontMediumLightBlack numberOfLines={2}>
                              <H8fontMediumBlue>
                                {i18n.translate("specializations")}:{" "}
                              </H8fontMediumBlue>{" "}
                              {item.doctorInfoData &&
                                item.doctorInfoData.specializations}{" "}
                            </H8fontMediumLightBlack>
                          </View>
                        </RowView>
                        <RowView
                          style={{
                            width: Dimensions.get("window").width / 1.53,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              paddingVertical: 5,
                            }}
                          >
                            <H8fontMediumLightBlack numberOfLines={2}>
                              <H8fontMediumBlue>
                                {i18n.translate("services")}:{" "}
                              </H8fontMediumBlue>{" "}
                              {item.servicesList.map((service, index) => (
                                <H8fontMediumLightBlack numberOfLines={2}>
                                  {index >= 1 ? `, ${service}` : `${service}`}
                                </H8fontMediumLightBlack>
                              ))}
                            </H8fontMediumLightBlack>
                          </View>
                        </RowView>
                      </View>
                    </View>
                  </RowView>
                </CardSurface>
              ))}
            </View>
          ) : clinicDoctorsInfo.length !== 0 &&
            thirdQuery.length === 0 &&
            clinicDoctorsInfo ? (
            <View style={{ paddingHorizontal: 10, paddingTop: 5 }}>
              {clinicDoctorsInfo.map((item, index) => (
                <CardSurface
                  key={index}
                  style={{
                    height: "auto",
                    backgroundColor: "white",
                    borderRadius: 10,
                    paddingHorizontal: 15,
                  }}
                >
                  <RowView
                    style={{
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        maxWidth: "65%",
                      }}
                    >
                      <H9fontMediumBlack numberOfLines={2}>
                        {item.doctorInfoData && item.doctorInfoData.firstname}{" "}
                        {item.doctorInfoData && item.doctorInfoData.lastname}
                      </H9fontMediumBlack>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",

                        justifyContent: "space-between",
                        width: "34%",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate(screenName.DoctorCalendarTime, {
                            item,
                          })
                        }
                        style={{ width: 30, borderRadius: 20 }}
                      >
                        <CardSurface
                          style={{
                            borderRadius: 20,
                            height: 30,
                            Width: "100%",
                            backgroundColor: colors.blue,
                            paddingHorizontal: 0,
                            paddingVertical: 0,
                            justifyContent: "space-around",
                            alignItems: "center",
                            flexDirection: "row",
                          }}
                        >
                          <Feather name="calendar" size={20} color="white" />
                        </CardSurface>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate(
                            screenName.DoctorProfileSettings,
                            {
                              item,
                            }
                          )
                        }
                        style={{ width: 30, borderRadius: 20 }}
                      >
                        <CardSurface
                          style={{
                            borderRadius: 20,
                            height: 30,
                            Width: "100%",
                            backgroundColor: colors.green,
                            paddingHorizontal: 0,
                            paddingVertical: 0,
                            justifyContent: "space-around",
                            alignItems: "center",
                            flexDirection: "row",
                          }}
                        >
                          <Feather name="edit" size={20} color="white" />
                        </CardSurface>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleDeleteDoctor(
                            item.doctorId,
                            item.oldDoctorImage,
                            item
                          )
                        }
                        style={{ width: 30, borderRadius: 20 }}
                      >
                        <CardSurface
                          style={{
                            borderRadius: 20,
                            height: 30,
                            Width: "100%",
                            backgroundColor: colors.red,
                            paddingHorizontal: 0,
                            paddingVertical: 0,
                            justifyContent: "space-around",
                            alignItems: "center",
                            flexDirection: "row",
                          }}
                        >
                          <Feather name="trash" size={20} color="white" />
                        </CardSurface>
                      </TouchableOpacity>
                    </View>
                  </RowView>
                  <CommonLineDotted />
                  <RowView>
                    <View
                      style={{
                        // padding: 5,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          height: 80,
                          width: 80,
                          borderRadius: 60,
                          overflow: "hidden",
                          marginTop: 5,
                        }}
                      >
                        {item.doctorImg ? (
                          <Image
                            source={{ uri: item.doctorImg }}
                            style={{ height: "100%", width: "100%" }}
                          />
                        ) : (
                          <Patient7 height={"100%"} width={"100%"} />
                        )}
                      </View>

                      <View style={{ paddingLeft: 10 }}>
                        {/* <H8fontMediumBlack>
                          {item.doctorInfoData && item.doctorInfoData.firstname}{' '}
                          {item.doctorInfoData && item.doctorInfoData.lastname}
                        </H8fontMediumBlack> */}
                        <RowView
                          style={{
                            width: Dimensions.get("window").width / 1.53,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              paddingVertical: 5,
                            }}
                          >
                            <H8fontMediumLightBlack numberOfLines={2}>
                              <H8fontMediumBlue>
                                {i18n.translate("specializations")}:{" "}
                              </H8fontMediumBlue>{" "}
                              {item.doctorInfoData &&
                                item.doctorInfoData.specializations}{" "}
                            </H8fontMediumLightBlack>
                          </View>
                        </RowView>
                        <RowView
                          style={{
                            width: Dimensions.get("window").width / 1.53,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              paddingVertical: 5,
                            }}
                          >
                            <H8fontMediumLightBlack numberOfLines={2}>
                              <H8fontMediumBlue>
                                {i18n.translate("services")}:{" "}
                              </H8fontMediumBlue>{" "}
                              {item.servicesList.map((service, index) => (
                                <H8fontMediumLightBlack
                                  numberOfLines={2}
                                  key={index}
                                >
                                  {index >= 1 ? `, ${service}` : `${service}`}
                                </H8fontMediumLightBlack>
                              ))}
                            </H8fontMediumLightBlack>
                          </View>
                        </RowView>
                      </View>
                    </View>
                  </RowView>
                </CardSurface>
              ))}
            </View>
          ) : (
            <View style={{ paddingHorizontal: 10, paddingTop: 20 }}>
              <H6fontRegularBlue>
                {i18n.translate("noDoctorsAdded")}
              </H6fontRegularBlue>
            </View>
          )}
        </ScrollView>
      </MainContainer>
    </Fragment>
  );
};
export default ClinicDoctors;

const styles = StyleSheet.create({
  containerLoader: {
    flex: 1,
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
    width: "100%",
  },
});
