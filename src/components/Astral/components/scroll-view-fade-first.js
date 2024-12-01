import PropTypes from "prop-types";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

/**
 * @constructor
 */
function ScrollViewFadeFirst({ children, element, height, style }) {
  const [opacity, setOpacity] = useState(1);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const controlledOffset = offsetY < 0 ? 0 : offsetY;
    const smallerHeight = controlledOffset ? height * 0.7 : height;
    const calcOpacity =
      (((smallerHeight - controlledOffset) * smallerHeight) / 100) * 0.01;

    // Creștem pragul pentru a reapărea mai devreme
    setOpacity(calcOpacity < 0.2 ? 0 : calcOpacity > 1 ? 1 : calcOpacity);
  };

  return (
    <ScrollView
      style={[style, { flex: 1 }]} // Asigură extinderea pe întreaga înălțime
      stickyHeaderIndices={[0]}
      scrollEventThrottle={2}
      onScroll={handleScroll}
      contentContainerStyle={{ paddingBottom: 100 }} // Adaugă padding pentru a preveni tăierea conținutului
    >
      <View style={{ opacity }}>
        <View style={[StyleSheet.absoluteFill, { height, zIndex: 10 }]}>
          {element}
        </View>
        <View style={{ height }} />
      </View>
      {children}
    </ScrollView>
  );
}

ScrollViewFadeFirst.propTypes = {
  element: PropTypes.element.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object,
};

export default ScrollViewFadeFirst;
