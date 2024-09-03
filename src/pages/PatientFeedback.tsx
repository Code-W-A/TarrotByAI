import React, { useEffect, useState } from "react";
import {
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Linking,
} from "react-native";

import * as Yup from "yup";

import { CardSurface } from "../components/commonViews";
import {
  H30fontRegularLightBlack2,
  H14fontRegularWhite,
  H8fontMediumBlack,
  H8fontMediumLightBlack,
  H14fontRegularBlack,
  H7fontMediumBlack,
  H9fontRegularGray,
} from "../components/commonText";
import { colors } from "../utils/colors";
import { pl10, pl15 } from "../common/commonStyles";
import { Snackbar, Text } from "react-native-paper";
import { NavBarPatient } from "../common/commonComponents";

import { feedbackData } from "../utils/constant";
import { Dropdown } from "react-native-element-dropdown";
import { uploadFeedback } from "../utils/UploadFirebaseData";
import i18n from "../../i18n";

interface Props {
  handleAddSubmit?: any;
  title?: any;
}

interface MyFormValues {
  description: string;
}

const PatientFeedback: React.FC<Props> = ({ title }): JSX.Element => {
  const [isFocus, setIsFocus] = useState(false);
  const [showSnackBar, setShowSnackback] = useState(false);
  const [value, setValue] = useState("");

  const validationSchema = Yup.object().shape({
    description: Yup.string()
      .required("Please describe your issue")
      .min(10, "Description has to have at least 10 characters")
      .max(699, "Description has to have a maximum of 700 characters")
      .label("description"),
    subject: Yup.string().required("Please select a subject").label("subject"),
    email: Yup.string()
      .email("Please provide a valid e-mail address")
      .required("Please provide an email")
      .label("email"),
  });

  const initialValues: MyFormValues = {
    description: "",
  };

  useEffect(() => {}, []);

  const handleAddSubmit = async (values) => {
    const uploadSuccess = await uploadFeedback("patient", values);
    if (uploadSuccess) {
      setShowSnackback(uploadSuccess);
    }
  };

  return (
    <>
      <NavBarPatient
        title={i18n.translate("feedback")}
        navHeight={80}
        isPatient={true}
        isTermsAccepted={true}
        isGoBack={true}
      />
      <ScrollView></ScrollView>
      <View
        style={{
          position: "absolute",
          width: 300,
          height: 100,
          bottom: "2%",
          left: "10%",
        }}
      >
        <Snackbar
          visible={showSnackBar}
          onDismiss={() => setShowSnackback(false)}
          action={{
            label: "🤝",
            onPress: () => {
              // Do something
            },
          }}
          duration={2000}
        >
          Feedback sent successfully!
        </Snackbar>
      </View>
    </>
  );
};
export default PatientFeedback;
const styles = StyleSheet.create({
  dropDownStyle: {
    width: Dimensions.get("window").width / 1.2,
    borderColor: "#CFCFCF",
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 5,
    // marginBottom: 10,
    backgroundColor: "#CFCFCF",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdown: {
    paddingLeft: 10,
    backgroundColor: "#FFF",
  },
  nextButtonStyle: {
    height: 45,
    backgroundColor: "#1B5A90",
    marginTop: 20,
    // marginBottom: 10,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  textBoxContainerStyle: {
    height: 250,
    borderColor: colors.borderTextColor,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 10,
    // marginBottom: 10,
  },
  emailBoxContainerStyle: {
    // height: 350,
    borderColor: colors.borderTextColor,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 10,
    // marginBottom: 10,
  },
  msgStyle: {
    marginTop: 10,
  },
  bodyStyle: { paddingHorizontal: 10 },
  container: { marginHorizontal: 10 },
});
