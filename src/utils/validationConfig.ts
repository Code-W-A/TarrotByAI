import { ValidationValueMessage } from "react-hook-form";

export const validationSchema = {
  // medicalCouncil: {
  //   minLength: 8,
  //   maxLength: 15,
  // },
  // bic: {
  //   minLength: 8,
  //   maxLength: 15,
  // },
  // iban: {
  //   minLength: 15,
  //   maxLength: 80,
  // },
  // pincode: {
  //   minLength: 6,
  //   maxLength: 6,
  // },
  // passportOrIdCard: {
  //   minLength: 3,
  //   maxLength: 26,
  // },
  // name: {
  //   minLength: 2,
  //   maxLength: 26,
  // },

  // lastName: {
  //   minLength: 1,
  //   maxLength: 26,
  // },

  // email: {
  //   minLength: 3,
  //   maxLength: 64,
  // },
  // address: {
  //   minLength: 3,
  //   maxLength: 400,
  // },
  // description: {
  //   minLength: 3,
  //   maxLength: 400,
  // },
  phoneNumber: {
    minLength: 6,
    maxLength: 14,
  },
  password: {
    minLength: 6,
    maxLength: 30,
  },
  // categoryName: {
  //   minLength: 2,
  //   maxLength: 30,
  // },
  // storeCode: {
  //   minLength: 2,
  //   maxLength: 30,
  // },
  // barCode: {
  //   minLength: 1,
  //   maxLength: 100,
  // },

  name: {
    minLength: 2,
    maxLength: 50,
  },
};

export const whiteSpaceValidation = (v: string): boolean | string => {
  const whiteSpaceRegx = /^\s+|\s+$/g;
  return !whiteSpaceRegx.test(v) || "white space not allowed.";
};

// export const numberValidation = (v: string): boolean | string => {
//   const numberRegx = /^[0-9]*$/g;
//   if (v) {
//     return numberRegx.test(v) || 'numbers only allowed.';
//   } else return true;
// };

export const alphabetsValidation = (v: string): boolean | string => {
  const alphabetsRegx = /^[a-zA-Z\s]*$/;
  return alphabetsRegx.test(v) || "alphabets only allowed.";
};

export const emailValidation = (v: string): boolean | string => {
  const emailRegx = /^[a-z-0-9_+.-]+\@([a-z0-9-]+\.)+[a-z0-9]{2,7}\s*$/i;
  if (v) {
    return emailRegx.test(v) || "Invalid email address.";
  } else return true;
};

export const alphaNumericValidation = (v: string): boolean | string => {
  const alphabetsRegx = /^[A-Za-z0-9]*$/;
  return alphabetsRegx.test(v) || "invalid format.";
};

export const alphaNumericValidationWithSpace = (
  v: string
): boolean | string => {
  const alphabetsRegx = /^[A-Za-z0-9\s]*$/;
  return alphabetsRegx.test(v) || "invalid format.";
};

export const getMinLengthMessage = (length: number): string => {
  return `minimum ${length} characters required.`;
};
export const getMaxLengthMessage = (length: number): string => {
  return `maximum ${length} characters required.`;
};

export const getRquiredMessage = (feild: string): string => {
  return `${feild} is required.`;
};

export const minLengthValidation = (
  length: number
): ValidationValueMessage<number> => {
  return { value: length, message: getMinLengthMessage(length) };
};
export const maxLengthValidation = (
  length: number
): ValidationValueMessage<number> => {
  return { value: length, message: getMaxLengthMessage(length) };
};

export const requiredValidation = (
  label: string
): ValidationValueMessage<boolean> => {
  return { value: true, message: getRquiredMessage(label) };
};

export const floatNumberValidation = (v: string): boolean | string => {
  const numberRegx_ = /^[-+]?([0-9]+(\.[0-9]+)?|\.[0-9]+)*$/g;
  return v == "+" || v == "-"
    ? "invalid number."
    : numberRegx_.test(v) || "invalid number.";
};

export const notMorethan100 = (v: string): boolean | string => {
  return parseFloat(v) < 100 || "0-100 only allowed.";
};

export const greaterThan = (
  v: string,
  v2: string,
  lable: string
): boolean | string => {
  return parseFloat(v) <= 0
    ? `Minimum 1 of the ${lable}`
    : parseFloat(v) <= parseFloat(v2) || `not greater than ${lable}`;
};
