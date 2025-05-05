import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import SizedBox from "@components/Shared/SizedBox";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import { sfont, sh, sw } from "@libs/responsive.lib";
import ProgressBar from "@components/Shared/ProgressBar";
import { Colors } from "@styles/Colors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAbleClaim } from "@libs/utils";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, ScrollView, View } from "react-native";
import CustomButton from "@components/Shared/CustomButton";
import CustomText from "@components/Shared/CustomText";
import {
  TMission,
  TGetMissionResponse,
  TPostPointClaimBody,
  TGetPointTotalResponse,
  TGetMissionQuery,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { AxiosLibs } from "@libs/axios.lib";
import {
  EMissionType,
  ESubscriptionEntitlement,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import { useAuthStore } from "@libs/zustand/authStore";

const MissionScreen: AppNavigationScreen<"MissionScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const getTotalPointsQuery = useQuery({
    queryKey: ["totalPoints"],
    queryFn: async () => {
      const { data } = await AxiosLibs.defaultClient.get(`/point/total`);
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

  const getMissionsQuery = useQuery({
    queryKey: ["mission"],
    queryFn: async () => {
      const query: TGetMissionQuery = {
        entitlement: ESubscriptionEntitlement.starter,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/mission?entitlement`,
        {
          params: query,
        }
      );
      return data;
    },
  });
  const dailyMissions = useMemo(() => {
    if (getMissionsQuery.isSuccess) {
      const data = getMissionsQuery.data as unknown as TGetMissionResponse;
      return data.dailyMissions;
    } else {
      return null;
    }
  }, [getMissionsQuery.isSuccess]);

  const weeklyMissions = useMemo(() => {
    if (getMissionsQuery.isSuccess) {
      const data = getMissionsQuery.data as unknown as TGetMissionResponse;
      return data.weeklyMissions;
    } else {
      return null;
    }
  }, [getMissionsQuery.isSuccess]);

  const claimMutation = useMutation({
    mutationFn: (data: TPostPointClaimBody) => {
      return AxiosLibs.defaultClient.post("/point/claim", data);
    },
  });

  const btnAction = (data: TMission) => {
    if (authStore.user && isAbleClaim(data)) {
      claimMutation.mutate(
        {
          entitlement: ESubscriptionEntitlement.starter,
          missionType: data.type,
        },
        {
          onSuccess: () => {},
          onError: (e) => {
            Alert.alert(e.message);
          },
        }
      );
    } else {
      if (
        data.type == EMissionType.daiyAddIncomeOrExpense ||
        data.type == EMissionType.weeklyAddIncomeOrExpense
      ) {
        navigation.navigate("TransactionsFormScreen", {
          id: undefined,
          isEdit: false,
          onEdit: () => {},
          onDelete: () => {},
        });
      } else if (data.type == EMissionType.weeklyCheckIn) {
        Alert.alert("Claim Daily Check in [Daily Missions]");
      }
    }
  };

  const isLoading = claimMutation.isPending;

  return (
    <ContainerLayout>
      <Header
        containerStyle={{ padding: sw(15) }}
        onBack={() => navigation.goBack()}
      />
      <ScrollView>
        <View style={{ paddingHorizontal: sw(15) }}>
          <CustomText label={t("youHave")} size={"small"} />
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <CustomText label={totalPoints.toString()} size={"big"} />
            <SizedBox width={sw(5)} />
            <CustomText label={"Rewards Points (RP)"} size={"small"} />
          </View>
          <SizedBox height={sh(10)} />
          <View style={{ flexDirection: "row" }}>
            <View>
              <CustomButton
                type={"primary"}
                size={"small"}
                title={t("myReward")}
                onPress={() => navigation.navigate("MyRewardScreen")}
              />
            </View>
            <SizedBox width={sw(20)} />
            <CustomButton
              type={"primary"}
              size={"small"}
              title={t("goToRewardStore")}
              onPress={() => {
                navigation.navigate("MyRewardStoreScreen");
              }}
            />
          </View>
        </View>
        <SizedBox height={sh(20)} />
        <View style={{ padding: sw(15) }}>
          <CustomText label={`${t("daily")} ${t("missions")}`} size={"big"} />
          <CustomText
            label={`${t(`timeRemaining`)}: ${dailyMissions?.refreshAt}`}
            size={"medium"}
          />
          <SizedBox height={sh(10)} />
          {dailyMissions?.missions.map((data) => (
            <View
              key={data.type}
              style={[
                styles.missionContainer,
                { opacity: data.isClaimed ? 0.4 : 1 },
              ]}
            >
              <CustomText label={data.description} size={"medium"} />
              <SizedBox height={sw(10)} />
              <ProgressBar
                color={Colors.green}
                width={
                  data.missionCount.totalCount > 0
                    ? (data.missionCount.completedCount /
                        data.missionCount.totalCount) *
                      100
                    : 0
                }
              />
              <SizedBox height={sw(10)} />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CustomText
                  label={`${data.point.toString()} RP`}
                  size={"medium"}
                />
                <SizedBox width={sw(5)} />
                {ESubscriptionEntitlement.starter && (
                  <CustomButton
                    type={"secondary"}
                    size={"small"}
                    title={"Extra"}
                    onPress={() => {
                      Linking.openURL(
                        `https://pr0per.vercel.app/topup?projectId=propermoney&userId=${authStore.user?._id}`
                      );
                    }}
                  />
                )}
                <View
                  style={{
                    marginLeft: "auto",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <CustomText
                    label={data.missionCount.completedCount.toString()}
                    textStyle={{
                      color: Colors.primary,
                    }}
                    size={"big"}
                  />
                  <CustomText
                    label={`/${data.missionCount.totalCount}`}
                    size={"medium"}
                  />
                </View>
              </View>
              <SizedBox height={sw(10)} />
              {data.isClaimed ? (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <CustomText
                    label={t("completed")}
                    size={"small"}
                    textStyle={{ color: Colors.green }}
                  />
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
                  <SizedBox width={sh(20)} />
                  <CustomButton
                    disabled={isLoading}
                    type={"primary"}
                    size={"small"}
                    title={isAbleClaim(data) ? t("claim") : t("navigate")}
                    onPress={() => {
                      btnAction(data);
                    }}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
        <SizedBox height={sh(20)} />
        <View style={{ padding: sw(15) }}>
          <CustomText size={"big"} label={`${t("weekly")} ${t("missions")}`} />
          <CustomText
            size={"medium"}
            label={`${t(`timeRemaining`)}: ${weeklyMissions?.refreshAt}`}
          />
          <SizedBox height={sh(10)} />
          {weeklyMissions?.missions
            .filter((x) => x.isActive)
            .map((data) => (
              <View
                key={data.type}
                style={[
                  styles.missionContainer,
                  { opacity: data.isClaimed ? 0.4 : 1 },
                ]}
              >
                <CustomText label={data.description} size={"medium"} />
                <SizedBox height={sw(10)} />
                <ProgressBar
                  color={Colors.green}
                  width={
                    data.missionCount.totalCount > 0
                      ? (data.missionCount.completedCount /
                          data.missionCount.totalCount) *
                        100
                      : 0
                  }
                />
                <SizedBox height={sw(10)} />
                <SizedBox height={sw(10)} />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <CustomText
                    label={`${data.point.toString()} RP`}
                    size={"medium"}
                  />
                  <SizedBox width={sw(5)} />
                  {ESubscriptionEntitlement.starter && (
                    <CustomButton
                      type={"secondary"}
                      size={"small"}
                      title={"Extra"}
                      onPress={() => {
                        Linking.openURL(
                          `https://pr0per.vercel.app/topup?projectId=propermoney&userId=${authStore.user?._id}`
                        );
                      }}
                    />
                  )}
                  <View
                    style={{
                      marginLeft: "auto",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <CustomText
                      label={data.missionCount.completedCount.toString()}
                      textStyle={{
                        color: Colors.primary,
                      }}
                      size={"big"}
                    />
                    <CustomText
                      label={`/${data.missionCount.totalCount}`}
                      size={"medium"}
                    />
                  </View>
                </View>
                <SizedBox height={sw(10)} />
                {data.isClaimed ? (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <CustomText
                      label={t("completed")}
                      size={"small"}
                      textStyle={{ color: Colors.green }}
                    />
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
                    <SizedBox width={sh(20)} />
                    <CustomButton
                      type={"primary"}
                      size={"small"}
                      title={isAbleClaim(data) ? t("claim") : t("navigate")}
                      onPress={() => {
                        btnAction(data);
                      }}
                    />
                  </View>
                )}
              </View>
            ))}
        </View>
        <SizedBox height={sh(20)} />
      </ScrollView>
    </ContainerLayout>
  );
};

const styles = {
  missionContainer: {
    marginBottom: sw(10),
    padding: sw(10),
    borderRadius: sw(10 / 2),
    backgroundColor: Colors.white,
  },
  titleText: {
    fontSize: sfont(14),
    color: Colors.black,
  },
  normalText: {
    color: Colors.black,
  },
};
export default MissionScreen;
