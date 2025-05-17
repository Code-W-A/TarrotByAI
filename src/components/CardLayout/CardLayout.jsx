import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import {
  H6fontBoldPrimary,
  H6fontBoldYellow,
  H6fontRegularBlack,
} from "../commonText";
import { colors } from "../../utils/colors";

const CardLayout = ({ shuffledCartiPersonalizate, title, children }) => {
  const childArray = React.Children.toArray(children);

  // Distribuim cartonașele pe rânduri cu condiții specifice pentru fiecare rând
  const rows = childArray.reduce((acc, child, index) => {
    let rowIndex = Math.floor(index / 3);
    if (!acc[rowIndex]) acc[rowIndex] = [];

    // Pentru al treilea rând, adăugăm spațiu gol în mijloc
    if (rowIndex === 2 && acc[rowIndex].length === 1) {
      acc[rowIndex].push(
        <View key={`empty-${rowIndex}`} style={styles.emptySpace} />
      );
    }

    acc[rowIndex].push(child);
    return acc;
  }, []);

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: 24,
          fontFamily: 'LoraBold',
          color: '#bfa76a',
          textAlign: 'center',
          marginBottom: 10,
          textShadowColor: '#fffbeae0',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
          letterSpacing: 1.1,
        }}
      >
        {title}
      </Text>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.cardRow}>
          {row.map((card, cardIndex) => (
            <View
              key={cardIndex}
              style={[
                styles.cardColumn,
                (cardIndex === 0 || cardIndex === 2) && styles.lowerCard,
              ]}
            >
              {card}
            </View>
          ))}
        </View>
      ))}
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
    marginLeft: "4%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.primary3,
    textAlign: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  cardColumn: {
    width: Dimensions.get("window").width / 3.8,
    maxWidth: Dimensions.get("window").width / 3.8,
    marginHorizontal: Dimensions.get("window").width * 0.02,
  },
  emptySpace: {
    width: Dimensions.get("window").width / 3.8,
  },
  lowerCard: {
    marginTop: 40, // Ajustează această valoare pentru a poziționa mai jos cartonașele laterale
  },
});

export default CardLayout;
