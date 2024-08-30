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
          styles.testBoxRowStyle,
          { borderColor: isFocused ? "white" : colors.primary3 },
        ]}
      >
        <View style={{ marginRight: 15 }}>
          <View style={styles.passwordIconStyle}>
            <MaterialIcons
              name={image}
              size={24}
              color={isFocused ? "white" : colors.grayText}
            />
          </View>
        </View>
        <TextInput
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          style={{
            flex: 1,
            marginRight: isPassword ? 30 : 0,
            color: isFocused ? "white" : "white",
          }} // Ajustează margin-right dacă este o parolă pentru a face loc pentru icon
          placeholder={placeholder}
          value={value}
          placeholderTextColor={isFocused ? "white" : colors.grayText}
          onChangeText={onChangeText}
          keyboardType={isNumber ? "numeric" : "default"}
          secureTextEntry={showPass}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPass(!showPass)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showPass ? "eye-off" : "eye"}
              size={24}
              color={isFocused ? "white" : colors.primary2}
            />
          </TouchableOpacity>
        )}
      </View>
      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </>
  );
};

const styles = StyleSheet.create({
  testBoxRowStyle: {
    flexDirection: "row",
    borderRadius: 35,
    borderWidth: 0.5,
    backgroundColor: colors.primary3,
    paddingHorizontal: 15,
    marginTop: 12,
    height: 55,
    alignItems: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
  },
  passwordIconStyle: { alignItems: "center", justifyContent: "center" },
});
