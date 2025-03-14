import { sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import SizedBox from "./SizedBox";
import { Global } from "@styles/Global";
import CustomText from "./CustomText";
import { displayCurrency } from "@libs/utils";
import { useAuthStore } from "@libs/zustand/authStore";
import { ETransactionCategoryType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";

interface TransactionLabelCardProps {
  userId: string;
  categoryType: ETransactionCategoryType;
  name: string;
  transactionCounts: number;
  totalCurrenciesIncomeAndExpenses: {
    currency: string;
    totalIncomes: number;
    totalExpenses: number;
  }[];
  onPress(): void;
}

const TransactionLabelCard = ({
  userId,
  categoryType,
  name,
  transactionCounts,
  totalCurrenciesIncomeAndExpenses,
  onPress,
}: TransactionLabelCardProps) => {
  const authStore = useAuthStore();
  return (
    <TouchableOpacity
      style={[
        {
          padding: sw(10),
          backgroundColor: Colors.white,
        },
        Global.shadowLine,
      ]}
      onPress={() => onPress()}
    >
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 1 }}>
          <CustomText label={name} size={"small"} />
          <SizedBox height={sh(5)} />
          <CustomText
            label={`${transactionCounts} transactions`}
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
        <View>
          {totalCurrenciesIncomeAndExpenses.map((item) => (
            <CustomText
              key={item.currency}
              size={"medium"}
              label={displayCurrency({
                currency: item.currency,
                amount:
                  categoryType == ETransactionCategoryType.expense
                    ? item.totalExpenses
                    : item.totalIncomes,
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
export default TransactionLabelCard;
