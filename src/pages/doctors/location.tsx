import React, {useEffect, useState} from 'react';
import {View, ScrollView, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {
  CardSurface,
  CommonLineDotted,
  RowView,
} from '../../components/commonViews';
import {
  H10fontRegularBlack,
  H14fontRegularBlackk,
  H15fontMediumBlack,
  H18fontMediumBlack,
  H9fontMediumBlack,
  H9fontMediumBlue,
  H9fontRegularBlack,
} from '../../components/commonText';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// import Icon2 from 'react-native-vector-icons/FontAwesome';
import {colors} from '../../utils/colors';
// import Icon from 'react-native-vector-icons/FontAwesome';
import {menuOptions} from '../../utils/constant';
import {alignItemsCenter, flexRow, pl0, pl10, pl5, pt10} from '../../common/commonStyles';
import {useRoute} from '@react-navigation/native';
import { AirbnbRating } from 'react-native-elements';
import { Text } from 'react-native-paper';
import StarRating from 'react-native-star-rating-widget';
import ImageModal from '../../components/ImageModal';
import { labels } from '../../utils/labels';
import i18n from '../../../i18n';

interface Props {clinicInfoDoctor?:any, clinicInfo?:any, ratings?:any}

// const Start = () => {
//   return (
//     <Icon2
//       name="star"
//       size={11}
//       color={colors.yellow}
//       style={{paddingTop: 2}}
//     />
//   );
// };

const LocationView: React.FC<Props> = ({clinicInfoDoctor, ratings, clinicInfo}): JSX.Element => {
  const route = useRoute();
  const doctorRouteInfo = route.params;
  const [selectedImg, setSelectedImg] = useState({})
  const [isModalVisible, setIsModalVisible] = useState({})

  useEffect(() => {
    console.log(clinicInfo.clinicInfoData.clinicname)
  }, []);



  return (
    <View style={styles.container}>
      <CardSurface style={styles.surfaceContainer}>
        <H18fontMediumBlack style={pl10}>
          {clinicInfo.clinicInfoData.clinicname}
        </H18fontMediumBlack>
        {/* <H14fontRegularBlackk style={pl10}>
          {'MDS - Periodontology, BDS'}
        </H14fontRegularBlackk> */}
        <View style={styles.rattingContainer}>
       

            {/* <View style={[flexRow, alignItemsCenter, {marginTop: 5, marginBottom:5}]}>
              <StarRating
                rating={clinicInfo.ratingMedia}
                onChange={(n) => console.log("star pressed")}
                color={colors.facebook}
                starSize={16}
              />
              <Text numberOfLines={2} style={{color:colors.facebook, fontSize:13, marginLeft:5}}>
                {clinicInfo.numberOfReviews ? `${clinicInfo.numberOfReviews} ${clinicInfo.numberOfReviews === 1 ? i18n.translate("review") : i18n.translate("reviews")}` : i18n.translate("noReviews")}{' '}
              </Text> 
            </View> */}
        </View>
        <RowView>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          
            {clinicInfo.clinicImagesURI.map((img) => {
                return (
                      <TouchableOpacity onPress={() => {setIsModalVisible(true); setSelectedImg(img)}}>
                        <View style={styles.imageContainer}>
                        <Image
                style={{height:"100%", width:"100%"}}
                source={{
                  uri: img.img
                  }}
                  />
                  </View>
                  </TouchableOpacity>
                  );
                })}
          </ScrollView>

        </RowView>
        {/* <CommonLineDotted /> */}
     
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={16} color="black" />
          <H9fontMediumBlack style={pl5} style={{maxWidth:"85%", marginLeft:"2%"}}>
            {clinicInfo.clinicAddressLocation.clinicAddress}
          </H9fontMediumBlack>
        </View>
        <View>
          
        <H9fontMediumBlue style={pl10} style={{marginTop:"2%", paddingLeft:"9%"}}>{i18n.translate("getDirections")}</H9fontMediumBlue>
        </View>
        {/* <CommonLineDotted /> */}
        {/* <H14fontRegularBlackk style={pt10}>
          {' Mon - Sat '}
        </H14fontRegularBlackk> */}
        {/* <View style={styles.timingButtonStyleContainer}>
          <View style={styles.timingButtonStyle}>
            <H9fontRegularBlack>{'10:00 AM - 2:00 PM'}</H9fontRegularBlack>
          </View>
          <View style={{paddingLeft: 10}}>
            <View style={styles.timingButtonStyle}>
              <H9fontRegularBlack>{'4:00 PM - 9:00 PM'}</H9fontRegularBlack>
            </View>
          </View>
        </View> */}
      </CardSurface>
      <ImageModal selectedImg={selectedImg} isModalVisible={isModalVisible} setIsModalVisible={() => setIsModalVisible(false)} isNotCreatingProfile = {true}/>

    </View>
  );
};
export default LocationView;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
  },
  surfaceContainer: {
    height: "auto",
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  rattingContainer: {flexDirection: 'row', paddingTop: 5, paddingLeft: 10},
  imageContainer: {
    marginTop: 10,
    marginLeft: 7,
    height: 80,
    width: 80,
    borderRadius: 5,
    overflow: 'hidden',
  },
  imageStyle: {height: 60, width: 60, borderRadius: 5},
  priceSurface: {
    borderRadius: 30,
    height: 55,
    width: 55,
    backgroundColor: colors.white,
    paddingTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContainer: {flexDirection: 'row', paddingTop:13, paddingLeft: 8,  alignItems:"center", flexWrap:"wrap"},
  timingButtonStyle: {
    height: 30,
    width: 135,
    borderWidth: 1,
    borderRadius: 40,
    borderStyle: 'dashed',
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timingButtonStyleContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
});
