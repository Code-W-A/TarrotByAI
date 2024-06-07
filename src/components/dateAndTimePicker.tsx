//import liraries
import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import moment from 'moment';
import {dateFormats} from '../utils/constant';

// create a component

interface DatePickerProps {
  date: string;
  minDate?: string;
  maxDate?: string;
  selectedDate: CallableFunction;
}
export const DatePicker: React.FC<DatePickerProps> = props => {
  const currentDate = new Date();

  const onConfirm = (event: Date) => {
    var newDate = moment(event).format(dateFormats.reciever);
    props.selectedDate(newDate);
  };

  const onCancel = () => {
    props.selectedDate(props.date);
  };

  return (
    <View>
      <DateTimePickerModal
        testID="dateTimePicker"
        minimumDate={
          props.minDate
            ? moment(props.minDate, dateFormats.reciever).toDate()
            : undefined
        }
        maximumDate={
          props.maxDate
            ? moment(props.maxDate, dateFormats.reciever).toDate()
            : undefined
        }
        date={
          props.date
            ? moment(props.date, dateFormats.reciever).toDate()
            : currentDate
        }
        isVisible={true}
        mode={'date'}
        is24Hour={false}
        display={Platform.OS == 'android' ? 'default' : 'spinner'}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </View>
  );
};

interface TimePickerProps {
  time: string;
  minTime?: string;
  maxTime?: string;
  selectedTime: CallableFunction;
}
export const TimePicker: React.FC<TimePickerProps> = props => {
  const onConfirm = (event: Date) => {
    var newTime = moment(event).format('HH:mm');
    props.selectedTime(newTime);
  };
  const onCancel = () => {
    props.selectedTime(props.time);
  };

  return (
    <View>
      <DateTimePickerModal
        testID="dateTimePicker"
        minimumDate={
          props.minTime ? moment(props.minTime, 'HH:mm').toDate() : undefined
        }
        maximumDate={
          props.maxTime ? moment(props.maxTime, 'HH:mm').toDate() : undefined
        }
        // date={props.time ? moment(props.time, "HH:mm").toDate() : new Date()}
        date={props.time ? moment(props.time, 'HH:mm').toDate() : new Date()}
        isVisible={true}
        mode={'time'}
        is24Hour={true}
        display={Platform.OS == 'android' ? 'default' : 'spinner'}
        onCancel={onCancel}
        locale="en_GB"
        onConfirm={onConfirm}
      />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

//make this component available to the app
