// Funcție pentru a converti stringurile de dată în obiecte Date
export function parseDate(dateStr) {
  let parts = dateStr.split(".");
  // Notă: luna este 0-indexată în JavaScript
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

export const toUrlSlug = (string) => {
  return string
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

export const filterArticlesBeforeCurrentTime = (articlesData) => {
  const currentTime = new Date(); // Obține timpul actual

  return articlesData.filter((article) => {
    // Construiește un șir de data și ora în format acceptat de constructorul Date din JavaScript
    const articleDateStr = `${article.firstUploadDate
      .split("-")
      .reverse()
      .join("-")}T${article.firstUploadtime}:00`;
    // Convertiți șirul construit într-un obiect Date
    const articleDateTime = new Date(articleDateStr);

    // Verificați dacă data și ora articolului sunt înainte sau egale cu timpul actual
    return articleDateTime <= currentTime;
  });
};

export const getRandomElements = (array, numberOfElements) => {
  const shuffledArray = array.sort(() => Math.random() - 0.5); // Amestecă array-ul
  return shuffledArray.slice(0, numberOfElements); // Returnează primele numberOfElements elemente
};
