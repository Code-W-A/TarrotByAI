import React, { Fragment, useEffect, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  H6fontBoldWhite,
  H7fontBoldPrimary,
  H7fontMediumWhite,
} from "../components/commonText";
import i18n from "../../i18n";
import { MainContainer } from "../components/commonViews";
import CustomLoader from "../components/customLoader";
import { LinearGradient } from "expo-linear-gradient";
import GreetingBar from "../components/UpperGreetingBar/GreetingBar";
import ImageRow from "../components/HistoryRow/HistoryRow";
import { colors } from "../utils/colors";
import {
  collection,
  query,
  orderBy,
  startAfter,
  endBefore,
  limit,
  getDocs,
} from "firebase/firestore";
import { authentication, db } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";
import { parseDate } from "../utils/commonUtils";

const ITEMS_PER_PAGE = 4;

export default function HistoryTarrot() {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);

  const route = useRoute();
  const { historyType } = route.params;

  const location =
    historyType === i18n.translate("historyTypeFuture")
      ? "FutureReading"
      : "PersonalReading";

  const loadImages = async () => {
    setIsLoading(true);
    console.log(location);
    try {
      const newQuery = query(
        collection(db, "Users", authentication.currentUser.uid, location),
        orderBy("date"),
        limit(20)
      );
      const querySnapshot = await getDocs(newQuery);

      if (!querySnapshot.empty) {
        const newImages = querySnapshot.docs.map((doc) => doc.data());
        newImages.sort((a, b) => b.createdAt - a.createdAt);

        setImages(newImages);
      }
    } catch (error) {
      console.error("Error fetching images: ", error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    console.log(historyType);
    loadImages();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Fragment>
        <MainContainer style={{ flex: 1 }}>
          <CustomLoader isLoading={isLoading} />
          <LinearGradient
            colors={[
              colors.gradientLogin1,
              colors.gradientLogin2,
              colors.gradientLogin3,
            ]}
            style={styles.gradient}
          >
            <GreetingBar isGoBack={true} />
            <View style={styles.historyHeader}>
              <H6fontBoldWhite>{i18n.translate("history")}</H6fontBoldWhite>
              <H7fontMediumWhite style={{ marginTop: 10 }}>
                {historyType}
              </H7fontMediumWhite>
            </View>
            <View style={{ height: "72%" }}>
              <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {images.map((imageData, index) => {
                  if (imageData.data.length > 0) {
                    return (
                      <ImageRow
                        key={index}
                        data={imageData.data}
                        date={imageData.date}
                        id={imageData.id}
                        historyType={location}
                      />
                    );
                  }
                })}
              </ScrollView>
            </View>
          </LinearGradient>
        </MainContainer>
      </Fragment>
    </View>
  );
}

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  historyHeader: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  pageNumber: {
    margin: 5,
    padding: 5,
  },
  activePage: {
    margin: 5,
    padding: 5,
    color: "blue",
  },
});
