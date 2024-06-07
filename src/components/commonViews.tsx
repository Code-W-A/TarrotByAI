import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from "react-native";
import styled from "styled-components";
import { colors } from "../utils/colors";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Surface } from "react-native-paper";

const backgroundColor = "backgroundColor";
const justifyContent = "justifyContent";
const paddingVertical = "paddingVertical";
const paddingHorizontal = "paddingHorizontal";
const marginHorizontal = "marginHorizontal";
const marginVertical = "marginVertical";
const borderRadius = "borderRadius";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mainContainer: {
    flex: 1,
    // paddingVertical:10,
    backgroundColor: colors.background,
    // backgroundColor: colors.white,
  },
  subContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  textInputStyle: {
    width: "100%",
    height: 55,
    borderRadius: 35,
    borderColor: colors.borderTextColor,
    borderWidth: 0.5,
    backgroundColor: "white",
    elevation: 1,
    justifyContent: "center",
  },
  inputStyle: {
    width: "100%",
    heiht: 40,
    borderColor: colors.borderTextColor,
    borderWidth: 1,
  },
  commonButtonTextStyle: {
    fontSize: 14,
    textAlign: "center",
    textTransform: "uppercase",
    color: colors.white,
  },
  textNow: {
    fontSize: 16,
    textAlign: "center",
    color: colors.white,
  },
  textAppointments: {
    fontSize: 14,
    textAlign: "center",
    color: colors.white,
  },
  commonButtonRefundTextStyle: {
    fontSize: 14,
    textAlign: "center",
    textTransform: "uppercase",
    color: colors.green,
  },
  outlineButtonStyle: {
    flexDirection: "row",
    borderRadius: 6,
    borderWidth: 2,
    //borderColor: colors.themeColor,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    width: "100%",
  },
  outlineButtonTextStyle: {
    fontSize: 14,

    textTransform: "uppercase",
  },
  commonButtonStyle: {
    backgroundColor: colors.blue,
    width: "100%",
    // paddingVertical: 10,
    marginVertical: 10,
    borderRadius: 50,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
  },
  commonButtonFull: {
    backgroundColor: colors.blue,
    width: "100%",
    paddingVertical: 15,
    marginVertical: 15,
    borderRadius: 5,
    alignSelf: "center",
  },
  commonButtonStyleBlue: {
    backgroundColor: colors.ligtBlue,
    width: 340,
    paddingVertical: 15,
    marginVertical: 15,
    borderRadius: 50,
    alignSelf: "center",
  },
  commonButtonStyleNext: {
    backgroundColor: colors.facebook,
    width: 340,
    paddingVertical: 15,
    marginVertical: 15,
    borderRadius: 50,
    alignSelf: "center",
  },
  commonButtonAppointment: {
    backgroundColor: "#20c0f3",
    width: 180,
    paddingVertical: 17,
    marginVertical: 17,
    marginHorizontal: 10,
    borderRadius: 5,
    paddingHorizontal: 20,
  },
  commonButtonNow: {
    backgroundColor: "#0CE0FF",
    width: 340,
    paddingVertical: 8,
    marginVertical: 10,
    borderRadius: 5,
    alignSelf: "center",
  },
  commonButtonBook: {
    backgroundColor: "#20c0f3",
    width: 340,
    paddingVertical: 7,
    marginVertical: 7,
    borderRadius: 5,
    alignSelf: "center",
  },
  commonButtonCancelStyle: {
    backgroundColor: colors.red,
    width: "100%",
    paddingVertical: 9,
    marginVertical: 15,
    borderRadius: 5,
    alignSelf: "center",
  },
  commonButtonReturnStyle: {
    backgroundColor: colors.gray,
    width: "100%",
    paddingVertical: 9,
    marginVertical: 15,
    borderRadius: 5,
    alignSelf: "center",
  },
  commonButtonRefundStyle: {
    backgroundColor: colors.lightGray,
    width: "100%",
    paddingVertical: 9,
    marginVertical: 15,
    borderRadius: 5,
    alignSelf: "center",
  },
  smallButtonCancel: {
    backgroundColor: colors.google,
    paddingVertical: 12,
    //marginVertical: 15,
    borderRadius: 20,
    alignSelf: "center",
    paddingHorizontal: 50,
  },
  commonButtonLogout: {
    backgroundColor: colors.pink,
    paddingVertical: 12,
    borderRadius: 30,
    alignSelf: "center",
    paddingHorizontal: 50,
  },
  smallButtonCancelRed: {
    backgroundColor: colors.red,
    paddingVertical: 9,
    //marginVertical: 15,
    borderRadius: 5,
    alignSelf: "center",
    paddingHorizontal: 30,
  },
  smallButtonSuccess: {
    backgroundColor: colors.facebook,
    paddingVertical: 12,
    //marginVertical: 15,
    borderRadius: 20,
    alignSelf: "center",
    paddingHorizontal: 50,
  },
  TextButtonFontStyle: {
    fontSize: 13,
    textAlign: "center",
    color: colors.white,
    //marginBottom: 20,
  },
  commonRoundButtonStyle: {
    backgroundColor: colors.green,
    width: "30%",
    paddingVertical: 10,
    marginVertical: 25,
    borderRadius: 50,
  },
  smallButtonStyle: {
    backgroundColor: colors.green,
    paddingVertical: 9,
    marginVertical: 15,
    borderRadius: 5,
    alignSelf: "center",
    paddingHorizontal: 55,
  },
  // Changes Added Saranya

  thirdPartyView: {
    height: 30,
    width: 30,
    backgroundColor: "#F1F5FB",
    borderRadius: 5,
    alignItems: "center",
    paddingTop: 5,
  },

  modalView: {
    width: "100%",
    backgroundColor: colors.white,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    padding: 20,
  },

  commonLine: {
    borderBottomWidth: 1,
    padding: 5,
    borderBottomColor: "#DBDBDB",
  },
  commonLineInvoice: {
    borderBottomWidth: 1,
    padding: 5,
    borderBottomColor: "#ced4da",
  },
  commonLineDotted: {
    borderBottomWidth: 1,
    paddingBottom: 5,
    borderBottomColor: "#DBDBDB",
    borderStyle: "dashed",
  },
  roundView: {
    borderRadius: 25,
    height: 50,
    width: 50,
    backgroundColor: colors.white,
    paddingTop: 10,
  },
  dashedLine: {
    minHeight: 110,
    borderLeftWidth: 2,
    borderStyle: "dashed",
    borderColor: "black",
  },
  commonInput: {
    height: 40,
    borderColor: "#CFCFCF",
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 10,
  },
  commonSearch: {
    height: 40,
    borderColor: "#CFCFCF",
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 10,
  },
});
const {
  row,
  mainContainer,
  subContainer,
  textInputStyle,
  inputStyle,
  smallButtonStyle,
  commonButtonStyle,
  commonButtonFull,
  commonButtonNow,
  commonButtonStyleBlue,
  commonButtonStyleNext,
  commonButtonCancelStyle,
  commonButtonReturnStyle,
  commonButtonRefundStyle,
  smallButtonCancelRed,
  smallButtonSuccess,
  smallButtonCancel,
  commonButtonTextStyle,
  commonButtonRefundTextStyle,
  outlineButtonTextStyle,
  outlineButtonStyle,
  TextButtonFontStyle,
  commonRoundButtonStyle,
  thirdPartyView,
  modalView,
  commonLine,
  roundView,
  textNow,
  textAppointments,
  commonButtonBook,
  commonLineDotted,
  commonLineInvoice,
  commonButtonLogout,
  dashedLine,
  commonButtonAppointment,
  commonInput,
  commonSearch,
} = styles;

export const RowView = styled(View)`
  ${row};
  ${(props) => (props.height ? "height:" + props.height + "px;" : "")}
`;
export const KeyboardAScrollView = styled(KeyboardAwareScrollView).attrs({
  showsVerticalScrollIndicator: false,
  keyboardShouldPersistTaps: "handled",
  enableAutomaticScroll: true,
  extraHeight: Platform.OS == "ios" ? 90 : 75,
})``;
export const MainContainer = styled(SafeAreaView)<{ secondary?: boolean }>`
  ${mainContainer};
`;

export const TopNotch = styled(SafeAreaView)<{ secondary?: boolean }>`
  flex: 0;
  ${backgroundColor}: ${(props) =>
    props.secondary ? colors.white : colors.white};
`;

export const SubContainer = styled(View)<{
  secondary?: boolean;
  space_between?: boolean;
}>`
  ${subContainer};
  ${backgroundColor}: ${(props) =>
    props.secondary ? colors.white : colors.white};
  ${(props) => (props.space_between ? "justifyContent:space-between" : "")}
`;

export const ButtonText = styled(Text)`
  ${commonButtonTextStyle};
`;
export const TextNow = styled(Text)`
  ${textNow};
`;
export const TextAppointments = styled(Text)`
  ${textAppointments};
`;
export const ButtonTextRefund = styled(Text)`
  ${commonButtonRefundTextStyle};
`;
export const TextButtonText = styled(Text)`
  ${TextButtonFontStyle};
`;
export const OutlineButtonText = styled(Text)`
  ${outlineButtonTextStyle};
`;

export const CommonSmallButton = styled(TouchableOpacity)`
  ${smallButtonStyle};
`;
export const CommonButton = styled(TouchableOpacity)`
  ${commonButtonStyle};
`;
export const CommonButtonBlue = styled(TouchableOpacity)`
  ${commonButtonFull};
`;
export const CommonButtonAppointment = styled(TouchableOpacity)`
  ${commonButtonAppointment};
`;
export const CommonButtonNow = styled(TouchableOpacity)`
  ${commonButtonNow};
`;
export const CommonButtonBook = styled(TouchableOpacity)`
  ${commonButtonBook};
`;
export const CommonButtonInvoice = styled(TouchableOpacity)`
  ${commonButtonStyleBlue};
`;
export const CommonButtonNext = styled(TouchableOpacity)`
  ${commonButtonStyleNext};
`;

export const CommonButtonCancel = styled(TouchableOpacity)`
  ${commonButtonCancelStyle};
`;
export const CommonButtonReturn = styled(TouchableOpacity)`
  ${commonButtonReturnStyle};
`;
export const CommonButtonRefund = styled(TouchableOpacity)`
  ${commonButtonRefundStyle};
`;
export const CommonSmallButtonCancel = styled(TouchableOpacity)`
  ${smallButtonCancel};
`;
export const CommonButtonLogout = styled(TouchableOpacity)`
  ${commonButtonLogout};
`;
export const CommonSmallButtonSuccess = styled(TouchableOpacity)`
  ${smallButtonSuccess};
`;
export const CommonSmallButtonCancelRed = styled(TouchableOpacity)`
  ${smallButtonCancelRed};
`;
export const CommonRoundButton = styled(TouchableOpacity)`
  ${commonRoundButtonStyle};
`;
export const CommonOutlineButton = styled(TouchableOpacity)`
  ${outlineButtonStyle};
`;
export const CommonTextButton = styled(TouchableOpacity)``;

export const CardSurface = styled(Surface)<{
  width?: number;
  height?: number;
  ph?: number;
  pv?: number;
  mh?: number;
  mv?: number;
}>`
  ${borderRadius}: 6px;
  ${marginVertical}: ${(props) =>
    props.mv != undefined ? props.mv + "px" : "2px"};
  ${marginHorizontal}: ${(props) =>
    props.mh != undefined ? props.mh + "px" : "1px"};
  ${paddingHorizontal}: ${(props) =>
    props.ph != undefined ? props.ph + "px" : "10px"};
  ${paddingVertical}: ${(props) =>
    props.pv != undefined ? props.pv + "px" : "10px"};
  ${(props) => (props.height ? "height:" + props.height + "px;" : "")}
  ${(props) => (props.width ? "width:" + props.width + "px;" : "")}
    elevation: 4;
`;

export const ThirdPartyView = styled(TouchableOpacity)`
  ${thirdPartyView};
`;

export const ModalView = styled(View)`
  ${modalView};
`;

export const CommonLineView = styled(View)`
  ${commonLine};
`;

export const CommonLineDotted = styled(View)`
  ${commonLineDotted};
`;

export const CommonLineInvoice = styled(View)`
  ${commonLineInvoice};
`;

export const TextInputStyle = styled(View)`
  ${textInputStyle};
`;

export const InputStyle = styled(View)`
  ${inputStyle};
`;
export const RoundView = styled(View)`
  ${roundView};
`;
export const DashedLine = styled(View)`
  ${dashedLine};
`;
export const CommonInput = styled(View)`
  ${commonInput};
`;
export const CommonSearch = styled(View)`
  ${commonSearch};
`;
