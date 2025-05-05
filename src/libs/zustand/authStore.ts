import { create } from "zustand";
import { AsyncStorageLib } from "../async.storage.lib";
import {
  TJwtToken,
  TUser,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { navigationRef } from "@libs/react.navigation.lib";
import { Alert } from "react-native";
import { resetQueries } from "@libs/react-query/react.query.client.lib";

type AuthStore = {
  logOut: () => void;
  logIn: (data: TJwtToken) => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
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
            AsyncStorageLib.clear();
            resetQueries();
            navigationRef.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            });
          },
        },
      ],
      { cancelable: false }
    );
  },
  logIn: async (data) => {
    await AsyncStorageLib.setJWTtoken(data);
    navigationRef.reset({
      index: 0,
      routes: [{ name: "HomeScreen" }],
    });
  },
}));
