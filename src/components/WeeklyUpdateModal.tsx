import React, { useEffect, useState } from "react";
import { View, Text, Modal } from "react-native";
import { Button } from "react-native-paper";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WeeklyUpdateModal = () => {
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const checkAndUpdateReminder = async () => {
      // Fetch the last reminder date from storage
      try {
        const lastReminderDate = await AsyncStorage.getItem("lastReminderDate");
        if (lastReminderDate) {
          const currentDate = new Date();
          const timeDifference =
            currentDate.getTime() - new Date(lastReminderDate).getTime();
          const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

          if (timeDifference >= weekInMilliseconds) {
            setModalVisible(true);
            // Store the current date as the new last reminder date
            await AsyncStorage.setItem(
              "lastReminderDate",
              currentDate.toISOString()
            );
          }
        } else {
          // No previous reminder found, set the current date as the last reminder date
          const currentDate = new Date();
          await AsyncStorage.setItem(
            "lastReminderDate",
            currentDate.toISOString()
          );
        }
      } catch (error) {
        console.log("Error fetching or storing reminder date:", error);
      }
    };

    checkAndUpdateReminder();
  }, []);

  const handleUpdateApp = () => {
    Linking.openURL("https://www.example.com/update");
    setModalVisible(false);
  };

  return (
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ backgroundColor: "#fff", padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Update Available
          </Text>
          <Text style={{ marginBottom: 20 }}>
            Please update the app to access new features.
          </Text>
          <Button
            mode="contained"
            onPress={handleUpdateApp}
            style={{ backgroundColor: "#007bff" }}
          >
            Update Now
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default WeeklyUpdateModal;
