import {ParamListBase, Route} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type GeneralProps = {
  navigation?: NativeStackNavigationProp<ParamListBase>;
  route?: Route<string, object | undefined>;
};

export type DoctorDetailsProps = {
  doctor_name: string;
  qualification: string;
  specialization: string;
  type: string;
  experience: string;
  ratting: string;
  count: string;
  location: string;
  likes: string;
  minFee: number;
  maxFee: number;
};
