import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Image, Modal, TouchableOpacity, View, StyleSheet } from 'react-native'
import { H15fontMediumBlack } from './commonText'
import { colors } from '../utils/colors'

export default function ImageModal({setIsModalVisible,isModalVisible, selectedImg, isNotCreatingProfile, handleMainImg}) {
  return (
    <Modal
    animationType="fade"
    transparent={true}
    visible={isModalVisible}
    // onRequestClose={() => {
    //   Alert.alert('Modal has been closed.');
    //   setModalVisible(!modalVisible);
    // }}

    >
    <View style={[styles.centeredView]}>
      <View style={{ width:"100%", height:"10%", top:"29%",left:"-2%", position:"absolute", zIndex:2}}>
      <TouchableOpacity style={styles.modalView} onPress={() => setIsModalVisible(false)}>
      <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      </View>
      <View style={{ width:"100%", height:"40%"}}>
      <Image
                source={{uri: selectedImg.img}}
                style={{width:"100%", height:"100%"}}
              />
      </View>
      {
        isNotCreatingProfile
        ? null
        :
      <View style={{ width:"100%", height:"7%", justifyContent:"center", alignItems:"center", backgroundColor:"rgba(239, 239, 240, 1)"}}>
           <TouchableOpacity style={[styles.modalView, {width:"98%", height:"80%", borderRadius:10}]} onPress={() => handleMainImg(selectedImg)}>
            <View>
                <H15fontMediumBlack style={{fontSize:20, fontWeight:"bold"}}>
                  Set as main image
                </H15fontMediumBlack>
            </View>
          </TouchableOpacity>
      </View>
    }
    </View>
  </Modal>
  )
}

const styles = StyleSheet.create({
    centeredView: {
      
     flex:1,
      justifyContent: 'center',
      alignItems: 'center',
      // marginTop: 22,
      backgroundColor:"rgba(239, 239, 240, 0.3)"

      
    },
    modalView: {
      justifyContent:"center",
      alignItems:"center",
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      // padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width:"15%",
      height:"40%"
    },
    sideMenuStyle: {
      margin: 0,
      width: 100,
    },
    nextButtonStyle: {
      height: 45,
      backgroundColor: '#1B5A90',
      marginVertical: 10,
      borderRadius: 30,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
      marginTop: 30,
    },
    clinicImageContainer: {
      height: 70,
      width: 70,
      borderStyle: 'dashed',
      borderColor: '#CFCFCF',
      borderRadius: 15,
      borderWidth: 1,
      marginTop: 10,
      marginBottom: 10,
      marginLeft:5,
      backgroundColor: colors.background,
    },
    clicnicImageStyle: {height: 70, width: 70, borderRadius:20, margin:5},
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {marginHorizontal: 10},
    bodyStyle: {paddingHorizontal: 10, paddingTop: 10},
    // containerMap: {
    //   flex: 1,
    //   justifyContent: 'center',
    //   // paddingTop: Constants.statusBarHeight,
    //   // paddingTop: 20,
    // },
  });;