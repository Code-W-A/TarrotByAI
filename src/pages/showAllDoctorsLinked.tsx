import React, { Fragment, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { GeneralProps } from "../interfaces/generalProps";
import { Route } from "@react-navigation/native";
import { NavBarPatient } from "../common/commonComponents";
import { SmallButtonSuccess } from "../components/commonButton";
import { labels } from "../utils/labels";
import { colors } from "../utils/colors";
import Modal from "react-native-modal";
import Icon2 from "react-native-vector-icons/FontAwesome";
import Icon3 from "react-native-vector-icons/AntDesign";
import {
  CardSurface,
  CommonLineDotted,
  CommonLineView,
  MainContainer,
  RowView,
} from "../components/commonViews";
import {
  H9fontMediumBlack,
  H15fontMediumBlack,
  H14fontRegularBlackk,
  H14fontRegularBlack,
  H14fontRegularBlue,
  H14fontRegularGray,
  H14fontRegularWhite,
  H7fontRegularWhite,
  H8fontRegularWhite,
  H8fontRegularBlack,
} from "../components/commonText";
import Icon1 from "react-native-vector-icons/AntDesign";
import { screenName } from "../utils/screenName";

import { _testDoctorDetails } from "../utils/mockDetails";
import DoctorDetailsCard from "../components/doctorComponents";
import DoctorFilter from "../components/doctorFilter";

import { ml10, pt5 } from "../common/commonStyles";
import { useDispatch, useSelector } from "react-redux";
import { retrieveClinics } from "../utils/getFirebaseData";
import CustomLoader from "../components/customLoader";
import { ActivityIndicator } from "react-native-paper";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}
const ShowAllDoctorsLinked: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const [isModalVisible, setModalVisible] = useState(false);
  const allClinicsDB = useSelector((state) => state.allClinics);
  const { clinicsDB, loading } = allClinicsDB;
  const [clinicForObjectValues, setClinicForObjectValues] = useState();

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const patientInfoDB = useSelector((state) => state.patientInfoData);
  const { patientInformation } = patientInfoDB;

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    // setIsLoading(true);

    // if (patientInformation) {
    //   setIsLoading(false);
    // }
    // dispatch(getClinics());
    console.log("------------------------------");
    // console.log('clinicsDB...', clinicsDB[0].clinicAppointments);

    if (clinicsDB) {
      setClinicForObjectValues(clinicsDB);
    }

    // if (patientInformation) {
    //   if (!patientInformation.hasProfile) {
    //     //     console.log('test here', patientInformation);
    //     if (patientInformation.termsConditions) {
    //       if (!patientInformation.termsConditions.isAccepted) {
    //         navigation.navigate(screenName.termConditionsPatients);
    //       } else if (!patientInformation.basicInfoData) {
    //         // console.log('yes');
    //         navigation.navigate(screenName.ProfileSettingsPatient);
    //       }
    //     }
    //   }
    // }

    // retrieveClinics();
  }, [patientInformation]);

  if (!patientInformation) {
    return (
      <View style={[styles.containerLoader, styles.horizontal]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // if (patientInformation) {
  //   if (!patientInformation.basicInfoData) {
  //     // if (isLoading || !patientInformation.basicInfoData) {
  //     return (
  //       <View style={[styles.containerLoader, styles.horizontal]}>
  //         <ActivityIndicator size="large" />
  //       </View>
  //     );
  //   }
  // }

  return (
    <Fragment>
      <MainContainer>
        {loading && <CustomLoader isLoading={loading} />}
        <NavBarPatient
          title={labels.yourDoctors}
          isPatient={true}
          isTermsAccepted={true}
        />
        <View style={{ backgroundColor: "white", padding: 10 }}>
          {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {searchMenuOptions.map(({Img, name}) => {
              return (
                <TouchableOpacity
                  style={{
                    margin: 3,
                    height: 37,
                    borderWidth: 1,
                    borderColor: '#D5D5D5D5',
                    backgroundColor: '#fff',
                    borderRadius: 30,
                    paddingRight: 10,
                    flexDirection: 'row',
                  }}
                  onPress={() => {
                    toggleModal();
                  }}>
                  <CardSurface
                    style={{
                      borderRadius: 25,
                      height: 25,
                      width: 25,
                      backgroundColor: colors.white,
                      marginLeft: 7,
                      marginVertical: 5,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Img height={15} width={16} />
                  </CardSurface>
                  <H14fontRegularGray
                    style={{alignSelf: 'center', marginLeft: 5}}>
                    {name}
                  </H14fontRegularGray>
                </TouchableOpacity>
              );
            })}
          </ScrollView> */}
          {/* <H14fontRegularGray style={{paddingTop: 15}}>
            {'16525 matches found for : '}
          </H14fontRegularGray> */}
          <H15fontMediumBlack>
            {clinicsDB && clinicsDB.length}{" "}
            {clinicsDB && clinicsDB.length === 1
              ? "Doctor linked"
              : clinicsDB && clinicsDB.length === 0
                ? "No linked doctors"
                : "Doctors linked"}
          </H15fontMediumBlack>
        </View>
        {clinicsDB && (
          <FlatList
            data={Object.values(clinicsDB)}
            contentContainerStyle={[ml10, pt5]}
            renderItem={({ item, index }) => {
              return (
                <DoctorDetailsCard
                  page={"search"}
                  details={item}
                  bookAnAppointment={(clinicAllInfo) => {
                    navigation.navigate(screenName.PatientCalendarTime, {
                      clinicAllInfo,
                    });
                  }}
                  drProfileNavigation={() => {
                    navigation.navigate(screenName.DoctorProfile, {
                      doctorInfo: item,
                    });
                  }}
                />
              );
            }}
          />
        )}
        {/* <View style={styles.sortByImageStyle}>
          <FilterIcon />
        </View> */}

        {/* <DoctorFilter
          modalClose={() => {
            setModalVisible(false);
          }}
          modalVisible={isModalVisible}
        /> */}
      </MainContainer>
    </Fragment>
  );
};
export default ShowAllDoctorsLinked;
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
  datePickerStyle: {
    width: 230,
  },
  sortByImageStyle: {
    height: 100,
    width: 100,
    alignSelf: "flex-end",
    marginRight: 10,
    position: "absolute",
    bottom: 0,
  },
});
