import * as React from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {colors} from '../utils/colors';
// import {DevWidth} from '../utils/device';
import Doctor2 from '../../assets/images/blank-profile.svg';
import {Dimensions} from 'react-native';
import {Feather, MaterialIcons} from '@expo/vector-icons';
import {Entypo} from '@expo/vector-icons';
import {
  H10fontRegularBlack,
  H13fontRegularGray,
  H14fontRegularBlack,
  H14fontRegularBlackk,
  H14fontRegularBlue,
  H14fontRegularGray,
  H15fontMediumBlack,
  H6fontMediumWhite,
  H7fontRegularBlack,
  H8fontMediumBlack,
  H8fontMediumLightBlack,
  H8fontRegularWhite,
  H9fontMediumBlack,
  H9fontMediumBlue,
  H9fontMediumWhite,
} from './commonText';
import {CardSurface, CommonLineDotted, RowView} from './commonViews';
// import Icon2 from 'react-native-vector-icons/FontAwesome';
// import Icon3 from 'react-native-vector-icons/AntDesign';
import {DoctorDetailsProps} from '../interfaces/generalProps';
import {
  alignItemsCenter,
  flex1,
  flexRow,
  justifyStart,
  justyfyCenter,
  mh10,
  ml10,
  pl10,
  pl5,
  pt5,
  pv10,
  pv5,
  pl2,
  ml5,
  mv10,
  mr10,
  pt10,
  spaceBetween,
} from '../common/commonStyles';
import {labels} from '../utils/labels';
import Doctor1 from '../../assets/images/blank-profile.svg';
import DentistIcon from '../../assets/images/specialities/specialities-05.svg';
import { AirbnbRating } from 'react-native-elements';
import StarRating from 'react-native-star-rating-widget';
import i18n from '../../i18n';
interface DoctorDetailsCardProps {
  clinicProfileNavigation: CallableFunction;
  bookAnAppointment: CallableFunction;
  details: DoctorDetailsProps;
  page: string;
  width?:any;
}

const ClinicDetailsCard: React.FC<DoctorDetailsCardProps> = ({
  clinicProfileNavigation,
  bookAnAppointment,
  details,
  page,
  width
}) => {
  console.log('details', details.clinicMainImage);
  return (
    
    <View

    style={{
      height: 190,
      backgroundColor: 'white',
      borderRadius: 30,

      width: 330,

      marginTop:10,
    }}>
  

    <RowView style={{width: '100%', height:"100%"}}>
      <View
        style={{

          flexDirection: 'row',
          width: '100%',
          height:"100%"
        }}>
        <View style={styles.chip} >
              <Text style={{color:"white", flexWrap:"wrap"}}>
         

              {details.distanceToPatient &&
              details.distanceToPatient.stringDistance}{' '}
            {details.distanceToPatient &&
              details.distanceToPatient.distanceType}
              </Text>
        </View>
        <TouchableOpacity
          style={{
            height: "100%",
            width: '45%',
            borderTopLeftRadius: 30,
            borderBottomLeftRadius: 30,
            overflow: 'hidden',
          }}
          onPress={() =>
            clinicProfileNavigation()
          }
          >
                   {details.clinicMainImage
            ?
              <Image
              style={{height:"100%", width:"100%"}}
              source={{
                uri: details.clinicMainImage.img,
              }}
            />
            :
            <Doctor1 height={'100%'} width={'150%'} />
          }
        </TouchableOpacity>

        <View style={{paddingLeft: 10, width: '55%', paddingRight:20}}>
   
                  <RowView
            style={{
         
              width: '100%',
              
            }}>
            <View
              style={{
                flexDirection: 'row',
                paddingVertical: 0,
                justifyContent:"flex-start",
                width: '100%',
              }}>
              <H9fontMediumBlue numberOfLines={1}>
                {i18n.translate("clinic")}
              </H9fontMediumBlue>
            </View>
          </RowView>
          <RowView
            style={{
           
              width: '100%',
              
            }}>
            <View
              style={{
                flexDirection: 'row',
                paddingVertical: 2,
                justifyContent:"flex-start",
                width: '100%',
              }}>
              <H7fontRegularBlack numberOfLines={1}>
              {details.clinicInfoData
                    ? details.clinicInfoData.clinicname
                    : ''}{' '}
              </H7fontRegularBlack>
            </View>
          </RowView>
          <RowView
            style={{
          
              width: '100%',
            }}>
            <View
              style={{
                flexDirection: 'row',
                paddingVertical: 2,

                width: '100%',
              }}>
              <H8fontMediumLightBlack numberOfLines={2}>
        
                   {details.clinicAddressLocation ? details.clinicAddressLocation.clinicAddress : ''}{' '}
              </H8fontMediumLightBlack>
            </View>
          </RowView>

          <RowView
            style={{
              width: "auto",
              flexWrap:"wrap",
           
            }}>
                       <View style={[flexRow, alignItemsCenter, {marginTop: 5, marginBottom:5, flexWrap:"wrap"}]}>
            {details.numberOfReviews != 0
            
              ?
            <StarRating
            rating={details.ratingMedia}
            onChange={(n) => console.log("star pressed")}
            color={colors.facebook}
            starSize={16}
            />
            : null
            }
            <Text numberOfLines={2} style={{color:colors.facebook, fontSize:13, marginLeft:5}}>
              {details && details.numberOfReviews ? `${details.numberOfReviews} ${details.numberOfReviews === 1 ? i18n.translate("review") : i18n.translate("reviews")}` : i18n.translate('noReviews')}{' '}
            </Text> 

          </View>
    
          </RowView>
          <View
              style={{
                flexDirection: 'row',
                paddingVertical: 2,
                justifyContent:"flex-start",
                width: '100%',
              }}>
          <TouchableOpacity
      onPress={() => bookAnAppointment()}
      style={{
        backgroundColor: colors.primary2,
        width: '70%',
        height: 40,
        borderRadius: 10,
        right: '5%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:"row",
        marginTop:5
      }}>
      <H9fontMediumWhite style={{fontWeight: 'bold'}}>
        {i18n.translate("bookNow")}
      </H9fontMediumWhite>
      <MaterialIcons name="arrow-forward-ios" size={20} color="white" style={{marginLeft:5}} />
    </TouchableOpacity>
    </View>
        
        </View>
      </View>
    </RowView>

  </View>
  );
};

export default ClinicDetailsCard;

const styles = StyleSheet.create({
  containerLoader: {
    flex: 1,
    justifyContent: 'center',
  },
  chip: {
    // margin: 4,
    height:30,
    width:"auto",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    position:"absolute",
    zIndex:2,
    top:10,
    left:10,
    borderRadius:10,
    flexWrap:"wrap",
    padding:5,
    alignItems:"center",
    justifyContent:"center"
 

  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
  },
});
