import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { collection, getDocs, query, where } from 'firebase/firestore';
import moment from 'moment';
import 'moment-timezone';
import { db } from '../../../firebase';
import { getLocales, getCalendars } from 'expo-localization';

// Calculate the time difference between the current time and target time
function calculateTimeDifference(date, time) {
  const dateTimeString = moment(`${date} ${time}`, "DD-MM-YYYY HH:mm").format("YYYY-MM-DDTHH:mm:ss");


  
  const targetDate = new Date(dateTimeString); // Specify the target date and time

  // GET CURRENT DATE IN SECONDS
  const currentDate = new Date();

const options = { timeZone: 'Europe/Bucharest' };
const currentDateTimeString = currentDate.toLocaleString('en-US', options);

const originalDateTimeString = currentDateTimeString;
const parsedDateTime = moment(originalDateTimeString, 'ddd MMM D HH:mm:ss YYYY');
const convertedDateTimeString = parsedDateTime.format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';


const convertedDateTime = new Date(convertedDateTimeString);

const secondsCurrentDate = Math.floor(convertedDateTime.getTime() / 1000);



// GET THE TARGET DATE IN SECONDS

const outputDateTime = moment.utc(targetDate).subtract(1, 'day');



const secondsTargetDate = Math.floor(outputDateTime.valueOf() / 1000);

console.log("-------target date for appointment---------")
console.log(outputDateTime);
console.log("-------current date---------")
console.log(convertedDateTimeString);
console.log("-------seconds between---------")
console.log(secondsTargetDate - secondsCurrentDate);

let finalSeconds = secondsTargetDate - secondsCurrentDate
  
  return finalSeconds;
}




export async function schedulePushNotificationOnAppointment(timeSelected, daySelected, basicInfoDoctor, appointmentId, isInLocalNotification?, notificationsArr?) {
  console.log("-----------------schedulePushNotificationOnAppointment------------------")

  console.log("Start Test");

  let timeDifference = calculateTimeDifference(daySelected, timeSelected.starttime)

  let notificationId;


  let notificationsForAppointment = []
  
  console.log("----timeDifference----")
  console.log(timeDifference)

  if (timeDifference < 0) {
    console.log("time difference is with minus....")
  } else {
    console.log("YES")

    notificationId =  await Notifications.scheduleNotificationAsync({
      content: {
      title: `🔔 Appointment on ${daySelected} with ${basicInfoDoctor.firstname} ${basicInfoDoctor.lastname} test secund`,
      body: `You have an appointment with ${basicInfoDoctor.firstname} ${basicInfoDoctor.lastname} on ${daySelected} between ${timeSelected.starttime} and ${timeSelected.endtime} test secund`,
      data: { data: 'goes here' },
    },
    trigger: {
      seconds: timeDifference ,
      repeats:false
      // Convert time difference to seconds
    },
  
      });
      
      console.log("Success notification with id:----------------",notificationId)

        
        let notificationObj = {appointmentId, notificationId, daySelected, timeSelected }

        notificationsArr.push(notificationObj)


        AsyncStorage.setItem('localNotifications', JSON.stringify(notificationsArr), (err)=> {
          if(err){
              console.log("an error occured when setting localNotifications on patients dashboard screen....", err);
              throw err;
          } else{
            console.log("Success added to local ASYNC STORAGE....")
          }
        
        }).catch((err)=> {
            console.log("error is: " + err);
        });

    }




 
  








}



//   async function schedulePushNotification() {
//     console.log("-----------------myAppointments------------------")
//     // console.log(myAppointments[0].daySelected)
//     // for (let i = 0; i < myAppointments.length; i++){
//     //  console.log( myAppointments[i].daySelected)
//     //   console.log(myAppointments[i].timeSelected.starttime)
//     // }
//       let id;
//       let notificationsLocalDB = [...notificationsDB]
//     for(let i =0; i < myAppointments.length; i++){
//       console.log("-----START LOOP-----------")
//       console.log(myAppointments[i].isApproved)
//       if(myAppointments[i].isApproved){
//         console.log("Continue....is approved")
        
       
    
//     // let myMoment = moment(`${myAppointments[i].timeSelected.starttime} ${myAppointments[i].daySelected}`, "HH:mm DD-MM-YYYY");
//     let myMoment = moment(`20:40 29.05.2023`, "HH:mm DD-MM-YYYY");
//     console.log("myMoment...", myMoment)
//     // console.log("myMomentV2...", myMomentV2)
    
//     let n = new Date(myMoment);
    
//     // console.log("n...", n)
    
//     n.setHours(n.getHours());
    
    
//     let isodate = n.toISOString();
//     const numberBefore = Number(text);
    
//         if(checked === "minutes"){
//           console.log(n)
//           console.log(n.getMinutes())
//           console.log(numberBefore)
//           n.setMinutes(n.getMinutes() - numberBefore);
//           console.log("-----n----")
//           console.log(n)
//     // console.log(checked)
//   } else if(checked === "hours"){
    
//     // console.log(checked)
//     n.setHours(n.getHours() - numberBefore);
//   } else if(checked === "days"){
    
//     // console.log(checked)
//     n.setDate(n.getDay() - numberBefore);
//   } else if (checked === "weeks"){
//     const daysBeforeAsWeeks = numberBefore * 7
//     // console.log(checked)
    
//     n.setDate(n.getDate() - daysBeforeAsWeeks);
          
//         }
    
//     // console.log("n new...", n)
//     const dayz = n.getDay();
//     const month = n.getMonth();
//     const hours = n.getHours();
//     const minutes = n.getMinutes();
    
//     console.log("dayz...",  dayz + 1)
//     console.log("hours...",  hours)
//     console.log("month...",  month)
//     console.log("minutes...",  minutes)
    

//     // console.log("YES")
//      id =   await Notifications.scheduleNotificationAsync({
//       content: {
//         title: `🔔 Appointment on ${myAppointments[i].daySelected} with ${myAppointments[i].aboutDoctor.firstname} ${myAppointments[i].aboutDoctor.lastname}`,
//         body: `You have an appointment with ${myAppointments[i].aboutDoctor.firstname} ${myAppointments[i].aboutDoctor.lastname} on ${myAppointments[i].daySelected} between ${myAppointments[i].timeSelected.starttime} and ${myAppointments[i].timeSelected.endtime}`,
//         data: { data: 'goes here' },
//       },
//       trigger: {
//         weekday: dayz + 1,
//         hour: hours,
//         minute: minutes,
//         repeats: true,
//       },
//     });
//     // console.log("id...", id)
//     // console.log(`${text} ${checked} before`)
  

//   // }
//   if(timeNotifications.length === 0) {
//     // console.log("length 0")
//     const newState = [...timeNotifications, {text:`${text} ${checked} before`, idNotification:id}]
//     setTimeNotifications(newState)
//     console.log(".............BEFORE AsyncStorage.setItem............")
//     await AsyncStorage.setItem("localNotificationStateUI", JSON.stringify(newState));
//     // console.log(myAppointments[i])

//     if(notificationsLocalDB.length > 0){
//       for(let z = 0; z < notificationsLocalDB.length; z ++){
//         if(notificationsLocalDB[i].appointmentId === myAppointments[i].appointmentId){
//           notificationsLocalDB[i].notifications = newState
//         } else{

//           notificationsLocalDB.push({appointmentId :myAppointments[i].appointmentId, notifications: newState})
//         }
//       }
//     } else {
//       notificationsLocalDB.push({appointmentId :myAppointments[i].appointmentId, notifications: newState})
//     }

//     hideModal()

//   }

//   console.log(timeNotifications.length)
//   for(let z = 0; z < timeNotifications.length; z ++){
//     // console.log(`${text} ${checked} before`)
//     if(timeNotifications[z].text === `${text} ${checked} before`){
//       showDialog()
//       break;
//     } else if(z + 1 === timeNotifications.length) {
//       // console.log(`${text} ${checked} before`)
//       const newState = [...timeNotifications, {text:`${text} ${checked} before`, idNotification:id}]
//       setTimeNotifications(newState)
//       await AsyncStorage.setItem("localNotificationStateUI", JSON.stringify(newState));
//       console.log("appointment.....timeNotifications.length >>>>>>> 0")
//       // console.log(myAppointments[i])

//       if(notificationsLocalDB.length > 0){
//         for(let z = 0; z < notificationsLocalDB.length; z ++){
//           if(notificationsLocalDB[i].appointmentId === myAppointments[i].appointmentId){
//             notificationsLocalDB[i].notifications = newState
//           } else{
  
//             notificationsLocalDB.push({appointmentId :myAppointments[i].appointmentId, notifications: newState})
//           }
//         }
//       } else {
//         notificationsLocalDB.push({appointmentId :myAppointments[i].appointmentId, notifications: newState})
//       }

//       hideModal()
//     }
//     }
//   } else {
//     console.log("Next....LOOP........appointment is not approved")
//   }
// }
//     console.log("-----------notificationsDB---------------")
//     console.log(notificationsLocalDB)
//     setNotificationsDB(notificationsLocalDB);
//     await AsyncStorage.setItem("localNotifications", JSON.stringify(notificationsLocalDB));
//   }


