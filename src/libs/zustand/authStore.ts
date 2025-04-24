import { create } from "zustand";
import { AsyncStorageLib } from "../async.storage.lib";
import {
  TJwtToken,
  TUser,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { AxiosLibs } from "../axios.lib";
import { navigationRef } from "@libs/react.navigation.lib";
import { Alert } from "react-native";

type AuthStore = {
  user: TUser | undefined;
  getDetail: () => void;
  logOut: () => void;
  logIn: (data: TJwtToken) => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: undefined,
  getDetail: async () => {
    const tokens =
      (await AsyncStorageLib.getJWTtoken()) as unknown as TJwtToken;
    if (tokens) {
      try {
        const { data } = await AxiosLibs.defaultClient.get("/user/detail");
        set((state) => ({
          ...state,
          user: data,
        }));
      } catch (e) {
        throw e;
      }
    }
  },
  logOut: () => {
    Alert.alert(
      "Log Out?",
      "",
      [
        {
          text: "No",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            navigationRef.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            });
            set((state) => ({
              ...state,
              user: undefined,
            }));
            AsyncStorageLib.clear();
          },
        },
      ],
      { cancelable: false }
    );
  },
  logIn: async (data) => {
    await AsyncStorageLib.setJWTtoken(data);
    Promise.all([get().getDetail()]).then(() => {
      setTimeout(() => {
        navigationRef.reset({
          index: 0,
          routes: [{ name: "HomeScreen" }],
        });
      }, 2000);
    });
  },
}));
