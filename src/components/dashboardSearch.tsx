import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {colors} from '../utils/colors';
import {CardSurface} from './commonViews';
import {FontAwesome5} from '@expo/vector-icons';
import {Fontisto} from '@expo/vector-icons';
// import Icon from 'react-native-vector-icons/FontAwesome5';
// import Icon1 from 'react-native-vector-icons/MaterialIcons';
// import {DevWidth} from '../utils/device';
import {Dimensions} from 'react-native';

import {H8fontRegularWhite} from './commonText';
import {labels} from '../utils/labels';
import {flexRow, ph10, ph15, pl10, pl15} from '../common/commonStyles';
import MapInputPatientDash from './MapInputPatientDash';
import i18n from '../../i18n';
import { ControlledTooltip } from './tooltipModal';

interface DashBoardSearchProps {
  searchNow: CallableFunction;
  location: any;
  setLocation:any;
  doctorsClinics:any;
  setDoctorsClinics:any;
  noLocation:any;
  setNoLocation:any;
  setCity:any;
  city:any;
  ref:any;
}



const DashBoardSearch = (props: DashBoardSearchProps) => {


  const inputRef = React.useRef(null);

  React.useEffect(() => {
    console.log("search....effect...location", props.location)
    console.log("search....effect...doctorsClinics", props.doctorsClinics)
  }, [])

  return (
    <View style={styles.container}>
      <CardSurface style={styles.containerStyle}>
        <View style={[flexRow, {zIndex: 2}]}>
          <View style={styles.logoContainer}>
            <FontAwesome5 name="search-location" size={23} color="black" />
          </View>
          <View style={[ph10, {zIndex: 2}]}>
            {/* <TextInput
                   style={styles.textBoxStyle}
                   placeholder={i18n.translate("Location")}
                   placeholderTextColor={'grey'}
                   onChangeText={location => props.setLocation(location)}
                   ref={inputRef}
                   value={props.location}
            /> */}

                <MapInputPatientDash
                  setLocation={location => props.setLocation(location)}
                  ref={inputRef}
                  value={props.location}
                  noLocation={props.noLocation}
                  city={props.city}
                  setCity={props.setCity}
                />
          
          </View>
        </View>

        {/* <View style={pl10}>
          <Icon1 name="more-vert" size={15} color={colors.lightGray} />
        </View> */}
        <View style={[flexRow, {zIndex: 1}]}>
          <View style={styles.logoContainer}>
            {/* <Icon name="building" size={15} color={colors.lightGray} /> */}
            <Fontisto name="doctor" size={24} color="black" />
          </View>
          <View style={[ph10, {zIndex: 1}]}>
            <TextInput
              style={styles.textBoxStyle}
              placeholder={i18n.translate("searchByName")}
              placeholderTextColor={'grey'}
              onChangeText={text => props.setDoctorsClinics(text)}
              ref={inputRef}
              value={props.doctorsClinics}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            props.searchNow(props.doctorsClinics, props.location, props.city);
            inputRef.current.blur()
          }}
          style={styles.buttonStyle}>
          <H8fontRegularWhite>{i18n.translate("searchNow")}</H8fontRegularWhite>
        </TouchableOpacity>
      </CardSurface>
    </View>
  );
};

export default DashBoardSearch;

const styles = StyleSheet.create({
  container: {
    marginTop: -90,
    paddingLeft: 15,
    marginBottom: 10,
  },
  containerStyle: {
    height: 155,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 15,
    // padding: 10,
  },
  logoContainer: {
    marginTop: 3,
    borderRadius: 25,
    height: 35,
    width: 35,
    backgroundColor: colors.white,
    // paddingLeft: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    // borderWidth: 1,
  },
  dotsStyle: {
    borderBottomWidth: 1,
    borderBottomColor: '#ced4da',
    width: Dimensions.get('window').width / 1.5,
    marginRight: 45,
  },
  textBoxStyle: {
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ced4da',
    width: Dimensions.get('window').width / 1.45,
    height: 40,
   
  },
  buttonStyle: {
    marginTop: 12,
    height: 39,
    borderRadius: 5,
    backgroundColor: colors.facebook,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
