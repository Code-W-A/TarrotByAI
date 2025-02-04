import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

const getInitials = (firstName, lastName) => {
  const firstInitial = firstName ? firstName.charAt(0) : '';
  const lastInitial = lastName ? lastName.charAt(0) : '';
  return firstInitial + lastInitial;
};
const getOtherInitials = (patientName) => {
  const words = patientName.split(/\s+/).filter(word => word !== "");
  
  if (words.length >= 2) {
    const firstInitial = words[0][0];
    const lastInitial = words[1][0];
    console.log("getOtherInitials...")
    console.log(firstInitial)
    console.log(lastInitial)
    return firstInitial + lastInitial;
  } else {
    console.log("Numele trebuie să conțină cel puțin două cuvinte. getOtherInitials....");
  }
};

const RoundInitials = ({ firstName, lastName, patientName}) => {
  console.log("patientName-------------")
  console.log(patientName)
  let initials
  if(patientName){
     initials = getOtherInitials(patientName);
    
  }else {

     initials = getInitials(firstName, lastName);
  }

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={[styles.initialsText]}>{initials}</Text>
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // left:50
  },
  circle: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: colors.gray, // Change the background color as needed
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 38,
    color: colors.white, // Change the text color as needed
  },
});

export default RoundInitials;
