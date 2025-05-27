import { Platform } from "react-native";

export const colors = {
  // gradientLogin1: "#27253B",
  // gradientLogin2: "#16151A",
  // gradientLogin3: "#6D6D6F",
  gradientLogin1: "#283140",
  gradientLogin11: "#686e79",
  gradientLogin2: "#E6E2B8",
  // gradientLogin2: "#FCF6C6",
  gradientLogin3: "#FEF495",
  cream : "#FAF7F2", // fundal crem deschis
   cream2 : "#F5E9D6",
  background: "#f6f6f6",
  white: "#FFFFFF",
  black: "#131523",
  green: "#0F9D58",
  red: "#F0142F",
  borderTextColor: "#DBDBDB",
  placeholderTextColor: "#494949",
  dark: "#333333",
  searchBg: "#F1F5FB",
  pureBlack: "#000000",
  gray: "#6A8693",
  darkblack: "#333333",
  blue: "#1B5A90",
  lightGray: "#858585",
  lightGrayOpac: "rgba(133, 133, 133, 0.1)",
  facebook: "#944273",
  // primary1: "#040606",
  primary1: "#27282A",
  primary2: "#505050",
  primary3: "#283140",
  secondary2: "#040606",
  // secondary2: "#27282A",
  secondary2rgba: "rgba(39, 40, 42, 0.95)",
  facebookLink: "#2F5597",
  facebookOpac: "rgba(47, 85, 151, 0.1)",
  google: "#DD4B39",
  yellow: "#FFDE0A",
  ligtBlue: "#0DD8F9",
  seaBlue: "#0CE0FF",
  bookBlue: "#20c0f3",
  pink: "#DA3F81",
  darkRed: "#FF0000",
  textLight: "#777777",
  lightBlack: "#616161",
  grayText: "#9e9e9e",
  ratingGray: "#D5D5D5",
  imageGray: "#CFCFCF",
  lightSelect: "#7e7070",
  darkSelect: "#453f3f",
  goldLight: '#FFF9C4',  // lumina
  gold:       '#FFD700', // ton mediu
  goldDark:   '#B8860B', // umbră
};

// versiune comună, minimală (un singur textShadow)
const goldBase = {
  color: colors.gold,
  textShadowColor: 'rgba(184,134,11,0.7)',   // #B8860B cu transparență
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,                       // <= 2 pt claritate
};


export const textStyles = {
  /** titluri / corp ≥ 24 px */
  goldenText: {
    ...goldBase,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.goldDark,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.35,
      shadowRadius: 1.5,
    }),
  },

  goldenTextBold: {
    ...goldBase,
    fontWeight: '900',
    letterSpacing: 0.5,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.goldDark,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.35,
      shadowRadius: 1.5,
    }),
  },

  goldenGlow: {
    color: colors.gold,
    textShadowColor: colors.goldLight,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontWeight: 'bold',
  },
  goldenGlowStrong: {
    color: colors.gold,
    textShadowColor: colors.goldLight,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    fontWeight: '900',
  },

  liftingText: {
    color: colors.gold,
    textShadowColor: 'rgba(184,134,11,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    fontWeight: 'bold',
  },
};