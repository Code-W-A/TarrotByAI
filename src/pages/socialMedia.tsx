import React, {Fragment} from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {GeneralProps} from '../interfaces/generalProps';
import {Route} from '@react-navigation/native';
import {NavBarPatient} from '../common/commonComponents';
import {CardSurface, MainContainer, RowView} from '../components/commonViews';
import {H15fontMediumBlack} from '../components/commonText';
import {socialMediaMenuOptions} from '../utils/constant';
import {flexRow} from '../common/commonStyles';
import RightArrow from '../../assets/images/right-arrow.svg';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const SocialMedia: React.FC<Props> = ({navigation, route}): JSX.Element => {
  return (
    <Fragment>
      <MainContainer>
        <ScrollView>
          <NavBarPatient title={'Social Media'} />
          {socialMediaMenuOptions.map(({Img, name}) => {
            return (
              <CardSurface style={styles.componnetStyle}>
                <TouchableOpacity>
                  <RowView>
                    <View style={styles.detailsStyle}>
                      <Img />
                      <H15fontMediumBlack style={{marginLeft: 15}}>{name}</H15fontMediumBlack>
                    </View>
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                      <RightArrow height={17} width={10}/>
                    </View>
                  </RowView>
                </TouchableOpacity>
              </CardSurface>
            );
          })}
        </ScrollView>
      </MainContainer>
    </Fragment>
  );
};
export default SocialMedia;
const styles = StyleSheet.create({
  componnetStyle: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 6,
  },
  logoStyle: {height: 40, width: 40, marginRight: 20},
  detailsStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIconStyle: {height: 17, width: 10, alignSelf: 'center'},
});
