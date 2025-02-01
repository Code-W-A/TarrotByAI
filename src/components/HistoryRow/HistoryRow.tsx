import React, { useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { H7fontMediumWhite } from "../commonText";
import { useNavigation } from "@react-navigation/native";
import { screenName } from "../../utils/screenName";

// Props ar putea include un array de imagini și orice altceva ai nevoie
const ImageRow = ({ data, date, id, historyType }) => {
  useEffect(() => {
    // console.log("data..", data[0].carte.image.finalUri);
  }, []);

  const navigation = useNavigation();

  // Funcție pentru a naviga către ecranul PersonalizedReading cu parametrul item
  const navigateToPersonalizedReading = (item) => {
    try {
      // Navigație cu cartea selectată
      if (historyType === "FutureReading") {
        navigation.navigate(screenName.FutureReading, { item });
      } else {
        navigation.navigate("PersonalizedReading", { item });
      }
    } catch (err) {
      console.log(
        "Error at navigate to reading dashboard from history error...",
        err
      );
    }
  };
  return (
    <View style={{ backgroundColor: "#21202E", margin: 10 }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 10,
          paddingTop: 5,
        }}
      >
        <H7fontMediumWhite>{id}</H7fontMediumWhite>
        <H7fontMediumWhite>{date}</H7fontMediumWhite>
      </View>
      <FlatList
        horizontal
        data={data}
        renderItem={({ item }) => (
          //   <Image source={{ uri: item.uri }} style={styles.image} />
          <TouchableOpacity onPress={() => navigateToPersonalizedReading(item)}>
            <Image
              source={{
                uri:
                  historyType === "FutureReading"
                    ? item.image.finalUri
                    : item.carte.image.finalUri,
              }}
              style={styles.image}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        style={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 10,
    // Adaugă aici alte stiluri pentru rând dacă este necesar
  },
  image: {
    width: 40, // Aici poți face dimensiunea dinamică
    height: 60,
    marginRight: 10,
    // Adaugă aici alte stiluri pentru imagini dacă este necesar
  },
});

export default ImageRow;
