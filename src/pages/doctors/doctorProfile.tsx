import React, {Fragment, useState, useEffect} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {GeneralProps} from '../../interfaces/generalProps';
import {Route, useIsFocused} from '@react-navigation/native';
import {NavBarPatient} from '../../common/commonComponents';
import {MainContainer} from '../../components/commonViews';
import {SegmentControl} from '../../components/segmentControl';
import DoctorOverView from './doctorOverview';
import LocationView from './location';
import Reviews from './reviews';
import HoursView from './hours';
import {ButtonFull} from '../../components/commonButton';
import {labels} from '../../utils/labels';
import {segments} from '../../utils/constant';
import { useDispatch, useSelector } from 'react-redux';
import { setTemporaryPatientReview } from '../../actions/patientActions';
import { screenName } from '../../utils/screenName';
import { handleClinicPatientQueries } from '../../utils/handleFirebaseQuery';
import i18n, { languageTag } from '../../../i18n';
import { colors } from '../../utils/colors';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const DoctorProfile: React.FC<Props> = ({navigation, route}): JSX.Element => {
  const [selectedTab, setSelectedTab] = useState<any>(languageTag === "ro-RO" ? "Prezentare generală" : 'Overview');
  const isFocused = useIsFocused();
  const doctorDetails = route.params;
  const dispatch = useDispatch();

  const [clinicInfo, setClinicInfo] = useState({})


  const patientInfoDB = useSelector(state => state.patientInfoData);
  const {patientInformation} = patientInfoDB;

  const guestDetailsData = useSelector(state => state.guestDetailsPatient);
  const {guestDetails} = guestDetailsData;


  const handleGetClinicInfo = async () =>{

    const clinic = await handleClinicPatientQueries("owner_uid", doctorDetails.item.clinicId);
    
    let sum = 0;
    let ratingMedia = 0;

    for(let i =0; i < clinic[0].clinicReviews.length; i ++){
   
      sum = sum + clinic[0].clinicReviews[i].rating;
    }

    ratingMedia = sum / clinic[0].clinicReviews.length;
  
 
    clinic[0].ratingMedia = ratingMedia;
    clinic[0].numberOfReviews = clinic[0].clinicReviews.length;

    for(let i = 0; i < clinic[0].clinicImagesURI; i++){
      if(clinic[0].clinicImagesURI[i].isMainImg){
        clinic[0].clinicMainImage = clinic[0].clinicImagesURI[i]
      }
    }

    setClinicInfo(clinic[0])
 
    // console.log(clinic)

  }

  useEffect(() => {
    console.log("doctorDetails.item.doctorImgURI....", typeof doctorDetails.item.doctorImgURI)
    selectedTab == 'OverView';

    handleGetClinicInfo()

    if(doctorDetails.item.doctorReviews.length === 0){
      dispatch(setTemporaryPatientReview({}))
    }else{

    for(let i = 0; i < doctorDetails.item.doctorReviews.length; i++){
      
      if(doctorDetails.item.doctorReviews[i].patientPhoneNumber === guestDetails.phoneNumberCountry){
        console.log("yes...activated------")
 
        dispatch(setTemporaryPatientReview(doctorDetails.item.doctorReviews[i]))
      } else {
        
        dispatch(setTemporaryPatientReview({}))
        console.log("other patients reviews...")
      }

    }
  }
  }, [isFocused]);

  // return(
  //   <View>
  //     <Text>
  //       asdasda
  //     </Text>
  //   </View>
  // )
  return (
    <Fragment>
      <MainContainer>
          <NavBarPatient title={i18n.translate("doctorProfile")} isPatient={true} isTermsAccepted={true} isGoBack={route.params.isGoBack}/>
        <ScrollView>
          <ScrollView horizontal={true}>
          {languageTag === "ro-RO" ? 
            <SegmentControl
              tabs={segments}
              defaultTab={selectedTab}
              onTabChanged={(
                tab: 'Prezentare generală' | 'Locație' | 'review-uri' | 'Ore',
              ) => {
                setSelectedTab(tab);
              }}
            />
            :
            <SegmentControl
              tabs={segments}
              defaultTab={selectedTab}
              onTabChanged={(
                tab: 'OverView' | 'Location' | 'Reviews' | 'Hours',
              ) => {
                setSelectedTab(tab);
              }}
            />
          }
          </ScrollView>
          {selectedTab == i18n.translate('Overview') ? <DoctorOverView doctorInfoData={doctorDetails.item} doctorImage = {doctorDetails.item.doctorImgURI}/> : null}
          {selectedTab == i18n.translate('Location') ? <LocationView clinicInfoDoctor = {doctorDetails.item} clinicInfo={clinicInfo} /> : null}
          {selectedTab == i18n.translate('Reviews') ? <Reviews doctorInfoData={doctorDetails.item}/> : null}
          {/* {selectedTab == 'Hours' ? <HoursView /> : null} */}
        </ScrollView>
        <ButtonFull
          disabled={false}
          funCallback={() => navigation.navigate(screenName.DoctorCalendarTimePatient,{item: doctorDetails.item})}
          label={i18n.translate("bookAppoinitment")}
          style={{marginVertical: 0}}
          bgColor={colors.primary2}
          success={true}
        />
      </MainContainer>
    </Fragment>
  );
};
export default DoctorProfile;
