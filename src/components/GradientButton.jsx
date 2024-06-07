import * as React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../utils/colors';
import { H6fontBoldPrimary } from './commonText';


export default function GradientButton({hasRated, onPress, label }) {
  return (
    <>
       {
            hasRated
            ?
    <LinearGradient
      colors={["#e85a82","#ea6e70", "#e8865c", "#e8865c"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.button}
    >
     
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <H6fontBoldPrimary style={styles.text}>{label}</H6fontBoldPrimary>
      </TouchableOpacity>

    </LinearGradient>
            :
            <LinearGradient
            colors={[colors.lightGray,colors.lightGray, colors.lightGray, colors.lightGray]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
                <View onPress={onPress} style={styles.touchable}>
<H6fontBoldPrimary style={styles.text}>{label}</H6fontBoldPrimary>
</View>
</LinearGradient>
        }
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    borderWidth: 0.2,
    borderColor: colors.white,
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
    color: colors.white,
    fontSize:15
    // Add other text styles as needed
  }
});
