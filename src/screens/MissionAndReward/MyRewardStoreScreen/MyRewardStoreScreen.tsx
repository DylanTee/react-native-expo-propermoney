import ContainerLayout from "@components/Layout/ContainerLayout";
import CustomText from "@components/Shared/CustomText";
import Header from "@components/Shared/Header";
import LoadingCircle from "@components/Shared/LoadingCircle";
import SizedBox from "@components/Shared/SizedBox";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import { sfont, sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import { Global } from "@styles/Global";
import { catchErrorDialog } from "@libs/utils";
import { ERewardType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import {
  TGetPointTotalResponse,
  TGetRewardStoreResponse,
  TPostRewardRedeemBody,
  TPostRewardRedeemResponse,
  TRewardStoreItem,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { resetQueries } from "@libs/react.query.client.lib";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";

const MyRewardStoreScreen: AppNavigationScreen<"MyRewardStoreScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const getTotalPointsQuery = useQuery({
    queryKey: ["/point/getTotalPoints"],
    queryFn: async () => {
      const { data } = await AxiosLibs.defaultClient.get(
        `/point/getTotalPoints`
      );
      return data;
    },
  });
  const totalPoints = useMemo(() => {
    if (getTotalPointsQuery.isSuccess) {
      const data =
        getTotalPointsQuery.data as unknown as TGetPointTotalResponse;
      return data.totalPoints;
    } else {
      return 0;
    }
  }, [getTotalPointsQuery.isSuccess]);
  const getRewardsStoreItemQuery = useQuery({
    queryKey: ["rewardStoreItems"],
    queryFn: async () => {
      const { data } = await AxiosLibs.defaultClient.get(`/reward/store`);
      return data;
    },
  });
  const rewardStoreItems = useMemo(() => {
    if (getRewardsStoreItemQuery.isSuccess) {
      const data =
        getRewardsStoreItemQuery.data as unknown as TGetRewardStoreResponse;
      return data.rewardStoreItems;
    } else {
      return [];
    }
  }, [getRewardsStoreItemQuery.isSuccess]);

  const redeemMutation = useMutation({
    mutationFn: (data: TPostRewardRedeemBody) => {
      return AxiosLibs.defaultClient.post("/reward/redeem", data);
    },
  });

  const btnRedeem = (data: TRewardStoreItem) => {
    Alert.alert(
      t("areYouSure") + "?",
      t("thisWillCost") + ` ` + data.price + `RP.`,
      [
        {
          text: t("no"),
          onPress: () => {},
          style: "cancel",
        },
        {
          text: t("yes"),
          onPress: () => {
            redeemMutation.mutate(
              {
                rewardType: data.type,
              },
              {
                onSuccess: (response: any) => {
                  resetQueries();
                  const res: TPostRewardRedeemResponse = response.data;
                  if (
                    data.type ==
                    ERewardType.reward_store_item_touch_and_go_ewallet
                  ) {
                    Alert.alert(
                      `${t("youGet")} ${res.value}, ${t("pleaseCheckIn")} ${t(
                        "myReward"
                      )}`
                    );
                  }
                },
                onError: (e) => {
                  catchErrorDialog(e);
                },
              }
            );
          },
        },
      ],
      { cancelable: false }
    );
  };
  return (
    <ContainerLayout>
      <Header title={t("rewardStore")} onBack={() => navigation.goBack()} />
      <LoadingCircle
        visible={
          getTotalPointsQuery.isLoading ||
          getRewardsStoreItemQuery.isLoading ||
          redeemMutation.isPending
        }
      />
      <ScrollView
        style={{
          paddingHorizontal: sw(10),
        }}
      >
        <View style={[styles.cardContainer, Global.shadowLine]}>
          <CustomText label={t("youHave")} size={"small"} />
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <CustomText size={"big"} label={totalPoints.toString()} />
            <SizedBox width={sw(5)} />
            <CustomText size={"small"} label={"Rewards Points (RP)"} />
          </View>
        </View>
        <SizedBox height={sh(20)} />
        {rewardStoreItems.map((data) => (
          <TouchableOpacity
            key={data.type}
            style={[styles.itemButton, Global.shadowLine]}
            onPress={() => btnRedeem(data)}
          >
            <Image
              style={{
                width: sw(35),
                height: sw(35),
              }}
              source={require("@assets/Touch-n-Go-Logo-eGHL.png")}
            />
            <SizedBox width={sw(10)} />
            <View style={{ flex: 1 }}>
              <CustomText size={"medium"} label={data.name} />
              <SizedBox height={sh(5)} />
              <CustomText size={"small"} label={data.description} />
              <SizedBox height={sh(5)} />
              <CustomText size={"small"} label={data.inventoryLeft + " Left"} />
              <SizedBox height={sh(5)} />
              <CustomText size={"small"} label={data.price + " RP"} />
              <SizedBox height={sh(10)} />
              <CustomText
                size={"small"}
                label={`${t(`timeRemaining`)}: ${data.refreshAt}`}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ContainerLayout>
  );
};
const styles = StyleSheet.create({
  normalText: {
    color: Colors.black,
  },
  cardContainer: {
    padding: sw(10),
  },
  itemButton: {
    flexDirection: "row",
    padding: sw(10),
    backgroundColor: Colors.white,
    alignItems: "center",
  },
  itemTitleText: {
    fontWeight: "bold",
    fontSize: sfont(12),
    color: Colors.black,
  },
  itemDescriptionText: {
    color: Colors.black,
    fontSize: sfont(10),
  },
  itemPriceText: {
    color: Colors.primary,
    fontSize: sfont(10),
  },
});
export default MyRewardStoreScreen;
