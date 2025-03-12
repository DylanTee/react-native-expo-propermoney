import React, { useState } from "react";
import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import { useTranslation } from "@libs/i18n/index";
import {
  AppNavigationScreen,
  OverviewTransactionScreenParams,
  TTransactionForm,
} from "@libs/react.navigation.lib";
import { catchErrorDialog, isNumber } from "@libs/utils";
import LoadingCircle from "@components/Shared/LoadingCircle";
import {
  TPostTransactionCreateBody,
  TPostTransactionDeleteBody,
  TPostTransactionUpdateBody,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import { resetQueries } from "@libs/react.query.client.lib";
import { useMutation } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import { useAuthStore } from "@libs/zustand/authStore";
import {
  TAIImageDetectBody,
  TAIImageDetectResponse,
} from "@mcdylanproperenterprise/nodejs-proper-types/ai";
import { ENV } from "../../environment";
import axios from "axios";
import { currencyList } from "@mcdylanproperenterprise/nodejs-proper-money-types/lists/currency";
import dayjs from "dayjs";
import SizedBox from "@components/Shared/SizedBox";
import { sh, sw } from "@libs/responsive.lib";
import ModalDateTimePicker from "@components/Shared/CustomModal/ModalDateTimePicker";
import CustomItemPicker from "@components/Shared/CustomItemPicker";
import ModalTransactionCategoryPicker from "@components/Shared/CustomModal/ModalTransactionCategoryPicker";
import ModalTransationLabelsPicker from "@components/Shared/CustomModal/ModalTransationLabelsPicker";
import ModalImagePicker from "@components/Shared/CustomModal/ModalImagePicker";
import findAmountAndNameOfCategory from "@libs/findAmountAndNameOfCategory";
import ModalZoomableImage from "@components/Shared/CustomModal/ModalZoomableImage";
import { Colors } from "@styles/Colors";
import { Alert, Image, StyleSheet, View } from "react-native";
import CustomTextInput from "@components/Shared/CustomTextInput";
import ModalCurrencyPicker from "@components/Shared/CustomModal/ModalCurrencyPicker";
import CustomText from "@components/Shared/CustomText";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import CustomButton from "@components/Shared/CustomButton";

const TransactionsFormScreen: AppNavigationScreen<"TransactionsFormScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const { form, isEdit, isUsePhotoAI } = route.params;
  const createMutation = useMutation({
    mutationFn: (data: TPostTransactionCreateBody) => {
      return AxiosLibs.defaultClient.post("/transaction/create", data);
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: TPostTransactionUpdateBody) => {
      return AxiosLibs.defaultClient.post("/transaction/update", data);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (data: TPostTransactionDeleteBody) => {
      return AxiosLibs.defaultClient.post("/transaction/delete", data);
    },
  });

  const submit = async (form: TTransactionForm) => {
    if (form._id == undefined && form.transactionCategoryId) {
      createItem({
        transactionCategoryId: form.transactionCategoryId,
        transactionLabelIds: form.transactionLabelIds,
        currency: form.currency,
        amount: form.amount as unknown as number,
        imagePath: form.imagePath,
        note: form.note,
        transactedAt: form.transactedAt,
      });
    } else if (form._id && isEdit && form.transactionCategoryId) {
      editItem({
        _id: form._id,
        transactionCategoryId: form.transactionCategoryId,
        transactionLabelIds: form.transactionLabelIds,
        currency: form.currency,
        amount: form.amount as unknown as number,
        imagePath: form.imagePath,
        note: form.note,
        transactedAt: form.transactedAt,
      });
    }
  };

  const editItem = async ({
    _id,
    transactionCategoryId,
    transactionLabelIds,
    currency,
    amount,
    note,
    transactedAt,
    imagePath,
  }: TPostTransactionUpdateBody) => {
    if (form) {
      editMutation.mutate(
        {
          _id: _id,
          transactedAt: new Date(transactedAt),
          transactionCategoryId: transactionCategoryId,
          transactionLabelIds: transactionLabelIds,
          currency: currency,
          imagePath: imagePath,
          amount: parseFloat(
            amount
              .toString()
              .trim()
              .replace(/[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, "")
          ),
          note: note && note.trim().length > 0 ? note : null,
        },
        {
          onSuccess: () => {
            resetQueries();
            route.params.onEdit(_id);
            navigation.goBack();
          },
          onError: (e) => {
            catchErrorDialog(e);
          },
        }
      );
    }
  };

  const createItem = async ({
    transactionCategoryId,
    transactionLabelIds,
    currency,
    amount,
    note,
    transactedAt,
    imagePath,
  }: TPostTransactionCreateBody) => {
    createMutation.mutate(
      {
        transactedAt: new Date(transactedAt),
        transactionCategoryId: transactionCategoryId,
        transactionLabelIds: transactionLabelIds,
        imagePath: imagePath,
        currency: currency,
        amount: parseFloat(
          amount
            .toString()
            .trim()
            .replace(/[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, "")
        ),
        note: note && note.trim().length > 0 ? note : null,
      },
      {
        onSuccess: () => {
          resetQueries();
          resetToOverviewTransactionScreen(new Date(transactedAt));
        },
        onError: (e) => {
          catchErrorDialog(e);
        },
      }
    );
  };

  const deleteItem = async (id: string) => {
    deleteMutation.mutate(
      {
        _id: id,
      },
      {
        onSuccess: () => {
          resetQueries();
          route.params.onDelete(id);
          navigation.goBack();
        },
        onError: (e) => {
          catchErrorDialog(e);
        },
      }
    );
  };

  const resetToOverviewTransactionScreen = (transactedAt: Date) => {
    const params: OverviewTransactionScreenParams = {
      selectedUserId: authStore.user?._id,
      startTransactedAt: transactedAt,
    };
    navigation.reset({
      index: 0,
      routes: [
        { name: "HomeScreen" },
        { name: "OverviewTransactionScreen", params: params },
      ],
    });
  };

  const [transactionForm, setTransactionForm] =
    useState<TTransactionForm>(form);

  const imageDetectMutation = useMutation({
    mutationFn: async (data: TAIImageDetectBody) => {
      return axios.post(`${ENV.PROPER_API_URL}/ai/imageDetect`, data);
    },
  });
  const questionAmount = `1) Amount:`;
  const questionContext = `2) Context:`;
  const questionCurrency = `3) Currency: (pick from ${currencyList.map(
    (z) => z.iso
  )})`;
  const totalQuestionsOnText = `\n\nBased on above example above, construct this format ${questionAmount} ${questionContext} ${questionCurrency}`;

  const getTransactionAtIsTodayOrYesterday = () => {
    if (
      dayjs(transactionForm.transactedAt).format("DD/MM/YYYY") ==
      dayjs().format("DD/MM/YYYY")
    ) {
      return "- Today";
    } else if (
      dayjs(transactionForm.transactedAt).format("DD/MM/YYYY") ==
      dayjs().subtract(1, "day").format("DD/MM/YYYY")
    ) {
      return "- Yesterday";
    } else {
      return "";
    }
  };

  const isLoading =
    createMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending ||
    imageDetectMutation.isPending;

  return (
    <>
      <ContainerLayout>
        <Header
          containerStyle={{ paddingHorizontal: sw(15) }}
          onBack={() => navigation.goBack()}
        />
        <KeyboardLayout>
          <>
            <SizedBox height={sh(20)} />
            {transactionForm && (
              <View style={{ paddingHorizontal: sw(15) }}>
                <ModalDateTimePicker
                  value={form.transactedAt}
                  buttonStyle={{}}
                  listComponents={
                    <View style={styles.bodyContainer}>
                      <CustomText
                        size="medium"
                        label={`When`}
                        textStyle={{ color: `#545454` }}
                      />
                      <SizedBox width={sw(10)} />
                      <View
                        style={{
                          borderColor: Colors.suvaGrey,
                          borderWidth: 1,
                          borderRadius: sw(5),
                          marginLeft: "auto",
                          padding: sw(5),
                        }}
                      >
                        <CustomText
                          textStyle={{
                            color: "#5A5A5A",
                          }}
                          containerStyle={{ marginLeft: "auto" }}
                          size="medium"
                          label={`${dayjs(transactionForm.transactedAt).format(
                            "DD/MM/YYYY (ddd)"
                          )} ${getTransactionAtIsTodayOrYesterday()}`}
                        />
                      </View>
                    </View>
                  }
                  onChange={(date) => {
                    setTransactionForm((prevState) => ({
                      ...prevState,
                      transactedAt: date,
                    }));
                  }}
                />
                <SizedBox height={sh(20)} />
                <ModalTransactionCategoryPicker
                  id={form.transactionCategoryId}
                  onChange={(id) => {
                    setTransactionForm((prevState) => ({
                      ...prevState,
                      transactionCategoryId: id,
                    }));
                  }}
                />
                <SizedBox height={sh(20)} />
                <ModalTransationLabelsPicker
                  ids={form.transactionLabelIds}
                  onChange={(ids) => {
                    setTransactionForm((prevState) => ({
                      ...prevState,
                      transactionLabelIds: ids,
                    }));
                  }}
                />
                <SizedBox height={sh(20)} />
                <ModalImagePicker
                  buttonStyle={{}}
                  type={"transaction_image"}
                  userId={authStore.user?._id ?? ""}
                  onChange={(data) => {
                    setTransactionForm((prevState) => ({
                      ...prevState,
                      imagePath: data,
                    }));

                    if (isUsePhotoAI) {
                      imageDetectMutation.mutate(
                        {
                          text: totalQuestionsOnText,
                          imageUrl: data,
                        },
                        {
                          onSuccess: (response) => {
                            const result =
                              response.data as TAIImageDetectResponse;
                            if (result.messageContent != "") {
                              const detectedText = findAmountAndNameOfCategory({
                                message: result.messageContent,
                              });
                              setTransactionForm((prevState) => ({
                                ...prevState,
                                currency: detectedText.currency
                                  ? detectedText.currency
                                  : form.currency,
                                amount: detectedText.amount
                                  ? isNumber(detectedText.amount)
                                    ? detectedText.amount
                                    : form.amount
                                  : form.amount,
                                note: detectedText.note
                                  ? detectedText.note
                                  : form.note,
                                imagePath: data,
                              }));
                            }
                          },
                          onError: (e) => {
                            catchErrorDialog(e);
                          },
                        }
                      );
                    }
                  }}
                  listComponents={
                    <>
                      <CustomItemPicker
                        title={isUsePhotoAI ? "Photo AI" : "Image"}
                        pickedText={"Click here"}
                      />
                    </>
                  }
                />

                {transactionForm.imagePath && (
                  <ModalZoomableImage
                    buttonStyle={{
                      justifyContent: "center",
                      alignItems: "center",
                      borderColor: Colors.black,
                      paddingRight: sw(10),
                      flexDirection: "row",
                    }}
                    imagePath={transactionForm.imagePath}
                    listComponents={
                      <Image
                        style={{
                          width: "100%",
                          height: sw(100),
                          alignSelf: "center",
                          borderRadius: sw(5),
                        }}
                        resizeMode="cover"
                        source={{ uri: transactionForm.imagePath }}
                      />
                    }
                  />
                )}
                <SizedBox height={sh(20)} />
                <CustomTextInput
                  contextMenuHidden={true}
                  itemLeft={
                    <>
                      <ModalCurrencyPicker
                        buttonStyle={{}}
                        onChange={(data) => {
                          setTransactionForm((prevState) => ({
                            ...prevState,
                            currency: data,
                          }));
                        }}
                        currency={form.currency}
                        listComponents={
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <CustomText
                              size={"medium"}
                              label={transactionForm.currency}
                            />
                            <SizedBox width={sw(5)} />
                            <ExpoVectorIcon
                              name="down"
                              size={sw(10)}
                              color={Colors.black}
                            />
                            <SizedBox width={sh(5)} />
                          </View>
                        }
                      />
                    </>
                  }
                  isRequired={transactionForm.amount == ""}
                  label={t("amount")}
                  placeholder={"0.00"}
                  keyboardType={"numeric"}
                  onChangeText={(text) => {
                    if (isNumber(text)) {
                      // Format the value with two decimal places
                      let formattedText = text.replace(/[^0-9]/g, "");
                      const length = formattedText.length;
                      if (parseFloat(formattedText) <= 0) {
                        formattedText = ``;
                      } else if (length >= 2) {
                        formattedText = `${formattedText.substring(
                          0,
                          length - 2
                        )}.${formattedText.substring(length - 2)}`;
                      } else if (length == 1) {
                        formattedText = `0.0${formattedText}`;
                      }
                      if (
                        parseFloat(formattedText) >= 0.99 &&
                        parseFloat(formattedText) <= 0.1
                      ) {
                        formattedText = formattedText.replace(/^0+/, "0");
                      } else if (parseFloat(formattedText) >= 1) {
                        formattedText = formattedText.replace(/^0+/, "");
                      }

                      if (formattedText.substring(0, 2) == "00") {
                        formattedText = formattedText.replace("00", "0");
                      } else if (formattedText.substring(0, 1) == ".") {
                        formattedText = formattedText.replace(".", "0.");
                      }
                      setTransactionForm((prevState) => ({
                        ...prevState,
                        amount: formattedText,
                      }));
                    }
                  }}
                  value={transactionForm.amount}
                />
                <SizedBox height={sh(20)} />
                <CustomTextInput
                  maxLength={500}
                  label={t("notes")}
                  multiline
                  value={transactionForm.note}
                  onChangeText={(text) =>
                    setTransactionForm((prevState) => ({
                      ...prevState,
                      note: text,
                    }))
                  }
                />
                <SizedBox height={sh(40)} />

                {isEdit && (
                  <>
                    <SizedBox height={sh(20)} />
                    <CustomButton
                      disabled={isLoading}
                      size={"medium"}
                      type="secondary"
                      title={t("delete")}
                      onPress={() => {
                        Alert.alert(
                          t(`delete`) + " ?",
                          "",
                          [
                            {
                              text: t("no"),
                              onPress: () => {},
                              style: "cancel",
                            },
                            {
                              text: t("yes"),
                              onPress: () => {
                                if (form._id) {
                                  deleteItem(form._id);
                                }
                              },
                            },
                          ],
                          { cancelable: false }
                        );
                      }}
                    />
                  </>
                )}
                <SizedBox height={sh(60)} />
              </View>
            )}
            <LoadingCircle visible={isLoading} />
          </>
        </KeyboardLayout>
        <CustomButton
          buttonStyle={{ marginHorizontal: sw(15) }}
          disabled={isLoading}
          type={"primary"}
          size={"medium"}
          title={isEdit ? t("edit") : t("add")}
          onPress={() => {
            if (!transactionForm.transactionCategoryId) {
              Alert.alert(t("missingCategory"));
            } else if (transactionForm.amount.trim().length == 0) {
              Alert.alert(t("missingAmount"));
            } else {
              submit(form as unknown as TTransactionForm);
            }
          }}
        />
      </ContainerLayout>
    </>
  );
};
export default TransactionsFormScreen;

const styles = StyleSheet.create({
  bodyContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: sh(10),
  },
});
