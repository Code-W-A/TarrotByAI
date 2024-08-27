import React from "react";
import Leo from "../../../svgs/Leo";
import Aquarius from "../../../svgs/Aquarius";
import Aries from "../../../svgs/zodiac/Aries";
import Cancer from "../../../svgs/zodiac/Cancer";
import Capricorn from "../../../svgs/zodiac/Capricorn";
import Gemini from "../../../svgs/zodiac/Gemini";
import Libra from "../../../svgs/zodiac/Libra";
import Pisces from "../../../svgs/zodiac/Pisces";
import Sagittarius from "../../../svgs/zodiac/Sagittarius";
import Scorpio from "../../../svgs/zodiac/Scorpio";
import Taurus from "../../../svgs/zodiac/Taurus";
import Virgo from "../../../svgs/zodiac/Virgo";
import { colors } from "../../../utils/colors";

// Function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
// Map each zodiac sign to its corresponding component
const zodiacComponents = {
  Leo: Leo,
  Aquarius: Aquarius,
  Aries: Aries,
  Cancer: Cancer,
  Capricorn: Capricorn,
  Gemini: Gemini,
  Libra: Libra,
  Pisces: Pisces,
  Sagittarius: Sagittarius,
  Scorpio: Scorpio,
  Taurus: Taurus,
  Virgo: Virgo,
};

const ZodiacComponent = ({ userD }) => {
  // Get the zodiac sign or fallback to "Leo"
  const zodiacSign = capitalizeFirstLetter(userD.zodiacSign) || "Leo";

  // Select the component based on zodiac sign, or fallback to "Leo"
  const ZodiacSignComponent = zodiacComponents[zodiacSign] || Leo;

  return <ZodiacSignComponent color={colors.white} width={200} height={200} />;
};

export default ZodiacComponent;
