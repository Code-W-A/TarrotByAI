import moment from "moment";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./styles";
import { useLanguage } from "../../context/LanguageContext";

type Post = {
  id: string;
  title: String;
  image: any;
  firstUploadDate: any;
  info: any;
  content: String;
  urlToImage?: string;
  publishedAt?: string;
  url?: string;
  author?: string;
};

export const NewsCard: React.FC<{
  post: Post;
  onPress: any;
}> = ({ post, onPress }) => {

  const { language, changeLanguage } = useLanguage();

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.container}
      onPress={() => onPress(post)}
    >
      <Image
        source={{
          uri: post?.image?.finalUri ?? "https://picsum.photos/800",
          cache: "force-cache",
        }}
        resizeMode={"cover"}
        style={styles.image}
      />
      <LinearGradient
        colors={["#0000", "#000A", "#000"]}
        style={styles.titleContainer}
      >
        <Text style={[styles.text, {marginBottom:"2%"}]}>
          {language === "hi"
            ? post.info.hu.nume
            : language === "id"
              ? post.info.ru.nume
              : post.info[language].nume}
        </Text>
{/* <View style={{flex:1, flexDirection:"row", height:"2%", backgroundColor:"red"}}> */}
        <Text style={[styles.timestamp, {marginRight:"6%"}]}>{post?.firstUploadDate}</Text>
        <Text style={styles.timestamp}>{post?.firstUploadtime}</Text>
        {/* </View> */}
      </LinearGradient>
    </TouchableOpacity>
  );
};
