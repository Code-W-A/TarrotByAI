import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MainContainer } from "../../components/commonViews";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import { colors } from "../../utils/colors";
import { TouchableWithoutFeedback } from "react-native";
import {
  H15fontMediumWhite,
  H6fontBoldPrimary,
  H6fontMediumWhite,
  H7fontBoldPrimary,
  H7fontBoldWhite,
  H7fontMediumPrimary,
  H8fontMediumPrimary,
  H8fontMediumWhite,
} from "../../components/commonText";
import { useNavBarVisibility } from "../../context/NavbarVisibilityContext";

const LuckyColor = () => {
  const onPressHandler = () => {
    console.log("Pressed");
  };

  const { setIsNavBarVisible } = useNavBarVisibility();

  React.useEffect(() => {
    setIsNavBarVisible(false);
    return () => setIsNavBarVisible(true); // Restabilește vizibilitatea la ieșirea din componentă
  }, []);
  return (
    <TouchableWithoutFeedback onPress={onPressHandler}>
      <MainContainer>
        <LinearGradient colors={["#000000", "#434343"]} style={styles.gradient}>
          <GreetingBar isGoBack={true} />
          <View style={styles.overlay}>
            <View style={styles.imageContainer}>
              <Image
                style={styles.image}
                source={require("../../../assets/preassets/rosu2.png")}
              />
            </View>
            <View style={styles.secondImageContainer}>
              <Image
                source={require("../../../assets/headerIcon.png")}
                style={styles.secondImage}
                resizeMode="contain"
              />
            </View>
            <View
              style={{
                display: "flex",
                justifyContent: "space-around",
                height: "23%",
                bottom: "10%",
              }}
            >
              <H7fontBoldWhite style={{ alignSelf: "center" }}>
                Culoarea norocoasă a zilei
              </H7fontBoldWhite>
              <H8fontMediumPrimary style={{ alignSelf: "center" }}>
                Roșu
              </H8fontMediumPrimary>

              <H8fontMediumWhite>
                Această culoare îți aduce pasiune, iubire, poftă de viață, dar
                și foarte multă energie!
              </H8fontMediumWhite>
            </View>
          </View>
        </LinearGradient>
      </MainContainer>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    width: "auto",
    height: "auto",
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    borderWidth: 3,
    borderColor: colors.primary2,
    borderRadius: 10,
  },
  secondImageContainer: {
    alignSelf: "center",

    position: "relative",
    bottom: "8%",
    height: "auto",
    width: "auto",
  },
  secondImage: {
    width: 250,
    height: 150,
  },

  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingBottom: 100,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // Alte stiluri necesare pentru a pozitiona gradientul după cum este necesar
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "transparent", // Adaugă un overlay pentru a spori lizibilitatea textului
    borderRadius: 10, // Rotunjirea colțurilor
    padding: 20, // Spațiu în interiorul containerului
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10, // Spațiu sub titlu
  },
  colorName: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10, // Spațiu sub numele culorii
  },
  description: {
    color: "white",
    fontSize: 18,
    textAlign: "center", // Aliniere text la centru
  },
});

export default LuckyColor;
