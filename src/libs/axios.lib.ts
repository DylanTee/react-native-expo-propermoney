import { ENV } from "../../environment";
import Axios from "axios";
import { AsyncStorageLib } from "./async.storage.lib";
import { TJwtToken } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import axios from "axios";
import { ExpoUpdatesLibs } from "./expo-updates.libs";

const defaultClient = Axios.create({
  baseURL: ENV.API_URL,
  timeout: 60000,
});

defaultClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    try {
      const refreshUserAccessToken = async () => {
        try {
          const tokens = await AsyncStorageLib.getJWTtoken();
          const response = await axios({
            url: ENV.API_URL + "/user/refreshUserAccessToken",
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens?.refreshToken}`,
            },
          });
          const data = response.data as TJwtToken;
          await AsyncStorageLib.setJWTtoken(data);
          if (error.config) {
            const newRequestConfig = { ...error.config };
            newRequestConfig.headers = {
              ...error.config.headers,
              Authorization: `Bearer ${tokens?.accessToken}`,
            } as any;
            return await defaultClient(newRequestConfig);
          }
          return true;
        } catch (error) {
          AsyncStorageLib.clear();
          ExpoUpdatesLibs.handleAppRestart();
        }
      };
      //accessToken expired, call api to get new token
      if (Axios.isAxiosError(error) && error.response?.status === 401) {
        await refreshUserAccessToken();
      } else {
        return Promise.reject(error);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

const setAccessToken = async (accessToken: string) => {
  defaultClient.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${accessToken}`;
};

export const AxiosLibs = {
  defaultClient,
  setAccessToken,
};
