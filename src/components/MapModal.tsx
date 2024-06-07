import React, { useEffect, useState } from 'react';
import {StyleSheet, Modal, View, TouchableOpacity, Image, ScrollView} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Badge, Text, TextInput } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { Entypo } from '@expo/vector-icons';
import ClinicDetailsCard from './ClinicComponents';
import { useNavigation } from '@react-navigation/native';
import { screenName } from '../utils/screenName';
import DoctorDetailsCard from './doctorComponents';

export default function MapModal({isVisible,setIsVisible,doctorsAround, patientLocation,isDoctors, children, toggleModal, isGoBack}) {
    const [mapType, setMapType] = useState("standard")
    const [selectedItem, setSelectedItem] = useState([])
    const navigation = useNavigation();
    //OR HYBRID
    useEffect(() => {
        // console.log("selectedItem...",selectedItem[0].clinicDoctors)
        // console.log("doctorsAround...",doctorsAround[0].isClinic)
        
        // console.log("selectedItem...", selectedItem[0].clinicDoctors.length)
     

    })

    let coordsArr = [];

    // return(
    //   <View>
    //     <Text>
    //       asda
    //     </Text>
    //   </View>
    // )

  return (
    // <View style={styles.container}>

      <Modal visible={isVisible}>
            <MapView style={styles.mapView}     
            initialRegion={{
            latitude: patientLocation.coords.latitude,
            longitude: patientLocation.coords.longitude,
            latitudeDelta: 1.3922,
            longitudeDelta: 0.1421,
          }}
          toolbarEnabled={false}
            mapType={mapType}
            showsUserLocation={true}
            showsCompass={false}
            >

         
      
                {doctorsAround.map((item, index)=>{
                  let lat; 
                  let lng;
            
           
                    lat = item.clinicAddressLocation.clinicCoords.lat;
                    lng = item.clinicAddressLocation.clinicCoords.lng;

                
                  return (
                        <Marker
                        coordinate={{
                          latitude: lat,
                          longitude: lng,
                        }}
                        // description={"This is a marker in React Natve"}
                        key={index}
                        onPress={() => setSelectedItem([item])}
                        >
                         <View style={{}}>
                        <Image source={{uri: item.clinicMainImage.img}} style={{height: 35, width:35, borderRadius:50 }} />
                    {isDoctors && <Badge style={{position:"absolute", right:0, backgroundColor: colors.bookBlue}} size={19}>{item.clinicDoctors.length}</Badge>}
                        </View>
                      </Marker> 

                )})}
            </MapView>
            <View style={{ position: 'absolute', top: 10, left:10, width: 'auto', flexDirection:"row", justifyContent:"space-around" }}>
                <TouchableOpacity onPress={() => setIsVisible()}>
                <AntDesign name="close" size={34} color={colors.black} />
                </TouchableOpacity>
                {children}
            </View>
            {selectedItem.length > 0 && selectedItem[0].isClinic && !isDoctors ? 
            <View style={{ position: 'absolute', bottom: 30, width: 'auto', marginLeft:20 }}>
            <ClinicDetailsCard
                          page={'home'}
                          details={selectedItem[0]}
                          bookAnAppointment={() => {
                            navigation.navigate(screenName.ClinicDoctorsPatient, {
                              clinicDoctors: selectedItem[0].clinicDoctors, isGoBack
                            });
                            setIsVisible()
                          }}
                          clinicProfileNavigation={() => {
                            navigation.navigate(screenName.ClinicProfile,{item: selectedItem[0], isGoBack});
                            setIsVisible()
                          }}
                        />
            </View>
          :  selectedItem.length > 0 && isDoctors ?
          <ScrollView horizontal style={{ position: 'absolute', bottom: 30, width: 'auto'}} contentContainerStyle={{ justifyContent:"space-around"}}>
            {selectedItem[0].clinicDoctors.map((item,index)=>(
                <DoctorDetailsCard
                page={'home'}
                // marginR={"7%"}
                details={item}
                marginH={selectedItem.length === 1 ? 10 : 10}
                bookAnAppointment={() => {
                  navigation.navigate(screenName.ClinicDoctorsPatient, {
                    clinicDoctors: selectedItem[0].clinicDoctors,
                  });
                  setIsVisible()
                }}
                drProfileNavigation={() => {
                  navigation.navigate(screenName.DoctorProfile,{item});
                  setIsVisible()
                }}
                
              />
            ))}
        
          </ScrollView>
        : null  
        }
      </Modal>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
});