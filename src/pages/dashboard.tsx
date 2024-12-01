import React, {Fragment, useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {GeneralProps} from '../interfaces/generalProps';
import {Route} from '@react-navigation/native';
import {NavBar} from '../common/commonComponents';
import {labels} from '../utils/labels';

import {RowView} from '../components/commonViews';
import {
  H7fontMediumBlack,
  H9fontMediumBlack,
  H9fontRegularBlack,
} from '../components/commonText';
import AnimatedDotsCarousel from 'react-native-animated-dots-carousel';
import {screenName} from '../utils/screenName';
import {menu} from '../utils/constant';
import DashBoardSearch from '../components/dashboardSearch';
import {
  alignItemsCenter,
  mh10,
  mh15,
  ml10,
  mr10,
  mt10,
  mv10,
  ph15,
  pl15,
} from '../common/commonStyles';
import DoctorDetailsCard from '../components/doctorComponents';
import {_testDoctorDetails} from '../utils/mockDetails';
import {retrieveClinics} from '../utils/getFirebaseData';
import {useSelector} from 'react-redux';
import i18n from '../../i18n';

interface SpecialitiesList {
  onPressViewAll: CallableFunction;
}
const SpecialitiesList: React.FC<SpecialitiesList> = ({onPressViewAll}) => {
  return (
    <View style={[mv10]}>
      <RowView style={ph15}>
        <H7fontMediumBlack>{i18n.translate("specialities")}</H7fontMediumBlack>
        <TouchableOpacity
          onPress={() => {
            onPressViewAll();
          }}>
          <H9fontMediumBlack>{i18n.translate("viewAll")}</H9fontMediumBlack>
        </TouchableOpacity>
      </RowView>

      <ScrollView
        horizontal={true}
        style={[mr10, mt10]}
        showsHorizontalScrollIndicator={false}>
        {menu.map(({name, Img}) => {
          return (
            <View style={[alignItemsCenter, pl15]}>
              <Img height={67} width={67} />
              <View style={mv10}>
                <H9fontRegularBlack>{name}</H9fontRegularBlack>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const DashBoardScreen: React.FC<Props> = ({navigation, route}): JSX.Element => {
  const [doctorDetails, setDoctorDetails] = useState(_testDoctorDetails);

  const allClinicsDB = useSelector(state => state.allClinics);
  const {clinicsDB, loading} = allClinicsDB;

  useEffect(() => {
    console.log('dashboarrd herre...', clinicsDB.length);
  }, []);

  return (
    <View>
      <NavBar title={'Find Doctor'} isPatient={true} />
      <DashBoardSearch
        searchNow={() => {
          navigation.navigate(screenName.SearchDoctor);
        }}
      />

      <SpecialitiesList
        onPressViewAll={() => {
          navigation.navigate(screenName.SearchDoctor as any);
        }}
      />
      <View style={[mv10]}>
        <RowView style={ph15}>
          <H7fontMediumBlack>{i18n.translate("findDoctors")}</H7fontMediumBlack>
          <TouchableOpacity
            onPress={() => navigation.navigate(screenName.SearchDoctor as any)}>
            <H9fontMediumBlack>{i18n.translate('viewAll')}</H9fontMediumBlack>
          </TouchableOpacity>
        </RowView>

        <ScrollView
          style={mh10}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          {clinicsDB.length > 0
            ? clinicsDB.map((item, index) => {
                return (
                  <DoctorDetailsCard
                    page={'home'}
                    details={item}
                    bookAnAppointment={clinicAllInfo => {
                      navigation.navigate(screenName.ClinicCalendarTime, {
                        clinicAllInfo,
                      });
                    }}
                    drProfileNavigation={() => {
                      navigation.navigate(screenName.DoctorProfile);
                    }}
                  />
                );
              })
            : null}
        </ScrollView>
      </View>
    </View>
  );
};
export default DashBoardScreen;

const styles = StyleSheet.create({
  specialitiesImageStyle: {
    height: 100,
    width: 100,
  },
});
