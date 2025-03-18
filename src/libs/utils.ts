import { AsyncStorageLib } from "@libs/async.storage.lib";
import { Colors } from "@styles/Colors";
import {
  EMissionType,
  ETransactionCategoryType,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import {
  TMission,
  TReward,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { Alert } from "react-native";
import { navigationRef } from "./react.navigation.lib";
import { ReactQueryLibs } from "./react.query.client.lib";
import dayjs from "dayjs";

function removeSpecialCharacters(text: string) {
  return text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
}

function convertPhoneNumber({
  countryCode,
  text,
}: {
  countryCode: string;
  text: string;
}) {
  let phoneNumber = text;
  if (countryCode == "+60" && phoneNumber.charAt(0) === "0") {
    phoneNumber = phoneNumber.slice(1);
  }
  return countryCode + phoneNumber;
}

function isNumber(text: string) {
  return !isNaN(parseFloat(text)) && isFinite(parseFloat(text));
}

function addFiveMinitunes() {
  return new Date(new Date().getTime() + 5 * 60000);
}

function isAbleClaim(data: TMission) {
  return data.isClaimable && !data.isClaimed && data.isActive;
}

function getTotalNumberOfCheckedIn(weeklyMissions: TMission[]) {
  return (
    weeklyMissions.find((x) => x.type == EMissionType.weeklyCheckIn)
      ?.missionCount.completedCount ?? 0
  );
}

function isAbleRedeem(rewards: TReward[] | undefined) {
  if (rewards) {
    if (
      rewards.filter((x) => x.phoneNumber == null && !x.isRedeemed).length > 0
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function isInvalidReward(reward: TReward) {
  if (
    reward.isRedeemed ||
    new Date().getTime() >= new Date(reward.expiryAt).getTime()
  ) {
    return true;
  } else {
    return false;
  }
}

function getRemainingTime({ date }: { date: Date }) {
  const timeDifference = new Date(date).getTime() - new Date().getTime();
  const remainingDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  return `${remainingDays} day(s) ${remainingHours} hour(s)`;
}

function displayCurrency({
  currency,
  amount,
}: {
  currency: string;
  amount: number | string;
}) {
  return typeof amount == "number"
    ? `${amount
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${currency}`
    : amount;
}

function handleLogOut() {
  Alert.alert(
    "Log Out?",
    "",
    [
      {
        text: "No",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          AsyncStorageLib.clear();
          ReactQueryLibs.resetQueries();
          navigationRef.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
          });
        },
      },
    ],
    { cancelable: false }
  );
}

const getAmountTextColor = (type: ETransactionCategoryType) => {
  if (type === ETransactionCategoryType.income) {
    return Colors.green;
  } else if (type === ETransactionCategoryType.expense) {
    return Colors.red;
  }
};

function removeStartAndEndSpaceInString(text: string) {
  return text.trimStart().trimEnd();
}

function removeLeadingZero(str: string) {
  if (str.charAt(0) === "0") {
    return removeStartAndEndSpaceInString(str.slice(1));
  }
  return removeStartAndEndSpaceInString(str);
}

const isValidDate = (dateString: string) => {
  const parsedDate = new Date(dateString);
  return !isNaN(parsedDate.getTime());
};

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const displayDateRangeText = ({
  startAt,
  endAt,
}: {
  startAt: Date;
  endAt: Date;
}) => {
  if (
    dayjs().startOf("month").format("DD-MM-YYYY") ==
      dayjs(startAt).startOf("month").format("DD-MM-YYYY") &&
    dayjs().endOf("month").format("DD-MM-YYYY") ==
      dayjs(endAt).endOf("month").format("DD-MM-YYYY")
  ) {
    return "This month";
  } else if (
    dayjs().startOf("month").subtract(1, "month").format("DD-MM-YYYY") ==
      dayjs(startAt).startOf("month").format("DD-MM-YYYY") &&
    dayjs().endOf("month").subtract(1, "month").format("DD-MM-YYYY") ==
      dayjs(endAt).endOf("month").format("DD-MM-YYYY")
  ) {
    return "Last month";
  } else if (
    dayjs().startOf("year").subtract(1, "year").format("DD-MM-YYYY") ==
      dayjs(startAt).startOf("year").format("DD-MM-YYYY") &&
    dayjs().endOf("year").subtract(1, "year").format("DD-MM-YYYY") ==
      dayjs(endAt).endOf("year").format("DD-MM-YYYY")
  ) {
    return "Last year";
  } else {
    return `${dayjs(startAt).format("DD MMM YYYY")} - ${dayjs(endAt).format(
      "DD MMM YYYY"
    )}`;
  }
};

export {
  removeLeadingZero,
  isValidDate,
  getRandomNumber,
  removeSpecialCharacters,
  convertPhoneNumber,
  isNumber,
  addFiveMinitunes,
  isAbleClaim,
  getTotalNumberOfCheckedIn,
  isAbleRedeem,
  getRemainingTime,
  isInvalidReward,
  displayCurrency,
  handleLogOut,
  getAmountTextColor,
  displayDateRangeText,
};
