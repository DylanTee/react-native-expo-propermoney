import { sh, sw } from "@libs/responsive.lib";
import React from "react";
import { Alert, View } from "react-native";
import CustomText from "./CustomText";
import SizedBox from "./SizedBox";
import CustomButton from "./CustomButton";
import { useTranslation } from "react-i18next";

interface NextCreateButtonProps {
  searchText: string;
  currentLength: number;
  maximumLength: number;
  onNext(): void;
}

export default function NextCreateButton({
  searchText,
  currentLength,
  maximumLength,
  onNext,
}: NextCreateButtonProps) {
  const { t } = useTranslation();
  const isMaximum = currentLength >= maximumLength;
  return (
    <>
      <View style={{ padding: sw(15), alignItems: "center" }}>
        <CustomText size={"small"} label={`Tap Next to create`} />
        <CustomText size={"big"} label={searchText} />
        <SizedBox height={sh(10)} />
        <CustomButton
          title={t("next")}
          type={"primary"}
          size={"small"}
          onPress={() => {
            if (isMaximum) {
              Alert.alert(
                "Upgrade",
                `Upgrade in order to create ${searchText}`,
                [
                  {
                    text: t("ok"),
                    onPress: () => {
                      `https://pr0per.vercel.app/topup?projectId=propermone`;
                    },
                  },
                ],
                { cancelable: false }
              );
            } else {
              onNext();
            }
          }}
        />
      </View>
    </>
  );
}
