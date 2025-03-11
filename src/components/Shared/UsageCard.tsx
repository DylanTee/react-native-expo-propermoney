import React from "react";
import { Linking, View } from "react-native";
import CustomText from "./CustomText";
import { sh, sw } from "@libs/responsive.lib";
import SizedBox from "./SizedBox";
import { Colors } from "@styles/Colors";
import ProgressBar from "./ProgressBar";
import CustomButton from "./CustomButton";
import { useTranslation } from "react-i18next";
import { navigationRef } from "@libs/react.navigation.lib";

interface UsageCardProps {
  title: string;
  currentLength: number;
  maximumLength: number;
}

export default function UsageCard({
  title,
  currentLength,
  maximumLength,
}: UsageCardProps) {
  const { t } = useTranslation();
  const isMaximum = currentLength >= maximumLength;
  return (
    <View style={{}}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <CustomText size={"medium"} label={title} />
        <SizedBox width={sw(5)} />
        <CustomText
          size={"big"}
          label={currentLength.toString()}
          textStyle={{
            color: isMaximum ? Colors.red : Colors.green,
          }}
        />
        <CustomText size={"medium"} label={" / " + maximumLength.toString()} />
      </View>
      <SizedBox height={sh(5)} />
      <ProgressBar
        color={isMaximum ? Colors.red : Colors.primary}
        width={(currentLength / maximumLength) * 100}
      />
      <SizedBox height={sh(5)} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {isMaximum && (
          <>
            <View style={{ flex: 1 }}>
              <CustomText
                textStyle={{ color: Colors.red }}
                size={"small"}
                label={`Some of the ${title} cannot be choose and edit. Upgrade now`}
              />
            </View>
          </>
        )}
        <SizedBox width={sw(5)} />
        <View style={{ marginLeft: "auto" }}>
          <CustomButton
            size={"small"}
            type={"primary"}
            title={t("upgrade")}
            onPress={() => {
              Linking.openURL(
                `https://pr0per.vercel.app/topup?projectId=propermoney`
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}
