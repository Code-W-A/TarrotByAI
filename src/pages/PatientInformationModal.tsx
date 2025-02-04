import React, {Fragment, useState} from 'react';
import {TextInput, View, TouchableOpacity, StyleSheet} from 'react-native';
import {CardSurface, CommonInput} from '../components/commonViews';
import {
  H14fontRegularWhite,
  H30fontRegularLightBlack2,
  H8fontMediumBlack,
} from '../components/commonText';
import {colors} from '../utils/colors';
import Icon from 'react-native-vector-icons/Entypo';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import {mh10, mh15, mt15, ph10, ph15, pt10} from '../common/commonStyles';

interface Props {}
const defaultList = {registrations: '', year: ''};
const PatientInformationModal: React.FC<Props> = ({}): JSX.Element => {
  const [registrationList, setList] = useState([defaultList]);

  const textBoxField = (
    label: string,
    value: string,
    index: number,
    componentKey: string,
  ) => {
    return (
      <View>
        <H30fontRegularLightBlack2 style={mt15}>
          {label}
        </H30fontRegularLightBlack2>
        <CommonInput style={{height: 35}}>
          <TextInput
            onChangeText={txt => {
              var list = registrationList;
              list[index][componentKey] = txt;
              setList([...list]);
            }}
            value={value}
            style={styles.inputStyle}
          />
        </CommonInput>
      </View>
    );
  };

  const deleteIcons = (index: number) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (registrationList.length > 1) {
            registrationList.splice(index, 1);
            setList([...registrationList]);
          }
        }}
        style={styles.deleteIconStyle}>
        <Icon1 name="trash-o" size={18} color={'white'} />
      </TouchableOpacity>
    );
  };

  return (
    <CardSurface style={[mh10, ph15]}>
      <H8fontMediumBlack style={pt10}>{'Registrations'}</H8fontMediumBlack>

      {registrationList.map((item, index) => {
        return (
          <View>
            {textBoxField(
              'Registrations',
              item.registrations,
              index,
              'registrations',
            )}
            {textBoxField('Year', item.year, index, 'year')}
            {registrationList.length > 1 ? deleteIcons(index) : null}
          </View>
        );
      })}

      <TouchableOpacity
        onPress={() => {
          registrationList.push(defaultList);
          setList([...registrationList]);
        }}
        style={[styles.addIconsStyle]}>
        <Icon name="plus" size={24} color={'white'} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.nextButtonStyle}>
        <H14fontRegularWhite>DONE</H14fontRegularWhite>
      </TouchableOpacity>
    </CardSurface>
  );
};
export default PatientInformationModal;
const styles = StyleSheet.create({
  inputStyle: {paddingLeft: 10, width: '100%'},
  addIconsStyle: {
    height: 28,
    width: 28,
    borderRadius: 15,
    backgroundColor: '#0dcaf0',
    // paddingLeft: 2,
    // paddingTop: 2,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  nextButtonStyle: {
    height: 45,
    backgroundColor: '#1B5A90',
    marginVertical: 10,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30
  },
  deleteIconStyle: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: colors.red,
    paddingLeft: 8,
    paddingTop: 5,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
});
