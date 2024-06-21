export const getYoutubeEmbedUrl = (youtubeLink) => {
  let embedUrl;
  if (youtubeLink.includes("list=")) {
    // Este o listă de redare
    const listId = youtubeLink.split("list=")[1].split("&")[0]; // Extragere ID listă de redare
    embedUrl = `https://www.youtube.com/embed/videoseries?list=${listId}`;
  } else if (youtubeLink.includes("watch?v=")) {
    // Este un videoclip individual
    const videoId = youtubeLink.split("watch?v=")[1].split("&")[0]; // Extragere ID videoclip
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }
  return embedUrl;
};

export const handleYotubeLinksToArray = (links) => {
  let arr = [];
  // Verifică dacă inputul este un string și nu este gol
  if (typeof links === "string" && links.trim() !== "") {
    // Separă linkurile pe baza separatorului ';' și elimină spațiile albe de la începutul și sfârșitul fiecărui link
    const linkArray = links.split(";").map((link) => link.trim());
    // Elimină orice string gol din array, care poate apărea dacă există două semne ';' consecutive
    arr = linkArray.filter((link) => link !== "");
    return arr;
  }
  // Dacă inputul nu este un string valid, returnează un array gol
  return arr;
};
