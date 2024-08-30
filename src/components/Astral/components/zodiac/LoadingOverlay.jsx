import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../../../../utils/colors";
import i18n from "../../../../../i18n";

const LoadingOverlay = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.gradientLogin2} />
      <Text style={styles.loadingText}>
        {i18n.translate("translatingInfo")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gradientLogin1, // Match this with your background gradient or color
  },
  loadingText: {
    marginTop: 10,
    color: colors.gradientLogin2,
    fontSize: 18,
  },
});

export default LoadingOverlay;
