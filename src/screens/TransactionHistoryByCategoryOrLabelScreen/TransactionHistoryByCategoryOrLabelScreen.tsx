import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import React, { useMemo, useState } from "react";
import { useTranslation } from "@libs/i18n/index";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  TGetTransactionQuery,
  TTransaction,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { FlashList } from "@shopify/flash-list";
import TransactionCard from "@components/Shared/TransactionCard";
import { sh, sw } from "@libs/responsive.lib";
import ContainerStack from "@components/Shared/ContainerStack";
import LoadingCircle from "@components/Shared/LoadingCircle";
import {
  EGetTransactionsBySort,
  EGetTransactionsByType,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import SizedBox from "@components/Shared/SizedBox";
import dayjs from "dayjs";
import { View } from "react-native";
import CustomText from "@components/Shared/CustomText";
import { displayCurrency, getAmountTextColor } from "@libs/utils";
import { AxiosLibs } from "@libs/axios.lib";
import { useAuthStore } from "@libs/zustand/authStore";

const TransactionHistoryByCategoryOrLabelScreen: AppNavigationScreen<
  "TransactionHistoryByCategoryOrLabelScreen"
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const [sortBy, setSortBy] = useState<EGetTransactionsBySort>(
    EGetTransactionsBySort.recent
  );
  const [year, setYear] = useState<number | string>("All");
  const yearsArray = [
    "All",
    ...Array.from(
      { length: dayjs().year() - 1997 + 1 },
      (_, index) => new Date().getFullYear() - index
    ),
  ];
  const startTransactedAt = useMemo(() => {
    if (year != "All") {
      return year + "-01" + dayjs().toISOString().slice(7);
    } else {
      return route.params.startTransactedAt;
    }
  }, [route.params.startTransactedAt, year]);
  const endTransactedAt = useMemo(() => {
    if (year != "All") {
      return year + dayjs().endOf("year").toISOString().slice(4);
    } else {
      return route.params.endTransactedAt;
    }
  }, [route.params.endTransactedAt, year]);
  const getTransactionGetTransactionsByCategoryIdInfiniteQuery =
    useInfiniteQuery({
      initialPageParam: 1,
      queryKey: [
        "/transaction",
        route.params.type,
        route.params._id,
        sortBy,
        year,
      ],
      queryFn: async ({ pageParam = 1 }) => {
        const query: TGetTransactionQuery = {
          limit: 10,
          page: pageParam,
          transactionCategoryId:
            route.params.type == EGetTransactionsByType.category
              ? route.params._id
              : undefined,
          transactionLabelId:
            route.params.type == EGetTransactionsByType.label
              ? route.params._id
              : undefined,
        };
        const { data } = await AxiosLibs.defaultClient.get(`/transaction`, {
          params: query,
        });
        return data;
      },
      getNextPageParam: (lastPage, allPages) => {
        const hasNextPage = lastPage.pagination.has_next_page;
        return hasNextPage ? allPages.length + 1 : undefined;
      },
    });

  const transactionsByCategoryData =
    getTransactionGetTransactionsByCategoryIdInfiniteQuery.data;
  const transactions: TTransaction[] =
    transactionsByCategoryData?.pages.flatMap((page) => {
      return page.data;
    }) ?? [];
  const totalAmount: any =
    transactionsByCategoryData?.pages.flatMap((page) => {
      return page.totalAmount ?? 0;
    }) ?? 0;
  const totalTransactionsLength =
    transactionsByCategoryData?.pages.flatMap((page) => {
      return page.totalTransactionsLength;
    }) ?? 0;
  const getHeaderTitle = () => {
    if (
      transactions.length > 0 &&
      route.params.type == EGetTransactionsByType.category
    ) {
      return transactions[0].transactionCategory.name;
    } else if (
      transactions.length > 0 &&
      route.params.type == EGetTransactionsByType.label
    ) {
      return (
        transactions[0].transactionLabels?.filter(
          (z) => z._id == route.params._id
        )[0].name ?? ""
      );
    } else {
      return t("back");
    }
  };

  return (
    <ContainerLayout>
      <LoadingCircle
        visible={
          getTransactionGetTransactionsByCategoryIdInfiniteQuery.isLoading
        }
      />
      <Header title={getHeaderTitle()} onBack={() => navigation.goBack()} />
      <ContainerStack>
        {/* <ModalSortPicker
          buttonStyle={{}}
          onChange={(data) => {
            setSortBy(data);
            getTransactionGetTransactionsByCategoryIdInfiniteQuery.refetch();
          }}
          sortBy={sortBy}
          listComponents={
            <>
              <CustomItemPicker pickedText={sortBy} title={"Sort by"} />
            </>
          }
        />
        <SizedBox height={sh(10)} />
        <ModalYearPicker
          buttonStyle={{}}
          onChange={(data) => {
            setYear(data);
            getTransactionGetTransactionsByCategoryIdInfiniteQuery.refetch();
          }}
          year={year}
          listComponents={
            <>
              <CustomItemPicker pickedText={year.toString()} title={"Year"} />
            </>
          }
        /> */}
        {year != "All" && transactions.length > 0 ? (
          <>
            <SizedBox height={sh(5)} />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <CustomText size={"small"} label={`Transactions: `} />
              <CustomText
                size={"small"}
                label={totalTransactionsLength.toString()}
              />
              <SizedBox width={sw(10)} />
              <CustomText size={"small"} label={`Total: `} />
              <CustomText
                size={"small"}
                label={displayCurrency({
                  currency: authStore.user?.currency ?? "",
                  amount: totalAmount,
                })}
                textStyle={{
                  color: getAmountTextColor(
                    transactions[0].transactionCategory.type
                  ),
                }}
              />
            </View>
          </>
        ) : (
          []
        )}
      </ContainerStack>
      <SizedBox height={sh(20)} />
      <FlashList
        data={transactions}
        keyExtractor={(item, index) => item._id + index}
        estimatedItemSize={sh(30)}
        onEndReached={() => {
          getTransactionGetTransactionsByCategoryIdInfiniteQuery.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item }: { item: TTransaction }) => (
          <ContainerStack>
            <TransactionCard
              onPress={() =>
                navigation.navigate("TransactionsFormScreen", {
                  isEdit: true,
                  isUsePhotoAI: false,
                  form: {
                    _id: item._id,
                    transactionCategoryId: item.transactionCategoryId,
                    transactionLabelIds: item.transactionLabelIds,
                    currency: item.currency,
                    amount: item.amount.toString(),
                    note: item.note ?? "",
                    imagePath: item.imagePath,
                    transactedAt: new Date(item.transactedAt),
                  },
                  onEdit: () => {
                    getTransactionGetTransactionsByCategoryIdInfiniteQuery.refetch();
                  },
                  onDelete: (_id) => {
                    getTransactionGetTransactionsByCategoryIdInfiniteQuery.refetch();
                  },
                })
              }
              data={item}
            />
          </ContainerStack>
        )}
      />
    </ContainerLayout>
  );
};
export default TransactionHistoryByCategoryOrLabelScreen;
