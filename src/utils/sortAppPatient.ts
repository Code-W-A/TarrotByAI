import moment from 'moment';

// FILTER PAST APPOINTMENTS
export const filterPastAppointments = myAppointments => {
  // console.log(myAppointments[0].daySelected);
  try{

    console.log("----------------------")
    const actualDate = moment(new Date()).format('YYYY-MM-DD');
    const actualHour = moment(new Date()).format('HH:mm');
    
    const result = myAppointments.filter(app => {
      console.log("app.daySelected...", app.daySelected);
      // const appDay = moment(new Date(app.daySelected)).format('YYYY-MM-DD');
      const appDay = moment(app.daySelected, 'DD-MM-YYYY').format('YYYY-MM-DD')
      // const appDay = app.daySelected;
      console.log("appDay...", appDay);
      console.log("actualDate...", actualDate);
      console.log("actualHour...", actualHour);
      if (appDay === actualDate) {
        return app.timeSelected.starttime <= actualHour;
      } else return appDay <= actualDate;
    });
    console.log(result)
    return result;
  } catch(err){
    console.log("error...filterPastAppointments...", err)
  }
};

//FILTER UPCOMING APPOINTMENTS
export const filterUpcomingAppointments = myAppointments => {
  try{

    console.log("----------------------")
    const actualDate = moment(new Date()).format('YYYY-MM-DD');
    const actualHour = moment(new Date()).format('HH:mm');
    
    const result = myAppointments.filter(app => {
      console.log("app.daySelected...", app.daySelected);
      // const appDay = moment(new Date(app.daySelected)).format('YYYY-MM-DD');
      const appDay = moment(app.daySelected, 'DD-MM-YYYY').format('YYYY-MM-DD')
      // const appDay = moment(app.daySelected).format('YYYY-MM-DD');
      // const appDay = app.daySelected;
      console.log("appDay...", appDay);
      console.log("actualDate...", actualDate);
      console.log("actualHour...", actualHour);
      console.log("app.timeSelected.starttime...", app.timeSelected.starttime);
      if (appDay === actualDate) {
        console.log("yes")
        return app.timeSelected.starttime >= actualHour;
    } else return appDay >= actualDate;
    });
    console.log(result)
    return result;
  } catch(err){
    console.log("error...filterUpcomingAppointments...", err)
  }
  };
  
  // SORT BY DATE
export const sortByDate = myAppointments => {
  const sortedApp = myAppointments.sort((a, b) => {
    if (a.daySelected === b.daySelected) {
      return a.timeSelected.starttime > b.timeSelected.starttime;
    } else return a.daySelected > b.daySelected;
  });

  return sortedApp;
};

// SORT BY DATE PAST APPOINTMENTS
export const sortByDatePastApp = myAppointments => {
  const sortedApp = myAppointments.sort((a, b) => {
    if (a.daySelected === b.daySelected) {
      return a.timeSelected.starttime < b.timeSelected.starttime;
    } else return a.daySelected < b.daySelected;
  });

  return sortedApp;
};



//FILTER APPOINTMENTS FOR NOTIFICATIONS
export const filterAppointmentsForNot = myAppointments => {
  try{

    console.log("----------------------")
    const actualDate = moment(new Date()).format('YYYY-MM-DD');
    const actualHour = moment(new Date()).format('HH:mm');
    
    const result = myAppointments.filter(app => {
      console.log("app.daySelected...", app.daySelected);
      // const appDay = moment(new Date(app.daySelected)).format('YYYY-MM-DD');
      const appDay = moment(app.daySelected, 'DD-MM-YYYY').subtract(1, "days").format('YYYY-MM-DD')
    
      // const appDay = moment(app.daySelected).format('YYYY-MM-DD');
      // const appDay = app.daySelected;
      console.log("appDay...", appDay);
      console.log("actualDate...", actualDate);
      console.log("actualHour...", actualHour);
      console.log("app.timeSelected.starttime...", app.timeSelected.starttime);
      if (appDay === actualDate) {
        console.log("yes")
        return app.timeSelected.starttime >= actualHour;
    } else return appDay >= actualDate;
    });
    console.log(result)
    return result;
  } catch(err){
    console.log("error...filterUpcomingAppointments...", err)
  }
  };


  //FILTER LOCAL NOTIFICATIONS ASYNC STORAGE
export const filterLocalNotificationStorage = localNotifications => {
  try{

    console.log("----------------------")
    const actualDate = moment(new Date()).format('YYYY-MM-DD');
    const actualHour = moment(new Date()).format('HH:mm');
    
    const result = localNotifications.filter(app => {
      console.log("app.daySelected...", app.daySelected);
      // const appDay = moment(new Date(app.daySelected)).format('YYYY-MM-DD');
      const appDay = moment(app.daySelected, 'DD-MM-YYYY').subtract(1, "days").format('YYYY-MM-DD')
    
      // const appDay = moment(app.daySelected).format('YYYY-MM-DD');
      // const appDay = app.daySelected;
      console.log("appDay...", appDay);
      console.log("actualDate...", actualDate);
      console.log("actualHour...", actualHour);
      console.log("app.timeSelected.starttime...", app.timeSelected.starttime);
      if (appDay === actualDate) {
        console.log("yes")
        return app.timeSelected.starttime >= actualHour;
    } else return appDay >= actualDate;
    });
    console.log(result)
    return result;
  } catch(err){
    console.log("error...filterUpcomingAppointments...", err)
  }
  };