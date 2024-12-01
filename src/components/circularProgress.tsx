import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import Patient from '../../assets/images/patient.svg';

const propStyle = percent => {
  const base_degrees = -135;
  const rotateBy = base_degrees + percent * 3.6;
  return {
    transform: [{rotateZ: `${rotateBy}deg`}],
  };
};

const CircularProgress = ({percent}) => {
  let stylesFromProps = propStyle(percent);
  return (
    <View style={styles.mainContainer}>
      {/* <View style={styles.container}> */}
      {/* <View style={[styles.progressLayer, stylesFromProps]}></View> */}
      {/* <View style={styles.offsetLayer}></View> */}
      <Patient height={50} width={40} />
      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {padding: 20},
  container: {
    width: 100,
    height: 100,
    borderWidth: 7,
    borderRadius: 100,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLayer: {
    width: 100,
    height: 100,
    borderWidth: 7,
    borderRadius: 100,
    position: 'absolute',
    borderLeftColor: 'white',
    borderBottomColor: 'white',
    borderRightColor: '#0DD8F9',
    borderTopColor: '#0DD8F9',
    transform: [{rotateZ: '-135deg'}],
  },
  offsetLayer: {
    width: 100,
    height: 100,
    position: 'absolute',
    borderWidth: 7,
    borderRadius: 100,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'white',
    borderTopColor: 'white',
    transform: [{rotateZ: '-135deg'}],
  },
  imageStyle: {height: 50, width: 40, alignSelf: 'center'},
});

export default CircularProgress;
