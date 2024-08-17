export const normalizeString = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0) + string.slice(1).toLowerCase();
};
