const getYoutubeInfoFromUrl = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!trimmed.includes("http") && !trimmed.includes("/")) {
    return { id: trimmed };
  }

  try {
    const url = new URL(trimmed);
    const listId = url.searchParams.get("list") || undefined;

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? { id, listId } : listId ? { listId } : null;
    }

    if (url.pathname.includes("/embed/")) {
      const id = url.pathname.split("/embed/")[1]?.split("/")[0];
      return id ? { id, listId } : listId ? { listId } : null;
    }

    if (url.pathname.includes("/shorts/")) {
      const id = url.pathname.split("/shorts/")[1]?.split("/")[0];
      return id ? { id, listId } : listId ? { listId } : null;
    }

    if (url.pathname.includes("/live/")) {
      const id = url.pathname.split("/live/")[1]?.split("/")[0];
      return id ? { id, listId } : listId ? { listId } : null;
    }

    const id = url.searchParams.get("v");
    if (id) {
      return { id, listId };
    }

    if (listId) {
      return { listId };
    }
  } catch (error) {
    return null;
  }

  return null;
};

export const getYoutubeEmbedUrl = (youtubeLink) => {
  console.log("🔧 getYoutubeEmbedUrl called with:", youtubeLink);
  console.log("🔧 Input type:", typeof youtubeLink);
  console.log("🔧 Input length:", youtubeLink?.length);
  
  const info = getYoutubeInfoFromUrl(youtubeLink);
  if (!info) {
    console.log("❌ Invalid input - unable to parse");
    return undefined;
  }
  
  if (info.listId && !info.id) {
    const embedUrl = `https://www.youtube.com/embed/videoseries?list=${info.listId}`;
    console.log("🔧 Playlist embed URL:", embedUrl);
    return embedUrl;
  }

  if (info.id) {
    const embedUrl = `https://www.youtube.com/embed/${info.id}`;
    console.log("🔧 Video embed URL:", embedUrl);
    return embedUrl;
  }

    console.log("❌ URL format not recognized");
  return undefined;
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
