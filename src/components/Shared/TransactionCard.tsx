import { sh, sw } from "@libs/responsive.lib";
import React from "react";
import { Image, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native";
import SizedBox from "./SizedBox";
import { TTransaction } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import CustomText from "./CustomText";
import { displayCurrency, getAmountTextColor } from "@libs/utils";
import { useAuthStore } from "@libs/zustand/authStore";
import Avatar from "./Avatar";

interface TransactionCardProps {
  data: TTransaction;
  containerStyle?: ViewStyle;
  onPress(): void;
}

const TransactionCard = ({
  containerStyle,
  data,
  onPress,
}: TransactionCardProps) => {
  const authStore = useAuthStore();
  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
    >
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Avatar
          size="big"
          profileImage={
            data.userId == authStore.user?._id
              ? authStore.user.profileImage
              : authStore.user?.sharedUserInfo?.profileImage ?? ""
          }
        />
        <SizedBox width={sw(10)} />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: sw(5) }}
          >
            <View
              style={{
                width: sw(15),
                height: sw(15),
              }}
            >
              <Image
                style={{
                  width: "100%",
                  height: "100%",
                }}
                source={{ uri: data.transactionCategory.imagePath }}
              />
            </View>
            <CustomText containerStyle={{flex:1}} size={"medium"} label={data.transactionCategory.name} />
            <CustomText
              size={"medium"}
              label={displayCurrency({
                currency: data.currency,
                amount: data.amount,
              })}
              containerStyle={{
                marginLeft: "auto",
              }}
              textStyle={{
                color: getAmountTextColor(data.transactionCategory.type),
              }}
            />
          </View>
          {data.note ? (
            <>
              <SizedBox height={sh(5)} />
              <CustomText
                size={"small"}
                textStyle={{ color: "#767676" }}
                label={data.note}
              />
            </>
          ) : (
            <></>
          )}
          <SizedBox height={sh(5)} />
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default TransactionCard;
