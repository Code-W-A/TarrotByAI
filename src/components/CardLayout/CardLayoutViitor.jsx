import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { H6fontBoldPrimary, H6fontRegularBlack } from "../commonText";
import { colors } from "../../utils/colors";

const CardLayoutViitor = ({ shuffledCartiViitor, title, children }) => {
  const childArray = React.Children.toArray(children);

  // Distribuim cartonașele pe rânduri
  const rows = childArray.reduce((acc, child, index) => {
    let rowIndex;
    if (index < 3) {
      rowIndex = 0; // Primul rând
    } else {
      rowIndex = Math.floor((index + 1) / 3); // Rândurile următoare
    }

    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }

    // Adăugăm spațiu gol pentru mijloc în rândurile următoare
    if (rowIndex > 0 && acc[rowIndex].length === 1) {
      acc[rowIndex].push(
        <View key={`empty-${rowIndex}`} style={styles.emptySpace} />
      );
    }

    acc[rowIndex].push(child);
    return acc;
  }, []);

  // Verifică dacă există rânduri
  const hasRows = rows.length > 0;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.titleContainer,
          hasRows ? styles.titleTop : styles.titleCenter,
        ]}
      >
        <H6fontBoldPrimary
          style={{ color: shuffledCartiViitor.length > 0 && "white" }}
        >
          {title}
        </H6fontBoldPrimary>
      </View>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.cardRow, { marginTop: rowIndex === 0 ? 20 : null }]}
        >
          {row.map((card, cardIndex) => (
            <View
              key={cardIndex}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <View
                style={[
                  styles.cardColumn,
                  (cardIndex === 0 || cardIndex === 2) && styles.lowerCard,
                ]}
              >
                {card}
              </View>
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
    justifyContent: "flex-start",
    height: "100%",
    paddingBottom: "20%",
    marginLeft: "4%",
  },
  titleContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center", // Asigură că titlul este centrat în containerul său
  },
  titleTop: {
    marginTop: 20, // Spațiu suplimentar atunci când există rânduri
  },
  titleCenter: {
    flex: 1, // Întinde containerul pentru a centra titlul când nu sunt rânduri
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary3,
    textAlign: "center",
    marginBottom: 1, // Poți ajusta această valoare după preferințe
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  cardColumn: {
    marginHorizontal: Dimensions.get("window").width * 0.02,
  },
  lowerCard: {
    marginTop: 20, // Spațiu pentru a poziționa mai jos cartonașele laterale
  },
  emptySpace: {
    width: Dimensions.get("window").width / 3.8, // Lățimea spațiului gol
  },
});

export default CardLayoutViitor;
