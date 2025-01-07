import PropTypes from "prop-types";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

/**
 * @param style {object}
 * @returns {*}
 * @constructor
 */
function SpaceSky({ style }) {
  const window = Dimensions.get("window");
  const imageHeight = window.height * 0.3; // Ajustează la 30% din înălțimea ecranului
  const topOffset = window.height * 0.1; // Poziționare dinamică pentru top

  return (
    <View style={[styles.container, { opacity: 0.8 }, style]}>
      <Image
        style={{
          height: "100%",
          opacity: 0.3,
          width: window.width,
        }}
        resizeMethod="auto"
        source={require("./images/stars-background.gif")}
      />
      <Image
        style={{
          height: imageHeight,
          opacity: 0.2,
          marginTop: -topOffset,
          width: window.width,
        }}
        source={require("./images/stars-background.gif")}
      />
      <Image
        style={{
          height: imageHeight,
          opacity: 0.15,
          marginTop: -topOffset,
          width: window.width,
        }}
        source={require("./images/stars-background.gif")}
      />
      <Image
        style={{
          height: imageHeight,
          opacity: 0.1,
          marginTop: -topOffset,
          width: window.width,
        }}
        source={require("./images/stars-background.gif")}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -60,
    left: 0,
    right: 0,
  },
});

SpaceSky.PropsType = {
  style: PropTypes.object,
};

export default SpaceSky;
