import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { sfont, sh, sw } from "@libs/responsive.lib";
import {
  TTransaction,
  TTimelineTransaction,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { View } from "react-native";
import SizedBox from "@components/Shared/SizedBox";
import { Colors } from "@styles/Colors";
import { useNavigation } from "@react-navigation/native";
import { AppStackNavigationProp } from "@libs/react.navigation.lib";
import dayjs from "dayjs";
import TransactionCard from "@components/Shared/Card/TransactionCard";
import { displayCurrency } from "@libs/utils";
import CustomText from "@components/Shared/CustomText";
import { EOverviewTransactionsReport } from "@screens/OverviewTransactionScreen";

interface TransactionListingsProps {
  selectedReport: EOverviewTransactionsReport;
  transactions: TTransaction[];
  timelineTransactions: TTimelineTransaction[];
}

export default function TransactionListings({
  selectedReport,
  transactions,
  timelineTransactions,
}: TransactionListingsProps) {
  const navigation = useNavigation<AppStackNavigationProp>();
  const handleCardClick = (y: TTransaction) => {
    navigation.navigate("TransactionDetailScreen", {
      id: y._id,
    });
  };
  const list = useMemo(() => {
    return timelineTransactions.filter((z) => z.records.length > 0).reverse();
  }, [timelineTransactions]);

  const totalCount = useMemo(() => {
    return list
      .map((z) => z.records)
      .reduce((result, currentArray) => {
        return result.concat(currentArray);
      }, []).length;
  }, [list]);
  return (
    <>
      {selectedReport == "Transactions" && (
        <>
          <SizedBox height={sh(20)} />
          <CustomText size={"medium"} label={`Result: ${totalCount}`} />
          <SizedBox height={sh(10)} />
          {transactions.length > 0 && (
            <View style={styles.container}>
              {list.map((x) => (
                <View key={x.date} style={styles.card}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: sw(10),
                    }}
                  >
                    <View style={{ flexDirection: "row", flex: 1 }}>
                      <CustomText
                        size={"big"}
                        label={dayjs(x.date).format("DD")}
                      />
                      <SizedBox width={sw(5)} />
                      <View
                        style={{
                          backgroundColor: "gray",
                          borderRadius: 5,
                          justifyContent: "center",
                          alignItems: "center",
                          paddingHorizontal: sw(5),
                        }}
                      >
                        <CustomText
                          size={"medium"}
                          label={dayjs(x.date).format("ddd")}
                          textStyle={{
                            color: Colors.white,
                          }}
                        />
                      </View>
                    </View>
                    <View style={{}}>
                      {x.totalCurrenciesIncomeAndExpenses.map((data) => (
                        <View style={{ flexDirection: "row" }}>
                          <CustomText
                            size={"medium"}
                            label={displayCurrency({
                              currency: data.currency,
                              amount: data.totalIncomes,
                            })}
                            textStyle={{
                              color: Colors.green,
                              textAlign: "right",
                            }}
                          />
                          <SizedBox width={sw(10)} />
                          <CustomText
                            size={"medium"}
                            label={displayCurrency({
                              currency: data.currency,
                              amount: data.totalExpenses,
                            })}
                            textStyle={{
                              fontSize: sfont(12),
                              color: Colors.red,
                              textAlign: "right",
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                  <SizedBox height={sh(10)} />
                  {x.records.map((y) => (
                    <TransactionCard
                      key={y._id}
                      data={y}
                      onPress={() => handleCardClick(y)}
                    />
                  ))}
                  <SizedBox height={sh(20)} />
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {},
  containerButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  label: {
    lineHeight: sh(15),
    color: Colors.black,
  },
  image: {
    width: sh(80),
    height: sh(80),
    alignSelf: "center",
  },
});
