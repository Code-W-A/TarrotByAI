export const getYoutubeEmbedUrl = (youtubeLink) => {
  console.log("🔧 getYoutubeEmbedUrl called with:", youtubeLink);
  console.log("🔧 Input type:", typeof youtubeLink);
  console.log("🔧 Input length:", youtubeLink?.length);
  
  let embedUrl;
  
  if (!youtubeLink || typeof youtubeLink !== 'string') {
    console.log("❌ Invalid input - not a string");
    return undefined;
  }
  
  if (youtubeLink.includes("list=")) {
    // Este o listă de redare
    console.log("🔧 Processing as playlist");
    const listId = youtubeLink.split("list=")[1].split("&")[0]; // Extragere ID listă de redare
    embedUrl = `https://www.youtube.com/embed/videoseries?list=${listId}`;
    console.log("🔧 Playlist ID extracted:", listId);
    console.log("🔧 Playlist embed URL:", embedUrl);
  } else if (youtubeLink.includes("watch?v=")) {
    // Este un videoclip individual (format lung)
    console.log("🔧 Processing as individual video (long format)");
    const videoId = youtubeLink.split("watch?v=")[1].split("&")[0]; // Extragere ID videoclip
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
    console.log("🔧 Video ID extracted:", videoId);
    console.log("🔧 Video embed URL:", embedUrl);
  } else if (youtubeLink.includes("youtu.be/")) {
    // Este un videoclip individual (format scurt)
    console.log("🔧 Processing as individual video (short format youtu.be)");
    const videoId = youtubeLink.split("youtu.be/")[1].split("?")[0].split("&")[0]; // Extragere ID videoclip
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
    console.log("🔧 Video ID extracted:", videoId);
    console.log("🔧 Video embed URL:", embedUrl);
  } else if (youtubeLink.includes("youtube.com/embed/")) {
    // Este deja un embed URL
    console.log("🔧 Already an embed URL");
    embedUrl = youtubeLink;
    console.log("🔧 Using existing embed URL:", embedUrl);
  } else {
    console.log("❌ URL format not recognized");
    console.log("❌ Link doesn't contain 'watch?v=', 'youtu.be/', 'list=', or 'embed/'");
    embedUrl = undefined;
  }
  
  console.log("🔧 Final embed URL:", embedUrl);
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
