import * as React from "react";
import { View, Platform, StyleSheet, Modal } from "react-native";
import {
  Appbar,
  FAB,
  Switch,
  Paragraph,
  Text,
  useTheme,
  RadioButton,
  List,
  Chip,
} from "react-native-paper";

import ScreenWrapper from "./ScreenWraper";
import { colors } from "../../utils/colors";
import { useNavigation } from "@react-navigation/native";
import i18n from "../../../i18n";
import moment from "moment";

// type AppbarModes = 'small' | 'medium' | 'large' | 'center-aligned';

const MORE_ICON = Platform.OS === "ios" ? "dots-horizontal" : "dots-vertical";

const AppointmentFiltersPatient = ({
  handleResetSort,
  setShowDateRangeSelector,
  showDateRangeSelector,
  sortBy,
  modalVisible,
  setModalVisible,
  setSortBy,
  setRange,
  isNotApproved,
  setIsNotApproved,
  selectedRange,
  handleApplyFilter,
  isApproved,
  setIsApproved,
}) => {
  const [showExactTheme, setShowExactTheme] = React.useState(false);
  const [appbarMode, setAppbarMode] = React.useState<any>(sortBy);

  const navigation = useNavigation();

  const isCenterAlignedMode = appbarMode === "center-aligned";

  // React.useLayoutEffect(() => {
  //   navigation.setOptions({
  //     header: () => (
  //       <Appbar.Header
  //         style={showCustomColor ? styles.customColor : null}
  //         theme={{
  //           mode: showExactTheme ? 'exact' : 'adaptive',
  //         }}
  //         mode={appbarMode}
  //         elevated={showElevated}
  //       >
  //         {showLeftIcon && (
  //           <Appbar.BackAction onPress={() => navigation.goBack()} />
  //         )}
  //         <Appbar.Content
  //           title="Title"
  //           subtitle={showSubtitle ? 'Subtitle' : null}
  //         />
  //         {isCenterAlignedMode
  //           ? false
  //           : showCalendarIcon && (
  //               <Appbar.Action icon="calendar" onPress={() => {}} />
  //             )}
  //         {showSearchIcon && (
  //           <Appbar.Action icon="magnify" onPress={() => {}} />
  //         )}
  //         {showMoreIcon && (
  //           <Appbar.Action icon={MORE_ICON} onPress={() => {}} />
  //         )}
  //       </Appbar.Header>
  //     ),
  //   });
  // }, [
  //   navigation,
  //   showLeftIcon,
  //   showSubtitle,
  //   showSearchIcon,
  //   showMoreIcon,
  //   showCustomColor,
  //   showExactTheme,
  //   appbarMode,
  //   showCalendarIcon,
  //   isCenterAlignedMode,
  //   showElevated,
  // ]);

  const renderDefaultOptions = () => (
    <>
      {/* <View style={styles.row}>
        <Text>{i18n.translate("filterBy")}</Text>
        <Switch value={showLeftIcon} onValueChange={setShowLeftIcon} />
      </View> */}

      <View style={styles.row}>
        <Text>{i18n.translate("appointmentApproved")}</Text>
        <Switch value={isApproved} onValueChange={setIsApproved} />
      </View>

      <View style={styles.row}>
        <Text>{i18n.translate("appointmentNotApproved")}</Text>
        <Switch value={isNotApproved} onValueChange={setIsNotApproved} />
      </View>

      {/* <View style={styles.row}>
        <Text>{i18n.translate("dateRange")}</Text>
        <Switch
          value={showDateRangeSelector}
          onValueChange={setShowDateRangeSelector}
        />
      </View> */}

      {/* {showDateRangeSelector && (
        <View style={styles.containerDate}>
          <DateRangePicker
          onSelectDateRange={(range) => {
            setRange(range);
          }}
          confirmBtnTitle=""
          clearBtnTitle={i18n.translate("clear")}
          blockSingleDateSelection={false}
          responseFormat="DD-MM-YYYY"
          // maxDate={moment()}
          minDate={moment().subtract(300, "days")}
          selectedDateContainerStyle={styles.selectedDateContainerStyle}
          selectedDateStyle={styles.selectedDateStyle}
        />
          <View style={styles.containerDateInterval}>
            {selectedRange.firstDate && selectedRange.secondDate && (
              <Chip
                // selected
                showSelectedOverlay
                onPress={() => {}}
                // style={styles.chip}
              >
                {selectedRange.firstDate && (
                  <Text>
                    {selectedRange.firstDate} - {selectedRange.secondDate}
                  </Text>
                )}
              </Chip>
            )}
          </View>
        </View>
      )} */}
      {/*       
      <View style={styles.row}>
        <Text>Search icon</Text>
        <Switch value={showSearchIcon} onValueChange={setShowSearchIcon} />
      </View>
      <View style={styles.row}>
        <Text>More icon</Text>
        <Switch value={showMoreIcon} onValueChange={setShowMoreIcon} />
      </View>
      
        <View style={styles.row}>
          <Text>Calendar icon</Text>
          <Switch
            value={isCenterAlignedMode ? false : showCalendarIcon}
            disabled={isCenterAlignedMode}
            onValueChange={setShowCalendarIcon}
          />
        </View>
      
      <View style={styles.row}>
        <Text>Custom Color</Text>
        <Switch value={showCustomColor} onValueChange={setShowCustomColor} />
      </View>
      <View style={styles.row}>
        <Text>Exact Dark Theme</Text>
        <Switch value={showExactTheme} onValueChange={setShowExactTheme} />
      </View>
      
        <View style={styles.row}>
          <Text>Elevated</Text>
          <Switch value={showElevated} onValueChange={setShowElevated} />
        </View>
       */}
    </>
  );

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <Appbar
          style={{
            backgroundColor: colors.facebook,
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          theme={{ mode: showExactTheme ? "exact" : "adaptive" }}
        >
          <Appbar.BackAction
            onPress={() => {
              setModalVisible(!modalVisible);
            }}
          />
          <View
            style={{
              width: "40%",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Appbar.Content
              title="Clear Filters"
              onPress={() => {
                setIsApproved(false);
                setIsNotApproved(false);
                setShowDateRangeSelector(false);
                setRange({});
                setSortBy("");
                setAppbarMode("");
                console.log("Asdas");
                setModalVisible(!modalVisible);
                handleResetSort();
              }}
            />
          </View>
          {/* <Appbar.Action icon="email" onPress={() => {}} />
        <Appbar.Action icon="label" onPress={() => {}} />
        <Appbar.Action icon="delete" onPress={() => {}} /> */}
        </Appbar>

        <ScreenWrapper
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <List.Section title={i18n.translate("filterBy")}>
            {renderDefaultOptions()}
          </List.Section>

          <List.Section title={i18n.translate("sortBy")}>
            <RadioButton.Group
              value={appbarMode}
              onValueChange={
                (value: string) => {
                  setAppbarMode(value as any);
                  setSortBy(value);
                }
                // console.log(value)
              }
            >
              <View style={styles.row}>
                <Text>{i18n.translate("date")}</Text>
                <RadioButton value={i18n.translate("date")} />
              </View>
              <View style={styles.row}>
                <Text>{i18n.translate("doctorName")}</Text>
                <RadioButton value={i18n.translate("doctorName")} />
              </View>
              {/* <View style={styles.row}>
                <Text>Center-aligned</Text>
                <RadioButton value="center-aligned" />
              </View> */}
            </RadioButton.Group>
          </List.Section>

          {/* <FAB icon="reply" onPress={() => {}} style={styles.fab} /> */}
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <FAB
              icon="check"
              label={i18n.translate("applyFilter")}
              style={styles.fab}
              onPress={() => {
                setModalVisible(!modalVisible);
                handleApplyFilter();
              }}
            />
          </View>
        </ScreenWrapper>
      </Modal>
    </>
  );
};

AppointmentFiltersPatient.title = "Appointments Filters";

export default AppointmentFiltersPatient;

const styles = StyleSheet.create({
  container: {
    // height:"100%",
    // marginBottom: 56,
  },

  containerDate: {
    margin: 10,
  },
  selectedDateContainerStyle: {
    height: 35,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "blue",
  },
  selectedDateStyle: {
    fontWeight: "bold",
    color: "white",
  },
  contentContainer: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  fab: {
    // position: 'absolute',
    // right: 16,
    // bottom: 28,
    // marginTop:10,
    width: "auto",
    elevation: 0,
    // paddingHorizontal:10
  },
  customColor: {
    backgroundColor: colors.yellow,
  },
});
