import React, {Fragment, useEffect, useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import moment from 'moment';
import {GeneralProps} from '../../interfaces/generalProps';
import {Route, useRoute} from '@react-navigation/native';
import {NavBar} from '../../common/commonComponents';
import {colors} from '../../utils/colors';
import {
  CardSurface,
  MainContainer,
  RowView,
} from '../../components/commonViews';
import {
  H9fontMediumBlack,
  H14fontRegularBlackk,
  H14fontRegularBlack,
  H14fontRegularBlue,
  H22fontMediumBlack,
  H10fontRegularWhite,
  H8fontRegularWhite,
  H14fontRegularWhite,
  H8fontMediumWhite,
} from '../../components/commonText';
import CircularProgress from '../../components/circularProgress';

import {
  H14fontRegulargray,
  H14fontRegularRed,
  H8fontMediumBlack,
} from '../../components/commonText';
// import Icon from 'react-native-vector-icons/FontAwesome';
import {Entypo} from '@expo/vector-icons';
import CircularProgressHigh from '../../components/circularProgressHigh';
import {labels} from '../../utils/labels';
// import Icon1 from 'react-native-vector-icons/MaterialIcons';
// import {DevWidth} from '../../utils/device';
import {Dimensions} from 'react-native';

import {authentication, db, storage} from '../../../firebase';

import {
  alignItemsCenter,
  flexRow,
  pl10,
  spaceBetween,
} from '../../common/commonStyles';
import Speciality5 from '../../../assets/images/specialities/specialities-05.svg';
import Doctor2 from '../../../assets/images/doctors/doctor-02.svg';
import {screenName} from '../../utils/screenName';
import {
  retrieveApprovedClinicAppointments,
  retrieveClinicCalendarTimes,
  retrieveClinicData,
} from '../../utils/getFirebaseData';
import {useDispatch, useSelector} from 'react-redux';
import {
  getClinicApprovedAppointments,
  getClinicInfo,
} from '../../actions/clinicActions';
import {ActivityIndicator} from 'react-native-paper';
import CustomLoader from '../../components/customLoader';
import i18n from '../../../i18n';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}
const DoctorDashBoard: React.FC<Props> = ({navigation}): JSX.Element => {
  const [clinicInfo, setClinicInfo] = useState();
  const [doctorName, setDoctorName] = useState();
  const [reload, setReload] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  const route = useRoute;
  const params = route.params;

  const clinicInfoDB = useSelector(state => state.clinicInfoData);
  const {clinicInformation, loading} = clinicInfoDB;

  const clinicApprovedApp = useSelector(
    state => state.clinicApprovedAppointments,
  );
  const {clinicApprovedAppointments, loading: loadingApprovedAppointments} =
    clinicApprovedApp;

  const dispatch = useDispatch();

  const handleNavigateApp = screen => {
    navigation.navigate(screen);
  };

  const getClinicData = async () => {
    const clinicData = await retrieveClinicData();
    if (!clinicData.hasProfile) {
      navigation.navigate(screenName.ProfileSettings);
    }
  };

  // const handleCheckProfile = () => {
  //   dispatch(getClinicInfo());
  // };

  useEffect(() => {
    setIsLoading(true);

    if (clinicInformation) {
      setIsLoading(false);
    }

    console.log('HERE.......', clinicInformation);

    console.log('clinicInformation....', clinicInformation);

    if (clinicInformation) {
      if (!clinicInformation.hasProfile) {
        if (clinicInformation.termsConditions) {
          if (!clinicInformation.termsConditions.isAccepted) {
            navigation.navigate(screenName.termConditionsClinic);
          } else navigation.navigate(screenName.ClinicProfileSettings);
        }
      }
    }
  }, [clinicInformation]);

  const onShare = async () => {
    const auth = authentication;
    try {
      const result = await Share.share({
        message: `${auth.currentUser.uid}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  if (!clinicInformation) {
    return (
      <View style={[styles.containerLoader, styles.horizontal]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // if (clinicInformation) {
  //   if (isLoading || !clinicInformation.basicInfoData) {
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
        <NavBar title={'Doctor Dashboard'} isTermsAccepted={true} />
        <View style={styles.container}>
          <CardSurface style={styles.drDetailsContainer}>
            {/* <View style={{flex: 1, alignItems: 'flex-end'}}>
         
            </View> */}
            <View style={styles.rowStyle}>
              {clinicInformation && clinicInformation.hasProfile && (
                <>
                  <View style={styles.profileImageStyle}>
                    <Doctor2 height={'100%'} width={'150%'} />
                  </View>
                  <View
                    style={{
                      width: Dimensions.get('window').width / 1.5,
                      paddingLeft: 3,
                    }}>
                    <RowView>
                      <View
                        style={{
                          maxWidth: 150,
                          maxHeight: 50,
                        }}>
                        <H8fontMediumBlack>
                          {clinicInformation
                            ? clinicInformation.basicInfoData.firstname
                            : ''}
                          {clinicInformation
                            ? clinicInformation.basicInfoData.lastname
                            : ''}
                        </H8fontMediumBlack>
                      </View>
                      {/* <CardSurface style={styles.iconSurface}>
                    <Icon1
                      name="more-vert"
                      size={15}
                      color={colors.lightGray}
                    />
                  </CardSurface> */}
                      <TouchableOpacity
                        style={styles.clinicIdButtonStyle}
                        onPress={onShare}>
                        <H14fontRegularWhite>Send Link ID</H14fontRegularWhite>
                      </TouchableOpacity>
                    </RowView>

                    <H14fontRegulargray numberOfLines={2}>
                      {clinicInformation
                        ? clinicInformation.basicInfoData.specializations
                        : ''}
                    </H14fontRegulargray>

                    <View style={[flexRow, alignItemsCenter, {marginTop: 5}]}>
                      {/* <CardSurface style={styles.specialitiesSurface}>
                    <Speciality5 height={15} width={15} />
                  </CardSurface> */}
                      <H14fontRegularBlue numberOfLines={2}>
                        {clinicInformation
                          ? clinicInformation.basicInfoData.services
                          : ''}{' '}
                      </H14fontRegularBlue>
                    </View>
                    <View
                      style={[
                        flexRow,
                        alignItemsCenter,
                        spaceBetween,
                        {marginTop: 5},
                      ]}>
                      {/* <H14fontRegularRed>{'15+ Exp'}</H14fontRegularRed> */}
                      {/* <View> */}
                      <View style={styles.locationStyle}>
                        {/* <Icon name="map-marker" size={15} color={'black'} /> */}
                        <Entypo name="location-pin" size={24} color="black" />
                        <H9fontMediumBlack>
                          {clinicInformation
                            ? clinicInformation.contactData.city
                            : null}
                          {', '}
                          {clinicInformation
                            ? clinicInformation.contactData.country
                            : null}
                        </H9fontMediumBlack>
                        {/* </View> */}
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>
          </CardSurface>
        </View>
        <View style={styles.appointmentDetails}>
          <CardSurface style={styles.cardStyle}>
            {/* <View style={styles.dateStyle}>
              <H8fontMediumWhite style={{}}>Today</H8fontMediumWhite>
            </View> */}
            <CircularProgressHigh percent={80} />
            <H14fontRegularBlackk>{i18n.translate("totalPatient")}</H14fontRegularBlackk>
            <H22fontMediumBlack>
              {clinicApprovedAppointments &&
              clinicApprovedAppointments.todayAppointments
                ? clinicApprovedAppointments.todayAppointments.length
                : ''}
            </H22fontMediumBlack>
          </CardSurface>
          <View style={{paddingHorizontal: 20}}>
            <CardSurface style={styles.cardStyle}>
              <CircularProgress percent={30} />
              <H14fontRegularBlackk>{i18n.translate("totalPatient")}</H14fontRegularBlackk>
              <H22fontMediumBlack>
                {clinicApprovedAppointments &&
                clinicApprovedAppointments.upcommingAppointments
                  ? clinicApprovedAppointments.upcommingAppointments.length
                  : ''}
              </H22fontMediumBlack>
            </CardSurface>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
            paddingTop: 15,
          }}>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() =>
              navigation.navigate(screenName.clinicAppointments, {
                todayAppointments: 'todayAppointments',
              })
            }>
            <H8fontRegularWhite>Today</H8fontRegularWhite>
            <H8fontRegularWhite>Appointments</H8fontRegularWhite>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() =>
              navigation.navigate(screenName.clinicAppointments, {
                upcomingAppointments: 'upcomingAppointments',
              })
            }>
            <H8fontRegularWhite>Upcoming</H8fontRegularWhite>
            <H8fontRegularWhite>Appointments</H8fontRegularWhite>
          </TouchableOpacity>
        </View>
      </MainContainer>
    </Fragment>
  );
};
export default DoctorDashBoard;

const styles = StyleSheet.create({
  clinicIdButtonStyle: {
    height: 25,
    width: 100,
    backgroundColor: '#1B5A90',
    marginBottom: 10,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // marginHorizontal: 10,
  },
  container: {marginTop: -90, paddingHorizontal: 10},
  drDetailsContainer: {height: 165, backgroundColor: 'white', borderRadius: 20},
  rowStyle: {
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageStyle: {
    height: 70,
    width: 70,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#f7f7f7',
    overflow: 'hidden',
  },
  iconSurface: {
    borderRadius: 33,
    height: 25,
    width: 25,
    // backgroundColor: colors.white,
    // right: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  specialitiesSurface: {
    borderRadius: 25,
    height: 24,
    width: 24,
    backgroundColor: colors.white,
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialitieImageStye: {height: 17, width: 17, alignSelf: 'center'},
  locationStyle: {flexDirection: 'row', alignItems: 'center'},
  appointmentDetails: {
    paddingHorizontal: 10,
    paddingTop: 15,
    flexDirection: 'row',
  },
  surfaceContainer: {
    height: 250,
    width: Dimensions.get('window').width / 2.3,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  cardStyle: {
    height: 170,
    width: Dimensions.get('window').width / 2.3,
    backgroundColor: colors.background,
    borderRadius: 10,
    alignItems: 'center',
  },
  dateStyle: {
    height: 25,
    width: 110,
    borderRadius: 20,
    backgroundColor: '#1B5A90',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    height: 74,
    width: Dimensions.get('window').width / 2.25,
    backgroundColor: '#0DD8F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  alternativeButtonStyle: {
    height: 74,
    width: Dimensions.get('window').width / 2.25,
    backgroundColor: '#0DD8F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  containerLoader: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
  },
});
