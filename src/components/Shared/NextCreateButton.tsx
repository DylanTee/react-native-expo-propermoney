import { sh, sw } from "@libs/responsive.lib";
import React from "react";
import { View } from "react-native";
import CustomText from "./CustomText";
import SizedBox from "./SizedBox";
import CustomButton from "./CustomButton";
import { useTranslation } from "react-i18next";

interface NextCreateButtonProps {
  searchText: string;
  currentLength: number;
  onNext(): void;
}

export default function NextCreateButton({
  searchText,
  currentLength,
  onNext,
}: NextCreateButtonProps) {
  const { t } = useTranslation();
  return (
    <>
      <View
        style={{
          padding: sw(15),
          alignItems: "center",
        }}
      >
        <CustomText size={"small"} label={`Tap Next to create`} />
        <CustomText size={"big"} label={searchText} />
        <SizedBox height={sh(10)} />
        <CustomButton
          buttonStyle={{ paddingHorizontal: sw(20) }}
          title={t("next")}
          type={"primary"}
          size={"small"}
          onPress={() => {
            onNext();
          }}
        />
      </View>
    </>
  );
}
