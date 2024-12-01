import React from "react";
import {
  TouchableWithoutFeedback,
  ImageBackground,
  Text,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../utils/colors";
import { useNavigationState } from "../../context/NavigationContext";
import {
  H6fontBoldPrimary,
  H7fontBoldPrimary,
  H7fontBoldWhite,
  H8fontBoldPrimary,
  H8fontBoldWhite,
  H9fontMediumWhite,
} from "../commonText";
import { Button, Surface } from "react-native-paper";
import Constellation from "../../svgs/backgrounds/Constellation";
import { LinearGradient } from "expo-linear-gradient";
import i18n from "../../../i18n";

// Adaugă 'text', 'screen', 'image', 'buttonText', 'title', și 'description' ca props-uri ale componentei Card
const LongCard = ({
  text,
  screen,
  image,
  interstitialAdLoaded,
  interstitial,
  buttonText,
  title,
  description1,
  description2,
  navigationScreen,
  onCardPress,
}) => {
  const navigation = useNavigation(); // folosește useNavigation pentru a naviga la screen-ul specific când card-ul este apăsat
  const { setCurrentScreen } = useNavigationState();

  return (
    <Surface
      style={[
        styles.surfaceRight,
        { backgroundColor: "transparent", marginTop: 10 },
      ]}
    >
      <View style={[StyleSheet.absoluteFill, { top: -25, opacity: 0.8 }]}>
        <Constellation
          color={colors.gradientLogin3 + "3D"}
          dotColor={colors.gradientLogin3}
          width={250}
          height={300}
        />
      </View>
      <LinearGradient
        colors={["transparent", colors.primary1 + "E6", colors.primary1 + "E6"]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.gradientRight}
      >
        <View style={{ flex: 0.5 }} />
        <View style={{ flex: 1 }}>
          <H8fontBoldWhite>{i18n.translate(title)}</H8fontBoldWhite>
          <H9fontMediumWhite
            theme={{ colors: { text: colors.gradientLogin2 } }}
          >
            {i18n.translate(description1)}
          </H9fontMediumWhite>
          <H9fontMediumWhite
            theme={{ colors: { text: "#FFFFFF" } }}
            style={{ marginTop: -3 }}
          >
            {i18n.translate(description2)}
          </H9fontMediumWhite>
          <View style={{ flex: 1, justifyContent: "flex-start" }}>
            <Button
              mode="contained"
              style={{ borderRadius: 25, marginTop: 5 }}
              theme={{
                colors: {
                  primary: colors.black,
                  text: "#FFFFFF",
                },
              }}
              labelStyle={{ fontSize: 15, letterSpacing: 0 }}
              onPress={() => onCardPress(navigationScreen)}
            >
              {i18n.translate(buttonText)}
            </Button>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  adviceContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 25,
    padding: 20,
  },
  adviceClose: { position: "absolute", top: 20, right: 20, zIndex: 2 },
  surfaceRight: {
    elevation: 3,
    height: 180,
    flexDirection: "row",
    borderRadius: 25,
    marginHorizontal: 20,
    overflow: "hidden",
    width: "90%",
    borderWidth: 1,
    borderColor: colors.gradientLogin2,
  },
  surfaceLeft: {
    elevation: 3,
    height: 160,
    flexDirection: "row-reverse",
    borderRadius: 25,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  gradientRight: {
    padding: 15,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    flex: 1,
    flexDirection: "row",
  },
  gradientLeft: {
    padding: 15,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    flex: 1,
    flexDirection: "row",
  },
});

export default LongCard;
