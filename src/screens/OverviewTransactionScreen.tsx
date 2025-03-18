import ContainerLayout from "@components/Layout/ContainerLayout";
import React, { useEffect, useMemo, useState } from "react";
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
import { useAuthStore } from "@libs/zustand/authStore";
import ModalDateRangePicker from "@components/Shared/CustomModal/ModalDateTimePicker/ModalDateRangePicker";
import { displayDateRangeText } from "@libs/utils";

export enum EOverviewTransactionsReport {
  Categories = "Categories",
  Labels = "Labels",
  Transactions = "Transactions",
}

const OverviewTransactionScreen: AppNavigationScreen<
  "OverviewTransactionScreen"
> = ({ navigation, route }) => {
  const authStore = useAuthStore();
  const [transactionCategoryConfig, setTransactionCategoryConfig] = useState<{
    userCategoryId: string | undefined;
    sharedUserCategoryId: string | undefined;
  }>({ userCategoryId: undefined, sharedUserCategoryId: undefined });
  const [transactionLabelConfig, setTransactionLabelConfig] = useState<{
    userTransactionLabelIds: string[];
    sharedUserTransactionLabelIds: string[];
  }>({
    userTransactionLabelIds: [],
    sharedUserTransactionLabelIds: [],
  });
  useEffect(() => {
    setTransactionCategoryConfig((prevState) => ({
      ...prevState,
      sharedUserCategoryId:
        route.params.targetUserId != authStore.user?._id
          ? route.params.transactionCategoryId
          : undefined,
      userCategoryId:
        route.params.targetUserId == authStore.user?._id
          ? route.params.transactionCategoryId
          : undefined,
    }));
    setTransactedAtRange((prevState) => ({
      ...prevState,
      startTransactedAt: route.params.startTransactedAt,
      endTransactedAt: route.params.endTransactedAt,
    }));
  }, [route.params]);
  const [transactedAtRange, setTransactedAtRange] = useState<{
    startTransactedAt: Date | undefined;
    endTransactedAt: Date | undefined;
  }>({
    startTransactedAt: undefined,
    endTransactedAt: undefined,
  });
  const useGetTransactionInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [
      "see-all",
      transactionCategoryConfig,
      transactionLabelConfig,
      transactedAtRange,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetTransactionQuery = {
        limit: 10,
        page: pageParam,
        transactionCategoryId: transactionCategoryConfig.sharedUserCategoryId
          ? transactionCategoryConfig.sharedUserCategoryId
          : transactionCategoryConfig.userCategoryId,
        transactionLabelIds:
          transactionLabelConfig.sharedUserTransactionLabelIds.length > 0
            ? transactionLabelConfig.sharedUserTransactionLabelIds
            : transactionLabelConfig.userTransactionLabelIds,
        startTransactedAt: transactedAtRange.startTransactedAt,
        endTransactedAt: transactedAtRange.endTransactedAt,
        targetUserId: route.params.targetUserId,
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
        id: "transaction-date",
        components: (
          <ModalDateRangePicker
            onChange={(data) => {
              setTransactedAtRange((prevState) => ({
                ...prevState,
                startTransactedAt: data.startAt,
                endTransactedAt: data.endAt,
              }));
            }}
            listComponents={
              <TouchableOpacity
                disabled={
                  transactedAtRange.startTransactedAt == undefined &&
                  transactedAtRange.endTransactedAt == undefined
                }
                style={{
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: Colors.suvaGrey,
                  backgroundColor:
                    transactedAtRange.startTransactedAt &&
                    transactedAtRange.endTransactedAt
                      ? Colors.primary
                      : "transparent",
                  borderRadius: sw(30),
                  padding: sw(5),
                  paddingHorizontal: sw(20),
                  alignItems:"center"
                }}
                onPress={() =>
                  setTransactedAtRange({
                    startTransactedAt: undefined,
                    endTransactedAt: undefined,
                  })
                }
              >
                <CustomText
                  label={
                    transactedAtRange.startTransactedAt &&
                    transactedAtRange.endTransactedAt
                      ? displayDateRangeText({
                          startAt: transactedAtRange.startTransactedAt,
                          endAt: transactedAtRange.endTransactedAt,
                        })
                      : `Date`
                  }
                  size="medium"
                  textStyle={{
                    color:
                      transactedAtRange.startTransactedAt &&
                      transactedAtRange.endTransactedAt
                        ? `#D6FFBC`
                        : Colors.primary,
                  }}
                />
                {transactedAtRange.startTransactedAt &&
                transactedAtRange.endTransactedAt ? (
                  <>
                    <SizedBox width={sw(10)} />
                    <ExpoVectorIcon
                      name="closecircle"
                      size={sw(15)}
                      color={"#D6FFBC"}
                    />
                  </>
                ) : (
                  <></>
                )}
              </TouchableOpacity>
            }
            data={{
              startAt: transactedAtRange.startTransactedAt,
              endAt: transactedAtRange.endTransactedAt,
            }}
          />
        ),
        isOrder:
          transactedAtRange.startTransactedAt &&
          transactedAtRange.endTransactedAt
            ? true
            : false,
        isVisible: true,
      },
      {
        id: "category",
        components: (
          <ModalTransactionCategoryPicker
            userId={authStore.user?._id as string}
            listComponents={
              <>
                {transactionCategoryConfig.userCategoryId ? (
                  <TouchableOpacity
                    onPress={() =>
                      setTransactionCategoryConfig((prevState) => ({
                        ...prevState,
                        userCategoryId: undefined,
                        sharedUserCategoryId: undefined,
                      }))
                    }
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
                      id={transactionCategoryConfig.userCategoryId}
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
              backgroundColor: transactionCategoryConfig.userCategoryId
                ? Colors.primary
                : "transparent",
              borderRadius: sw(30),
              padding: sw(5),
              paddingHorizontal: sw(20),
            }}
            id={transactionCategoryConfig.userCategoryId}
            onChange={(id) => {
              if (id == transactionCategoryConfig.userCategoryId) {
                setTransactionCategoryConfig((prevState) => ({
                  ...prevState,
                  userCategoryId: undefined,
                  sharedUserCategoryId: undefined,
                }));
              } else {
                setTransactionCategoryConfig((prevState) => ({
                  ...prevState,
                  userCategoryId: id,
                  sharedUserCategoryId: undefined,
                }));
              }
            }}
          />
        ),
        isOrder: transactionCategoryConfig.userCategoryId ? true : false,
        isVisible: true,
      },
      {
        id: "shared-user-category",
        components: (
          <ModalTransactionCategoryPicker
            userId={authStore.user?.sharedUserInfo?.id as string}
            listComponents={
              <>
                {transactionCategoryConfig.sharedUserCategoryId ? (
                  <TouchableOpacity
                    onPress={() => {
                      setTransactionCategoryConfig((prevState) => ({
                        ...prevState,
                        sharedUserCategoryId: undefined,
                        userCategoryId: undefined,
                      }));
                    }}
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
                      id={transactionCategoryConfig.sharedUserCategoryId}
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
                    label={`${authStore.user?.sharedUserInfo?.displayName}'s Category`}
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
              backgroundColor: transactionCategoryConfig.sharedUserCategoryId
                ? Colors.primary
                : "transparent",
              borderRadius: sw(30),
              padding: sw(5),
              paddingHorizontal: sw(20),
            }}
            id={transactionCategoryConfig.sharedUserCategoryId}
            onChange={(id) => {
              if (id == transactionCategoryConfig.sharedUserCategoryId) {
                setTransactionCategoryConfig((prevState) => ({
                  ...prevState,
                  sharedUserCategoryId: undefined,
                  userCategoryId: undefined,
                }));
              } else {
                setTransactionCategoryConfig((prevState) => ({
                  ...prevState,
                  sharedUserCategoryId: id,
                  userCategoryId: undefined,
                }));
              }
            }}
          />
        ),
        isOrder: transactionCategoryConfig.sharedUserCategoryId ? true : false,
        isVisible: authStore.user?.sharedUserId != null,
      },
      {
        id: "Label",
        components: (
          <ModalTransationLabelsPicker
            userId={authStore.user?._id as string}
            buttonStyle={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: Colors.suvaGrey,
              backgroundColor:
                transactionLabelConfig.userTransactionLabelIds.length > 0
                  ? Colors.primary
                  : "transparent",
              borderRadius: sw(30),
              padding: sw(5),
              paddingHorizontal: sw(20),
            }}
            listComponent={
              <>
                {transactionLabelConfig.userTransactionLabelIds.length > 0 ? (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() =>
                      setTransactionLabelConfig((prevState) => ({
                        ...prevState,
                        userTransactionLabelIds: [],
                        sharedUserTransactionLabelIds: [],
                      }))
                    }
                  >
                    <TransactionLabelsContainer
                      textStyle={{ color: "#D6FFBC" }}
                      ids={transactionLabelConfig.userTransactionLabelIds}
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
            ids={transactionLabelConfig.userTransactionLabelIds}
            onChange={(ids) => {
              setTransactionLabelConfig((prevState) => ({
                ...prevState,
                userTransactionLabelIds: ids,
                sharedUserTransactionLabelIds: [],
              }));
            }}
          />
        ),
        isOrder: transactionLabelConfig.userTransactionLabelIds ? true : false,
        isVisible: true,
      },
      {
        id: "shared-user-label",
        components: (
          <ModalTransationLabelsPicker
            userId={authStore.user?.sharedUserId as string}
            buttonStyle={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: Colors.suvaGrey,
              backgroundColor:
                transactionLabelConfig.sharedUserTransactionLabelIds.length > 0
                  ? Colors.primary
                  : "transparent",
              borderRadius: sw(30),
              padding: sw(5),
              paddingHorizontal: sw(20),
            }}
            listComponent={
              <>
                {transactionLabelConfig.sharedUserTransactionLabelIds.length >
                0 ? (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      setTransactionLabelConfig((prevState) => ({
                        ...prevState,
                        userTransactionLabelIds: [],
                        sharedUserTransactionLabelIds: [],
                      }));
                    }}
                  >
                    <TransactionLabelsContainer
                      textStyle={{ color: "#D6FFBC" }}
                      ids={transactionLabelConfig.sharedUserTransactionLabelIds}
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
                    label={`${authStore.user?.sharedUserInfo?.displayName}'s Label`}
                    size="medium"
                    textStyle={{ color: Colors.primary }}
                  />
                )}
              </>
            }
            ids={transactionLabelConfig.sharedUserTransactionLabelIds}
            onChange={(ids) => {
              setTransactionLabelConfig((prevState) => ({
                ...prevState,
                userTransactionLabelIds: [],
                sharedUserTransactionLabelIds: ids,
              }));
            }}
          />
        ),
        isOrder: transactionLabelConfig.sharedUserTransactionLabelIds
          ? true
          : false,
        isVisible: true,
      },
    ];
  }, [transactionCategoryConfig, transactionLabelConfig, transactedAtRange]);

  return (
    <ContainerLayout>
      <Header
        containerStyle={{ padding: sw(15) }}
        onBack={() => navigation.goBack()}
        itemRight={
          <>
            <TouchableOpacity
              onPress={() => navigation.navigate("DashboardScreen")}
            >
              <ExpoVectorIcon
                name="linechart"
                size={sw(20)}
                color={Colors.black}
              />
            </TouchableOpacity>
          </>
        }
      />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {config
            .filter((z) => z.isVisible)
            .map((data) => (
              <View style={{ marginHorizontal: sw(4) }} key={data.id}>
                {data.components}
              </View>
            ))}
        </ScrollView>
      </View>
      <FlashList
        ListHeaderComponent={
          <>
            <SizedBox height={sh(20)} />
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
