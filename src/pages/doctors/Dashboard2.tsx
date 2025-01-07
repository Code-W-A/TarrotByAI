import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  Animated,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { useRoute } from "@react-navigation/native";

import NavBarBottom from "../../components/Navbar";
import FlipCard from "../../components/FlipCard/FlipCard";
import { styles } from "./DashboardStyle";
import { MainContainer } from "../../components/commonViews";
import { LinearGradient } from "expo-linear-gradient";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import CardLayout from "../../components/CardLayout/CardLayout";
import CustomSpinner from "../../components/CustomSpinner/CustomSpinner";
import { colors } from "../../utils/colors";

const Dashboard2 = () => {
  const [cardAnimations, setCardAnimations] = useState([]);
  const initialAnimations = useRef(Array(9).fill(null)).current; // Utilizarea useRef pentru a păstra starea inițială

  useEffect(() => {
    const screenWidth = Dimensions.get("window").width;

    // Inițializarea animațiilor doar dacă nu au fost setate anterior
    if (initialAnimations.every((elem) => elem === null)) {
      initialAnimations.forEach((_, index) => {
        initialAnimations[index] = new Animated.Value(screenWidth);
      });

      setCardAnimations(initialAnimations);

      animateCard(0); // Începe animația pentru primul card
    }
  }, []);

  const animateCard = (index) => {
    if (index < initialAnimations.length) {
      Animated.timing(initialAnimations[index], {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => animateCard(index + 1));
    }
  };

  const renderFlipCard = (index) => {
    const animatedStyle = {
      transform: [{ translateX: cardAnimations[index] }],
    };

    return <FlipCard key={index} style={animatedStyle} />;
  };

  // Restul logicii și a codului specific aplicației...

  const screenHeight = Dimensions.get("window").height;

  return (
    <Fragment>
      <MainContainer>
        <LinearGradient
          colors={["#000000", "#434343"]} // Înlocuiește cu culorile gradientului tău
          style={{
            flex: 1,
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          }}
        >
          <GreetingBar />
          {true ? (
            <CustomSpinner size={74} color={colors.primary2} /> // Înlocuiește 'blue' cu culoarea dorită
          ) : (
            <ScrollView
              contentContainerStyle={{
                paddingBottom: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
                minHeight: screenHeight,
              }}
            >
              <CardLayout title="Titlul Secțiunii">
                {cardAnimations.map((_, index) => renderFlipCard(index))}
              </CardLayout>
            </ScrollView>
          )}
        </LinearGradient>
      </MainContainer>
    </Fragment>
  );
};

export default Dashboard2;
