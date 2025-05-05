import { AsyncStorageLib } from "@libs/async.storage.lib";
import { AxiosLibs } from "@libs/axios.lib";
import { TUser } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { useQuery } from "@tanstack/react-query";

export const useGetUserDetailQuery = () => {
  return useQuery<TUser>({
    queryKey: ["user-detail"],
    queryFn: async () => {
      const tokens = await AsyncStorageLib.getJWTtoken();
      if (!tokens) throw new Error("No token found");
      const { data } = await AxiosLibs.defaultClient.get("/user/detail");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: true,
  });
};
