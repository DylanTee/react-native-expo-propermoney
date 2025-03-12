import React from "react";
import { Image, StyleSheet, View } from "react-native";
import SizedBox from "@components/Shared/SizedBox";
import { sfont, sh, sw } from "@libs/responsive.lib";
import { getRemainingTime, isInvalidReward } from "@libs/utils";
import { Colors } from "@styles/Colors";
import { useTranslation } from "@libs/i18n/index";
import { TReward } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import CustomButton from "@components/Shared/CustomButton";
import { Global } from "@styles/Global";
import CustomText from "@components/Shared/CustomText";
import { ERewardType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import { ERewardTab } from "@screens/MyRewardScreen";

interface RewardCardProps {
  disabled: boolean;
  rewardTab: ERewardTab;
  data: TReward;
  onRedeem(): void;
}

const RewardCard = ({
  disabled,
  data,
  rewardTab,
  onRedeem,
}: RewardCardProps) => {
  const { t } = useTranslation();

  const getLogoImage = (data: TReward) => {
    if (data.type == ERewardType.weekly_winner_touch_and_go_reward_point) {
      return require("@assets/logo.png");
    } else {
      return require("@assets/Touch-n-Go-Logo-eGHL.png");
    }
  };

  const getAmountText = (data: TReward) => {
    if (data.type == ERewardType.weekly_winner_touch_and_go_reward_point) {
      return data.value + " RP";
    } else if (
      data.type == ERewardType.weekly_winner_touch_and_go ||
      data.type == ERewardType.reward_store_item_touch_and_go_ewallet
    ) {
      return "RM " + data.value;
    }
  };

  const getRewardTitleText = (data: TReward) => {
    if (data.type == ERewardType.weekly_winner_touch_and_go_reward_point) {
      return `Rewards Points (RP)`;
    } else {
      return `Touch 'n Go eWallet`;
    }
  };

  const getRewardDescriptionText = (data: TReward) => {
    if (data.type == ERewardType.weekly_winner_touch_and_go) {
      return `Touch 'n Go eWallet Weekly Winner`;
    } else if (
      data.type == ERewardType.weekly_winner_touch_and_go_reward_point
    ) {
      return `Better luck next time! Rewards Points for participated Touch 'n Go Weekly Winner`;
    } else if (
      data.type == ERewardType.reward_store_item_touch_and_go_ewallet
    ) {
      return `Randomised cash from Reward Store`;
    }
  };

  const getCircleIconText = (data: TReward) => {
    if (data.isRedeemed) {
      return t("redeemed");
    } else {
      return t("expired");
    }
  };

  return (
    <View
      style={[
        styles.button,
        Global.shadowLine,
        { opacity: !isInvalidReward(data) ? 1 : 0.5 },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          style={styles.image}
          resizeMode="contain"
          source={getLogoImage(data)}
        />
        <SizedBox width={sw(10)} />
        <View style={{ flex: 1 }}>
          <CustomText label={getAmountText(data) ?? ""} size={"medium"} />
          <SizedBox height={sh(5)} />
          <CustomText label={getRewardTitleText(data) ?? ""} size={"small"} />
          <SizedBox height={sh(5)} />
          <CustomText
            label={getRewardDescriptionText(data) ?? ""}
            size={"small"}
          />
          <SizedBox height={sh(5)} />
          {!data.phoneNumber && rewardTab == ERewardTab.valid ? (
            <View style={{ flexDirection: "row" }}>
              <ExpoVectorIcon name="warning" size={sw(10)} color={Colors.red} />
              <SizedBox width={sw(3)} />
              <CustomText
                label={`${t("expireIn")}: ${getRemainingTime({
                  date: data.expiryAt,
                })}`}
                textStyle={{ color: Colors.red }}
                size={"small"}
              />
            </View>
          ) : (
            <></>
          )}
        </View>
      </View>
      {isInvalidReward(data) ? (
        <View
          style={{
            position: "absolute",
            zIndex: 1,
            right: sw(10),
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              zIndex: 1,
              transform: [{ rotate: "15deg" }],
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CustomText label={getCircleIconText(data)} size={"medium"} />
          </View>
        </View>
      ) : (
        <View
          style={{
            borderTopWidth: 1,
            borderColor: Colors.gainsboro,
            margin: sw(10),
            padding: sw(10),
          }}
        >
          {data.phoneNumber && (
            <CustomText
              size={"small"}
              label={t("weHadReceivedYourSubmitted")}
            />
          )}
          <SizedBox height={sh(10)} />
          <CustomButton
            type={"primary"}
            size={"big"}
            disabled={disabled}
            title={data.phoneNumber ? t("edit") : t("redeem")}
            onPress={() => onRedeem()}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: sw(15),
    marginBottom: sh(5),
    backgroundColor: Colors.white,
  },
  image: {
    width: sw(35),
    height: sw(35),
    borderRadius: 5,
  },
  titleText: {
    fontSize: sfont(12),
    fontWeight: "bold",
    color: Colors.black,
  },
  nameText: {
    fontSize: sfont(10),
    color: Colors.black,
  },
  periodText: {
    fontSize: sfont(8),
    color: Colors.black,
  },
  switchButton: {
    padding: sw(5),
    paddingHorizontal: sw(10),
    borderRadius: sw(30) / 2,
  },
  switchText: {
    fontSize: sfont(12),
  },
});
export default RewardCard;
