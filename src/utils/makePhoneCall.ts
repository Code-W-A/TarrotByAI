import Communications from 'react-native-communications';

export const makePhoneCall = (phoneNumber) => {
  Communications.phonecall(phoneNumber, true);
};