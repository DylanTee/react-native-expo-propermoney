import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import SizedBox from "@components/Shared/SizedBox";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import { sh, sw } from "@libs/responsive.lib";
import React from "react";
import { View } from "react-native";
import { useTranslation } from "@libs/i18n/index";
import CustomButtonIconRight from "@components/Shared/CustomButtonIconRight";

const TransactionSettingsScreen: AppNavigationScreen<
  "TransactionSettingsScreen"
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  return (
    <ContainerLayout>
      <Header onBack={() => navigation.goBack()} />
      <View
        style={{
          padding: sw(10),
        }}
      >
        <CustomButtonIconRight title={t("categories")} onPress={() => {}} />

        <SizedBox height={sh(20)} />
        <CustomButtonIconRight title={t("labels")} onPress={() => {}} />
      </View>
    </ContainerLayout>
  );
};
export default TransactionSettingsScreen;
