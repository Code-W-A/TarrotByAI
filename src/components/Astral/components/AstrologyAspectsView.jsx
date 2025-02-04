import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import axios from "axios";

const AstrologyAspectsView = ({ aspectsData }) => {
  // console.log("aspectsData...", aspectsData);
  return (
    <ScrollView style={styles.container}>
      {aspectsData.map((aspect, index) => (
        <View key={index} style={styles.aspectItem}>
          <Text style={styles.aspectText}>Aspect: {aspect.aspect}</Text>
          <Text style={styles.aspectText}>Orb: {aspect.orb}</Text>
          <Text style={styles.aspectText}>Planet One: {aspect.planetOne}</Text>
          <Text style={styles.aspectText}>Planet Two: {aspect.planetTwo}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  aspectItem: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    marginVertical: 8,
    borderRadius: 10,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowColor: "#000",
    shadowOffset: { height: 0, width: 0 },
  },
  aspectText: {
    fontSize: 16,
    color: "#333",
  },
});

export default AstrologyAspectsView;
