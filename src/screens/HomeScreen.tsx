import ContainerLayout from "@components/Layout/ContainerLayout";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import React, { useEffect } from "react";
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
import { displayCurrency, getRelativeTimes } from "@libs/utils";
import Avatar from "@components/Shared/Avatar";
import * as Notifications from "expo-notifications";
import { ETransactionCategoryType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import { useGetUserDetailQuery } from "@libs/react-query/hooks/useGetUserDetailQuery";

const HomeScreen: AppNavigationScreen<"HomeScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { data: user } = useGetUserDetailQuery();
  const menu: HomeCardProps[] = [
    {
      index: 0,
      label: "Add",
      description: "Record daily expenses or income",
      icon: <ExpoVectorIcon name="plus" size={sw(25)} color={Colors.black} />,
      onPress: () => {
        if (user) {
          navigation.navigate("TransactionsFormScreen", {
            id: undefined,
            isEdit: false,
            onEdit: () => {
              refreshApis();
            },
            onDelete: () => {
              refreshApis();
            },
            onCreate: () => {
              refreshApis();
            },
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
        navigation.navigate("PhotoAIScreen");
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
    queryKey: ["this-month-dashboard", user?._id],
    queryFn: async () => {
      const query: TGetTransactionsDashboardQuery = {
        startTransactedAt: dayjs().startOf("month").toDate(),
        endTransactedAt: dayjs().endOf("month").toDate(),
        userId: user?._id as string,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction/dashboard`,
        {
          params: query,
        }
      );
      return data;
    },
    enabled: user != undefined,
  });

  const useGetTransactionDashboardLastMonthQuery = useQuery({
    queryKey: ["last-month-dashboard", user?._id],
    queryFn: async () => {
      const query: TGetTransactionsDashboardQuery = {
        startTransactedAt: dayjs()
          .startOf("month")
          .subtract(1, "month")
          .toDate(),
        endTransactedAt: dayjs().endOf("month").subtract(1, "month").toDate(),
        userId: user?._id as string,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction/dashboard`,
        {
          params: query,
        }
      );
      return data;
    },
    enabled: user != undefined,
  });

  const dashboardThisMonth: TGetTransactionDashboardResponse | undefined =
    useGetTransactionDashboardThisMonthQuery.data ?? undefined;

  const dashboardLastMonth: TGetTransactionDashboardResponse | undefined =
    useGetTransactionDashboardLastMonthQuery.data ?? undefined;

  const useGetTransactionDashboardThisMonthSharedUserQuery = useQuery({
    queryKey: ["this-month-dashboard-shared-user", user?._id],
    queryFn: async () => {
      const query: TGetTransactionsDashboardQuery = {
        startTransactedAt: dayjs().startOf("month").toDate(),
        endTransactedAt: dayjs().endOf("month").toDate(),
        userId: user?.sharedUserId as string,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction/dashboard`,
        {
          params: query,
        }
      );
      return data;
    },
    enabled: user != undefined && user.sharedUserId != null,
  });

  const useGetTransactionDashboardLastMonthSharedUserQuery = useQuery({
    queryKey: ["last-month-dashboard-shared-user", user?._id],
    queryFn: async () => {
      const query: TGetTransactionsDashboardQuery = {
        startTransactedAt: dayjs()
          .startOf("month")
          .subtract(1, "month")
          .toDate(),
        endTransactedAt: dayjs().endOf("month").subtract(1, "month").toDate(),
        userId: user?.sharedUserId as string,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction/dashboard`,
        {
          params: query,
        }
      );
      return data;
    },
    enabled: user != undefined && user.sharedUserId != null,
  });

  const dashboardThisMonthSharedUser:
    | TGetTransactionDashboardResponse
    | undefined =
    useGetTransactionDashboardThisMonthSharedUserQuery.data ?? undefined;

  const dashboardLastMonthSharedUser:
    | TGetTransactionDashboardResponse
    | undefined =
    useGetTransactionDashboardLastMonthSharedUserQuery.data ?? undefined;

  const useGetTransactionInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["transaction-listings", user?._id],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetTransactionQuery = {
        limit: 3,
        page: pageParam,
        transactionCategoryId: undefined,
        transactionLabelIds: undefined,
        startTransactedAt: undefined,
        endTransactedAt: undefined,
        targetUserId: user?._id as string,
        isHideSharedUserTransactions: user?.sharedUserId ? false : true,
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

  useEffect(() => {
    const datas = transactions.filter((z) => z.userId != user?._id);
    if (datas.length > 0) {
      datas.map((data) => {
        if (data.transactionCategory.type == ETransactionCategoryType.expense) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: data.user.displayName,
              body: `${data.amount} ${data.currency} under ${
                data.transactionCategory?.name
              } ${getRelativeTimes(data.transactedAt)}`,
            },
            trigger: null,
          });
        }
      });
    }
  }, [transactions]);

  useEffect(() => {
    const requestNotifiicationPermission = async () => {
      await Notifications.requestPermissionsAsync();
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    };
    requestNotifiicationPermission();
  }, []);

  const refreshApis = () => {
    useGetTransactionDashboardThisMonthQuery.refetch();
    useGetTransactionDashboardThisMonthSharedUserQuery;
    useGetTransactionDashboardLastMonthQuery.refetch();
    useGetTransactionDashboardLastMonthSharedUserQuery.refetch();
    useGetTransactionInfiniteQuery.refetch();
  };

  return (
    <>
      <ContainerLayout>
        {user && (
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
              source={{ uri: user.profileImage }}
            />
            <SizedBox width={sw(10)} />
            <CustomText label={user.displayName} size={"medium"} />
          </TouchableOpacity>
        )}
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
                  <View
                    style={{
                      flexDirection: "row",
                      gap: sw(5),
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      size="big"
                      profileImage={user?.profileImage ?? ``}
                    />
                    <CustomText size="medium" label="Spending" />
                  </View>
                  <TouchableOpacity
                    style={{ marginLeft: "auto" }}
                    onPress={() => {
                      navigation.navigate("DashboardScreen", {
                        targetUserId: user?._id as string,
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
                    <CustomText label="$" size="extra-big" textStyle={{}} />
                  </View>
                  <SizedBox width={sw(10)} />
                  <View style={{ flex: 1 }}>
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
                  <View style={{ flex: 1 }}>
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
              {user?.sharedUserId ? (
                <>
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
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          gap: sw(5),
                          alignItems: "center",
                        }}
                      >
                        <Avatar
                          size="big"
                          profileImage={user.sharedUserInfo?.profileImage ?? ``}
                        />
                        <CustomText
                          size="medium"
                          label={`${user.sharedUserInfo?.displayName}'s Spending`}
                        />
                      </View>
                      <TouchableOpacity
                        style={{ marginLeft: "auto" }}
                        onPress={() => {
                          navigation.navigate("DashboardScreen", {
                            targetUserId: user?.sharedUserId as string,
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
                      <View style={{ flex: 1 }}>
                        <CustomText
                          size="medium"
                          label="Spent this month"
                          textStyle={{
                            color: Colors.matterhorn,
                          }}
                        />
                        {useGetTransactionDashboardThisMonthSharedUserQuery.isFetching ? (
                          <CustomText size="medium" label={`Loading...`} />
                        ) : (
                          <CustomText
                            size="medium"
                            label={
                              dashboardThisMonthSharedUser?.expense
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
                      <View style={{ flex: 1 }}>
                        <CustomText
                          size="medium"
                          label="Spent last month"
                          textStyle={{
                            color: Colors.matterhorn,
                          }}
                        />
                        {useGetTransactionDashboardLastMonthSharedUserQuery.isFetching ? (
                          <CustomText size="medium" label={`Loading...`} />
                        ) : (
                          <CustomText
                            size="medium"
                            label={
                              dashboardLastMonthSharedUser?.expense
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
                </>
              ) : (
                <>
                  <SizedBox height={sh(10)} />
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.suvaGrey,
                      padding: sw(20),
                      marginHorizontal: sw(15),
                      borderRadius: sw(10),
                      backgroundColor: "#FBFBFB",
                    }}
                    onPress={() => {
                      navigation.navigate("ShareUserScreen");
                    }}
                  >
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: "#EFEFEF",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "flex-start",
                        height: sw(50),
                        width: sw(50),
                        borderRadius: sw(100),
                      }}
                    >
                      <ExpoVectorIcon
                        name="plus"
                        size={sw(30)}
                        color={Colors.black}
                      />
                    </View>
                    <SizedBox height={sh(30)} />
                    <CustomText
                      textStyle={{ color: Colors.matterhorn }}
                      size="medium"
                      label="Add your partner to view spending together"
                    />
                  </TouchableOpacity>
                </>
              )}
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
                      targetUserId: undefined,
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
                refreshApis();
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
              <SizedBox height={sh(20)} />
            </>
          }
          ListEmptyComponent={
            <CustomText
              label="No Result"
              size="medium"
              containerStyle={{ margin: sw(20) }}
            />
          }
        />
      </ContainerLayout>
    </>
  );
};

export default HomeScreen;
