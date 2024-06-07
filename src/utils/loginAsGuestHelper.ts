import AsyncStorage from "@react-native-async-storage/async-storage";

export const handleLoginAsGuest = async (isRegistering, isClinic?) => {
  try {
    console.log("works....");
    console.log(isRegistering);

    let guestDetails = {};
    if (isRegistering) {
      console.log("change is here....good");
      //     guestDetails =
      //     { phoneNumber:"",
      //     email:"",
      //     hasProfile:false,
      //     isClinic:false,
      //     isPatient:true,
      //     owner_uid: false,
      //     basicInfoData: {firstName:"", lastName:"", gender:"", state:"", country:"", town:"", age:""},
      //     clinicsHistory:[],
      //     termsConditions:{},
      //     patientImage:"",
      //     oldPatientImage:"",
      //     isGuest:false,
      //     expoToken:"",
      //     myAppointments:[],
      //     patientImg:"",
      //     patientImgURI:"",
      // }

      // AsyncStorage.setItem('guestLoginDetails', JSON.stringify(guestDetails), (err)=> {
      //     if(err){
      //         console.log("an error occured when setting guestLoginDetails on sign in screen....", err);
      //         throw err;
      //     }

      // }).catch((err)=> {
      //     console.log("error is: " + err);
      // });
    } else if (isClinic) {
      guestDetails = {
        phoneNumber: "",
        email: "",
        hasProfile: false,
        isClinic: false,
        isPatient: false,
        owner_uid: false,
        basicInfoData: {
          firstName: "",
          lastName: "",
          gender: "",
          state: "",
          country: "",
          town: "",
          age: "",
        },
        clinicsHistory: [],
        termsConditions: {},
        patientImage: "",
        oldPatientImage: "",
        isGuest: false,
        expoToken: "",
        myAppointments: [],
        patientImg: "",
        patientImgURI: "",
      };

      AsyncStorage.setItem(
        "guestLoginDetails",
        JSON.stringify(guestDetails),
        (err) => {
          if (err) {
            console.log(
              "an error occured when setting guestLoginDetails on sign in screen....",
              err
            );
            throw err;
          }
        }
      ).catch((err) => {
        console.log("error is: " + err);
      });
    } else {
      console.log("this....");
      const guestD = await handleGetGuestDetails();
      if (guestD.isGuest) {
        console.log("YES IS GUEST------------------");
        console.log(guestD);
      } else {
        guestDetails = {
          phoneNumber: "",
          email: "",
          hasProfile: false,
          isClinic: false,
          isPatient: true,
          owner_uid: false,
          basicInfoData: {
            firstName: "",
            lastName: "",
            gender: "",
            state: "",
            country: "",
            town: "",
            age: "",
          },
          clinicsHistory: [],
          termsConditions: {},
          patientImage: "",
          oldPatientImage: "",
          isGuest: true,
          expoToken: "",
          myAppointments: [],
          patientImg: "",
          patientImgURI: "",
        };

        AsyncStorage.setItem(
          "guestLoginDetails",
          JSON.stringify(guestDetails),
          (err) => {
            if (err) {
              console.log(
                "an error occured when setting guestLoginDetails on sign in screen....",
                err
              );
              throw err;
            }
          }
        ).catch((err) => {
          console.log("error is: " + err);
        });
      }
    }
    return guestDetails;
  } catch (error) {
    console.log("error on handleLoginAsGuest...", error);
  }
};

export const handleGetGuestDetails = async () => {
  try {
    const value = await AsyncStorage.getItem("guestLoginDetails");

    if (value !== null) {
      //
      console.log("We have data!!");
      console.log(JSON.parse(value));
      let guestDetails = JSON.parse(value);
      return guestDetails;
    } else if (value === null) {
      console.log("We don t have data!! handleGetGuestDetails");
      let guestDetails = { isGuest: false };
      return guestDetails;
    }
  } catch (error) {
    // Error retrieving data
    console.log("error handleGetGuestDetails....", error);
  }
};
