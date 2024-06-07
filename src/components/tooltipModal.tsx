import React from 'react';
import { Tooltip, Text, lightColors } from '@rneui/themed';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
// import Modal from 'modal-react-native-web';

const { height } = Dimensions.get('window');

export const ControlledTooltip: React.FC<any> = (props) => {
  
  return (
    <Tooltip
    
  
      {...props}
    />
  );
};