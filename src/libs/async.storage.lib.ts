import AsyncStorage from "@react-native-async-storage/async-storage";
import { TPostVerificationVerifyResponse } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { navigationRef } from "./react.navigation.lib";

const asyncJWTtoken = "@asyncJWTtoken";
const asyncTimerToRequestOTP = "@asyncTimerToRequestOTP";
const asyncAppRestartAt = "@asyncAppRestartAt";

const setJWTtoken = (value: TPostVerificationVerifyResponse) => {
  AsyncStorage.setItem(asyncJWTtoken, JSON.stringify(value));
};

const getJWTtoken = async () => {
  const data = await AsyncStorage.getItem(asyncJWTtoken);
  if (data) {
    return JSON.parse(data);
  } else {
    return null;
  }
};

const getAppRestartAt = async () => {
  const now = new Date().getTime();
  const data = await AsyncStorage.getItem(asyncAppRestartAt);
  if (data && now >= parseInt(data)) {
    AsyncStorage.removeItem(asyncAppRestartAt);
    navigationRef.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  } else {
    AsyncStorage.setItem(
      asyncAppRestartAt,
      (new Date().getTime() + 120 * 1000).toString()
    );
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

const setTimerToRequestOTP = (value: number) => {
  AsyncStorage.setItem(asyncTimerToRequestOTP, JSON.stringify(value));
};

const removeTimerToRequestOTP = () => {
  AsyncStorage.removeItem(asyncTimerToRequestOTP);
};

const clear = () => {
  AsyncStorage.clear();
};

export const AsyncStorageLib = {
  setJWTtoken,
  getJWTtoken,
  getTimerToRequestOTP,
  setTimerToRequestOTP,
  removeTimerToRequestOTP,
  getAppRestartAt,
  clear,
};
