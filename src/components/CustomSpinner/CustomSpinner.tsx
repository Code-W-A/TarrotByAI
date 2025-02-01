import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Asumând că folosești Expo

const CustomSpinner = ({ size, color }) => {
  const spinValue = useRef(new Animated.Value(0)).current; // Initializăm o nouă valoare animată

  // Începe animația de rotație când componenta este montată
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1, // Valoarea finală a animației
        duration: 2000, // Durata unei rotații complete
        easing: Easing.linear, // Tipul de easing pentru animație
        useNativeDriver: true, // Folosește driver-ul nativ pentru performanță îmbunătățită
      })
    ).start();
  }, [spinValue]);

  // Mapăm valoarea animată la o rotație în grade
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialCommunityIcons
          name={"cards-outline"}
          size={size}
          color={color}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CustomSpinner;
