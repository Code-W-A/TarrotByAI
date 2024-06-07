//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet, TextProps } from "react-native";
import { colors } from "../utils/colors";

// define your styles
const styles = StyleSheet.create({
  black: {
    color: colors.black,
  },
  white: {
    color: colors.white,
  },
  darkblack: {
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
    color: colors.yellow,
  },
  lightBlue: {
    color: colors.facebook,
  },
  darkRed: {
    color: colors.darkRed,
  },
  textLight: {
    color: colors.textLight,
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
    fontSize: 32,
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
    fontSize: 16,
  },
  h8: {
    fontSize: 14,
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
  h30: {
    fontSize: 11,
  },
  h23: {
    fontSize: 23,
  },
  h22: {
    fontSize: 22,
  },
  fontBold: { fontFamily: "LoraBold" },
  fontRegular: { fontFamily: "Lora" },
  fontMedium: { fontFamily: "Lora" },
});

const {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  h7,
  h8,
  h9,
  h10,
  h11,
  h12,
  h13,
  h14,
  h15,
  h23,
  h16,
  h22,
  h30,
  h18,
} = styles;
const {
  black,
  dark,
  secondaryBlack,
  green,
  red,
  placeholderTextColor,
  white,
  gray,
  darkRed,
  lightGray,
  yellow,
  lightBlue,
  textLight,
  lightBlack,
  grayText,
  ratingGray,
  imageGray,
  primary2,
} = styles;
const { fontBold, fontRegular, fontMedium } = styles;

export const H2fontBoldPrimary = `
  ${h2};
  ${fontBold};
  ${primary2};
`;
export const H3fontBoldPrimary = `
  ${h3};
  ${fontBold};
  ${primary2};
`;
export const H6fontBoldPrimary = `
  ${h3};
  ${fontBold};
  ${primary2};
`;
export const H6fontMediumPrimary = `
${h6};
${fontMedium};
${primary2};
`;
export const H6fontRegularBlue = `
  ${h6};
  ${fontRegular};
  ${lightBlue};
`;
export const H8fontRegularRed = `
  ${h8};
  ${fontRegular};
  ${darkRed};
`;
export const H6fontRegularBlack = `
  ${h6};
  ${fontRegular};
  ${black};
`;
export const H10fontRegularBlack = `
  ${h10};
  ${fontRegular};
  ${black};
`;
export const H10fontRegularLight = `
  ${h10};
  ${fontRegular};
  ${textLight};
`;
export const H10fontRegularWhite = `
  ${h10};
  ${fontRegular};
  ${primary2};
`;
export const H10fontRegularPrimary = `
  ${h10};
  ${fontRegular};
  ${primary2};
`;
export const H10fontRegularGreen = `
  ${h10};
  ${fontRegular};
  ${green};
`;
export const H10fontRegularRed = `
  ${h10};
  ${fontRegular};
  ${darkRed};
`;
export const H8fontRegularBlack = `
  ${h8};
  ${fontRegular};
  ${black};
`;

export const H8fontRegularSecondaryBlack = `
  ${h8};
  ${fontRegular};
  ${secondaryBlack};
`;

export const H8fontRegularWhite = `
  ${h8};
  ${fontRegular};
  ${white};
`;

export const H6fontRegularPrimary = `
  ${h6};
  ${fontRegular};
  ${primary2};
`;
export const H6fontBoldWhite = `
  ${h6};
  ${fontRegular};
  ${white};
`;
export const H6fontRegularWhite = `
  ${h6};
  ${fontRegular};
  ${white};
`;

export const H6fontMediumWhite = `
  ${h6};
  ${fontMedium};
  ${white};
`;

export const H22fontMediumBlack = `
  ${h22};
  ${fontMedium};
  ${black};
`;

export const H9fontRegularBlack = `
  ${h9};
  ${fontRegular};
  ${black};
`;
export const H9fontRegularGreen = `
  ${h9};
  ${fontRegular};
  ${green};
`;

export const H13fontRegularGray = `
  ${h13};
  ${fontRegular};
  ${grayText};
`;

export const H14fontRegularBlack = `
  ${h14};
  ${fontRegular};
  ${black};
`;
export const H14fontRegularWhite = `
  ${h14};
  ${fontRegular};
  ${white};
`;
export const H14fontRegularLightBlack = `
  ${h14};
  ${fontRegular};
  ${lightBlack};
`;
export const H14fontRegularLightGray = `
  ${h14};
  ${fontRegular};
  ${lightGray};
`;
export const H14fontRegularGray = `
  ${h14};
  ${fontRegular};
  ${grayText};
`;
export const H14fontRegularBlackk = `
  ${h14};
  ${fontRegular};
  ${black};
`;
export const H14fontRegularImage = `
  ${h14};
  ${fontRegular};
  ${imageGray};
`;
export const H14fontMediumBlack = `
  ${h14};
  ${fontMedium};
  ${black};
`;
export const H14fontRegulargray = `
  ${h14};
  ${fontRegular};
  ${lightGray};
`;

export const H14fontRegularRed = `
  ${h14};
  ${fontRegular};
  ${red};
`;
export const H14fontRegularBlue = `
  ${h14};
  ${fontRegular};
  ${lightBlue};
`;

export const H18fontRegularBlackk = `
  ${h18};
  ${fontRegular};
  ${black};
`;

export const H9fontRegularGray = `
  ${h9};
  ${fontRegular};
  ${lightGray};
`;

export const H8fontRegularPrimary = `
  ${h8};
  ${fontRegular};
  ${primary2};
`;

export const H23fontRegularGray = `
  ${h23};
  ${fontRegular};
  ${white};
`;

export const H16fontRegularGray = `
  ${h16};
  ${fontRegular};
  ${white};
`;

export const H16fontRegularYellow = `
  ${h16};
  ${fontRegular};
  ${yellow};
`;

export const H7fontMediumBlack = `
  ${h7};
  ${fontMedium};
  ${black};
`;
export const H7fontMediumPrimary = `
  ${h7};
  ${fontMedium};
  ${primary2};
`;
export const H7fontBoldPrimary = `
  ${h7};
  ${fontBold};
  ${primary2};
`;
export const H7fontBoldWhite = `
  ${h7};
  ${fontBold};
  ${white};
`;
export const H7fontLightBlue = `
  ${h7};
  ${fontMedium};
  ${lightBlue};
`;
export const H7fontRegularBlack = `
  ${h7};
  ${fontRegular};
  ${black};
`;
export const H7fontRegularWhite = `
  ${h7};
  ${fontRegular};
  ${white};
`;
export const H7fontMediumWhite = `
  ${h7};
  ${fontMedium};
  ${white};
`;

export const H9fontMediumBlack = `
  ${h9};
  ${fontMedium};
  ${black};
`;

export const H9fontMediumWhite = `
  ${h9};
  ${fontMedium};
  ${white};
`;

export const H9fontMediumBlue = `
  ${h9};
  ${fontMedium};
  ${lightBlue};
`;

export const H8fontMediumBlue = `
  ${h8};
  ${fontMedium};
  ${lightBlue};
`;

export const H15fontMediumBlack = `
  ${h15};
  ${fontMedium};
  ${black};
`;

export const H15fontMediumWhite = `
  ${h15};
  ${fontMedium};
  ${white};
`;

export const H8fontMediumBlack = `
  ${h8};
  ${fontMedium};
  ${black};
`;

export const H18fontMediumBlack = `
  ${h18};
  ${fontMedium};
  ${black};
`;

export const H8fontMediumWhite = `
  ${h8};
  ${fontMedium};
  ${white};
`;
export const H8fontBoldPrimary = `
  ${h8};
  ${fontBold};
  ${primary2};
`;
export const H8fontMediumPrimary = `
  ${h8};
  ${fontMedium};
  ${primary2};
`;

export const H8fontMediumLightBlack = `
  ${h8};
  ${fontMedium};
  ${textLight};
`;

export const H9fontMediumLightBlack = `
  ${h9};
  ${fontMedium};
  ${textLight};
`;
export const H30fontRegularLightBlack = `
  ${h8};
  ${fontRegular};
  ${textLight};
`;
export const H30fontRegularLightBlack2 = `
  ${h30};
  ${fontRegular};
  ${textLight};
`;
export const H30fontRegularLightRed = `
  ${h8};
  ${fontRegular};
  ${red};
`;

export const H7fontRegularLight = `
  ${h7};
  ${fontRegular};
  ${textLight};
`;
export const FormErrorMessage = `
  margin-top: 2px;
  ${h9};
  ${fontRegular};
  ${red}
`;

export const TCMessage = `
  ${h14};
  ${fontMedium};
  ${lightBlue}
`;
