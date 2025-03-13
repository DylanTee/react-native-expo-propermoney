import ContainerLayout from "@components/Layout/ContainerLayout";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import React from "react";
import { sh, sw } from "@libs/responsive.lib";
import { Linking, RefreshControl, ScrollView, View } from "react-native";
import { Colors } from "@styles/Colors";
import { useTranslation } from "@libs/i18n/index";
import MemberCard from "../components/Shared/MemberCard";
import HomeCard, { HomeCardProps } from "../components/Shared/Card/HomeCard";
import { FlashList } from "@shopify/flash-list";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import { useAuthStore } from "@libs/zustand/authStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import {
  TGetTransactionQuery,
  TTransaction,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import TransactionCard from "@components/Shared/TransactionCard";
import LoadingCircle from "@components/Shared/LoadingCircle";
import CustomText from "@components/Shared/CustomText";
import dayjs from "dayjs";
import SizedBox from "@components/Shared/SizedBox";

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
      label: t("overviewSpending"),
      description: "Supervise your daily spending",
      icon: <ExpoVectorIcon name="swap" size={sw(25)} color={Colors.black} />,
      onPress: () => {
        navigation.navigate("OverviewTransactionScreen", {
          selectedUserId: authStore.user?._id,
          startTransactedAt: new Date(),
        });
      },
    },
    {
      index: 3,
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
    //   index: 4,
    //   label: `${t("categories")}`,
    //   description: `Manage your ${t(
    //     "categories"
    //   )} such as edit, create and etc.`,
    //   icon: (
    //     <ExpoVectorIcon name="ellipsis1" size={sw(25)} color={Colors.black} />
    //   ),
    //   onPress: () => {
    // },
    // {
    //   index: 5,
    //   label: `${t("labels")}`,
    //   description: `Manage your ${t("labels")} such as edit, create and etc.`,
    //   icon: <ExpoVectorIcon name="tagso" size={sw(25)} color={Colors.black} />,
    //   onPress: () => {},
    // },
    {
      index: 6,
      label: `${t("missions")}/${t("rewards")}`,
      description: "Earn reward points (RP) on every mission completed",
      icon: <ExpoVectorIcon name="flag" size={sw(25)} color={Colors.black} />,
      onPress: () => {
        navigation.navigate("MissionScreen");
      },
    },
    {
      index: 7,
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

  const useGetTransactionInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["/transaction"],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetTransactionQuery = {
        limit: 10,
        page: pageParam,
        transactionCategoryId: undefined,
        transactionLabelId: undefined,
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
        <MemberCard currentRouteName="HomeScreen" />
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
                    id: item._id
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
    </>
  );
};

export default HomeScreen;
