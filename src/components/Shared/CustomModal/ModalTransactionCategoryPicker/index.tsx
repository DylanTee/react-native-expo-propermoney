import ContainerLayout from "@components/Layout/ContainerLayout";
import CustomTab from "@components/Shared/CustomTab";
import CustomText from "@components/Shared/CustomText";
import Header from "@components/Shared/Header";
import LoadingCircle from "@components/Shared/LoadingCircle";
import NextCreateButton from "@components/Shared/NextCreateButton";
import SizedBox from "@components/Shared/SizedBox";
import { AxiosLibs } from "@libs/axios.lib";
import { sfont, sh, sw } from "@libs/responsive.lib";
import { useAuthStore } from "@libs/zustand/authStore";
import { ETransactionCategoryType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import {
  TGetTransactionCategoryQuery,
  TTransactionCategory,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { FlashList } from "@shopify/flash-list";
import { Colors } from "@styles/Colors";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import React, {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Form from "./form";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";

export type TTransactionCategoryForm = {
  _id: string | undefined;
  type: ETransactionCategoryType;
  name: string;
  imagePath: string;
  backgroundColor: string;
};

interface ModalTransactionCategoryPickerProps {
  listComponents: ReactNode;
  buttonStyle?: ViewStyle;
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
        style={props.buttonStyle}
      >
        {props.listComponents}
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
                useGetTransactionCategoryInfiniteQuery.refetch();
              }}
              onChange={(_id) => {
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
                containerStyle={{ paddingHorizontal: sw(15) }}
                itemRight={
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
                }
                onBack={() => setIsVisible(false)}
              />

              <SizedBox height={sh(10)} />
              <View
                style={{
                  flexDirection: "row",
                  padding: sw(10),
                  paddingTop: 0,
                  paddingHorizontal: sw(15),
                  borderBottomWidth: 2,
                  borderColor: Colors.gainsboro,
                  alignItems: "center",
                }}
              >
                <ExpoVectorIcon
                  name="search1"
                  size={sw(15)}
                  color={Colors.black}
                />
                <SizedBox width={sw(10)} />
                <TextInput
                  style={{
                    width: "95%",
                    color: Colors.black,
                    fontSize: sfont(14),
                  }}
                  autoFocus={true}
                  placeholderTextColor={Colors.rocketMetalic}
                  placeholder={t("searchToAdd")}
                  value={searchText}
                  onChangeText={(text) => setSearchText(text)}
                />
              </View>
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
                  <TouchableOpacity
                    style={{
                      padding: sw(15),
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      if (handleIsLabelNotExceededMaximum(item)) {
                        props.onChange(item._id);
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
                  >
                    <View
                      style={{
                        width: sw(45),
                        height: sw(45),
                        borderRadius: sw(45) / 2,
                        padding: sw(10),
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
                        source={{ uri: item.imagePath }}
                      />
                    </View>
                    <SizedBox width={sw(10)} />
                    <CustomText
                      containerStyle={{ flex: 1 }}
                      label={item.name}
                      size="medium"
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setForm(item);
                        setIsVisibleForm(true);
                      }}
                    >
                      <ExpoVectorIcon
                        name="edit"
                        size={sw(20)}
                        color={Colors.suvaGrey}
                      />
                    </TouchableOpacity>
                    <SizedBox width={sw(20)} />
                    <View
                      style={{
                        borderWidth: 2,
                        borderColor:
                          props.id == item._id ? "#1D3600" : Colors.suvaGrey,
                        padding: sw(2),
                        borderRadius: sw(100 / 2),
                      }}
                    >
                      <View
                        style={{
                          width: sw(10),
                          height: sw(10),
                          backgroundColor:
                            props.id == item._id ? "#1D3600" : "transparent",
                          borderRadius: sw(100 / 2),
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                estimatedItemSize={30}
                ListFooterComponent={
                  <>
                    <LoadingCircle
                      visible={useGetTransactionCategoryInfiniteQuery.isLoading}
                    />
                    <SizedBox height={sh(60)} />
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
