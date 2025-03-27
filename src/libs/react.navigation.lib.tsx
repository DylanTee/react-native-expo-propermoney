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
import { EVerificationOneTimePasswordType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import MoreScreen from "@screens/MoreScreen";
import LoginScreen from "@screens/LoginScreen";
import VerifyOneTimePasswordScreen from "@screens/VerifyOneTimePasswordScreen";
import HomeScreen from "@screens/HomeScreen";
import ContactSupportScreen from "@screens/ContactSupportScreen";
import MissionScreen from "@screens/MissionScreen";
import MyRewardScreen from "@screens/MyRewardScreen";
import MyRewardStoreScreen from "@screens/MyRewardStoreScreen";
import MyRewardFormScreen from "@screens/MyRewardFormScreen";
import ShareUserScreen from "@screens/ShareUserScreen";
import TransactionsFormScreen from "@screens/TransactionsFormScreen";
import OverviewTransactionScreen from "@screens/OverviewTransactionScreen";
import TransactionSettingsScreen from "@screens/TransactionSettingsScreen";
import TransactionAccountSwitchScreen from "@screens/TransactionAccountSwitchScreen";
import { TReward } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import TransactionDetailScreen from "@screens/TransactionDetailScreen";
import DashboardScreen from "@screens/DashboardScreen";
import PhotoAIScreen from "@screens/PhotoAIScreen";

export type OverviewTransactionScreenParams = {
  targetUserId: string | undefined;
  startTransactedAt: undefined | Date;
  endTransactedAt: undefined | Date;
  transactionCategoryId: string | undefined;
};

export type TransactionDetailScreenParams = {
  id: string;
};

export const navigationRef = createNavigationContainerRef<AppStackParamList>();
export type AppStackNavigationProp = StackNavigationProp<AppStackParamList>;
export type AppStackParamList = {
  LoginScreen?: undefined;
  MoreScreen?: undefined;
  DashboardScreen: {
    targetUserId: string;
  };
  PhotoAIScreen?: undefined;
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
  TransactionDetailScreen: TransactionDetailScreenParams;
  TransactionsFormScreen: {
    id: string | undefined;
    isEdit: boolean;
    dataFromPhotoAIScreen?:
      | {
          amount: string | undefined;
          currency: string | undefined;
          note: string | undefined;
          imagePath: string;
        }
      | undefined;
    onEdit(_id: string): void;
    onDelete(_id: string): void;
  };
  OverviewTransactionScreen: OverviewTransactionScreenParams;
  TransactionSettingsScreen?: undefined;
  TransactionAccountSwitchScreen: {
    userId: string | undefined;
    onSelect(userId: string | undefined): void;
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
          name="DashboardScreen"
          component={DashboardScreen}
          options={options}
        />
        <AppStack.Screen
          name="PhotoAIScreen"
          component={PhotoAIScreen}
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
          name="TransactionDetailScreen"
          component={TransactionDetailScreen}
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
      </AppStack.Navigator>
    </NavigationContainer>
  );
}
