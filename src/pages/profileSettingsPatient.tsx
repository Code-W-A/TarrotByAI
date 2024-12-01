import React, { Fragment, useState, useEffect } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { GeneralProps } from "../interfaces/generalProps";
import { Route, useIsFocused } from "@react-navigation/native";
import { NavBarPatient } from "../common/commonComponents";
import { MainContainer } from "../components/commonViews";
import { SegmentControl } from "../components/segmentControl";
import BasicInfo from "./profileSettings/basicInfo";
import AboutMe from "./profileSettings/aboutMe";
import ClinicInfo from "./profileSettings/clinicInfo";
import ContactDetails from "./profileSettings/contactDetails";
import Pricing from "./profileSettings/pricing";
import Education from "./profileSettings/education";
import Awards from "./profileSettings/awards";
import Registrations from "./profileSettings/registraction";
import {
  data,
  profilesegments,
  profilesegmentsPatient,
} from "../utils/constant";
import { colors } from "../utils/colors";
import { retrieveClinicData } from "../utils/getFirebaseData";
import LeftArrow from "../../assets/images/left-arrow-big-black.svg";

import * as Yup from "yup";
import {
  uploadClinicProfile,
  uploadPatientProfile,
} from "../utils/UploadFirebaseData";
import { screenName } from "../utils/screenName";
import { useDispatch, useSelector } from "react-redux";
import { getClinicInfo } from "../actions/clinicActions";
import { getPatientInfo } from "../actions/patientActions";
import BasicInfoPatient from "./profileSettings/basicInfoPatient";
import CustomLoader from "../components/customLoader";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}
const ProfileSettingsPatient: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const patientInfoDB = useSelector((state) => state.patientInfoData);
  const { patientInformation } = patientInfoDB;
  const [selectedTab, setSelectedTab] = useState<
    "Basic Info" | "About Me"
    // | 'Clinic Info'
    // | 'Contact Details'
    // | 'Pricing & Services'
    // | 'Education & Experience'
    // | 'Awards & Memberships'
    // | 'Registrations'
  >("Basic Info");
  const [dataInfo, setDataInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState<any>(false);
  const [patientImage, setPatientImage] = useState<any>(
    patientInformation.patientImage ? patientInformation.patientImage : ""
  );
  const [basicInfoData, setBasicInfoData] = useState<any>(
    patientInformation ? patientInformation.basicInfoData : {}
  );
  // const [aboutMeData, setAboutMeData] = useState<any>(
  //   patientInformation.aboutMeData ? patientInformation.aboutMeData : {},
  // );
  // const [clinicInfoData, setClinicInfoData] = useState<any>(
  //   patientInformation.clinicInfoData ? patientInformation.clinicInfoData : {},
  // );
  // const [contactData, setContactData] = useState<any>(
  //   patientInformation.contactData ? patientInformation.contactData : {},
  // );
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
    // console.log('basicInfoData///', basicInfoData);
    // console.log('aboutMeData///', aboutMeData);
    // console.log('clinicInfoData///', clinicInfoData);
    // console.log('contactData///', contactData);
  };

  const handleAddSubmit = async (info) => {
    // console.log("-----------start submit------------")
    // console.log('info...', info);
    // console.log('patientImage...', patientImage);
    // console.log('patientInformation.oldPatientImage...', patientInformation.oldPatientImage);
    // let patientImg;
    // if (info.firstName) {
    //   try {
    //   if(patientInformation.oldPatientImage.length > 0){
    //     console.log("first")
    //     patientImg = await updateDoctorPatientImage(patientImage, true, patientInformation.oldPatientImage)
    //   } else {
    //     console.log("read to upload", patientImage)
    //     patientImg = await uploadDoctorImage(patientImage, true)
    //     console.log("test final")
    //   }
    //     setBasicInfoData(info);
    //     console.log("before test...")
    //     uploadPatientProfile(info, patientImg.doctorImag , patientImg.doctorImagURI).then(() =>{
    //       dispatch(getPatientInfo());
    //     }).then(() => {
    //       navigation.navigate(screenName.PatientSearchDashboard);
    //     })
    //     console.log("finish..")
    //   } catch (err) {
    //     console.log('error on submiting patient info', err);
    //   }
    // }
  };

  useEffect(() => {
    // handleGetData();
    // selectedTab == 'Basic Info';
    console.log("patientImage", patientInformation.patientImage);
  }, [isFocused, selectedTab]);

  return (
    <Fragment>
      <MainContainer style={{ backgroundColor: colors.background }}>
        <NavBarPatient
          title={"Profile Settings"}
          isGoBack={true}
          navHeight={80}
          isPatient={true}
          isTermsAccepted={
            patientInformation.hasProfile
              ? patientInformation.hasProfile
              : false
          }
        />

        <CustomLoader isLoading={isLoading} />

        <ScrollView>
          <ScrollView horizontal={true}>
            {/* <SegmentControl
              tabs={profilesegmentsPatient}
              defaultTab={selectedTab}
              newTab={newTab}
              onTabChanged={(
                tab:
                  | 'Basic Info'
                  // | 'About Me'
                  // | 'Clinic Info'
                  // | 'Contact Details',
                // | 'Pricing & Services'
                // | 'Education & Experience'
                // | 'Awards & Memberships'
                // | 'Registrations',
              ) => {
                setSelectedTab(tab);
              }}
            /> */}
          </ScrollView>
          {selectedTab == "Basic Info" ? (
            <BasicInfoPatient
              dataInfo={basicInfoData}
              handleAddSubmit={handleAddSubmit}
              setPatientImage={setPatientImage}
              patientImage={patientInformation.patientImage}
            />
          ) : null}
          {/* {selectedTab == 'About Me' ? (
            <AboutMe
              dataInfoAboutMe={aboutMeData}
              handleAddSubmit={handleAddSubmit}
            />
          ) : null}
          {selectedTab == 'Clinic Info' && dataInfo.isClinic ? (
            <ClinicInfo
              dataInfoClinicInfo={clinicInfoData}
              handleAddSubmit={handleAddSubmit}
            />
          ) : null}
          {selectedTab == 'Contact Details' ? (
            <ContactDetails
              dataInfoContactDetails={contactData}
              handleAddSubmit={handleAddSubmit}
            /> */}
          {/* ) : null} */}
          {/* {selectedTab == 'Pricing & Services' ? <Pricing /> : null}
          {selectedTab == 'Education & Experience' ? <Education /> : null}
          {selectedTab == 'Awards & Memberships' ? <Awards /> : null}
          {selectedTab == 'Registrations' ? <Registrations /> : null} */}
        </ScrollView>
      </MainContainer>
    </Fragment>
  );
};
export default ProfileSettingsPatient;
