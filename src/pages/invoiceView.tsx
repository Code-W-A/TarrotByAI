import React, { Fragment } from "react";
import { View, Image, StyleSheet } from "react-native";
import { GeneralProps } from "../interfaces/generalProps";
import { Route } from "@react-navigation/native";
import { NavBarPatient } from "../common/commonComponents";
import {
  CommonLineInvoice,
  MainContainer,
  RowView,
} from "../components/commonViews";
import {
  H10fontRegularBlack,
  H10fontRegularLight,
  H9fontMediumBlack,
} from "../components/commonText";

import LogoIcon from "../../assets/images/logo.svg";
import i18n from "../../i18n";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}
const InvoiceView: React.FC<Props> = ({ navigation }): JSX.Element => {
  return (
    <Fragment>
      <MainContainer style={{ backgroundColor: "white" }}></MainContainer>
    </Fragment>
  );
};
export default InvoiceView;
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 30 },
  textGray: {
    fontSize: 10,

    color: "#777777",
    paddingLeft: 5,
  },
  title: { flex: 1 },
  row: { height: 28 },
  text: {
    fontSize: 10,

    color: "black",
    paddingLeft: 10,
  },
});
