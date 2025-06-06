import base64 from "react-native-base64";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { SvgUri, SvgXml } from "react-native-svg";
// Funcția care redimensionează SVG-ul
// Funcția care redimensionează SVG-ul
export function scaleSVG(svgString, targetWidth, targetHeight) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(svgString, "text/xml");

  // Obține dimensiunile originale
  const originalWidth = parseFloat(
    xmlDoc.documentElement.getAttribute("width")
  );
  const originalHeight = parseFloat(
    xmlDoc.documentElement.getAttribute("height")
  );

  // Calculează factorul de scalare
  const scaleX = targetWidth / originalWidth;
  const scaleY = targetHeight / originalHeight;

  // Scalare elemente SVG
  const scaleAttribute = (value, scale) => parseFloat(value) * scale;

  // Scalare cercuri
  const circles = xmlDoc.getElementsByTagName("circle");
  Array.from(circles).forEach((circle) => {
    circle.setAttribute(
      "cx",
      scaleAttribute(circle.getAttribute("cx"), scaleX)
    );
    circle.setAttribute(
      "cy",
      scaleAttribute(circle.getAttribute("cy"), scaleY)
    );
    circle.setAttribute(
      "r",
      scaleAttribute(circle.getAttribute("r"), (scaleX + scaleY) / 2)
    );
  });

  // Scalare linii
  const lines = xmlDoc.getElementsByTagName("line");
  Array.from(lines).forEach((line) => {
    line.setAttribute("x1", scaleAttribute(line.getAttribute("x1"), scaleX));
    line.setAttribute("y1", scaleAttribute(line.getAttribute("y1"), scaleY));
    line.setAttribute("x2", scaleAttribute(line.getAttribute("x2"), scaleX));
    line.setAttribute("y2", scaleAttribute(line.getAttribute("y2"), scaleY));
  });

  // Scalare texte
  const texts = xmlDoc.getElementsByTagName("text");
  Array.from(texts).forEach((text) => {
    text.setAttribute("x", scaleAttribute(text.getAttribute("x"), scaleX));
    text.setAttribute("y", scaleAttribute(text.getAttribute("y"), scaleY));
    text.setAttribute(
      "font-size",
      scaleAttribute(text.getAttribute("font-size"), (scaleX + scaleY) / 2)
    );
  });

  // Updatează dimensiunile SVG
  xmlDoc.documentElement.setAttribute("width", targetWidth);
  xmlDoc.documentElement.setAttribute("height", targetHeight);

  // Returnează SVG-ul scalat ca string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
}

export function resizeBase64SVG(base64String, targetWidth, targetHeight) {
  // Decodifică base64 în string SVG
  let svgString = base64.decode(base64String);

  // Redimensionează SVG-ul
  svgString = scaleSVG(svgString, targetWidth, targetHeight);

  // Recodifică SVG-ul în base64
  return base64.encode(svgString);
}

export async function fetchAstroData(
  endpointUrl,
  fullName,
  day,
  month,
  year,
  hour,
  min,
  sec,
  gender,
  place,
  lat,
  lon,
  tzone,
  houseSystem
) {
  const authToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FzdHJvYXBpLTEuZGl2aW5lYXBpLmNvbS9hcGkvYXV0aC1hcGktdXNlciIsImlhdCI6MTcxODc3ODk3NSwibmJmIjoxNzE4Nzc4OTc1LCJqdGkiOiJLZHpoeDhVTzA1SGx5YXY0Iiwic3ViIjoiMTk3NSIsInBydiI6ImU2ZTY0YmIwYjYxMjZkNzNjNmI5N2FmYzNiNDY0ZDk4NWY0NmM5ZDcifQ.XJbNhwPAWKVMm7XlgYDATnpWbSjXu4IgSx-yr_fbfMo";
  const apiKey = "7d2b92b6726c241134dae6cd3fb8c182";

  const formData = new FormData();
  formData.append("api_key", String(apiKey));
  formData.append("full_name", String(fullName));
  formData.append("day", String(day));
  formData.append("month", String(month));
  formData.append("year", String(year));
  formData.append("hour", String(hour));
  formData.append("min", String(min));
  formData.append("sec", String(sec));
  formData.append("gender", String(gender));
  formData.append("place", String(place));
  formData.append("lat", String(lat));
  formData.append("lon", String(lon));
  formData.append("tzone", String(tzone));
  console.log("form data....", formData);

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error("Error fetching data from:", endpointUrl, error);
    return null; // sau poți arunca o excepție, depinde de cum vrei să gestionezi erorile
  }
}

export async function fetchHoroscopeData(
  endpointUrl,
  day,
  month,
  year,
  sign,
  tzone
) {
  const authToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FzdHJvYXBpLTEuZGl2aW5lYXBpLmNvbS9hcGkvYXV0aC1hcGktdXNlciIsImlhdCI6MTcxODc3ODk3NSwibmJmIjoxNzE4Nzc4OTc1LCJqdGkiOiJLZHpoeDhVTzA1SGx5YXY0Iiwic3ViIjoiMTk3NSIsInBydiI6ImU2ZTY0YmIwYjYxMjZkNzNjNmI5N2FmYzNiNDY0ZDk4NWY0NmM5ZDcifQ.XJbNhwPAWKVMm7XlgYDATnpWbSjXu4IgSx-yr_fbfMo";
  const apiKey = "7d2b92b6726c241134dae6cd3fb8c182";
  const formattedDate = formatDate(day, month, year); // Formatarea datei
  const todayDate = getCurrentDateFormatted();

  const formData = new FormData();
  formData.append("api_key", String(apiKey));
  formData.append("date", String(todayDate));
  formData.append("sign", String(sign));
  formData.append("timezone", String(tzone));

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const responseJson = await response.json();

    return responseJson;
  } catch (error) {
    console.error("Error fetching data horoscope from:", endpointUrl, error);
    return null; // sau poți arunca o excepție, depinde de cum vrei să gestionezi erorile
  }
}
export async function fetchHoroscopeDataWeek(
  endpointUrl,
  day,
  month,
  year,
  sign,
  tzone
) {
  const authToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FzdHJvYXBpLTEuZGl2aW5lYXBpLmNvbS9hcGkvYXV0aC1hcGktdXNlciIsImlhdCI6MTcxODc3ODk3NSwibmJmIjoxNzE4Nzc4OTc1LCJqdGkiOiJLZHpoeDhVTzA1SGx5YXY0Iiwic3ViIjoiMTk3NSIsInBydiI6ImU2ZTY0YmIwYjYxMjZkNzNjNmI5N2FmYzNiNDY0ZDk4NWY0NmM5ZDcifQ.XJbNhwPAWKVMm7XlgYDATnpWbSjXu4IgSx-yr_fbfMo";
  const apiKey = "7d2b92b6726c241134dae6cd3fb8c182";
  const formattedDate = formatDate(day, month, year); // Formatarea datei
  const todayDate = getCurrentDateFormatted();

  const formData = new FormData();
  formData.append("api_key", String(apiKey));
  formData.append("week", String("current"));
  formData.append("sign", String(sign));
  formData.append("timezone", String(tzone));

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const responseJson = await response.json();

    return responseJson;
  } catch (error) {
    console.error("Error fetching data horoscope from:", endpointUrl, error);
    return null; // sau poți arunca o excepție, depinde de cum vrei să gestionezi erorile
  }
}
export async function fetchHoroscopeDataMonth(
  endpointUrl,
  day,
  month,
  year,
  sign,
  tzone
) {
  const authToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FzdHJvYXBpLTEuZGl2aW5lYXBpLmNvbS9hcGkvYXV0aC1hcGktdXNlciIsImlhdCI6MTcxODc3ODk3NSwibmJmIjoxNzE4Nzc4OTc1LCJqdGkiOiJLZHpoeDhVTzA1SGx5YXY0Iiwic3ViIjoiMTk3NSIsInBydiI6ImU2ZTY0YmIwYjYxMjZkNzNjNmI5N2FmYzNiNDY0ZDk4NWY0NmM5ZDcifQ.XJbNhwPAWKVMm7XlgYDATnpWbSjXu4IgSx-yr_fbfMo";
  const apiKey = "7d2b92b6726c241134dae6cd3fb8c182";
  const formattedDate = formatDate(day, month, year); // Formatarea datei
  const todayDate = getCurrentDateFormatted();

  const formData = new FormData();
  formData.append("api_key", String(apiKey));
  formData.append("month", String("current"));
  formData.append("sign", String(sign));
  formData.append("timezone", String(tzone));

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const responseJson = await response.json();

    return responseJson;
  } catch (error) {
    console.error("Error fetching data horoscope from:", endpointUrl, error);
    return null; // sau poți arunca o excepție, depinde de cum vrei să gestionezi erorile
  }
}
export async function fetchHoroscopeDataYear(
  endpointUrl,
  day,
  month,
  year,
  sign,
  tzone
) {
  const authToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FzdHJvYXBpLTEuZGl2aW5lYXBpLmNvbS9hcGkvYXV0aC1hcGktdXNlciIsImlhdCI6MTcxODc3ODk3NSwibmJmIjoxNzE4Nzc4OTc1LCJqdGkiOiJLZHpoeDhVTzA1SGx5YXY0Iiwic3ViIjoiMTk3NSIsInBydiI6ImU2ZTY0YmIwYjYxMjZkNzNjNmI5N2FmYzNiNDY0ZDk4NWY0NmM5ZDcifQ.XJbNhwPAWKVMm7XlgYDATnpWbSjXu4IgSx-yr_fbfMo";
  const apiKey = "7d2b92b6726c241134dae6cd3fb8c182";
  const formattedDate = formatDate(day, month, year); // Formatarea datei
  const todayDate = getCurrentDateFormatted();

  const formData = new FormData();
  formData.append("api_key", String(apiKey));
  formData.append("year", String("prev"));
  formData.append("sign", String(sign));
  formData.append("timezone", String(tzone));

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const responseJson = await response.json();

    return responseJson;
  } catch (error) {
    console.error("Error fetching data horoscope from:", endpointUrl, error);
    return null; // sau poți arunca o excepție, depinde de cum vrei să gestionezi erorile
  }
}

//parser

import { formatDate, getCurrentDateFormatted } from "../commonUtils";
import moment from "moment";

export function parseSVG(svgString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(svgString, "text/xml");

  // Extragere cercuri
  const circles = xmlDoc.getElementsByTagName("circle");
  const parsedCircles = Array.from(circles).map((circle) => ({
    cx: circle.getAttribute("cx"),
    cy: circle.getAttribute("cy"),
    r: circle.getAttribute("r"),
    fill: circle.getAttribute("fill"),
    stroke: circle.getAttribute("stroke"),
  }));

  // Extragere linii
  const lines = xmlDoc.getElementsByTagName("line");
  const parsedLines = Array.from(lines).map((line) => ({
    x1: line.getAttribute("x1"),
    y1: line.getAttribute("y1"),
    x2: line.getAttribute("x2"),
    y2: line.getAttribute("y2"),
    stroke: line.getAttribute("stroke"),
  }));

  // Extragere text
  const texts = xmlDoc.getElementsByTagName("text");
  const parsedTexts = Array.from(texts).map((text) => ({
    x: text.getAttribute("x"),
    y: text.getAttribute("y"),
    fill: text.getAttribute("fill"),
    content: text.textContent,
    fontFamily: text.getAttribute("font-family"),
    fontSize: text.getAttribute("font-size"),
  }));

  return {
    circles: parsedCircles,
    lines: parsedLines,
    texts: parsedTexts,
  };
}

export function ConvertToImageFormat(base64ImageFormat, appTitle) {
  let url = base64ImageFormat;
  if (base64ImageFormat.indexOf("data:image/svg;base64,") > -1) {
    let decodedSvg = base64.decode(
      base64ImageFormat.replace("data:image/svg;base64,", "")
    );
    let blob = new Blob([decodedSvg], { type: "image/svg+xml" });
    url = URL.createObjectURL(blob);
  }
  return <img src={url} alt={`image for ${appTitle}`} />;
  //return svgs;
  //return React.createElement("div", null, { img });
  //return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svgs) }} />;
}

export const generateTimestampFromDateTime = (date, time) => {
  // Creează un obiect moment combinând data și ora
  const dateTime = moment(`${date} ${time}`, "DD-MM-YYYY HH:mm");

  // Returnează timestamp-ul în secunde
  return Math.floor(dateTime.valueOf() / 1000);
};

export const fetchTimeZone = async (latitude, longitude, timestamp) => {
  const apiKey = "AIzaSyBRgP4D08BVgzw4oyWfZZ9Rx2mjNouePj4";
  let timeSt = timestamp || Math.floor(Date.now() / 1000); // Current timestamp
  console.log("timestamp....in fetchtimezone", timestamp);
  const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timeSt}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK") {
      console.log("data....", data);
      console.log("data.rawOffset....", data.rawOffset);
      console.log("data.dstOffset....", data.dstOffset);
      const offset = (data.rawOffset + data.dstOffset) / 3600; // Handle DST

      return { offset, data }; // Returns the numeric timezone offset
    } else {
      throw new Error("Failed to fetch timezone");
    }
  } catch (error) {
    console.error("Error fetching timezone: ", error);
    return null; // Fallback to a default or notify user
  }
};

// export const getZodiacSign = (day, month) => {
//   const zodiacSigns = [
//     { sign: "CAPRICORN", startDate: "12-22", endDate: "01-19" },
//     { sign: "AQUARIUS", startDate: "01-20", endDate: "02-18" },
//     { sign: "PISCES", startDate: "02-19", endDate: "03-20" },
//     { sign: "ARIES", startDate: "03-21", endDate: "04-19" },
//     { sign: "TAURUS", startDate: "04-20", endDate: "05-20" },
//     { sign: "GEMINI", startDate: "05-21", endDate: "06-20" },
//     { sign: "CANCER", startDate: "06-21", endDate: "07-22" },
//     { sign: "LEO", startDate: "07-23", endDate: "08-22" },
//     { sign: "VIRGO", startDate: "08-23", endDate: "09-22" },
//     { sign: "LIBRA", startDate: "09-23", endDate: "10-22" },
//     { sign: "SCORPIO", startDate: "10-23", endDate: "11-21" },
//     { sign: "SAGITTARIUS", startDate: "11-22", endDate: "12-21" },
//   ];

//   const date = moment(`${month}-${day}`, "MM-DD");

//   for (let zodiac of zodiacSigns) {
//     const start = moment(zodiac.startDate, "MM-DD");
//     const end = moment(zodiac.endDate, "MM-DD");

//     if (
//       (date.isSameOrAfter(start) && date.isSameOrBefore(end)) ||
//       (month === 12 && day >= 22) ||
//       (month === 1 && day <= 19)
//     ) {
//       return zodiac.sign;
//     }
//   }
//   return null;
// };

export const getZodiacSign = (day, month) => {
  const zodiacSigns = [
    { sign: "CAPRICORN", startDate: "12-22", endDate: "12-31" },
    { sign: "AQUARIUS", startDate: "01-20", endDate: "02-18" },
    { sign: "PISCES", startDate: "02-19", endDate: "03-20" },
    { sign: "ARIES", startDate: "03-21", endDate: "04-19" },
    { sign: "TAURUS", startDate: "04-20", endDate: "05-20" },
    { sign: "GEMINI", startDate: "05-21", endDate: "06-20" },
    { sign: "CANCER", startDate: "06-21", endDate: "07-22" },
    { sign: "LEO", startDate: "07-23", endDate: "08-22" },
    { sign: "VIRGO", startDate: "08-23", endDate: "09-22" },
    { sign: "LIBRA", startDate: "09-23", endDate: "10-22" },
    { sign: "SCORPIO", startDate: "10-23", endDate: "11-21" },
    { sign: "SAGITTARIUS", startDate: "11-22", endDate: "12-21" },
    { sign: "CAPRICORN", startDate: "01-01", endDate: "01-19" },
  ];

  const date = moment(`${month}-${day}`, "MM-DD");

  for (let zodiac of zodiacSigns) {
    const start = moment(zodiac.startDate, "MM-DD");
    const end = moment(zodiac.endDate, "MM-DD");

    if (date.isBetween(start, end, null, "[]")) {
      return zodiac.sign;
    }
  }
  return null; // dacă data nu corespunde niciunui semn zodiacal
};
