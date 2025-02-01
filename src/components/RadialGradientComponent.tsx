import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const RadialGradientComponent = () => {
  return (
    <Svg height="100%" width="100%" viewBox="0 0 100 100">
      <Defs>
        <RadialGradient
          id="grad"
          cx="50%"
          cy="50%"
          rx="50%"
          ry="50%"
          fx="50%"
          fy="50%"
        >
          <Stop offset="0%" stopColor="#4c669f" stopOpacity="1" />
          <Stop offset="100%" stopColor="#192f6a" stopOpacity="1" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill="url(#grad)" />
    </Svg>
  );
};

export default RadialGradientComponent;
