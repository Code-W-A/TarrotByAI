import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { Snackbar } from "react-native-paper";

// Define the interface for the component's props
interface SnackBarProps {
  showSnackBar?: boolean;
  setShowSnackback?: (show: boolean) => void;
  message?: string;
  screen?: string;
  bottom?: any;
}

export default function SnackBar({
  showSnackBar,
  setShowSnackback,
  message,
  screen,
  bottom,
}: SnackBarProps) {
  const navigation = useNavigation();

  return (
    <>
      <View
        style={{
          position: "absolute",
          width: 300,
          height: 100,
          bottom: bottom ? bottom : "3%",
          left: "10%",
          zIndex: 2,
          elevation: 1, // Adaugă acest stil pentru Android
        }}
      >
        <Snackbar
          visible={showSnackBar}
          onDismiss={() => setShowSnackback && setShowSnackback(false)}
          action={{
            label: "OK",
            onPress: () => {
              // Do something
              if (setShowSnackback) {
                setShowSnackback(false);
              }
              if (screen) {
                navigation.navigate(screen);
              }
            },
          }}
          // duration={2000}
        >
          {message}
        </Snackbar>
      </View>
    </>
  );
}
