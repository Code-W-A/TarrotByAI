import React, { Fragment, useEffect, useState } from "react";
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
} from "react-native";
import { GeneralProps } from "../../interfaces/generalProps";
import { Route } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  CardSurface,
  MainContainer,
  RowView,
} from "../../components/commonViews";
import { NavBar, NavBarPatient } from "../../common/commonComponents";
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
  H15fontMediumWhite,
} from "../../components/commonText";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "../../utils/colors";
// import {DevHeight, DevWidth} from '../../utils/device';
import { Dimensions } from "react-native";

import * as Progress from "react-native-progress";

import { days, timeSlotStart, timeSlotEnd } from "../../utils/constant";

import { Dropdown } from "react-native-element-dropdown";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { uploadClinicTimeSlots } from "../../utils/UploadFirebaseData";
import CustomLoader from "../../components/customLoader";
import { screenName } from "../../utils/screenName";
import {
  getCalendarTimes,
  getScheduleTimings,
} from "../../actions/clinicActions";
import { labels } from "../../utils/labels";
import i18n, { getUses24hourClockFromPhoneSettings } from "../../../i18n";
import { createTimeFormat } from "../../utils/convertTime24Hours";
import { useHourClockContext } from "../../context/HourClockContext";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
  doctorDocId?: any;
  handleAddSubmit?: any;
  allDaysDB?: any;
  handleUpdateDoctor?: any;
}

const DoctorScheduleTimings: React.FC<Props> = ({
  navigation,
  route,
  doctorDocId,
  handleAddSubmit,
  allDaysDB,
  handleUpdateDoctor,
}): JSX.Element => {
  // const clinicTimeSlotsDB = useSelector(state => state.clinicTimeSlots);
  // const {allDaysDB} = clinicTimeSlotsDB;
  const hourClock = useHourClockContext();

  const [modalOpen, setModalOpen] = useState(false);

  const [cancelActionRemove, setCancelActionRemove] = useState(false);
  const [timeSlot, setTimeSlot] = useState([]);
  const [timeSlotsPack, setTimeSlotsPack] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [allDays, setAllDays] = useState(allDaysDB ? allDaysDB : []);

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
    console.log(moment(value).format("HH:mm"));
  }

  // const [numericAvailableDays, setNumericAvailableDays] = useState([]);

  const [timeslotend, setTimeEnd] = useState("-");
  const [timeslotstart, setTimeStart] = useState("-");

  const [time, setTime] = useState([{ starttime: "-", endtime: "-" }]);
  const [addedTimes, setAddedTimes] = useState([]);
  const [startTimePicked, setStartTimePicked] = useState("");
  const [endTimePicked, setEndTimePicked] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [modalHeight, setModalHeight] = useState(200);
  const [scrollHeight, setScrollHeight] = useState(
    Dimensions.get("window").height / 3.2
  );
  const [repeatDay, setRepeatDay] = useState<any>("");
  const [copiedDay, setCopiedDay] = useState<any>({});
  const [newAllDays, setNewAllDays] = useState<any>([]);
  const [selectedDays, setSelectedDays] = useState<any>([]);

  const dispatch = useDispatch();

  const handleRepeatDay = (
    val,
    nr,
    timeS,
    translatedTimeSlot,
    translatedVal
  ) => {
    console.log("------------handleRepeatDay---------------");
    console.log(translatedVal);

    // let filteredDays = newAllDays.filter(item => item.timeSPack.length > 0).sort((a, b) => a.nr - b.nr)
    let filteredDays = newAllDays;
    // let filteredDays = newAllDays.filter(item => item.timeSPack.length > 0).sort((a, b) => a.nr - b.nr)
    let newObj = {
      nr,
      timeS,
      timeSPack: [...copiedDay.timeSPack],
      val,
      translatedTimeSlot,
      translatedVal,
    };

    for (let i = 0; i < selectedDays.length; i++) {
      console.log("YES...selectedDays loop");
      if (selectedDays[i] === val) {
        setSelectedDays(selectedDays.filter((item) => item !== val));
      }
    }

    for (let i = 0; i < filteredDays.length; i++) {
      console.log("YES...filteredDays loop");
      if (filteredDays[i].nr === nr && selectedDays.includes(val)) {
        setNewAllDays(
          filteredDays
            .filter((item) => item.nr !== nr)
            .sort((a, b) => a.nr - b.nr)
        );
        return;
      }
    }

    let newSelectedD = selectedDays;
    newSelectedD.push(val);
    setSelectedDays(newSelectedD);

    for (let i = 0; i < filteredDays.length; i++) {
      console.log("newObj---------");
      console.log(newObj.nr);
      console.log(filteredDays[i].nr);
      if (filteredDays[i].nr === newObj.nr) {
        let filteredD = filteredDays
          .filter((item) => item.nr !== nr)
          .sort((a, b) => a.nr - b.nr);

        let allDaysArr = [...filteredD];
        allDaysArr.push(newObj);

        setNewAllDays(allDaysArr.sort((a, b) => a.nr - b.nr));
        return;
      }
    }

    console.log(copiedDay);
    console.log(nr);
    console.log(timeS);
    console.log(val);
    console.log(newAllDays);

    console.log("start add...new obj");
    console.log(newObj);
    let allDaysArr = [...newAllDays];
    allDaysArr.push(newObj);
    console.log(allDaysArr);
    setNewAllDays(allDaysArr);
  };

  const handleCompleteRepeatDays = () => {
    let newDays = [...newAllDays];
    setAllDays(newDays);
    setNewAllDays([]);
    setRepeatDay("");
  };

  const handleSave = () => {
    setIsLoading(false);

    handleAddSubmit(allDays);

    setIsLoading(false);
  };

  const handleUpdate = () => {
    // setIsLoading(true);
    console.log(allDays);
    handleUpdateDoctor(allDays);

    // setIsLoading(false);
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
    // setAllDays(allDaysDB);
    // setSelectedDays([])
    // console.log('repeat day...', repeatDay);

    console.log("hourClock...", hourClock);

    // console.log('copiedDay...', copiedDay);
    // console.log('new all days...', newAllDays);
    // console.log('selectedDays...', selectedDays);
    // console.log('allDays local...', allDays);
  }, []);

  const handleRemoveDay = (nr) => {
    setAllDays(
      allDays.filter((item) => item.nr !== nr).sort((a, b) => a.nr - b.nr)
    );
  };

  const addDay = (
    val,
    nr,
    timeS,
    timeSPack,
    translatedTimeSlot,
    translatedVal
  ) => {
    if (allDays.length == 0) {
      setAllDays(
        [{ val, nr, timeS, timeSPack, translatedTimeSlot, translatedVal }].sort(
          (a, b) => a.nr - b.nr
        )
      );
    } else if (allDays.some((n) => n.nr == nr)) {
      if (allDaysDB.allDay) {
        if (allDaysDB.allDays.length > 0) {
          Alert.alert(
            i18n.translate("deleteTimeSlotsAlert"),
            i18n.translate("deleteTimeSlotsAlertQuestion"),
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Remove",
                onPress: () => handleRemoveDay(nr),
              },
            ]
          );
        } else {
          handleRemoveDay(nr);
        }
      } else {
        handleRemoveDay(nr);
      }
    } else {
      setAllDays(
        [
          ...allDays,
          { val, nr, timeS, timeSPack, translatedTimeSlot, translatedVal },
        ].sort((a, b) => a.nr - b.nr)
      );
    }

    // setAllDays(allDays.sort((a, b) => a.nr - b.nr));
  };

  const addTime = () => {
    console.log(time);

    let arr = { starttime: "-", endtime: "-" };
    setTime([...time, arr]);

    setModalHeight(modalHeight + 61);
    setScrollHeight(scrollHeight - 31);
  };

  const handleAddStartTime = (pickedTime, index) => {
    console.log(
      "-------------------------------------------------------",
      index
    );

    setStartTimePicker(false);
    let newTime = time;
    // console.log(newTime);
    console.log("pickedTime...before", pickedTime);
    // console.log('pickedTime...', pickedTime);

    newTime[index].starttime = pickedTime;

    // console.log('newTime...', newTime);
    setTime([...newTime]);
  };

  const handleAddEndTime = (pickedTime, index) => {
    console.log(
      "-------------------------------------------------------",
      index
    );

    setEndTimePicker(false);
    let newTime = time;
    // console.log(newTime);
    // console.log('newTime...before', newTime);
    console.log("pickedTime...", pickedTime);

    newTime[index].endtime = pickedTime;

    console.log("newTime...", newTime);
    setTime([...newTime]);
  };

  const handleSaveChanges = () => {
    let newTimeSlots = allDays;
    console.log("time", time);
    console.log("newTimeSlots", newTimeSlots[timeSlotIndex].timeSPack);
    newTimeSlots[timeSlotIndex].timeSPack = time;
    console.log("newTimeSlots after", newTimeSlots[timeSlotIndex].timeSPack);
    setTime([{ starttime: "-", endtime: "-" }]);
    setAllDays(newTimeSlots);
    setModalOpen(false);
  };

  const removeItem = (index) => {
    setModalHeight(modalHeight - 61);
    time.splice(index, 1);
    setScrollHeight(scrollHeight + 31);
  };

  return (
    <Fragment>
      <MainContainer>
        <CustomLoader isLoading={isLoading} />
        {/* <NavBar
          title={'Doctor Schedule Timings'}
          navHeight={80}
          isTermsAccepted={true}
        /> */}
        <ScrollView>
          <View
            style={{
              height: 100,
              backgroundColor: "white",
              padding: 20,
              flexDirection: "row",
            }}
          >
            <CardSurface
              style={{
                borderRadius: 40,
                height: 60,
                width: 60,
                backgroundColor: colors.facebook,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AntDesign name="calendar" size={35} color={colors.white} />
            </CardSurface>
            <RowView style={{ flex: 1 }}>
              <View style={{ paddingLeft: 10, paddingTop: 5 }}>
                <H8fontMediumBlack>
                  {i18n.translate("scheduleTimings")}
                </H8fontMediumBlack>
                <H9fontRegularGray>
                  {i18n.translate("timingSlotDuration")}
                </H9fontRegularGray>
              </View>
              <View
                style={{
                  marginLeft: 10,
                  marginTop: 8,
                  height: 40,
                  width: "auto",
                  backgroundColor: "white",
                  borderRadius: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  elevation: 8,
                }}
              >
                {doctorDocId ? (
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={handleUpdate}
                  >
                    <H8fontRegularWhite>
                      {i18n.translate("update")}
                    </H8fontRegularWhite>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={handleSave}
                  >
                    <H8fontRegularWhite>
                      {i18n.translate("save")}
                    </H8fontRegularWhite>
                  </TouchableOpacity>
                )}
              </View>
            </RowView>
          </View>

          {/* START SELECT DAY */}
          <RowView
            style={{
              paddingRight: 30,
              alignItems: "center",
            }}
          >
            <H15fontMediumBlack
              style={{
                paddingHorizontal: 16,
                paddingTop: 20,
                paddingBottom: 10,
              }}
            >
              {i18n.translate("selectDay")}
            </H15fontMediumBlack>
            {repeatDay.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setRepeatDay("");
                  setCopiedDay({});
                  setNewAllDays([]);
                }}
              >
                <AntDesign
                  name="closesquare"
                  size={24}
                  color={colors.facebook}
                />
              </TouchableOpacity>
            )}
          </RowView>
          <View style={{ marginHorizontal: 16 }}>
            {repeatDay.length === 0 ? (
              <FlatList
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={days}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      addDay(
                        item.name,
                        item.nr,
                        item.timeSlot,
                        item.timeSlotsPack,
                        item.translatedTimeSlot,
                        item.translated
                      );
                    }}
                    style={{
                      marginRight: 10,
                      width: 45,
                      height: 85,
                      borderWidth: 1,
                      borderRadius: 50,
                      borderColor: allDays.some((v) => v.val == item.name)
                        ? colors.facebook
                        : colors.lightGray,

                      backgroundColor: allDays.some((v) => v.val == item.name)
                        ? colors.facebook
                        : colors.white,
                      alignItems: "center",
                    }}
                  >
                    <H9fontRegularGray
                      style={{
                        color: allDays.some((v) => v.val == item.name)
                          ? "#fff"
                          : colors.lightGray,
                        paddingTop: 35,
                      }}
                    >
                      {i18n.translate(item.translated)}
                    </H9fontRegularGray>
                    <View style={{ paddingTop: 5 }}>
                      <FontAwesome5
                        name="calendar-check"
                        size={18}
                        color={"#fff"}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <FlatList
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={days}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      handleRepeatDay(
                        item.name,
                        item.nr,
                        item.timeSlot,
                        item.translatedTimeSlot,
                        item.translated
                      );
                    }}
                    style={{
                      marginRight: 10,
                      width: 45,
                      height: 85,
                      borderWidth: 1,
                      borderRadius: 50,
                      borderColor:
                        item.name === repeatDay
                          ? colors.lightGrayOpac
                          : selectedDays.includes(item.name)
                          ? colors.facebook
                          : newAllDays.some((v) => v.val == item.name) &&
                            item.name != repeatDay
                          ? colors.lightGray
                          : colors.lightGray,

                      backgroundColor:
                        item.name === repeatDay
                          ? colors.lightGrayOpac
                          : selectedDays.includes(item.name)
                          ? colors.facebook
                          : newAllDays.some((v) => v.val == item.name) &&
                            item.name != repeatDay
                          ? colors.white
                          : colors.white,

                      alignItems: "center",
                    }}
                  >
                    <H9fontRegularGray
                      style={{
                        color:
                          item.name === repeatDay
                            ? colors.lightGrayOpac
                            : selectedDays.includes(item.name)
                            ? colors.white
                            : newAllDays.some((v) => v.val == item.name) &&
                              item.name != repeatDay
                            ? colors.lightGray
                            : colors.lightGray,

                        paddingTop: 35,
                      }}
                    >
                      {i18n.translate(item.translated)}
                    </H9fontRegularGray>
                    <View style={{ paddingTop: 5 }}>
                      <FontAwesome5
                        name="calendar-check"
                        size={18}
                        color={"#fff"}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          {allDays.map((item, index) => (
            <>
              <RowView
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingTop: 25,
                  // paddingBottom: 10,
                  // alignItems:"center"
                }}
                key={index}
              >
                <H15fontMediumBlack>
                  {i18n.translate(item.translatedTimeSlot)}
                </H15fontMediumBlack>
              </RowView>

              <RowView
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingTop: 15,
                  paddingBottom: 10,
                  // alignItems:"center"
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setModalOpen(true);
                    setTimeSlotIndex(index);
                    setTime(allDays[index].timeSPack);
                  }}
                  style={{ flexDirection: "row" }}
                >
                  <H14fontRegularBlue>
                    {i18n.translate("editTimeSlots")}
                  </H14fontRegularBlue>
                </TouchableOpacity>
                {
                  // allDays[0].timeSPack.length > 0 && repeatDay.length === 0 && item.timeSPack.length > 0
                  repeatDay.length === 0 && item.timeSPack.length > 0 ? (
                    <TouchableOpacity
                      onPress={() => {
                        console.log("Asdas");
                        setRepeatDay(item.val);
                        setCopiedDay(item);
                        setNewAllDays(allDays);
                        setSelectedDays([]);
                      }}
                      style={{ flexDirection: "row" }}
                    >
                      <H14fontRegularBlue>
                        {i18n.translate("repeatDay")}
                      </H14fontRegularBlue>
                    </TouchableOpacity>
                  ) : repeatDay === item.val ? (
                    <TouchableOpacity
                      onPress={() => {
                        handleCompleteRepeatDays();
                      }}
                      style={{ flexDirection: "row" }}
                    >
                      <View
                        style={{
                          backgroundColor: colors.facebook,
                          borderColor: colors.lightGray,
                          borderWidth: 0.2,
                          padding: 4,
                          height: "auto",
                          width: "auto",
                          borderRadius: 3,
                          elevation: 8,
                        }}
                      >
                        <H14fontRegularWhite>
                          {i18n.translate("completeRepeat")}
                        </H14fontRegularWhite>
                      </View>
                    </TouchableOpacity>
                  ) : null
                }
              </RowView>

              <RowView
                style={{ flex: 1, paddingBottom: 10, paddingHorizontal: 16 }}
              >
                <FlatList
                  horizontal={true}
                  data={item.timeSPack}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    width: Dimensions.get("window").width / 1.07,
                  }}
                  // data={[{}, {}, {}]}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        marginRight: 10,
                        width: "auto",
                        height: "auto",
                        borderWidth: 1,
                        borderRadius: 50,
                        borderColor: colors.facebook,
                        backgroundColor: colors.white,
                        flexDirection: "row",
                        paddingHorizontal: 10,
                        marginBottom: 10,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <H6fontRegularBlack
                        style={{ fontSize: !hourClock ? 15 : null }}
                      >
                        {createTimeFormat(item.starttime, hourClock)} -{" "}
                        {createTimeFormat(item.endtime, hourClock)}
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

        <Modal visible={modalOpen} transparent={true} animationType={"fade"}>
          <ScrollView>
            <View
              style={{
                minHeight: Dimensions.get("window").height,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(100, 100, 100, 0.5)",
              }}
            >
              <View
                style={{
                  // minHeight: modalHeight,
                  width: Dimensions.get("window").width / 1.1,
                  backgroundColor: "#fff",
                  paddingTop: 20,
                  borderRadius: 5,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 15,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 10,
                  }}
                >
                  <H15fontMediumBlack>
                    {i18n.translate("editTimeSlots")}
                  </H15fontMediumBlack>
                  <TouchableOpacity
                    onPress={() => setModalOpen(false)}
                    style={{
                      height: 17,
                      width: 17,
                      borderRadius: 17,
                      backgroundColor: "#A0A0A0",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", bottom: 3 }}>x</Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#ced4da",
                    width: Dimensions.get("window").width / 1.1,
                  }}
                />

                <View style={{ paddingHorizontal: 15 }}>
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{}}
                    data={time}
                    renderItem={({ item, index }) => (
                      <View>
                        {/* <H9fontMediumBlack>Start Time</H9fontMediumBlack> */}
                        <H9fontMediumBlack>
                          {i18n.translate("startTime")}
                        </H9fontMediumBlack>
                        {/* <View style={styles.dropDownStyle}> */}
                        {startTimePicker && currentIndexSelected === index ? (
                          <DateTimePicker
                            textColor="red"
                            value={timeP}
                            mode={"time"}
                            display="spinner"
                            is24Hour={hourClock}
                            onChange={(event, value) => {
                              if (event.type === "dismissed") {
                                setStartTimePicker(false);
                                return;
                              }
                              handleAddStartTime(
                                moment(value).format("HH:mm"),
                                index
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
                            }}
                          >
                            <H6fontRegularBlack>
                              {time[index].starttime != "-"
                                ? createTimeFormat(
                                    time[index].starttime,
                                    hourClock
                                  )
                                : i18n.translate("selectTime")}
                            </H6fontRegularBlack>
                          </TouchableOpacity>
                        )}
                        {/* </View> */}

                        <H9fontMediumBlack>
                          {i18n.translate("endTime")}
                        </H9fontMediumBlack>
                        {/* <View style={styles.dropDownStyle}> */}
                        {endTimePicker && currentIndexSelected === index ? (
                          <DateTimePicker
                            textColor="red"
                            value={timeP}
                            mode={"time"}
                            display="spinner"
                            is24Hour={hourClock}
                            onChange={(event, value) => {
                              if (event.type === "dismissed") {
                                setEndTimePicker(false);
                                return;
                              }
                              handleAddEndTime(
                                moment(value).format("HH:mm"),
                                index
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
                            }}
                          >
                            <H6fontRegularBlack>
                              {time[index].endtime != "-"
                                ? createTimeFormat(
                                    time[index].endtime,
                                    hourClock
                                  )
                                : i18n.translate("selectTime")}
                            </H6fontRegularBlack>
                          </TouchableOpacity>
                        )}
                        {/* </View> */}

                        <TouchableOpacity
                          onPress={() => removeItem(index)}
                          style={{
                            height: 38,
                            backgroundColor: "#dc3545",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 5,
                            marginBottom: 15,
                          }}
                        >
                          {/* <DeleteIcon name="delete" size={14} color={'white'} /> */}
                          <H15fontMediumWhite>
                            {i18n.translate("deleteTimeSlot")}
                          </H15fontMediumWhite>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => addTime()}
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: 15,
                    paddingBottom: 15,
                  }}
                >
                  {/* <AddIcon
                    name="add-circle"
                    size={18}
                    color={'#777'}
                    style={{paddingRight: 3}}
                  /> */}
                  <H9fontMediumBlue style={{ fontSize: 15 }}>
                    {i18n.translate("addMoreTimes")}
                  </H9fontMediumBlue>
                </TouchableOpacity>

                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={handleSaveChanges}
                    style={{
                      padding: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#0d6efd",
                      borderRadius: 5,
                      marginBottom: 20,
                    }}
                  >
                    <H14fontRegularWhite>
                      {i18n.translate("saveChangeToTime")}
                    </H14fontRegularWhite>
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

export default DoctorScheduleTimings;
const styles = StyleSheet.create({
  // Style for iOS ONLY...
  datePicker: {
    justifyContent: "center",
    alignItems: "flex-start",
    width: 320,
    height: 260,
    display: "flex",
  },
  dropDownStyle: {
    height: 40,
    // width: DevWidth/1.5,
    borderColor: "#CFCFCF",
    borderRadius: 3,
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  dropdown: {
    height: 38,
    // paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 5,
    backgroundColor: "#fff",
  },
  iconStyle: {
    width: 0,
    height: 0,
  },
  buttonStyle: {
    // marginTop: 12,
    height: "100%",
    width: "100%",
    borderRadius: 5,
    backgroundColor: colors.facebook,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
