import { Dimensions, StyleSheet } from "react-native";
import { colors } from "../../utils/colors";

export const styles = StyleSheet.create({
  cardRow: {
    flexDirection: "row", // Așează elementele orizontal
    justifyContent: "center", // Aliniază elementele în centru pe orizontală
    alignItems: "center", // Aliniază elementele în centru pe verticală
    flexWrap: "wrap", // Permite elementelor să treacă pe rândul următor dacă nu există suficient spațiu
    margin: 10, // Adaugă un spațiu în jurul rândului de carduri

    // alte proprietăți de stilizare pot fi adăugate aici
  },
  clinicIdButtonStyle: {
    height: 25,
    width: 100,
    backgroundColor: "#1B5A90",
    marginBottom: 10,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // marginHorizontal: 10,
  },
  container: { marginTop: -90, paddingHorizontal: 10 },
  drDetailsContainer: {
    height: "auto",
    backgroundColor: "white",
    borderRadius: 20,
  },
  rowStyle: {
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  profileImageStyle: {
    height: 90,
    width: 90,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: "#f7f7f7",
    overflow: "hidden",
  },
  iconSurface: {
    borderRadius: 33,
    height: 25,
    width: 25,
    // backgroundColor: colors.white,
    // right: 5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  printButtonTextStyle: {
    paddingLeft: 5,
    // paddingTop: 5,
    color: "#8B8A8A",
    fontSize: 11,
  },
  specialitiesSurface: {
    borderRadius: 25,
    height: 24,
    width: 24,
    backgroundColor: colors.white,
    marginRight: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextStyle: {
    paddingLeft: 5,
    // paddingTop: 5,
    color: "white",
    fontSize: 11,
  },
  specialitieImageStye: { height: 17, width: 17, alignSelf: "center" },
  locationStyle: { flexDirection: "row", alignItems: "center", width: "41%" },
  appointmentDetails: {
    paddingHorizontal: 10,
    paddingTop: 15,
    flexDirection: "row",
  },
  surfaceContainer: {
    height: 250,
    width: Dimensions.get("window").width / 2.3,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  cardStyle: {
    height: 170,
    width: Dimensions.get("window").width / 2.3,
    backgroundColor: colors.background,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    marginBottom: 20,
  },
  dateStyle: {
    height: 25,
    width: 110,
    borderRadius: 20,
    backgroundColor: "#1B5A90",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonStyle: {
    height: 74,
    width: Dimensions.get("window").width / 2.25,
    // backgroundColor: colors.facebook,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    position: "absolute",
  },
  nextAppointment: {
    height: 74,
    width: "90%",
    // backgroundColor: colors.facebook,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    position: "absolute",
  },
  alternativeButtonStyle: {
    height: 74,
    width: Dimensions.get("window").width / 2.25,
    backgroundColor: "#0DD8F9",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  containerLoader: {
    flex: 1,
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
    width: "100%",
  },
  cardButtonRow: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  viewButtonStyle: {
    height: "auto",
    width: "auto",

    justifyContent: "center",
    marginHorizontal: 5,
  },
  buttonRow: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
});
