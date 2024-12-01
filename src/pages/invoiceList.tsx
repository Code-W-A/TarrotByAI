import React, {Fragment} from 'react';
import {View, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {GeneralProps} from '../interfaces/generalProps';
import {Route} from '@react-navigation/native';
import {NavBarPatient} from '../common/commonComponents';
import {
  CardSurface,
  CommonLineDotted,
  MainContainer,
  RowView,
} from '../components/commonViews';
import {
  H10fontRegularWhite,
  H14fontRegularBlackk,
  H8fontMediumBlack,
  H9fontRegularGray,
} from '../components/commonText';
import {screenName} from '../utils/screenName';
// import {DevWidth} from '../utils/device';
import {Dimensions} from 'react-native';

import {flexRow, p5, ph10, pt0, pt10} from '../common/commonStyles';
import CalendarIcon from '../../assets/images/icon-metro-calendar.svg';
import Patient4 from '../../assets/images/patients/patient4.svg';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}
const InvoiceList: React.FC<Props> = ({navigation}): JSX.Element => {
  return (
    <Fragment>
      <MainContainer>
        <NavBarPatient title={'Invoices'} />
        <View style={styles.constaier}>
          <CardSurface style={styles.cardSurfaceStyle}>
            <RowView>
              <H14fontRegularBlackk>{'#INV-0010'}</H14fontRegularBlackk>
              <View style={flexRow}>
                <View style={p5}>
                  <CalendarIcon height={12} width={12} />
                </View>
                <H9fontRegularGray>{'14 Nov 2019'}</H9fontRegularGray>
              </View>
            </RowView>
            <CommonLineDotted />
            <RowView>
              <View style={styles.detailsContainer}>
                <View style={styles.profileImageStyle}>
                  <Patient4 height={60} width={60}/>
                </View>
                <View style={[ph10, pt10]}>
                  <View style={styles.nameAndPriceDetails}>
                    <H8fontMediumBlack>{'Michelle Fairfax'}</H8fontMediumBlack>
                    <H8fontMediumBlack>{'$450'}</H8fontMediumBlack>
                  </View>
                  <RowView style={styles.idAndViewDetails}>
                    <H9fontRegularGray>{'#PT0025'}</H9fontRegularGray>
                    <TouchableOpacity
                      style={styles.viewButtonStyle}
                      onPress={() =>
                        navigation.navigate(screenName.InvoiceView)
                      }>
                      <H10fontRegularWhite>{'View'}</H10fontRegularWhite>
                    </TouchableOpacity>
                  </RowView>
                </View>
              </View>
            </RowView>
          </CardSurface>
        </View>
      </MainContainer>
    </Fragment>
  );
};
export default InvoiceList;
const styles = StyleSheet.create({
  constaier: {
    marginVertical: 20,
    marginHorizontal: 20,
  },
  cardSurfaceStyle: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  imageStyle: {
    height: 12,
    width: 12,
    paddingRight: 5,
  },
  detailsContainer: {padding: 5, flexDirection: 'row', alignItems: 'center'},
  profileImageStyle: {height: 60, width: 60, borderRadius: 60, overflow: 'hidden'},
  nameAndPriceDetails: {flexDirection: 'row', justifyContent: 'space-between'},
  idAndViewDetails: {
    paddingTop: 5,
    width: Dimensions.get('window').width / 1.8,
    justifyContent: 'space-between',
  },
  viewButtonStyle: {
    height: 30,
    width: 60,
    borderRadius: 40,
    backgroundColor: '#0DD8F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
