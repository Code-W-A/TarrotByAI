import { StyleSheet } from "react-native";
import { colors } from "../../utils/colors";
export default StyleSheet.create({
  list: {
    maxHeight: 40,
  },
  contentContainer: {
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",

  },
  container: {
    borderWidth: 1,
    borderColor: colors.gradientLogin3,
    borderRadius: 12,
    height: 30,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 24,
    backgroundColor: colors.gradientLogin2,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
  selected: {
    backgroundColor: "#FF8800",
    borderColor: "#FF6600",
  },
});
