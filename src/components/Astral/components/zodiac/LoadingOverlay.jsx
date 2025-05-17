import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../../../../utils/colors";
import i18n from "../../../../../i18n";
import { Video } from 'expo-av';

const LoadingOverlay = ({ isLoadingBuy }) => {
  return (
    <View style={styles.overlay}>
      <Video
        source={require('../../../../../assets/analizerscreennosound.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        isLooping
        shouldPlay
        isMuted
      />
      <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <Text style={{ color: '#131523', fontFamily: 'Lora', fontSize: 18, textAlign: 'center', fontWeight: '600', textShadowColor: 'rgba(255,255,255,0.7)', textShadowRadius: 8 }}>
          {isLoadingBuy ? i18n.translate('spiritualLoading') : i18n.translate('translatingInfo')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.gradientLogin1, // Match this with your background gradient or color
  },
});

export default LoadingOverlay;
