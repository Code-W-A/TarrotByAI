import { StyleSheet } from "react-native";
import { colors } from "../../utils/colors";
export default StyleSheet.create({
  list: {
    maxHeight: 44,
  },
  contentContainer: {
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    borderWidth: 2,
    borderColor: '#C9A14A', // gold
    borderRadius: 22,
    height: 38,
    paddingHorizontal: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    backgroundColor: 'rgba(255,255,255,0.92)', // soft cream/white
    shadowColor: '#C9A14A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
    minWidth: 60,
    flexDirection: 'row',
    marginVertical: 2,
  },
  text: {
    fontFamily: 'Lora',
    fontSize: 16,
    color: '#C9A14A', // gold text
    letterSpacing: 0.2,
    fontWeight: '700',
    textAlign: 'center',
    alignSelf: 'center',
    lineHeight: 24,
    paddingVertical: 0,
    marginVertical: 0,
  },
  selected: {
    backgroundColor: '#C9A14A', // gold solid
    borderColor: '#C9A14A',
    borderWidth: 2.5,
    shadowOpacity: 0.18,
    color: '#fff',
    elevation: 4,
  },
  selectedText: {
    color: '#fff', // white text for selected
    fontFamily: 'Lora',
    fontWeight: '700',
    alignSelf: 'center',
    lineHeight: 24,
    paddingVertical: 0,
    marginVertical: 0,
  },
});
