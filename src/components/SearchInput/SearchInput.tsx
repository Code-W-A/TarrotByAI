import React from "react";
import { TextInput, useColorScheme } from "react-native";
import { useDispatch } from "react-redux";

import styles from "./styles";

export const SearchInput: React.FC<{
  searchText: string;
  setSearchText: Function;
  setIsLoading: Function;
  handleSearchData: Function;
}> = ({ searchText, setSearchText, setIsLoading, handleSearchData }) => {
  const backgroundColor = useColorScheme() === "dark" ? "#333" : "#ddd";
  const placeholderColor = useColorScheme() === "dark" ? "#eee" : "#111";
  const color = useColorScheme() === "dark" ? "#fff" : "#000";
  const dispatch = useDispatch();

  return (
    <TextInput
      placeholder={"Search"}
      placeholderTextColor={placeholderColor}
      style={[styles.container, { backgroundColor, color }]}
      value={searchText}
      onChangeText={(text: string) => {
        setSearchText(text);
        if (text?.trim().length > 0) {
          // Functie pentru setare search result
          handleSearchData(text);
          console.log("Searching for:", text); // Exemplu de implementare
        } else {
          // Functie pentru resetare search result
          handleSearchData(text);
          console.log("Reset search results"); // Exemplu de implementare
        }
      }}
      maxLength={40}
      returnKeyType={"search"}
    />
  );
};
