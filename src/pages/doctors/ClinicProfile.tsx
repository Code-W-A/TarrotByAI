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
import { setTemporaryPatientClinicReview, setTemporaryPatientReview } from '../../actions/patientActions';
import ClinicOverview from './ClinicOverview';
import LocationViewClinic from './locationClinic';
import ReviewsClinic from './ReviewsClinic';
import { screenName } from '../../utils/screenName';
import i18n, { languageTag } from '../../../i18n';
import { colors } from '../../utils/colors';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const ClinicProfile: React.FC<Props> = ({navigation, route}): JSX.Element => {
  const [selectedTab, setSelectedTab] = useState<any>(languageTag === "ro-RO" ? "Prezentare generală" : 'Overview');
  const isFocused = useIsFocused();
  const clinicDetails = route.params;
  const dispatch = useDispatch();



  const patientInfoDB = useSelector(state => state.patientInfoData);
  const {patientInformation} = patientInfoDB;

  const guestDetailsData = useSelector(state => state.guestDetailsPatient);
  const {guestDetails} = guestDetailsData;



  useEffect(() => {
    console.log("--------")
    console.log(clinicDetails)
    // console.log(clinicDetails.item.clinicReviews)
   
    // selectedTab == i18n.translate("OverView");
    if(clinicDetails.item.clinicReviews.length === 0){
      dispatch(setTemporaryPatientClinicReview({}))
    }else {
      for(let i = 0; i < clinicDetails.item.clinicReviews.length; i++){
        // console.log(clinicDetails.item.clinicReviews[i])
        
        if(clinicDetails.item.clinicReviews[i].patientPhoneNumber === guestDetails.phoneNumberCountry){
          console.log("yes...activated------]]]]")
          console.log(clinicDetails.item.clinicReviews[i])
          
          dispatch(setTemporaryPatientClinicReview(clinicDetails.item.clinicReviews[i]))
        } else {
          
          dispatch(setTemporaryPatientClinicReview({}))
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
          <NavBarPatient title={i18n.translate("clinicProfile")} isPatient={true} isTermsAccepted={true} isGoBack={clinicDetails.isGoBack}/>
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
          {selectedTab == i18n.translate('Overview') ? <ClinicOverview clinicInfoData={clinicDetails.item}/> : null}
          {selectedTab == i18n.translate('Location') ? <LocationViewClinic clinicInfo = {clinicDetails.item}/> : null}
          {selectedTab == i18n.translate('Reviews') ? <ReviewsClinic doctorInfoData={clinicDetails.item}/> : null}
          {/* {selectedTab == 'Hours' ? <HoursView /> : null} */}
        </ScrollView>
        <ButtonFull
          disabled={false}
          funCallback={() => navigation.navigate(screenName.ClinicDoctorsPatient, {
            clinicDoctors: clinicDetails.item.clinicDoctors,
          })}
          label={i18n.translate("bookAppoinitment")}
          style={{marginVertical: 0}}
          bgColor={colors.primary2}
          success={true}
        />
      </MainContainer>
    </Fragment>
  );
};
export default ClinicProfile;
