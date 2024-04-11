import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { H6fontBoldPrimary } from "../commonText";
import { colors } from "../../utils/colors";

const SingleCardLayout = ({
  shuffledCartiPersonalizate,
  title,
  children,
  ind,
}) => {
  const child = React.Children.toArray(children)[ind]; // Preia primul child pentru afișare

  return (
    <View style={styles.container}>
      {/* <H6fontBoldPrimary
        style={{
          color:
            shuffledCartiPersonalizate.length > 0 ? "white" : colors.primary3,
        }}
      >
        {title}
      </H6fontBoldPrimary> */}
      <View style={styles.cardContainer}>{child}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    marginTop: 5,
    paddingBottom: "20%",
  },
  cardContainer: {
    width: Dimensions.get("window").width * 0.8, // Ajustează acest procentaj în funcție de cât de mare vrei să fie cardul
    maxWidth: 300, // Ajustează acestă valoare pentru a seta lățimea maximă a cardului
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    // Adaugă aici alte stiluri pentru card, dacă este necesar
  },
});

export default SingleCardLayout;
