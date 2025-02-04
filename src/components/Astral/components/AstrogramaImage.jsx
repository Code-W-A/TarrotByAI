import React from "react";
import { StyleSheet, View } from "react-native";
import { Image, SvgUri } from "react-native-svg";

export default function AstrogramaImage({ svgImage }) {
  return (
    <View style={styles.container}>
      <SvgUri width="200" height="200" uri={svgImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
});
