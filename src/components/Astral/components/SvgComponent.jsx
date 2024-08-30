import React from "react";
import { SvgXml } from "react-native-svg";
import base64 from "react-native-base64";

const resizeSVG = (svgString, newWidth, newHeight) => {
  const viewBoxRegex = /<svg\b[^>]*viewBox="[^"]*"/i;

  let modifiedSvg = svgString;

  // Set new width, height, and adjust viewBox and add a translate transform
  modifiedSvg = modifiedSvg.replace(
    /<svg\b/i,
    `<svg width="${newWidth}" height="${newHeight}" viewBox="-100 -100 760 760" preserveAspectRatio="xMidYMid meet" transform="translate(-90, -100)" `
  );

  return modifiedSvg;
};

const SvgComponent = ({ svgBase64, width, height }) => {
  // Assuming svgBase64 is a decoded string for simplicity
  const svgString = svgBase64;
  const resizedSvgString = resizeSVG(svgString, width, height);

  return (
    <SvgXml
      xml={resizedSvgString}
      width={width}
      height={height}
      //   viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet" // Ensures the SVG scales correctly within the given dimensions
    />
  );
};

export default SvgComponent;
