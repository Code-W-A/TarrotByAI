import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../../utils/colors";

export const VideoSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.video} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 320,
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(191, 167, 106, 0.15)",
  },
});
