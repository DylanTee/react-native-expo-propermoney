import ContainerLayout from "@components/Layout/ContainerLayout";
import Avatar from "@components/Shared/Avatar";
import CustomText from "@components/Shared/CustomText";
import Header from "@components/Shared/Header";
import LoadingCircle from "@components/Shared/LoadingCircle";
import SizedBox from "@components/Shared/SizedBox";
import { AxiosLibs } from "@libs/axios.lib";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import { sh, sw } from "@libs/responsive.lib";
import { displayCurrency, getAmountTextColor } from "@libs/utils";
import { useAuthStore } from "@libs/zustand/authStore";
import { ETransactionCategoryType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import {
  TGetTransactionDetailQuery,
  TTransaction,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { Colors } from "@styles/Colors";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import ModalZoomableImage from "@components/Shared/CustomModal/ModalZoomableImage";
import dayjs from "dayjs";

const TransactionDetailScreen: AppNavigationScreen<
  "TransactionDetailScreen"
> = ({ navigation, route }) => {
  const authStore = useAuthStore();
  const { t } = useTranslation();
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
  return (
    <ContainerLayout>
      <Header
        containerStyle={{
          paddingHorizontal: sw(15),
          backgroundColor: "#EDEFEA",
        }}
        onBack={() => navigation.goBack()}
        itemRight={
          <>
            {detail && authStore.user?._id == detail?.userId && (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("TransactionsFormScreen", {
                    form: {
                      _id: detail._id,
                      transactionCategoryId: detail.transactionCategoryId,
                      transactionLabelIds: detail.transactionLabelIds,
                      transactedAt: new Date(detail.transactedAt),
                      currency: detail.currency,
                      amount: detail.amount.toString(),
                      imagePath: detail.imagePath,
                      note: detail.note ?? "",
                    },
                    isEdit: true,
                    isUsePhotoAI: false,
                    onEdit: () => {},
                    onDelete: () => {},
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
                profileImage={
                  detail.userId == authStore.user?._id
                    ? authStore.user.profileImage
                    : authStore.user?.sharedUserInfo?.profileImage ?? ""
                }
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
              <View
                style={{
                  flexDirection: "row",
                  gap: sw(10),
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: sw(25),
                    height: sw(25),
                    borderRadius: sw(25) / 2,
                    padding: sw(5),
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor:
                      detail.transactionCategory.backgroundColor.trim().length >
                      0
                        ? detail.transactionCategory.backgroundColor
                        : Colors.gainsboro,
                  }}
                >
                  <Image
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      zIndex: 1,
                    }}
                    source={{ uri: detail.transactionCategory.imagePath }}
                  />
                </View>
                <CustomText
                  size={"medium"}
                  label={detail.transactionCategory.name}
                />
              </View>
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
              {detail.transactionLabelIds.length > 0 && (
                <View style={styles.bodyContainer}>
                  <CustomText
                    size="medium"
                    label={`Labels`}
                    textStyle={{ color: `#545454` }}
                  />
                  <SizedBox width={sw(10)} />
                  <CustomText
                    textStyle={{
                      color: "#5A5A5A",
                    }}
                    containerStyle={{ marginLeft: "auto" }}
                    size="medium"
                    label={`${detail.transactionLabels
                      ?.map((label) => label.name)
                      .join(", ")}`}
                  />
                </View>
              )}

              <View style={styles.bodyContainer}>
                <CustomText
                  size="medium"
                  label={`When`}
                  textStyle={{ color: `#545454` }}
                />
                <SizedBox width={sw(10)} />
                <CustomText
                  textStyle={{
                    color: "#5A5A5A",
                  }}
                  containerStyle={{ marginLeft: "auto" }}
                  size="medium"
                  label={`${dayjs(detail.transactedAt).format("DD MMMM YYYY")}`}
                />
              </View>
              {detail.note && (
                <View style={styles.bodyContainer}>
                  <CustomText
                    size="medium"
                    label={`Note`}
                    textStyle={{ color: `#545454` }}
                  />
                  <SizedBox width={sw(10)} />
                  <CustomText
                    textStyle={{
                      color: "#5A5A5A",
                    }}
                    containerStyle={{ marginLeft: "auto" }}
                    size="medium"
                    label={`${detail.note}`}
                  />
                </View>
              )}
              {detail.imagePath && (
                <View style={styles.bodyContainer}>
                  <CustomText
                    size="medium"
                    label={`Image`}
                    textStyle={{ color: `#545454` }}
                  />
                  <ModalZoomableImage
                    buttonStyle={{
                      borderWidth: 1,
                      borderColor: `#8B8B8B`,
                      borderRadius: sw(5),
                      marginLeft: "auto",
                    }}
                    listComponents={
                      <>
                        <Image
                          style={{
                            width: sw(100),
                            height: sw(100),
                            objectFit: "cover",
                            borderRadius: sw(5),
                          }}
                          source={{ uri: detail.imagePath }}
                        />
                      </>
                    }
                    imagePath={detail.imagePath ?? ``}
                  />
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
      <LoadingCircle visible={useGetTransactionDetailQuery.isFetching} />
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
