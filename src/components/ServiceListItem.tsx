// FlatListItem.js
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors } from '../utils/colors';
import { H7fontMediumPrimary } from './commonText';


interface Props {
  item?:any, 
  handleServiceRemoval?:any, 
  isSelect?:boolean,
  selectedServices?:any,
  setSelectedServices?:any
}

const ServiceListItem: React.FC<Props> = ({ item, handleServiceRemoval, isSelect, selectedServices, setSelectedServices }) => (

 isSelect ?
    <TouchableOpacity style={[styles.serviceItem, {backgroundColor: selectedServices.includes(item) ? colors.primary2 : "transparent"}]} onPress={() => setSelectedServices(item)}>
      <Text style={{color: selectedServices.includes(item) ? colors.white : colors.black}}>
        {item}
      </Text>
 
    </TouchableOpacity>
    :
    <View style={styles.serviceItem}>
      <H7fontMediumPrimary>
        {item}
      </H7fontMediumPrimary>
      <TouchableOpacity onPress={() => handleServiceRemoval(item)} style={styles.removeButton}>
        <Ionicons name="ios-close-circle" size={24} color={colors.primary2} />
      </TouchableOpacity>
    </View>
  
);

const styles = StyleSheet.create({
  serviceItem: {
    margin: 5,
    marginTop: 10,
    padding: 2,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    marginLeft: 8,
    position: "relative",
    top: -16,
    right: -5,
  },
});

export default ServiceListItem;
