import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import SizedBox from "@components/Shared/SizedBox";
import { sh, sw } from "@libs/responsive.lib";
import { FlashList } from "@shopify/flash-list";
import { Colors } from "@styles/Colors";
import React, { ReactNode, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "@libs/i18n/index";
import SearchBar from "@components/Shared/SeachBar";
import CustomText from "@components/Shared/CustomText";
import CustomButton from "@components/Shared/CustomButton";
import LoadingCircle from "@components/Shared/LoadingCircle";
import { Global } from "@styles/Global";
import NextCreateButton from "@components/Shared/NextCreateButton";
import UsageCard from "@components/Shared/UsageCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import {
  TGetTransactionLabelQuery,
  TTransactionLabel,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { useAuthStore } from "@libs/zustand/authStore";
import Form from "./form";

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

  const useGetTransactionLabelInfiniteQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["/transaction-label", searchText],
    queryFn: async ({ pageParam = 1 }) => {
      const query: TGetTransactionLabelQuery = {
        limit: 10,
        page: pageParam,
        q: searchText,
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

  const listToShow = useMemo(() => {
    let list = labels;
    if (searchText.length > 0) {
      list = labels.filter((x) =>
        x.name.toLowerCase().trim().includes(searchText.toLowerCase())
      );
    }
    return list;
  }, [labels, searchText]);

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
      const ids = transactionLabelIds.filter((id) => id != id);
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
              <Header
                onBack={() => {
                  setIsVisible(false);
                }}
              />
              <LoadingCircle
                visible={useGetTransactionLabelInfiniteQuery.isFetching}
              />

              <UsageCard
                title={t("labels")}
                currentLength={labels.length}
                maximumLength={authStore.user?.feature.maximumLabels ?? 0}
              />
              <SizedBox height={sh(10)} />
              <SearchBar
                autoFocus={true}
                placeholder={t("searchToAdd")}
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
              />
              {searchText.trim().length > 0 ? (
                <>
                  <NextCreateButton
                    searchText={searchText}
                    currentLength={labels.length}
                    maximumLength={authStore.user?.feature.maximumLabels ?? 0}
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
              <FlashList
                data={listToShow}
                ItemSeparatorComponent={() => <SizedBox height={sh(20)} />}
                renderItem={({ item }) => (
                  <View
                    style={[
                      {
                        padding: sw(10),
                        marginHorizontal: sw(15),
                        backgroundColor: Colors.white,
                        borderRadius: sw(5),
                      },
                      Global.shadowLine,
                    ]}
                  >
                    <CustomText size={"medium"} label={item.name} />
                    <View style={{ flexDirection: "row", marginLeft: "auto" }}>
                      {/* {route.params.isShowTransactions && (
                    <CustomButton
                      type={"primary"}
                      size={"small"}
                      title={t("transaction")}
                      onPress={() => {
                        if (authStore.user) {
                          navigation.replace(
                            "TransactionHistoryByCategoryOrLabelScreen",
                            {
                              type: EGetTransactionsByType.label,
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
                        type={
                          transactionLabelIds.find((x) => x == item._id)
                            ? "secondary"
                            : "primary"
                        }
                        size={"small"}
                        title={
                          transactionLabelIds.find((x) => x == item._id)
                            ? t("remove")
                            : t("choose")
                        }
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
                      />
                      <>
                        <SizedBox width={sw(10)} />
                        <CustomButton
                          type={"primary"}
                          size={"small"}
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
                      visible={useGetTransactionLabelInfiniteQuery.isLoading}
                    />
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
