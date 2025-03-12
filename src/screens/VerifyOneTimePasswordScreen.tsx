import React, { useEffect, useRef, useState } from "react";
import ContainerLayout from "@components/Layout/ContainerLayout";
import {
  Keyboard,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import Header from "@components/Shared/Header";
import { useTranslation } from "@libs/i18n/index";
import { sw, sh, sfont } from "@libs/responsive.lib";
import SizedBox from "@components/Shared/SizedBox";
import { Colors } from "@styles/Colors";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import LoadingCircle from "@components/Shared/LoadingCircle";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import CustomText from "@components/Shared/CustomText";
import { useMutation } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import {
  TPostUserRequestOTPBody,
  TPostUserRequestOTPResponse,
  TPostVerificationVerifyBody,
  TPostVerificationVerifyResponse,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { AsyncStorageLib } from "@libs/async.storage.lib";
import CustomButton from "@components/Shared/CustomButton";
import { catchErrorDialog, getRandomNumber } from "@libs/utils";
import { useAuthStore } from "@libs/zustand/authStore";

const VerifyOneTimePasswordScreen: AppNavigationScreen<
  "VerifyOneTimePasswordScreen"
> = ({ navigation, route }) => {
  const authStore = useAuthStore();
  const { t } = useTranslation();
  const { oneTimePasswordType, phoneNumber } = route.params;
  const boxInput1 = useRef<TextInput>(null);
  const boxInput2 = useRef<TextInput>(null);
  const boxInput3 = useRef<TextInput>(null);
  const boxInput4 = useRef<TextInput>(null);
  const boxInput5 = useRef<TextInput>(null);
  const boxInput6 = useRef<TextInput>(null);
  const [oneTimePassword, setOneTimePassword] = useState({
    one: "",
    two: "",
    three: "",
    four: "",
    five: "",
    six: "",
  });
  const verificationVerifyMutation = useMutation({
    mutationFn: (data: TPostVerificationVerifyBody) => {
      return AxiosLibs.defaultClient.post("/verification/verify", data);
    },
  });
  const requestOTPMutation = useMutation({
    mutationFn: (data: TPostUserRequestOTPBody) => {
      return AxiosLibs.defaultClient.post("/user/request-otp", data);
    },
  });
  useEffect(() => {
    if (Object.values(oneTimePassword).filter((x) => x === "").length === 0) {
      verificationVerifyMutation.mutate(
        {
          phoneNumber: phoneNumber,
          oneTimePassword: Object.values(oneTimePassword)
            .toString()
            .replace(/,/g, ""),
          oneTimePasswordType: oneTimePasswordType,
        },
        {
          onSuccess: async (response) => {
            const data = response.data as TPostVerificationVerifyResponse;
            authStore.logIn(data);
          },
          onError: () => {
            setOneTimePassword({
              one: "",
              two: "",
              three: "",
              four: "",
              five: "",
              six: "",
            });
            boxInput1.current?.focus();
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oneTimePassword, navigation]);

  const onKeyPress = ({
    event,
    index,
  }: {
    event: NativeSyntheticEvent<TextInputKeyPressEventData>;
    index: number;
  }) => {
    if (
      event.nativeEvent.key === "Backspace" ||
      event.nativeEvent.key === "Delete"
    ) {
      // Trigger your callback function here when backspace or delete is pressed
      // You can access the final input value using the inputValue state variable
      if (index == 2) {
        boxInput1?.current?.focus();
      } else if (index == 3) {
        boxInput2?.current?.focus();
      } else if (index == 4) {
        boxInput3?.current?.focus();
      } else if (index == 5) {
        boxInput4?.current?.focus();
      } else if (index == 6) {
        boxInput5?.current?.focus();
      }
    } else {
      if (index == 1) {
        boxInput2?.current?.focus();
      } else if (index == 2) {
        boxInput3?.current?.focus();
      } else if (index == 3) {
        boxInput4?.current?.focus();
      } else if (index == 4) {
        boxInput5?.current?.focus();
      } else if (index == 5) {
        boxInput6?.current?.focus();
      } else if (index == 6) {
        Keyboard.dismiss();
      }
    }
  };

  const handleResendCode = () => {
    requestOTPMutation.mutate(
      {
        phoneNumber: phoneNumber,
      },
      {
        onSuccess: (response) => {
          AsyncStorageLib.setTimerToRequestOTP(getRandomNumber(30, 59));
          const data = response.data as unknown as TPostUserRequestOTPResponse;
        },
        onError: (error) => {
          catchErrorDialog(error);
        },
      }
    );
  };

  return (
    <>
      <LoadingCircle
        visible={
          verificationVerifyMutation.isPending || requestOTPMutation.isPending
        }
      />
      <ContainerLayout>
        <>
          <Header
            onBack={() => navigation.goBack()}
          />
          <KeyboardLayout>
            
              <SizedBox height={sh(20)} />
              <CustomText
                size={"medium"}
                label={`${
                  t("weHadSendOneTimePasswordMobile") + " " + phoneNumber
                }`}
              />
              <SizedBox height={sh(40)} />
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <TextInput
                  ref={boxInput1}
                  style={styles.boxInput}
                  keyboardType={"decimal-pad"}
                  maxLength={1}
                  onChangeText={(text) =>
                    setOneTimePassword({ ...oneTimePassword, one: text })
                  }
                  onKeyPress={(event) => onKeyPress({ event, index: 1 })}
                  value={oneTimePassword.one}
                />
                <SizedBox width={sw(5)} />
                <TextInput
                  ref={boxInput2}
                  style={styles.boxInput}
                  keyboardType={"decimal-pad"}
                  maxLength={1}
                  onChangeText={(text) =>
                    setOneTimePassword({ ...oneTimePassword, two: text })
                  }
                  onKeyPress={(event) => onKeyPress({ event, index: 2 })}
                  value={oneTimePassword.two}
                />
                <SizedBox width={sw(5)} />
                <TextInput
                  ref={boxInput3}
                  style={styles.boxInput}
                  keyboardType={"decimal-pad"}
                  maxLength={1}
                  onChangeText={(text) =>
                    setOneTimePassword({ ...oneTimePassword, three: text })
                  }
                  onKeyPress={(event) => onKeyPress({ event, index: 3 })}
                  value={oneTimePassword.three}
                />
                <SizedBox width={sw(5)} />
                <TextInput
                  ref={boxInput4}
                  style={styles.boxInput}
                  keyboardType={"decimal-pad"}
                  maxLength={1}
                  onChangeText={(text) =>
                    setOneTimePassword({ ...oneTimePassword, four: text })
                  }
                  onKeyPress={(event) => onKeyPress({ event, index: 4 })}
                  value={oneTimePassword.four}
                />
                <SizedBox width={sw(5)} />
                <TextInput
                  ref={boxInput5}
                  style={styles.boxInput}
                  keyboardType={"decimal-pad"}
                  maxLength={1}
                  onChangeText={(text) =>
                    setOneTimePassword({ ...oneTimePassword, five: text })
                  }
                  onKeyPress={(event) => onKeyPress({ event, index: 5 })}
                  value={oneTimePassword.five}
                />
                <SizedBox width={sw(5)} />
                <TextInput
                  ref={boxInput6}
                  style={styles.boxInput}
                  keyboardType={"decimal-pad"}
                  maxLength={1}
                  onChangeText={(text) =>
                    setOneTimePassword({ ...oneTimePassword, six: text })
                  }
                  onKeyPress={(event) => onKeyPress({ event, index: 6 })}
                  value={oneTimePassword.six}
                />
              </View>
              <SizedBox height={sh(20)} />
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <CustomButton
                  isTimer={true}
                  disabled={
                    verificationVerifyMutation.isPending ||
                    requestOTPMutation.isPending
                  }
                  type="tertiary"
                  size="small"
                  title="Resend Code"
                  onPress={() => handleResendCode()}
                />
              </View>
            
          </KeyboardLayout>
        </>
      </ContainerLayout>
    </>
  );
};
const styles = StyleSheet.create({
  boxInput: {
    flex: 1,
    borderWidth: 1.5,
    height: sh(50),
    borderColor: Colors.gainsboro,
    borderRadius: 5,
    textAlign: "center",
    fontSize: sfont(18),
    color: Colors.black,
  },
});
export default VerifyOneTimePasswordScreen;
