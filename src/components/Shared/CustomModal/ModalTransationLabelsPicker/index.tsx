import ContainerLayout from "@components/Layout/ContainerLayout";
import SizedBox from "@components/Shared/SizedBox";
import { sfont, sh, sw } from "@libs/responsive.lib";
import { FlashList } from "@shopify/flash-list";
import { Colors } from "@styles/Colors";
import React, { ReactNode, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTranslation } from "@libs/i18n/index";
import CustomText from "@components/Shared/CustomText";
import LoadingCircle from "@components/Shared/LoadingCircle";
import NextCreateButton from "@components/Shared/NextCreateButton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import {
  TGetTransactionLabelQuery,
  TTransactionLabel,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { useAuthStore } from "@libs/zustand/authStore";
import Form from "./form";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import useDebounce from "@libs/hooks/useDebounce";

export type TTransactionLabelForm = {
  _id: string | undefined;
  name: string;
};

interface ModalTransationLabelsPickerProps {
  userId: string;
  buttonStyle?: ViewStyle;
  ids: string[];
  listComponent: ReactNode;
  onChange(ids: string[]): void;
}

const initialFormState: TTransactionLabelForm = {
  _id: undefined,
  name: "",
};

export default function ModalTransationLabelsPicker(
  props: ModalTransationLabelsPickerProps
) {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const [transactionLabelIds, setTransactionLabelIds] = useState<string[]>(
    props.ids
  );
  const [searchText, setSearchText] = useState<string>("");
  const debounceSearchText = useDebounce(searchText, 500);
  const useGetTransactionLabelInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["/transaction-label", debounceSearchText, props.userId],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetTransactionLabelQuery = {
        limit: 10,
        page: pageParam,
        q: debounceSearchText,
        userId: props.userId,
      };
      const { data } = await AxiosLibs.defaultClient.get(`/transaction-label`, {
        params: query,
      });
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const hasNextPage = lastPage.pagination.has_next_page;
      return hasNextPage ? allPages.length + 1 : undefined;
    },
  });

  const labels: TTransactionLabel[] =
    useGetTransactionLabelInfiniteQuery.data?.pages.flatMap((page) => {
      return page.data;
    }) ?? [];

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isVisibleForm, setIsVisibleForm] = useState<boolean>(false);
  const [form, setForm] = useState<TTransactionLabelForm>(initialFormState);

  useEffect(() => {
    setTransactionLabelIds(props.ids);
  }, [props.ids]);

  const handleIds = (id: string) => {
    const exitPicker = (ids: string[]) => {
      setTransactionLabelIds(ids);
      props.onChange(ids);
      setIsVisibleForm(false);
      setIsVisible(false);
    };
    useGetTransactionLabelInfiniteQuery.refetch();
    if (transactionLabelIds.find((x) => x == id)) {
      const ids = transactionLabelIds.filter((z) => z != id);
      exitPicker(ids);
    } else if (transactionLabelIds.length >= 5) {
      Alert.alert("Maximum");
    } else {
      const ids = [...transactionLabelIds, id];
      exitPicker(ids);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={props.buttonStyle}
        onPress={() => {
          setIsVisible(true);
          setSearchText("");
        }}
      >
        {props.listComponent}
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

                useGetTransactionLabelInfiniteQuery.refetch();
              }}
              onChange={(_id) => handleIds(_id)}
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
              <SizedBox height={sh(15)} />
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
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: sw(40),
                    height: sw(40),
                    borderRadius: sw(40 / 2),
                    backgroundColor: "#DDE0DA",
                  }}
                  onPress={() => {
                    setIsVisible(false);
                    setSearchText("");
                  }}
                >
                  <ExpoVectorIcon
                    name={"close"}
                    size={sw(20)}
                    color={Colors.black}
                  />
                </TouchableOpacity>
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
                data={labels}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      padding: sw(20),
                      alignItems: "center",
                    }}
                    onPress={() => {
                      handleIds(item._id);
                    }}
                  >
                    <CustomText
                      containerStyle={{ flex: 1 }}
                      label={item.name}
                      size="medium"
                    />
                    {item.userId == authStore.user?._id && (
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
                        borderColor: props.ids.includes(item._id)
                          ? "#1D3600"
                          : Colors.suvaGrey,
                        padding: sw(2),
                        borderRadius: sw(100 / 2),
                      }}
                    >
                      <View
                        style={{
                          width: sw(10),
                          height: sw(10),
                          backgroundColor: props.ids.includes(item._id)
                            ? "#1D3600"
                            : "transparent",
                          borderRadius: sw(100 / 2),
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                estimatedItemSize={30}
                ListFooterComponent={
                  <>
                    {searchText.trim().length > 0 &&
                    labels.find(
                      (z) => z.name.toLowerCase() == searchText.toLowerCase()
                    ) == undefined &&
                    useGetTransactionLabelInfiniteQuery.isSuccess ? (
                      <>
                        <NextCreateButton
                          searchText={searchText}
                          currentLength={labels.length}
                          maximumLength={
                            authStore.user?.feature.maximumLabels ?? 0
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
                    <LoadingCircle
                      visible={useGetTransactionLabelInfiniteQuery.isLoading}
                    />
                    <SizedBox height={sh(20)} />
                  </>
                }
                onEndReached={() => {
                  if (useGetTransactionLabelInfiniteQuery.hasNextPage) {
                    useGetTransactionLabelInfiniteQuery.fetchNextPage();
                  }
                }}
                keyExtractor={(item) => item._id}
              />
            </View>
          </ContainerLayout>
        )}
      </Modal>
    </>
  );
}
