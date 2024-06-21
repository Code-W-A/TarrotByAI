export const getNextAppointment = (originalApp: any[]) => {
  // Get the current date and time
  const currentDate: Date = new Date();

  // Filter the originalApp array to find the closest appointment
  const closestAppointments = originalApp.filter((appointment) => {
    // Parse the appointment's date and time from the strings
    const appointmentDate: Date = new Date(appointment.daySelected);
    const appointmentTime: Date = new Date(
      `1970-01-01T${appointment.timeSelected.starttime}`
    );

    // Calculate the time difference in milliseconds
    const timeDifference: number =
      appointmentDate.getTime() - currentDate.getTime();

    // Check if the appointment is in the future (timeDifference > 0)
    return timeDifference > 0;
  });

  // Sort the closestAppointments array by appointment date and time
  closestAppointments.sort((a, b) => {
    const dateA: Date = new Date(a.daySelected);
    const dateB: Date = new Date(b.daySelected);
    const timeA: Date = new Date(`1970-01-01T${a.timeSelected.starttime}`);
    const timeB: Date = new Date(`1970-01-01T${b.timeSelected.starttime}`);

    // Sort by date and then by time
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    if (timeA < timeB) return -1;
    if (timeA > timeB) return 1;
    return 0;
  });

  // The closest appointment will be the first element of the closestAppointments array
  const nextAppointment = closestAppointments[0];

  console.log("Next Appointment:", nextAppointment);
};
