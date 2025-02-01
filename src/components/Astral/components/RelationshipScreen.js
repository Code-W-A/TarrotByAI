import i18n from "i18n-js";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Headline, Text } from "react-native-paper";

import Cool from "../../../svgs/Cool";
import InLove from "../../../svgs/InLove";
import ItsDifficult from "../../../svgs/ItsDifficult";
import Married from "../../../svgs/Married";

function RelationshipScreen({ navigation }) {
  const [relationshipStatus, setRelationshipStatus] = React.useState("");

  return (
    <>
      <View style={{ backgroundColor: "red" }} />

      <View style={styles.sexContainer}>
        <TouchableOpacity
          onPress={() => setRelationshipStatus("Married")}
          rippleColor="rgba(0,0,0,0)"
        >
          <View>
            <Married
              width={100}
              style={{ opacity: relationshipStatus === "Married" ? 1 : 0.5 }}
            />
            <Text style={styles.sexText}>Casatorit</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRelationshipStatus("Single")}
          rippleColor="rgba(0,0,0,0)"
        >
          <View>
            <Cool
              width={100}
              style={{ opacity: relationshipStatus === "Single" ? 1 : 0.5 }}
            />
            <Text style={styles.sexText}>Singur</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 0.1 }} />
      <View style={styles.sexContainer}>
        <TouchableOpacity
          onPress={() => setRelationshipStatus("In love")}
          rippleColor="rgba(0,0,0,0)"
        >
          <View>
            <InLove
              width={100}
              style={{ opacity: relationshipStatus === "In love" ? 1 : 0.5 }}
            />
            <Text style={styles.sexText}>Indragostit</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRelationshipStatus("It's difficult")}
          rippleColor="rgba(0,0,0,0)"
        >
          <View>
            <ItsDifficult
              width={100}
              style={{
                opacity: relationshipStatus === "It's difficult" ? 1 : 0.5,
              }}
            />
            <Text style={styles.sexText}>Este dificil</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  constellation: {
    zIndex: 0,
    position: "absolute",
    bottom: 20,
    left: 20,
    opacity: 0.1,
  },
  taurus: {
    zIndex: 0,
    position: "absolute",
    top: 20,
    right: 20,
    opacity: 0.2,
  },
  textContainer: {
    flex: 1,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  textHeadline: {
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  textText: {
    textAlign: "center",
    paddingVertical: 5,
  },
  logoContainer: {
    flex: 1,
    alignSelf: "center",
    paddingVertical: 25,
    zIndex: 1,
  },
  sexContainer: {
    flex: 1,
    paddingHorizontal: 60,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sexText: {
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  buttonContainer: {
    flex: 0.5,
    paddingHorizontal: 20,
    paddingTop: 35,
    justifyContent: "flex-end",
    marginBottom: 20,
  },
});

export default RelationshipScreen;
