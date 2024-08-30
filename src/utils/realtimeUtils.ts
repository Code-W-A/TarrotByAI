import {
  getDatabase,
  ref,
  get,
  child,
  set,
  onValue,
  update,
} from "firebase/database";

export const editData = (data, locationName, secondLocationName, id) => {
  console.log("Start edit...");
  console.log(locationName);
  console.log(secondLocationName);
  console.log(id);
  console.log(data);
  // Get a reference to the database
  const db = getDatabase();

  // Specify the path to the data you want to update
  const dataRef = ref(db, `${locationName}/${secondLocationName}/` + id);

  // Use the update method to update the data
  update(dataRef, data)
    .then(() => {
      console.log("Data updated successfully");
    })
    .catch((error) => {
      console.error("Error updating data: ", error);
    });
};

export const getData = async (locationName, secondLocationName) => {
  let arr = []; // Specificați tipul de obiecte pe care îl conține matricea
  try {
    const dbRef = ref(getDatabase());

    const snapshot = await get(
      child(dbRef, `${locationName}/${secondLocationName}`)
    );

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        // Get the object inside the snapshot and push it into the array
        const item = childSnapshot.val();
        arr.push(item);
      });
    } else {
      console.log("No data available");
    }

    return arr;
  } catch (error) {
    console.error(error);
    return arr;
  }
};

export const writeData = (data, locationName, secondLocationName) => {
  console.log("Start write...");
  try {
    const db = getDatabase();

    set(ref(db, `${locationName}/${secondLocationName}/` + data.id), data);
  } catch (err) {
    console.log("Error on writeServiceData...", err);
  }
};

export const writeImg = (imgUrl) => {
  const db = getDatabase();

  set(ref(db, `ApiImage/imgUrl`), imgUrl);
};

export const getUrlImg = async () => {
  let url = "";
  try {
    const dbRef = ref(getDatabase());

    const snapshot = await get(child(dbRef, `ApiImage`));
    let arr = []; // Specificați tipul de obiecte pe care îl conține matricea

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        // Get the object inside the snapshot and push it into the array
        const item = childSnapshot.val();
        url = item;
      });
    } else {
      console.log("No data available");
    }

    return url;
  } catch (error) {
    console.error(error);
    return url;
  }
};
