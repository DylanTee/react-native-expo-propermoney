import { create } from "zustand";
import { AsyncStorageLib } from "../async.storage.lib";
import {
  TJwtToken,
  TMemberFeature,
  TGetUserDetailResponse,
  memberFeatureFree,
  memberFeaturePlus,
  memberFeaturePremium,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { AxiosLibs } from "../axios.lib";
import { ESubscriptionEntitlement } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import { navigationRef } from "@libs/react.navigation.lib";

type AuthStore = {
  user:
    | (TGetUserDetailResponse & {
        feature: TMemberFeature;
      })
    | null;
  getDetail: () => void;
  logOut: () => void;
  logIn: (data: TJwtToken) => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  getDetail: async () => {
    const tokens =
      (await AsyncStorageLib.getJWTtoken()) as unknown as TJwtToken;
    if (tokens) {
      try {
        const { data } = await AxiosLibs.defaultClient.get("/user/detail");
        let premiumMemberTrialEndAt: Date | null = null;
        let topUpMemberEndAt = null;
        let feature: TMemberFeature = memberFeatureFree;
        if (data.premiumMemberTrialEndAt) {
          premiumMemberTrialEndAt = data.premiumMemberTrialEndAt;
          feature = memberFeaturePremium;
        }
        if (data.topUpMemberRole) {
          premiumMemberTrialEndAt = null;
          topUpMemberEndAt = data.topUpMemberEndAt;
          if (data.topUpMemberRole == ESubscriptionEntitlement.plus) {
            feature = memberFeaturePlus;
          } else if (data.topUpMemberRole == ESubscriptionEntitlement.premium) {
            feature = memberFeaturePremium;
          }
        }
        set((state) => ({
          ...state,
          user: {
            ...data,
            premiumMemberTrialEndAt: premiumMemberTrialEndAt,
            feature: feature,
          },
        }));
      } catch (e) {
        throw e;
      }
    }
  },
  logOut: () => {
    AsyncStorageLib.clear();
    set((state) => ({
      ...state,
      user: null,
    }));
  },
  logIn: async (data) => {
    await AsyncStorageLib.setJWTtoken(data);
    Promise.all([get().getDetail()]).then(() => {
      navigationRef.reset({
        index: 0,
        routes: [{ name: "HomeScreen" }],
      });
    });
  },
}));
