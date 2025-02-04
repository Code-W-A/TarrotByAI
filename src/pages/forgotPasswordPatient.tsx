import React, {Fragment, useState} from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import {Button} from '../components/commonButton';
import {GeneralProps} from '../interfaces/generalProps';
import {Route} from '@react-navigation/native';
import {labels} from '../utils/labels';
import {screenName} from '../utils/screenName';
import {
  H14fontRegularWhite,
  H9fontRegularBlack,
  H9fontRegularGray,
} from '../components/commonText';
import {
  CardSurface,
  MainContainer,
  RowView,
  TextInputStyle,
} from '../components/commonViews';
import {colors} from '../utils/colors';
import {mh20, pl20} from '../common/commonStyles';
import LoginIcon from '../../assets/images/login-img.svg';
import LogoIcon from '../../assets/images/logo.svg';
import EmailIcon from '../../assets/images/email.svg';
import LeftArrow from '../../assets/images/left-arrow-big-black.svg';
import {handleResetPass} from '../utils/handleResetPass';
import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import i18n from '../../i18n';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const ForgotPasswordPatient: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validate = text => {
    console.log(text);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      console.log('Email is Not Correct');
      setEmail(text);
      setError('Email is not valid');
      return false;
    } else {
      setError('');
      setEmail(text);
      console.log('Email is Correct');
    }
  };
  return (
    <Fragment>
      <MainContainer>
        <ImageBackground
          source={require('../images/loginBG.png')}
          resizeMode="cover"
          style={{
            flex: 1,
            width: null,
            height: null,
            // alignItems: 'flex-end',
          }}>
          <ScrollView>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{position: 'absolute', padding: 20}}>
              <LeftArrow />
            </TouchableOpacity>
            {/* <View style={styles.imageContainer}>
              <LoginIcon fill="#e0e0e0" height={230} width={230} />
              <View style={pl20}>
                <LogoIcon height={50} width={200} />
              </View>
            </View> */}
            <View style={{marginTop: '90%'}}>
              <View style={styles.txtBoxStyle}>
                <TextInputStyle>
                  <RowView>
                    <TextInput
                      style={[pl20]}
                      placeholder={'Email'}
                      placeholderTextColor={'#adb5bd'}
                      onChangeText={text => validate(text)}
                    />
                    <View style={styles.iconContainer}>
                      <CardSurface style={styles.surfaceStyle}>
                      <MaterialIcons name="email" size={24} color="grey" />
                      </CardSurface>
                    </View>
                  </RowView>
                </TextInputStyle>
              </View>
              <View style={styles.buttonStyle}>
                <Button
                  disabled={false}
                  funCallback={() => {
                    handleResetPass(email);
                    navigation.navigate(screenName.SignInScreenPatient);
                  }}
                  label={i18n.translate("resetPassword")}
                />
              </View>
              <View style={styles.footerText}>
                <H14fontRegularWhite>{i18n.translate("goBackLogin")} </H14fontRegularWhite>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(screenName.SignInScreenPatient as any)
                  }>
                  <H14fontRegularWhite style={{fontWeight: 'bold'}}>
                    {i18n.translate("registerLogin")}
                  </H14fontRegularWhite>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </MainContainer>
    </Fragment>
  );
};
export default ForgotPasswordPatient;

const styles = StyleSheet.create({
  imageContainer: {
    alignSelf: 'center',
    // paddingTop: 10,
  },
  logoStyle: {
    height: 230,
    width: 230,
  },
  logoTxtStyle: {height: 50, width: 200},
  txtBoxStyle: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  iconContainer: {right: 7, justifyContent: 'center'},
  surfaceStyle: {
    borderRadius: 21,
    height: 42,
    width: 42,
    backgroundColor: colors.white,
    // paddingTop: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailLogostyle: {height: 17, width: 25, alignSelf: 'center'},
  buttonStyle: {
    marginHorizontal: 20,
    marginTop: 5,
  },
  footerText: {
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
