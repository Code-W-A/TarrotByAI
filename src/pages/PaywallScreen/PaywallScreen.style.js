import { StyleSheet } from "react-native";
import { colors } from "../../utils/colors";

export default StyleSheet.create({
  container: {
    backgroundColor: "#c0c0c0",
    flex: 1,
    padding: 20,
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginVertical: 5,
  },
  activityContainer: {
    // backgroundColor: "red",
    flex: 1,
    justifyContent: "center",
  },
  activityHorizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  subTitle: {
    color: "white",
    textAlign: "center",
    marginVertical: 15,
    fontSize: 16,
    lineHeight: 24,
  },
  blackBox: {
    backgroundColor: "rgba(128, 128, 128, 0.3)",
    width: "90%",
    alignItems: "center",
    padding: 10,
    marginVertical: 20,
    borderRadius: 25,
  },
  offerTitle: {
    color: "white",
    fontSize: 20,
    marginVertical: 10,
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  buttonPrimary: {
    backgroundColor: "rgba(255, 220, 108, 1)",
    width: "90%",
    alignItems: "center",
    borderRadius: 5,
    padding: 5,
    margin: 10,
  },
  buttonSecondary: {
    borderColor: "white",
    borderWidth: 3,
    width: "90%",
    alignItems: "center",
    borderRadius: 5,
    padding: 15,
    margin: 10,
  },
  buttonSecondaryText: {
    color: "white",
  },
  Footer: {
    color: "white",
    marginTop: "auto",
  },

  close: {
    position: "relative",
    left: 5,
    top: 5,
    // backgroundColor: "red",
    alignSelf: "flex-start",
  },
});
