import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../utils/colors";
import { FormErrorMessage } from "./commonText";
import { Feather, MaterialIcons } from "@expo/vector-icons";

interface InputFieldsProps {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  image: any;
  errorMessage?: string;
  isNumber?: boolean;
  isSecure?: boolean;
  isPassword?: boolean;
  setIsWhite1?: any;
  setIsWhite2?: any;
  style?: any;
  containerStyle?: any;
  textInputStyle?: any;
}

export const InputFields: React.FC<InputFieldsProps> = ({
  value,
  placeholder,
  onChangeText,
  image,
  errorMessage,
  isNumber,
  isSecure,
  isPassword,
  setIsWhite1,
  setIsWhite2,
  style,
  containerStyle,
  textInputStyle,
}) => {
  const [showPass, setShowPass] = useState<boolean>(isSecure);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleOnBlur = () => {
    setIsFocused(false);
  };
  const handleOnFocus = () => {
    setIsFocused(true);
  };

  return (
    <>
      <View
        style={[
          styles.inputWrapperNew,
          containerStyle,
          style,
          isFocused && { borderColor: '#C9A14A', shadowColor: '#C9A14A', shadowOpacity: 0.12, elevation: 3 },
        ]}
      >
        <View style={{ marginRight: 15 }}>
          <View style={styles.passwordIconStyle}>
            <MaterialIcons
              name={image}
              size={24}
              color={isFocused ? '#C9A14A' : '#B0AFA6'}
            />
          </View>
        </View>
        <TextInput
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          style={[
            styles.inputTextNew,
            textInputStyle,
          ]}
          placeholder={placeholder}
          value={value}
          placeholderTextColor={'#B0AFA6'}
          onChangeText={onChangeText}
          keyboardType={isNumber ? 'numeric' : 'default'}
          secureTextEntry={showPass}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPass(!showPass)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showPass ? 'eye-off' : 'eye'}
              size={24}
              color={isFocused ? '#C9A14A' : '#B0AFA6'}
            />
          </TouchableOpacity>
        )}
      </View>
      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </>
  );
};

const styles = StyleSheet.create({
  inputWrapperNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#C9A14A',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#C9A14A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inputTextNew: {
    color: '#C9A14A',
    fontSize: 16,
    fontFamily: 'Lora',
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
  },
  passwordIconStyle: { alignItems: "center", justifyContent: "center" },
});
