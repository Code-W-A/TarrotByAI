import React, {Fragment} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {GeneralProps} from '../interfaces/generalProps';
import {Route} from '@react-navigation/native';
import {NavBarPatient} from '../common/commonComponents';
import {
  CommonLineInvoice,
  MainContainer,
  RowView,
} from '../components/commonViews';
import {
  H10fontRegularBlack,
  H10fontRegularLight,
  H9fontMediumBlack,
} from '../components/commonText';
import {labels} from '../utils/labels';
import {Table, Row} from 'react-native-table-component';

import {tableHead, tableData, tableTitle} from '../utils/constant';
import LogoIcon from '../../assets/images/logo.svg';
import i18n from '../../i18n';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}
const InvoiceView: React.FC<Props> = ({navigation}): JSX.Element => {
  return (
    <Fragment>
      <MainContainer style={{backgroundColor: 'white'}}>
        <NavBarPatient title={'Invoices'} />
        <RowView style={{marginTop: 20, marginHorizontal: 15}}>
          <LogoIcon height={40} width={160}/>
          <View>
            <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
              <H10fontRegularBlack style={{paddingRight: 4}}>
                {i18n.translate("order")}
              </H10fontRegularBlack>
              <H10fontRegularLight>{'#00124'}</H10fontRegularLight>
            </View>
            <View style={{flexDirection: 'row'}}>
              <H10fontRegularBlack style={{paddingRight: 4}}>
                {i18n.translate("issued")}
              </H10fontRegularBlack>
              <H10fontRegularLight>{'20/07/2019'}</H10fontRegularLight>
            </View>
          </View>
        </RowView>
        <View style={{paddingHorizontal: 15}}>
          <CommonLineInvoice />
          <RowView style={{paddingTop: 20}}>
            <View>
              <H9fontMediumBlack>{i18n.translate("from")}</H9fontMediumBlack>
              <H10fontRegularLight>{'Dr. Darren Elder'}</H10fontRegularLight>
              <H10fontRegularLight>
                {'806 Twin Willow Lane, Old'}
              </H10fontRegularLight>
              <H10fontRegularLight>
                {'Forge,'}
              </H10fontRegularLight>
              <H10fontRegularLight>{'Newyork, USA'}</H10fontRegularLight>
              <H9fontMediumBlack style={{paddingTop: 15}}>
                {i18n.translate("to")}
              </H9fontMediumBlack>
              <H10fontRegularLight>{'Dr. Darren Elder'}</H10fontRegularLight>
              <H10fontRegularLight>
                {'806 Twin Willow Lane, Old'}
              </H10fontRegularLight>
              <H10fontRegularLight>
                {'Forge,'}
              </H10fontRegularLight>
              <H10fontRegularLight>{'Newyork, USA'}</H10fontRegularLight>
            </View>
            <View
              style={{
                height: 100,
                width: 170,
                backgroundColor: '#F6F6F6',
                paddingLeft: 10,
              }}>
              <H9fontMediumBlack style={{paddingTop: 15}}>
                {i18n.translate("payment")}
              </H9fontMediumBlack>
              <H10fontRegularLight>{'Debit Card'}</H10fontRegularLight>
              <H10fontRegularLight>{'XXXXXXXXXXXX-2541'}</H10fontRegularLight>
              <H10fontRegularLight>{'HDFC Bank'}</H10fontRegularLight>
            </View>
          </RowView>
          <View style={{paddingTop: 20}}>
            <Table borderStyle={{borderWidth: 1, borderColor: '#ced4da'}}>
              <Row
                data={tableHead}
                flexArr={[2, 1, 1, 1]}
                style={styles.head}
                textStyle={styles.text}
              />
              <Row
                data={tableTitle}
                flexArr={[2, 1, 1, 1]}
                style={styles.head}
                textStyle={styles.textGray}
              />
              <Row
                data={tableData}
                flexArr={[2, 1, 1, 1]}
                style={styles.head}
                textStyle={styles.textGray}
              />
            </Table>
          </View>
          <RowView>
            <View></View>
            <View style={{flexDirection: 'row'}}>
              <H10fontRegularBlack style={{paddingTop: 15, paddingRight: 30}}>
                {'Subtotal'}
              </H10fontRegularBlack>
              <H10fontRegularLight style={{paddingTop: 15, paddingRight: 5}}>
                {'$350'}
              </H10fontRegularLight>
            </View>
          </RowView>
          <CommonLineInvoice />
          <RowView>
            <View></View>
            <View style={{flexDirection: 'row'}}>
              <H10fontRegularBlack style={{paddingTop: 15, paddingRight: 30}}>
                {'Discount'}
              </H10fontRegularBlack>
              <H10fontRegularLight style={{paddingTop: 15, paddingRight: 5}}>
                {'-10%'}
              </H10fontRegularLight>
            </View>
          </RowView>
          <CommonLineInvoice />
          <RowView>
            <View></View>
            <View style={{flexDirection: 'row'}}>
              <H10fontRegularBlack style={{paddingTop: 15, paddingRight: 30}}>
                {'Total Amout:'}
              </H10fontRegularBlack>
              <H10fontRegularLight style={{paddingTop: 15, paddingRight: 5}}>
                {'$315'}
              </H10fontRegularLight>
            </View>
          </RowView>
          <H9fontMediumBlack>{'Other information'}</H9fontMediumBlack>
          <H10fontRegularLight>
            {
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sed dictum ligula, cursus blandit risus.'
            }
          </H10fontRegularLight>
        </View>
      </MainContainer>
    </Fragment>
  );
};
export default InvoiceView;
const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff'},
  head: {height: 30},
  textGray: {
    fontSize: 10,
    
    color: '#777777',
    paddingLeft: 5,
  },
  title: {flex: 1},
  row: {height: 28},
  text: {
    fontSize: 10,
    
    color: 'black',
    paddingLeft: 10,
  },
});
