import { Platform, StyleSheet } from "react-native";

const boxShadow: any = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  android: { elevation: 6 },
});

export default StyleSheet.create({
  container: {
    height: 240,
    marginBottom: 18,
    backgroundColor: "#eee",
    borderRadius: 24,
    marginHorizontal: 16,
    ...boxShadow,
    borderBottomColor: '#bfa76a',
    borderBottomWidth: 2,
  },
  imageContainer: { flex: 1 },
  image: {
    flex: 1,
    borderRadius: 24,
    height: 300,
  },
  titleContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    height: 160,
    paddingLeft: 16,
    paddingRight: 10,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  text: {
    fontFamily: 'LoraBold',
    fontSize: 20,
    color: '#bfa76a',
    letterSpacing: 0.5,
    lineHeight: 26,
    paddingBottom: 24,
  },
  content: {
    fontSize: 14,
    fontWeight: "300",
    lineHeight: 24,
    color: "#fff",
    paddingBottom: 24,
  },
  timestamp: {
    position: "absolute",
    color: "#eee",
    fontSize: 12,
    fontWeight: "300",
    right: 16,
    bottom: 8,
  },
});
