import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import React, { useState } from "react";
import { useTranslation } from "@libs/i18n/index";
import { sh, sw } from "@libs/responsive.lib";
import SizedBox from "@components/Shared/SizedBox";
import { Alert } from "react-native";
import CustomTextInput from "@components/Shared/CustomTextInput";
import {
  TCountry,
  countryList,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/lists/country";
import { convertPhoneNumber, removeSpecialCharacters } from "@libs/utils";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import { TPostRewardSubmitBody } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import CustomButton from "@components/Shared/CustomButton";
import CustomText from "@components/Shared/CustomText";
import { useMutation } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import ModalCountryPicker from "@components/Shared/CustomModal/ModalCountryPicker";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import { Colors } from "@styles/Colors";

const MyRewardFormScreen: AppNavigationScreen<"MyRewardFormScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const submitMutation = useMutation({
    mutationFn: (data: TPostRewardSubmitBody) => {
      return AxiosLibs.defaultClient.post("/reward/submit", data);
    },
  });
  const [phoneNumber, setPhoneNumber] = useState<{
    selectedCountry: TCountry;
    text: string;
  }>({
    selectedCountry: countryList[0],
    text: route.params.data.phoneNumber?.replace("+60", "") ?? "",
  });
  const btnSubmit = () => {
    if (phoneNumber.text.trim().length == 0) {
      Alert.alert(
        t("phoneNumberMissing"),
        "",
        [
          {
            text: t("ok"),
            onPress: () => {},
            style: "cancel",
          },
        ],
        { cancelable: false }
      );
    } else {
      const convertedPhoneNumber = convertPhoneNumber({
        countryCode: phoneNumber.selectedCountry.countryCode,
        text: phoneNumber.text,
      });
      Alert.alert(
        t("phoneNumber"),
        `${convertedPhoneNumber}?`,
        [
          {
            text: "No",
            onPress: () => {},
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              submitMutation.mutate(
                {
                  rewardId: route.params.data._id,
                  phoneNumber: convertedPhoneNumber,
                },
                {
                  onSuccess: () => {
                    Alert.alert(t("weHadReceivedYourSubmitted"));
                    route.params.onRefresh();
                    navigation.goBack();
                  },
                  onError: (e) => {
                    Alert.alert(e.message);
                  },
                }
              );
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  const isLoading = submitMutation.isPending;

  return (
    <ContainerLayout>
      <Header onBack={() => navigation.goBack()} />
      <KeyboardLayout>
        <SizedBox height={sh(20)} />
        <CustomText
          label={t("provideEWalletPhoneNumberAccount")}
          size={"medium"}
        />
        <SizedBox height={sh(20)} />
        <CustomTextInput
          itemLeft={
            <ModalCountryPicker
              listComponents={
                <>
                  <CustomText
                    size={"medium"}
                    label={phoneNumber.selectedCountry.countryCode}
                  />
                  <SizedBox width={sw(5)} />
                  <ExpoVectorIcon
                    name="down"
                    size={sw(10)}
                    color={Colors.black}
                  />
                  <SizedBox width={sw(5)} />
                </>
              }
              buttonStyle={{
                flexDirection: "row",
                borderRightWidth: 1.5,
                borderColor: Colors.gainsboro,
                justifyContent: "center",
                alignItems: "center",
              }}
              countryCode={phoneNumber.selectedCountry.countryCode}
              onChange={(data) => {
                setPhoneNumber({ ...phoneNumber, selectedCountry: data });
              }}
            />
          }
          label={t("phoneNumber")}
          keyboardType={"phone-pad"}
          autoCapitalize="none"
          onChangeText={(text) =>
            setPhoneNumber({
              ...phoneNumber,
              text: removeSpecialCharacters(text.trim()),
            })
          }
          value={phoneNumber.text}
        />
        <SizedBox height={sh(40)} />
        <CustomButton
          disabled={isLoading}
          type={"primary"}
          size={"big"}
          title={t("submit")}
          onPress={() => btnSubmit()}
        />
      </KeyboardLayout>
    </ContainerLayout>
  );
};
export default MyRewardFormScreen;
