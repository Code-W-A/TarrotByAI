import React, {Fragment, useEffect, useState} from 'react';
import {
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import {GeneralProps} from '../../interfaces/generalProps';
import {Route} from '@react-navigation/native';
import {NavBar, NavBarPatient} from '../../common/commonComponents';
import {MainContainer, SubContainer} from '../../components/commonViews';
import {
  H14fontRegularWhite,
  H8fontMediumBlack,
} from '../../components/commonText';
import TimeAndDate from './../timeAndDate';
import Checkout from './../checkout';
import Payment from './../payment';
import {screenName} from '../../utils/screenName';
import {tab} from '../../utils/constant';
import {p0, ph1, ph10, pt0, pt10} from '../../common/commonStyles';
import {colors} from '../../utils/colors';
import TimeAndDateClinic from './../timeAndDateClinic';
import TimeAndDatePatient from './../timeAndDatePatient';
import {handleCreateCalendarForPatient} from '../../utils/createDatesClinic';
import TimeAndDateDoctor from './timeAndDateDoctor';
import {useDispatch, useSelector} from 'react-redux';
import {getDoctorCalendarTimes} from '../../actions/clinicActions';
import { getDoctorApprovedAppointments } from '../../actions/doctorActions';
import { retrieveApprovedDoctorAppointments, retrieveDoctorCalendarTimes } from '../../utils/getFirebaseData';
import i18n from '../../../i18n';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}
const DoctorCalendarTime: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const dispatch = useDispatch();
  // const [selectedtab, setSelectedTab] = useState('Time and Date');
  // const [, setDatesForPatient] = useState([]);
  const doctorCalendarTimes = useSelector(state => state.doctorCalendarTimes);
  const {doctorTimes, loading} = doctorCalendarTimes;




  const doctorApprovedApp = useSelector(
    state => state.doctorApprovedAppointments,
  );
  const {doctorApprovedAppointments, loading: loadingApprovedAppointments} =
  doctorApprovedApp;
  
  const doctorInfo = route.params;
  // let dates;

  const handleText = async () => {

    const clinicCalendarTimes = await retrieveDoctorCalendarTimes("6ib82iBq5rFiqM8TbBXJ");
   const doctorApprovedAppointments = await retrieveApprovedDoctorAppointments("6ib82iBq5rFiqM8TbBXJ", clinicCalendarTimes, doctorInfo.item.allDays)

  //  console.log("================================", doctorApprovedAppointments.doctorCalendarTimes)
  }

  useEffect(() => {
    console.log('doctorInfo.item.allDays...', doctorInfo.item.servicesList);
    dispatch(getDoctorCalendarTimes(doctorInfo.item.doctorId, doctorInfo.item.allDays));
    // handleText()
    // dispatch(getDoctorApprovedAppointments(doctorInfo.item.doctorId, doctorTimes))
    // console.log('doctorTimes', doctorTimes);
  }, []);

  return (
    <Fragment>
      <MainContainer>
        <NavBar
          title={i18n.translate("appointmentCalendar")}
          navHeight={80}
          isModal={false}
          isTermsAccepted={true}
        />
        <ScrollView>
          <SubContainer style={[p0, ph1, {backgroundColor: colors.background}]}>


            {!loading && doctorApprovedAppointments && <TimeAndDateDoctor servicesList = {doctorInfo.item.servicesList} allDaysDB={doctorInfo.item.allDays} doctorId= {doctorInfo.item.doctorId}/> }
          </SubContainer>

        </ScrollView>
      </MainContainer>
    </Fragment>
  );
};

export default DoctorCalendarTime;

const styles = StyleSheet.create({
  tabButtonStyle: {
    paddingVertical: 8,
    paddingHorizontal: 15,

    borderRadius: 20,
    marginRight: 10,
  },
  footerButtonStyle: {
    marginTop: 15,
    bottom: 10,
    height: 45,
    backgroundColor: '#1B5A90',
    marginHorizontal: 12,
    borderRadius: 30,
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});
