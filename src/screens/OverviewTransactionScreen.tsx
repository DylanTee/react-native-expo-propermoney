import ContainerLayout from "@components/Layout/ContainerLayout";
import React, { useMemo, useState } from "react";
import {
  AppNavigationScreen,
  TSelectedUserId,
} from "@libs/react.navigation.lib";
import dayjs from "dayjs";
import DateSwitch from "@components/overview-transaction/DateSwitch";
import LoadingCircle from "@components/Shared/LoadingCircle";
import SizedBox from "@components/Shared/SizedBox";
import { sh, sw } from "@libs/responsive.lib";
import Header from "@components/Shared/Header";
import { Pressable, RefreshControl, ScrollView } from "react-native";
import { useTranslation } from "@libs/i18n/index";
import {
  TGetTransactionDashboardResponse,
  TGetTransactionsDashboardQuery,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { Colors } from "@styles/Colors";
import TransactionListings from "@components/overview-transaction/TransactionListings";
import TransactionCategories from "@components/overview-transaction/TransactionCategories";
import TransactionLabels from "@components/overview-transaction/TransactionLabels";
import CustomButtonIcon from "@components/Shared/CustomButtonIcon";
import CustomItemPicker from "@components/Shared/CustomItemPicker";
import { useQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import ModalOverviewTransctionsReportPicker from "@components/Shared/CustomModal/ModalOverviewTransctionsReport";
import { useAuthStore } from "@libs/zustand/authStore";
import { EGetTransactionsByType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";

export enum EOverviewTransactionsReport {
  Categories = "Categories",
  Labels = "Labels",
  Transactions = "Transactions",
}

const OverviewTransactionScreen: AppNavigationScreen<
  "OverviewTransactionScreen"
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const [startTransactedAt, setStartTransactedAt] = useState<any>(
    dayjs(route.params.startTransactedAt).startOf("month")
  );
  const [endTransactedAt, setEndTransactedAt] = useState<any>(
    dayjs(route.params.startTransactedAt).endOf("month")
  );
  const [selectedUserId, setSelectedUserId] = useState<TSelectedUserId>(
    route.params.selectedUserId
  );
  const [selectedReport, setSelectedReport] =
    useState<EOverviewTransactionsReport>(
      EOverviewTransactionsReport.Transactions
    );
  const getTransactionsQuery = useQuery({
    queryKey: ["dashboard", startTransactedAt, endTransactedAt],
    queryFn: async () => {
      const query: TGetTransactionsDashboardQuery = {
        startTransactedAt: dayjs(startTransactedAt).startOf(
          "month"
        ) as unknown as string,
        endTransactedAt: dayjs(endTransactedAt).endOf(
          "month"
        ) as unknown as string,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction/dashboard`,
        { params: query }
      );
      return data;
    },
  });

  const getTransactionsQueryData = getTransactionsQuery.data as
    | TGetTransactionDashboardResponse
    | undefined;
  const userTransactions = getTransactionsQueryData?.user.transactions ?? [];
  const userTransactionCategories =
    getTransactionsQueryData?.user.transactionCategories ?? [];
  const userTransactionLabels =
    getTransactionsQueryData?.user.transactionLabels ?? [];
  const userTimelineTransactions =
    getTransactionsQueryData?.user.timelineTransactions ?? [];
  const sharedUserTransactions =
    getTransactionsQueryData?.sharedUser.transactions ?? [];
  const sharedUserTimelineTransactions =
    getTransactionsQueryData?.sharedUser.timelineTransactions ?? [];
  const sharedUserTransactionCategories =
    getTransactionsQueryData?.sharedUser.transactionCategories ?? [];
  const sharedUserTransactionLabels =
    getTransactionsQueryData?.sharedUser.transactionLabels ?? [];
  const totalTransactions = getTransactionsQueryData?.total.transactions ?? [];
  const totalTransactionCategories =
    getTransactionsQueryData?.total.transactionCategories ?? [];
  const totalTransactionLabels =
    getTransactionsQueryData?.total.transactionLabels ?? [];
  const totalTimelineTransactions =
    getTransactionsQueryData?.total.timelineTransactions ?? [];
  const isListToShowTransactions = useMemo(() => {
    if (selectedUserId) {
      if (selectedUserId == authStore.user?._id) {
        return userTransactions;
      } else {
        return sharedUserTransactions;
      }
    } else {
      return totalTransactions;
    }
  }, [
    selectedUserId,
    sharedUserTransactions,
    totalTransactions,
    authStore.user?._id,
    userTransactions,
  ]);
  const isListToShowTransactionCategories = useMemo(() => {
    if (selectedUserId) {
      if (selectedUserId == authStore.user?._id) {
        return userTransactionCategories;
      } else {
        return sharedUserTransactionCategories;
      }
    } else {
      return totalTransactionCategories;
    }
  }, [
    selectedUserId,
    sharedUserTransactionCategories,
    totalTransactionCategories,
    authStore.user?._id,
    userTransactionCategories,
  ]);
  const isListToShowTransactionLabels = useMemo(() => {
    if (selectedUserId) {
      if (selectedUserId == authStore.user?._id) {
        return userTransactionLabels;
      } else {
        return sharedUserTransactionLabels;
      }
    } else {
      return totalTransactionLabels;
    }
  }, [
    selectedUserId,
    sharedUserTransactionLabels,
    totalTransactionLabels,
    authStore.user?._id,
    userTransactionLabels,
  ]);
  const isListToShowTimelineTransactions = useMemo(() => {
    if (selectedUserId) {
      if (selectedUserId == authStore.user?._id) {
        return userTimelineTransactions;
      } else {
        return sharedUserTimelineTransactions;
      }
    } else {
      return totalTimelineTransactions;
    }
  }, [
    selectedUserId,
    sharedUserTimelineTransactions,
    totalTimelineTransactions,
    authStore.user?._id,
    userTimelineTransactions,
  ]);
  const isThisMonth =
    dayjs().format("YYYY-MM") == dayjs(startTransactedAt).format("YYYY-MM");
  const getDisplayName = () => {
    if (
      authStore.user?.sharedUserInfo &&
      selectedUserId == authStore.user.sharedUserInfo._id
    ) {
      return authStore.user.sharedUserInfo.displayName;
    } else if (authStore.user?._id == selectedUserId) {
      return authStore.user?.displayName;
    } else if (selectedUserId == undefined) {
      return (
        authStore.user?.displayName +
        " & " +
        authStore.user?.sharedUserInfo?.displayName
      );
    } else {
      return "";
    }
  };
  return (
    <ContainerLayout>
      <LoadingCircle visible={getTransactionsQuery.isLoading} />
      <Header
        itemRight={
          <>
            <CustomButtonIcon
              size="medium"
              icon={
                <ExpoVectorIcon
                  name="plus"
                  size={sw(15)}
                  color={Colors.white}
                />
              }
              onPress={() => {
                if (authStore.user) {
                  navigation.navigate("TransactionsFormScreen", {
                    form: {
                      _id: undefined,
                      transactedAt: isThisMonth
                        ? new Date()
                        : new Date(startTransactedAt),
                      transactionCategoryId: null,
                      transactionLabelIds: [],
                      amount: "",
                      currency: authStore.user.currency,
                      imagePath: null,
                      note: "",
                    },
                    isEdit: false,
                    isUsePhotoAI: false,
                    onEdit: () => {},
                    onDelete: () => {},
                  });
                }
              }}
            />
            <SizedBox width={sw(10)} />
            <CustomButtonIcon
              size="medium"
              icon={
                <ExpoVectorIcon
                  name="ellipsis1"
                  size={sw(15)}
                  color={Colors.white}
                />
              }
              onPress={() => {
                navigation.navigate("TransactionSettingsScreen");
              }}
            />
          </>
        }
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={Colors.black}
            refreshing={false}
            onRefresh={() => {}}
          />
        }
      >
        
          <Pressable
            onPress={() => {
              navigation.navigate("TransactionAccountSwitchScreen", {
                userId: selectedUserId,
                onSelect: (userId) => {
                  setSelectedUserId(userId);
                },
              });
            }}
          >
            <CustomItemPicker
              title={t("account")}
              pickedText={getDisplayName() ?? ""}
            />
          </Pressable>
          <SizedBox height={sh(20)} />
          <DateSwitch
            startTransactedAt={startTransactedAt}
            endTransactedAt={endTransactedAt}
            onDateChange={(start, end) => {
              if (!getTransactionsQuery.isLoading) {
                setStartTransactedAt(start);
                setEndTransactedAt(end);
              }
            }}
          />
          <SizedBox height={sh(20)} />
          <ModalOverviewTransctionsReportPicker
            report={selectedReport}
            buttonStyle={{}}
            onChange={(data) => {
              setSelectedReport(data);
            }}
            listComponents={
              <>
                <CustomItemPicker
                  pickedText={selectedReport}
                  title={`Report`}
                />
              </>
            }
          />

          <SizedBox height={sh(10)} />
          {!getTransactionsQuery.isLoading ? (
            <TransactionCategories
              selectedReport={selectedReport}
              transactions={isListToShowTransactions}
              transactionCategories={isListToShowTransactionCategories}
              handlePress={(data) => {
                navigation.navigate(
                  "TransactionHistoryByCategoryOrLabelScreen",
                  {
                    startTransactedAt: startTransactedAt,
                    endTransactedAt: endTransactedAt,
                    _id: data.categoryId,
                    targetUserId: data.targetUserId,
                    type: EGetTransactionsByType.category,
                  }
                );
              }}
            />
          ) : (
            <></>
          )}
          {!getTransactionsQuery.isLoading ? (
            <TransactionLabels
              selectedReport={selectedReport}
              transactions={isListToShowTransactions}
              transactionLabels={isListToShowTransactionLabels}
              handlePress={(data) => {
                navigation.navigate(
                  "TransactionHistoryByCategoryOrLabelScreen",
                  {
                    startTransactedAt: startTransactedAt,
                    endTransactedAt: endTransactedAt,
                    _id: data.labelId,
                    targetUserId: data.targetUserId,
                    type: EGetTransactionsByType.label,
                  }
                );
              }}
            />
          ) : (
            <></>
          )}
          {!getTransactionsQuery.isLoading ? (
            <TransactionListings
              selectedReport={selectedReport}
              transactions={isListToShowTransactions}
              timelineTransactions={isListToShowTimelineTransactions}
            />
          ) : (
            <></>
          )}
        
      </ScrollView>
    </ContainerLayout>
  );
};
export default OverviewTransactionScreen;
