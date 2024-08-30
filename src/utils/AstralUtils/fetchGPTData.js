import { decimalToSexagesimal, getAspectAngle } from "../commonUtils";
import {
  bani,
  dragoste,
  familie,
  general,
  muncaStudii,
  prieteni,
  spiritualitate,
} from "../constant";

export const fetchChatResponse = async (userInput) => {
  const url = "https://chat-gpt26.p.rapidapi.com/";
  const options = {
    method: "POST",
    headers: {
      "x-rapidapi-key": "fdb30fac7dmshee22c632d48569ap1d9819jsna577a39fffd6",
      "x-rapidapi-host": "chat-gpt26.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: userInput,
        },
      ],
    }),
  };

  try {
    const response = await fetch(url, options);
    console.log("response...", response);
    const result = await response.json();
    console.log("response...", result);
    console.log("response...", result.choices[0].message.content);
    return result.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "There was an error processing your request.";
  }
};

export function formatAstrologyReport(data, categorie) {
  const {
    birthDate,
    birthTime,
    birthPlace,
    latitude,
    longitude,
    houseSystem,
    houses,
    planets,
    aspects,
  } = data;

  let report = `Interpretează următoarea astrogramă natală cu urmatoarele date: Născut pe ${birthDate}, la ${birthTime}, în ${birthPlace}, România, latitudine ${latitude} și longitudine ${longitude}, sistem de case ${houseSystem}.\n`;

  report +=
    "Ascendentul este in " +
    houses[0].sign +
    ", iar casele astrologice sunt urmatoarele:\n";
  houses.forEach((house, index) => {
    report += `Casa ${index + 1} in ${house.sign} ${house.degree}\n`;
  });

  report += "\nPozitia planetelor este urmatoarea:\n";
  planets.forEach((planet) => {
    report += `${planet.name} in ${planet.sign} la ${planet.degree} in casa ${planet.house}\n`;
  });

  report += "\nAspectele din astrograma sunt:\n";
  aspects.forEach((aspect) => {
    report += `${aspect.planetOne} in ${aspect.type} ${aspect.angle} cu ${aspect.planetTwo}\n`;
  });

  switch (categorie) {
    case "General":
      report += general;
      break;
    case "Dragoste":
      report += dragoste;
      break;
    case "Familie":
      report += familie;
      break;
    case "Bani":
      report += bani;
      break;
    case "Munca si studii":
      report += muncaStudii;
      break;
    case "Prieteni":
      report += prieteni;
      break;
    case "Spiritualitate":
      report += spiritualitate;
      break;
    default:
      console.log(`la switch nu a fost gasita expresie corespunzatoare...`);
  }

  return report;
}

// Functia care prelucreaza si formateaza datele
export function prepareAstroData(userData) {
  const houses = userData.cuspsData.data.houses.map((cusp) => ({
    sign: cusp.sign,
    degree: decimalToSexagesimal(cusp.full_degree),
  }));

  const planets = userData.planetaryData.data.map((planet) => ({
    name: planet.name,
    sign: planet.sign,
    degree: decimalToSexagesimal(planet.full_degree),
    house: planet.house,
  }));

  const aspectsD = userData.aspectsData.data.map((aspect) => ({
    planetOne: aspect.planetOne,
    type: aspect.aspect,
    angle: `${getAspectAngle(aspect.aspect)}°`,
    planetTwo: aspect.planetTwo,
  }));

  return { houses, planets, aspectsD };
}

// HANDLE TRANSLATE
const handleTranslate = async (text, target, actualLanguage) => {
  try {
    const res = await gTranslateFetch(text, target, actualLanguage);
    return res;
  } catch (err) {
    console.error("Error on translate.....:", err);
    // Handle error (e.g., show error message to user)
  }
};

//---------- TRADU INTERPRETARI -----------

const categories = {
  generalCategory: {},
  dragosteCategory: {},
  familieCategory: {},
  baniCategory: {},
  muncaStudiiCategory: {},
  prieteniCategory: {},
  sanatateCategory: {},
  spiritualitateCategory: {},
};

export const handleToTranslate = async (textRoValue, l, actualLanguage) => {
  const translation = await handleTranslate(textRoValue, l, actualLanguage);

  return translation;
};

// SCHIMBA CU TRADUCEREA DIN API NOU PENTRU A NU PLATI 2 ABONAMENTE
export const gTranslateFetch = async (text, target) => {
  let t =
    "In dragoste, persoana prezinta un interes deosebit pentru relatiile serioase si stabile, datorita prezentei Ascendentului in Capricorn si faptului ca Venus se afla in casa 1, alaturi de Uranus si Neptun, toate in semnul Capricornului. Acest aspect poate indica o tendinta de a fi atras/a de parteneri/a maturi, responsabili si stabili, care pot oferi o relatie solida si de lunga durata.  Casa a 5-a, care reprezinta iubirea romantica, creativitatea si jocurile de noroc, este situata in semnul Taurului, iar planeta Venus se afla in aceasta casa. Acest aspect ar putea indica un interes deosebit pentru placerea si confortul emotional din partea partenerului/a, precum si o pasiune pentru arta, muzica si frumos.  Casa a 7-a, asociata parteneriatelor si relatiilor de cuplu, se afla sub semnul Racului, iar guvernatorul acestei case, Luna, se afla in conjunctie cu Soarele si Saturn in casa 2. Acest aspect poate sugera o tendinta de a cauta parteneri/a care sa ofere siguranta, sustinere emotionala si stabilitate materiala. De asemenea, Luna in conjunctie cu Saturn poate indica o dorinta de a construi o relatie de lunga durata, bazata pe responsabilitate si angajament.  Pozitia planetei Venus in casa 1, alaturi de Uranus si Neptun, ar putea indica o personalitate magnetica si atragatoare, dar si o abordare neconventionala in relatiile de cuplu. Aspectele pe care le face cu restul planetelor pot aduce influente diferite, dar in general, prezenta in conjunctie cu Uranus si Neptun ar putea indica dorinta de a trai iubiri neobisnuite, spirituale sau ideale.  In concluzie, aspectele din astrograma natala sugereaza o predispozitie pentru relatii serioase, stabile si de lunga durata, dar si o apropiere de iubirea romantica, sensibilitatea emotionala si frumosul din viata de cuplu. Este important sa se tina cont de toate aceste aspecte in alegerea partenerului/a si in gestionarea relatiilor personale.";
  let targ = "id";
  const url = "https://translate281.p.rapidapi.com/";
  const data = new FormData();
  data.append("text", text);
  data.append("from", "auto");
  data.append("to", target);

  const options = {
    method: "POST",
    headers: {
      "x-rapidapi-key": "fdb30fac7dmshee22c632d48569ap1d9819jsna577a39fffd6",
      "x-rapidapi-host": "translate281.p.rapidapi.com",
    },
    body: data,
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log("result...", result);
    return result.response;
  } catch (error) {
    console.error("error on gTranslateFetch...", error);
  }
};

export const detectLanguage = async (text) => {
  console.log("Text to detect language for:", text);
  const url = "https://google-translator9.p.rapidapi.com/v2/detect";
  const options = {
    method: "POST",
    headers: {
      "x-rapidapi-key": "fdb30fac7dmshee22c632d48569ap1d9819jsna577a39fffd6",
      "x-rapidapi-host": "google-translator9.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: text }),
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json(); // Assuming the API responds with JSON
    console.log("Detected language result:", result);
    console.log(
      "Detected language result:",
      result.data.detections[0][0].language
    );
    if (result.data && result.data.detections) {
      return result.data.detections[0][0].language; // Assuming the structure contains the language in the first detection result
    }
    return "Language detection failed"; // Fallback message
  } catch (error) {
    console.error("Error detecting language:", error);
    return "Error in language detection"; // Error handling
  }
};

// export const gTranslateFetch = async (text, target, actualLanguage) => {
//   let actLang = await detectLanguage(text);
//   console.log("test....aici...", actualLanguage);
//   console.log("test....aici...", target);
//   const url = "https://google-translator9.p.rapidapi.com/v2";
//   const options = {
//     method: "POST",
//     headers: {
//       "x-rapidapi-key": "d249d3abe2mshf90f82ef3c9aa89p13ef66jsnba5bc2845bb5",
//       "x-rapidapi-host": "google-translator9.p.rapidapi.com",
//       "Content-Type": "application/json", // Asigură-te că corespunde modului în care e format body-ul
//     },
//     body: JSON.stringify({
//       q: text,
//       source: actLang, // Ajustat pentru a reflecta limbajul sursă
//       target: target,
//       format: "text",
//     }),
//   };

//   try {
//     const response = await fetch(url, options);
//     console.log("response...", response);
//     const result = await response.json(); // Presupunând că API-ul răspunde cu JSON
//     console.log("result...", result.data.translations[0].translatedText);
//     return result.data.translations[0].translatedText; // Asigură-te că 'response' este calea corectă în obiectul rezultat
//   } catch (error) {
//     console.error("error on gTranslateFetch...", error);
//   }
// };
