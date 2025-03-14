import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import React, { useState } from "react";
import { sh } from "@libs/responsive.lib";
import SizedBox from "@components/Shared/SizedBox";
import {
  TGetRewardQuery,
  TPostRewardClaimBody,
  TReward,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { catchErrorDialog } from "@libs/utils";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";
import RewardCard from "@components/Shared/Card/RewardCard";
import { useTranslation } from "react-i18next";
import { ERewardType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import CustomTab from "@components/Shared/CustomTab";
import { resetQueries } from "@libs/react.query.client.lib";
import { AxiosLibs } from "@libs/axios.lib";

export enum ERewardTab {
  valid = 0,
  invalid = 1,
}

const MyRewardScreen: AppNavigationScreen<"MyRewardScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const redeemPointMutation = useMutation({
    mutationFn: (data: TPostRewardClaimBody) => {
      return AxiosLibs.defaultClient.post("/reward/claim", data);
    },
  });
  const [rewardTab, setRewardTab] = useState<ERewardTab>(ERewardTab.valid);
  const getInvalidRewardsInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["invalidRewards", redeemPointMutation, rewardTab],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetRewardQuery = {
        limit: "10",
        page: pageParam.toString(),
        isValid: "false",
      };
      const { data } = await AxiosLibs.defaultClient.get(`/reward`, {
        params: query,
      });
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const hasNextPage = lastPage.pagination.has_next_page;
      return hasNextPage ? allPages.length + 1 : undefined;
    },
  });
  const getValidRewardsInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["validRewards", redeemPointMutation, rewardTab],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetRewardQuery = {
        limit: "10",
        page: pageParam.toString(),
        isValid: "true",
      };
      const { data } = await AxiosLibs.defaultClient.get(`/reward`, {
        params: query,
      });
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const hasNextPage = lastPage.pagination.has_next_page;
      return hasNextPage ? allPages.length + 1 : undefined;
    },
  });

  const getValidRewardsInfinteQueryData = getValidRewardsInfiniteQuery.data;
  const validRewardsList =
    getValidRewardsInfinteQueryData?.pages.flatMap((page) => {
      return page.rewards;
    }) ?? [];

  const getInvalidRewardsInfinteQueryData = getInvalidRewardsInfiniteQuery.data;
  const invalidRewardsList =
    getInvalidRewardsInfinteQueryData?.pages.flatMap((page) => {
      return page.rewards;
    }) ?? [];

  const btnRedeem = ({ data }: { data: TReward }) => {
    if (data.type == ERewardType.weekly_winner_touch_and_go_reward_point) {
      redeemPointMutation.mutate(
        { rewardId: data._id },
        {
          onSuccess: () => {
            resetQueries();
          },
          onError: (e) => {
            catchErrorDialog(e);
          },
        }
      );
    } else {
      navigation.navigate("MyRewardFormScreen", {
        data: data,
        onRefresh: () => {},
      });
    }
  };

  return (
    <ContainerLayout>
      <Header onBack={() => navigation.goBack()} />
      <CustomTab
        value={rewardTab}
        data={[
          { label: t("valid"), value: ERewardTab.valid },
          { label: t("invalid"), value: ERewardTab.invalid },
        ]}
        onChange={(data) => {
          setRewardTab(data as ERewardTab);
          getValidRewardsInfiniteQuery.refetch();
          getInvalidRewardsInfiniteQuery.refetch();
        }}
      />
      <SizedBox height={sh(10)} />
      <FlashList
        data={
          rewardTab == ERewardTab.valid ? validRewardsList : invalidRewardsList
        }
        keyExtractor={(item, index) => item._id + index}
        estimatedItemSize={30}
        onEndReached={() => {
          if (rewardTab == ERewardTab.valid) {
            getValidRewardsInfiniteQuery.fetchNextPage();
          } else {
            getInvalidRewardsInfiniteQuery.fetchNextPage();
          }
        }}
        renderItem={({ item }: { item: TReward }) => (
          <RewardCard
            disabled={
              getInvalidRewardsInfiniteQuery.isLoading ||
              getValidRewardsInfiniteQuery.isLoading ||
              redeemPointMutation.isPending
            }
            rewardTab={rewardTab}
            data={item}
            onRedeem={() => btnRedeem({ data: item })}
          />
        )}
      />
    </ContainerLayout>
  );
};
export default MyRewardScreen;
