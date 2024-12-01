import moment from "moment";
import { useHourClockContext } from "../context/HourClockContext";

export const createTimeFormat = (time, hourClock) => {
  const convertTimeTo12Hours = (time) => {
    return moment(time, "HH:mm").format("hh:mm A");
  };

  const createTimeFormatFc = (time) => {
    return hourClock ? time : convertTimeTo12Hours(time);
  };
  const result = createTimeFormatFc(time);

  return result;
};
