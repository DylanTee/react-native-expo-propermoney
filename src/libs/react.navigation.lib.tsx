import React, { FC } from "react";
import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp,
  StackScreenProps,
} from "@react-navigation/stack";
import { Colors } from "../styles/Colors";
import {
  EGetTransactionsByType,
  ETransactionCategoryType,
  EVerificationOneTimePasswordType,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import MoreScreen from "@screens/MoreScreen/MoreScreen";
import LoginScreen from "@screens/LoginScreen/LoginScreen";
import VerifyOneTimePasswordScreen from "@screens/VerifyOneTimePasswordScreen/VerifyOneTimePasswordScreen";
import HomeScreen from "@screens/HomeScreen/HomeScreen";
import ContactSupportScreen from "@screens/ContactSupportScreen/ContactSupportScreen";
import MissionScreen from "@screens/MissionAndReward/MissionScreen/MissionScreen";
import MyRewardScreen from "@screens/MissionAndReward/MyRewardScreen/MyRewardScreen";
import MyRewardStoreScreen from "@screens/MissionAndReward/MyRewardStoreScreen/MyRewardStoreScreen";
import MyRewardFormScreen from "@screens/MissionAndReward/MyRewardFormScreen/MyRewardFormScreen";
import ShareUserScreen from "@screens/ShareUserScreen/ShareUserScreen";
import TransactionsFormScreen from "@screens/TransactionsFormScreen/TransactionsFormScreen";
import OverviewTransactionScreen from "@screens/OverviewTransactionScreen/OverviewTransactionScreen";
import TransactionSettingsScreen from "@screens/TransactionSettingsScreen/TransactionSettingsScreen";
import TransactionAccountSwitchScreen from "@screens/TransactionAccountSwitchScreen/TransactionAccountSwitchScreen";
import { TReward } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import TransactionHistoryByCategoryOrLabelScreen from "@screens/TransactionHistoryByCategoryOrLabelScreen/TransactionHistoryByCategoryOrLabelScreen";

export type OverviewTransactionScreenParams = {
  selectedUserId: TSelectedUserId;
  startTransactedAt: Date;
};

export type TSelectedUserId = string | undefined;

export type TTransactionForm = {
  _id: string | undefined;
  transactionCategoryId: string | null;
  transactionLabelIds: string[];
  currency: string;
  amount: string;
  imagePath: string | null;
  note: string;
  transactedAt: Date;
};

export const navigationRef = createNavigationContainerRef<AppStackParamList>();
export type AppStackNavigationProp = StackNavigationProp<AppStackParamList>;
export type AppStackParamList = {
  LoginScreen?: undefined;
  MoreScreen?: undefined;
  VerifyOneTimePasswordScreen: {
    oneTimePasswordType: EVerificationOneTimePasswordType;
    phoneNumber: string;
  };
  HomeScreen?: undefined;
  ContactSupportScreen?: undefined;
  MissionScreen?: undefined;
  MyRewardScreen?: undefined;
  MyRewardStoreScreen?: undefined;
  MyRewardFormScreen: {
    data: TReward;
    onRefresh(): void;
  };
  ShareUserScreen?: undefined;
  TransactionsFormScreen: {
    form: TTransactionForm;
    isEdit: boolean;
    isUsePhotoAI: boolean;
    onEdit(_id: string): void;
    onDelete(_id: string): void;
  };
  OverviewTransactionScreen: OverviewTransactionScreenParams;
  TransactionSettingsScreen?: undefined;
  TransactionAccountSwitchScreen: {
    userId: string | undefined;
    onSelect(userId: string | undefined): void;
  };
  TransactionHistoryByCategoryOrLabelScreen: {
    startTransactedAt: Date | null;
    endTransactedAt: Date | null;
    targetUserId: string;
    type: EGetTransactionsByType;
    _id: string;
  };
};

/**
 * Abstraction over the different navigation props
 */
export type AppNavigationScreenProps<
  TName extends keyof AppStackParamList = keyof AppStackParamList
> = StackScreenProps<AppStackParamList, TName>;
/**
 * Abstraction over React.FC which only allows known routes
 */
export type AppNavigationScreen<TName extends keyof AppStackParamList> = FC<
  AppNavigationScreenProps<TName>
>;

export default function Router() {
  const AppStack = createStackNavigator<AppStackParamList>();
  const options = {
    headerShown: false,
    gestureEnabled: false,
    animationEnabled: true,
  };
  return (
    <NavigationContainer<AppStackParamList> ref={navigationRef}>
      <AppStack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={{ cardStyle: { backgroundColor: Colors.white } }}
      >
        <AppStack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={options}
        />
        <AppStack.Screen
          name="MoreScreen"
          component={MoreScreen}
          options={options}
        />
        <AppStack.Screen
          name="VerifyOneTimePasswordScreen"
          component={VerifyOneTimePasswordScreen}
          options={options}
        />
        <AppStack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={options}
        />
        <AppStack.Screen
          name="ContactSupportScreen"
          component={ContactSupportScreen}
          options={options}
        />
        <AppStack.Screen
          name="MissionScreen"
          component={MissionScreen}
          options={options}
        />
        <AppStack.Screen
          name="MyRewardScreen"
          component={MyRewardScreen}
          options={options}
        />
        <AppStack.Screen
          name="MyRewardStoreScreen"
          component={MyRewardStoreScreen}
          options={options}
        />
        <AppStack.Screen
          name="ShareUserScreen"
          component={ShareUserScreen}
          options={options}
        />
        <AppStack.Screen
          name="TransactionsFormScreen"
          component={TransactionsFormScreen}
          options={options}
        />
        <AppStack.Screen
          name="OverviewTransactionScreen"
          component={OverviewTransactionScreen}
          options={options}
        />
        <AppStack.Screen
          name="TransactionSettingsScreen"
          component={TransactionSettingsScreen}
          options={options}
        />

        <AppStack.Screen
          name="MyRewardFormScreen"
          component={MyRewardFormScreen}
          options={options}
        />
        <AppStack.Screen
          name="TransactionAccountSwitchScreen"
          component={TransactionAccountSwitchScreen}
          options={options}
        />
        <AppStack.Screen
          name="TransactionHistoryByCategoryOrLabelScreen"
          component={TransactionHistoryByCategoryOrLabelScreen}
          options={options}
        />
      </AppStack.Navigator>
    </NavigationContainer>
  );
}
