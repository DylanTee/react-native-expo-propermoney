import ContainerLayout from "@components/Layout/ContainerLayout";
import Avatar from "@components/Shared/Avatar";
import CustomText from "@components/Shared/CustomText";
import Header from "@components/Shared/Header";
import SizedBox from "@components/Shared/SizedBox";
import { AxiosLibs } from "@libs/axios.lib";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import { sh, sw } from "@libs/responsive.lib";
import { displayCurrency, getAmountTextColor } from "@libs/utils";
import { ETransactionCategoryType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import {
  TGetTransactionDetailQuery,
  TTransaction,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { Colors } from "@styles/Colors";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  Image,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import dayjs from "dayjs";
import TransactionCategoryContainer from "@components/Shared/TransactionCategoryContainer";
import TransactionLabelsContainer from "@components/Shared/TransactionLabelsContainer";
import LoadingCircle from "@components/Shared/LoadingCircle";
import ModalZoomableImage from "@components/Shared/CustomModal/ModalZoomableImage";
import { useGetUserDetailQuery } from "@libs/react-query/hooks/useGetUserDetailQuery";

const TransactionDetailScreen: AppNavigationScreen<
  "TransactionDetailScreen"
> = ({ navigation, route }) => {
  const { data: user } = useGetUserDetailQuery();
  const useGetTransactionDetailQuery = useQuery({
    queryKey: ["detail", route.params.id],
    queryFn: async () => {
      const query: TGetTransactionDetailQuery = {
        id: route.params.id,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction/detail`,
        {
          params: query,
        }
      );
      return data;
    },
  });
  const detail: TTransaction | undefined =
    useGetTransactionDetailQuery.data ?? undefined;

  const fileExtension = detail?.imagePath?.split(".").pop();
  const isImage =
    fileExtension === "jpg" ||
    fileExtension === "jpeg" ||
    fileExtension === "png";

  return (
    <ContainerLayout>
      <Header
        containerStyle={{
          paddingHorizontal: sw(15),
          backgroundColor: detail ? "#EDEFEA" : "transparent",
        }}
        onBack={() => navigation.goBack()}
        itemRight={
          <>
            {detail && user?._id == detail?.userId && (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("TransactionsFormScreen", {
                    id: detail._id,
                    isEdit: true,
                    onCreate: () => {},
                    onEdit: () => {
                      useGetTransactionDetailQuery.refetch();
                    },
                    onDelete: () => {
                      navigation.goBack();
                    },
                  });
                }}
              >
                <ExpoVectorIcon
                  name="edit"
                  size={sw(20)}
                  color={Colors.black}
                />
              </TouchableOpacity>
            )}
          </>
        }
      />
      <ScrollView>
        <LoadingCircle visible={useGetTransactionDetailQuery.isFetching} />
        {detail && (
          <>
            <View
              style={{
                backgroundColor: `#EDEFEA`,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Avatar
                size="extra-big"
                profileImage={detail.user.profileImage}
              />
              <SizedBox height={sh(10)} />
              <CustomText
                size={"extra-big"}
                label={displayCurrency({
                  currency: detail.currency,
                  amount: detail.amount,
                })}
                textStyle={{
                  color: getAmountTextColor(detail.transactionCategory.type),
                }}
              />
              <SizedBox height={sh(5)} />
              <CustomText
                size={"medium"}
                label={
                  detail.transactionCategory.type ==
                  ETransactionCategoryType.expense
                    ? `Expense`
                    : `Income`
                }
              />
              <SizedBox height={sh(20)} />
              <TransactionCategoryContainer
                isDisplayIcon
                containerStyle={{ flexDirection: "row" }}
                id={detail.transactionCategory._id}
              />
              <SizedBox height={sh(20)} />
            </View>
            <SizedBox height={sh(20)} />
            <View
              style={{
                paddingHorizontal: sw(15),
              }}
            >
              <CustomText size="big" label="Transaction details" />
              <SizedBox height={sh(10)} />
              <View style={styles.bodyContainer}>
                <CustomText
                  size="medium"
                  label={`When`}
                  textStyle={{ color: Colors.matterhorn }}
                />
                <SizedBox width={sw(10)} />
                <CustomText
                  textStyle={{
                    color: Colors.matterhorn,
                  }}
                  containerStyle={{ marginLeft: "auto" }}
                  size="medium"
                  label={`${dayjs(detail.transactedAt).format("DD MMMM YYYY")}`}
                />
              </View>
              {detail.transactionLabelIds.length > 0 && (
                <View style={styles.bodyContainer}>
                  <CustomText
                    size="medium"
                    label={`Labels`}
                    textStyle={{ color: Colors.matterhorn }}
                  />
                  <SizedBox width={sw(10)} />
                  <View
                    style={{
                      marginLeft: "auto",
                    }}
                  >
                    <TransactionLabelsContainer
                      textStyle={{ color: Colors.matterhorn }}
                      ids={detail.transactionLabelIds}
                    />
                  </View>
                </View>
              )}
              {detail.note && (
                <View style={[styles.bodyContainer, { width: "100%" }]}>
                  <CustomText
                    size="medium"
                    label={`Note`}
                    textStyle={{ color: Colors.matterhorn }}
                  />
                  <SizedBox width={sw(10)} />
                  <CustomText
                    textStyle={{
                      marginLeft: "auto",
                      color: Colors.matterhorn,
                    }}
                    containerStyle={{ marginLeft: "auto", flex: 1 }}
                    size="medium"
                    label={`${detail.note}`}
                  />
                </View>
              )}
              {detail.imagePath && (
                <View style={styles.bodyContainer}>
                  {isImage ? (
                    <ModalZoomableImage
                      buttonStyle={{ flex: 1 }}
                      listComponents={
                        <>
                          <CustomText
                            label="View"
                            size="medium"
                            textStyle={{
                              color: Colors.primary,
                              textDecorationLine: "underline",
                              marginLeft: "auto",
                            }}
                          />
                        </>
                      }
                      imagePath={detail.imagePath}
                    />
                  ) : (
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => {
                        if (detail.imagePath) {
                          Linking.openURL(detail.imagePath);
                        }
                      }}
                    >
                      <CustomText
                        label="View"
                        size="medium"
                        textStyle={{
                          color: Colors.primary,
                          textDecorationLine: "underline",
                          marginLeft: "auto",
                        }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <SizedBox height={sh(20)} />
              <CustomText
                size="small"
                label={`Transaction no. #${detail._id}`}
                containerStyle={{ alignSelf: "center" }}
                textStyle={{
                  color: "#5A5A5A",
                }}
              />
              <SizedBox height={sh(20)} />
            </View>
          </>
        )}
      </ScrollView>
    </ContainerLayout>
  );
};
export default TransactionDetailScreen;

const styles = StyleSheet.create({
  bodyContainer: {
    flexDirection: "row",
    paddingVertical: sh(10),
  },
});
