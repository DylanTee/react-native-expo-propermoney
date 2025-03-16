import React, { useEffect, useState } from "react";
import ContainerLayout from "@components/Layout/ContainerLayout";
import SizedBox from "@components/Shared/SizedBox";
import { sh, sw } from "@libs/responsive.lib";
import { useTranslation } from "@libs/i18n/index";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import {
  convertPhoneNumber,
  getRandomNumber,
  removeSpecialCharacters,
} from "@libs/utils";
import {
  TPostUserRequestOTPBody,
  TPostUserRequestOTPResponse,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import { useMutation } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import CustomTextInput from "@components/Shared/CustomTextInput";
import CustomButton from "@components/Shared/CustomButton";
import {
  countryList,
  TCountry,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/lists/country";
import { Alert, Image, Linking, TouchableOpacity } from "react-native";
import CustomText from "@components/Shared/CustomText";
import { AsyncStorageLib } from "@libs/async.storage.lib";
import ModalCountryPicker from "@components/Shared/CustomModal/ModalCountryPicker";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import { Colors } from "@styles/Colors";
import { useAuthStore } from "@libs/zustand/authStore";
import VersionText from "@components/Shared/VersionText";

const LoginScreen: AppNavigationScreen<"LoginScreen"> = ({
  navigation,
  route,
}) => {
  const authStore = useAuthStore();
  const { t } = useTranslation();
  const userRequestOTPMutation = useMutation({
    mutationFn: (data: TPostUserRequestOTPBody) => {
      return AxiosLibs.defaultClient.post("/user/request-otp", data);
    },
  });
  const [phoneNumber, setPhoneNumber] = useState<{
    selectedCountry: TCountry;
    text: string;
  }>({
    selectedCountry: countryList[0],
    text: "",
  });

  const handleLogin = () => {
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
            userRequestOTPMutation.mutate(
              {
                phoneNumber: convertedPhoneNumber,
              },
              {
                onSuccess: (response) => {
                  AsyncStorageLib.setTimerToRequestOTP(getRandomNumber(30, 59));
                  const data =
                    response.data as unknown as TPostUserRequestOTPResponse;
                  navigation.navigate("VerifyOneTimePasswordScreen", {
                    phoneNumber: convertedPhoneNumber,
                    oneTimePasswordType: data.verificationOneTimePasswordType,
                  });
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
  };

  useEffect(() => {
    const init = async () => {
      const tokens = await AsyncStorageLib.getJWTtoken();
      if (tokens) {
        await authStore.getDetail();
        navigation.reset({
          index: 0,
          routes: [{ name: "HomeScreen" }],
        });
      }
    };
    init();
  }, []);

  const isLoading = userRequestOTPMutation.isPending;

  return (
    <>
      <ContainerLayout>
        <KeyboardLayout>
          <SizedBox height={sh(40)} />
          <Image
            source={require("@assets/logo.png")}
            style={{
              height: sw(50),
              width: sw(50),
              borderRadius: sw(50 / 2),
              alignSelf: "center",
            }}
            resizeMode={"contain"}
          />
          <SizedBox height={sh(40)} />
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
          <SizedBox height={sh(5)} />
          <TouchableOpacity
            onPress={() => {
              Linking.openURL("https://pr0per.vercel.app/privacy-policy");
            }}
          >
            <CustomText
              label="By submitting your phone number, you confirm you've read the Privacy Policy"
              size="small"
            />
          </TouchableOpacity>
          <SizedBox height={sh(40)} />
          <CustomButton
            isTimer={true}
            disabled={
              phoneNumber.text.trim().length == 0 ||
              userRequestOTPMutation.isPending ||
              isLoading
            }
            type={"primary"}
            size={"medium"}
            title={"Log In"}
            onPress={() => handleLogin()}
          />
          <SizedBox height={sh(20)} />
          <VersionText />
        </KeyboardLayout>
      </ContainerLayout>
    </>
  );
};
export default LoginScreen;
