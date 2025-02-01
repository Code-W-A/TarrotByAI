import { decimalToSexagesimal, getAspectAngle } from "../commonUtils";

export async function fetchSinastrieData(
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
  secondUser
) {
  console.log("Second user....", secondUser);
  const authToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FzdHJvYXBpLTEuZGl2aW5lYXBpLmNvbS9hcGkvYXV0aC1hcGktdXNlciIsImlhdCI6MTcxODc3ODk3NSwibmJmIjoxNzE4Nzc4OTc1LCJqdGkiOiJLZHpoeDhVTzA1SGx5YXY0Iiwic3ViIjoiMTk3NSIsInBydiI6ImU2ZTY0YmIwYjYxMjZkNzNjNmI5N2FmYzNiNDY0ZDk4NWY0NmM5ZDcifQ.XJbNhwPAWKVMm7XlgYDATnpWbSjXu4IgSx-yr_fbfMo";
  const apiKey = "7d2b92b6726c241134dae6cd3fb8c182";

  const formData = new FormData();
  formData.append("api_key", String(apiKey));
  // Parametri pentru primul utilizator (p1)
  formData.append("p1_full_name", String(fullName));
  formData.append("p1_day", String(day));
  formData.append("p1_month", String(month));
  formData.append("p1_year", String(year));
  formData.append("p1_hour", String(hour));
  formData.append("p1_min", String(min));
  formData.append("p1_sec", String(sec));
  formData.append("p1_gender", String(gender));
  formData.append("p1_place", String(place));
  formData.append("p1_lat", String(lat));
  formData.append("p1_lon", String(lon));
  formData.append("p1_tzone", String(tzone));

  // Parametri pentru al doilea utilizator (p2)
  formData.append("p2_full_name", String(secondUser.full_name));
  formData.append("p2_day", String(secondUser.day));
  formData.append("p2_month", String(secondUser.month));
  formData.append("p2_year", String(secondUser.year));
  formData.append("p2_hour", String(secondUser.hour));
  formData.append("p2_min", String(secondUser.min));
  formData.append("p2_sec", String(secondUser.sec));
  formData.append("p2_gender", String(secondUser.gender));
  formData.append("p2_place", String(secondUser.place));
  formData.append("p2_lat", String(secondUser.lat));
  formData.append("p2_lon", String(secondUser.lon));
  formData.append("p2_tzone", String(secondUser.tzone));

  formData.append("lan", String("en"));
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

export function prepareSinData(userData) {
  const houses = userData.synastry.houseCusps.data.houses.map((cusp) => ({
    sign: cusp.sign,
    degree: decimalToSexagesimal(cusp.full_degree),
  }));

  const planets = userData.synastry.planetaryPositions.data.map((planet) => ({
    name: planet.name,
    sign: planet.sign,
    degree: decimalToSexagesimal(planet.full_degree),
    house: planet.house,
  }));

  const aspectsD = userData.synastry.aspect.data.map((aspect) => ({
    planetOne: aspect.planetOne,
    type: aspect.aspect,
    angle: `${getAspectAngle(aspect.aspect)}°`,
    planetTwo: aspect.planetTwo,
  }));

  return { houses, planets, aspectsD };
}
