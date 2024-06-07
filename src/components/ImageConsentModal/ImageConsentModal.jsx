import React, { useState, useEffect } from 'react';
import { Modal, Text, Provider as PaperProvider, Provider, Portal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View } from 'react-native';
import { Button, SocialMediaLogin } from "../../components/commonButton";
import { colors } from '../../utils/colors';

const ConsentModal = ({hideModalAndSetConsent,visible}) => {


  return (
    <Provider>
      <View style={styles.container}>
        <Portal>
          <Modal visible={visible}  contentContainerStyle={styles.modal}>
            <View style={styles.imageContainer}>
          
            </View>
            <View style={styles.titleContainer}>

              <Text style={styles.subTitle}>Cristina Zurba - Tarot" collects/transmits/syncs/stores images information to enable personalized tarot readings, enhancing your experience by providing insights based on the images you share.</Text>


            </View>
      
            <View style={styles.actionContainer}>
            
            <Button
                            disabled={false}
                            funCallback={() => {
                                hideModalAndSetConsent()
                            }}
                            borderWidth={0.2}
                            bgColor={colors.primary3}
                            // txtColor={colors.primary2}
                            label={"Accept"}
                            borderColor={colors.white}
                            success={true}
                            style={{ marginTop: "10%", width: "70%" }}
                            txtColor={colors.white}
                          />
            </View>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

export default ConsentModal;
const styles = StyleSheet.create({
    feedbackTitle: {
      fontSize: 16,
      color: 'white',
      marginTop: 20,
    },
    feedbackInput: {
      backgroundColor: 'white',
      marginVertical: 10,
      width: '90%', // Ajustează conform design-ului tău
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      zIndex:10
    },
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: 100,
      height: 70,
    },
    titleContainer: {
      alignItems: 'center',
      padding: 15,
    },
    title: {
      fontSize: 20,
      color: 'white',
      marginVertical: 10,
    },
    subTitle: {
      fontSize: 15,
      color: '#D3D3D3',
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 30,
    },
    actionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      display: 'flex',
    },
    modal: {
      backgroundColor: "rgba(40, 49, 64, 0.9)",
      paddingVertical: 20,
      margin: 20,
      borderWidth: 2,
      borderColor: colors.purpleBlue,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex:10
    },
  });
  