import React, { useCallback } from "react";
import { Text, TouchableOpacity, useColorScheme } from "react-native";
import styles from "./styles";

export const Tag: React.FC<{
  category: String;
  selectedCategory: String;
  setSelectedCategory: Function;
  toSelectCat: String;
}> = ({ category, toSelectCat, selectedCategory, setSelectedCategory }) => {
  const handlePress = useCallback(() => {
    setSelectedCategory(toSelectCat);
  }, [category, setSelectedCategory]);
  const isSelected = selectedCategory === toSelectCat;
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selected,
      ]}
      onPress={handlePress}
    >
      <Text style={[
        styles.text,
        isSelected && styles.selectedText,
      ]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
    </TouchableOpacity>
  );
};
