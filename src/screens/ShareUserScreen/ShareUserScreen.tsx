import ContainerLayout from "@components/Layout/ContainerLayout";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import Header from "@components/Shared/Header";
import LoadingCircle from "@components/Shared/LoadingCircle";
import Avatar from "@components/Shared/Avatar";
import SizedBox from "@components/Shared/SizedBox";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import { sfont, sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import {
  TGetVerificationPostGenerateShareIdResponse,
  TPostUserRemoveSharedUserBody,
  TPostVerifyShareIdBody,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { catchErrorDialog } from "@libs/utils";
import { useTranslation } from "@libs/i18n/index";
import dayjs from "dayjs";
import CustomText from "@components/Shared/CustomText";
import ContainerStack from "@components/Shared/ContainerStack";
import CustomButton from "@components/Shared/CustomButton";
import { Global } from "@styles/Global";
import QRCode from "react-native-qrcode-svg";
import { resetQueries } from "@libs/react.query.client.lib";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import ModalScanQrCode from "@components/Shared/CustomModal/ModalScanQrCode";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import { useAuthStore } from "@libs/zustand/authStore";

const ShareUserScreen: AppNavigationScreen<"ShareUserScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const isShared = authStore.user?.sharedUserInfo ? true : false;
  const [timer, setTimer] = useState<number>(600);

  setInterval(() => {
    authStore.getDetail();
  }, 6000);

  const getShareIdQuery = useQuery({
    queryKey: ["/verification/share-"],
    queryFn: async () => {
      const { data } = await AxiosLibs.defaultClient.get(
        `/verification/generate-share-id`
      );
      return data;
    },
    enabled: !isShared,
  });

  const shareId = useMemo(() => {
    if (getShareIdQuery.isSuccess) {
      return getShareIdQuery.data as unknown as TGetVerificationPostGenerateShareIdResponse;
    } else {
      return null;
    }
  }, [getShareIdQuery.isSuccess]);

  const shareMutation = useMutation({
    mutationFn: async (data: TPostVerifyShareIdBody) => {
      return AxiosLibs.defaultClient.post(
        `/verification/verify-share-id`,
        data
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (data: TPostUserRemoveSharedUserBody) => {
      return AxiosLibs.defaultClient.post(`/user/remove-shared-user`, data);
    },
  });

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
  useEffect(() => {
    if (getShareIdQuery.isSuccess) {
      setTimer(dayjs(shareId?.expiryAt).diff(dayjs(), "seconds"));
    }
  }, [getShareIdQuery.isSuccess]);
  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      if (getShareIdQuery.isSuccess && !isShared) {
        // Timer reached 0! Call your desired function here
        Alert.alert(
          "Ended",
          ``,
          [
            {
              text: t("back"),
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
          { cancelable: false }
        );
      }
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (Object.values(oneTimePassword).filter((x) => x === "").length === 0) {
      shareMutation.mutate(
        {
          oneTimePassword: Object.values(oneTimePassword)
            .toString()
            .replace(/,/g, ""),
        },
        {
          onSuccess: () => {
            resetQueries();
            authStore.getDetail();
          },
          onError: (e) => {
            catchErrorDialog(e);
          },
          onSettled: () => {
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
  }, [oneTimePassword]);

  const getNumberOfAccessPerson = () => {
    if (isShared) {
      return 2;
    } else {
      return 1;
    }
  };
  const btnRemove = () => {
    if (authStore.user?.sharedUserInfo) {
      Alert.alert(
        t("remove") + ` ${authStore.user.sharedUserInfo.displayName}?`,
        ``,
        [
          {
            text: "No",
            onPress: () => {},
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              if (authStore.user?.sharedUserInfo) {
                removeMutation.mutate(
                  {
                    sharedUserId: authStore.user.sharedUserInfo._id,
                  },
                  {
                    onSuccess: () => {},
                    onError: (e) => {
                      catchErrorDialog(e);
                    },
                    onSettled: () => {
                      setOneTimePassword({
                        one: "",
                        two: "",
                        three: "",
                        four: "",
                        five: "",
                        six: "",
                      });
                      resetQueries();
                      getShareIdQuery.refetch();
                      authStore.getDetail();
                    },
                  }
                );
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

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
  return (
    <ContainerLayout>
      <Header
        title={t("share")}
        onBack={() => {
          navigation.goBack();
        }}
      />
      <LoadingCircle
        visible={shareMutation.isPending || removeMutation.isPending}
      />
      <KeyboardLayout>
        <ContainerStack>
          {timer && !isShared ? (
            <>
              <CustomText
                size={"medium"}
                label={t("pleaseTellYourPartnerTheFollowing")}
              />
              <SizedBox height={sh(50)} />
              {getShareIdQuery.isLoading ? (
                <ActivityIndicator size={"small"} color={Colors.black} />
              ) : (
                <View style={{ alignItems: "center" }}>
                  <CustomText size={"big"} label={`Your SHARE ID`} />
                  <SizedBox height={sh(5)} />
                  <CustomText
                    size={"big"}
                    label={shareId?.oneTimePassword ?? ""}
                  />
                  <SizedBox height={sh(5)} />
                  <QRCode value={shareId?.oneTimePassword} />
                  <SizedBox height={sh(5)} />
                  <CustomText
                    size={"small"}
                    label={`${t("timeRemaining")}: ${dayjs
                      .duration(timer, "seconds")
                      .format("mm [minute(s)] ss [second(s)]")}`}
                  />
                </View>
              )}
            </>
          ) : (
            <></>
          )}

          {isShared && (
            <>
              <CustomText
                size={"medium"}
                label={`${t(
                  "peopleWithAccess"
                )} (${getNumberOfAccessPerson()}/2)`}
              />
              <SizedBox height={sh(10)} />
              <View style={[Global.shadowLine, styles.userCardStyle]}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar
                    size="big"
                    profileImage={authStore.user?.profileImage ?? ""}
                  />
                  <SizedBox width={sw(10)} />
                  <CustomText
                    size={"medium"}
                    label={`${authStore.user?.displayName} (you)`}
                  />
                </View>
                <View style={{ flexDirection: "row", marginLeft: "auto" }}>
                  <CustomButton
                    type="primary"
                    size="small"
                    title={t("overviewSpending")}
                    onPress={() => {
                      navigation.navigate("OverviewTransactionScreen", {
                        selectedUserId: authStore.user?._id,
                        startTransactedAt: new Date(),
                      });
                    }}
                  />
                </View>
              </View>
              <SizedBox height={sh(10)} />
              {authStore.user?.sharedUserInfo ? (
                <View style={[Global.shadowLine, styles.userCardStyle]}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Avatar
                      size="big"
                      profileImage={authStore.user.sharedUserInfo?.profileImage}
                    />
                    <SizedBox width={sw(10)} />
                    <CustomText
                      size={"medium"}
                      label={authStore.user.sharedUserInfo.displayName}
                    />
                  </View>
                  <SizedBox height={sw(10)} />
                  <View style={{ flexDirection: "row", marginLeft: "auto" }}>
                    <CustomButton
                      type="primary"
                      size="small"
                      title={t("overviewSpending")}
                      onPress={() => {
                        if (authStore.user?.sharedUserInfo) {
                          navigation.navigate("OverviewTransactionScreen", {
                            selectedUserId: authStore.user.sharedUserInfo._id,
                            startTransactedAt: new Date(),
                          });
                        }
                      }}
                    />
                    <SizedBox width={sw(10)} />
                    <CustomButton
                      type="secondary"
                      size="small"
                      title={t("remove")}
                      onPress={() => {
                        btnRemove();
                      }}
                    />
                  </View>
                </View>
              ) : (
                <></>
              )}
              <SizedBox height={sh(40)} />
              <CustomButton
                type="primary"
                size="medium"
                title={t("overviewSpending")}
                onPress={() => {
                  if (authStore.user?.sharedUserInfo) {
                    navigation.navigate("OverviewTransactionScreen", {
                      selectedUserId: undefined,
                      startTransactedAt: new Date(),
                    });
                  }
                }}
              />
            </>
          )}
          {!isShared && (
            <>
              <SizedBox height={sh(50)} />
              <CustomText size="medium" label="SHARE ID (Partner)" />
              <SizedBox height={sw(10)} />
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
              <SizedBox height={sh(10)} />
              <ModalScanQrCode
                buttonStyle={{}}
                listComponents={
                  <View
                    style={{
                      flexDirection: "row",
                      borderRadius: sw(5 / 2),
                      padding: sw(10),
                      borderWidth: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      alignSelf: "flex-end",
                    }}
                  >
                    <CustomText label="Scan QR" size="small" />
                    <SizedBox width={sw(10)} />
                    <ExpoVectorIcon
                      name="scan1"
                      size={sw(15)}
                      color={Colors.black}
                    />
                  </View>
                }
                onChange={(data) => {
                  if (data.length == 6) {
                    setOneTimePassword({
                      one: data.substring(0, 1),
                      two: data.substring(1, 2),
                      three: data.substring(2, 3),
                      four: data.substring(3, 4),
                      five: data.substring(4, 5),
                      six: data.substring(5, 6),
                    });
                  } else {
                    Alert.alert("Invalid QR");
                  }
                }}
              />
            </>
          )}
        </ContainerStack>
      </KeyboardLayout>
    </ContainerLayout>
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
  userCardStyle: {
    borderRadius: 5,
    padding: sw(10),
    backgroundColor: Colors.white,
  },
});
export default ShareUserScreen;
