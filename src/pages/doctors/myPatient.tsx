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
import { Fontisto, MaterialCommunityIcons } from "@expo/vector-icons";

import {
  CardSurface,
  CommonLineDotted,
  MainContainer,
  RowView,
} from "../../components/commonViews";
import { Feather } from "@expo/vector-icons";
// import Icon from 'react-native-vector-icons/FontAwesome';
import {
  H14fontMediumBlack,
  H14fontRegularBlackk,
  H14fontRegularGray,
  H6fontRegularBlue,
  H8fontMediumBlack,
  H9fontMediumBlack,
  H9fontRegularGray,
} from "../../components/commonText";
import { colors } from "../../utils/colors";
import { screenName } from "../../utils/screenName";
// import {DevWidth} from '../../utils/device';
import { Dimensions } from "react-native";

import { retrieveClinicPatients } from "../../utils/getFirebaseData";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, Searchbar, Text } from "react-native-paper";
import { labels } from "../../utils/labels";
import i18n from "../../../i18n";
import { deletePatientFromClinic } from "../../utils/deleteFirebaseData";
import { getPatientsOfClinic } from "../../actions/clinicActions";
import { useAppSelector } from "../../hooks/hooks";
import useRevenueCat from "../../hooks/useRevenueCat";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const MyPatient: React.FC<Props> = ({ navigation, route }): JSX.Element => {
  const { currentOffering, customerInfo, isProMember } = useRevenueCat();

  const [searchedPatients, setSearchedPatients] = React.useState([]);

  const dispatch = useDispatch();

  const allClinicsPatients = useAppSelector((state) => state.clinicsPatients);
  const { clinicsPatients, loading } = allClinicsPatients;

  const [thirdQuery, setThirdQuery] = React.useState<string>("");
  const [isDescending, setIsDescending] = React.useState(false);

  const handlePatients = async () => {
    await retrieveClinicPatients();
  };

  const handleSearchApp = (txt) => {
    console.log("-------------Searching.......-------------");
    let searchResult;
    try {
      searchResult = clinicsPatients.filter((app) => {
        let fullPatientName =
          app.basicInfoData.firstName + " " + app.basicInfoData.lastName;
        return (
          fullPatientName.toLowerCase().includes(txt.toLowerCase()) ||
          app.phoneNumber.toLowerCase().includes(txt.toLowerCase())
        );
      });

      if (txt.length === 0) {
        setSearchedPatients([]);
      } else {
        setSearchedPatients(searchResult);
      }
    } catch (err) {
      console.log("error...searching appointemnts in handle search....", err);
    }
  };

  useEffect(() => {
    console.log("--------------searchedPatients-----------------");
    console.log("searchedPatients.............", searchedPatients);

    // handlePatients();
    // retrieveClinicPatients();
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

  const handleApplyFilter = (isDescending?) => {
    // console.log(sortBy)

    let newArrApp;
    let arrayToFilter;
    if (thirdQuery.length > 0) {
      console.log("is searching with text...");
      console.log(searchedPatients);
      arrayToFilter = searchedPatients;
    } else {
      arrayToFilter = clinicsPatients;
    }

    //START SORT
    newArrApp = arrayToFilter.sort((a, b) => {
      if (isDescending) {
        return a.basicInfoData.firstName.localeCompare(
          b.basicInfoData.firstName
        );
      } else {
        return b.basicInfoData.firstName.localeCompare(
          a.basicInfoData.firstName
        );
      }
    });

    console.log("finall...");
    console.log(newArrApp);
    setSearchedPatients(newArrApp);
  };

  // return(
  //   <View>
  //     <Text>
  //       asdasdsd
  //     </Text>
  //   </View>
  // )

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
          title={i18n.translate("clinicPatients")}
          navHeight={80}
          isModal={false}
          isTermsAccepted={true}
          isGoBack={route.params.isGoBack}
        />
        <View
          style={{
            height: 85,
            backgroundColor: "white",
            padding: 10,
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
              {/* <Fontisto name="persons" size={34} color={colors.facebook} /> */}
              <Image
                style={{ height: "100%", width: "140%" }}
                source={require("../../images/clients.png")}
              />
            </View>
          </CardSurface>
          <View style={{ paddingLeft: 10, paddingTop: 5 }}>
            <H8fontMediumBlack>
              {i18n.translate("patientsList")}
            </H8fontMediumBlack>
            <H9fontRegularGray>{clinicsPatients.length}</H9fontRegularGray>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Searchbar
            placeholder="Search"
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
        <ScrollView>
          {searchedPatients.length !== 0 && searchedPatients ? (
            <View style={{ paddingHorizontal: 10, paddingTop: 5 }}>
              {searchedPatients.map((item, index) => (
                <CardSurface
                  key={index}
                  style={{
                    height: "auto",
                    backgroundColor: "white",
                    borderRadius: 10,
                    paddingHorizontal: 15,
                  }}
                >
                  <RowView>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {!item.basicInfoData ? (
                        <H9fontMediumBlack style={{ paddingLeft: 5 }}>
                          {i18n.translate("patientDoesNotHaveInfoSet")}
                        </H9fontMediumBlack>
                      ) : !item.basicInfoData.town &&
                        !item.basicInfoData.country ? (
                        <H9fontMediumBlack style={{ paddingLeft: 5 }}>
                          {i18n.translate("patientDoesNotHaveInfoSetLocation")}
                        </H9fontMediumBlack>
                      ) : (
                        <H9fontMediumBlack style={{ paddingLeft: 5 }}>
                          {item.basicInfoData.town}
                          {item.basicInfoData.town.length > 0 &&
                            item.basicInfoData.country.length > 0 &&
                            ", "}
                          {item.basicInfoData.country}
                        </H9fontMediumBlack>
                      )}
                    </View>
                  </RowView>
                  <CommonLineDotted />
                  <RowView>
                    <View style={{ padding: 5, flexDirection: "row" }}>
                      <View
                        style={{
                          height: 60,
                          width: 60,
                          borderRadius: 60,
                          overflow: "hidden",
                        }}
                      >
                        {item.patientImgURI ? (
                          <Image
                            source={{ uri: item.patientImgURI }}
                            style={{ height: "100%", width: "100%" }}
                          />
                        ) : (
                          // <Fontisto name="person" size={74} color={colors.facebook} />
                          <Image
                            style={{ height: "230%", width: "160%" }}
                            source={require("../../images/clients.png")}
                          />
                        )}
                      </View>

                      <View style={{ paddingLeft: 10 }}>
                        <H8fontMediumBlack>
                          {item.basicInfoData && item.basicInfoData.firstName}{" "}
                          {item.basicInfoData && item.basicInfoData.lastName}
                        </H8fontMediumBlack>
                        <RowView
                          style={{
                            width: Dimensions.get("window").width / 1.53,
                          }}
                        >
                          <View style={{ flexDirection: "row" }}>
                            <H9fontRegularGray>
                              {item.basicInfoData && item.basicInfoData.age}{" "}
                              {item.basicInfoData &&
                                item.basicInfoData.age &&
                                "Years,"}
                            </H9fontRegularGray>
                            <H9fontRegularGray>
                              {item.basicInfoData && item.basicInfoData.gender}
                            </H9fontRegularGray>
                          </View>
                        </RowView>
                        <View style={{ flexDirection: "row", paddingTop: 5 }}>
                          <TouchableOpacity
                            onPress={() => dialContact(item.phoneNumber)}
                          >
                            <CardSurface
                              style={{
                                borderRadius: 20,
                                height: 30,
                                width: 30,
                                backgroundColor: colors.white,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Feather
                                name="phone-forwarded"
                                size={18}
                                color="black"
                              />
                            </CardSurface>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => dialContact(item.phoneNumber)}
                          >
                            <H9fontMediumBlack
                              style={{ paddingLeft: 6, paddingTop: 7 }}
                            >
                              {item.phoneNumber}
                            </H9fontMediumBlack>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </RowView>
                  <RowView style={{ justifyContent: "flex-end" }}>
                    {/* <TouchableOpacity
                    style={[styles.viewButtonStyle, {backgroundColor:colors.red, width:"auto"}]}
                    onPress={() =>
                      Alert.alert('Appointment is not confirmed', 'You have to confirm the appointment in order to send a reminder', [
                        {
                          text: 'Cancel',
                          onPress: () => console.log('Cancel Pressed'),
                          style: 'cancel',
                        },
                        {text: 'Confirm appointment', onPress: () => navigation.navigate(screenName.CheckAppointmentClinic, {
                          item,
                        })},
                      ])
                    
                    }>
                    <View style={styles.buttonRow}>
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color="white" />
                      <Text style={styles.buttonTextStyle}>{i18n.translate("deletePatient")}</Text>
                    </View>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                      style={[
                        styles.viewButtonStyle,
                        { backgroundColor: colors.red, width: "auto" },
                      ]}
                      onPress={() => console.log("Pressed")}
                    >
                      <View style={styles.buttonRow}>
                        <MaterialCommunityIcons
                          name="information-outline"
                          size={20}
                          color="white"
                        />
                        <Text style={styles.buttonTextStyle}>
                          {i18n.translate("deletePatient")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </RowView>
                </CardSurface>
              ))}
            </View>
          ) : clinicsPatients.length !== 0 &&
            thirdQuery.length === 0 &&
            clinicsPatients ? (
            <View style={{ paddingHorizontal: 10, paddingTop: 5 }}>
              {clinicsPatients.map((item, index) => (
                <CardSurface
                  key={index}
                  style={{
                    height: "auto",
                    backgroundColor: "white",
                    borderRadius: 10,
                    paddingHorizontal: 15,
                  }}
                >
                  <RowView>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {!item.basicInfoData ? (
                        <H9fontMediumBlack style={{ paddingLeft: 5 }}>
                          {i18n.translate("patientDoesNotHaveInfoSet")}
                        </H9fontMediumBlack>
                      ) : !item.basicInfoData.town &&
                        !item.basicInfoData.country ? (
                        <H9fontMediumBlack style={{ paddingLeft: 5 }}>
                          {i18n.translate("patientDoesNotHaveInfoSetLocation")}
                        </H9fontMediumBlack>
                      ) : (
                        <H9fontMediumBlack style={{ paddingLeft: 5 }}>
                          {item.basicInfoData.town}
                          {item.basicInfoData.town.length > 0 &&
                            item.basicInfoData.country.length > 0 &&
                            ", "}
                          {item.basicInfoData.country}
                        </H9fontMediumBlack>
                      )}
                    </View>
                  </RowView>
                  <CommonLineDotted />
                  <RowView>
                    <View style={{ padding: 5, flexDirection: "row" }}>
                      <View
                        style={{
                          height: 60,
                          width: 60,
                          borderRadius: 60,
                          overflow: "hidden",
                          justifyContent: "center",
                          alignSelf: "center",
                          alignItems: "center",
                        }}
                      >
                        {item.patientImgURI ? (
                          <Image
                            source={{ uri: item.patientImgURI }}
                            style={{ height: "100%", width: "100%" }}
                          />
                        ) : (
                          // <Fontisto name="person" size={74} color={colors.facebook} />
                          <Image
                            style={{ height: "230%", width: "160%" }}
                            source={require("../../images/clients.png")}
                          />
                        )}
                      </View>

                      <View style={{ paddingLeft: 10 }}>
                        <H8fontMediumBlack>
                          {item.basicInfoData && item.basicInfoData.firstName}{" "}
                          {item.basicInfoData && item.basicInfoData.lastName}
                        </H8fontMediumBlack>
                        <RowView
                          style={{
                            width: Dimensions.get("window").width / 1.53,
                          }}
                        >
                          <View style={{ flexDirection: "row" }}>
                            <H9fontRegularGray>
                              {item.basicInfoData && item.basicInfoData.age}{" "}
                              {item.basicInfoData &&
                                item.basicInfoData.age &&
                                `${i18n.translate("years")}, `}
                            </H9fontRegularGray>
                            <H9fontRegularGray>
                              {item.basicInfoData && item.basicInfoData.gender}
                            </H9fontRegularGray>
                          </View>
                        </RowView>
                        <View style={{ flexDirection: "row", paddingTop: 5 }}>
                          <TouchableOpacity
                            onPress={() => dialContact(item.phoneNumber)}
                          >
                            <CardSurface
                              style={{
                                borderRadius: 20,
                                height: 30,
                                width: 30,
                                backgroundColor: colors.white,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Feather
                                name="phone-forwarded"
                                size={18}
                                color="black"
                              />
                            </CardSurface>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => dialContact(item.phoneNumber)}
                          >
                            <H9fontMediumBlack
                              style={{ paddingLeft: 6, paddingTop: 7 }}
                            >
                              {item.phoneNumber}
                            </H9fontMediumBlack>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </RowView>
                  <RowView style={{ justifyContent: "flex-end" }}>
                    <TouchableOpacity
                      style={[
                        styles.viewButtonStyle,
                        { backgroundColor: colors.red, width: "auto" },
                      ]}
                      onPress={() =>
                        Alert.alert(
                          i18n.translate("deletePatientInformation"),
                          i18n.translate("deletePatientInformationMessage"),
                          [
                            {
                              text: i18n.translate("cancel"),
                              onPress: () => console.log("Cancel Pressed"),
                              style: "cancel",
                            },

                            {
                              text: i18n.translate("deletePatient"),
                              onPress: () => {
                                deletePatientFromClinic(item).then(() => {
                                  dispatch(getPatientsOfClinic());
                                });
                              },
                            },
                          ]
                        )
                      }
                    >
                      <View style={styles.buttonRow}>
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={20}
                          color="white"
                        />
                        <Text style={styles.buttonTextStyle}>
                          {i18n.translate("deletePatient")}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* ADD PATIENT INFORMATION FEATURE */}
                    {/*                   
                    <TouchableOpacity
                      style={[styles.viewButtonStyle, {backgroundColor:colors.facebook, width:"auto"}]}
                      onPress={() =>
                          navigation.navigate(screenName.patientInformation, {isGoBack: true})
                      }>
                      <View style={styles.buttonRow}>
                        <MaterialCommunityIcons name="information-outline" size={20} color="white" />
                        <Text style={styles.buttonTextStyle}>{i18n.translate("patientInformation")}</Text>
                      </View>
                    </TouchableOpacity> */}
                  </RowView>
                </CardSurface>
              ))}
            </View>
          ) : (
            <View style={{ paddingHorizontal: 10, paddingTop: 5 }}>
              <H6fontRegularBlue>
                {i18n.translate("noPatients")}
              </H6fontRegularBlue>
              <H14fontRegularGray>
                {i18n.translate("noPatientsNeedToBook")}
              </H14fontRegularGray>
            </View>
          )}
        </ScrollView>
      </MainContainer>
    </Fragment>
  );
};
export default MyPatient;

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
  viewButtonStyle: {
    height: 28,
    width: "auto",
    backgroundColor: "rgba(29, 185, 170, 0.65)",
    borderRadius: 30,
    justifyContent: "center",
    marginHorizontal: 5,
  },
  buttonTextStyle: {
    paddingLeft: 5,
    // paddingTop: 5,
    color: "white",
    fontSize: 11,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
});
