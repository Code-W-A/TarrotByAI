import { useSelector } from "react-redux";

const hourFormatResult = useSelector(state => state.hourFormat);
const {hourClock} = hourFormatResult;
