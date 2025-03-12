import ContainerLayout from "@components/Layout/ContainerLayout";
import CustomButton from "@components/Shared/CustomButton";
import CustomItemPicker from "@components/Shared/CustomItemPicker";
import CustomTab from "@components/Shared/CustomTab";
import CustomText from "@components/Shared/CustomText";
import Header from "@components/Shared/Header";
import LoadingCircle from "@components/Shared/LoadingCircle";
import NextCreateButton from "@components/Shared/NextCreateButton";
import SearchBar from "@components/Shared/SeachBar";
import SizedBox from "@components/Shared/SizedBox";
import UsageCard from "@components/Shared/UsageCard";
import { AxiosLibs } from "@libs/axios.lib";
import { sh, sw } from "@libs/responsive.lib";
import { useAuthStore } from "@libs/zustand/authStore";
import { ETransactionCategoryType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import {
  TGetTransactionCategoryQuery,
  TTransactionCategory,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { FlashList } from "@shopify/flash-list";
import { Colors } from "@styles/Colors";
import { Global } from "@styles/Global";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import React, {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import Form from "./form";

export type TTransactionCategoryForm = {
  _id: string | undefined;
  type: ETransactionCategoryType;
  name: string;
  imagePath: string;
  backgroundColor: string;
};

interface ModalTransactionCategoryPickerProps {
  id: string | null;
  onChange(id: string): void;
}

const initialFormState: TTransactionCategoryForm = {
  _id: undefined,
  type: ETransactionCategoryType.expense,
  name: "",
  imagePath: "",
  backgroundColor: "",
};

export default function ModalTransactionCategoryPicker(
  props: ModalTransactionCategoryPickerProps
) {
  const authStore = useAuthStore();
  const { t } = useTranslation();
  const [transasctionCategoryId, setTransasctionCategoryId] = useState<
    string | null
  >(props.id);
  const useGetTransactionCategoryDetailQuery = useQuery({
    queryKey: ["transaction-category/detail", transasctionCategoryId],
    queryFn: async () => {
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction-category/detail`,
        {
          params: {
            id: transasctionCategoryId,
          },
        }
      );
      return data;
    },
    enabled: transasctionCategoryId != null,
  });
  const detail: TTransactionCategory | undefined =
    useGetTransactionCategoryDetailQuery.data ?? undefined;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isVisibleForm, setIsVisibleForm] = useState<boolean>(false);
  const [form, setForm] = useState<TTransactionCategoryForm>(initialFormState);
  const [searchText, setSearchText] = useState<string>("");
  const [categoryType, setCategoryType] = useState<ETransactionCategoryType>(
    ETransactionCategoryType.expense
  );
  const useGetTransactionCategoryInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["/transaction-category", categoryType, searchText],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetTransactionCategoryQuery = {
        limit: 10,
        page: pageParam,
        q: searchText,
        type: categoryType,
      };
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction-category`,
        {
          params: query,
        }
      );
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const hasNextPage = lastPage.pagination.has_next_page;
      return hasNextPage ? allPages.length + 1 : undefined;
    },
  });

  const categories: TTransactionCategory[] =
    useGetTransactionCategoryInfiniteQuery.data?.pages.flatMap((page) => {
      return page.data;
    }) ?? [];

  const handleIsLabelNotExceededMaximum = (item: TTransactionCategory) => {
    const index = categories.findIndex((x) => x._id == item._id);
    if (authStore.user) {
      return authStore.user.feature.maximumCategories > index;
    } else {
      return false;
    }
  };
  const categoriesLength =
    useGetTransactionCategoryInfiniteQuery?.data?.pages[0].pagination
      .total_items ?? 0;
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setIsVisible(true);
          setSearchText("");
        }}
      >
        <CustomItemPicker
          isRequired={transasctionCategoryId == null}
          title={t("category")}
          itemLeft={<></>}
          pickedText={`${detail?.name ?? `Select...`}`}
        />
      </TouchableOpacity>
      <Modal animationType="slide" visible={isVisible}>
        {isVisibleForm ? (
          <View
            style={{
              flex: 1,
              paddingTop: Platform.OS === "android" ? 0 : sw(50),
            }}
          >
            <Form
              form={form}
              onClose={() => {
                setIsVisibleForm(false);
                setIsVisible(false);
                useGetTransactionCategoryDetailQuery.refetch();
                useGetTransactionCategoryInfiniteQuery.refetch();
              }}
              onChange={(_id) => {
                setTransasctionCategoryId(_id);
                useGetTransactionCategoryDetailQuery.refetch();
                useGetTransactionCategoryInfiniteQuery.refetch();
                props.onChange(_id);
                setIsVisibleForm(false);
                setIsVisible(false);
              }}
            />
          </View>
        ) : (
          <ContainerLayout>
            <View
              style={{
                flex: 1,
                paddingTop: Platform.OS === "android" ? 0 : sw(50),
              }}
            >
              <Header
                onBack={() => setIsVisible(false)}
              />
              <LoadingCircle
                visible={
                  useGetTransactionCategoryDetailQuery.isFetching ||
                  useGetTransactionCategoryInfiniteQuery.isFetching
                }
              />
              <>
                <UsageCard
                  title={t("categories")}
                  currentLength={categoriesLength}
                  maximumLength={authStore.user?.feature.maximumCategories ?? 0}
                />
                <SizedBox height={sh(10)} />
                <CustomTab
                  value={categoryType}
                  data={[
                    {
                      label: t("income"),
                      value: ETransactionCategoryType.income,
                    },
                    {
                      label: t("expenses"),
                      value: ETransactionCategoryType.expense,
                    },
                  ]}
                  onChange={(data) =>
                    setCategoryType(data as ETransactionCategoryType)
                  }
                />
                <SizedBox height={sh(10)} />
                <SearchBar
                  autoFocus={true}
                  placeholder={t("searchToAdd")}
                  value={searchText}
                  onChangeText={(text) => setSearchText(text)}
                />
                <SizedBox height={sh(20)} />
              </>
              {searchText.trim().length > 0 &&
              categories.length == 0 &&
              useGetTransactionCategoryInfiniteQuery.isSuccess ? (
                <>
                  <NextCreateButton
                    searchText={searchText}
                    currentLength={categoriesLength}
                    maximumLength={
                      authStore.user?.feature.maximumCategories ?? 0
                    }
                    onNext={() => {
                      setForm((prevState) => ({
                        ...prevState,
                        _id: undefined,
                        name: searchText,
                      }));
                      setIsVisibleForm(true);
                    }}
                  />
                </>
              ) : (
                <></>
              )}
              <FlashList
                data={categories}
                ItemSeparatorComponent={() => <SizedBox height={sw(20)} />}
                renderItem={({ item }) => (
                  <View
                    style={[
                      Global.shadowLine,
                      {
                        padding: sw(10),
                        backgroundColor: Colors.white,
                        marginHorizontal: sw(15),
                      },
                    ]}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: sw(30),
                          height: sw(30),
                          borderRadius: sw(50) / 2,
                          padding: sw(5),
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: item.backgroundColor,
                        }}
                      >
                        <Image
                          style={{
                            width: "100%",
                            height: "100%",
                            position: "absolute",
                            zIndex: 1,
                          }}
                          resizeMode="contain"
                          source={{ uri: item.imagePath }}
                        />
                      </View>
                      <SizedBox width={sw(10)} />
                      <CustomText size={`medium`} label={item.name} />
                    </View>
                    <View style={{ flexDirection: "row", marginLeft: "auto" }}>
                      {/* {route.params.isShowTransactions && (
              <CustomButton
                type={"primary"}
                size="small"
                title={t("transaction")}
                onPress={() => {
                  if (authStore.user) {
                    navigation.replace(
                      "TransactionHistoryByCategoryOrLabelScreen",
                      {
                        type: EGetTransactionsByType.category,
                        _id: item._id,
                        targetUserId: authStore.user._id,
                        startTransactedAt: null,
                        endTransactedAt: null,
                      }
                    );
                  }
                }}
              />
            )} */}

                      <CustomButton
                        type={"primary"}
                        size="small"
                        title={t("choose")}
                        onPress={() => {
                          if (handleIsLabelNotExceededMaximum(item)) {
                            props.onChange(item._id);
                            setTransasctionCategoryId(item._id);
                            setIsVisible(false);
                          } else {
                            Alert.alert(
                              "Upgrade",
                              `In order to choose ${item.name}`,
                              [
                                {
                                  text: t("ok"),
                                  onPress: () => {
                                    Linking.openURL(
                                      `https://pr0per.vercel.app/topup?projectId=propermoney`
                                    );
                                  },
                                  style: "cancel",
                                },
                              ],
                              { cancelable: false }
                            );
                          }
                        }}
                      />
                      <>
                        <SizedBox width={sw(10)} />
                        <CustomButton
                          type={"primary"}
                          size="small"
                          title={t("edit")}
                          onPress={() => {
                            setForm(item);
                            setIsVisibleForm(true);
                          }}
                        />
                      </>
                    </View>
                  </View>
                )}
                estimatedItemSize={30}
                ListFooterComponent={
                  <>
                    <LoadingCircle
                      visible={useGetTransactionCategoryInfiniteQuery.isLoading}
                    />
                  </>
                }
                onEndReached={() => {
                  if (useGetTransactionCategoryInfiniteQuery.hasNextPage) {
                    useGetTransactionCategoryInfiniteQuery.fetchNextPage();
                  }
                }}
              />
            </View>
          </ContainerLayout>
        )}
      </Modal>
    </>
  );
}
