import React, { useEffect, useState } from "react";
import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import { useTranslation } from "@libs/i18n/index";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import { displayCurrency, isNumber } from "@libs/utils";
import {
  TGetTransactionDetailQuery,
  TPostTransactionCreateBody,
  TPostTransactionDeleteBody,
  TPostTransactionUpdateBody,
  TTransaction,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import { resetQueries } from "@libs/react.query.client.lib";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import ModalTransactionCategoryPicker from "@components/Shared/CustomModal/ModalTransactionCategoryPicker";
import ModalTransationLabelsPicker from "@components/Shared/CustomModal/ModalTransationLabelsPicker";
import ModalImagePicker from "@components/Shared/CustomModal/ModalImagePicker";
import findAmountAndNameOfCategory from "@libs/findAmountAndNameOfCategory";
import ModalZoomableImage from "@components/Shared/CustomModal/ModalZoomableImage";
import { Colors } from "@styles/Colors";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "@components/Shared/CustomText";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import CustomButton from "@components/Shared/CustomButton";
import TransactionCategoryContainer from "@components/Shared/TransactionCategoryContainer";
import TransactionLabelsContainer from "@components/Shared/TransactionLabelsContainer";
import ModalTextInput from "@components/Shared/CustomModal/ModalTextInput";
import ModalAmountTextInput from "@components/Shared/CustomModal/ModalAmountTextInput";

const TransactionsFormScreen: AppNavigationScreen<"TransactionsFormScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const { id, isEdit, isUsePhotoAI } = route.params;
  const useGetTransactionDetailQuery = useQuery({
    queryKey: ["detail", id],
    queryFn: async () => {
      const query: TGetTransactionDetailQuery = {
        id: id as string,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction/detail`,
        {
          params: query,
        }
      );
      return data;
    },
    enabled: id != undefined,
  });
  const detail: TTransaction | undefined =
    useGetTransactionDetailQuery.data ?? undefined;

  useEffect(() => {
    if (detail) {
      setForm((prevState) => ({
        ...prevState,
        _id: detail._id,
        transactionCategoryId: detail.transactionCategoryId,
        transactionLabelIds: detail.transactionLabelIds,
        currency: detail.currency,
        amount: detail.amount.toString(),
        imagePath: detail.imagePath,
        note: detail.note ?? "",
        transactedAt: new Date(detail.transactedAt),
      }));
    }
  }, [detail]);

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

  const submit = async () => {
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
            Alert.alert(e.message);
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
          navigation.reset({
            index: 0,
            routes: [{ name: "HomeScreen" }],
          });
        },
        onError: (e) => {
          Alert.alert(e.message);
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
          Alert.alert(e.message);
        },
      }
    );
  };

  const [form, setForm] = useState<{
    _id: string | undefined;
    transactionCategoryId: string | undefined;
    transactionLabelIds: string[];
    currency: string;
    amount: string;
    imagePath: string | null;
    note: string;
    transactedAt: Date;
  }>({
    _id: undefined,
    transactionCategoryId: undefined,
    transactionLabelIds: [],
    currency: authStore.user?.currency ?? currencyList[0].iso,
    amount: "",
    imagePath: null,
    note: "",
    transactedAt: new Date(),
  });

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
      dayjs(form.transactedAt).format("DD/MM/YYYY") ==
      dayjs().format("DD/MM/YYYY")
    ) {
      return "- Today";
    } else if (
      dayjs(form.transactedAt).format("DD/MM/YYYY") ==
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
    imageDetectMutation.isPending ||
    useGetTransactionDetailQuery.isFetching;

  return (
    <>
      <ContainerLayout>
        <Header
          containerStyle={{ paddingHorizontal: sw(15) }}
          onBack={() => navigation.goBack()}
          itemRight={
            <>
              {isEdit && (
                <TouchableOpacity
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
                >
                  <ExpoVectorIcon
                    name="delete"
                    size={sw(20)}
                    color={Colors.black}
                  />
                </TouchableOpacity>
              )}
            </>
          }
        />
        <KeyboardLayout>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <SizedBox height={sh(20)} />
            <ModalAmountTextInput
              amount={form.amount}
              currency={form.currency}
              onChange={(data) => {
                setForm((prevState) => ({
                  ...prevState,
                  ...data,
                }));
              }}
              listComponents={
                <>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <CustomText
                      size="2-extra-big"
                      label={`${displayCurrency({
                        currency: form.currency,
                        amount: parseFloat(
                          form.amount != "" ? form.amount : "0"
                        ),
                      })}`}
                    />
                    <SizedBox width={sw(10)} />
                    <ExpoVectorIcon
                      name="left"
                      size={sw(20)}
                      color={Colors.black}
                    />
                  </View>
                </>
              }
            />
            <SizedBox height={sh(10)} />
            <ModalTransactionCategoryPicker
              userId={authStore.user?._id as string}
              listComponents={
                <>
                  <TransactionCategoryContainer
                    isDisplayIcon
                    containerStyle={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    id={form.transactionCategoryId ?? undefined}
                  />
                </>
              }
              buttonStyle={{
                flexDirection: "row",
                borderWidth: 1,
                borderColor: Colors.suvaGrey,
                borderRadius: sw(5),
                padding: sw(5),
              }}
              id={form.transactionCategoryId}
              onChange={(id) => {
                setForm((prevState) => ({
                  ...prevState,
                  transactionCategoryId: id,
                }));
              }}
            />
            <SizedBox height={sh(40)} />
          </View>
          <View style={{ paddingHorizontal: sw(15) }}>
            <ModalDateTimePicker
              value={form.transactedAt}
              buttonStyle={{}}
              listComponents={
                <View style={styles.bodyContainer}>
                  <CustomText
                    size="medium"
                    label={`When`}
                    textStyle={{ color: Colors.matterhorn }}
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
                        color: Colors.matterhorn,
                      }}
                      containerStyle={{ marginLeft: "auto" }}
                      size="medium"
                      label={`${dayjs(form.transactedAt).format(
                        "DD/MM/YYYY (ddd)"
                      )} ${getTransactionAtIsTodayOrYesterday()}`}
                    />
                  </View>
                </View>
              }
              onChange={(date) => {
                setForm((prevState) => ({
                  ...prevState,
                  transactedAt: date,
                }));
              }}
            />
            <SizedBox height={sh(20)} />
            <ModalTransationLabelsPicker
              userId={authStore.user?._id as string}
              listComponent={
                <View style={styles.bodyContainer}>
                  <CustomText
                    size="medium"
                    label={`Labels`}
                    textStyle={{ color: Colors.matterhorn }}
                  />
                  <SizedBox width={sw(10)} />
                  {form.transactionLabelIds.length > 0 ? (
                    <View
                      style={{
                        borderColor: Colors.suvaGrey,
                        borderWidth: 1,
                        borderRadius: sw(5),
                        marginLeft: "auto",
                        padding: sw(5),
                      }}
                    >
                      <TransactionLabelsContainer
                        textStyle={{ color: Colors.matterhorn }}
                        ids={form.transactionLabelIds}
                      />
                    </View>
                  ) : (
                    <CustomText
                      label="Add"
                      containerStyle={{ marginLeft: "auto" }}
                      textStyle={{
                        color: Colors.primary,
                        textDecorationLine: "underline",
                      }}
                      size="medium"
                    />
                  )}
                </View>
              }
              ids={form.transactionLabelIds}
              onChange={(ids) => {
                setForm((prevState) => ({
                  ...prevState,
                  transactionLabelIds: ids,
                }));
              }}
            />
            <SizedBox height={sh(20)} />
            <ModalTextInput
              headerText="Note"
              onChange={(data) => {
                setForm((prevState) => ({ ...prevState, note: data }));
              }}
              value={form.note}
              textInputLabel="For example - lunch with friend"
              listComponents={
                <>
                  <View style={[{ width: "100%", flexDirection: "row" }]}>
                    <CustomText
                      size="medium"
                      label={`Note`}
                      textStyle={{ color: Colors.matterhorn }}
                    />
                    <SizedBox width={sw(10)} />
                    <CustomText
                      label={form.note && form.note.length > 0 ? "Edit" : "Add"}
                      containerStyle={{ marginLeft: "auto" }}
                      textStyle={{
                        color: Colors.primary,
                        textDecorationLine: "underline",
                      }}
                      size="medium"
                    />
                  </View>
                  <SizedBox height={sh(5)} />
                  <CustomText
                    textStyle={{
                      color: Colors.matterhorn,
                    }}
                    containerStyle={{ flex: 1 }}
                    size="medium"
                    label={`${form.note}`}
                  />
                </>
              }
            />
            <SizedBox height={sh(20)} />
            <ModalImagePicker
              type={"transaction_image"}
              userId={authStore.user?._id ?? ""}
              onChange={(data) => {
                setForm((prevState) => ({
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
                            message: result.messageContent,
                          });
                          setForm((prevState) => ({
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
                        Alert.alert(e.message);
                      },
                    }
                  );
                }
              }}
              listComponents={
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      paddingVertical: sh(10),
                    }}
                  >
                    <CustomText
                      size="medium"
                      label={"Image"}
                      textStyle={{ color: Colors.matterhorn }}
                    />
                    {form.imagePath ? (
                      <ModalZoomableImage
                        buttonStyle={{
                          borderWidth: 1,
                          borderColor: Colors.suvaGrey,
                          borderRadius: sw(5),
                          marginLeft: "auto",
                        }}
                        listComponents={
                          <>
                            <Image
                              style={{
                                width: sw(100),
                                height: sw(100),
                                objectFit: "cover",
                                borderRadius: sw(5),
                              }}
                              source={{ uri: form.imagePath }}
                            />
                          </>
                        }
                        imagePath={form.imagePath ?? ``}
                      />
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          marginLeft: "auto",
                          borderWidth: 1,
                          borderColor: Colors.suvaGrey,
                          borderRadius: sw(5),
                          padding: sw(10),
                        }}
                      >
                        <ExpoVectorIcon
                          name="upload"
                          size={sw(20)}
                          color={Colors.black}
                        />
                        <SizedBox width={sw(20)} />
                        <View>
                          <CustomText
                            label="Upload file"
                            containerStyle={{ marginLeft: "auto" }}
                            textStyle={{
                              color: Colors.primary,
                              textDecorationLine: "underline",
                            }}
                            size="medium"
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </>
              }
            />
            <SizedBox height={sh(60)} />
          </View>
        </KeyboardLayout>
        <CustomButton
          buttonStyle={{ marginHorizontal: sw(15), marginBottom: sw(15) }}
          disabled={isLoading}
          type={"primary"}
          size={"medium"}
          title={isEdit ? t("edit") : t("add")}
          onPress={() => {
            if (!form.transactionCategoryId) {
              Alert.alert(t("missingCategory"));
            } else if (form.amount.trim().length == 0) {
              Alert.alert(t("missingAmount"));
            } else {
              submit();
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: sh(10),
  },
});
