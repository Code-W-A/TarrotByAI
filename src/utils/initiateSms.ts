import * as SMS from "expo-sms";
import i18n from "../../i18n";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { screenName } from "./screenName";

export const handleSMSReminder = (values, isProMember, navigation?) => {
  // if (isProMember) {
  Alert.alert(
    `${i18n.translate("doYouWantToSendSMSReminder")} ${
      values.patientInfo.basicInfoData.firstName
    } ${values.patientInfo.basicInfoData.lastName}?`,
    `${values.patientInfo.basicInfoData.firstName} ${values.patientInfo.basicInfoData.lastName} will get a reminder for the appointment on ${values.daySelected} between ${values.timeSelected.starttime} and ${values.timeSelected.endtime}`,
    [
      {
        text: i18n.translate("cancel"),
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: i18n.translate("sendReminder"),
        onPress: () => initiateSMSReminder(values),
      },
    ]
  );
  // } else {
  //   navigation.navigate(screenName.Subscription);
  // }
};

export const initiateSMSAppointmentCancelNotification = async (
  selectedDay,
  startTime,
  endTime,
  phoneNumber,
  doctorFirstName,
  doctorLastName
) => {
  const bodySMS = `${i18n.translate(
    "txt1Unreg"
  )} ${doctorFirstName} ${doctorLastName} ${i18n.translate(
    "txt2Unreg"
  )} ${selectedDay} ${i18n.translate(
    "txt3Unreg"
  )} ${startTime} ${i18n.translate("txt4Unreg")} ${endTime} ${i18n.translate(
    "txt6Unreg"
  )}`;
  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    console.log(bodySMS);
    // do your SMS stuff here
    const { result } = await SMS.sendSMSAsync(
      [`${phoneNumber}`],
      bodySMS
      // {
      //   attachments: {
      //     uri: 'path/myfile.png',
      //     mimeType: 'image/png',
      //     filename: 'myfile.png',
      //   },
      // }
    );
  } else {
    // misfortune... there's no SMS available on this device

    console.log("misfortune... there's no SMS available on this device");
  }
};

export const initiateSMSReminder = async (values) => {
  const bodySMS = `${i18n.translate("txt1")}, ${
    values.patientInfo.basicInfoData.firstName
  } ${values.patientInfo.basicInfoData.lastnName}! ${i18n.translate("txt2")} ${
    values.daySelected
  }, ${i18n.translate("txt3")} ${
    values.timeSelected.starttime
  } ${i18n.translate("txt4")} ${values.timeSelected.endtime}. ${i18n.translate(
    "txt5"
  )}`;
  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    console.log(bodySMS);
    // do your SMS stuff here
    const { result } = await SMS.sendSMSAsync(
      [`${values.phoneNumber}`],
      bodySMS
      // {
      //   attachments: {
      //     uri: 'path/myfile.png',
      //     mimeType: 'image/png',
      //     filename: 'myfile.png',
      //   },
      // }
    );
  } else {
    // misfortune... there's no SMS available on this device

    console.log("misfortune... there's no SMS available on this device");
  }
};

export const initiateSMSAppointmentConfirmedNotification = async (
  selectedDay,
  startTime,
  endTime,
  phoneNumber,
  doctorFirstName,
  doctorLastName
) => {
  const bodySMS = `${i18n.translate(
    "txt1Unreg"
  )} ${doctorFirstName} ${doctorLastName} ${i18n.translate(
    "txt2Unreg"
  )} ${selectedDay} ${i18n.translate(
    "txt3Unreg"
  )} ${startTime} ${i18n.translate("txt4Unreg")} ${endTime} ${i18n.translate(
    "txt5Unreg"
  )}`;
  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    console.log(bodySMS);
    // do your SMS stuff here
    const { result } = await SMS.sendSMSAsync(
      [`${phoneNumber}`],
      bodySMS
      // {
      //   attachments: {
      //     uri: 'path/myfile.png',
      //     mimeType: 'image/png',
      //     filename: 'myfile.png',
      //   },
      // }
    );
  } else {
    // misfortune... there's no SMS available on this device

    console.log("misfortune... there's no SMS available on this device");
  }
};

export const initiateSMSDeleteDoctor = async (
  phoneNumbers,
  doctorFirstName,
  doctorLastName
) => {
  const bodySMS = `${i18n.translate(
    "txt1InitiateSMSDeleteDoctor"
  )} ${doctorFirstName} ${doctorLastName} ${i18n.translate(
    "txt2InitiateSMSDeleteDoctor"
  )}.`;
  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    console.log(bodySMS);
    // do your SMS stuff here
    const { result } = await SMS.sendSMSAsync(
      [`${phoneNumbers.toString()}`],
      bodySMS
      // {
      //   attachments: {
      //     uri: 'path/myfile.png',
      //     mimeType: 'image/png',
      //     filename: 'myfile.png',
      //   },
      // }
    );
  } else {
    // misfortune... there's no SMS available on this device

    console.log("misfortune... there's no SMS available on this device");
  }
};
