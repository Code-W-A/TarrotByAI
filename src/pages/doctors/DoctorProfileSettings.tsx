import React, { Fragment, useState, useEffect } from "react";
import { ScrollView, Alert } from "react-native";
import { GeneralProps } from "../../interfaces/generalProps";
import { Route, useIsFocused, useRoute } from "@react-navigation/native";
import { NavBar, NavBarPatient } from "../../common/commonComponents";
import { MainContainer } from "../../components/commonViews";
import { SegmentControl } from "../../components/segmentControl";
import BasicInfo from "../profileSettings/basicInfo";
import AboutMe from "../profileSettings/aboutMe";
import ClinicInfo from "../profileSettings/clinicInfo";
import ContactDetails from "../profileSettings/contactDetails";
import Pricing from "../profileSettings/pricing";
import Education from "../profileSettings/education";
import Awards from "../profileSettings/awards";
import Registrations from "../profileSettings/registraction";
import { data, doctorprofilesegments } from "../../utils/constant";
import { colors } from "../../utils/colors";
import { retrieveClinicData } from "../../utils/getFirebaseData";

import * as Yup from "yup";
import {
  updateDoctorProfile,
  uploadClinicProfile,
  uploadDoctorProfile,
} from "../../utils/UploadFirebaseData";
import { screenName } from "../../utils/screenName";
import { useDispatch, useSelector } from "react-redux";
import { getClinicDoctors, getClinicInfo } from "../../actions/clinicActions";
import DoctorScheduleTimings from "./DoctorScheduleTimings";
import CustomLoader from "../../components/customLoader";
import { ActivityIndicator } from "react-native-paper";
// import {
//   updateDoctorPatientImage,
//   uploadDoctorImage,
//   uploadImage,
// } from "../../utils/uploadFirebaseStorage";
import i18n from "../../../i18n";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}
const DoctorProfileSettings: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const clinicInfoDB = useSelector((state) => state.clinicInfoData);
  const { clinicInformation } = clinicInfoDB;
  const [selectedTab, setSelectedTab] = useState<any>(
    i18n.translate("basicInfoDoctor")
  );
  const params = route.params;
  const [dataInfo, setDataInfo] = useState<any>({});
  const [doctorImage, setDoctorImage] = useState<any>(
    params ? params.item.doctorImg : ""
  );
  const [servicesList, setServicesList] = useState(
    params ? params.item.servicesList : []
  );

  const [doctorInfoData, setdoctorInfoData] = useState<any>(
    params ? params.item.doctorInfoData : {}
  );
  // const [allDays, setAllDays] = useState<any>(
  //   clinicInformation.aboutMeData ? clinicInformation.aboutMeData : [],
  // );
  const [allDays, setAllDays] = useState<any>(
    params ? params.item.allDays : []
  );
  const [doctorDocId, setDoctorDocId] = useState<any>(
    params ? params.item.doctorId : ""
  );
  const [isLoading, setIsLoading] = useState<any>(false);
  const [clinicInfoData, setClinicInfoData] = useState<any>(
    clinicInformation.clinicInfoData ? clinicInformation.clinicInfoData : {}
  );
  const [contactData, setContactData] = useState<any>(
    clinicInformation.contactData ? clinicInformation.contactData : {}
  );
  const [newTab, setNewTab] = useState("");

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const handleGetData = async () => {
    const response = await retrieveClinicData();
    console.log("response....", response);
    setDataInfo(response);
    return response;
  };

  const handleSubmitData = () => {
    console.log("------------------------------------");
    console.log("doctorInfoData///", doctorInfoData);
    console.log("aboutMeData///", aboutMeData);
    console.log("clinicInfoData///", clinicInfoData);
    console.log("contactData///", contactData);
  };

  const handleAddDoctorInfoData = (info) => {
    setdoctorInfoData(info);

    setSelectedTab(i18n.translate("ScheduleTimingsDoctor"));
  };

  const handleAddSubmit = async (info) => {
    setIsLoading(true);
    // setAllDays(info);

    console.log("----------");
    console.log(info);
    // try {
    //   for (let i = 0; i < info.length; i++) {
    //     for (let z = 0; z < info[i].timeSPack.length; z++) {
    //       console.log("info-----------", info[i].timeSPack[z]);
    //       if (
    //         info[i].timeSPack[z].endtime === "-" ||
    //         info[i].timeSPack[z].starttime === "-" ||
    //         info[i].timeSPack[z].starttime.length === 0 ||
    //         info[i].timeSPack[z].endtime.length === 0
    //       ) {
    //         setIsLoading(false);
    //         Alert.alert(
    //           `Please select a start time and end time for your schedule timings.`,
    //           `Check your timings`,
    //           [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    //         );
    //         return;
    //       }
    //     }
    //   }

    //   if (!doctorInfoData.firstname) {
    //     setIsLoading(false);
    //     Alert.alert(
    //       "Basic information not found",
    //       "Please enter basic information first",
    //       [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    //     );
    //     return;
    //   }
    //   if (info.length === 0) {
    //     setIsLoading(false);
    //     Alert.alert("No timings scheduled", "Please enter at least one day", [
    //       { text: "OK", onPress: () => console.log("OK Pressed") },
    //     ]);
    //     return;
    //   }
    //   for (let i = 0; i < info.length; i++) {
    //     console.log(info[i]);
    //     if (info[i].timeSPack.length === 0) {
    //       setIsLoading(false);
    //       Alert.alert(
    //         `No timings scheduled for selected days.`,
    //         `Selected days where found, but no scheduled timings where identified. Please add scheduled timings for all selected days.`,
    //         [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    //       );
    //       return;
    //     }
    //   }

    //   const doctorImg = await uploadDoctorImage(doctorImage, false, "");
    //   console.log("------doctorImg before upload------");
    //   console.log(doctorImg.doctorImag);
    //   console.log(doctorImg.doctorImagURI);
    //   console.log("----info----");
    //   console.log(info);
    //   uploadDoctorProfile(
    //     doctorInfoData,
    //     info,
    //     doctorImg.doctorImag,
    //     doctorImg.doctorImagURI,
    //     servicesList
    //   )
    //     .then(() => {
    //       dispatch(getClinicDoctors());
    //     })
    //     .then(() => {
    //       setIsLoading(false);
    //       navigation.navigate(screenName.ClinicDoctors);
    //     });
    // } catch (err) {
    //   console.log("Error on submit here...", err);
    // }
  };

  const handleUpdateDoctor = async (info) => {
    // setIsLoading(true);
    // setAllDays(info);
    // console.log("STart...")
    // console.log("all days...")
    // console.log(info)
    // for (let i = 0; i < info.length; i ++){
    //   for (let z = 0; z < info[i].timeSPack.length; z ++){
    //     console.log('info-----------', info[i].timeSPack[z]);
    //     if(info[i].timeSPack[z].endtime === "-" || info[i].timeSPack[z].starttime === "-" || info[i].timeSPack[z].starttime.length === 0 || info[i].timeSPack[z].endtime.length === 0 ){
    //       setIsLoading(false);
    //       Alert.alert(
    //         `Please select a start time and end time for your schedule timings.`,
    //         `Check your timings`,
    //         [{text: 'OK', onPress: () => console.log('OK Pressed')}],
    //       );
    //       return;
    //     }
    //   }
    // }
    // if (!doctorInfoData.firstname) {
    //   setIsLoading(false);
    //   Alert.alert(
    //     'Basic information not found',
    //     'Please enter basic information first',
    //     [{text: 'OK', onPress: () => console.log('OK Pressed')}],
    //   );
    //   return;
    // }
    // if (info.length === 0) {
    //   setIsLoading(false);
    //   Alert.alert('No timings scheduled', 'Please enter at least one day', [
    //     {text: 'OK', onPress: () => console.log('OK Pressed')},
    //   ]);
    //   return;
    // }
    // for (let i = 0; i < info.length; i++) {
    //   console.log(info[i]);
    //   if (info[i].timeSPack.length === 0) {
    //     setIsLoading(false);
    //     Alert.alert(
    //       `No timings scheduled for selected days.`,
    //       `Selected days where found, but no scheduled timings where identified. Please add scheduled timings for all selected days.`,
    //       [{text: 'OK', onPress: () => console.log('OK Pressed')}],
    //     );
    //     return;
    //   }
    // }
    // let doctorImg
    // if(params.item.oldDoctorImage){
    //   console.log("doctorImg.....", params.item.oldDoctorImage);
    //   doctorImg = await updateDoctorPatientImage(doctorImage, false, params.item.oldDoctorImage)
    // } else {
    //   doctorImg = await updateDoctorPatientImage(doctorImage, false, "")
    // }
    // console.log(doctorImg)
    // updateDoctorProfile(doctorDocId, doctorInfoData, info, doctorImg.doctorImag, doctorImg.doctorImagURI, servicesList).then(() => {
    //   dispatch(getClinicDoctors());
    // }).then(() => {
    //     setIsLoading(false);
    //     navigation.navigate(screenName.ClinicDoctors);
    //   });
  };

  useEffect(() => {
    // setIsLoading(false);
    // handleGetData();
    // selectedTab ==   i18n.translate("basicInfoDoctor")

    console.log(servicesList);
    // setIsLoading(false);
  }, [isFocused, selectedTab]);

  return (
    <Fragment>
      <MainContainer style={{ backgroundColor: colors.background }}>
        <CustomLoader isLoading={isLoading} />
        <NavBar
          title={i18n.translate("doctorProfileSettings")}
          navHeight={80}
          isModal={params ? params.isModalRoute : false}
          isTermsAccepted={
            clinicInformation.hasProfile
              ? clinicInformation.hasProfile
              : clinicInformation.hasProfile
          }
        />
        <ScrollView>
          <ScrollView horizontal={true}>
            <SegmentControl
              tabs={doctorprofilesegments}
              defaultTab={selectedTab}
              newTab={newTab}
              onTabChanged={(tab: any) => {
                console.log(doctorInfoData.firstName);

                setSelectedTab(tab);
              }}
            />
          </ScrollView>
          {selectedTab == i18n.translate("basicInfoDoctor") ? (
            <BasicInfo
              dataInfo={doctorInfoData}
              setDoctorImage={setDoctorImage}
              handleAddSubmit={handleAddDoctorInfoData}
              doctorImage={params && params.item.doctorImg}
              servicesList={servicesList}
              setServicesList={setServicesList}
            />
          ) : null}
          {selectedTab == i18n.translate("ScheduleTimingsDoctor") ? (
            <DoctorScheduleTimings
              allDaysDB={allDays}
              handleAddSubmit={handleAddSubmit}
              handleUpdateDoctor={handleUpdateDoctor}
              doctorDocId={doctorDocId}
            />
          ) : null}
          {/* {selectedTab == 'Clinic Info' && dataInfo.isClinic ? (
            <ClinicInfo
              dataInfoClinicInfo={clinicInfoData}
              handleAddSubmit={handleAddSubmit}
            />
          ) : null}
          {selectedTab == 'Contact Details' ? (
            <ContactDetails
              dataInfoContactDetails={contactData}
              handleAddSubmit={handleAddSubmit}
            />
          ) : null} */}
          {/* {selectedTab == 'Pricing & Services' ? <Pricing /> : null} */}
          {/* {selectedTab == 'Education & Experience' ? <Education /> : null}
          {selectedTab == 'Awards & Memberships' ? <Awards /> : null}
          {selectedTab == 'Registrations' ? <Registrations /> : null} */}
        </ScrollView>
      </MainContainer>
    </Fragment>
  );
};
export default DoctorProfileSettings;
