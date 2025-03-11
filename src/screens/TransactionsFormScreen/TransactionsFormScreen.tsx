import React from "react";
import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import { useTranslation } from "@libs/i18n/index";
import Form from "./form";
import {
  AppNavigationScreen,
  OverviewTransactionScreenParams,
  TTransactionForm,
} from "@libs/react.navigation.lib";
import { catchErrorDialog } from "@libs/utils";
import LoadingCircle from "@components/Shared/LoadingCircle";
import {
  TPostTransactionCreateBody,
  TPostTransactionDeleteBody,
  TPostTransactionUpdateBody,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import ContainerStack from "@components/Shared/ContainerStack";
import { resetQueries } from "@libs/react.query.client.lib";
import { useMutation } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import { useAuthStore } from "@libs/zustand/authStore";

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

  const isPending =
    createMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
      <LoadingCircle visible={isPending} />
      <ContainerLayout>
        <Header
          title={isEdit ? t("edit") : t("new")}
          onBack={() => navigation.goBack()}
        />
        <KeyboardLayout>
          <ContainerStack>
            <Form
              form={form}
              isPending={isPending}
              isEdit={isEdit}
              isUsePhotoAI={isUsePhotoAI}
              onSubmit={(form) => {
                submit(form);
              }}
              onDelete={(id) => deleteItem(id)}
            />
          </ContainerStack>
        </KeyboardLayout>
      </ContainerLayout>
    </>
  );
};
export default TransactionsFormScreen;
