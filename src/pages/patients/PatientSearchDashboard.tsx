import React, { Fragment, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Notifications from "expo-notifications";
import { GeneralProps } from "../../interfaces/generalProps";
import { Route, useFocusEffect } from "@react-navigation/native";
import { NavBar, NavBarPatient } from "../../common/commonComponents";
import { labels, langObj } from "../../utils/labels";
import Fuse from "fuse.js";

import { RowView } from "../../components/commonViews";
import {
  H7fontLightBlue,
  H7fontMediumBlack,
  H9fontMediumBlack,
  H9fontRegularBlack,
} from "../../components/commonText";

import { screenName } from "../../utils/screenName";
import { menu } from "../../utils/constant";
import DashBoardSearch from "../../components/dashboardSearch";
import {
  alignItemsCenter,
  mh10,
  mh15,
  ml10,
  mr10,
  mt10,
  mv10,
  ph15,
  pl15,
} from "../../common/commonStyles";
import DoctorDetailsCard from "../../components/doctorComponents";
import { _testDoctorDetails } from "../../utils/mockDetails";
import {
  retrieveClinics,
  retrieveClinicsForPatientDashboard,
  retrievePatientAppointments,
  retrievePatientData,
} from "../../utils/getFirebaseData";
import { useDispatch, useSelector } from "react-redux";
import { getAllClinicsSearchDashboard } from "../../actions/clinicActions";
import { ActivityIndicator, ProgressBar, Text } from "react-native-paper";
import ClinicDetailsCard from "../../components/ClinicComponents";
import SearchResultPatient from "./SearchResultPatient";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import { _getLocationAsync } from "../../services/location-service";
import { calculatePreciseDistance } from "../../utils/calculateDistance";
import {
  getPatientAppointments,
  getPatientClinicsDoctorsAround,
} from "../../actions/patientActions";
import { AirbnbRating } from "react-native-ratings";
import StarRating from "react-native-star-rating-widget";
import { colors } from "../../utils/colors";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../../../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { schedulePushNotificationOnAppointment } from "../../utils/Notification/scheduleLocalNotification";
import { collection, getDocs, query, where } from "firebase/firestore";
import i18n from "../../../i18n";

import {
  filterAppointmentsForNot,
  filterLocalNotificationStorage,
  filterUpcomingAppointments,
} from "../../utils/sortAppPatient";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { RootState } from "../../../Store";
import { ControlledTooltip } from "../../components/tooltipModal";
import GuestPhoneInputModal from "../../components/GuestPhoneInputModal";
import { getRating } from "../../utils/ratingCalc";

interface SpecialitiesList {
  onPressViewAll: CallableFunction;
}
const SpecialitiesList: React.FC<SpecialitiesList> = ({ onPressViewAll }) => {
  return (
    <View style={[mv10, { zIndex: 1 }]}>
      <RowView style={[ph15, { zIndex: 1 }]}>
        <H7fontMediumBlack style={{ zIndex: 1 }}>
          {i18n.translate("specialities")}
        </H7fontMediumBlack>
        <TouchableOpacity
          onPress={() => {
            onPressViewAll();
          }}
        >
          <H9fontMediumBlack>{i18n.translate("viewAll")}</H9fontMediumBlack>
        </TouchableOpacity>
      </RowView>

      <ScrollView
        horizontal={true}
        style={[mr10, mt10]}
        showsHorizontalScrollIndicator={false}
      >
        {menu.map(({ name, Img }) => {
          return (
            <View style={[alignItemsCenter, pl15]}>
              <Img height={67} width={67} />
              <View style={mv10}>
                <H9fontRegularBlack>{name}</H9fontRegularBlack>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}
const PatientSearchDashboard: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const [doctorDetails, setDoctorDetails] = useState(_testDoctorDetails);
  const [LocationPermissionStatus, setLocationPermissionStatus] = useState("");

  const [searchList, setSearchList] = useState([]);
  const [clinicsForSearchMap, setClinicsForSearchMap] = useState([]);
  const [searching, setSearching] = useState(false);

  const [filterResult, setFilterResult] = useState([]);
  const [progress, setProgress] = React.useState<number>(0.3);
  const [selected, setSelected] = useState("");
  const [doctorsClinics, setDoctorsClinics] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [city, setCity] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [patientLocation, setPatientLocation] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  // COMMENTED OUT FOR CREATING ANOTHER FUNCTION FOR PERFORMANCE
  // const allClinicsForPatientDash = useSelector(
  //   state => state.allClinicsForPatientDash,
  // );
  // const {clinicsForDash, loading} = allClinicsForPatientDash;

  const aroundPatientData = useAppSelector(
    (state: RootState) => state.aroundPatientData
  );
  const { aroundPatient, loading: loadingAroundPatient } = aroundPatientData;

  const ptAppointments = useSelector((state) => state.patientAppointments);
  const { myAppointments, loading: loadingMyAppointments } = ptAppointments;

  const patientInfoDB = useSelector((state) => state.patientInfoData);
  const { patientInformation } = patientInfoDB;

  const guestDetailsData = useSelector((state) => state.guestDetailsPatient);
  const { guestDetails } = guestDetailsData;

  // const dispatch = useDispatch();
  const dispatch = useAppDispatch();

  const handleCloseSearch = () => {
    setSearching(false);
    setSearchList([]);
    setFilterResult([]);
    setSelected("");
    setLocation("");
    setDoctorsClinics("");
  };

  const [noLocation, setNoLocation] = useState(false);

  const handleSearch = async (doctorsClinics, location, city) => {
    try {
      console.log("start search...");
      let startSearch = Date.now() / 1000;
      if (location.length === 0 && doctorsClinics.length > 0) {
        setNoLocation(true);
        return;
      } else if (location.length === 0 && doctorsClinics === 0) {
        return;
      }
      setNoLocation(false);
      setIsLoading(true);
      console.log("set loading");

      const wordsFromSearch = location.split(", ");
      // console.log(wordsFromSearch);

      let test = () => {
        for (let i = 0; i < wordsFromSearch.length; i++) {
          return wordsFromSearch[i];
        }
      };

      let start = Date.now() / 1000;

      let clinicsAroundPatient = [];
      let clinicsAroundPatientIDS = [];
      console.log("Clinics");
      // console.log(city);

      // START NEW QUERY VERSION CLINICS ----------->

      // Create a reference to the users collection
      const usersRef = collection(db, "Users");

      // Create a query against the collection.
      const q = query(usersRef, where("clinicCity", "==", city));
      const querySnapshot = await getDocs(q);

      for (const doc of querySnapshot.docs) {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        let data = doc.data();
        if (data.clinicImagesURI) {
          for (let i = 0; i < data.clinicImagesURI.length; i++) {
            if (data.clinicImagesURI[i].isMainImg) {
              data.clinicMainImage = data.clinicImagesURI[i];
            }
          }
        } else {
          data.clinicMainImage = "";
        }

        let ratingMedia = getRating(doc.data().clinicReviews);

        data.ratingMedia = ratingMedia;
        data.numberOfReviews = doc.data().clinicReviews.length;

        clinicsAroundPatient.push(data);
      }

      for (let i = 0; i < clinicsAroundPatient.length; i++) {
        console.log("loop test");
        let clinicDoctors = [];
        const querySnapshot = await getDocs(
          collection(db, "Users", clinicsAroundPatient[i].owner_uid, "Doctors")
        );

        for (const doc of querySnapshot.docs) {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, "doctorpushed=====>", doc.data());
          let dataDoctor = doc.data();
          let ratingMedia = getRating(dataDoctor.doctorReviews);

          dataDoctor.ratingMedia = ratingMedia;
          dataDoctor.numberOfReviews = dataDoctor.doctorReviews.length;

          // Query a reference to a subcollection
          let clinicAppointmentsUnregistered = [];
          const subcollectionQuerySnapshot = await getDocs(
            collection(
              db,
              "Doctors",
              doc.id,
              "clinicAppointmentsUnregisteredDocCol"
            )
          );

          for (const subdoc of subcollectionQuerySnapshot.docs) {
            // doc.data() is never undefined for query doc snapshots
            // console.log(subdoc.id, " => ", subdoc.data());
            clinicAppointmentsUnregistered.push(subdoc.data());
          }

          dataDoctor.clinicAppointmentsUnregistered = [
            ...clinicAppointmentsUnregistered,
          ];

          clinicDoctors.push(dataDoctor);
        }

        clinicsAroundPatient[i].clinicDoctors = [...clinicDoctors];
      }

      let doctorsAroundPatient = [];
      let doctorsAroundPatientIDS = [];
      console.log("Doctors");

      // START NEW QUERY VERSION DOCTORS ---->

      const doctorsRef = collection(db, "Doctors");

      // Create a query against the collection.
      const qDoctors = query(doctorsRef, where("clinicCity", "==", city));
      const querySnapshotDoctors = await getDocs(qDoctors);

      for (const doc of querySnapshotDoctors.docs) {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());

        let data = doc.data();

        let ratingMedia = getRating(data.doctorReviews);

        data.ratingMedia = ratingMedia;
        data.numberOfReviews = data.doctorReviews.length;

        // Query a reference to a subcollection
        let clinicAppointmentsUnregistered = [];
        const subcollectionQuerySnapshot = await getDocs(
          collection(
            db,
            "Doctors",
            doc.id,
            "clinicAppointmentsUnregisteredDocCol"
          )
        );

        for (const subdoc of subcollectionQuerySnapshot.docs) {
          // doc.data() is never undefined for query doc snapshots
          // console.log(subdoc.id, " => ", subdoc.data());
          clinicAppointmentsUnregistered.push(subdoc.data());
        }

        data.clinicAppointmentsUnregistered = [
          ...clinicAppointmentsUnregistered,
        ];

        doctorsAroundPatient.push(data);
      }

      const docsAndClinics = [...doctorsAroundPatient, ...clinicsAroundPatient];

      if (doctorsClinics || location) {
        const newData = docsAndClinics.filter(function (item) {
          let textToCheck;
          if (item.clinicInfoData != undefined) {
            textToCheck = `${item.clinicInfoData.clinicname}`;
          } else {
            textToCheck = `${item.doctorInfoData.firstname} ${item.doctorInfoData.lastname}`;
          }

          const itemData = textToCheck
            ? textToCheck.toUpperCase()
            : "".toUpperCase();
          const textData = doctorsClinics.toUpperCase();

          return itemData.indexOf(textData) > -1;
        });

        const clinicsSearchDataMap = clinicsAroundPatient.filter(
          function (item) {
            let textToCheck;

            textToCheck = `${item.clinicInfoData.clinicname}`;

            const itemData = textToCheck
              ? textToCheck.toUpperCase()
              : "".toUpperCase();
            const textData = doctorsClinics.toUpperCase();

            return itemData.indexOf(textData) > -1;
          }
        );

        setSearching(true);
        setSearchList(newData);
        setClinicsForSearchMap(clinicsSearchDataMap);
        setFilterResult([]);
        setSelected("");
      } else {
        console.log("no it is...");
        setSearching(false);
      }
      console.log("before set loading");
      setIsLoading(false);

      console.log("END... SEARCH", Date.now() / 1000 - start);
    } catch (err) {
      console.log("Error...searching PATIENT DASHBOARD SEARCH...", err);
    }
  };

  const handleRequestLocationPermission = async () => {
    // console.log('start');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateNotificationsOnAppointments = async () => {
    let allAsyncNotifications = [];
    let allAsyncTextsNotifications = [];

    try {
      console.log("-------start----");

      let localNotifications = [];
      const value = await AsyncStorage.getItem("localNotifications");
      if (value !== null) {
        //
        console.log("We have data!!");
        console.log(JSON.parse(value));
        localNotifications = JSON.parse(value);
      }
      let appIds = [];
      if (localNotifications) {
        for (let i = 0; i < localNotifications.length; i++) {
          appIds.push(localNotifications[i].appointmentId);
        }
      }

      console.log(localNotifications);
      console.log(appIds);

      //   let testApps = [
      //   {appointmentId:11, doctorId:"zXi9k5uK2tE2m4qqpxmP", daySelected:"21-6-2023",isApproved:true,timeSelected:{endtime:"10:55", starttime:"14:14"}},
      //   {appointmentId:12, doctorId:"zXi9k5uK2tE2m4qqpxmP", daySelected:"21-6-2023",isApproved:false,timeSelected:{endtime:"10:55", starttime:"14:15"}},
      //   {appointmentId:13, doctorId:"zXi9k5uK2tE2m4qqpxmP", daySelected:"21-6-2023",isApproved:true,timeSelected:{endtime:"10:55", starttime:"14:16"}}
      // ];
      const filterUpcomingApp = filterAppointmentsForNot(
        myAppointments.upcommingAppointments
      );
      // const filterUpcomingApp =

      console.log("--filterUpcomingApp--");
      console.log(filterUpcomingApp);

      for (let i = 0; i < filterUpcomingApp.length; i++) {
        console.log("---------APPOINTMENT LOOP--------------");
        console.log(filterUpcomingApp[i].doctorId);

        const q = query(
          collection(db, "Doctors"),
          where("doctorId", "==", filterUpcomingApp[i].doctorId)
        );

        let startQuerySnapshot = Date.now() / 1000;
        const querySnapshot = await getDocs(q);

        console.log("test before querySnapshot");
        let basicInfoDoctor;
        querySnapshot.forEach((doc) => {
          basicInfoDoctor = doc.data().doctorInfoData;
          console.log("test querySnapshot");
          console.log(basicInfoDoctor);
        });

        if (filterUpcomingApp[i].isApproved) {
          if (appIds.includes(filterUpcomingApp[i].appointmentId)) {
            console.log("appointment included");
          } else {
            console.log("appointment not included");
            schedulePushNotificationOnAppointment(
              filterUpcomingApp[i].timeSelected,
              filterUpcomingApp[i].daySelected,
              basicInfoDoctor,
              filterUpcomingApp[i].appointmentId,
              true,
              localNotifications
            );
          }
        } else {
          console.log("---------APPOINTMENT NOTAPPROVED--------------");

          // const value = await AsyncStorage.getItem("localNotifications");

          // if (value !== null) {
          //     //
          //     console.log("We have data!!");
          //     console.log(JSON.parse(value));
          //     localNotifications = JSON.parse(value)

          // }
          console.log(appIds);
          // console.log(localNotifications)

          let appId = filterUpcomingApp[i].appointmentId;
          console.log("test..here");
          if (appIds.includes(appId)) {
            for (let i = 0; i < localNotifications.length; i++) {
              if (appId === localNotifications[i].appointmentId) {
                console.log("YEEEEESSSSSSSS it is");

                console.log("Cencelling....");

                console.log(localNotifications[i].notificationId);

                await Notifications.cancelScheduledNotificationAsync(
                  localNotifications[i].notificationId
                );
              }
            }

            console.log("filter after cancel...on not approved");
            const newLocalNotifications = localNotifications.filter(
              (app) => app.appointmentId != appId
            );
            console.log(newLocalNotifications);
            // console.log("new....")
            // const newLocalNotifications = localNotifications.filter(app => app.appointmentId != filterUpcomingApp[i].appointmentId);
            AsyncStorage.setItem(
              "localNotifications",
              JSON.stringify(newLocalNotifications),
              (err) => {
                if (err) {
                  console.log(
                    "an error occured when setting localNotifications on patients APPOINTMENT NOTAPPROVED....",
                    err
                  );
                  throw err;
                }
              }
            ).catch((err) => {
              console.log("error is: " + err);
            });
          }
        }
      }
    } catch (err) {
      console.log("error on handleCreateNotificationsOnAppointments....", err);
    }

    // handleCheck()
  };

  const handleCheck = async () => {
    let localNotifications;
    const value = await AsyncStorage.getItem("localNotifications");
    if (value !== null) {
      //
      console.log("We have data!!");
      console.log(JSON.parse(value));
      localNotifications = JSON.parse(value);
    }
    const newLocalNotifications =
      filterLocalNotificationStorage(localNotifications);

    console.log("------newLocalNotifications-------");
    console.log(newLocalNotifications.length);

    AsyncStorage.setItem(
      "localNotifications",
      JSON.stringify(newLocalNotifications),
      (err) => {
        if (err) {
          console.log(
            "an error occured when setting localNotifications on patients APPOINTMENT NOTAPPROVED....",
            err
          );
          throw err;
        }
      }
    ).catch((err) => {
      console.log("error is: " + err);
    });
  };

  const handleTemporarySet = () => {
    AsyncStorage.setItem("localNotifications", JSON.stringify([]), (err) => {
      if (err) {
        console.log(
          "an error occured when setting localNotifications on patients APPOINTMENT NOTAPPROVED....",
          err
        );
        throw err;
      }
    }).catch((err) => {
      console.log("error is: " + err);
    });
  };

  const handlePatientLocation = async () => {
    // console.log("asdasda")
    const location = await _getLocationAsync();
    setPatientLocation(location);
  };

  useEffect(() => {
    console.log("asdasdas=========guestDetails=====");
    console.log(guestDetails);

    handleRequestLocationPermission();

    handlePatientLocation();

    if (patientInformation.termsConditions && !guestDetails.isGuest) {
      console.log("---patientInformation.termsConditions exists--");
      console.log(patientInformation.basicInfoData);
      if (!patientInformation.termsConditions.isAccepted) {
        console.log("---patientInformation.termsConditions not accepted--");
        navigation.navigate(screenName.termConditionsPatients, {
          isAccepted: patientInformation.termsConditions.isAccepted,
        });
      } else if (!patientInformation.hasProfile) {
        console.log("---not basic info data--");

        navigation.navigate(screenName.ProfileSettingsPatient);
      }
    } else if (guestDetails.isGuest) {
      if (!guestDetails.termsConditions.isAccepted) {
        navigation.navigate(screenName.termConditionsPatients, {
          isAccepted: guestDetails.termsConditions.isAccepted,
          isGuest: true,
        });
      }
    }

    let start = Date.now() / 1000;
    dispatch(getPatientClinicsDoctorsAround()).then(() => {
      console.log("END... DISPATCH", Date.now() / 1000 - start);
    });

    //  create notification for registered patient --------->

    // handleCheck()
    // handleCreateNotificationsOnAppointments()

    // <----- create notification for registered patient

    // retrievePatientAppointments(false, false)

    // dispatch(getPatientAppointments(false, false))

    // console.log("myAppointments")
    // console.log(myAppointments)
  }, [LocationPermissionStatus]);

  // if (loadingAroundPatient) {
  //   return (
  //     <View style={[styles.containerLoader, styles.horizontal]}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  const handleToggleModalPhone = () => {
    // setIsVisible(!isVisible)
  };

  return (
    <View style={{ height: "100%" }}>
      <NavBarPatient
        title={i18n.translate("findDocAndClinics")}
        isPatient={true}
        isTermsAccepted={true}
        navHeight={"20%"}
        userTitle={
          patientInformation &&
          patientInformation.basicInfoData &&
          `${patientInformation.basicInfoData.firstname} ${patientInformation.basicInfoData.lastname}`
        }
      />

      <View style={{ zIndex: 10, height: "10%" }}>
        <DashBoardSearch
          searchNow={(doctorsClinics, location, city) => {
            handleSearch(doctorsClinics, location, city);
          }}
          noLocation={noLocation}
          city={city}
          setCity={setCity}
          setNoLocation={setNoLocation}
          location={location}
          setLocation={(val) => setLocation(val)}
          doctorsClinics={doctorsClinics}
          setDoctorsClinics={(val) => setDoctorsClinics(val)}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size={"large"} />
      ) : !searching ? (
        <View style={{ zIndex: 1 }}>
          {/* <SpecialitiesList
            onPressViewAll={() => {
              navigation.navigate(screenName.SearchDoctor as any);
            }}
          /> */}
          <View style={[mv10]}>
            {/* <H9fontMediumBlack>{i18n.translate("hello")}</H9fontMediumBlack> */}
            <RowView style={ph15}>
              {loadingAroundPatient ? (
                <H7fontLightBlue>
                  {i18n.translate("searchingDoctorsAroundU")}
                </H7fontLightBlue>
              ) : (
                <H7fontMediumBlack>
                  {i18n.translate("doctorsAroundU")}
                </H7fontMediumBlack>
              )}

              {!loadingAroundPatient && aroundPatient ? (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(screenName.DocAroundPatient as any, {
                      doctorsAroundPatient: aroundPatient.doctorsAroundPatient,
                    })
                  }
                >
                  <H9fontMediumBlack>
                    {i18n.translate("viewAll")}
                  </H9fontMediumBlack>
                </TouchableOpacity>
              ) : null}
            </RowView>

            <ScrollView
              style={mh10}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              {!loadingAroundPatient && aroundPatient ? (
                aroundPatient.doctorsAroundPatient.map((item, index) => {
                  if (index < 3) {
                    return (
                      <View style={{ marginHorizontal: 10 }}>
                        <DoctorDetailsCard
                          page={"home"}
                          details={item}
                          bookAnAppointment={() => {
                            navigation.navigate(
                              screenName.DoctorCalendarTimePatient,
                              {
                                item,
                              }
                            );
                          }}
                          drProfileNavigation={() => {
                            navigation.navigate(screenName.DoctorProfile, {
                              item,
                            });
                          }}
                        />
                        {/* <Text>asdasd</Text> */}
                      </View>
                    );
                  } else {
                    return null;
                  }
                })
              ) : loadingAroundPatient ? (
                <ActivityIndicator />
              ) : null}
            </ScrollView>
          </View>

          <View style={[mv10]}>
            <RowView style={ph15}>
              {loadingAroundPatient ? (
                <H7fontLightBlue>
                  {i18n.translate("searchingClinicsAroundU")}
                </H7fontLightBlue>
              ) : (
                <H7fontMediumBlack>
                  {i18n.translate("clinicsAroundU")}
                </H7fontMediumBlack>
              )}
              {!loadingAroundPatient && aroundPatient ? (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(
                      screenName.ClinicsAroundPatient as any,
                      {
                        clinicsAroundPatient:
                          aroundPatient.clinicsAroundPatient,
                      }
                    )
                  }
                >
                  <H9fontMediumBlack>
                    {i18n.translate("viewAll")}
                  </H9fontMediumBlack>
                </TouchableOpacity>
              ) : null}
            </RowView>

            <ScrollView
              style={mh10}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              {!loadingAroundPatient && aroundPatient ? (
                aroundPatient.clinicsAroundPatient.map((item, index) => {
                  if (index < 3) {
                    return (
                      <View style={{ marginHorizontal: 10 }}>
                        <ClinicDetailsCard
                          page={"home"}
                          details={item}
                          bookAnAppointment={() => {
                            navigation.navigate(
                              screenName.ClinicDoctorsPatient,
                              {
                                clinicDoctors: item.clinicDoctors,
                              }
                            );
                          }}
                          clinicProfileNavigation={() => {
                            navigation.navigate(screenName.ClinicProfile, {
                              item,
                            });
                          }}
                        />
                        {/* <Text>asdasd</Text> */}
                      </View>
                    );
                  } else {
                    return null;
                  }
                })
              ) : loadingAroundPatient ? (
                <ActivityIndicator />
              ) : null}
            </ScrollView>
          </View>
        </View>
      ) : (
        <View style={{ height: "70%" }}>
          <SearchResultPatient
            patientLocation={patientLocation}
            clinicsForSearchMap={clinicsForSearchMap}
            isLoadingSearch={isLoading}
            clinicsDoctorsDB={searchList}
            setSearchList={(arr) => setSearchList(arr)}
            setFilterResult={(arr) => setFilterResult(arr)}
            filterResult={filterResult}
            selected={selected}
            setSelected={(select) => setSelected(select)}
            handleCloseSearch={() => handleCloseSearch()}
          />
        </View>
      )}
    </View>
  );
};
export default PatientSearchDashboard;

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
  specialitiesImageStyle: {
    height: 100,
    width: 100,
  },
});
