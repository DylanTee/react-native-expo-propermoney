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
import { Image, View, TouchableOpacity, ScrollView } from "react-native";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import ModalImagePicker from "@components/Shared/CustomModal/ModalImagePicker";
import ModalZoomableImage from "@components/Shared/CustomModal/ModalZoomableImage";

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
        title={t("back")}
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
              <SizedBox height={sh(20)} />
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
              <View style={{ flexDirection: "row", gap: sw(10) }}>
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
              <CustomText
                size="medium"
                label={`${detail.note}`}
                textStyle={{
                  color: "#5A5A5A",
                }}
              />
              {detail.imagePath && (
                <>
                  <SizedBox height={sh(20)} />
                  <ModalZoomableImage
                    buttonStyle={{}}
                    listComponents={
                      <>
                        <Image
                          style={{
                            width: sw(100),
                            height: sw(100),
                            objectFit: "cover",
                          }}
                          source={{ uri: detail.imagePath }}
                        />
                      </>
                    }
                    imagePath={detail.imagePath ?? ``}
                  />
                  <SizedBox height={sh(10)} />
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ContainerLayout>
  );
};
export default TransactionDetailScreen;
