import React, {useEffect, useState} from 'react';
import {View, ScrollView, Image, StyleSheet, TouchableOpacity, Platform, Linking} from 'react-native';
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
import {colors} from '../../utils/colors';
import {menuOptions} from '../../utils/constant';
import {alignItemsCenter, flexRow, pl0, pl10, pl5, pt10} from '../../common/commonStyles';
import {useRoute} from '@react-navigation/native';
import { AirbnbRating } from 'react-native-elements';
import { Text } from 'react-native-paper';
import StarRating from 'react-native-star-rating-widget';
import ImageModal from '../../components/ImageModal';
import { labels } from '../../utils/labels';
import i18n from '../../../i18n';

interface Props {clinicInfo?:any, ratings?:any}

const LocationViewClinic: React.FC<Props> = ({clinicInfo, ratings}): JSX.Element => {
  const route = useRoute();
  const doctorRouteInfo = route.params;

  const [selectedImg, setSelectedImg] = useState({})
  const [isModalVisible, setIsModalVisible] = useState({})

  const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
const latLng = `${clinicInfo.clinicAddressLocation.clinicCoords.lat},${clinicInfo.clinicAddressLocation.clinicCoords.lng}`;
const label = 'Custom Label';
const url = Platform.select({
  ios: `${scheme}${label}@${latLng}`,
  android: `${scheme}${latLng}(${label})`
});

    



  useEffect(() => {
    console.log('clinicInfo...', clinicInfo.clinicAddressLocation.clinicCoords
    );
  }, []);

  // return(
  //   <View>
  //     <Text>
  //       asdsadas
  //     </Text>
  //   </View>
  // )

  return (
    <View style={styles.container}>
      <CardSurface style={styles.surfaceContainer}>
        <H18fontMediumBlack style={pl10}>
          {clinicInfo.clinicInfoData.clinicname}
        </H18fontMediumBlack>

        {/* <View style={styles.rattingContainer}>
        <View style={[flexRow, alignItemsCenter, {marginTop: 5}]}>
              <StarRating
        rating={clinicInfo.ratingMedia}
        onChange={(n) => console.log("star pressed")}
        color={colors.facebook}
        starSize={16}
      />
              <Text numberOfLines={2} style={{color:colors.facebook, fontSize:13, marginLeft:5}}>
                {clinicInfo.numberOfReviews ? `${clinicInfo.numberOfReviews} ${clinicInfo.numberOfReviews === 1 ? i18n.translate("review") : i18n.translate("reviews")}` : i18n.translate("noReviews")}{' '}
              </Text> 
            </View>
        </View> */}

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
          {/* <CardSurface style={styles.priceSurface}>
            <H14fontRegularBlackk>{'$250'}</H14fontRegularBlackk>
          </CardSurface> */}
        </RowView>
        {/* <CommonLineDotted /> */}
     
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={16} color="black" />
          <H9fontMediumBlack style={pl5}>
            {clinicInfo.clinicAddressLocation.clinicAddress}
          </H9fontMediumBlack>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(url)}>
        <H9fontMediumBlue style={pl10}>{i18n.translate("getDirections")}</H9fontMediumBlue>
        </TouchableOpacity>
      </CardSurface>
      <ImageModal selectedImg={selectedImg} isModalVisible={isModalVisible} setIsModalVisible={() => setIsModalVisible(false)} isNotCreatingProfile = {true}/>
    </View>
  );
};
export default LocationViewClinic;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
  },
  surfaceContainer: {
    height: 230,
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
  addressContainer: {flexDirection: 'row', paddingTop:13, paddingLeft: 8,  alignItems:"center"},
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
