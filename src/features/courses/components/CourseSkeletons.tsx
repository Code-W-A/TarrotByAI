import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const useShimmerTranslate = () => {
  const translateX = useRef(new Animated.Value(-180)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    const start = -180;
    const end = width + 260;

    translateX.setValue(start);

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: end,
        duration: 1300,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();
    return () => {
      animation.stop();
    };
  }, [translateX, width]);

  return translateX;
};

const SkeletonBlock: React.FC<{
  shimmerX: Animated.Value;
  style?: StyleProp<ViewStyle>;
}> = ({ shimmerX, style }) => (
  <View style={[styles.skeletonBase, style]}>
    <AnimatedLinearGradient
      pointerEvents="none"
      colors={[
        "rgba(255,255,255,0)",
        "rgba(255,255,255,0.58)",
        "rgba(255,255,255,0)",
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.shimmerStripe, { transform: [{ translateX: shimmerX }] }]}
    />
  </View>
);

export const CourseCardSkeleton: React.FC = () => {
  const shimmerX = useShimmerTranslate();

  return (
    <View style={styles.courseCard}>
      <SkeletonBlock shimmerX={shimmerX} style={styles.courseMedia} />
      <View style={styles.courseBody}>
        <SkeletonBlock shimmerX={shimmerX} style={[styles.skeletonLine, styles.titleLine]} />
        <SkeletonBlock shimmerX={shimmerX} style={[styles.skeletonLine, styles.longLine, styles.spaced]} />
        <SkeletonBlock shimmerX={shimmerX} style={[styles.skeletonLine, styles.mediumLine]} />

        <View style={styles.courseFooter}>
          <SkeletonBlock shimmerX={shimmerX} style={[styles.skeletonLine, styles.priceLine]} />
          <SkeletonBlock shimmerX={shimmerX} style={styles.courseButton} />
        </View>
      </View>
    </View>
  );
};

export const PurchasedCardSkeleton: React.FC = () => {
  const shimmerX = useShimmerTranslate();

  return (
    <View style={styles.purchasedCard}>
      <SkeletonBlock shimmerX={shimmerX} style={styles.purchasedMedia} />
      <View style={styles.purchasedBody}>
        <SkeletonBlock shimmerX={shimmerX} style={[styles.skeletonLine, styles.titleLine]} />
        <SkeletonBlock shimmerX={shimmerX} style={[styles.skeletonLine, styles.longLine, styles.spaced]} />
        <SkeletonBlock shimmerX={shimmerX} style={[styles.skeletonLine, styles.mediumLongLine]} />
        <SkeletonBlock shimmerX={shimmerX} style={[styles.skeletonLine, styles.metaLongLine, styles.spaced]} />
        <SkeletonBlock shimmerX={shimmerX} style={[styles.skeletonLine, styles.metaShortLine]} />
        <SkeletonBlock shimmerX={shimmerX} style={styles.purchasedButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    overflow: "hidden",
    backgroundColor: "#e7dcc5",
  },
  shimmerStripe: {
    position: "absolute",
    top: -2,
    bottom: -2,
    width: 120,
  },
  skeletonLine: {
    borderRadius: 8,
    height: 12,
  },
  titleLine: {
    width: "76%",
    height: 15,
  },
  longLine: {
    width: "92%",
  },
  mediumLine: {
    width: "84%",
  },
  mediumLongLine: {
    width: "89%",
  },
  metaLongLine: {
    width: "58%",
  },
  metaShortLine: {
    width: "46%",
  },
  priceLine: {
    width: "34%",
    height: 14,
  },
  spaced: {
    marginTop: 8,
  },
  courseCard: {
    borderWidth: 1,
    borderColor: "#e5d8bf",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  courseMedia: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#ece2cd",
  },
  courseBody: {
    padding: 12,
  },
  courseFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  courseButton: {
    width: 68,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#e1cfac",
  },
  purchasedCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5d8bf",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  purchasedMedia: {
    width: "100%",
    aspectRatio: 16 / 7,
    backgroundColor: "#ece2cd",
  },
  purchasedBody: {
    padding: 12,
  },
  purchasedButton: {
    marginTop: 12,
    width: 106,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#e1cfac",
  },
});
