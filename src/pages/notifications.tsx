import React, {Fragment, useState} from 'react';
import {View, ScrollView, Image, StyleSheet, FlatList} from 'react-native';
import {GeneralProps} from '../interfaces/generalProps';
import {Route} from '@react-navigation/native';
import {NavBarPatient} from '../common/commonComponents';
import {CardSurface, MainContainer} from '../components/commonViews';
import {
  H14fontRegularGray,
  H14fontRegularLightBlack,
} from '../components/commonText';
import {flex1, flexRow, mh10, mh15, mr10, mv15, p5, ph10, ph15, pl10} from '../common/commonStyles';
import {_testNotificationDetails} from '../utils/mockDetails';
import Patient from '../../assets/images/patients/patient1.svg';
// import { DevWidth } from '../utils/device';
import {Dimensions} from 'react-native';


interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const NotificationScreen: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const [refresh, setRefresh] = useState(false);

  return (
    <Fragment>
      <MainContainer>
        <NavBarPatient title={'Notifications'} />
        <View style={[mv15, mh10, flex1]}>
          <FlatList
            showsVerticalScrollIndicator={false}
            refreshing={refresh}
            onRefresh={() => {
              setRefresh(false);
            }}
            data={_testNotificationDetails}
            renderItem={({item, index}) => {
              return (
                <CardSurface style={styles.cardSurface}>
                  <View style={[flexRow, p5]}>
                    <View style={{height: 50, width: 50, borderRadius: 50, overflow: 'hidden'}}>
                      <Patient height={50} width={50} />
                    </View>
                    <View style={[ph10,{width: Dimensions.get('window').width/2.5}]}>
                      <View style={[flexRow]}>
                        <H14fontRegularLightBlack>
                          {'You'}
                        </H14fontRegularLightBlack>
                        <H14fontRegularGray>
                          {' missed a call from '}
                        </H14fontRegularGray>
                        <H14fontRegularLightBlack>
                          {item.name}
                        </H14fontRegularLightBlack>
                      </View>
                      <H14fontRegularGray>{item.date}</H14fontRegularGray>
                    </View>
                  </View>
                </CardSurface>
              );
            }}
          />
        </View>
      </MainContainer>
    </Fragment>
  );
};
export default NotificationScreen;

const styles = StyleSheet.create({
  cardSurface: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 10,
  },
  imageStyle: {height: 50, width: 50, borderRadius: 30},
});
