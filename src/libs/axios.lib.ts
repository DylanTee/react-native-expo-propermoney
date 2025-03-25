import { ENV } from "../../environment";
import Axios, { AxiosError } from "axios";
import { AsyncStorageLib } from "./async.storage.lib";
import { TJwtToken } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import axios from "axios";
import { ExpoUpdatesLibs } from "./expo-updates.libs";

const defaultClient = Axios.create({
  baseURL: ENV.API_URL,
});

defaultClient.interceptors.request.use(
  async (config) => {
    const cache = await AsyncStorageLib.getJWTtoken();
    if (cache?.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${cache.accessToken}`,
      } as any;
    }
    return config;
  },
  (e) => {
    return Promise.reject(e);
  }
);

defaultClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (e) => {
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
          if (e.config) {
            const newRequestConfig = { ...e.config };
            newRequestConfig.headers = {
              ...e.config.headers,
              Authorization: `Bearer ${tokens?.accessToken}`,
            } as any;
            return await defaultClient(newRequestConfig);
          }
          return true;
        } catch (e) {
          AsyncStorageLib.clear();
          ExpoUpdatesLibs.handleAppRestart();
        }
      };
      //accessToken expired, call api to get new token
      if (Axios.isAxiosError(e) && e.response?.status === 401) {
        await refreshUserAccessToken();
      } else {
        return Promise.reject(e);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }
);

export const AxiosLibs = {
  defaultClient,
};
