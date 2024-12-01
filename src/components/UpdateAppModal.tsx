import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Modal, Portal, Button, Text } from 'react-native-paper';

export const UpdateModal = () => {
  const [visible, setVisible] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    // Retrieve last update time from AsyncStorage on initial load
    getLastUpdateTimeFromStorage();
  }, []);

  const getLastUpdateTimeFromStorage = async () => {
    try {
      const lastUpdateTime = await AsyncStorage.getItem('lastUpdateTime');
      setLastUpdateTime(lastUpdateTime ? Number(lastUpdateTime) : null);
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
    }
  };

  const checkUpdateStatus = () => {
    const currentTime = Date.now();

    // If last update time is not set or it's been more than a week, show the modal
    if (!lastUpdateTime || currentTime - lastUpdateTime > 7 * 24 * 60 * 60 * 1000) {
      console.log("YESSS")
      setVisible(true);
    }
  };

  const handleUpdate = async () => {
    // Save the current time as the last update time in AsyncStorage and state
    const currentTime = Date.now();
    try {
      await AsyncStorage.setItem('lastUpdateTime', currentTime.toString());
      setLastUpdateTime(currentTime);
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }

    // For demonstration purposes, we will just close the modal here:
    setVisible(false);
  };

  // Call the checkUpdateStatus function to determine if the modal should be shown
  useEffect(() => {
    checkUpdateStatus();
  }, [lastUpdateTime]);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={() => setVisible(false)}>
        <View style={{ backgroundColor: 'white', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Update the app for the latest features!</Text>
          <Button mode="contained" onPress={handleUpdate}>Update</Button>
        </View>
      </Modal>
    </Portal>
  );
};
