import ContainerLayout from "@components/Layout/ContainerLayout";
import SizedBox from "@components/Shared/SizedBox";
import { sfont, sh, sw } from "@libs/responsive.lib";
import { FlashList } from "@shopify/flash-list";
import { Colors } from "@styles/Colors";
import React, { ReactNode, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
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
    queryKey: ["/transaction-label", debounceSearchText],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetTransactionLabelQuery = {
        limit: 10,
        page: pageParam,
        q: debounceSearchText,
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

  const handleIsLabelNotExceededMaximum = (item: TTransactionLabel) => {
    const index = labels.findIndex((x) => x._id == item._id);
    if (authStore.user) {
      return authStore.user.feature.maximumLabels > index;
    } else {
      return false;
    }
  };

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
                      if (handleIsLabelNotExceededMaximum(item)) {
                        handleIds(item._id);
                      } else {
                        Alert.alert(
                          "Upgrade",
                          `In order to choose ${item.name}`,
                          [
                            {
                              text: t("ok"),
                              onPress: () => {
                                Linking.openURL(
                                  `https://pr0per.vercel.app/topup?projectId=propermoney&userId=${authStore.user?._id}`
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
