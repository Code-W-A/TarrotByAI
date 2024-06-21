import { screenName } from "./screenName";

import { colors } from "./colors";
import i18n from "../../i18n";

export const dayOptions = [
  { name: "Mo", no: 10 },
  { name: "Tu", no: 11 },
  { name: "We", no: 12 },
  { name: "Th", no: 13 },
  { name: "Fr", no: 14 },
  { name: "Sa", no: 15 },
  { name: "Su", no: 16 },
];

//schedule timings
export const days = [
  {
    name: "Sun",
    translated: "sun",
    nr: 0,
    timeSlot: "Time Slots - Sunday",
    translatedTimeSlot: "timeSlotsSunday",
    timeSlotsPack: [],
  },
  {
    name: "Mon",
    translated: "mon",
    nr: 1,
    timeSlot: "Time Slots - Monday",
    translatedTimeSlot: "timeSlotsMonday",
    timeSlotsPack: [],
  },
  {
    name: "Tue",
    translated: "tue",
    nr: 2,
    timeSlot: "Time Slots - Tuesday",
    translatedTimeSlot: "timeSlotsTuesday",
    timeSlotsPack: [],
  },
  {
    name: "Wed",
    translated: "wed",
    nr: 3,
    timeSlot: "Time Slots - Wednesday",
    translatedTimeSlot: "timeSlotsWednesday",
    timeSlotsPack: [],
  },
  {
    name: "Thu",
    translated: "thu",
    nr: 4,
    timeSlot: "Time Slots - Thursday",
    translatedTimeSlot: "timeSlotsThursday",
    timeSlotsPack: [],
  },
  {
    name: "Fri",
    translated: "fri",
    nr: 5,
    timeSlot: "Time Slots - Friday",
    translatedTimeSlot: "timeSlotsFriday",
    timeSlotsPack: [],
  },
  {
    name: "Sat",
    translated: "sat",
    nr: 6,
    timeSlot: "Time Slots - Saturday",
    translatedTimeSlot: "timeSlotsSaturday",
    timeSlotsPack: [],
  },
];

//doctor profile
// export const segments = [i18n.translate("Overview"), i18n.translate("Location"), i18n.translate("Reviews")];
export const segments = [
  i18n.translate("Overview"),
  i18n.translate("Location"),
  i18n.translate("Reviews"),
];

//location

//patient appointment
// export const segment = [
//   'Appointments',
//   'Prescriptions',
//   'Medical Records',
//   'Billing',
// ];
export const segment = [
  "Appointments",
  "Patients",
  "Medical Records",
  // 'Billing',
];

//patient profile
export const patientsegments = [
  "OverView",
  "Appointments",
  "Prescriptions",
  "Medical Records",
  "Billing",
];

export const myProfilePatientSegments = [
  i18n.translate("Overview"),
  i18n.translate("upcomingAppointments"),
  i18n.translate("pastAppointments"),
];

//basic info
export const data = [
  { label: i18n.translate("male"), value: "1" },
  { label: i18n.translate("female"), value: "2" },
];

export const feedbackData = [
  { label: i18n.translate("newFunctionality"), value: "1" },
  { label: i18n.translate("problems"), value: "2" },
  { label: i18n.translate("suggestions"), value: "3" },
  { label: i18n.translate("others"), value: "4" },
];

//book appointment
export const tab = [
  { name: "Time and Date" },
  { name: "Checkout" },
  { name: "Payment" },
];

//chatList

//dashboard

//invoice view
export const tableHead = ["Description", "Quantity", "VAT", "Total"];
export const tableTitle = ["General Consultation ", "1", "$0", "$100"];
export const tableData = ["Video Call Booking ", "1", "$0", "$520"];

//pages
export const menuBarOptions = [
  { name: "Search Doctor", screenName: screenName.SearchDoctor },
  { name: "Doctor Dashboard", screenName: screenName.DoctorDashBoard },
  { name: "Doctor Profile", screenName: screenName.DoctorProfile },
  { name: "Doctor Schedule Timings", screenName: screenName.ScheduleTimings },
  { name: "favourites", screenName: screenName.FavouritesScreen },
  { name: "Profile Settings", screenName: screenName.ProfileSettings },
  { name: "Appointments", screenName: screenName.PatientAppointments },
  { name: "Patient profile Settings", screenName: screenName.ProfileSettings },
  { name: "Patients List", screenName: screenName.MyPatient },
  { name: "Patient Profile", screenName: screenName.PatientProfile },
  { name: "Patient Date Time", screenName: screenName.BookAppointment },
  { name: "Booking Success", screenName: screenName.BookingSuccess },
  { name: "invoices", screenName: screenName.InvoiceList },
  { name: "Invoice View", screenName: screenName.InvoiceView },
  { name: "Chat", screenName: screenName.ChatList },
  { name: "Chat View", screenName: screenName.ChatView },
  { name: "Voice Call", screenName: screenName.VoiceCall },
  { name: "Video Call", screenName: screenName.VideoCall },
];

export const menuOptionsAuth = [
  { name: "Login", screenName: screenName.SignInScreenClinic },
  { name: "Register", screenName: screenName.SignUpScreenClinic },
  { name: "Forgot Password", screenName: screenName.ForgotPassword },
  { name: "Change Password", screenName: screenName.ChangePassword },
];

//Doctor profile settings
export const doctorprofilesegments = [
  i18n.translate("basicInfoDoctor"),
  i18n.translate("ScheduleTimingsDoctor"),
  // 'Clinic Info',
  // 'About Me',
  // 'Contact Details',
  // 'Pricing & Services',
  // 'Education & Experience',
  // 'Awards & Memberships',
  // 'Registrations',
];

//Clinic profile settings
export const clinicprofilesegments = [
  i18n.translate("clinicInfo"),
  i18n.translate("aboutClinic"),
  i18n.translate("contactDetails"),
  // 'Basic Info',
  // 'Pricing & Services',
  // 'Education & Experience',
  // 'Awards & Memberships',
  // 'Registrations',
];

export const profilesegmentsPatient = [
  "Basic Info",
  // 'About Me',
  // 'Clinic Info',
  // 'Contact Details',
  // 'Pricing & Services',
  // 'Education & Experience',
  // 'Awards & Memberships',
  // 'Registrations',
];

//search doctor

//social media

export const genderOptions = [
  { name: "Male", type: "m", isSelected: false },
  { name: "Fem...", type: "f", isSelected: false },
];

export const specialistOptions = [
  { name: "Urology", isSelected: false },
  { name: "Cardiology", isSelected: false },
  { name: "Dentist", isSelected: false },
  { name: "Neurology", isSelected: false },
  { name: "Orthologist", isSelected: false },
  { name: "Gynaecology", isSelected: false },
];

export const patientSettingsSections = [
  {
    header: i18n.translate("preferences"),
    icon: "settings",
    items: [
      {
        icon: "perm-contact-calendar",
        color: "#24788F",
        label: i18n.translate("profileSettings"),
        screenName: screenName.ProfileSettingsPatient,
        type: "link",
      },
      // { icon: 'star', color: '#007afe', label: ,screenName: screenName.Subscription, type: 'link' },
      // { icon: 'alarm', color: '#0c0c0c', label: 'Notifications (Coming soon 🆕)', screenName: screenName.UserSettingsPatient , type: 'link' },
      {
        icon: "email",
        color: "#fe9400",
        label: i18n.translate("changeEmail"),
        screenName: screenName.ChangeEmailPatient,
        type: "link",
      },
      {
        icon: "lock-open",
        color: colors.facebook,
        label: i18n.translate("changePassword"),
        screenName: screenName.ChangePasswordPatient,
        type: "link",
      },
      {
        icon: "phone",
        color: "#32c759",
        label: i18n.translate("changePhoneNumber"),
        screenName: screenName.ChangePhonePatient,
        type: "link",
      },
      {
        icon: "trash-outline",
        color: "red",
        label: i18n.translate("deleteAccount"),
        screenName: "deleteAccount",
        type: "link",
      },
    ],
  },
  {
    header: i18n.translate("help"),
    icon: "help-circle",
    items: [
      {
        icon: "feedback",
        color: "#8e8d91",
        label: i18n.translate("feedbackContact"),
        screenName: screenName.Feedback,
        type: "link",
      },
      {
        icon: "document-text-outline",
        color: "#007afe",
        screenName: screenName.termConditionsPatients,
        label: i18n.translate("tcMessage"),
        type: "link",
      },
    ],
  },
];

export const clinicSettingsSections = [
  {
    header: i18n.translate("preferences"),
    icon: "settings",
    items: [
      // { icon: 'alarm', color: '#0c0c0c', label: 'Notifications', screenName: screenName.UserSettingsPatient , type: 'link' },
      {
        icon: "email",
        color: "#fe9400",
        label: i18n.translate("changeEmail"),
        screenName: screenName.ChangeEmailClinic,
        type: "link",
      },
      {
        icon: "lock-open",
        color: colors.facebook,
        label: i18n.translate("changePassword"),
        screenName: screenName.ChangePasswordClinic,
        type: "link",
      },
      {
        icon: "phone",
        color: "#32c759",
        label: i18n.translate("changePhoneNumber"),
        screenName: screenName.ChangePhoneClinic,
        type: "link",
      },
      {
        icon: "trash-outline",
        color: "red",
        label: i18n.translate("deleteAccount"),
        screenName: "deleteAccount",
        type: "link",
      },

      {
        icon: "logout",
        color: "red",
        label: i18n.translate("logOut"),
        screenName: screenName.SignInScreenClinic,
        type: "signout",
      },
    ],
  },
  // {
  //   header: i18n.translate("help"),
  //   icon: "help-circle",
  //   items: [
  //     {
  //       icon: "feedback",
  //       color: "#8e8d91",
  //       label: i18n.translate("feedbackContact"),
  //       screenName: screenName.ClinicFeedback,
  //       type: "link",
  //     },
  //     {
  //       icon: "document-text-outline",
  //       color: "#007afe",
  //       screenName: screenName.termConditionsClinic,
  //       label: i18n.translate("tcMessage"),
  //       type: "link",
  //     },
  //   ],
  // },
];

export const specialistList = [
  {
    id: 1,
    name: "Urology",
  },
  {
    id: 2,
    name: "Cardiology",
  },
  {
    id: 3,
    name: "Dentist",
  },
  {
    id: 4,
    name: "Neurology",
  },
  {
    id: 5,
    name: "Orthologist",
  },
  {
    id: 6,
    name: "Gynaecology",
  },
];

export const dateFormats = {
  sender: "YYYY-MM-DD",
  reciever: "DD-MM-YYYY",
};

export const sidemenuDetails = [
  {
    name: i18n.translate("myClinic"),
    screenName: screenName.ClinicDashBoard,
    iconName: "dashboard",
    iconsType: "MaterialIcons",
  },
  // {
  //   name: 'Profile Settings',
  //   screenName: screenName.ClinicProfileSettings,
  //   iconName: 'person',
  //   iconsType: 'Ionicons',
  // },
  {
    name: i18n.translate("clinicDoctors"),
    screenName: screenName.ClinicDoctors,
    iconName: "format-list-bulleted",
    iconsType: "MaterialIcons",
  },
  {
    name: i18n.translate("Appointments"),
    screenName: screenName.clinicAppointments,
    iconName: "perm-contact-calendar",
    iconsType: "MaterialIcons",
  },
  {
    name: i18n.translate("clinicPatients"),
    screenName: screenName.MyPatient,
    iconName: "format-list-bulleted",
    iconsType: "MaterialIcons",
  },

  {
    name: i18n.translate("Messenger"),
    // screenName: screenName.ChatListClinic,
    screenName: "Comming soon",
    iconName: "chatbox-ellipses-outline",
    iconsType: "Ionicons",
  },

  {
    name: i18n.translate("userSettings"),
    screenName: screenName.SettingsPage,
    iconName: "settings",
    iconsType: "Ionicons",
  },

  {
    name: i18n.translate("updateApp"),
    screenName: "Update App",
    updateLink:
      "https://play.google.com/store/apps/details?id=com.style.connect.saloon&pli=1",
    iconName: "cloud-download",
    iconsType: "Ionicons",
  },

  {
    name: i18n.translate("rateApp"),
    screenName: "Update App",
    updateLink:
      "https://play.google.com/store/apps/details?id=com.style.connect.saloon&pli=1",
    iconName: "star",
    iconsType: "Ionicons",
  },
];
// export const sidemenuDetailsClinicAccount = [

//   {
//     name: 'Terms and Conditions',
//     screenName: screenName.termConditionsClinic,
//     iconName: 'document-text-outline',
//     iconsType: 'Ionicons',
//   },
//   {
//     name: 'Feedback',
//     screenName: screenName.ClinicFeedback,
//     iconName: 'feedback',
//     iconsType: 'MaterialIcons',
//   },

//   {
//     name: 'Change Email',
//     screenName: screenName.ChangeEmailClinic,
//     iconName: 'email',
//     iconsType: 'MaterialIcons',
//   },
//   {
//     name: 'Change Password',
//     screenName: screenName.ChangePasswordClinic,
//     iconName: 'lock-closed-outline',
//     iconsType: 'Ionicons',
//   },
//   {
//     name: 'Change phone number',
//     screenName: screenName.ChangePhoneClinic,
//     iconName: 'phone',
//     iconsType: 'MaterialIcons',
//   },
// ];

export const sidemenuDetailsPatient = [
  {
    name: i18n.translate("findDoctorsClinics"),
    screenName: screenName.PatientSearchDashboard,
    iconName: "dashboard",
    iconsType: "MaterialIcons",
  },
  {
    name: "My Profile",
    screenName: screenName.myProfilePatient,
    iconName: "person",
    iconsType: "Ionicons",
  },
  // {
  //   name: 'Profile Settings',
  //   screenName: screenName.ProfileSettingsPatient,
  //   iconName: 'perm-contact-calendar',
  //   iconsType: 'MaterialIcons',
  // },

  {
    name: "Messenger",
    // screenName: screenName.ChatListPatient,
    screenName: "Comming soon",
    iconName: "message",
    iconsType: "MaterialIcons",
  },
  {
    name: "User Settings",
    screenName: screenName.SettingsPage,
    iconName: "settings",
    iconsType: "MaterialIcons",
  },

  // {
  //   name: 'Update App',
  //   screenName: "Update App",
  //   updateLink: "https://play.google.com/store/apps/details?id=com.physical.user.dictionar",
  //   iconName: 'cloud-download',
  //   iconsType: 'Ionicons',
  // },

  // {
  //   name: 'Rate App',
  //   screenName: "Update App",
  //   updateLink: "https://play.google.com/store/apps/details?id=com.physical.user.dictionar",
  //   iconName: 'star',
  //   iconsType: 'Ionicons',
  // },
];
export const sidemenuDetailsPatientGuest = [
  {
    name: i18n.translate("findDoctorsClinics"),
    screenName: screenName.PatientSearchDashboard,
    iconName: "dashboard",
    iconsType: "MaterialIcons",
  },
  {
    name: i18n.translate("myAppointments"),
    screenName: screenName.myGuestAppointments,
    iconName: "person",
    iconsType: "Ionicons",
  },
  {
    name: i18n.translate("ClinicHistoryPatient"),
    screenName: screenName.saloonHistory,
    iconName: "list-outline",
    iconsType: "Ionicons",
  },

  // {
  //   name: 'User Settings',
  //   screenName: screenName.SettingsPage,
  //   iconName: 'settings',
  //   iconsType: 'MaterialIcons',
  // },

  {
    name: i18n.translate("updateApp"),
    screenName: "Update App",
    updateLink:
      "https://play.google.com/store/apps/details?id=com.style.connect.saloon&pli=1",
    iconName: "cloud-download",
    iconsType: "Ionicons",
  },

  {
    name: i18n.translate("rateApp"),
    screenName: "Update App",
    updateLink:
      "https://play.google.com/store/apps/details?id=com.style.connect.saloon&pli=1",
    iconName: "star",
    iconsType: "Ionicons",
  },
];

// export const sidemenuDetailsPatientAccount = [

//   {
//     name: 'Terms and Conditions',
//     screenName: screenName.termConditionsPatients,
//     iconName: 'document-text-outline',
//     iconsType: 'Ionicons',
//   },

//   {
//     name: 'Set Notifications',
//     screenName: screenName.UserSettingsPatient,
//     iconName: 'alarm',
//     iconsType: 'Ionicons',
//   },
//   {
//     name: 'Feedback',
//     screenName: screenName.Feedback,
//     iconName: 'feedback',
//     iconsType: 'MaterialIcons',
//   },
//   {
//     name: 'Change Email',
//     screenName: screenName.ChangeEmailPatient,
//     iconName: 'email',
//     iconsType: 'MaterialIcons',
//   },
//   {
//     name: 'Change Password',
//     screenName: screenName.ChangePasswordPatient,
//     iconName: 'lock-open',
//     iconsType: 'MaterialIcons',
//   },

//   {
//     name: 'Change Phone Number',
//     screenName: screenName.ChangePhonePatient,
//     iconName: 'phone',
//     iconsType: 'MaterialIcons',
//   },

// ];

//schedule timing
export const timeSlotStart = [
  { label: "12:00 am", value: "1" },
  { label: "12:30 am", value: "2" },
  { label: "01:00 am", value: "3" },
  { label: "01:30 am", value: "4" },
];

export const timeSlotEnd = [
  { label: "12:00 am", value: "1" },
  { label: "12:30 am", value: "2" },
  { label: "01:00 am", value: "3" },
  { label: "01:30 am", value: "4" },
];

export const termAndConditionTextClinic = [
  {
    text: `**Privacy Policy**

    Popescu Pompiliu P.F.A.(@ MobiToolsRO) built the Cristina Zurba app as an Ad Supported app. This SERVICE is provided by Popescu Pompiliu P.F.A.(@ MobiToolsRO) at no cost and is intended for use as is.

    This page is used to inform visitors regarding our policies with the collection, use, and disclosure of Personal Information if anyone decided to use our Service.
    
    If you choose to use our Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that we collect is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.
    
    The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which are accessible at Cristina Zurba unless otherwise defined in this Privacy Policy.
  
  **Information Collection and Use**
  
  For a better experience, while using our Service, we may require you to provide us with certain personally identifiable information, including but not limited to users' Image information, last name, first name, e-mail. The information that we request will be retained by us and used as described in this privacy policy.

  The app does use third-party services that may collect information used to identify you.
  
  Link to the privacy policy of third-party service providers used by the app

  **Information Collected while Using the Application**
  
  "Cristina Zurba - Tarot" app collects, transmits, syncs, and stores images and related data to enhance the user experience and provide personalized tarot reading services. Here's how and why we handle this data:

  Collection & Storage: "Cristina Zurba - Tarot" may ask for your permission to access your device's gallery or camera to allow you to upload an image for a personalized avatar or to use within the app's custom tarot reading features. These images are stored securely and are used to personalize your experience within the app.
  
  Transmission & Synchronization: Images or related data may be transmitted to our servers to enable cloud-based synchronization across devices. This ensures that your personalized settings and data are available to you on any device you choose to use.
  
  Usage Scenario: For example, if you opt to use a personal image as part of a custom tarot card reading, "Cristina Zurba - Tarot" processes this image to integrate it into your reading, enhancing the personal relevance of the reading.
  
  User Consent & Control: Before collecting any images or related data, "Cristina Zurba - Tarot" provides a clear, unambiguous request for your consent. You have the control to grant or deny these permissions and can modify them at any time in your device settings. No data is collected without your explicit approval.

  
`,
  },
  {
    text: `
  **Log Data**
  
  We want to inform you that whenever you use our Service, in a case of an error in the app we collect data and information (through third-party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing our Service, the time and date of your use of the Service, and other statistics.
  
  **Cookies**
  
  Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory.

This Service does not use these “cookies” explicitly. However, the app may use third-party code and libraries that use “cookies” to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.
  
  **Service Providers**
  
  We may employ third-party companies and individuals due to the following reasons:
  
  *   To facilitate our Service;
  *   To provide the Service on our behalf;
  *   To perform Service-related services; or
  *   To assist us in analyzing how our Service is used.
  
  We want to inform users of this Service that these third parties have access to their Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
  
  **Security**
  
  We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
  
  **Links to Other Sites**
  
  This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
  
  **Children’s Privacy**
  
  These Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13 years of age. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do the necessary actions.
  
  **Changes to This Privacy Policy**
  
  We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.
  
  This policy is effective as of 2024-02-08
  
  **Contact Us**
  
  If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at MobiToolsRO@gmail.com.
  
  This privacy policy page was created at privacypolicytemplate.net and modified/generated by App Privacy Policy Generator`,
  },

  {
    text: `**Terms & Conditions**

    By downloading or using the app, these terms will automatically apply to you – you should make sure therefore that you read them carefully before using the app. You’re not allowed to copy or modify the app, any part of the app, or our trademarks in any way. You’re not allowed to attempt to extract the source code of the app, and you also shouldn’t try to translate the app into other languages or make derivative versions. The app itself, and all the trademarks, copyright, database rights, and other intellectual property rights related to it, still belong to Popescu Pompiliu P.F.A.(@ MobiToolsRO).

    Popescu Pompiliu P.F.A.(@ MobiToolsRO) is committed to ensuring that the app is as useful and efficient as possible. For that reason, we reserve the right to make changes to the app or to charge for its services, at any time and for any reason. We will never charge you for the app or its services without making it very clear to you exactly what you’re paying for.
    
    The Cristina Zurba app stores and processes personal data that you have provided to us, to provide our Service. It’s your responsibility to keep your phone and access to the app secure. We therefore recommend that you do not jailbreak or root your phone, which is the process of removing software restrictions and limitations imposed by the official operating system of your device. It could make your phone vulnerable to malware/viruses/malicious programs, compromise your phone’s security features and it could mean that the Cristina Zurba app won’t work properly or at all.
    
    The app does use third-party services that declare their Terms and Conditions.

  Link to Terms and Conditions of third-party service providers used by the app
  
`,
  },
  {
    text: `
  
    You should be aware that there are certain things that Popescu Pompiliu P.F.A.(@ MobiToolsRO) will not take responsibility for. Certain functions of the app will require the app to have an active internet connection. The connection can be Wi-Fi or provided by your mobile network provider, but Popescu Pompiliu P.F.A.(@ MobiToolsRO) cannot take responsibility for the app not working at full functionality if you don’t have access to Wi-Fi, and you don’t have any of your data allowance left.

    If you’re using the app outside of an area with Wi-Fi, you should remember that the terms of the agreement with your mobile network provider will still apply. As a result, you may be charged by your mobile provider for the cost of data for the duration of the connection while accessing the app, or other third-party charges. In using the app, you’re accepting responsibility for any such charges, including roaming data charges if you use the app outside of your home territory (i.e. region or country) without turning off data roaming. If you are not the bill payer for the device on which you’re using the app, please be aware that we assume that you have received permission from the bill payer for using the app.
    
    Along the same lines, Popescu Pompiliu P.F.A.(@ MobiToolsRO) cannot always take responsibility for the way you use the app i.e. You need to make sure that your device stays charged – if it runs out of battery and you can’t turn it on to avail the Service, Popescu Pompiliu P.F.A.(@ MobiToolsRO) cannot accept responsibility.
    
    With respect to Popescu Pompiliu P.F.A.(@ MobiToolsRO)’s responsibility for your use of the app, when you’re using the app, it’s important to bear in mind that although we endeavor to ensure that it is updated and correct at all times, we do rely on third parties to provide information to us so that we can make it available to you. Popescu Pompiliu P.F.A.(@ MobiToolsRO) accepts no liability for any loss, direct or indirect, you experience as a result of relying wholly on this functionality of the app.
    
    At some point, we may wish to update the app. The app is currently available on Android & iOS – the requirements for the both systems(and for any additional systems we decide to extend the availability of the app to) may change, and you’ll need to download the updates if you want to keep using the app. Popescu Pompiliu P.F.A.(@ MobiToolsRO) does not promise that it will always update the app so that it is relevant to you and/or works with the Android & iOS version that you have installed on your device. However, you promise to always accept updates to the application when offered to you, We may also wish to stop providing the app, and may terminate use of it at any time without giving notice of termination to you. Unless we tell you otherwise, upon any termination, (a) the rights and licenses granted to you in these terms will end; (b) you must stop using the app, and (if needed) delete it from your device.
    
    
  
  **Changes to This Terms and Conditions**
  
  We may update our Terms and Conditions from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Terms and Conditions on this page.

  These terms and conditions are effective as of 2024-02-08
  
  **Contact Us**
  
  If you have any questions or suggestions about our Terms and Conditions, do not hesitate to contact us at MobiToolsRO@gmail.com.
  
  This Terms and Conditions page was generated by App Privacy Policy Generator`,
  },
];

interface NewsCategoryTypes {
  [key: string]: string;
}

export const NewsCategory = [
  "All",
  "Previziuni zilnice",
  "Previziuni săptămânale",
  "Previziuni lunare",
  "Previziuni anuale",
];
