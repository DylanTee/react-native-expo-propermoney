import Axios from "axios";
import { AsyncStorageLib } from "./async.storage.lib";
import { TJwtToken } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import axios from "axios";
import { ExpoUpdatesLibs } from "./expo-updates.libs";

const defaultClient = Axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
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
          const cache = await AsyncStorageLib.getJWTtoken();
          const response = await axios({
            url: process.env.EXPO_PUBLIC_API_URL + "/user/refresh-access-token",
            method: "POST",
            headers: {
              Authorization: `Bearer ${cache?.refreshToken}`,
            },
          });
          const data = response.data as TJwtToken;
          await AsyncStorageLib.setJWTtoken(data);
          if (e.config) {
            const newRequestConfig = { ...e.config };
            newRequestConfig.headers = {
              ...e.config.headers,
              Authorization: `Bearer ${data?.accessToken}`,
            } as any;
            return await defaultClient(newRequestConfig);
          }
          return true;
        } catch (e) {
          if (Axios.isAxiosError(e) && e.response?.status === 401) {
            AsyncStorageLib.clear();
            ExpoUpdatesLibs.handleAppRestart();
          }
          {
            return Promise.reject(e);
          }
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
