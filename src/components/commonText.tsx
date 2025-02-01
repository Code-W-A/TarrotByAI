import React from "react";
import { Text, StyleSheet } from "react-native";
import { colors } from "../utils/colors";

// Stylesheet definition
const styles = StyleSheet.create({
  black: {
    color: colors.black,
  },
  white: {
    color: colors.white,
  },
  darkBlack: {
    color: colors.darkblack,
  },
  secondaryBlack: {
    color: colors.secondaryBlack,
  },
  green: {
    color: colors.green,
  },
  red: {
    color: colors.red,
  },
  dark: {
    color: colors.dark,
  },
  placeholderTextColor: {
    color: colors.placeholderTextColor,
  },
  gray: {
    color: colors.gray,
  },
  lightGray: {
    color: colors.lightGray,
  },
  primary2: {
    color: colors.primary3,
  },
  yellow: {
    color: colors.gradientLogin2,
  },
  lightBlue: {
    color: colors.facebook,
  },
  darkRed: {
    color: colors.darkRed,
  },
  textLight: {
    color: colors.white,
  },
  lightBlack: {
    color: colors.lightBlack,
  },
  grayText: {
    color: colors.grayText,
  },
  ratingGray: {
    color: colors.ratingGray,
  },
  imageGray: {
    color: colors.imageGray,
  },
  h1: {
    fontSize: 48,
  },
  h2: {
    fontSize: 40,
  },
  h3: {
    fontSize: 28,
  },
  h4: {
    fontSize: 21,
  },
  h5: {
    fontSize: 20,
  },
  h6: {
    fontSize: 28,
  },
  h7: {
    fontSize: 20,
  },
  h8: {
    fontSize: 16,
  },
  h9: {
    fontSize: 12,
  },
  h10: {
    fontSize: 10,
  },
  h11: {
    fontSize: 8,
  },
  h13: {
    fontSize: 9,
  },
  h12: {
    fontSize: 36,
  },
  h14: {
    fontSize: 13,
  },
  h15: {
    fontSize: 15,
  },
  h16: {
    fontSize: 16,
  },
  h18: {
    fontSize: 18,
  },
  h22: {
    fontSize: 22,
  },
  h23: {
    fontSize: 23,
  },
  h30: {
    fontSize: 11,
  },
  fontBold: {
    fontFamily: "LoraBold",
  },
  fontRegular: {
    fontFamily: "Lora",
  },
  fontMedium: {
    fontFamily: "Lora",
  },
});

// Define components for all styled Text components
export const H2fontBoldPrimary = ({ children }) => (
  <Text style={[styles.h2, styles.fontBold, styles.primary2]}>{children}</Text>
);
export const H6fontBoldPrimary = ({ children }) => (
  <Text style={[styles.h3, styles.fontBold, styles.primary2]}>{children}</Text>
);
export const H6fontBoldYellow = ({ children }) => (
  <Text style={[styles.h3, styles.fontBold, styles.yellow]}>{children}</Text>
);
export const H6fontRegularBlue = ({ children }) => (
  <Text style={[styles.h6, styles.fontRegular, styles.lightBlue]}>
    {children}
  </Text>
);
export const H8fontRegularRed = ({ children }) => (
  <Text style={[styles.h8, styles.fontRegular, styles.darkRed]}>
    {children}
  </Text>
);
export const H6fontRegularBlack = ({ children }) => (
  <Text style={[styles.h6, styles.fontRegular, styles.black]}>{children}</Text>
);
export const H10fontRegularBlack = ({ children }) => (
  <Text style={[styles.h10, styles.fontRegular, styles.black]}>{children}</Text>
);

// More converted styled components
export const H8fontBoldWhite = ({ children }) => (
  <Text style={[styles.h8, styles.fontBold, styles.white]}>{children}</Text>
);
export const H10fontRegularLight = ({ children }) => (
  <Text style={[styles.h10, styles.fontRegular, styles.textLight]}>
    {children}
  </Text>
);
export const H10fontRegularWhite = ({ children }) => (
  <Text style={[styles.h10, styles.fontRegular, styles.white]}>{children}</Text>
);
export const H10fontRegularPrimary = ({ children }) => (
  <Text style={[styles.h10, styles.fontRegular, styles.primary2]}>
    {children}
  </Text>
);
export const H10fontRegularGreen = ({ children }) => (
  <Text style={[styles.h10, styles.fontRegular, styles.green]}>{children}</Text>
);
export const H10fontRegularRed = ({ children }) => (
  <Text style={[styles.h10, styles.fontRegular, styles.red]}>{children}</Text>
);
export const H8fontRegularBlack = ({ children }) => (
  <Text style={[styles.h8, styles.fontRegular, styles.black]}>{children}</Text>
);
export const H8fontRegularSecondaryBlack = ({ children }) => (
  <Text style={[styles.h8, styles.fontRegular, styles.secondaryBlack]}>
    {children}
  </Text>
);
export const H8fontRegularWhite = ({ children }) => (
  <Text style={[styles.h8, styles.fontRegular, styles.white]}>{children}</Text>
);
export const H6fontRegularPrimary = ({ children }) => (
  <Text style={[styles.h6, styles.fontRegular, styles.primary2]}>
    {children}
  </Text>
);
export const H6fontBoldWhite = ({ children }) => (
  <Text style={[styles.h6, styles.fontBold, styles.white]}>{children}</Text>
);
export const H6fontRegularWhite = ({ children }) => (
  <Text style={[styles.h6, styles.fontRegular, styles.white]}>{children}</Text>
);
export const H6fontMediumWhite = ({ children, style }) => (
  <Text style={[styles.h6, styles.fontMedium, styles.white, style]}>
    {children}
  </Text>
);
export const H6fontMediumPrimary = ({ children }) => (
  <Text style={[styles.h6, styles.fontMedium, styles.primary2]}>
    {children}
  </Text>
);

export const H22fontMediumBlack = ({ children }) => (
  <Text style={[styles.h22, styles.fontMedium, styles.black]}>{children}</Text>
);
export const H9fontRegularBlack = ({ children }) => (
  <Text style={[styles.h9, styles.fontRegular, styles.black]}>{children}</Text>
);
export const H9fontRegularGreen = ({ children }) => (
  <Text style={[styles.h9, styles.fontRegular, styles.green]}>{children}</Text>
);
export const H13fontRegularGray = ({ children }) => (
  <Text style={[styles.h13, styles.fontRegular, styles.grayText]}>
    {children}
  </Text>
);
export const H14fontRegularBlack = ({ children }) => (
  <Text style={[styles.h14, styles.fontRegular, styles.black]}>{children}</Text>
);
export const H14fontRegularWhite = ({ children }) => (
  <Text style={[styles.h14, styles.fontRegular, styles.white]}>{children}</Text>
);
export const H14fontRegularLightBlack = ({ children }) => (
  <Text style={[styles.h14, styles.fontRegular, styles.lightBlack]}>
    {children}
  </Text>
);
export const H14fontRegularLightGray = ({ children }) => (
  <Text style={[styles.h14, styles.fontRegular, styles.lightGray]}>
    {children}
  </Text>
);
export const H14fontRegularGray = ({ children }) => (
  <Text style={[styles.h14, styles.fontRegular, styles.grayText]}>
    {children}
  </Text>
);
export const H14fontRegularBlackk = ({ children }) => (
  <Text style={[styles.h14, styles.fontRegular, styles.black]}>{children}</Text>
);
export const H14fontRegularImage = ({ children }) => (
  <Text style={[styles.h14, styles.fontRegular, styles.imageGray]}>
    {children}
  </Text>
);
export const H14fontMediumBlack = ({ children }) => (
  <Text style={[styles.h14, styles.fontMedium, styles.black]}>{children}</Text>
);
export const H14fontRegulargray = ({ children }) => (
  <Text style={[styles.h14, styles.fontRegular, styles.lightGray]}>
    {children}
  </Text>
);
export const H14fontRegularRed = ({ children }) => (
  <Text style={[styles.h14, styles.fontRegular, styles.red]}>{children}</Text>
);
export const H14fontRegularBlue = ({ children }) => (
  <Text style={[styles.h14, styles.fontRegular, styles.lightBlue]}>
    {children}
  </Text>
);
export const H18fontRegularBlackk = ({ children }) => (
  <Text style={[styles.h18, styles.fontRegular, styles.black]}>{children}</Text>
);
export const H9fontRegularGray = ({ children }) => (
  <Text style={[styles.h9, styles.fontRegular, styles.lightGray]}>
    {children}
  </Text>
);
export const H8fontRegularPrimary = ({ children }) => (
  <Text style={[styles.h8, styles.fontRegular, styles.primary2]}>
    {children}
  </Text>
);
export const H23fontRegularGray = ({ children }) => (
  <Text style={[styles.h23, styles.fontRegular, styles.white]}>{children}</Text>
);
export const H16fontRegularGray = ({ children }) => (
  <Text style={[styles.h16, styles.fontRegular, styles.white]}>{children}</Text>
);
export const H16fontRegularYellow = ({ children }) => (
  <Text style={[styles.h16, styles.fontRegular, styles.yellow]}>
    {children}
  </Text>
);
export const H7fontMediumBlack = ({ children }) => (
  <Text style={[styles.h7, styles.fontMedium, styles.black]}>{children}</Text>
);
export const H7fontMediumPrimary = ({ children }) => (
  <Text style={[styles.h7, styles.fontMedium, styles.primary2]}>
    {children}
  </Text>
);
export const H4fontBoldPrimary = ({ children }) => (
  <Text style={[styles.h4, styles.fontBold, styles.primary2]}>{children}</Text>
);
export const H4fontBoldYellow = ({ children }) => (
  <Text style={[styles.h4, styles.fontBold, styles.yellow]}>{children}</Text>
);
export const H3fontBoldPrimary = ({ children }) => (
  <Text style={[styles.h3, styles.fontBold, styles.primary2]}>{children}</Text>
);
export const H3fontBoldWhite = ({ children, style }) => (
  <Text style={[styles.h3, styles.fontBold, styles.white, style]}>
    {children}
  </Text>
);
export const H7fontBoldPrimary = ({ children }) => (
  <Text style={[styles.h7, styles.fontBold, styles.primary2]}>{children}</Text>
);
export const H7fontBoldWhite = ({ children }) => (
  <Text style={[styles.h7, styles.fontBold, styles.white]}>{children}</Text>
);
export const H7fontLightBlue = ({ children }) => (
  <Text style={[styles.h7, styles.fontMedium, styles.lightBlue]}>
    {children}
  </Text>
);
export const H7fontRegularBlack = ({ children }) => (
  <Text style={[styles.h7, styles.fontRegular, styles.black]}>{children}</Text>
);
export const H7fontRegularWhite = ({ children }) => (
  <Text style={[styles.h7, styles.fontRegular, styles.white]}>{children}</Text>
);
export const H7fontMediumWhite = ({ children }) => (
  <Text style={[styles.h7, styles.fontMedium, styles.white]}>{children}</Text>
);
export const H9fontMediumBlack = ({ children }) => (
  <Text style={[styles.h9, styles.fontMedium, styles.black]}>{children}</Text>
);
export const H9fontMediumWhite = ({ children }) => (
  <Text style={[styles.h9, styles.fontMedium, styles.white]}>{children}</Text>
);
export const H9fontMediumBlue = ({ children }) => (
  <Text style={[styles.h9, styles.fontMedium, styles.lightBlue]}>
    {children}
  </Text>
);
export const H8fontMediumBlue = ({ children }) => (
  <Text style={[styles.h8, styles.fontMedium, styles.lightBlue]}>
    {children}
  </Text>
);
export const H15fontMediumBlack = ({ children }) => (
  <Text style={[styles.h15, styles.fontMedium, styles.black]}>{children}</Text>
);
export const H15fontMediumWhite = ({ children }) => (
  <Text style={[styles.h15, styles.fontMedium, styles.white]}>{children}</Text>
);
export const H8fontMediumBlack = ({ children }) => (
  <Text style={[styles.h8, styles.fontMedium, styles.black]}>{children}</Text>
);
export const H18fontMediumBlack = ({ children }) => (
  <Text style={[styles.h18, styles.fontMedium, styles.black]}>{children}</Text>
);
export const H8fontMediumWhite = ({ children }) => (
  <Text style={[styles.h8, styles.fontMedium, styles.white]}>{children}</Text>
);

export const H8fontBoldPrimary = ({ children }) => (
  <Text style={[styles.h8, styles.fontBold, styles.primary2]}>{children}</Text>
);
export const H8fontBoldYellow = ({ children }) => (
  <Text style={[styles.h8, styles.fontBold, styles.yellow]}>{children}</Text>
);
export const H8fontMediumPrimary = ({ children }) => (
  <Text style={[styles.h8, styles.fontMedium, styles.primary2]}>
    {children}
  </Text>
);
export const H8fontMediumLightBlack = ({ children }) => (
  <Text style={[styles.h8, styles.fontMedium, styles.textLight]}>
    {children}
  </Text>
);
export const H9fontMediumLightBlack = ({ children }) => (
  <Text style={[styles.h9, styles.fontMedium, styles.textLight]}>
    {children}
  </Text>
);
export const H30fontRegularLightBlack = ({ children }) => (
  <Text style={[styles.h30, styles.fontRegular, styles.textLight]}>
    {children}
  </Text>
);
export const H30fontRegularLightBlack2 = ({ children }) => (
  <Text style={[styles.h30, styles.fontRegular, styles.textLight]}>
    {children}
  </Text>
);
export const H30fontRegularLightRed = ({ children }) => (
  <Text style={[styles.h30, styles.fontRegular, styles.red]}>{children}</Text>
);
export const H7fontRegularLight = ({ children }) => (
  <Text style={[styles.h7, styles.fontRegular, styles.textLight]}>
    {children}
  </Text>
);
export const FormErrorMessage = ({ children }) => (
  <Text style={[styles.h9, styles.fontRegular, styles.red, { marginTop: 2 }]}>
    {children}
  </Text>
);
export const TCMessage = ({ children }) => (
  <Text style={[styles.h14, styles.fontMedium, styles.lightBlue]}>
    {children}
  </Text>
);
