import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  TextInput,
} from "react-native";

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

export const RowView = ({ height, children, style }) => {
  return (
    <View
      style={[{ flexDirection: "row" }, height && { height: height }, style]}
    >
      {children}
    </View>
  );
};
export const KeyboardAwareScrollViewStyled = (props) => (
  <KeyboardAwareScrollView
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    enableAutomaticScroll={true}
    extraHeight={Platform.OS === "ios" ? 90 : 75}
    style={{ ...props.style }}
  >
    {props.children}
  </KeyboardAwareScrollView>
);

// SafeAreaView pentru MainContainer și TopNotch cu stiluri inline
export const MainContainer = ({ secondary, children, style }) => (
  <SafeAreaView
    style={[
      {
        backgroundColor: secondary ? "desired-color" : "default-color",
        flex: 1,
      },
      style,
    ]}
  >
    {children}
  </SafeAreaView>
);

export const TopNotch = ({ secondary, children, style }) => (
  <SafeAreaView
    style={[{ flex: 0, backgroundColor: secondary ? "white" : "white" }, style]}
  >
    {children}
  </SafeAreaView>
);

// View pentru SubContainer cu stiluri inline
export const SubContainer = ({ secondary, space_between, children, style }) => (
  <View
    style={[
      { backgroundColor: secondary ? "white" : "white" },
      space_between ? { justifyContent: "space-between" } : {},
      style,
    ]}
  >
    {children}
  </View>
);
export const ButtonText = ({ children, style }) => (
  <Text
    style={[
      {
        // Stiluri predefinite pentru butoane, adaugă stilurile specifice aici
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
      },
      style,
    ]}
  >
    {children}
  </Text>
);

// Componenta TextNow cu stiluri inline
export const TextNow = ({ children, style }) => (
  <Text
    style={[
      {
        // Stiluri predefinite pentru TextNow, adaugă stilurile specifice aici
        fontSize: 14,
        fontStyle: "italic",
        color: "grey",
      },
      style,
    ]}
  >
    {children}
  </Text>
);
// Componenta TextAppointments cu stiluri inline
export const TextAppointments = ({ children, style }) => (
  <Text
    style={[
      {
        // Adaugă aici stilurile specifice pentru TextAppointments
        fontSize: 18,
        fontWeight: "600",
        color: "navy",
      },
      style,
    ]}
  >
    {children}
  </Text>
);

// Componenta ButtonTextRefund cu stiluri inline
export const ButtonTextRefund = ({ children, style }) => (
  <Text
    style={[
      {
        // Stiluri predefinite pentru butoane de rambursare
        fontSize: 16,
        fontWeight: "bold",
        color: "red",
        textDecorationLine: "underline",
      },
      style,
    ]}
  >
    {children}
  </Text>
);
// Componenta TextButtonText cu stiluri inline
export const TextButtonText = ({ children, style }) => (
  <Text
    style={[
      {
        // Adaugă aici stilurile specifice pentru TextButtonFontStyle
        fontSize: 14,
        fontWeight: "500",
        color: "blue",
      },
      style,
    ]}
  >
    {children}
  </Text>
);

// Componenta OutlineButtonText cu stiluri inline
export const OutlineButtonText = ({ children, style }) => (
  <Text
    style={[
      {
        // Stiluri predefinite pentru outlineButtonTextStyle
        fontSize: 14,
        fontWeight: "bold",
        color: "black",
        borderWidth: 1,
        borderColor: "black",
        padding: 5,
        borderRadius: 5,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

export const CommonSmallButton = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Aici adaugă stilurile specifice pentru butoanele mici
        padding: 8,
        backgroundColor: "lightgrey",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        width: 100,
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonButton cu stiluri inline
export const CommonButton = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri predefinite pentru butoane comune
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "blue",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "80%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

export const CommonButtonBlue = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Adaugă aici stilurile specifice pentru butoanele comune de culoare albastră
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "blue",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "100%", // Presupunând că vrei să umple ecranul
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonButtonAppointment cu stiluri inline
export const CommonButtonAppointment = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Adaugă aici stilurile specifice pentru butoanele de programări
        paddingVertical: 10,
        paddingHorizontal: 18,
        backgroundColor: "green",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "90%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonButtonNow cu stiluri inline
export const CommonButtonNow = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru butonul "Acum"
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "orange",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "70%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonButtonBook cu stiluri inline
export const CommonButtonBook = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru butonul de rezervare
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "purple",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        width: "85%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

export const CommonButtonInvoice = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri predefinite pentru butonul de factură, de exemplu cu nuanță de albastru
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "darkblue",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "80%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonButtonNext cu stiluri inline
export const CommonButtonNext = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru butonul "Următorul", de exemplu cu nuanță de verde
        paddingVertical: 12,
        paddingHorizontal: 22,
        backgroundColor: "green",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "50%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonButtonCancel cu stiluri inline
export const CommonButtonCancel = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru butonul de anulare, de exemplu cu nuanță de roșu
        paddingVertical: 10,
        paddingHorizontal: 18,
        backgroundColor: "red",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "75%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonButtonReturn cu stiluri inline
export const CommonButtonReturn = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru butonul de returnare, de exemplu cu nuanță de maro
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "brown",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "60%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

export const CommonButtonRefund = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru butonul de rambursare, exemplu cu culoare de alertă
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "red", // Culoare indicativă pentru acțiuni critice
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "90%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonSmallButtonCancel cu stiluri inline
export const CommonSmallButtonCancel = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru un buton mic de anulare, exemplu cu design subtil
        padding: 8,
        backgroundColor: "lightgrey", // Culoare neutră pentru acțiuni negative, dar mai puțin critice
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        width: 80,
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonButtonLogout cu stiluri inline
export const CommonButtonLogout = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru butonul de deconectare, exemplu cu tonuri mai întunecate
        paddingVertical: 10,
        paddingHorizontal: 18,
        backgroundColor: "black", // Culoare indicativă pentru finalizare sau ieșire
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "75%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonSmallButtonSuccess cu stiluri inline
export const CommonSmallButtonSuccess = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru un buton mic de succes, exemplu cu nuanțe de verde
        padding: 8,
        backgroundColor: "green", // Culoare pozitivă pentru confirmare sau succes
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        width: 80,
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);
export const CommonSmallButtonCancelRed = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru un buton mic de anulare cu culoare roșie
        padding: 8,
        backgroundColor: "red", // Culoare roșie pentru semnalarea unei acțiuni importante de anulare
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        width: 80,
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonRoundButton cu stiluri inline
export const CommonRoundButton = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru un buton rotund, potrivit pentru acțiuni grafice distincte
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "blue", // Culoare albastră pentru atractivitate vizuală
        borderRadius: 30, // Radius mare pentru aspect rotund
        alignItems: "center",
        justifyContent: "center",
        width: 100,
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonOutlineButton cu stiluri inline
export const CommonOutlineButton = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri pentru un buton cu contur
        paddingVertical: 10,
        paddingHorizontal: 18,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "black", // Contur negru
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "70%",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta CommonTextButton cu stiluri inline simplificate
export const CommonTextButton = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Stiluri minimale pentru un buton text
        paddingVertical: 10,
        paddingHorizontal: 18,
        alignItems: "center",
        justifyContent: "center",
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

export const CardSurface = ({
  width,
  height,
  ph,
  pv,
  mh,
  mv,
  children,
  style,
}) => (
  <View
    style={[
      {
        borderRadius: 6,
        marginVertical: mv !== undefined ? mv : 2,
        marginHorizontal: mh !== undefined ? mh : 1,
        paddingHorizontal: ph !== undefined ? ph : 10,
        paddingVertical: pv !== undefined ? pv : 10,
        height: height,
        width: width,
        elevation: 4,
        backgroundColor: "white", // Assuming the surface needs a background color; adjust as necessary.
      },
      style,
    ]}
  >
    {children}
  </View>
);

// Componenta ThirdPartyView cu stiluri inline
export const ThirdPartyView = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        // Presupunem că thirdPartyView include stiluri specificate, le adaugi aici
        backgroundColor: "grey", // exemplu de culoare
        padding: 10, // exemplu de padding
        borderRadius: 5, // exemplu de border radius
      },
      style,
    ]}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// Componenta ModalView cu stiluri inline
export const ModalView = ({ children, style }) => (
  <View
    style={[
      {
        // Presupunem că modalView include stiluri specifice pentru modale
        backgroundColor: "white", // exemplu de culoare de fundal
        padding: 20, // exemplu de padding
        borderRadius: 10, // exemplu de border radius
        elevation: 5, // shadow pentru Android
        shadowColor: "#000", // shadow color pentru iOS
        shadowOffset: { width: 0, height: 2 }, // shadow offset pentru iOS
        shadowOpacity: 0.25, // shadow opacity pentru iOS
        shadowRadius: 3.84, // shadow radius pentru iOS
      },
      style,
    ]}
  >
    {children}
  </View>
);

// Componenta CommonLineView cu stiluri inline
export const CommonLineView = ({ style }) => (
  <View
    style={[
      {
        // Presupunem că commonLine include stiluri pentru linii
        height: 1, // înălțimea liniei
        backgroundColor: "black", // culoare linie
        marginVertical: 5, // margini verticale
      },
      style,
    ]}
  />
);

// Componenta CommonLineDotted cu stiluri inline
export const CommonLineDotted = ({ style }) => (
  <View
    style={[
      {
        // Presupunem că commonLineDotted include stiluri pentru linii punctate
        height: 1,
        borderWidth: 1,
        borderColor: "grey",
        borderStyle: "dotted",
      },
      style,
    ]}
  />
);

// Componenta CommonLineInvoice cu stiluri inline
export const CommonLineInvoice = ({ style }) => (
  <View
    style={[
      {
        // Specific styles assumed for invoice-related lines
        height: 2,
        backgroundColor: "darkgrey",
        marginVertical: 10,
      },
      style,
    ]}
  />
);

// Componenta TextInputStyle ca View înconjurător pentru un TextInput
export const TextInputStyle = ({ children, style }) => (
  <View
    style={[
      {
        // Specific styles assumed for text input containers
        padding: 10,
        borderRadius: 5,
        backgroundColor: "lightgrey",
        elevation: 2,
      },
      style,
    ]}
  >
    {children}
  </View>
);

// Componenta InputStyle similară cu TextInputStyle, dar direct pentru TextInput
export const InputStyle = ({ style, ...props }) => (
  <TextInput
    style={[
      {
        // Specific styles assumed for direct text input styling
        height: 40,
        borderColor: "grey",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
      },
      style,
    ]}
    {...props}
  />
);

// Componenta RoundView cu stiluri inline
export const RoundView = ({ children, style }) => (
  <View
    style={[
      {
        // Specific styles assumed for rounded view containers
        borderRadius: 50, // Large radius for a round shape
        width: 100, // Specific width
        height: 100, // Specific height
        backgroundColor: "blue",
        alignItems: "center",
        justifyContent: "center",
      },
      style,
    ]}
  >
    {children}
  </View>
);

// Componenta DashedLine cu stiluri inline
export const DashedLine = ({ style }) => (
  <View
    style={[
      {
        // Specific styles for a dashed line, typically used as a separator
        height: 1,
        borderWidth: 1,
        borderColor: "grey",
        borderStyle: "dashed",
      },
      style,
    ]}
  />
);

// Componenta CommonInput ca un View înconjurător pentru un TextInput
export const CommonInput = ({ children, style }) => (
  <View
    style={[
      {
        // Specific styles for an input field container
        padding: 10,
        borderRadius: 4,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "grey",
        elevation: 2, // subtle shadow for elevation effect
      },
      style,
    ]}
  >
    {children} // Presupun că include un TextInput în interior
  </View>
);

// Componenta CommonSearch, presupunând că include un TextInput pentru căutare
export const CommonSearch = ({ style, ...props }) => (
  <TextInput
    style={[
      {
        // Specific styles for a search input
        height: 40,
        borderColor: "lightgrey",
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        paddingRight: 10, // assuming there might be a search icon inside
        backgroundColor: "white",
      },
      style,
    ]}
    placeholder="Search..."
    {...props}
  />
);
