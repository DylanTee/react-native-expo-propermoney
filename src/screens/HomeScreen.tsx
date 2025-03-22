import ContainerLayout from "@components/Layout/ContainerLayout";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import React from "react";
import { sh, sw } from "@libs/responsive.lib";
import {
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@styles/Colors";
import { useTranslation } from "@libs/i18n/index";
import HomeCard, { HomeCardProps } from "../components/Shared/Card/HomeCard";
import { FlashList } from "@shopify/flash-list";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import { useAuthStore } from "@libs/zustand/authStore";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import {
  TGetTransactionDashboardResponse,
  TGetTransactionQuery,
  TGetTransactionsDashboardQuery,
  TTransaction,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import TransactionCard from "@components/Shared/Card/TransactionCard";
import LoadingCircle from "@components/Shared/LoadingCircle";
import CustomText from "@components/Shared/CustomText";
import dayjs from "dayjs";
import SizedBox from "@components/Shared/SizedBox";
import { displayCurrency } from "@libs/utils";

const HomeScreen: AppNavigationScreen<"HomeScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const menu: HomeCardProps[] = [
    {
      index: 0,
      label: "Add",
      description: "Record daily expenses or income",
      icon: <ExpoVectorIcon name="plus" size={sw(25)} color={Colors.black} />,
      onPress: () => {
        if (authStore.user) {
          navigation.navigate("TransactionsFormScreen", {
            id: undefined,
            isEdit: false,
            isUsePhotoAI: false,
            onEdit: () => {},
            onDelete: () => {},
          });
        }
      },
    },
    {
      index: 1,
      label: "Photo AI",
      description:
        "AI scan receipt,invoice and etc to add a transaction with camera/gallery",
      icon: <ExpoVectorIcon name="camera" size={sw(25)} color={Colors.black} />,
      onPress: () => {
        if (authStore.user) {
          navigation.navigate("TransactionsFormScreen", {
            id: undefined,
            isEdit: false,
            isUsePhotoAI: true,
            onEdit: () => {},
            onDelete: () => {},
          });
        }
      },
      linkToVideo: () => {
        Linking.openURL("https://fb.watch/pk_bkoEFep/");
      },
    },
    {
      index: 2,
      label: t("share"),
      description: "Share transactions record with your friends and family",
      icon: (
        <ExpoVectorIcon
          name="addusergroup"
          size={sw(25)}
          color={Colors.black}
        />
      ),
      onPress: () => {
        navigation.navigate("ShareUserScreen");
      },
      linkToVideo: () => {
        Linking.openURL("https://fb.watch/pk_8n0fyFQ/");
      },
    },
    // {
    //   index: 3,
    //   label: `${t("missions")}/${t("rewards")}`,
    //   description: "Earn reward points (RP) on every mission completed",
    //   icon: <ExpoVectorIcon name="flag" size={sw(25)} color={Colors.black} />,
    //   onPress: () => {
    //     navigation.navigate("MissionScreen");
    //   },
    // },
    {
      index: 4,
      label: `${t("contactSupport")}`,
      description: t("weValueYourFeedback"),
      icon: (
        <ExpoVectorIcon
          name="customerservice"
          size={sw(25)}
          color={Colors.black}
        />
      ),
      onPress: () => {
        navigation.navigate("ContactSupportScreen");
      },
    },
  ];

  const useGetTransactionDashboardThisMonthQuery = useQuery({
    queryKey: ["this-month-dashboard"],
    queryFn: async () => {
      const query: TGetTransactionsDashboardQuery = {
        startTransactedAt: dayjs().startOf("month").toDate(),
        endTransactedAt: dayjs().endOf("month").toDate(),
        userId: authStore.user?._id as string,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction/dashboard`,
        {
          params: query,
        }
      );
      return data;
    },
    enabled: authStore.user != null,
  });

  const useGetTransactionDashboardLastMonthQuery = useQuery({
    queryKey: ["last-month-dashboard"],
    queryFn: async () => {
      const query: TGetTransactionsDashboardQuery = {
        startTransactedAt: dayjs()
          .startOf("month")
          .subtract(1, "month")
          .toDate(),
        endTransactedAt: dayjs().endOf("month").subtract(1, "month").toDate(),
        userId: authStore.user?._id as string,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction/dashboard`,
        {
          params: query,
        }
      );
      return data;
    },
    enabled: authStore.user != null,
  });

  const dashboardThisMonth: TGetTransactionDashboardResponse | undefined =
    useGetTransactionDashboardThisMonthQuery.data ?? undefined;

  const dashboardLastMonth: TGetTransactionDashboardResponse | undefined =
    useGetTransactionDashboardLastMonthQuery.data ?? undefined;

  const useGetTransactionInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["transaction-listings",authStore.user?._id],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetTransactionQuery = {
        limit: 3,
        page: pageParam,
        transactionCategoryId: undefined,
        transactionLabelIds: undefined,
        startTransactedAt: undefined,
        endTransactedAt: undefined,
        targetUserId: authStore.user?._id as string,
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

  return (
    <>
      <ContainerLayout>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: sw(15),
          }}
          onPress={() => {
            navigation.navigate("MoreScreen");
          }}
        >
          <Image
            style={{
              width: sw(40),
              height: sw(40),
              objectFit: "cover",
              borderRadius: sw(1000),
            }}
            source={{ uri: authStore.user?.profileImage ?? `` }}
          />
          <SizedBox width={sw(10)} />
          <CustomText
            label={authStore.user?.displayName ?? ``}
            size={"medium"}
          />
        </TouchableOpacity>
        <FlashList
          ListHeaderComponent={
            <>
              <CustomText
                size="2-extra-big"
                label="Home"
                textStyle={{
                  paddingHorizontal: sw(15),
                }}
              />
              <SizedBox height={sh(10)} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: sw(10),
                  paddingHorizontal: sw(15),
                }}
              >
                {menu.map((data) => (
                  <HomeCard
                    key={data.label}
                    index={data.index}
                    icon={data.icon}
                    label={data.label}
                    description={data.description}
                    linkToVideo={() => {
                      if (data.linkToVideo) {
                        data?.linkToVideo();
                      }
                    }}
                    onPress={() => data.onPress()}
                  />
                ))}
              </ScrollView>
              <SizedBox height={sh(20)} />
              <View
                style={{
                  borderWidth: 1,
                  borderColor: Colors.suvaGrey,
                  padding: sw(15),
                  marginHorizontal: sw(15),
                  borderRadius: sw(10),
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <CustomText size="big" label="Spending" textStyle={{}} />
                  <TouchableOpacity
                    style={{ marginLeft: "auto" }}
                    onPress={() => {
                      navigation.navigate("DashboardScreen");
                    }}
                  >
                    <CustomText
                      label="See all"
                      size="small"
                      textStyle={{
                        textDecorationLine: "underline",
                        color: `#3E4D31`,
                      }}
                    />
                  </TouchableOpacity>
                </View>
                <SizedBox height={sh(20)} />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: sw(45),
                      height: sw(45),
                      borderWidth: 1,
                      borderColor: Colors.suvaGrey,
                      borderRadius: sw(45 / 2),
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CustomText label="$" size="extra-big" textStyle={{}} />
                  </View>
                  <SizedBox width={sw(10)} />
                  <View>
                    <CustomText
                      size="medium"
                      label="Spent this month"
                      textStyle={{
                        color: Colors.matterhorn,
                      }}
                    />
                    {useGetTransactionDashboardThisMonthQuery.isFetching ? (
                      <CustomText size="medium" label={`Loading...`} />
                    ) : (
                      <CustomText
                        size="medium"
                        label={
                          dashboardThisMonth?.expense
                            ?.map((data) =>
                              displayCurrency({
                                currency: data.currency,
                                amount: data.totalAmount,
                              })
                            )
                            .join(",") ?? "0"
                        }
                      />
                    )}
                  </View>
                </View>
                <SizedBox height={sh(10)} />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: sw(45),
                      height: sw(45),
                      borderWidth: 1,
                      borderColor: Colors.suvaGrey,
                      borderRadius: sw(45 / 2),
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CustomText label="$" size="extra-big" />
                  </View>
                  <SizedBox width={sw(10)} />
                  <View>
                    <CustomText
                      size="medium"
                      label="Spent last month"
                      textStyle={{
                        color: Colors.matterhorn,
                      }}
                    />
                    {useGetTransactionDashboardLastMonthQuery.isFetching ? (
                      <CustomText size="medium" label={`Loading...`} />
                    ) : (
                      <CustomText
                        size="medium"
                        label={
                          dashboardLastMonth?.expense
                            ?.map((data) =>
                              displayCurrency({
                                currency: data.currency,
                                amount: data.totalAmount,
                              })
                            )
                            .join(",") ?? "0"
                        }
                      />
                    )}
                  </View>
                </View>
              </View>
              <SizedBox height={sh(20)} />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CustomText
                  size="extra-big"
                  label="Transactions"
                  textStyle={{
                    paddingHorizontal: sw(15),
                  }}
                />
                <TouchableOpacity
                  style={{ marginLeft: "auto", marginRight: sw(15) }}
                  onPress={() => {
                    navigation.navigate("OverviewTransactionScreen", {
                      targetUserId: authStore.user?._id,
                      startTransactedAt: undefined,
                      endTransactedAt: undefined,
                      transactionCategoryId: undefined,
                    });
                  }}
                >
                  <CustomText
                    label="See all"
                    size="small"
                    textStyle={{
                      textDecorationLine: "underline",
                      color: `#3E4D31`,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </>
          }
          refreshControl={
            <RefreshControl
              tintColor={Colors.black}
              refreshing={false}
              onRefresh={() => {
                authStore.getDetail();
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
        />
      </ContainerLayout>
    </>
  );
};

export default HomeScreen;
