import React, {useEffect, useState} from 'react';
import {TextInput, View, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Linking} from 'react-native';

import * as Yup from 'yup';
import {Formik, useFormikContext} from 'formik';

import {CardSurface} from '../../components/commonViews';
import {labels} from '../../utils/labels';
import {
  H30fontRegularLightBlack2,
  H14fontRegularWhite,
  H8fontMediumBlack,
  H8fontMediumLightBlack,
  H14fontRegularBlack,
  H7fontMediumBlack,
  H9fontRegularGray,
} from '../../components/commonText';
import {colors} from '../../utils/colors';
import {pl10, pl15} from '../../common/commonStyles';
import {Snackbar, Text} from 'react-native-paper';
import { NavBar, NavBarPatient } from '../../common/commonComponents';

import { feedbackData } from '../../utils/constant';
import { Dropdown } from 'react-native-element-dropdown';
import { uploadFeedback } from '../../utils/UploadFirebaseData';
import i18n from '../../../i18n';

interface Props {

  handleAddSubmit?: any;
  title?: any;
}

interface MyFormValues {
  description: string;
}

const ClinicFeedback: React.FC<Props> = ({

  
  title,
}): JSX.Element => {
  const [isFocus, setIsFocus] = useState(false);
  const [showSnackBar, setShowSnackback] = useState(false);
  const [value, setValue] = useState('');


  const validationSchema = Yup.object().shape({
    description: Yup.string()
    .required('Please describe your issue')
      .min(10, 'Description has to have at least 10 characters')
      .max(699, 'Description has to have a maximum of 700 characters')
      .label('description'),
      subject: Yup.string().required('Please select a subject').label('subject'),
      email: Yup.string().email("Please provide a valid e-mail address").required('Please provide an email').label('email'),
  });

  const initialValues: MyFormValues = {
    description: '',
  };

  useEffect(() => {

  }, []);

  const handleAddSubmit = async (values) => {
    
   const uploadSuccess = await uploadFeedback("clinic", values);
   if(uploadSuccess){
    setShowSnackback(uploadSuccess)
   }
  }

  return (
    <>
        <NavBar title={'Feedback'} isTermsAccepted={true} navHeight={80} isGoBack={true}/>
      <ScrollView>
    <CardSurface style={[styles.container, {marginTop:20}]}>
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={values => handleAddSubmit(values)}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          setFieldValue,
          errors,
          isValid,
          resetForm
        }) => (
          <>
            <View style={styles.bodyStyle}>
              <View style={{  justifyContent:"center"}}  >
              <H7fontMediumBlack textAlign="center">{i18n.translate("Feedback")}</H7fontMediumBlack>

              </View>
              <H9fontRegularGray textAlign="center">{i18n.translate("FeedbackDescription")}</H9fontRegularGray>
              <H30fontRegularLightBlack2 style={styles.msgStyle}>
                {i18n.translate("description")}
              </H30fontRegularLightBlack2>
         
                 <View style={styles.dropDownStyle}>
                    <Dropdown
                      style={[
                        styles.dropdown,
                        isFocus && {backgroundColor: '#FFF'},
                      ]}
                 
                      iconStyle={styles.iconStyle}
                      data={feedbackData}
                      labelField="label"
                      placeholder={"Select"}
                      placeholderStyle={{fontSize: 13}}
                      valueField="value"
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      // name={"subject"}
                      onChange={item => {
                        console.log(item.label);
                        setValue(item.value);
                        setFieldValue('subject', item.label);
                        setIsFocus(false);
                        console.log('item label', item.label);
                        handleChange(item.label);
                      }}
                      value={value}
                    />
                    {errors.subject && (
                      <Text style={{fontSize: 13, color: 'red', marginTop: 5}}>
                        {errors.subject}
                      </Text>
                    )}
                  </View>
                  <H30fontRegularLightBlack2 style={styles.msgStyle}>
                {i18n.translate("email")}
              </H30fontRegularLightBlack2>
              {errors.email && (
                <Text style={{fontSize: 13, color: 'red', marginTop: 5}}>
                  {errors.email}
                </Text>
              )}
              <View style={styles.emailBoxContainerStyle}>
                <TextInput
                  placeholder="Please provide your e-mail for us to contact you"
                  style={[pl15, {fontSize: 11, paddingTop: 5}]}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  multiline={true}
                  value={values.email}
                  maxLength={100}
                />
              </View>
                  <H30fontRegularLightBlack2 style={styles.msgStyle}>
                {i18n.translate("description")}
              </H30fontRegularLightBlack2>
              {errors.description && (
                <Text style={{fontSize: 13, color: 'red', marginTop: 5}}>
                  {errors.description}
                </Text>
              )}
              <View style={styles.textBoxContainerStyle}>
                <TextInput
                  placeholder="Describe your feedback within 700 characters..."
                  style={[pl15, {fontSize: 11, paddingTop: 5}]}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  multiline={true}
                  value={values.description}
                  maxLength={700}
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.nextButtonStyle, {backgroundColor:colors.bookBlue}]}
              onPress={() => 
                {handleSubmit();
                // resetForm();
              }}>
              <H14fontRegularWhite>Send feedback</H14fontRegularWhite>
              {/* <H14fontRegularBlack>Send feedback</H14fontRegularBlack> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButtonStyle}
              onPress={() => Linking.openURL('mailto:mobitoolsro@example.com')}>
              <H14fontRegularWhite>Contact via e-mail</H14fontRegularWhite>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButtonStyle}
              onPress={() => Linking.openURL(`tel:0787813831`)}>
              <H14fontRegularWhite>Direct contact via whats app</H14fontRegularWhite>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    
    </CardSurface>
      </ScrollView>
      <View style={{position:"absolute", width:300, height:100, bottom:"2%", left:"10%"}}>

      
<Snackbar
  visible={showSnackBar}
  onDismiss={() => setShowSnackback(false)}
  action={{
    label: '🤝',
    onPress: () => {
      // Do something
    },
  }}
  duration={2000}
  >
  Feedback sent successfully!
</Snackbar>
</View>
    </>
  );
};
export default ClinicFeedback;
const styles = StyleSheet.create({
  dropDownStyle: {
    width: Dimensions.get('window').width / 1.2,
    borderColor: '#CFCFCF',
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 5,
    // marginBottom: 10,
    backgroundColor: '#CFCFCF',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdown: {
    paddingLeft: 10,
    backgroundColor: '#FFF',
  },
  nextButtonStyle: {
    height: 45,
    backgroundColor: '#1B5A90',
    marginTop: 20,
    // marginBottom: 10,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  textBoxContainerStyle: {
    height: 250,
    borderColor: colors.borderTextColor,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 10,
    // marginBottom: 10,
  },
  emailBoxContainerStyle: {
    // height: 350,
    borderColor: colors.borderTextColor,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 10,
    // marginBottom: 10,
  },
  msgStyle: {
    marginTop: 10,
  },
  bodyStyle: {paddingHorizontal: 10},
  container: {marginHorizontal: 10},
});
