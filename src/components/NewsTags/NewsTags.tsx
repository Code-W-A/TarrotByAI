import React from "react";
import { FlatList } from "react-native";

import styles from "./styles";
import { NewsCategory } from "../../utils/constant";
import { Tag } from "./Tag";
import i18n from "../../../i18n";

export const NewsTags: React.FC<{
  selectedCategory: String;
  setSelectedCategory: Function;
}> = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={NewsCategory}
      keyExtractor={(item: string) => item}
      renderItem={({ item }: any) => (
        <Tag
          category={i18n.translate(item)}
          toSelectCat={item}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
    />
  );
};
