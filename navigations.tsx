import React, { Component, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { screenName } from "./src/utils/screenName";

import DashBoardScreen from "./src/pages/dashboard";

import DoctorProfile from "./src/pages/doctors/doctorProfile";
import DoctorOverView from "./src/pages/doctors/doctorOverview";
import LocationView from "./src/pages/doctors/location";
import Reviews from "./src/pages/doctors/reviews";
import HoursView from "./src/pages/doctors/hours";

import PatientOverView from "./src/pages/patients/overView";
import MyPatient from "./src/pages/doctors/myPatient";
import DoctorDashBoard from "./src/pages/doctors/doctorDashboard";
import CircularProgress from "./src/components/circularProgress";
import InvoiceList from "./src/pages/invoiceList";
import InvoiceView from "./src/pages/invoiceView";

import NotificationScreen from "./src/pages/notifications";
import Pages from "./src/pages/pages";
import SearchDoctor from "./src/pages/showAllDoctorsLinked";
import SocialMedia from "./src/pages/socialMedia";

import ScheduleTimings from "./src/pages/doctors/scheduleTimings";

import OnboardingScreen from "./src/pages/OnboardingScreen";
// import SignInScreenClinic from './src/pages/SignInScreenClinic';
// import SignUpScreenClinic from './src/pages/SignUpScreenClinic';
// import SignUpScreenPatient from './src/pages/SignUpScreenPatient';
// import SignInScreenPatient from './src/pages/SignInScreenPatient';
import SignInScreenClinic from "./src/pages/signInScreenClinic";
import SignUpScreenClinic from "./src/pages/signUpScreenClinic";
import SignUpScreenPatient from "./src/pages/signUpScreenPatient";
import SignInScreenPatient from "./src/pages/signInScreenPatient";

import ForgotPasswordClinic from "./src/pages/forgotPasswordClinic";
import ForgotPasswordPatient from "./src/pages/forgotPasswordPatient";

import ChangePasswordPatient from "./src/pages/changePasswordPatient";
import ClinicCalendar from "./src/pages/doctors/clinicCalendar";

import ProfileSettingsPatient from "./src/pages/profileSettingsPatient";

import Checkout from "./src/pages/checkout";

import clinicAppointments from "./src/pages/doctors/appointmentsClinic";

import PatientCalendarTime from "./src/pages/PatientCalendarTime";
import ClinicAppointmentsDay from "./src/pages/doctors/appointmentsClinicDay";
import TermsConditionsClinic from "./src/pages/doctors/TermsConditionsClinic";

import BookingCanceledClinic from "./src/pages/doctors/bookingCanceledClinic";
import DoctorProfileSettings from "./src/pages/doctors/DoctorProfileSettings";
import ClinicDashboard from "./src/pages/doctors/ClinicDashboard";
import ClinicDoctors from "./src/pages/doctors/ClinicDoctors";
import DoctorScheduleTimings from "./src/pages/doctors/DoctorScheduleTimings";
import DoctorCalendarTime from "./src/pages/doctors/DoctorCalendarTime";
import PatientSearchDashboard from "./src/pages/patients/PatientSearchDashboard";

import ShowAllDoctorsLinked from "./src/pages/showAllDoctorsLinked";

import ClinicProfile from "./src/pages/doctors/ClinicProfile";
import PatientFeedback from "./src/pages/PatientFeedback";
import ClinicFeedback from "./src/pages/doctors/ClinicFeedback";
import ChangePhoneClinic from "./src/pages/doctors/changePhoneClinic";

import { SettingsPage } from "./src/pages/SettingsPage";

import PaywallScreen from "./src/pages/PaywallScreen/PawywallScreen";
import PatientInformation from "./src/pages/PatientInformation";

import { ErrorView } from "./src/components/ErrorView";
// import Bugsnag from "@bugsnag/expo";

import GuestPhoneInputModal from "./src/components/GuestPhoneInputModal";
import Dashboard2 from "./src/pages/doctors/Dashboard2";

import NavBarBottom from "./src/components/Navbar";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import TarrotSettings from "./src/pages/TarrotSettings";
import { authentication } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import HistoryTarrot from "./src/pages/HistoryTarrot";
import LanguageSelectScreen from "./src/pages/LangueageSelect";
import { useAuth } from "./src/context/AuthContext";
import LuckyColor from "./src/pages/LuckyColorComponent/LuckyColorComponent";
import {
  NavBarVisibilityProvider,
  useNavBarVisibility,
} from "./src/context/NavbarVisibilityContext";
import LuckyNumberColor from "./src/pages/LuckyNumberComponent/LuckyNumberComponent";
import PersonalReadingDashboard from "./src/pages/doctors/PeronalReadingDashboard";
import PersonalizedReading from "./src/pages/PersonalizedReading/PersonalizedReading";
import FutureReadingDashboard from "./src/pages/doctors/FutureReadingDashboard";
import FutureReading from "./src/pages/FutureReading/FutureReading";
import LuckyHour from "./src/pages/LuckyHourComponent/LuckyHourComponent";
import MotivationalQuotes from "./src/pages/MotivationalQuotesComponent/MotivationalQuotes";
import LuckyNumber from "./src/pages/LuckyNumberComponent/LuckyNumberComponent";
import News from "./src/pages/blog/News";
import SavedNews from "./src/pages/blog/SavedNews";
import CeSimte from "./src/pages/doctors/CeSimte";
import CeGandeste from "./src/pages/doctors/CeGandeste";
import CarteaTa from "./src/pages/doctors/CarteaTa";
import EnergiaDinRelatie from "./src/pages/doctors/EnergiaDinRelatie";
import ViitorulApropiat from "./src/pages/doctors/ViitorulApropiat";
import EcranAfirmatii from "./src/pages/EcranAfirmatii/EcranAfirmatii";
import AfirmatiiPozitive from "./src/pages/AfirmatiiPozitive/AfirmatiiPozitive";
import NameScreen from "./src/pages/astral/initials/name.screen";
import LearnScreen from "./src/pages/astral/initials/learn.screen";
import AstrogramaNatala from "./src/pages/astral/initials/AstrogramaNatala";
import HoroscopZilnic from "./src/pages/astral/initials/HoroscopZilnic";
// import BirthDateScreen from "./src/pages/astral/initials/birth-date.screen";
// import RelationshipScreen from "./src/pages/astral/initials/relationship.screen";
// import SexScreen from "./src/pages/astral/initials/sex.screen";
// import NumberScreen from "./src/pages/astral/initials/number.screen";
// import LoadingScreen from "./src/pages/astral/initials/loading.screen";

const Stack = createNativeStackNavigator();

interface NavigationProps {
  initialRouteName: string;
}

const HomeNavigation = (props: NavigationProps) => {
  const { currentUser, isGuestUser } = useAuth();
  const [isUser, setIsUser] = useState(false);
  const { isNavBarVisible } = useNavBarVisibility();
  onAuthStateChanged(authentication, (user) => {
    if (user) {
      // User is signed in, you can use the 'user' object to get user information
      // console.log("User is authenticated:", user);
      setIsUser(true);
    } else {
      // No user is signed in.
      setIsUser(false);
      console.log("User is not authenticated");
    }
  });
  return (
    <LinearGradient
      colors={["#000000", "#434343"]} // Înlocuiește cu culorile gradientului tău
      style={styles.container}
    >
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={props.initialRouteName}
      >
        <Stack.Screen
          name={screenName.OnboardingScreen}
          component={OnboardingScreen}
        />
        <Stack.Screen
          name={screenName.languageSelectScreen}
          component={LanguageSelectScreen}
        />

        <Stack.Screen
          name={screenName.PersonalizedReading}
          component={PersonalizedReading}
        />
        <Stack.Screen
          name={screenName.FutureReading}
          component={FutureReading}
        />
        <Stack.Screen
          name={screenName.FutureReadingDashboard}
          component={FutureReadingDashboard}
        />
        <Stack.Screen
          name={screenName.SignInScreenClinic}
          component={SignInScreenClinic}
        />
        <Stack.Screen
          name={screenName.SignUpScreenClinic}
          component={SignUpScreenClinic}
        />

        <Stack.Screen
          name={screenName.motivationalQuotes}
          component={MotivationalQuotes}
        />
        <Stack.Screen name={screenName.luckyHour} component={LuckyHour} />
        <Stack.Screen name={screenName.luckyColor} component={LuckyColor} />
        <Stack.Screen name={screenName.luckyNumber} component={LuckyNumber} />

        <Stack.Screen name={"TarrotSettings"} component={TarrotSettings} />
        <Stack.Screen name={"News"} component={News} />
        <Stack.Screen name={"SavedNews"} component={SavedNews} />

        <Stack.Screen
          name={screenName.ForgotPasswordClinic}
          component={ForgotPasswordClinic}
        />

        <Stack.Screen
          name={screenName.DashBoardScreen}
          component={DashBoardScreen}
        />

        <Stack.Screen
          name={screenName.Subscription}
          component={PaywallScreen}
        />

        <Stack.Screen
          name={screenName.ClinicDashBoard}
          component={ClinicDashboard}
        />
        <Stack.Screen
          name={screenName.termConditionsClinic}
          component={TermsConditionsClinic}
        />

        <Stack.Screen name="Dashboard2" component={Dashboard2} />
        <Stack.Screen
          name={screenName.PersonalReadingDashboard}
          component={PersonalReadingDashboard}
        />
        <Stack.Screen name={"CeSimte"} component={CeSimte} />
        <Stack.Screen name={"CeGandeste"} component={CeGandeste} />
        <Stack.Screen name={"CarteaTa"} component={CarteaTa} />
        <Stack.Screen
          name={"EnergiaDinRelație"}
          component={EnergiaDinRelatie}
        />

        <Stack.Screen name={"ViitorApropiat"} component={ViitorulApropiat} />
        <Stack.Screen name={"EcranAfirmatii"} component={EcranAfirmatii} />
        <Stack.Screen
          name={"AfirmatiiPozitive"}
          component={AfirmatiiPozitive}
        />

        <Stack.Screen
          name={screenName.historyTarrot}
          component={HistoryTarrot}
        />
        <Stack.Screen name={"Astral"} component={NameScreen} />

        <Stack.Screen
          name="Name"
          component={NameScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Learn"
          component={LearnScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AstrogramaNatala"
          component={AstrogramaNatala}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Horoscop"
          component={HoroscopZilnic}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name="BirthDate"
          component={BirthDateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Sex"
          component={SexScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Relationship"
          component={RelationshipScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Number"
          component={NumberScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ headerShown: false }}
        /> */}

        {/* <Stack.Screen name={screenName.VoiceCall} component={VoiceCall} /> */}
        {/* <Stack.Screen name={screenName.VideoCall} component={VideoCall} /> */}
      </Stack.Navigator>
      {(isUser && isNavBarVisible) || (isGuestUser && isNavBarVisible) ? (
        <NavBarBottom />
      ) : null}
    </LinearGradient>
  );
};

const RootNavigation = () => {
  const { currentUser, isGuestUser } = useAuth();
  const screen = isGuestUser
    ? screenName.ClinicDashBoard
    : currentUser
    ? screenName.SignInScreenClinic
    : screenName.OnboardingScreen;
  // const screen = screenName.astralProfileScreen;

  return <HomeNavigation initialRouteName={screen} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
  },
});

export default RootNavigation;
