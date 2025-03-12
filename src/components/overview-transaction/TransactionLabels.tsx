import React, { useMemo, useState } from "react";
import { useTranslation } from "@libs/i18n/index";
import { sh } from "@libs/responsive.lib";
import { TTransactionLabel,TTransaction } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import SizedBox from "@components/Shared/SizedBox";
import { ETransactionCategoryType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import TransactionLabelCard from "@components/Shared/TransactionLabelCard";
import CustomText from "@components/Shared/CustomText";
import CustomTab from "@components/Shared/CustomTab";
import { EOverviewTransactionsReport } from "@screens/OverviewTransactionScreen";

interface TransactionLabelsProps {
  selectedReport: EOverviewTransactionsReport;
  transactions: TTransaction[];
  transactionLabels: TTransactionLabel[];
  handlePress({
    labelId,
    targetUserId,
  }: {
    labelId: string;
    targetUserId: string;
  }): void;
}
export default function TransactionLabels({
  selectedReport,
  transactions,
  transactionLabels,
  handlePress,
}: TransactionLabelsProps) {
  const { t } = useTranslation();
  const [categoryType, setCategoryType] = useState<ETransactionCategoryType>(
    ETransactionCategoryType.expense
  );
  const currencies = [...new Set(transactions.map((data) => data.currency))];
  const list = useMemo(() => {
    return transactionLabels
      .map((data) => ({
        ...data,
        transactions: transactions.filter(
          (x) =>
            x.transactionCategory.type == categoryType &&
            x.transactionLabelIds.filter((y) => y == data._id).length > 0
        ),
        totalCurrenciesIncomeAndExpenses: currencies.map((currency) => ({
          currency,
          totalIncomes: transactions
            .filter((x) => x.transactionLabelIds.find((z) => z == data._id))
            .filter(
              (y) =>
                y.currency == currency &&
                y.transactionCategory.type == ETransactionCategoryType.income
            )
            .map((i) => i.amount)
            .reduce((a, b) => a + b, 0),
          totalExpenses: transactions
          .filter((x) => x.transactionLabelIds.find((z) => z == data._id))
            .filter(
              (y) =>
                y.currency == currency &&
                y.transactionCategory.type == ETransactionCategoryType.expense
            )
            .map((i) => i.amount)
            .reduce((a, b) => a + b, 0),
        })),
      }))
      .sort(
        (a, b) =>
          ((b.transactions
            .map((y) => y.amount)
            .reduce((a, b) => a + b, 0) as unknown as number) >
            a.transactions
              .map((y) => y.amount)
              .reduce((a, b) => a + b, 0)) as unknown as number
      )
      .filter((x) => x.transactions.length > 0);
  }, [categoryType, transactionLabels, transactions]);
  return (
    <>
      {selectedReport == "Labels" && (
        <>
          <SizedBox height={sh(20)} />
          <CustomText size={"medium"} label={`Result: ${list.length}`} />
          <SizedBox height={sh(10)} />
          {transactionLabels.length > 0 && (
            <>
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
              <SizedBox height={sh(20)} />
              {list.length > 0 && (
                <>
                  {list.map((data) => (
                    <TransactionLabelCard
                      key={data._id}
                      categoryType={categoryType}
                      userId={data.userId}
                      name={data.name}
                      transactionCounts={data.transactions.length}
                      totalCurrenciesIncomeAndExpenses={
                        data.totalCurrenciesIncomeAndExpenses
                      }
                      onPress={() => {
                        handlePress({
                          labelId: data._id,
                          targetUserId: data.userId,
                        });
                      }}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
