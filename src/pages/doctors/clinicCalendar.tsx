import React, {Fragment, useEffect, useState} from 'react';
import {
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  FlatList,
  Text,
  Modal,
  StyleSheet,
} from 'react-native';
import {GeneralProps} from '../../interfaces/generalProps';
import {Calendar} from 'react-native-calendars';
import moment from 'moment';
import {Route} from '@react-navigation/native';
import {
  CardSurface,
  MainContainer,
  RowView,
} from '../../components/commonViews';
import {NavBarPatient} from '../../common/commonComponents';
import {
  H14fontRegularWhite,
  H15fontMediumBlack,
  H8fontMediumBlack,
  H9fontMediumBlack,
  H9fontRegularGray,
} from '../../components/commonText';
import {colors} from '../../utils/colors';
// import {DevHeight, DevWidth} from '../../utils/device';
import {Dimensions} from 'react-native';

import * as Progress from 'react-native-progress';

import EditIcon from 'react-native-vector-icons/MaterialIcons';
import DeleteIcon from 'react-native-vector-icons/AntDesign';
import AddIcon from 'react-native-vector-icons/MaterialIcons';
import CheckIcon from 'react-native-vector-icons/Entypo';
import {days, timeSlotStart, timeSlotEnd} from '../../utils/constant';
import CalendarIcon from '../../../assets/images/calender-icon.svg';
import FeatherIcon from '../../../assets/images/icon-feather-check-circle.svg';
import {Dropdown} from 'react-native-element-dropdown';

const markedDates = {
  '2023-04-04': {
    disabled: true,
    startingDay: true,
    color: 'green',
    endingDay: true,
  },
  '2023-04-05': {
    disabled: true,
    startingDay: true,
    color: 'green',
    endingDay: true,
  },
  '2023-04-06': {
    disabled: true,
    startingDay: true,
    color: 'green',
    endingDay: true,
  },
};

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const ClinicCalendar: React.FC<Props> = ({navigation, route}): JSX.Element => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<any>(markedDates);
  const [isFocus, setIsFocus] = useState(false);
  const [timeslotend, setTimeEnd] = useState('-');
  const [timeslotstart, setTimeStart] = useState('-');

  const [time, setTime] = useState([{starttime: '-', endtime: '-'}]);

  const [modalHeight, setModalHeight] = useState(200);
  const [scrollHeight, setScrollHeight] = useState(
    Dimensions.get('window').height / 3.2,
  );

  useEffect(() => {
    console.log(_markedDates);
  }, []);

  const _format = 'YYYY-MM-DD';
  const _today = moment().format(_format);
  const _maxDate = moment().add(100, 'days').format(_format);

  const [_markedDates, setMarkedDates] = useState([]);

  const [selectedDates, setSelectdates] = useState([]);

  const onDaySelect = day => {
    let temp = [...selectedDates];
    const _selectedDay = moment(day.dateString).format(_format);

    let selected = true;
    if (_markedDates[_selectedDay]) {
      delete temp[_selectedDay];
      selected = !_markedDates[_selectedDay].selected;
    } else {
      temp.push(_selectedDay);
      setSelectdates(temp);
    }
    const updatedMarkedDates = {
      ..._markedDates,
      ...{[_selectedDay]: {selected}},
    };

    setMarkedDates(updatedMarkedDates);
  };

  // const addDay = val => {
  //   if (selectedDay.length == 0) {
  //     setSelectedDay([val]);
  //   } else if (selectedDay.some(v => v == val)) {
  //     setSelectedDay(selectedDay.filter(item => item !== val));
  //   } else {
  //     setSelectedDay([...selectedDay, val]);
  //   }
  // };

  const addTime = () => {
    let arr = {starttime: '-', endtime: '-'};
    setTime([...time, arr]);
    setModalHeight(modalHeight + 61);
    setScrollHeight(scrollHeight - 31);
  };

  const removeItem = index => {
    setModalHeight(modalHeight - 61);
    time.splice(index, 1);
    setScrollHeight(scrollHeight + 31);
  };

  return (
    <Fragment>
      <MainContainer>
        <ScrollView>
          <NavBarPatient title={'Doctor Schedule Timings'} />
          <View
            style={{
              height: 100,
              backgroundColor: 'white',
              padding: 20,
              flexDirection: 'row',
            }}>
            <CardSurface
              style={{
                borderRadius: 40,
                height: 60,
                width: 60,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <CalendarIcon height={30} width={30} />
            </CardSurface>

            <RowView style={{flex: 1}}>
              <View style={{paddingLeft: 10, paddingTop: 5}}>
                <H8fontMediumBlack>{'Schedule Timings'}</H8fontMediumBlack>
                {/* <H9fontRegularGray>{'Timing Slot Duration'}</H9fontRegularGray> */}
              </View>
              <View
                style={{
                  height: 60,
                  width: 60,
                  backgroundColor: 'white',
                  borderRadius: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 8,
                }}>
                <Progress.Circle
                  size={60}
                  borderWidth={0}
                  borderColor={'#fff'}
                  textStyle={{
                    color: '#000000',
                    fontSize: 11,
                
                    textAlign: 'center',
                    lineHeight: 12,
                  }}
                  thickness={4}
                  unfilledColor="#fff"
                  color="#1B5A90"
                  progress={0.4}
                  showsText={true}
                  formatText={progress => '30' + '\n' + 'Mints'}
                />
              </View>
            </RowView>
          </View>
          <CardSurface style={styles.containerStyle}>
            {/* <Calendar
              minDate={new Date()}
              onDayPress={handleAddDay}
              markingType={'multi-period'}
              markedDates={markedDates}
              // markedDates={}
            /> */}
            <Calendar
              minDate={_today}
              maxDate={_maxDate}
              onDayPress={onDaySelect}
              markedDates={_markedDates}
            />
            {selectedDays ? (
              <TouchableOpacity style={styles.nextButtonStyle}>
                <H14fontRegularWhite>Schedule timings</H14fontRegularWhite>
              </TouchableOpacity>
            ) : null}
          </CardSurface>
        </ScrollView>
      </MainContainer>
    </Fragment>
  );
};

export default ClinicCalendar;

const styles = StyleSheet.create({
  containerStyle: {marginHorizontal: 10, marginTop: 10},
  dropDownStyle: {
    height: 40,
    // width: DevWidth/1.5,
    borderColor: '#CFCFCF',
    borderRadius: 3,
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  dropdown: {
    height: 38,
    // paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 5,
    backgroundColor: '#fff',
  },
  iconStyle: {
    width: 0,
    height: 0,
  },
  nextButtonStyle: {
    height: 45,
    backgroundColor: '#1B5A90',
    marginVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
});
