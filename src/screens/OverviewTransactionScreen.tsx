import ContainerLayout from "@components/Layout/ContainerLayout";
import React, { useMemo, useState } from "react";
import {
  AppNavigationScreen,
  TSelectedUserId,
} from "@libs/react.navigation.lib";
import dayjs from "dayjs";
import DateSwitch from "@components/Shared/DateSwitch";
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
import CustomButtonIcon from "@components/Shared/CustomButtonIcon";
import CustomItemPicker from "@components/Shared/CustomItemPicker";
import { useQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import ModalOverviewTransctionsReportPicker from "@components/Shared/CustomModal/ModalOverviewTransctionsReport";
import { useAuthStore } from "@libs/zustand/authStore";

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
  const useGetDashboardQuery = useQuery({
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

  const useGetDashboardQueryData = useGetDashboardQuery.data??undefined as
    | TGetTransactionDashboardResponse
    | undefined;
  const userTransactions = [] as any
  //useGetDashboardQueryData?.user?.transactions ?? [];
  const userTransactionCategories = [] as any
  //  useGetDashboardQueryData?.user?.transactionCategories ?? [];
  const userTransactionLabels = [] as any
  //  useGetDashboardQueryData?.user?.transactionLabels ?? [];
  const userTimelineTransactions = [] as any
  //  useGetDashboardQueryData?.user?.timelineTransactions ?? [];
  const sharedUserTransactions = [] as any
  //  useGetDashboardQueryData?.sharedUser?.transactions ?? [];
  const sharedUserTimelineTransactions = [] as any
  //  useGetDashboardQueryData?.sharedUser?.timelineTransactions ?? [];
  const sharedUserTransactionCategories = [] as any
   // useGetDashboardQueryData?.sharedUser?.transactionCategories ?? [];
  const sharedUserTransactionLabels =[] as any
   // useGetDashboardQueryData?.sharedUser?.transactionLabels ?? [];
  const totalTransactions =[] as any
  // useGetDashboardQueryData?.total?.transactions ?? [];
  const totalTransactionCategories =[] as any
   // useGetDashboardQueryData?.total?.transactionCategories ?? [];
  const totalTransactionLabels =[] as any
   // useGetDashboardQueryData?.total?.transactionLabels ?? [];
  const totalTimelineTransactions = [] as any
    //useGetDashboardQueryData?.total?.timelineTransactions ?? [];
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
      <Header onBack={() => navigation.goBack()} />
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
            if (!useGetDashboardQuery.isLoading) {
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
              <CustomItemPicker pickedText={selectedReport} title={`Report`} />
            </>
          }
        />

        <SizedBox height={sh(10)} />
        {!useGetDashboardQuery.isLoading ? (
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
