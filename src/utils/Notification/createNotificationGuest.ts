import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import moment from "moment";
import { Platform } from "react-native";
import i18n, { getTimeZoneFromPhoneSettings } from "../../../i18n";

// Function to create a notification
export const createNotification = async (appointment) => {
  try {
    let timeZone = await getTimeZoneFromPhoneSettings();

    const now = moment().tz(timeZone).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";

    console.log("Start...create appointment");
    const { daySelected, timeSelected, appointmentId, doctorData } =
      appointment;
    console.log(daySelected);
    console.log(timeSelected);
    console.log(timeSelected.starttime);

    //Doctor Name
    const doctorName = `${doctorData.doctorInfoData.firstname} ${doctorData.doctorInfoData.lastname}`;

    // Calculate notification dates and times
    const notificationDate = moment.utc(daySelected, "DD-MM-YYYY");
    // ---- COMMENTED OUT BECAUSE NOTIFICATION SHOWS 1 DAY BEFORE THE REAL NOTIFICATION ----
    // const notificationDate = moment
    //   .utc(daySelected, "DD-MM-YYYY")
    //   .subtract(1, "day");
    const notificationTime = moment.utc(timeSelected.starttime, "HH:mm");
    const notificationDateTime = moment.utc(
      `${daySelected} ${timeSelected.starttime}`,
      "DD-MM-YYYY HH:mm"
    );
    console.log("notificationDateTime.......");
    console.log(daySelected);
    console.log(timeSelected.starttime);
    console.log(notificationDateTime);
    const notification24HoursBefore = moment
      .utc(notificationDateTime)
      .subtract(24, "hours");
    const notification3HourBefore = moment
      .utc(notificationDateTime)
      .subtract(3, "hour");

    // Create notification messages
    const oneDayBeforeMessage = `${i18n.translate(
      "oneDayNotificationTxt1"
    )} ${doctorName} ${i18n.translate(
      "oneDayNotificationTxt2"
    )} ${notificationDate.format("DD-MM-YYYY")} ${i18n.translate(
      "oneDayNotificationTxt3"
    )} ${notificationTime.format("HH:mm")}`;
    const threeHourBeforeMessage = `${i18n.translate(
      "threeHourNotificationTxt1"
    )} ${doctorName} ${i18n.translate(
      "threeHourNotificationTxt2"
    )} ${notificationTime.format("HH:mm")}`;
    console.log(oneDayBeforeMessage);
    console.log(notification24HoursBefore);
    console.log(notification24HoursBefore.diff(now, "seconds"));
    console.log(threeHourBeforeMessage);
    console.log(notification3HourBefore);
    console.log(notification3HourBefore.diff(now, "seconds"));

    // Check if notification is already scheduled
    const isNotificationScheduled = await isNotificationAlreadyScheduled(
      appointmentId
    );

    if (!isNotificationScheduled) {
      // Schedule the notifications
      await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.translate("appointmentReminder"),
          body: oneDayBeforeMessage,
          data: { appointmentId },
        },
        trigger: {
          seconds: notification24HoursBefore.diff(now, "seconds"),
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.translate("appointmentReminder"),
          body: threeHourBeforeMessage,
          data: { appointmentId },
        },
        trigger: {
          seconds: notification3HourBefore.diff(now, "seconds"),
        },
      });
    } else {
      console.log("already scheduled......NOT notifing.....");
    }
  } catch (err) {
    console.log("Error setting notification:", err);
  }
};

// Function to check if a notification is already scheduled
const isNotificationAlreadyScheduled = async (appointmentId) => {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    console.log("Test bhere...------------------");
    // console.log(scheduledNotifications[0].content.data);
    console.log(scheduledNotifications.length);
    console.log(scheduledNotifications[0]);
    return scheduledNotifications.some(
      (notification) =>
        notification.content.data?.appointmentId === appointmentId
    );
  } catch (err) {
    console.log("Error checking scheduled notification:", err);
    return false;
  }
};

// // Function to store the scheduled notification IDs
// const storeScheduledNotification = async (appointmentId, notificationIds) => {
//     try {
//       const serializedNotificationIds = JSON.stringify(notificationIds);
//       await AsyncStorage.setItem(appointmentId.toString(), serializedNotificationIds);
//     } catch (err) {
//       console.log('Error storing scheduled notification:', err);
//     }
//   };

// // Example usage to remove completed appointments
// const removeCompletedAppointmentsFromStorage = async (completedAppointments) => {
//   try {
//     const keys = await AsyncStorage.getAllKeys();
//     await AsyncStorage.multiRemove(keys.filter(key => completedAppointments.includes(key)));
//   } catch (err) {
//     console.log('Error removing completed appointments:', err);
//   }
// };

// // Example usage to remove completed appointments
// const completedAppointments = ['appointment1', 'appointment2'];
// removeCompletedAppointmentsFromStorage(completedAppointments);
