import React from "react";
import { TextInput, useColorScheme } from "react-native";

import styles from "./styles";

export const SearchInput: React.FC<{
  searchText: string;
  setSearchText: Function;
  setIsLoading: Function;
  handleSearchData: Function;
}> = ({ searchText, setSearchText, setIsLoading, handleSearchData }) => {
  return (
    <TextInput
      placeholder={"Search"}
      placeholderTextColor={'rgba(201,161,74,0.7)'}
      style={styles.container}
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
