import ContainerLayout from "@components/Layout/ContainerLayout";
import React, { useMemo, useState } from "react";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import dayjs from "dayjs";
import SizedBox from "@components/Shared/SizedBox";
import { sh, sw } from "@libs/responsive.lib";
import Header from "@components/Shared/Header";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  TGetTransactionQuery,
  TTransaction,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { Colors } from "@styles/Colors";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import { FlashList } from "@shopify/flash-list";
import CustomText from "@components/Shared/CustomText";
import TransactionCard from "@components/Shared/Card/TransactionCard";
import LoadingCircle from "@components/Shared/LoadingCircle";
import ModalTransactionCategoryPicker from "@components/Shared/CustomModal/ModalTransactionCategoryPicker";
import TransactionCategoryContainer from "@components/Shared/TransactionCategoryContainer";
import ModalTransationLabelsPicker from "@components/Shared/CustomModal/ModalTransationLabelsPicker";
import TransactionLabelsContainer from "@components/Shared/TransactionLabelsContainer";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";

export enum EOverviewTransactionsReport {
  Categories = "Categories",
  Labels = "Labels",
  Transactions = "Transactions",
}

const OverviewTransactionScreen: AppNavigationScreen<
  "OverviewTransactionScreen"
> = ({ navigation, route }) => {
  const [transactionCategoryId, setTransactionCategoryId] = useState<
    undefined | string
  >(undefined);
  const [transactionLabelIds, setTransactionLabelIds] = useState<string[]>([]);

  const useGetTransactionInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["see-all", transactionCategoryId, transactionLabelIds],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetTransactionQuery = {
        limit: 10,
        page: pageParam,
        transactionCategoryId: transactionCategoryId,
        transactionLabelIds: transactionLabelIds,
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

  const transactions: TTransaction[] =
    useGetTransactionInfiniteQuery.data?.pages.flatMap((page) => {
      return page.data;
    }) ?? [];

  const config = useMemo(() => {
    return [
      {
        id: "category",
        components: (
          <ModalTransactionCategoryPicker
            listComponents={
              <>
                {transactionCategoryId ? (
                  <TouchableOpacity
                    onPress={() => setTransactionCategoryId(undefined)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <TransactionCategoryContainer
                      textStyle={{ color: "#D6FFBC" }}
                      containerStyle={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      id={transactionCategoryId}
                    />
                    <SizedBox width={sw(10)} />
                    <ExpoVectorIcon
                      name="closecircle"
                      size={sw(15)}
                      color={"#D6FFBC"}
                    />
                  </TouchableOpacity>
                ) : (
                  <CustomText
                    label={`Category`}
                    size="medium"
                    textStyle={{ color: Colors.primary }}
                  />
                )}
              </>
            }
            buttonStyle={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: Colors.suvaGrey,
              backgroundColor: transactionCategoryId
                ? Colors.primary
                : "transparent",
              borderRadius: sw(30),
              padding: sw(5),
              paddingHorizontal: sw(20),
            }}
            id={transactionCategoryId}
            onChange={(id) => {
              if (id == transactionCategoryId) {
                setTransactionCategoryId(undefined);
              } else {
                setTransactionCategoryId(id);
              }
            }}
          />
        ),
      },
      {
        id: "Label",
        components: (
          <ModalTransationLabelsPicker
            buttonStyle={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: Colors.suvaGrey,
              backgroundColor:
                transactionLabelIds.length > 0 ? Colors.primary : "transparent",
              borderRadius: sw(30),
              padding: sw(5),
              paddingHorizontal: sw(20),
            }}
            listComponent={
              <>
                {transactionLabelIds.length > 0 ? (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setTransactionLabelIds([])}
                  >
                    <TransactionLabelsContainer
                      textStyle={{ color: "#D6FFBC" }}
                      ids={transactionLabelIds}
                    />
                    <SizedBox width={sw(10)} />
                    <ExpoVectorIcon
                      name="closecircle"
                      size={sw(15)}
                      color={"#D6FFBC"}
                    />
                  </TouchableOpacity>
                ) : (
                  <CustomText
                    label={`Label`}
                    size="medium"
                    textStyle={{ color: Colors.primary }}
                  />
                )}
              </>
            }
            ids={transactionLabelIds}
            onChange={(ids) => {
              setTransactionLabelIds(ids);
            }}
          />
        ),
      },
    ];
  }, [transactionCategoryId, transactionLabelIds]);

  return (
    <ContainerLayout>
      <Header
        containerStyle={{ padding: sw(15) }}
        onBack={() => navigation.goBack()}
      />
      <View style={{ padding: sw(15), paddingTop: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {config.map((data) => (
            <View style={{ marginRight: sw(8) }} key={data.id}>
              {data.components}
            </View>
          ))}
        </ScrollView>
      </View>
      <FlashList
        ListHeaderComponent={
          <>
            <CustomText
              size="extra-big"
              label="Transactions"
              textStyle={{
                paddingHorizontal: sw(15),
              }}
            />
          </>
        }
        refreshControl={
          <RefreshControl
            tintColor={Colors.black}
            refreshing={false}
            onRefresh={() => {
              useGetTransactionInfiniteQuery.refetch();
            }}
          />
        }
        data={transactions}
        ItemSeparatorComponent={() => (
          <>
            <SizedBox height={sh(20)} />
          </>
        )}
        renderItem={({ item, index }) => (
          <>
            {index == 0 ||
            dayjs(item.transactedAt).format(`YYYY-MM-DD`) !=
              dayjs(transactions[index - 1].transactedAt).format(
                "YYYY-MM-DD"
              ) ? (
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: Colors.gainsboro,
                  marginVertical: sw(20),
                  marginHorizontal: sw(15),
                }}
              >
                <CustomText
                  size="medium"
                  label={`${
                    dayjs().format("DD-MM-YYYY") ==
                    dayjs(item.transactedAt).format("DD-MM-YYYY")
                      ? `Today\n`
                      : ``
                  }${dayjs(item.transactedAt).format("DD MMMM YYYY")}`}
                  textStyle={{ color: "#767676" }}
                />
                <SizedBox height={sh(5)} />
              </View>
            ) : (
              <></>
            )}
            <TransactionCard
              data={item}
              containerStyle={{ marginHorizontal: sw(15) }}
              onPress={() => {
                navigation.navigate("TransactionDetailScreen", {
                  id: item._id,
                });
              }}
            />
          </>
        )}
        estimatedItemSize={30}
        keyExtractor={(item) => item._id}
        ListFooterComponent={
          <>
            <LoadingCircle
              visible={useGetTransactionInfiniteQuery.isFetching}
              containerStyle={{ margin: sw(20) }}
            />
          </>
        }
        onEndReached={() => {
          if (useGetTransactionInfiniteQuery.hasNextPage) {
            useGetTransactionInfiniteQuery.fetchNextPage();
          }
        }}
      />
    </ContainerLayout>
  );
};
export default OverviewTransactionScreen;
