import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { labels } from "../../utils/labels";
import { CardSurface, DashedLine, RowView } from "../../components/commonViews";
import {
  H14fontRegularBlackk,
  H14fontRegularBlue,
  H14fontRegulargray,
  H14fontRegularRed,
  H15fontMediumBlack,
  H8fontMediumBlack,
  H9fontMediumBlack,
  H9fontRegularGray,
  H18fontMediumBlack,
  H18fontRegularBlackk,
} from "../../components/commonText";
import { colors } from "../../utils/colors";
import {
  Fontisto,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
// import Icon from 'react-native-vector-icons/FontAwesome';
// import Icon1 from 'react-native-vector-icons/MaterialIcons';
// import {DevWidth} from '../../utils/device';
import { Dimensions } from "react-native";

import {
  alignItemsCenter,
  flexRow,
  ml5,
  mr10,
  mr25,
  mr30,
  p5,
  pb10,
  pb5,
  ph10,
  pl10,
  pl18,
  pl30,
  pl5,
  pt0,
  pt10,
  pt5,
  pv10,
  pv20,
  pv5,
} from "../../common/commonStyles";

import { useSelector } from "react-redux";
import { useRoute } from "@react-navigation/native";
import { AirbnbRating } from "react-native-elements";
import { Card, Text } from "react-native-paper";
import StarRating from "react-native-star-rating-widget";
import { AntDesign } from "@expo/vector-icons";
import i18n from "../../../i18n";

interface Props {
  clinicInfoData?: any;
}

const Dash = () => {
  return (
    <View style={{ paddingLeft: 23 }}>
      <DashedLine />
    </View>
  );
};

const ClinicDetails = ({
  clinicname,
  email,
  ratings,
  phoneNumber,
  ratingMedia,
  numberOfReviews,
  clinicMainImage,
  country,
  specializations,
  services,
}) => {
  return (
    <View style={[flexRow, { marginTop: 10 }]}>
      <View>
        <Card style={[styles.cardSurfaceStyle, { paddingTop: 2 }]}>
          {/* <Iicon fill="#000" height={20} width={7} /> */}
          <MaterialCommunityIcons
            name="office-building-marker"
            size={33}
            color={colors.facebook}
          />
        </Card>
        <Dash />
      </View>
      <View style={[ph10]}>
        <CardSurface style={styles.detailCardSurfaceStyle}>
          <View>
            <View style={[p5, flexRow]}>
              <View style={styles.profileImageStyle}>
                {clinicMainImage ? (
                  <Image
                    style={{ height: "100%", width: "100%" }}
                    source={{
                      uri: clinicMainImage.img,
                    }}
                  />
                ) : (
                  <Fontisto name="doctor" size={24} color="black" />
                )}
              </View>
              <View style={[pl10]}>
                <H15fontMediumBlack style={{ lineHeight: 20 }}>
                  {clinicname}
                </H15fontMediumBlack>
                <Text
                  style={{
                    lineHeight: 20,
                    fontSize: 11,
                    color: colors.lightGray,
                  }}
                >
                  {email}
                </Text>
                <View style={[flexRow, alignItemsCenter]}>
                  {/* <CardSurface style={styles.dentalIconStyle}> */}
                  <AntDesign name="phone" size={18} color={colors.facebook} />
                  {/* </CardSurface> */}
                  <H14fontRegularBlue style={{ marginLeft: 5, lineHeight: 25 }}>
                    {phoneNumber}
                  </H14fontRegularBlue>
                </View>

                {/* <View style={[flexRow, alignItemsCenter]}>
                  <CardSurface style={styles.dentalIconStyle}>
                    <Specialities5 height={14} width={14} />
                  </CardSurface>
                  <H14fontRegularBlue>{phoneNumber}</H14fontRegularBlue>
                </View> */}
              </View>
            </View>
            <View style={[flexRow, alignItemsCenter, { marginTop: 5 }]}>
              <StarRating
                rating={ratingMedia}
                onChange={(n) => console.log("star pressed")}
                color={colors.facebook}
                starSize={16}
              />
              <Text
                numberOfLines={2}
                style={{ color: colors.facebook, fontSize: 13, marginLeft: 5 }}
              >
                {numberOfReviews
                  ? `${numberOfReviews} ${
                      numberOfReviews === 1 ? "review" : "reviews"
                    }`
                  : "No reviews"}{" "}
              </Text>
            </View>
          </View>
          {/* <H14fontRegulargray style={[pl10, pt5]}>
            {services}
          </H14fontRegulargray> */}
          <RowView>
            {/* <H14fontRegularRed style={[pl10, pt5]}>
              {'15+ Exp'}
            </H14fontRegularRed> */}
            {/* <View style={[flexRow, pt5, pb10]}> */}
            {/* <Icon name="map-marker" size={15} color={'black'} /> */}
            {/* <H9fontMediumBlack style={[mr10, ml5]}>
                {phoneNumber}
                {', '}
                {country}
              </H9fontMediumBlack> */}
            {/* </View> */}
          </RowView>
        </CardSurface>
      </View>
    </View>
  );
};

const location = ({ locationData }) => {
  return (
    <View style={[flexRow, { marginTop: 10 }]}>
      <CardSurface style={styles.surfaceContainer}>
        <H15fontMediumBlack style={pl10}>
          {doctorRouteInfo.doctorInfo.clinicInfoData.clinicname}
        </H15fontMediumBlack>
        {/* <H14fontRegularBlackk style={pl10}>
    {'MDS - Periodontology, BDS'}
  </H14fontRegularBlackk> */}
        <View style={styles.rattingContainer}>
          {/* <Start />
    <Start />
    <Start />
    <Start />
    <Start /> */}
          {/* <H10fontRegularBlack style={pl5}>{'(16592)'}</H10fontRegularBlack> */}
        </View>
        <RowView>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {menuOptions.map(({ Img }) => {
              return (
                <View style={styles.imageContainer}>
                  <Img height={40} width={40} />
                </View>
              );
            })}
          </ScrollView>
          {/* <CardSurface style={styles.priceSurface}>
      <H14fontRegularBlackk>{'$250'}</H14fontRegularBlackk>
    </CardSurface> */}
        </RowView>
        <CommonLineDotted />
        <View style={styles.addressContainer}>
          {/* <Icon name="map-marker" size={15} color={'black'} /> */}
          <H9fontMediumBlack style={pl5}>
            {doctorRouteInfo.doctorInfo.contactData.addressone}
          </H9fontMediumBlack>
        </View>
        <View style={styles.addressContainer}>
          {/* <Icon name="map-marker" size={15} color={'black'} /> */}
          <H9fontMediumBlack style={pl5}>
            {doctorRouteInfo.doctorInfo.contactData.addresstwo}
          </H9fontMediumBlack>
        </View>
        {/* <H9fontMediumBlue style={pl10}>{'Get Directions'}</H9fontMediumBlue> */}
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
    </View>
  );
};

const AboutUs = ({ biography }) => {
  return (
    <View style={[flexRow, { marginTop: 10 }]}>
      <View>
        <CardSurface style={styles.cardSurfaceStyle}></CardSurface>
        <Dash />
      </View>
      <View style={ph10}>
        <CardSurface style={styles.detailCardSurfaceStyle}>
          <H15fontMediumBlack style={[pt10, pl10]}>
            {i18n.translate("aboutUs")}
          </H15fontMediumBlack>
          <H9fontRegularGray style={[pl10, pv10, mr30, { lineHeight: 20 }]}>
            {biography}
          </H9fontRegularGray>
        </CardSurface>
      </View>
    </View>
  );
};

// const EducationDetails = () => {
//   return (
//     <View style={[flexRow, {marginTop:10}]}>
//       <View>
//         <CardSurface style={styles.cardSurfaceStyle}>
//           <BookIcon fill="#000" height={18} width={18} />
//         </CardSurface>
<Dash />;
//       </View>
//       <View style={ph10}>
//         <CardSurface style={styles.detailCardSurfaceStyle}>
//           <H15fontMediumBlack style={p5}>{labels.education}</H15fontMediumBlack>
//           <View style={[flexRow, pl5]}>
//             {/* <Icon1 name="check" size={20} color={'black'} /> */}
//             <H14fontRegularBlackk style={[pl5, mr30]}>
//               {'American Dental Medical University'}
//             </H14fontRegularBlackk>
//           </View>
//           <H9fontRegularGray style={[pt10, pl30]}>{'BDS'}</H9fontRegularGray>
//           <H9fontRegularGray style={[pl30, pb10]}>
//             {'1998 - 2003'}
//           </H9fontRegularGray>
//         </CardSurface>
//       </View>
//     </View>
//   );
// };

const WorkExperience = () => {
  return (
    <View style={[flexRow, { marginTop: 10 }]}>
      <View>
        <CardSurface style={styles.cardSurfaceStyle}>
          {/* <MapDoctor fill={'#000'} height={18} width={18} /> */}
        </CardSurface>
        <Dash />
      </View>
      <View style={pl10}>
        <CardSurface style={styles.detailCardSurfaceStyle}>
          <H15fontMediumBlack style={[p5, pt10]}>
            {i18n.translate("experience")}
          </H15fontMediumBlack>
          <View style={[flexRow, pl5]}>
            {/* <Icon1 name="check" size={20} color={'black'} /> */}
            <H14fontRegularBlackk style={[pl5, mr30]}>
              {"Glowing Smiles Family Dental Clinic"}
            </H14fontRegularBlackk>
          </View>
          <H9fontRegularGray style={[pt5, pl30]}>
            {"2010 - Present (5 years)"}
          </H9fontRegularGray>
          <View style={[flexRow, pl5, pt5]}>
            {/* <Icon1 name="check" size={20} color={'black'} /> */}
            <H14fontRegularBlackk style={pl5}>
              {"Comfort Care Dental Clinic"}
            </H14fontRegularBlackk>
          </View>
          <H9fontRegularGray style={[pt5, pl30, pb10]}>
            {"2007 - 2010 (3 years)"}
          </H9fontRegularGray>
        </CardSurface>
      </View>
    </View>
  );
};

const Services = ({ services }) => {
  return (
    <View style={{ flexDirection: "row", marginTop: 10 }}>
      <View>
        <Card style={[styles.cardSurfaceStyle, { paddingTop: 5 }]}>
          {/* <NurseIcon fill={'#000'} height={18} width={18} /> */}
          <MaterialIcons name="info" size={30} color={colors.facebook} />
        </Card>
        {/* <Dash /> */}
      </View>
      <View style={ph10}>
        <CardSurface style={styles.detailCardSurfaceStyle}>
          <H15fontMediumBlack style={p5}>
            {i18n.translate("aboutClinic")}
          </H15fontMediumBlack>
          <View style={[flexRow, pl5, pt5]}>
            {/* <Icon1 name="check" size={20} color={colors.lightGray} /> */}
            <H14fontRegulargray style={[pl5, pb5]}>
              {services}
            </H14fontRegulargray>
          </View>
          {/* <View style={[pl5, flexRow]}>
     
            <H14fontRegulargray style={[pl5, pb5]}>
              {'Root Canal Therapy'}
            </H14fontRegulargray>
          </View>
          <View style={[pl5, flexRow]}>
 
            <H14fontRegulargray style={[pl5, pb10]}>
              {'Implants'}
            </H14fontRegulargray>
          </View> */}
        </CardSurface>
      </View>
    </View>
  );
};

const Specializations = ({ specializations }) => {
  const allClinicsDB = useSelector((state) => state.allClinics);
  const { clinicsDB, loading } = allClinicsDB;
  return (
    <View style={[flexRow, { marginTop: 10 }]}>
      <CardSurface style={styles.cardSurfaceStyle}>
        {/* <MedicalIcon fill={'#000'} height={18} width={18} /> */}
      </CardSurface>
      <View style={ph10}>
        <CardSurface style={styles.detailCardSurfaceStyle}>
          <H15fontMediumBlack style={p5}>
            {i18n.translate("specializations")}
          </H15fontMediumBlack>
          <View style={[pl5, pt5, flexRow]}>
            <H14fontRegulargray style={[pl5, pb5]}>
              {specializations}
            </H14fontRegulargray>
          </View>
          {/* <View style={[pl5, flexRow]}>
            <H14fontRegulargray style={[pl5, pb5]}>
              {'Oral and Maxillofacial Surgery'}
            </H14fontRegulargray>
          </View> */}
          {/* <View style={[pl5, flexRow]}>
            <H14fontRegulargray style={[pl5, pb10]}>
              {'Prosthodontics'}
            </H14fontRegulargray>
          </View> */}
        </CardSurface>
      </View>
    </View>
  );
};

const ClinicOverview: React.FC<Props> = ({ clinicInfoData }): JSX.Element => {
  const allClinicsDB = useSelector((state) => state.allClinics);
  const { clinicsDB, loading } = allClinicsDB;

  const route = useRoute();
  const doctorRouteInfo = route.params;

  useEffect(() => {
    console.log("clinicInfoData----");
    console.log(clinicInfoData.clinicMainImage);
    // console.log(clinicInfoData.ratingMedia);
    // console.log(clinicInfoData.email);
    // console.log(clinicInfoData.phoneNumber);
    // console.log(clinicInfoData.aboutClinicData);
    // console.log(clinicsDB[0].specializations);
  }, []);
  // return(
  //   <View>
  //     <Text>
  //       asdasdasdas
  //     </Text>
  //   </View>
  // )
  return (
    <View style={pl18}>
      <ClinicDetails
        clinicname={clinicInfoData.clinicInfoData.clinicname}
        email={clinicInfoData.email}
        phoneNumber={clinicInfoData.phoneNumber}
        numberOfReviews={clinicInfoData.numberOfReviews}
        ratingMedia={clinicInfoData.ratingMedia}
        clinicMainImage={clinicInfoData.clinicMainImage}
        // country={doctorRouteInfo.doctorInfo.contactData.country}
        // specializations={
        //   doctorRouteInfo.doctorInfo.basicInfoData.specializations
        // }
        // services={doctorRouteInfo.doctorInfo.basicInfoData.services}
      />
      {/* <AboutUs biography={doctorRouteInfo.doctorInfo.aboutMeData.biography} /> */}
      {/* <EducationDetails /> */}
      {/* <WorkExperience /> */}
      <Services services={clinicInfoData.aboutClinicData.biography} />
      {/* <Specializations
        specializations={
          doctorInfoData.doctorInfoData.specializations
        }
      /> */}
    </View>
  );
};
export default ClinicOverview;

const styles = StyleSheet.create({
  cardSurfaceStyle: {
    borderRadius: 25,
    height: 40,
    width: 40,
    backgroundColor: colors.white,
    paddingTop: 9,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  infoIconDetaisl: {
    height: 20,
    width: 7,
  },

  detailCardSurfaceStyle: {
    height: "auto",
    width: Dimensions.get("window").width / 1.35,
    borderRadius: 20,
    padding: 20,
  },
  doctorImageStyle: {
    height: 65,
    width: 65,
    borderRadius: 65,
    overflow: "hidden",
  },
  dentalIconStyle: {
    borderRadius: 25,
    height: 24,
    width: 24,
    backgroundColor: colors.white,
    marginRight: 5,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  dentalImageStyle: {
    height: 17,
    width: 17,
    alignSelf: "center",
  },
  aboutUsIconstyle: {
    height: 18,
    width: 15,
  },
  profileImageStyle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#f7f7f7",
    overflow: "hidden",
  },
  imageCommonSize: {
    height: 18,
    width: 18,
  },
});
