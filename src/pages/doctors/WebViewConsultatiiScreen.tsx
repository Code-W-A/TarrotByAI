import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const WebViewConsultatiiScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#bfa76a" />
        </TouchableOpacity>
        <Text style={styles.title}>Consultatii</Text>
      </View>
      <WebView
        source={{ uri: 'https://www.cristinazurba.com/consultatii' }}
        style={{ flex: 1 }}
        startInLoadingState
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbe6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fffbe6',
    borderBottomWidth: 1,
    borderColor: '#e7c585',
    zIndex: 10,
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(191,167,106,0.08)',
  },
  title: {
    fontSize: 19,
    color: '#bfa76a',
    fontWeight: 'bold',
    letterSpacing: 0.1,
  },
});

export default WebViewConsultatiiScreen; 