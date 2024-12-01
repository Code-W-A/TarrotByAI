import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import DentistIcon from '../../assets/images/dentist-1.svg';

const propStyle = (percent, base_degrees) => {
  const rotateBy = base_degrees + percent * 3.6;
  return {
    transform: [{rotateZ: `${rotateBy}deg`}],
  };
};

const renderThirdLayer = percent => {
  if (percent > 50) {
    return (
      <View
        style={[
          styles.secondProgressLayer,
          propStyle(percent - 50, 45),
        ]}></View>
    );
  } else {
    return <View style={styles.offsetLayer}></View>;
  }
};

const CircularProgressHigh = ({percent}) => {
  let firstProgressLayerStyle;
  if (percent > 50) {
    firstProgressLayerStyle = propStyle(50, -135);
  } else {
    firstProgressLayerStyle = propStyle(percent, -135);
  }

  return (
    <View style={{padding: 20}}>
      {/* <View style={styles.container}> */}
      {/* <View
          style={[styles.firstProgressLayer, firstProgressLayerStyle]}></View>
        {renderThirdLayer(percent)} */}
      <DentistIcon height={50} width={50} />
      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderWidth: 7,
    borderRadius: 100,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstProgressLayer: {
    width: 100,
    height: 100,
    borderWidth: 7,
    borderRadius: 50,
    position: 'absolute',
    borderLeftColor: 'white',
    borderBottomColor: 'white',
    borderRightColor: '#0DD8F9',
    borderTopColor: '#0DD8F9',
    transform: [{rotateZ: '-135deg'}],
  },
  secondProgressLayer: {
    width: 100,
    height: 100,
    position: 'absolute',
    borderWidth: 7,
    borderRadius: 100,
    borderLeftColor: 'white',
    borderBottomColor: 'transparent',
    borderRightColor: '#0DD8F9',
    borderTopColor: '#0DD8F9',
    transform: [{rotateZ: '45deg'}],
  },
  offsetLayer: {
    width: 100,
    height: 100,
    position: 'absolute',
    borderWidth: 7,
    borderRadius: 100,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'grey',
    borderTopColor: 'grey',
    transform: [{rotateZ: '-135deg'}],
  },
  imageStyle: {height: 50, width: 50, alignSelf: 'center'},
});

export default CircularProgressHigh;
