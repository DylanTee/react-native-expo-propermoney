import { sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import SizedBox from "./SizedBox";
import { Global } from "@styles/Global";
import { displayCurrency } from "@libs/utils";
import CustomText from "./CustomText";
import { useAuthStore } from "@libs/zustand/authStore";
import { ETransactionCategoryType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";

interface TransactionCategoryCardProps {
  categoryType: ETransactionCategoryType;
  userId: string;
  imagePath: string;
  name: string;
  iconNackgroundColor: string;
  totalCurrenciesIncomeAndExpenses: {
    currency: string;
    totalIncomes: number;
    totalExpenses: number;
  }[];
  transactionCount: number;
  onPress(): void;
}

const TransactionCategoryCard = ({
  categoryType,
  userId,
  imagePath,
  name,
  iconNackgroundColor,
  totalCurrenciesIncomeAndExpenses,
  transactionCount,
  onPress,
}: TransactionCategoryCardProps) => {
  const authStore = useAuthStore();
  return (
    <TouchableOpacity
      style={[
        {
          paddingHorizontal: sw(10),
          paddingVertical: sw(10),
          borderRadius: 5,
          backgroundColor: Colors.white,
        },
        Global.shadowLine,
      ]}
      onPress={() => {
        onPress();
      }}
    >
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <View
          style={{
            width: sw(25),
            height: sw(25),
            borderRadius: sw(25) / 2,
            padding: sw(5),
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: iconNackgroundColor,
          }}
        >
          <Image
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              zIndex: 1,
            }}
            source={{ uri: imagePath }}
          />
        </View>
        <SizedBox width={sw(10)} />
        <View style={{ flex: 1 }}>
          <CustomText label={name} size={"small"} />
          <SizedBox height={sh(5)} />
          <CustomText
            label={`${transactionCount} transactions`}
            size={"small"}
          />
          <SizedBox height={sh(5)} />
          <CustomText
            label={`by ${
              userId == authStore.user?._id
                ? authStore.user?.displayName + " (you)"
                : authStore.user?.sharedUserInfo?.displayName
            }`}
            size={"small"}
          />
        </View>
        <View style={{}}>
          {totalCurrenciesIncomeAndExpenses.map((data) => (
            <CustomText
              size={"medium"}
              label={displayCurrency({
                currency: data.currency,
                amount:
                  categoryType == ETransactionCategoryType.expense
                    ? data.totalExpenses
                    : data.totalIncomes,
              })}
              textStyle={{
                marginLeft: "auto",
                color:
                  categoryType == ETransactionCategoryType.expense
                    ? Colors.red
                    : Colors.green,
              }}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default TransactionCategoryCard;
