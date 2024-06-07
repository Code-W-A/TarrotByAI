import React, {useState} from 'react';
import {
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {RowView} from '../components/commonViews';
import {
  H13fontRegularGray,
  H9fontRegularGray,
  H8fontMediumBlack,
  TCMessage,
  H14fontMediumBlack,
} from '../components/commonText';
// import {DevWidth} from '../utils/device';
import {Dimensions} from 'react-native';


import {flexRow, pb10, ph15, pl20, pt10} from '../common/commonStyles';
import {labels} from '../utils/labels';
import CreditCard from '../../assets/images/credit-card.svg';
import PriceCheck from '../../assets/images/icon-checkmark.svg';
import Paypal from '../../assets/images/paypal.svg';
import { colors } from '../utils/colors';
import i18n from '../../i18n';

interface Props {}
const Payment: React.FC<Props> = ({}): JSX.Element => {
  const [paypal, setPaypal] = useState(false);
  const [creditcard, setcreditcard] = useState(false);

  const labelWithTextBox = (label: string, placeholder?: string) => {
    return (
      <>
        <View style={flexRow}>
          <H13fontRegularGray>{label} </H13fontRegularGray>
          <Text style={styles.labelTextStyle}>*</Text>
        </View>
        <View
          style={styles.textBoxBorderStyle}>
          <TextInput
            style={styles.textBoxStyle}
            placeholder={placeholder}
          />
        </View>
      </>
    );
  };

  return (
    <View style={[ph15, pt10]}>
      <H8fontMediumBlack>{i18n.translate("paymentInformation")}</H8fontMediumBlack>
      <View style={styles.constainer}>
        <RowView style={{alignItems: 'center', paddingBottom: 15}}>
          <RowView>
            <TouchableOpacity
              onPress={() => setcreditcard(!creditcard)}
              style={styles.radioBtnStyle}>
              {creditcard == true && (
                <View style={{height: 20, width: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ligtBlue}}>
                  <PriceCheck height={10} width={10} />
                </View>
              )}
            </TouchableOpacity>
            <H9fontRegularGray>{i18n.translate("creditCard")}</H9fontRegularGray>
          </RowView>
          <View>
            <CreditCard height={50} width={50} />
          </View>
        </RowView>

        {labelWithTextBox('Name on Card')}
        {labelWithTextBox('1234 6783 34564 1246')}

        <RowView>
          <View style={styles.expiryMonthAndYearStyles}>
            {labelWithTextBox('Expiry Month', 'MM')}
          </View>
          <View style={styles.expiryMonthAndYearStyles}>
            {labelWithTextBox('Expiry Month', 'YY')}
          </View>
        </RowView>

        {labelWithTextBox('CVV', '123')}
      </View>
      <View style={styles.paypalContainer}>
        <RowView>
          <RowView>
            <TouchableOpacity
              onPress={() => setPaypal(!paypal)}
              style={styles.radioBtnStyle}>
              {paypal == true && (
                <View style={{height: 20, width: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ligtBlue}}>
                  <PriceCheck height={10} width={10} />
                </View>
              )}
            </TouchableOpacity>
            <H9fontRegularGray>{i18n.translate("paypal")}</H9fontRegularGray>
          </RowView>
          <View>
            <Paypal height={20} width={20} />
          </View>
        </RowView>
      </View>
      <View style={[flexRow, pl20]}>
        <H14fontMediumBlack> {i18n.translate("readAndAccept")} </H14fontMediumBlack>
        <TouchableOpacity>
          <TCMessage>{i18n.translate("tcMessage")} </TCMessage>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Payment;

const styles = StyleSheet.create({
  constainer: {
    backgroundColor: '#fff',
    height: 370,
    marginTop: 10,
    borderRadius: 10,
    elevation: 3,
    padding: 15,
  },
  radioBtnStyle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#777777',
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paypalContainer: {
    marginVertical: 20,
    padding: 10,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  paymentTypeLogo: {height: 21, width: 21},
  masterCardImageStyle: {height: 30, width: 30},
  expiryMonthAndYearStyles: {width: Dimensions.get('window').width / 2.5},
  paypalLogoStyle: {height: 20, width: 20},
  textBoxBorderStyle:{
    height: 35,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CFCFCF',
  },
  labelTextStyle:{color: 'red', fontSize: 9},
  textBoxStyle:{paddingLeft: 5, top: 2, fontSize: 12}
});
