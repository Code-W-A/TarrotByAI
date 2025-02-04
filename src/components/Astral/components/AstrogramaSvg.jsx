import { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import { Svg, Circle, Line, Text } from "react-native-svg";

const AstrogramaSvg = ({ svgXml }) => {
  const [size, setSize] = useState(
    Math.min(Dimensions.get("window").width, 270)
  );

  useEffect(() => {
    const updateSize = () => {
      setSize(Math.min(Dimensions.get("window").width, 270));
    };

    Dimensions.addEventListener("change", updateSize);
    return () => Dimensions.removeEventListener("change", updateSize);
  }, []);

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        height: size,
        width: size,
      }}
    >
      <Svg height="400" width="400" viewBox="0 0 400 400">
        <Circle cx="200" cy="200" r="180" stroke="#7c7c7c" fill="#fff" />
        {/* Adaugă restul elementelor SVG aici după modelul de mai sus */}
        {svgXml.lines.map((line, index) => (
          <Line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#000"
          />
        ))}
        {svgXml.texts.map((text, index) => (
          <Text
            key={index}
            x={text.x}
            y={text.y}
            fill="#000"
            fontFamily="Tahoma"
            fontSize="10"
          >
            {text.content}
          </Text>
        ))}
      </Svg>
    </View>
  );
};

export default AstrogramaSvg;
