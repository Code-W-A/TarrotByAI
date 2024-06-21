import { LinearGradient } from "expo-linear-gradient";
import i18n from "i18n-js";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import {
  Button,
  Caption,
  Subheading,
  Surface,
  Text,
  Title,
  useTheme,
} from "react-native-paper";

import Leo from "../../../svgs/Leo";
import Constellation from "../../../svgs/backgrounds/Constellation";
import ConstellationSimple from "../../../svgs/backgrounds/ConstellationSimple";
import SpaceSky from "../../../components/Astral/components/space-sky";
import ShadowHeadline from "../../../components/Astral/components/shadow-headline";
import ScrollViewFadeFirst from "../../../components/Astral/components/scroll-view-fade-first";
import { colors } from "../../../utils/colors";
import { StatusBar } from "react-native";
import {
  H10fontRegularWhite,
  H6fontBoldPurple,
  H6fontBoldWhite,
  H7fontBoldWhite,
  H8fontBoldPrimary,
  H8fontMediumWhite,
  H9fontMediumBlack,
  H9fontMediumBlue,
  H9fontMediumWhite,
  H9fontRegularGray,
} from "../../../components/commonText";

const SubHeading = () => {
  const { colors } = useTheme();
  return (
    <View style={{ marginHorizontal: 20 }}>
      <H6fontBoldPurple style={{ textAlign: "center" }}>
        {"Astrologie Digitală"}
      </H6fontBoldPurple>
      <View style={{ height: 10 }} />
      <H9fontMediumWhite style={{ textAlign: "center" }}>
        {
          "Explorează astrograma natală, analizează relațiile prin sinastrie și descoperă previziunile horoscopului zilnic direct din aplicația ta mobilă."
        }
      </H9fontMediumWhite>
    </View>
  );
};

/**
 * @param navigation
 * @returns {*}
 * @constructor
 */
function LearnScreen({ navigation }) {
  const handleViewLesson = async (lesson) => {
    navigation.navigate(lesson);
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[
          colors.gradientLogin1,
          colors.gradientLogin1,
          colors.gradientLogin1,
          colors.gradientLogin1,
          colors.gradientLogin1,
          colors.gradientLogin1,
          colors.gradientLogin1,
          colors.gradientLogin1,
          colors.gradientLogin1,
          colors.gradientLogin11,
        ]} // Înlocuiește cu culorile gradientului tău
        style={{
          flex: 1,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <SpaceSky />
        <View style={{ marginBottom: 10 }}>
          <View style={styles.headerContainer}>
            <ShadowHeadline>{""}</ShadowHeadline>
          </View>
        </View>
        <ScrollViewFadeFirst element={<SubHeading />} height={140}>
          <Surface
            style={[
              styles.surfaceRight,
              { backgroundColor: "transparent", marginTop: 10 },
            ]}
          >
            <View style={[StyleSheet.absoluteFill, { top: -25, opacity: 0.8 }]}>
              <Constellation
                color={colors.gradientLogin2 + "3D"}
                dotColor={colors.gradientLogin2}
                width={250}
                height={300}
              />
            </View>
            <LinearGradient
              colors={["transparent", "#4c4c4c" + "E6", "#4c4c4c" + "E6"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientRight}
            >
              <View style={{ flex: 0.8 }} />
              <View style={{ flex: 1 }}>
                <H7fontBoldWhite>{"Astrograma Natala"}</H7fontBoldWhite>
                <H9fontMediumWhite
                  theme={{ colors: { text: colors.gradientLogin2 } }}
                >
                  {"Explorează profilul astral"}
                </H9fontMediumWhite>
                <H9fontMediumWhite
                  theme={{ colors: { text: "#FFFFFF" } }}
                  style={{ marginTop: -3 }}
                >
                  {"cu astrograma natală"}
                </H9fontMediumWhite>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                  <Button
                    mode="contained"
                    // icon="lock-outline"
                    style={{ borderRadius: 25, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: colors.gradientLogin1,
                        text: "#FFFFFF",
                      },
                    }}
                    labelStyle={{ fontSize: 12, letterSpacing: 0 }}
                    onPress={() => handleViewLesson("AstrogramaNatala")}
                  >
                    {"Vezi astrograma"}
                  </Button>
                </View>
              </View>
            </LinearGradient>
          </Surface>
          <View style={{ height: 20 }} />
          <Surface
            style={[
              styles.surfaceLeft,
              { backgroundColor: "transparent", height: 140 },
            ]}
          >
            <View
              style={[StyleSheet.absoluteFill, { right: 150, opacity: 0.4 }]}
            >
              <ConstellationSimple
                color={colors.gradientLogin2 + "3D"}
                dotColor={colors.gradientLogin3}
                width={200}
                height={150}
              />
            </View>
            <LinearGradient
              colors={["#81411a", "#81411aE6", "#81411a3D", "transparent"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientLeft}
            >
              <View style={{ flex: 1 }}>
                <H7fontBoldWhite>{"Sinastrie "}</H7fontBoldWhite>
                <H9fontMediumWhite>
                  {"Analizează compatibilitatea cuplului prin sinastrie"}
                </H9fontMediumWhite>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                  <Button
                    mode="contained"
                    // icon="lock-outline"
                    style={{ borderRadius: 25, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: colors.gradientLogin1,
                        text: "#FFFFFF",
                      },
                    }}
                    labelStyle={{ fontSize: 12, letterSpacing: 0 }}
                    onPress={() => handleViewLesson("AstrogramaNatala")}
                  >
                    {"Analizeaza sinestria"}
                  </Button>
                </View>
              </View>
              <View style={{ flex: 0.6 }} />
            </LinearGradient>
          </Surface>
          <View style={{ height: 20 }} />
          <Surface
            style={[
              styles.surfaceRight,
              { backgroundColor: "transparent", height: 130 },
            ]}
          >
            <View style={[StyleSheet.absoluteFill, { top: -25, opacity: 0.3 }]}>
              <Leo color={colors.white} width={200} height={200} />
            </View>
            <LinearGradient
              colors={["transparent", "#13366f" + "E6", "#13366f" + "E6"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientRight}
            >
              <View style={{ flex: 0.8 }} />
              <View style={{ flex: 1 }}>
                <H7fontBoldWhite>{"Horoscop Zilnic"}</H7fontBoldWhite>
                <H9fontMediumWhite>{"Horoscop Personalizat"}</H9fontMediumWhite>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                  <Button
                    mode="contained"
                    // icon="lock-outline"
                    style={{ borderRadius: 25, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: colors.gradientLogin1,
                        text: "#FFFFFF",
                      },
                    }}
                    labelStyle={{ fontSize: 12, letterSpacing: 0 }}
                    onPress={() => handleViewLesson("AstrogramaNatala")}
                  >
                    {"Vezi horoscopul"}
                  </Button>
                </View>
              </View>
            </LinearGradient>
          </Surface>
          <View style={{ height: 20 }} />
          <Surface
            style={[
              styles.surfaceLeft,
              { backgroundColor: "transparent", height: 140 },
            ]}
          >
            <View
              style={[StyleSheet.absoluteFill, { right: 150, opacity: 0.4 }]}
            >
              <ConstellationSimple
                color={colors.gradientLogin2 + "3D"}
                dotColor={colors.gradientLogin3}
                width={200}
                height={150}
              />
            </View>
            <LinearGradient
              colors={["#4c4c4c" + "E6", "#4c4c4c" + "E6", "transparent"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientLeft}
            >
              <View style={{ flex: 1 }}>
                {/* <H7fontBoldWhite>{"Sinastrie "}</H7fontBoldWhite> */}
                <H9fontMediumWhite>
                  {
                    "Actualizeaza informatiile tale pentru a primi cele mai precise analize"
                  }
                </H9fontMediumWhite>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                  <Button
                    mode="contained"
                    // icon="lock-outline"
                    style={{ borderRadius: 25, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: colors.gradientLogin1,
                        text: "#FFFFFF",
                      },
                    }}
                    labelStyle={{ fontSize: 12, letterSpacing: 0 }}
                    onPress={() =>
                      navigation.navigate("Name", { editMode: true })
                    }
                  >
                    {"Actualizeaza"}
                  </Button>
                </View>
              </View>
              <View style={{ flex: 0.6 }} />
            </LinearGradient>
          </Surface>
          <View style={{ height: 150 }} />
        </ScrollViewFadeFirst>
      </LinearGradient>
    </SafeAreaView>
  );
}

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
    height: 160,
    flexDirection: "row",

    borderRadius: 25,
    marginHorizontal: 20,
    overflow: "hidden",
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

export default LearnScreen;
