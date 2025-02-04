import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

const EmptyCard = ({ children, style }: any) => {
  return (
    <View style={styles.container}>
      <View style={{ ...styles.mainCardView, ...style }}>{children}</View>
    </View>
  );
};

export default EmptyCard;





export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 1,
    alignItems: 'center',
    width: '100%',
    backgroundColor:"transparent",
    height:"100%"
},
mainCardView: {
      backgroundColor:"transparent",
    height: '100%',
    width: '100%',
    alignItems: 'center',
    // backgroundColor: colors.white,
    borderRadius: 15,
    borderColor:"black",
    borderWidth:1
    // shadowColor: colors.gray,
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 1,
    // shadowRadius: 3,
    // elevation: 3,
  },
});