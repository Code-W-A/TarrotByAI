export const handleSearch = (data, detectedLng, text) => {
  // Folosim metoda filter pentru a selecta doar obiectele care corespund criteriilor noastre de căutare
  //   console.log(data);
  //   console.log(detectedLng);
  //   console.log(text);
  return data.filter((item) => {
    // Verificăm dacă proprietatea info există și dacă detectedLng este o cheie validă în obiectul info
    if (item.info && detectedLng in item.info) {
      // Accesăm proprietatea nume din info[detectedLng] și o convertim în litere mici
      // Apoi verificăm dacă conține textul specificat (tot în litere mici)
      return item.info[detectedLng].nume
        .toLowerCase()
        .includes(text.toLowerCase());
    }
    // Dacă item-ul curent nu îndeplinește criteriile, îl excludem prin returnarea false
    return false;
  });
};
