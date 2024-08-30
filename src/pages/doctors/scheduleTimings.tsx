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
  Platform,
  Alert,
} from 'react-native';
import {GeneralProps} from '../../interfaces/generalProps';
import {Route} from '@react-navigation/native';
import {
  CardSurface,
  MainContainer,
  RowView,
} from '../../components/commonViews';
import {NavBar, NavBarPatient} from '../../common/commonComponents';
import {
  H14fontRegularWhite,
  H15fontMediumBlack,
  H8fontMediumBlack,
  H8fontRegularWhite,
  H9fontMediumBlack,
  H9fontRegularGray,
  H6fontRegularBlack,
  H14fontRegularBlue,
  H9fontMediumBlue,
  H10fontRegularBlack,
} from '../../components/commonText';
import {colors} from '../../utils/colors';
// import {DevHeight, DevWidth} from '../../utils/device';
import {Dimensions} from 'react-native';

import * as Progress from 'react-native-progress';

// import EditIcon from 'react-native-vector-icons/MaterialIcons';
// import DeleteIcon from 'react-native-vector-icons/AntDesign';
// import AddIcon from 'react-native-vector-icons/MaterialIcons';
// import CheckIcon from 'react-native-vector-icons/Entypo';
import {days, timeSlotStart, timeSlotEnd} from '../../utils/constant';
import CalendarIcon from '../../../assets/images/calender-icon.svg';
import FeatherIcon from '../../../assets/images/icon-feather-check-circle.svg';
import {Dropdown} from 'react-native-element-dropdown';
import {useDispatch, useSelector} from 'react-redux';
import {ActivityIndicator, TextInput} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {uploadClinicTimeSlots} from '../../utils/UploadFirebaseData';
import CustomLoader from '../../components/customLoader';
import {screenName} from '../../utils/screenName';
import {
  getCalendarTimes,
  getScheduleTimings,
} from '../../actions/clinicActions';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const ScheduleTimings: React.FC<Props> = ({navigation, route}): JSX.Element => {
  const clinicTimeSlotsDB = useSelector(state => state.clinicTimeSlots);
  const {allDaysDB} = clinicTimeSlotsDB;

  const [modalOpen, setModalOpen] = useState(false);

  const [cancelActionRemove, setCancelActionRemove] = useState(false);
  const [timeSlot, setTimeSlot] = useState([]);
  const [timeSlotsPack, setTimeSlotsPack] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [allDays, setAllDays] = useState(
    allDaysDB.allDays ? allDaysDB.allDays : [],
  );

  const [datePicker, setDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const [currentIndexSelected, setCurrentIndexSelected] = useState(0);
  const [timeSlotIndex, setTimeSlotIndex] = useState(0);

  const [startTimePicker, setStartTimePicker] = useState(false);
  const [endTimePicker, setEndTimePicker] = useState(false);
  const [timeP, setTimeP] = useState(new Date(Date.now()));

  function showDatePicker() {
    setDatePicker(true);
  }

  // function showTimePicker() {
  //   setTimePicker(true);
  // }

  function onDateSelected(event, value) {
    setDate(value);
    setDatePicker(false);
  }

  function onTimeSelected(event, value) {
    // setTime(value);
    setTimePicker(false);
    console.log(moment(value).format('HH:mm'));
  }

  // const [numericAvailableDays, setNumericAvailableDays] = useState([]);

  const [isFocus, setIsFocus] = useState(false);
  const [timeslotend, setTimeEnd] = useState('-');
  const [timeslotstart, setTimeStart] = useState('-');

  const [time, setTime] = useState([{starttime: '-', endtime: '-'}]);
  const [addedTimes, setAddedTimes] = useState([]);
  const [startTimePicked, setStartTimePicked] = useState('');
  const [endTimePicked, setEndTimePicked] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [modalHeight, setModalHeight] = useState(200);
  const [scrollHeight, setScrollHeight] = useState(
    Dimensions.get('window').height / 3.2,
  );

  const dispatch = useDispatch();

  const handleSave = () => {
    setIsLoading(true);
    dispatch(getCalendarTimes());
    dispatch(getScheduleTimings());
    uploadClinicTimeSlots(allDays);
    setIsLoading(false);
    navigation.navigate(screenName.DoctorDashBoard);
  };

  const transformDate = (date, day) => {
    const offset = date.getDay() - day;

    const d = new Date(date);
    d.setDate(d.getDate() - offset);
    return d;
  };

  // const availableDays = [0, 2, 4, 6];
  const today = new Date();

  useEffect(() => {
    // console.log('allDaysDB...', allDaysDB);
    // console.log('allDays local...', allDays);
    // setIsLoading(false);
  }, []);

  const handleRemoveDay = nr => {
    setAllDays(
      allDays.filter(item => item.nr !== nr).sort((a, b) => a.nr - b.nr),
    );
  };

  const addDay = (val, nr, timeS, timeSPack) => {
    if (allDays.length == 0) {
      setAllDays([{val, nr, timeS, timeSPack}].sort((a, b) => a.nr - b.nr));
    } else if (allDays.some(n => n.nr == nr)) {
      if (allDaysDB.allDay) {
        if (allDaysDB.allDays.length > 0) {
          Alert.alert(
            'This action will delete all time slots related to this day.',
            'Are you sure that you wante to continue?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Remove',
                onPress: () => handleRemoveDay(nr),
              },
            ],
          );
        } else {
          handleRemoveDay(nr);
        }
      } else {
        handleRemoveDay(nr);
      }
    } else {
      setAllDays(
        [...allDays, {val, nr, timeS, timeSPack}].sort((a, b) => a.nr - b.nr),
      );
    }

    // setAllDays(allDays.sort((a, b) => a.nr - b.nr));
  };

  const addTime = () => {
    console.log(time);

    let arr = {starttime: '-', endtime: '-'};
    setTime([...time, arr]);

    setModalHeight(modalHeight + 61);
    setScrollHeight(scrollHeight - 31);
  };

  const handleAddStartTime = (pickedTime, index) => {
    console.log(
      '-------------------------------------------------------',
      index,
    );

    setStartTimePicker(false);
    let newTime = time;
    // console.log(newTime);
    // console.log('newTime...before', newTime);
    // console.log('pickedTime...', pickedTime);

    newTime[index].starttime = pickedTime;

    // console.log('newTime...', newTime);
    setTime([...newTime]);
  };

  const handleAddEndTime = (pickedTime, index) => {
    console.log(
      '-------------------------------------------------------',
      index,
    );

    setEndTimePicker(false);
    let newTime = time;
    // console.log(newTime);
    console.log('newTime...before', newTime);
    console.log('pickedTime...', pickedTime);

    newTime[index].endtime = pickedTime;

    console.log('newTime...', newTime);
    setTime([...newTime]);
  };

  const handleSaveChanges = () => {
    let newTimeSlots = allDays;
    console.log('time', time);
    console.log('newTimeSlots', newTimeSlots[timeSlotIndex].timeSPack);
    newTimeSlots[timeSlotIndex].timeSPack = time;
    console.log('newTimeSlots after', newTimeSlots[timeSlotIndex].timeSPack);
    setTime([{starttime: '-', endtime: '-'}]);
    setAllDays(newTimeSlots);
    setModalOpen(false);
  };

  const removeItem = index => {
    setModalHeight(modalHeight - 61);
    time.splice(index, 1);
    setScrollHeight(scrollHeight + 31);
  };

  return (
    <Fragment>
      <MainContainer>
        <CustomLoader isLoading={isLoading} />
        <NavBar
          title={'Doctor Schedule Timings'}
          navHeight={80}
          isTermsAccepted={true}
        />
        <ScrollView>
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
                <H9fontRegularGray>{'Timing Slot Duration'}</H9fontRegularGray>
              </View>
              <View
                style={{
                  marginLeft: 10,
                  marginTop: 8,
                  height: 40,
                  width: 110,
                  backgroundColor: 'white',
                  borderRadius: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 8,
                }}>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={handleSave}>
                  <H8fontRegularWhite>Save</H8fontRegularWhite>
                </TouchableOpacity>
              </View>
            </RowView>
          </View>

          {/* START SELECT DAY */}
          <H15fontMediumBlack
            style={{paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10}}>
            {'Select day'}
          </H15fontMediumBlack>
          <View style={{marginHorizontal: 16}}>
            <FlatList
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              // contentContainerStyle={{left: 20}}
              data={days}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() =>
                    addDay(
                      item.name,
                      item.nr,
                      item.timeSlot,
                      item.timeSlotsPack,
                    )
                  }
                  style={{
                    marginRight: 10,
                    width: 45,
                    height: 85,
                    borderWidth: 1,
                    borderRadius: 50,
                    borderColor: allDays.some(v => v.val == item.name)
                      ? '#0dcaf0'
                      : colors.lightGray,
                    backgroundColor: allDays.some(v => v.val == item.name)
                      ? '#0CE0FF'
                      : colors.white,
                    alignItems: 'center',
                  }}>
                  <H9fontRegularGray
                    style={{
                      color: allDays.some(v => v.val == item.name)
                        ? '#fff'
                        : colors.lightGray,
                      paddingTop: 35,
                    }}>
                    {item.name}
                  </H9fontRegularGray>
                  <View style={{paddingTop: 5}}>
                    <FeatherIcon fill={'#fff'} />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {allDays.map((item, index) => (
            <>
              <RowView
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingTop: 25,
                  paddingBottom: 10,
                }}>
                <H15fontMediumBlack>{item.timeS}</H15fontMediumBlack>
                <TouchableOpacity
                  onPress={() => {
                    setModalOpen(true);
                    setTimeSlotIndex(index);
                    setTime(allDays[index].timeSPack);
                  }}
                  style={{flexDirection: 'row'}}>
                  {/* <EditIcon
                    name="edit"
                    size={17}
                    color={'black'}
                    style={{paddingRight: 3, paddingTop: 3}}
                  /> */}
                  <H14fontRegularBlue>{'Edit Time Slots'}</H14fontRegularBlue>
                </TouchableOpacity>
              </RowView>

              <RowView
                style={{flex: 1, paddingBottom: 10, paddingHorizontal: 16}}>
                <FlatList
                  horizontal={true}
                  data={item.timeSPack}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    width: Dimensions.get('window').width / 1.07,
                  }}
                  // data={[{}, {}, {}]}
                  renderItem={({item, index}) => (
                    <View
                      style={{
                        marginRight: 10,
                        width: Dimensions.get('window').width / 2.3,
                        height: 40,
                        borderWidth: 1,
                        borderRadius: 50,
                        borderColor: colors.seaBlue,
                        backgroundColor: colors.white,
                        flexDirection: 'row',
                        paddingHorizontal: 10,
                        marginBottom: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <H6fontRegularBlack>
                        {item.starttime} - {item.endtime}
                      </H6fontRegularBlack>
                      {/* <View
                        style={{
                          height: 11,
                          width: 11,
                          borderColor: '#FF2D58',
                          borderWidth: 1,
                          borderRadius: 12,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            fontSize: 5,
                            color: '#FF2D58',
                    
                          }}>
                          X
                        </Text>
                      </View> */}
                    </View>
                  )}
                />
              </RowView>
            </>
          ))}
        </ScrollView>

        <Modal visible={modalOpen} transparent={true} animationType={'fade'}>
          <ScrollView>
            <View
              style={{
                // flex: 1,
                minHeight: Dimensions.get('window').height,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(100, 100, 100, 0.5)',
              }}>
              <View
                style={{
                  // minHeight: modalHeight,
                  width: Dimensions.get('window').width / 1.1,
                  backgroundColor: '#fff',
                  paddingTop: 20,
                  borderRadius: 5,
                }}>
                <View
                  style={{
                    paddingHorizontal: 15,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 10,
                  }}>
                  <H15fontMediumBlack>Edit Time Slots</H15fontMediumBlack>
                  <TouchableOpacity
                    onPress={() => setModalOpen(false)}
                    style={{
                      height: 17,
                      width: 17,
                      borderRadius: 17,
                      backgroundColor: '#A0A0A0',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{color: '#fff', bottom: 3}}>x</Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#ced4da',
                    width: Dimensions.get('window').width / 1.1,
                  }}
                />

                <View style={{paddingHorizontal: 15}}>
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{}}
                    data={time}
                    renderItem={({item, index}) => (
                      <View>
                        {/* <H9fontMediumBlack>Start Time</H9fontMediumBlack> */}
                        <H9fontMediumBlack>Start Time</H9fontMediumBlack>
                        {/* <View style={styles.dropDownStyle}> */}
                        {startTimePicker && currentIndexSelected === index ? (
                          <DateTimePicker
                            value={timeP}
                            mode={'time'}
                            display={
                              Platform.OS === 'ios' ? 'spinner' : 'default'
                            }
                            is24Hour={false}
                            onChange={(event, value) => {
                              if (event.type === 'dismissed') {
                                setStartTimePicker(false);
                                return;
                              }
                              handleAddStartTime(
                                moment(value).format('HH:mm'),
                                index,
                              );
                            }}
                            // onCancel={() => handleAddStartTime('none', index)}
                            style={styles.datePicker}
                          />
                        ) : (
                          <TouchableOpacity
                            style={styles.dropDownStyle}
                            onPress={() => {
                              setStartTimePicker(true);
                              setCurrentIndexSelected(index);
                            }}>
                            <H6fontRegularBlack>
                              {time[index].starttime != '-'
                                ? time[index].starttime
                                : 'Select Time'}
                            </H6fontRegularBlack>
                          </TouchableOpacity>
                        )}
                        {/* </View> */}

                        <H9fontMediumBlack>End Time</H9fontMediumBlack>
                        {/* <View style={styles.dropDownStyle}> */}
                        {endTimePicker && currentIndexSelected === index ? (
                          <DateTimePicker
                            value={timeP}
                            mode={'time'}
                            display={
                              Platform.OS === 'ios' ? 'spinner' : 'default'
                            }
                            is24Hour={false}
                            onChange={(event, value) => {
                              if (event.type === 'dismissed') {
                                setEndTimePicker(false);
                                return;
                              }
                              handleAddEndTime(
                                moment(value).format('HH:mm'),
                                index,
                              );
                            }}
                            // onCancel={() => setEndTimePicker(false)}
                            style={styles.datePicker}
                          />
                        ) : (
                          <TouchableOpacity
                            style={styles.dropDownStyle}
                            onPress={() => {
                              setEndTimePicker(true);
                              setCurrentIndexSelected(index);
                            }}>
                            <H6fontRegularBlack>
                              {time[index].endtime != '-'
                                ? time[index].endtime
                                : 'Select Time'}
                            </H6fontRegularBlack>
                          </TouchableOpacity>
                        )}
                        {/* </View> */}

                        <TouchableOpacity
                          onPress={() => removeItem(index)}
                          style={{
                            height: 38,
                            backgroundColor: '#dc3545',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                            marginBottom: 15,
                          }}>
                          {/* <DeleteIcon name="delete" size={14} color={'white'} /> */}
                          <H15fontMediumBlack>
                            Delete Time Slot
                          </H15fontMediumBlack>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => addTime()}
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                    paddingBottom: 15,
                  }}>
                  {/* <AddIcon
                    name="add-circle"
                    size={18}
                    color={'#777'}
                    style={{paddingRight: 3}}
                  /> */}
                  <H9fontMediumBlue style={{fontSize: 15}}>
                    Add More
                  </H9fontMediumBlue>
                </TouchableOpacity>

                <View style={{alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={handleSaveChanges}
                    style={{
                      padding: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#0d6efd',
                      borderRadius: 5,
                      marginBottom: 20,
                    }}>
                    <H14fontRegularWhite>Save Changes</H14fontRegularWhite>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </MainContainer>
    </Fragment>
  );
};

export default ScheduleTimings;
const styles = StyleSheet.create({
  // Style for iOS ONLY...
  datePicker: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 320,
    height: 260,
    display: 'flex',
  },
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
  buttonStyle: {
    // marginTop: 12,
    height: '100%',
    width: '100%',
    borderRadius: 5,
    backgroundColor: '#0CE0FF',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
