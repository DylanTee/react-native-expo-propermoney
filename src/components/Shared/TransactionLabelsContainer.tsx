import React from "react";
import CustomText from "./CustomText";
import { useQuery } from "@tanstack/react-query";
import { AxiosLibs } from "@libs/axios.lib";
import { TTransactionLabel } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";

interface TransactionLabelsContainerProps {
  ids: string[];
}

export default function TransactionLabelsContainer(
  props: TransactionLabelsContainerProps
) {
  const useGetTransactionLabelDetailsQuery = useQuery({
    queryKey: ["details", props.ids],
    queryFn: async () => {
      const { data } = await AxiosLibs.defaultClient.get(
        `/transaction-label/details`,
        {
          params: {
            ids: props.ids,
          },
        }
      );
      return data;
    },
    enabled: props.ids.length > 0,
  });
  const details: TTransactionLabel[] =
    useGetTransactionLabelDetailsQuery.data ?? [];

  return (
    <CustomText
      textStyle={{
        color: "#5A5A5A",
      }}
      containerStyle={{ marginLeft: "auto" }}
      size="medium"
      label={`${details?.map((label) => label.name).join(", ")}`}
    />
  );
}
