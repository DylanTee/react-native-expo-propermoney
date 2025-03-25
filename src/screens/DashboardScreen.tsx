import React, { useMemo, useState } from "react";
import ContainerLayout from "@components/Layout/ContainerLayout";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Header from "@components/Shared/Header";
import { sh, sw } from "@libs/responsive.lib";
import { useQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import {
  TGetTransactionDashboardResponse,
  TGetTransactionsDashboardQuery,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { useAuthStore } from "@libs/zustand/authStore";
import { Colors } from "@styles/Colors";
import CustomText from "@components/Shared/CustomText";
import SizedBox from "@components/Shared/SizedBox";
import ModalDateRangePicker from "@components/Shared/CustomModal/ModalDateTimePicker/ModalDateRangePicker";
import dayjs from "dayjs";
import TransactionCategoryCard from "@components/Shared/Card/TransactionCategoryCard";
import LoadingCircle from "@components/Shared/LoadingCircle";
import { displayDateRangeText } from "@libs/utils";

const DashboardScreen: AppNavigationScreen<"DashboardScreen"> = ({
  navigation,
  route,
}) => {
  const authStore = useAuthStore();
  const [targetUserId, setTargetUserId] = useState<string>(
    authStore.user?._id as string
  );
  const [transactedAtRange, setTransactedAtRange] = useState<{
    startTransactedAt: Date;
    endTransactedAt: Date;
  }>({
    startTransactedAt: dayjs().startOf("month").toDate(),
    endTransactedAt: dayjs().endOf("month").toDate(),
  });
  const useGetTransactionDashboardQuery = useQuery({
    queryKey: ["dashboard", transactedAtRange, targetUserId],
    queryFn: async () => {
      const query: TGetTransactionsDashboardQuery = {
        startTransactedAt: transactedAtRange.startTransactedAt,
        endTransactedAt: transactedAtRange.endTransactedAt,
        userId: targetUserId,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction/dashboard`,
        {
          params: query,
        }
      );
      return data;
    },
  });
  const dashboard: TGetTransactionDashboardResponse =
    useGetTransactionDashboardQuery.data ?? undefined;

  const config = useMemo(() => {
    return [
      {
        id: "user",
        components: (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: Colors.suvaGrey,
              backgroundColor:
                authStore.user?._id == targetUserId
                  ? Colors.primary
                  : "transparent",
              borderRadius: sw(30),
              padding: sw(5),
              paddingHorizontal: sw(20),
            }}
            onPress={() => setTargetUserId(authStore.user?._id as string)}
          >
            <CustomText
              label={`${authStore.user?.displayName}`}
              size="medium"
              textStyle={{
                color:
                  authStore.user?._id == targetUserId
                    ? `#D6FFBC`
                    : Colors.primary,
              }}
            />
          </TouchableOpacity>
        ),
        isVisible: authStore.user?.sharedUserId != null,
      },
      {
        id: "shared-user",
        components: (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: Colors.suvaGrey,
              backgroundColor:
                authStore.user?.sharedUserId == targetUserId
                  ? Colors.primary
                  : "transparent",
              borderRadius: sw(30),
              padding: sw(5),
              paddingHorizontal: sw(20),
            }}
            onPress={() =>
              setTargetUserId(authStore.user?.sharedUserId as string)
            }
          >
            <CustomText
              label={`${authStore.user?.sharedUserInfo?.displayName}`}
              size="medium"
              textStyle={{
                color:
                  authStore.user?.sharedUserId == targetUserId
                    ? `#D6FFBC`
                    : Colors.primary,
              }}
            />
          </TouchableOpacity>
        ),
        isVisible: authStore.user?.sharedUserId != null,
      },
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
              <View
                style={{
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: Colors.suvaGrey,
                  backgroundColor: Colors.primary,
                  borderRadius: sw(30),
                  padding: sw(5),
                  paddingHorizontal: sw(20),
                }}
              >
                <CustomText
                  label={displayDateRangeText({
                    startAt: transactedAtRange.startTransactedAt,
                    endAt: transactedAtRange.endTransactedAt,
                  })}
                  size="medium"
                  textStyle={{
                    color: `#D6FFBC`,
                  }}
                />
              </View>
            }
            data={{
              startAt: transactedAtRange.startTransactedAt,
              endAt: transactedAtRange.endTransactedAt,
            }}
          />
        ),
        isVisible: true,
      },
    ];
  }, [transactedAtRange, targetUserId]);
  return (
    <>
      <ContainerLayout>
        <Header
          containerStyle={{ paddingHorizontal: sw(15) }}
          onBack={() => navigation.goBack()}
        />
        <SizedBox height={sh(10)} />
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {config
              .filter((z) => z.isVisible)
              .map((data, index) => (
                <View
                  style={{ marginLeft: index == 0 ? sw(15) : sw(5) }}
                  key={data.id}
                >
                  {data.components}
                </View>
              ))}
          </ScrollView>
        </View>
        <LoadingCircle
          containerStyle={{ margin: sw(20) }}
          visible={useGetTransactionDashboardQuery.isFetching}
        />
        {dashboard ? (
          <ScrollView>
            <SizedBox height={sh(20)} />
            <CustomText
              size="extra-big"
              label="Spending"
              textStyle={{
                paddingHorizontal: sw(15),
              }}
            />

            {dashboard?.expense?.map((data, index) => (
              <View key={index} style={{ paddingVertical: sw(15) }}>
                <View
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: sw(15),
                    alignItems: "center",
                  }}
                >
                  <CustomText
                    size="medium"
                    label={`Spent in\n${displayDateRangeText({
                      startAt: transactedAtRange.startTransactedAt,
                      endAt: transactedAtRange.endTransactedAt,
                    })}`}
                  />
                  <CustomText
                    size="big"
                    label={`${data.totalAmount.toFixed(2)} ${data.currency}`}
                    containerStyle={{
                      marginLeft: "auto",
                    }}
                  />
                </View>
                <SizedBox height={sh(20)} />
                {data.categories.map((category) => (
                  <TransactionCategoryCard
                    categoryName={category.name}
                    key={category._id}
                    imagePath={category.imagePath}
                    name={category.name}
                    iconNackgroundColor={category.backgroundColor}
                    currency={data.currency}
                    amount={category.totalAmount}
                    totalSpending={data.totalAmount}
                    percentage={category.percentage}
                    onPress={() => {
                      navigation.navigate("OverviewTransactionScreen", {
                        startTransactedAt: transactedAtRange.startTransactedAt,
                        endTransactedAt: transactedAtRange.endTransactedAt,
                        transactionCategoryId: category._id,
                        targetUserId: authStore.user?._id as string,
                      });
                    }}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        ) : (
          <>
            <CustomText
              label="No Result"
              size="medium"
              containerStyle={{ margin: sw(20) }}
            />
          </>
        )}
      </ContainerLayout>
    </>
  );
};
export default DashboardScreen;
