import ContainerLayout from "@components/Layout/ContainerLayout";
import CustomTab from "@components/Shared/CustomTab";
import CustomText from "@components/Shared/CustomText";
import Header from "@components/Shared/Header";
import LoadingCircle from "@components/Shared/LoadingCircle";
import NextCreateButton from "@components/Shared/NextCreateButton";
import SizedBox from "@components/Shared/SizedBox";
import { AxiosLibs } from "@libs/axios.lib";
import { sfont, sh, sw } from "@libs/responsive.lib";
import { ETransactionCategoryType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import {
  TGetTransactionCategoryQuery,
  TTransactionCategory,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { FlashList } from "@shopify/flash-list";
import { Colors } from "@styles/Colors";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import React, {
  Image,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Form from "./form";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import useDebounce from "@libs/hooks/useDebounce";
import { useGetUserDetailQuery } from "@libs/react-query/hooks/useGetUserDetailQuery";
import { AsyncStorageLib } from "@libs/async.storage.lib";

export type TTransactionCategoryForm = {
  _id: string | undefined;
  type: ETransactionCategoryType;
  name: string;
  imagePath: string;
  backgroundColor: string;
};

interface ModalTransactionCategoryPickerProps {
  userId: string;
  listComponents: ReactNode;
  buttonStyle?: ViewStyle;
  id: string | undefined;
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
  const { data: user } = useGetUserDetailQuery();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isVisibleForm, setIsVisibleForm] = useState<boolean>(false);
  const [form, setForm] = useState<TTransactionCategoryForm>(initialFormState);
  const [searchText, setSearchText] = useState<string>("");
  const debounceSearchText = useDebounce(searchText, 500);
  const [categoryType, setCategoryType] = useState<ETransactionCategoryType>(
    ETransactionCategoryType.expense
  );
  const useGetTransactionCategoryInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [
      "/transaction-category",
      categoryType,
      debounceSearchText,
      props.userId,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetTransactionCategoryQuery = {
        userId: props.userId,
        limit: 10,
        page: pageParam,
        q: debounceSearchText,
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

  const categoriesLength =
    useGetTransactionCategoryInfiniteQuery?.data?.pages[0].pagination
      .total_items ?? 0;

  useEffect(() => {
    AsyncStorageLib.setTransactionCategories(categories);
  }, [categories]);
  
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
                      props.onChange(item._id);
                      setIsVisible(false);
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
                    {item.userId == user?._id && (
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
                    )}
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
                      containerStyle={{ margin: sw(20) }}
                      visible={useGetTransactionCategoryInfiniteQuery.isLoading}
                    />
                    {searchText.trim().length > 0 &&
                    categories.find(
                      (z) => z.name.toLowerCase() == searchText.toLowerCase()
                    ) == undefined &&
                    useGetTransactionCategoryInfiniteQuery.isSuccess ? (
                      <>
                        <NextCreateButton
                          searchText={searchText}
                          currentLength={categoriesLength}
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
                    <SizedBox height={sh(20)} />
                  </>
                }
                ListEmptyComponent={
                  <CustomText
                    label="No Result"
                    size="medium"
                    containerStyle={{ margin: sw(20) }}
                  />
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
