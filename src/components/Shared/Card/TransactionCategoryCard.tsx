import { sh, sw } from "@libs/responsive.lib";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import SizedBox from "../SizedBox";
import { displayCurrency } from "@libs/utils";
import CustomText from "../CustomText";
import ProgressBar from "../ProgressBar";

interface TransactionCategoryCardProps {
  currency: string;
  percentage: number;
  categoryName: string;
  imagePath: string;
  name: string;
  amount: number;
  totalSpending: number;
  iconNackgroundColor: string;
  onPress(): void;
}

const TransactionCategoryCard = ({
  currency,
  percentage,
  categoryName,
  imagePath,
  amount,
  totalSpending,
  iconNackgroundColor,
  onPress,
}: TransactionCategoryCardProps) => {
  return (
    <TouchableOpacity
      style={{
        padding: sw(15),
      }}
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
            width: sw(45),
            height: sw(45),
            borderRadius: sw(45) / 2,
            padding: sw(10),
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
        <SizedBox width={sw(15)} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", flex: 1 }}>
            <CustomText size={"medium"} label={categoryName.length>18?categoryName.substring(0,18)+"...":categoryName} />
            <CustomText
              size={"medium"}
              label={displayCurrency({
                currency: currency,
                amount: amount,
              })}
              containerStyle={{
                marginLeft: "auto",
              }}
            />
          </View>
          <SizedBox height={sh(3)}/>
          <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
            <ProgressBar
              color={iconNackgroundColor}
              width={(amount / totalSpending) * 100}
            />
            <CustomText
              size={"small"}
              label={`${percentage.toFixed(2)} %`}
              containerStyle={{
                width: "20%",
                marginLeft: "auto",
                justifyContent: "flex-end",
              }}
              textStyle={{ textAlign: "right" }}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default TransactionCategoryCard;
