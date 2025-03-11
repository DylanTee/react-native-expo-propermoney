import ContainerLayout from "@components/Layout/ContainerLayout";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import Header from "@components/Shared/Header";
import CustomTextInput from "@components/Shared/CustomTextInput";
import LoadingCircle from "@components/Shared/LoadingCircle";
import SizedBox from "@components/Shared/SizedBox";
import { sh } from "@libs/responsive.lib";
import { catchErrorDialog } from "@libs/utils";
import React, { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "@libs/i18n/index";
import {
  TPostTransactionLabelCreateBody,
  TPostTransactionLabelDeleteBody,
  TPostTransactionLabelUpdateBody,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import CustomButton from "@components/Shared/CustomButton";
import ContainerStack from "@components/Shared/ContainerStack";
import { useMutation } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import { TTransactionLabelForm } from ".";

interface TransactionLabelFormProps {
  form: TTransactionLabelForm;
  onClose(): void;
  onChange(_id: string): void;
}

export default function Form(props: TransactionLabelFormProps) {
  const { t } = useTranslation();

  const createMutation = useMutation({
    mutationFn: (data: TPostTransactionLabelCreateBody) => {
      return AxiosLibs.defaultClient.post("/transaction-label/create", data);
    },
  });
  const editMutation = useMutation({
    mutationFn: (data: TPostTransactionLabelUpdateBody) => {
      return AxiosLibs.defaultClient.post("/transaction-label/update", data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: TPostTransactionLabelDeleteBody) => {
      return AxiosLibs.defaultClient.post("/transaction-label/delete", data);
    },
  });
  const isEdit = props.form._id != undefined;
  const [form, setForm] = useState<TTransactionLabelForm>(props.form);
  const getHeaderTitle = () => {
    if (isEdit) {
      return t("edit");
    } else {
      return t("new");
    }
  };
  const btnConfirm = () => {
    if (form.name.trim().length == 0) {
      Alert.alert(t("missingLabel"));
    } else {
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
                  { ...form, _id: form._id },
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
                createMutation.mutate(
                  form,

                  {
                    onSuccess: (response: any) => {
                      props.onChange(response.data.id);
                    },
                    onError: (e) => {
                      catchErrorDialog(e);
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
  const btnDelete = () => {
    deleteMutation.mutate(
      {
        _id: form._id as unknown as string,
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
  };

  const isLoading =
    createMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending;

  return (
    <ContainerLayout>
      <Header
        title={getHeaderTitle()}
        onBack={() => {
          props.onClose();
        }}
      />
      <LoadingCircle visible={isLoading} />
      <KeyboardLayout>
        <ContainerStack>
          <CustomTextInput
            maxLength={25}
            label={"Label"}
            value={form.name}
            onChangeText={(text) =>
              setForm((prevState) => ({
                ...prevState,
                name: text,
              }))
            }
          />
          <SizedBox height={sh(40)} />
          <CustomButton
            disabled={isLoading}
            type={"primary"}
            size={"medium"}
            title={t("confirm")}
            onPress={() => btnConfirm()}
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
              />

              <SizedBox height={sh(40)} />
            </>
          )}
        </ContainerStack>
      </KeyboardLayout>
    </ContainerLayout>
  );
}
