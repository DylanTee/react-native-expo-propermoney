import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TJwtToken,
  TPostVerificationVerifyResponse,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";

const asyncJWTtoken = "@asyncJWTtoken";
const asyncTimerToRequestOTP = "@asyncTimerToRequestOTP";

const setJWTtoken = (value: TPostVerificationVerifyResponse) => {
  AsyncStorage.setItem(asyncJWTtoken, JSON.stringify(value));
};

const getJWTtoken = async () => {
  const data = await AsyncStorage.getItem(asyncJWTtoken);
  if (data) {
    return JSON.parse(data) as unknown as TJwtToken;
  } else {
    return null;
  }
};

const getTimerToRequestOTP = async () => {
  const data = await AsyncStorage.getItem(asyncTimerToRequestOTP);
  if (data) {
    return JSON.parse(data);
  } else {
    return null;
  }
};

const setTimerToRequestOTP = async (value: number) => {
  AsyncStorage.setItem(asyncTimerToRequestOTP, JSON.stringify(value));
};

const removeTimerToRequestOTP = async () => {
  AsyncStorage.removeItem(asyncTimerToRequestOTP);
};

const clear = async () => {
  await AsyncStorage.clear();
};

export const AsyncStorageLib = {
  setJWTtoken,
  getJWTtoken,
  getTimerToRequestOTP,
  setTimerToRequestOTP,
  removeTimerToRequestOTP,
  clear,
};
