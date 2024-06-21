import React, { useState, useEffect } from "react";
import { View, Image, Dimensions, StyleSheet } from "react-native";
import { Svg, Circle, Text, Line, Path } from "react-native-svg";

const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;

const calculateX = (angle, radius, centerX) =>
  centerX + radius * Math.cos(degreesToRadians(angle));

const calculateY = (angle, radius, centerY) =>
  centerY + radius * Math.sin(degreesToRadians(angle));

const AstroChart = ({ planets, aspects }) => {
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

  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  const drawZodiac = () => {
    const zodiacDegrees = 30;
    const paths = [];
    for (let i = 0; i < 360; i += zodiacDegrees) {
      const startAngle = i;
      const endAngle = i + zodiacDegrees;
      paths.push(
        <Path
          key={`zodiac-${i}`}
          d={`M ${calculateX(startAngle, radius, centerX)} ${calculateY(
            startAngle,
            radius,
            centerY
          )}
              A ${radius} ${radius} 0 0 1 ${calculateX(
            endAngle,
            radius,
            centerX
          )} ${calculateY(endAngle, radius, centerY)}`}
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
      );
    }
    return paths;
  };

  const drawPlanets = () => {
    return planets.map((planet) => {
      const x = calculateX(planet.position, radius - 20, centerX);
      const y = calculateY(planet.position, radius - 20, centerY);
      return (
        <Text
          key={planet.name}
          x={x}
          y={y}
          fill="yellow"
          fontSize="12"
          textAnchor="middle"
          stroke="black"
          strokeWidth="0.5"
        >
          {planet.symbol}
        </Text>
      );
    });
  };

  const drawAspects = () => {
    return aspects.map((aspect) => {
      const planet1 = planets.find((p) => p.name === aspect.planet1);
      const planet2 = planets.find((p) => p.name === aspect.planet2);
      const x1 = calculateX(planet1.position, radius - 20, centerX);
      const y1 = calculateY(planet1.position, radius - 20, centerY);
      const x2 = calculateX(planet2.position, radius - 20, centerX);
      const y2 = calculateY(planet2.position, radius - 20, centerY);
      return (
        <Line
          key={`${aspect.planet1}-${aspect.planet2}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="red"
          strokeWidth="2"
        />
      );
    });
  };

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        height: size,
        width: size,
      }}
    >
      <Image
        source={require("../../../../assets/astro_chart.png")}
        style={{ width: size, height: size, position: "absolute" }}
      />
      <Svg height={size} width={size}>
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        {drawZodiac()}
        {drawPlanets()}
        {drawAspects()}
      </Svg>
    </View>
  );
};

export default AstroChart;
