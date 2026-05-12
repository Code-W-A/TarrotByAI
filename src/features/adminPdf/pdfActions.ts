import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import { Platform } from "react-native";
import { getFunctions, httpsCallable } from "firebase/functions";

import { sendPdfEmail } from "../../utils/constant";

const sanitizeFileName = (value: string): string => {
  if (!value) {
    return "RaportAnaliza";
  }

  return value.replace(/[\\/:*?"<>|]+/g, "_").trim() || "RaportAnaliza";
};

export const sendPdfByEmail = async (
  email: string,
  html: string,
  fullName: string
) => {
  const functions = getFunctions();
  const sendPdfEmailFn = httpsCallable(functions, sendPdfEmail);

  const response = await sendPdfEmailFn({
    email,
    pdfHtml: html,
    fullName,
  });

  return response?.data;
};

export const generateLocalPdfAndShare = async (
  html: string,
  fileName: string
) => {
  const safeFileName = sanitizeFileName(fileName);
  const { uri } = await Print.printToFileAsync({ html });

  if (Platform.OS === "android") {
    if (Platform.Version < 29) {
      const destination = `${FileSystem.documentDirectory}${safeFileName}.pdf`;
      await FileSystem.copyAsync({ from: uri, to: destination });
      return { sourceUri: uri, savedUri: destination };
    }

    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
      throw new Error("Permisiunea pentru salvarea PDF-ului a fost refuzata.");
    }

    const directoryUri = permissions.directoryUri;
    const base64Content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const createdFileUri = await StorageAccessFramework.createFileAsync(
      directoryUri,
      `${safeFileName}.pdf`,
      "application/pdf"
    );

    await FileSystem.writeAsStringAsync(createdFileUri, base64Content, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return { sourceUri: uri, savedUri: createdFileUri };
  }

  await Sharing.shareAsync(uri, {
    dialogTitle: "Salveaza sau distribuie PDF-ul",
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
  });

  return { sourceUri: uri, savedUri: uri };
};
