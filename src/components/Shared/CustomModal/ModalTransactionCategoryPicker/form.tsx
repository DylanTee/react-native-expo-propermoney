import ContainerLayout from "@components/Layout/ContainerLayout";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import Header from "@components/Shared/Header";
import CustomTextInput from "@components/Shared/CustomTextInput";
import SizedBox from "@components/Shared/SizedBox";
import { sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import { catchErrorDialog } from "@libs/utils";
import {
  TGetTransactionCategoryAssetsResponse,
  TPostTransactionCategoryCreateBody,
  TPostTransactionCategoryDeleteBody,
  TPostTransactionCategoryUpdateBody,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import React, { useMemo, useState } from "react";
import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { useTranslation } from "@libs/i18n/index";
import CustomButton from "@components/Shared/CustomButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import { TTransactionCategoryForm } from ".";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import CustomText from "@components/Shared/CustomText";

interface TransactionCategoryFormProps {
  form: TTransactionCategoryForm;
  onClose(): void;
  onChange(_id: string): void;
}

export default function Form(props: TransactionCategoryFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<TTransactionCategoryForm>(props.form);
  const getTransactionCategoryAssetsQuery = useQuery({
    queryKey: ["transaction-category/assets"],
    queryFn: async () => {
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction-category/assets`
      );
      return data;
    },
  });
  const icons = useMemo(() => {
    if (getTransactionCategoryAssetsQuery.isSuccess) {
      const data =
        getTransactionCategoryAssetsQuery.data as TGetTransactionCategoryAssetsResponse;
      return data.icons;
    } else {
      return [];
    }
  }, [getTransactionCategoryAssetsQuery.isSuccess]);

  const backgroundColors = useMemo(() => {
    if (getTransactionCategoryAssetsQuery.isSuccess) {
      const data =
        getTransactionCategoryAssetsQuery.data as TGetTransactionCategoryAssetsResponse;
      return data.backgroundColors;
    } else {
      return [];
    }
  }, [getTransactionCategoryAssetsQuery.isSuccess]);
  const isEdit = props.form._id != undefined;

  const createMutation = useMutation({
    mutationFn: (data: TPostTransactionCategoryCreateBody) => {
      return AxiosLibs.defaultClient.post("/transaction-category/create", data);
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: TPostTransactionCategoryUpdateBody) => {
      return AxiosLibs.defaultClient.post("/transaction-category/update", data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: TPostTransactionCategoryDeleteBody) => {
      return AxiosLibs.defaultClient.post("/transaction-category/delete", data);
    },
  });

  const isLoading =
    getTransactionCategoryAssetsQuery.isLoading ||
    createMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending;
  const getHeaderTitle = () => {
    if (isEdit) {
      return t("edit");
    } else {
      return t("new");
    }
  };
  const btnConfirm = () => {
    if (form.name.trim().length == 0) {
      Alert.alert("Missing Category Name");
    } else if (form.imagePath.trim().length == 0) {
      Alert.alert("Missing Icon");
    } else if (form.backgroundColor.trim().length == 0) {
      Alert.alert("Missing background color");
    }
    // else if (isNotAbleToConfirm) {
    //   Alert.alert(
    //     "Upgrade",
    //     `Upgrade in order to create ${route.params.form.name}`,
    //     [
    //       {
    //         text: t("ok"),
    //         onPress: () => {
    //           Linking.openURL(
    //             `https://pr0per.vercel.app/topup?projectId=propermoney&userId`
    //           );
    //         },
    //       },
    //     ],
    //     { cancelable: false }
    //   );
    // }
    else {
      Alert.alert(
        t("areYouSure") + "?",
        ``,
        [
          {
            text: t("no"),
            onPress: () => {},
            style: "cancel",
          },
          {
            text: t("yes"),
            onPress: () => {
              if (isEdit && form._id) {
                editMutation.mutate(
                  {
                    ...form,
                    _id: form._id,
                  },

                  {
                    onSuccess: () => {
                      props.onChange(form._id as unknown as string);
                    },
                    onError: (e) => {
                      catchErrorDialog(e);
                    },
                  }
                );
              } else {
                createMutation.mutate(form, {
                  onSuccess: (response: any) => {
                    props.onChange(response.data.id);
                  },
                  onError: (e) => {
                    catchErrorDialog(e);
                  },
                });
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  };
  const btnDelete = () => {
    if (form._id) {
      deleteMutation.mutate(
        {
          _id: form._id,
        },
        {
          onSuccess: () => {
            props.onClose();
          },
          onError: (e) => {
            catchErrorDialog(e);
          },
        }
      );
    }
  };
  return (
    <ContainerLayout>
      <Header
        containerStyle={{ padding: sw(15) }}
        onBack={() => {
          props.onClose();
        }}
        itemRight={
          <>
            {isEdit && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    t(`delete`) + " " + form?.name + "?",
                    "",
                    [
                      {
                        text: t("no"),
                        onPress: () => {},
                        style: "cancel",
                      },
                      {
                        text: t("yes"),
                        onPress: () => btnDelete(),
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
        <View
          style={{
            width: sw(50),
            height: sw(50),
            borderRadius: sw(50) / 2,
            padding: sw(10),
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:
              form.backgroundColor.trim().length > 0
                ? form.backgroundColor
                : Colors.gainsboro,
          }}
        >
          <Image
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              zIndex: 1,
            }}
            resizeMode="contain"
            source={{ uri: form.imagePath }}
          />
        </View>
        <SizedBox height={sh(20)} />
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {icons.map((data) => (
            <TouchableOpacity
              key={data}
              style={{
                width: sw(30),
                height: sw(30),
                marginRight: sw(30),
                borderWidth: 2,
                borderRadius: sw(10) / 2,
                borderColor:
                  data == form.imagePath ? Colors.black : "transparent",
                margin: sw(5),
              }}
              onPress={() =>
                setForm((prevState) => ({
                  ...prevState,
                  imagePath: data,
                }))
              }
            >
              <Image
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="contain"
                source={{ uri: data }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <SizedBox height={sh(20)} />
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {backgroundColors.map((data) => (
            <TouchableOpacity
              key={data}
              onPress={() =>
                setForm((prevState) => ({
                  ...prevState,
                  backgroundColor: data,
                }))
              }
              style={{
                backgroundColor: data,
                width: sw(40),
                height: sw(40),
                marginRight: sw(20),
                borderWidth: 2,
                borderRadius: sw(20) / 2,
                borderColor:
                  data == form.backgroundColor ? Colors.black : "transparent",
              }}
            />
          ))}
        </ScrollView>
        <SizedBox height={sh(20)} />
        <View style={{ paddingHorizontal: sw(15) }}>
          <CustomTextInput
            maxLength={25}
            label={"Name"}
            value={form.name}
            onChangeText={(text) =>
              setForm((prevState) => ({
                ...prevState,
                name: text,
              }))
            }
          />
        </View>
        <SizedBox height={sh(40)} />
      </KeyboardLayout>
      <CustomButton
        buttonStyle={{ marginBottom: sh(25), marginHorizontal: sw(15) }}
        disabled={isLoading}
        type={"primary"}
        size={"medium"}
        title={t("confirm")}
        onPress={() => btnConfirm()}
      />
    </ContainerLayout>
  );
}
