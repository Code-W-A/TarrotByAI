import React, { Fragment, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { GeneralProps } from "../interfaces/generalProps";
import { Route } from "@react-navigation/native";
import { NavBarPatient } from "../common/commonComponents";
import { labels } from "../utils/labels";
import { colors } from "../utils/colors";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import {
  CardSurface,
  CommonLineView,
  MainContainer,
  RowView,
} from "../components/commonViews";
import {
  H15fontMediumBlack,
  H7fontRegularBlack,
} from "../components/commonText";
import { screenName } from "../utils/screenName";
import { menuBarOptions, menuOptionsAuth } from "../utils/constant";
import {
  alignItemsCenter,
  flexRow,
  mb15,
  mb20,
  mv10,
  mv15,
  mv5,
  p10,
  pb10,
  ph10,
  ph5,
  pt10,
  pv10,
  pv5,
} from "../common/commonStyles";
import RightArrow from "../../assets/images/right-arrow.svg";
import i18n from "../../i18n";
import { useApiData } from "../context/ApiContext";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const Pages: React.FC<Props> = ({ navigation, route }): JSX.Element => {
  const renderPages = (data, label: string) => {
    return (
      <View style={[pt10, ph10]}>
        <H7fontRegularBlack>{label}</H7fontRegularBlack>
        <CommonLineView style={mb15} />
        {data.map((item, index) => {
          return (
            <CardSurface style={[mb15]}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(item.screenName);
                }}
                key={index}
              >
                <RowView style={alignItemsCenter}>
                  <View style={[flexRow, alignItemsCenter]}>
                    <CardSurface style={styles.iconSurface}>
                      <Icon2 name="pages" size={18} color={colors.white} />
                    </CardSurface>
                    <H15fontMediumBlack style={{}}>
                      {item.name}
                    </H15fontMediumBlack>
                  </View>
                  <RightArrow height={17} width={10} />
                </RowView>
              </TouchableOpacity>
            </CardSurface>
          );
        })}
      </View>
    );
  };

  return (
    <Fragment>
      <MainContainer>
        <NavBarPatient title={"Pages"} />
        <ScrollView>
          {renderPages(menuBarOptions, i18n.translate("appPages"))}
          {renderPages(menuOptionsAuth, i18n.translate("authentication"))}
        </ScrollView>
      </MainContainer>
    </Fragment>
  );
};
export default Pages;

const styles = StyleSheet.create({
  iconSurface: {
    borderRadius: 25,
    height: 30,
    width: 30,
    backgroundColor: colors.facebook,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 25,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  iconStyle: { height: 17, width: 10 },
});
