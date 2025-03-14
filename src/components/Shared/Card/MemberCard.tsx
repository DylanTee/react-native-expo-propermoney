import { sh, sw } from "@libs/responsive.lib";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import dayjs from "dayjs";
import SizedBox from "@components/Shared/SizedBox";
import { ESubscriptionEntitlement } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import Avatar from "@components/Shared/Avatar";
import { navigationRef } from "@libs/react.navigation.lib";
import { useAuthStore } from "@libs/zustand/authStore";
import CustomText from "../CustomText";

interface MemberCardProps {
  currentRouteName: "HomeScreen" | "MoreScreen";
}

const MemberCard = (props: MemberCardProps) => {
  const authStore = useAuthStore();
  const isTopUp = authStore.user?.topUpMemberEndAt;
  const isTrial = authStore.user?.premiumMemberTrialEndAt;
  const getReminderExpiresMessage = () => {
    if (isTopUp) {
      return `Member expires on ${dayjs(
        authStore.user?.topUpMemberEndAt
      ).format("MMM DD YYYY")}`;
    } else if (
      isTrial ||
      authStore.user?.feature.name == ESubscriptionEntitlement.starter
    ) {
      return `Trial expires on ${dayjs(
        authStore.user?.premiumMemberTrialEndAt
      ).format("MMM DD YYYY")}`;
    } else {
      return `Tier benefits`;
    }
  };

  return (
    <>
      {authStore.user && (
        <View
          style={{
            // borderBottomWidth: 1,
            // borderColor: Colors.gainsboro,
            paddingHorizontal: sw(15),
            paddingBottom:sh(5)
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Avatar size="big" profileImage={authStore.user.profileImage} />
            <SizedBox width={sw(5)} />
            <TouchableOpacity
              onPress={() => {
                navigationRef.navigate("MoreScreen");
              }}
            >
              <CustomText label={authStore.user.displayName} size={"medium"} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};
export default MemberCard;
