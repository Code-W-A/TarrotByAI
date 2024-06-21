export function getNextAppointment(clinicAppointments) {
  // Check if clinicAppointments is an array and has elements
  if (!Array.isArray(clinicAppointments) || clinicAppointments.length === 0) {
    return undefined; // Return undefined if there are no appointments
  }

  // Get the current date and time
  const currentDateNow = new Date();
  const timezoneOffsetInMinutes = currentDateNow.getTimezoneOffset();
  const localTime = new Date(
    currentDateNow.getTime() - timezoneOffsetInMinutes * 60 * 1000
  );

  console.log("currentDate in local timezone:");
  console.log(currentDateNow);
  console.log(localTime.toISOString());
  const currentDate = localTime.toISOString();

  // Filter appointments that are after the current date and time
  const upcomingAppointments = clinicAppointments.filter((appointment) => {
    if (appointment.isApproved) {
      const [day, month, year] = (appointment.daySelected || "")
        .split("-")
        .map(Number);
      const [hours, minutes] = (appointment.timeSelected?.starttime || "")
        .split(":")
        .map(Number);
      if (day && month && year && hours && minutes) {
        const appointmentDate = new Date(year, month - 1, day, hours, minutes);

        // Convert currentDate to Date object
        const currentDate = new Date();

        return appointmentDate > currentDate;
      }
      return false;
    } else {
      return false;
    }
  });

  // Sort the upcomingAppointments based on daySelected and timeSelected.starttime
  upcomingAppointments.sort((a, b) => {
    const [aDay, aMonth, aYear] = (a.daySelected || "").split("-").map(Number);
    const [aHours, aMinutes] = (a.timeSelected?.starttime || "")
      .split(":")
      .map(Number);
    const aDate =
      aDay && aMonth && aYear && aHours && aMinutes
        ? new Date(aYear, aMonth - 1, aDay, aHours, aMinutes)
        : null;

    const [bDay, bMonth, bYear] = (b.daySelected || "").split("-").map(Number);
    const [bHours, bMinutes] = (b.timeSelected?.starttime || "")
      .split(":")
      .map(Number);
    const bDate =
      bDay && bMonth && bYear && bHours && bMinutes
        ? new Date(bYear, bMonth - 1, bDay, bHours, bMinutes)
        : null;

    return aDate && bDate ? aDate - bDate : 0;
  });

  // Get the next appointment (the first appointment in the sorted list)
  const nextAppointment = upcomingAppointments[0];

  return nextAppointment;
}
