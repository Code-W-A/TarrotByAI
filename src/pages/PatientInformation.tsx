import {
    View,
    Text,
    Image,
    TouchableOpacity,
    useWindowDimensions,
    FlatList,
    TextComponent,
    ImageBackground,
  } from "react-native";
  import React, { useState } from "react";
  import { SafeAreaView } from "react-native-safe-area-context";

  import { StatusBar } from "expo-status-bar";
  import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Avatar, Card, IconButton } from "react-native-paper";
import { colors } from "../utils/colors";
import Patient7 from '../../assets/images/blank-profile.svg';
import { StyleSheet } from "react-native";
import { MainContainer } from "../components/commonViews";
import { NavBar } from "../common/commonComponents";
import i18n from "../../i18n";
import { useRoute } from "@react-navigation/native";
  

const data =[
    {title:"Exercises", content:"a sdas dasdasdas das fa sf as"},
    {title:"Prescriptions", content:"asfasmfas faslkfaslfkmasfkasflkas flas flkas fkaskfklsaflkkl  as"}
]



  
  const PatientInformation = () => {
 
    const route = useRoute()

    return (
        <MainContainer>
            <ImageBackground source={require('../images/profilePatientBG.jpeg')} style={{ flex: 1}}  resizeMode="cover">
                    <NavBar
                title={i18n.translate("clinicPatients")}
                navHeight={80}
                isModal={false}
                isTermsAccepted={true}
                isGoBack={route.params.isGoBack}
            />
                <View style={styles.container}>
        
                
                {/* Middle */}
                <View style={styles.main}>
            <View style={styles.imageContainer}>
                {/* <Image style={styles.image} source={require("../../assets/images/blank-profile.svg")} /> */}
                <View style={styles.profileImage}>
                <Patient7 height={160} width={160}/>
                </View>
                <Text style={{ fontSize: 16, color: colors.facebook, fontWeight: "bold", marginTop:"4%" }}>
                Abena Dorcas
                </Text>
                <Text style={{ fontSize: 20, color: colors.facebook, fontWeight: "bold", marginTop:"5%" }}>
                Patient Information
                </Text>
                {/* <Text
                style={{ fontSize: 16, color: colors.gray, fontWeight: "500" }}
                >
                abenadorcas@gmail.com
                </Text> */}
            </View>

            {/* <View style={styles.middleSectionTextContainer}>
                <View style={styles.middleSectionText}>
                <Text style={styles.toptext}>Applied</Text>
                <Text style={styles.bottomtext}>28</Text>
                </View>
                <View style={styles.middleSectionText}>
                <Text style={styles.toptext}>Reviewed</Text>
                <Text style={styles.bottomtext}>73</Text>
                </View>
                <View style={styles.middleSectionText}>
                <Text style={styles.toptext}>Contacted</Text>
                    <Text style={styles.bottomtext}>18</Text>
                </View>
            </View> */}
            </View>
                {/* Middle */}

                {/* Bottom */}
                <View style={styles.bottomContainer}>
    

            <View style={styles.completeContainer}>
                <Card
                icon={
                    <FontAwesome
                    name="graduation-cap"
                    size={24}
                    color={colors.facebook}
                    />
                }
                cardTextOne="02 Steps"
                cardText="Education"
                style={{ backgroundColor: colors.facebook}}
                />
                <Card
                icon={
                    <FontAwesome name="briefcase" size={24} color={colors.seaBlue} />
                }
                cardTextOne="04 Steps"
                cardText="Professional"
                style={{ backgroundColor: colors.seaBlue }}
                />
            </View>


            </View>
                
            {/* <FlatList
        data={DATA}
        renderItem={({item}) => <Item title={item.title} />}
        keyExtractor={item => item.id}
      /> */}
                </View>
            </ImageBackground>
        </MainContainer>
    );
  };
  
  export default PatientInformation;

  const styles = StyleSheet.create({
    profileImage:{
        height: "auto",
        width: "auto",
        borderRadius: 50,
        borderWidth: 5,
        borderColor: '#f7f7f7',
        overflow: 'hidden',
    },
    backgroundImage: {
      flex: 1,
      resizeMode: "cover",
      backgroundColor:colors.bookBlue
    },
    container: {
      marginHorizontal: 10,
      marginTop: 10,
    },

    icons: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
      back:{
        backgroundColor: colors.facebook,
        width: 45,
        height: 45,
        borderTopLeftRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: "center",
        alignItems: "center",
      },


      main: {
        marginTop: 30,
      },
      imageContainer: {
        justifyContent: "center",
        alignItems: "center",
      },
      image: {
        width: 150,
        height: 150,
        borderRadius: 50,
        marginBottom: 5,
      },
      middleSectionTextContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 20,
      },
      middleSectionText: {
        justifyContent: "center",
        alignItems: "center",
      },
      toptext: {
        fontSize: 16,
        color:  colors.facebook,
        fontWeight: "bold",
      },
      bottomtext: {
        fontSize: 16,
        color: colors.gray,
        fontWeight: "700",
      },

      bottomContainer: {
        marginTop: 10,
      },
      completeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
      },
      card: {
        backgroundColor: colors.seaBlue,
      },
      bottomSection: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
      },
      bottomSectionText: {
        fontWeight: "bold",
        fontSize: 10,
        color: colors.gray,
        borderBottomWidth: 1,
        marginBottom: 5,
        borderBottomColor: colors.gray,
      }

      
  });