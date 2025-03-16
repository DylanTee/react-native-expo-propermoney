import { AxiosLibs } from "@libs/axios.lib";
import { sw } from "@libs/responsive.lib";
import { TTransactionCategory } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Image, TextStyle, View, ViewStyle } from "react-native";
import SizedBox from "./SizedBox";
import CustomText from "./CustomText";
import { Colors } from "@styles/Colors";

interface TransactionCategoryContainerProps {
  id: string | undefined;
  isDisplayIcon?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function TransactionCategoryContainer(
  props: TransactionCategoryContainerProps
) {
  const useGetTransactionCategoryDetailQuery = useQuery({
    queryKey: ["transaction-category/detail", props.id],
    queryFn: async () => {
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction-category/detail`,
        {
          params: {
            id: props.id,
          },
        }
      );
      return data;
    },
    enabled: props.id != undefined,
  });
  const detail: TTransactionCategory | undefined =
    useGetTransactionCategoryDetailQuery.data ?? undefined;

  return (
    <View style={props.containerStyle}>
      {props.isDisplayIcon && props.isDisplayIcon ? (
        <>
          <View
            style={{
              width: sw(25),
              height: sw(25),
              borderRadius: sw(25) / 2,
              padding: sw(5),
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: detail?.backgroundColor ?? Colors.gainsboro,
            }}
          >
            <Image
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                zIndex: 1,
              }}
              source={{ uri: detail?.imagePath ?? `` }}
            />
          </View>
          <SizedBox width={sw(5)} />
        </>
      ) : (
        <></>
      )}
      <CustomText
        size="medium"
        textStyle={props.textStyle}
        label={detail?.name ?? `Select`}
      />
    </View>
  );
}
