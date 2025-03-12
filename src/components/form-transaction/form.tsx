import React, { useState } from "react";
import { Alert, Image, View } from "react-native";
import { useTranslation } from "@libs/i18n/index";
import CustomTextInput from "@components/Shared/CustomTextInput";
import SizedBox from "@components/Shared/SizedBox";
import { sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import CustomText from "@components/Shared/CustomText";
import { catchErrorDialog, isNumber } from "@libs/utils";
import {
  TAIImageDetectBody,
  TAIImageDetectResponse,
} from "@mcdylanproperenterprise/nodejs-proper-types/ai";
import CustomItemPicker from "@components/Shared/CustomItemPicker";
import { TTransactionForm } from "@libs/react.navigation.lib";
import CustomButton from "@components/Shared/CustomButton";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import ModalImagePicker from "@components/Shared/CustomModal/ModalImagePicker";
import ModalDateTimePicker from "@components/Shared/CustomModal/ModalDateTimePicker";
import ModalCurrencyPicker from "@components/Shared/CustomModal/ModalCurrencyPicker";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import ModalZoomableImage from "@components/Shared/CustomModal/ModalZoomableImage";
import { useAuthStore } from "@libs/zustand/authStore";
import axios from "axios";
import { ENV } from "../../../environment/index";
import findAmountAndNameOfCategory from "@libs/findAmountAndNameOfCategory";
import { currencyList } from "@mcdylanproperenterprise/nodejs-proper-money-types/lists/currency";
import ModalTransactionCategoryPicker from "@components/Shared/CustomModal/ModalTransactionCategoryPicker";
import ModalTransationLabelsPicker from "@components/Shared/CustomModal/ModalTransationLabelsPicker";
import LoadingCircle from "@components/Shared/LoadingCircle";

interface TransactionFormProps {
  form: TTransactionForm;
  isPending: boolean;
  isEdit: boolean;
  isUsePhotoAI: boolean;
  onSubmit(form: TTransactionForm): void;
  onDelete(id: string): void;
}

export default function Form({
  form,
  isPending,
  isUsePhotoAI,
  isEdit,
  onSubmit,
  onDelete,
}: TransactionFormProps) {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const [transactionForm, setTransactionForm] =
    useState<TTransactionForm>(form);

  const imageDetectMutation = useMutation({
    mutationFn: async (data: TAIImageDetectBody) => {
      return axios.post(`${ENV.PROPER_API_URL}/ai/imageDetect`, data);
    },
  });
  const questionOne = `1) Date: (format as YYYY/MM/DD)`;
  const questionTwo = `2) Category: (pick from )`;
  const questionThree = `3) Amount:`;
  const questionFour = `4) Context:`;
  const questionFive = `5) Currency: (pick from ${currencyList.map(
    (z) => z.iso
  )})`;
  const totalQuestionsOnText = `\n\nBased on above example above, construct this format ${questionOne} ${questionTwo} ${questionThree} ${questionFour} ${questionFour} ${questionFive}`;

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

  const isLoading = imageDetectMutation.isPending || isPending;

  return (
    <>
      <SizedBox height={sh(20)} />
      <LoadingCircle visible={isLoading} />
      {transactionForm && (
        <>
          <ModalDateTimePicker
            value={form.transactedAt}
            buttonStyle={{}}
            listComponents={
              <CustomItemPicker
                pickedText={`${dayjs(transactionForm.transactedAt).format(
                  "DD/MM/YYYY (ddd)"
                )} ${getTransactionAtIsTodayOrYesterday()}`}
                title={t("date")}
              />
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
                      const result = response.data as TAIImageDetectResponse;
                      if (result.messageContent != "") {
                        const detectedText = findAmountAndNameOfCategory({
                          transactionCategories: [],
                          message: result.messageContent,
                        });
                        setTransactionForm((prevState) => ({
                          ...prevState,
                          transactionCategoryId:
                            detectedText?.transactionCategory
                              ? detectedText.transactionCategory._id
                              : form.transactionCategoryId,
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
              setTransactionForm((prevState) => ({ ...prevState, note: text }))
            }
          />
          <SizedBox height={sh(40)} />
          <CustomButton
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
                onSubmit(transactionForm);
              }
            }}
          />
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
                            onDelete(form._id);
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
        </>
      )}
    </>
  );
}
