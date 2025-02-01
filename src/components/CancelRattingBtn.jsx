import * as React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../utils/colors';
import { H6fontBoldPrimary } from './commonText';


export default function CancelRattingBtn({ onPress, label }) {
  return (
    <View

      style={styles.button}
    >
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <H6fontBoldPrimary style={styles.text}>{label}</H6fontBoldPrimary>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D3D3D3",
    marginTop: '10%',
    width: '40%',
  },
  touchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10, // Set the padding as needed
  },
  text: {
    color: "#D3D3D3",
    fontSize:15
    // Add other text styles as needed
  }
});
