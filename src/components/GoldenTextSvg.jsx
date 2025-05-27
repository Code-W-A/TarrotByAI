// GoldenTextSvg.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

// ✔️ nimic de instalat – react-native-svg e deja în package.json
export default function GoldenTextSvg({
  children,
  fontSize = 48,
  fontWeight = '900',
  style,
}) {
  return (
    <View style={[styles.wrapper, style]}>
      <Svg height={fontSize * 1.25} width="100%">
        {/* 1️⃣ definim gradientul */}
        <Defs>
          <LinearGradient
            id="goldGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {/* lumini → ton mediu → umbre */}
            <Stop offset="0%" stopColor="#FFF9C4" />
            <Stop offset="25%" stopColor="#FFD700" />
            <Stop offset="75%" stopColor="#FFA500" />
            <Stop offset="100%" stopColor="#B8860B" />
          </LinearGradient>
        </Defs>

        {/* 2️⃣ textul propriu-zis */}
        <SvgText
          // umplere cu gradient
          fill="url(#goldGradient)"
          // contur subțire, mai închis, pentru relief
          stroke="#B8860B"
          strokeWidth={fontSize * 0.035}
          fontSize={fontSize}
          fontWeight={fontWeight}
          // centru pe orizontală
          x="50%"
          y={fontSize}
          textAnchor="middle"
        >
          {children}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // mică umbră externă pentru profunzime
    shadowColor: '#B8860B',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    // pe Android:
    elevation: 4,
  },
});
