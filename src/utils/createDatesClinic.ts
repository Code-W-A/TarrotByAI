import moment from 'moment';

const getDaysArray = (function () {
  const names = Object.freeze([
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ]);
  return (year, month) => {
    const monthIndex = month - 1;
    const date = new Date(year, monthIndex, 1);
    const result = [];

    while (date.getMonth() == monthIndex) {
      // result.push(`${date.getDate()}-${names[date.getDay()]}`);
      result.push(`${names[date.getDay()]}`);
      date.setDate(date.getDate() + 1);
    }
    return result;
  };
})();

export const handleCreateCalendarForPatient = (
  allDays,
  clinicApprovedAppointments,
  clinicApprovedAppointmentsUnregistered
) => {
  console.log(
    'clinicApprovedAppointmentsUnregistered.....------------------------------------------------',
    clinicApprovedAppointmentsUnregistered,
  );

  const date = new Date();
  const currentYear = date.getFullYear();
  const checkableDate = moment(new Date()).format('YYYY-MM-DD');

  let arrMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let resultArrMonths = [];
  let arrFinalArrays = [];
  let finalObj = [];

  for (let i = 1; i <= arrMonths.length; i++) {
    let arrSecond = [];
    let arrFinal = [];
    let nr = 0;

    let res = getDaysArray(currentYear, i);

    for (let x = 0; x < allDays.length; x++) {
   
      arrSecond.push(allDays[x].val);
      arrSecond.push(allDays[x].timeSPack);
    }

    let tryTestArr = [];

    tryTestArr = res.reduce(function (a, e, i) {
      for (let variable of arrSecond) {
        if (e === variable) a.push(i + 1);
      }

      return a;
    }, []);

    arrFinal = tryTestArr;
    arrFinalArrays.push(arrFinal);
  }
  let obj = {};
  for (let z = 0; z < arrFinalArrays.length; z++) {
    
    for (let y = 0; y < arrFinalArrays[z].length; y++) {
      const date = moment(new Date(currentYear, z, arrFinalArrays[z][y]));
      const newDate = moment(date).format('YYYY-MM-DD');
      if (newDate > checkableDate) {
        obj[newDate] = {selected: true};
      }
      // obj[newDate] = {selected: true};
    }
  }
  
  
  // console.log("----obj-------", obj)
  for (const date in obj) {
    const newDate = moment(date).format('DD-MM-YYYY');
    
    console.log("----newDate-------", newDate)
    const timeSPackCheck = []

    // CLINIC REGISTERED PATIENTS APPOINTMENTS
    for (let i = 0; i < clinicApprovedAppointments.length; i++) {
      if (
        newDate === clinicApprovedAppointments[i].daySelected &&
        clinicApprovedAppointments[i].isApproved
        ) {
          timeSPackCheck.push(clinicApprovedAppointments[i].timeSelected);
          console.log("-----------", clinicApprovedAppointments[i].timeSelected)
          console.log("-----------", allDays)
          if(clinicApprovedAppointments[i].timeSelected === allDays[0].timeSPack){
            console.log("YESSSS")
          }
        }
      }


    // CLINIC UNREGISTERED PATIENTS APPOINTMENTS
    if(clinicApprovedAppointmentsUnregistered){

      for (let i = 0; i < clinicApprovedAppointmentsUnregistered.length; i++) {
        if (
          newDate === clinicApprovedAppointmentsUnregistered[i].daySelected &&
          clinicApprovedAppointmentsUnregistered[i].isApproved
          ) {
          timeSPackCheck.push(clinicApprovedAppointmentsUnregistered[i].timeSelected);
          console.log("-----------", clinicApprovedAppointmentsUnregistered[i].timeSelected)
          console.log("-----------", allDays)
          if(clinicApprovedAppointmentsUnregistered[i].timeSelected === allDays[0].timeSPack){
            console.log("YESSSS")
          }
        }
      }
      
    }
      console.log("----timeSPackCheck-------", timeSPackCheck)
      console.log("----allDays[i].timeSPack-------", allDays[0].timeSPack)
    for(let i = 0; i < allDays.length; i ++){
        if(timeSPackCheck.length === allDays[i].timeSPack.length ){
          console.log("YASSS")
          obj[date].selectedColor = 'red';
      }
    }

  }
  return obj;

  //   console.log('Dates for patient', obj);
};
