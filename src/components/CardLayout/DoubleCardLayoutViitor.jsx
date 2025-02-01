import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { H6fontBoldPrimary, H6fontBoldYellow } from "../commonText";
import { colors } from "../../utils/colors";

const DoubleCardLayoutViitor = ({ shuffledCartiViitor, title, children }) => {
  const childArray = React.Children.toArray(children);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <H6fontBoldYellow
          style={{
            color: shuffledCartiViitor.length > 0 ? "white" : colors.primary3,
          }}
        >
          {title}
        </H6fontBoldYellow>
      </View>
      <View style={styles.cardContainer}>
        {childArray.slice(0, 2).map((child, index) => (
          <View key={index} style={styles.card}>
            {child}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    width: Dimensions.get("window").width,
    paddingHorizontal: 10,
    height: "80%",
  },
  card: {
    width: Dimensions.get("window").width * 0.4, // Ajustează acest procentaj pentru a seta lățimea cardului
    maxWidth: 150, // Ajustează această valoare pentru a seta lățimea maximă a cardului
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
    // borderColor: colors.primary3,
    // borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
  },
});

export default DoubleCardLayoutViitor;
