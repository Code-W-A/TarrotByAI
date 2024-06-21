import base64 from "react-native-base64";
import { atob } from "react-native-quick-base64";

export async function fetchNatalWheelChart() {
  const url =
    "https://astroapi-4.divineapi.com/western-api/v1/natal-wheel-chart";
  const authToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FzdHJvYXBpLTEuZGl2aW5lYXBpLmNvbS9hcGkvYXV0aC1hcGktdXNlciIsImlhdCI6MTcxODc3ODk3NSwibmJmIjoxNzE4Nzc4OTc1LCJqdGkiOiJLZHpoeDhVTzA1SGx5YXY0Iiwic3ViIjoiMTk3NSIsInBydiI6ImU2ZTY0YmIwYjYxMjZkNzNjNmI5N2FmYzNiNDY0ZDk4NWY0NmM5ZDcifQ.XJbNhwPAWKVMm7XlgYDATnpWbSjXu4IgSx-yr_fbfMo";
  const apiKey = "7d2b92b6726c241134dae6cd3fb8c182";

  const formData = new FormData();
  formData.append("api_key", apiKey);
  formData.append("full_name", "Rahul Kumar");
  formData.append("day", "24");
  formData.append("month", "05");
  formData.append("year", "2023");
  formData.append("hour", "14");
  formData.append("min", "40");
  formData.append("sec", "43");
  formData.append("gender", "male");
  formData.append("place", "New Delhi, India");
  formData.append("lat", "28.7041");
  formData.append("lon", "77.1025");
  formData.append("tzone", "5.5");

  try {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    let responseJson = await response.json();
    // console.log(responseJson);
    return responseJson;
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}
export async function fetchAspectTable() {
  const url = "https://astroapi-4.divineapi.com/western-api/v2/aspect-table";
  const authToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FzdHJvYXBpLTEuZGl2aW5lYXBpLmNvbS9hcGkvYXV0aC1hcGktdXNlciIsImlhdCI6MTcxODc3ODk3NSwibmJmIjoxNzE4Nzc4OTc1LCJqdGkiOiJLZHpoeDhVTzA1SGx5YXY0Iiwic3ViIjoiMTk3NSIsInBydiI6ImU2ZTY0YmIwYjYxMjZkNzNjNmI5N2FmYzNiNDY0ZDk4NWY0NmM5ZDcifQ.XJbNhwPAWKVMm7XlgYDATnpWbSjXu4IgSx-yr_fbfMo";
  const apiKey = "7d2b92b6726c241134dae6cd3fb8c182";

  const formData = new FormData();
  formData.append("api_key", apiKey);
  formData.append("full_name", "Rahul Kumar");
  formData.append("day", "24");
  formData.append("month", "05");
  formData.append("year", "2023");
  formData.append("hour", "14");
  formData.append("min", "40");
  formData.append("sec", "43");
  formData.append("gender", "male");
  formData.append("place", "New Delhi, India");
  formData.append("lat", "28.7041");
  formData.append("lon", "77.1025");
  formData.append("tzone", "5.5");

  try {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    let responseJson = await response.json();
    // console.log(responseJson);
    return responseJson;
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

//parser

import { DOMParser } from "xmldom";

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
