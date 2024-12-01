import {getAuth, sendPasswordResetEmail} from 'firebase/auth';
import {Alert} from 'react-native';
import {screenName} from './screenName';
import {useNavigation} from '@react-navigation/native';
import i18n from '../../i18n';

export const handleResetPass = (email: string): void => {
  // const navigation = useNavigation();
  console.log(email);
  if (email === '') {
    Alert.alert(i18n.translate("provideEmail"));
    return;
  }

  const auth = getAuth();
  sendPasswordResetEmail(auth, email)
    .then(() => {

      Alert.alert(i18n.translate("emailSent"), i18n.translate("emailSentMessage"), [
        {
          text: '',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: '', onPress: () => console.log('OK Pressed')},
      ]);
      // navigation.navigate(screenName.SignInScreenClinic);
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('errorCode', errorCode);
      console.log('errorMessage', errorMessage);
      // ..
    });

 
};

