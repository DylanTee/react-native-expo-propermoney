import { TTransaction,TTransactionCategory } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import React, { useMemo, useState } from "react";
import { useTranslation } from "@libs/i18n/index";
import { sh } from "@libs/responsive.lib";
import SizedBox from "@components/Shared/SizedBox";
import { ETransactionCategoryType } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import TransactionCategoryCard from "@components/Shared/TransactionCategoryCard";
import CustomText from "@components/Shared/CustomText";
import CustomTab from "@components/Shared/CustomTab";
import { EOverviewTransactionsReport } from "./OverviewTransactionScreen";

interface TransactionCategoriesProps {
  selectedReport: EOverviewTransactionsReport;
  transactions: TTransaction[];
  transactionCategories: TTransactionCategory[];
  handlePress({
    categoryId,
    targetUserId,
  }: {
    categoryId: string;
    targetUserId: string;
  }): void;
}
export default function TransactionCategories({
  selectedReport,
  transactions,
  transactionCategories,
  handlePress,
}: TransactionCategoriesProps) {
  const [categoryType, setCategoryType] = useState<ETransactionCategoryType>(
    ETransactionCategoryType.expense
  );
  const { t } = useTranslation();
  const currencies = [...new Set(transactions.map((data) => data.currency))];
  const list = useMemo(() => {
    return transactionCategories
      .map((data) => ({
        ...data,
        totalCurrenciesIncomeAndExpenses: currencies.map((currency) => ({
          currency,
          totalIncomes: transactions
            .filter((x) => x.transactionCategory._id == data._id)
            .filter(
              (y) =>
                y.currency == currency &&
                y.transactionCategory.type == ETransactionCategoryType.income
            )
            .map((i) => i.amount)
            .reduce((a, b) => a + b, 0),
          totalExpenses: transactions
            .filter((x) => x.transactionCategory._id == data._id)
            .filter(
              (y) =>
                y.currency == currency &&
                y.transactionCategory.type == ETransactionCategoryType.expense
            )
            .map((i) => i.amount)
            .reduce((a, b) => a + b, 0),
        })),
        transactionCount: transactions.filter(
          (x) => x.transactionCategory._id == data._id
        ).length,
      }))
      .filter((x) => x.transactionCount > 0);
  }, [transactionCategories, transactions]);
  return (
    <>
      {selectedReport == "Categories" && (
        <>
          <SizedBox height={sh(20)} />
          <CustomText size={"medium"} label={`Result: ${list.length}`} />
          <SizedBox height={sh(10)} />
          {transactionCategories.length > 0 && (
            <>
              <CustomTab
                value={categoryType}
                data={[
                  {
                    label:
                      t("expenses") +
                      "\n" +
                      `${currencies.map(
                        (d) =>
                          d +
                          " " +
                          transactions
                            .filter(
                              (z) =>
                                z.currency == d &&
                                z.transactionCategory.type ==
                                  ETransactionCategoryType.expense
                            )
                            .map((c) => c.amount)
                            .reduce((a, b) => a + b, 0)
                            .toFixed(2)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                          "\n"
                      )}`,
                    value: ETransactionCategoryType.expense,
                  },
                  {
                    label:
                      t("income") +
                      "\n" +
                      `${currencies.map(
                        (d) =>
                          d +
                          " " +
                          transactions
                            .filter(
                              (z) =>
                                z.currency == d &&
                                z.transactionCategory.type ==
                                  ETransactionCategoryType.income
                            )
                            .map((c) => c.amount)
                            .reduce((a, b) => a + b, 0)
                            .toFixed(2)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                          "\n"
                      )}`,
                    value: ETransactionCategoryType.income,
                  },
                ]}
                onChange={(data) => {
                  setCategoryType(data as ETransactionCategoryType);
                }}
              />
              <SizedBox height={sh(10)} />
              {list
                .filter((z) => z.type == categoryType)
                .map((data) => (
                  <TransactionCategoryCard
                    categoryType={categoryType}
                    key={data._id}
                    userId={data.userId}
                    imagePath={data.imagePath}
                    name={data.name}
                    iconNackgroundColor={data.backgroundColor}
                    totalCurrenciesIncomeAndExpenses={
                      data.totalCurrenciesIncomeAndExpenses
                    }
                    transactionCount={data.transactionCount}
                    onPress={() =>
                      handlePress({
                        categoryId: data._id,
                        targetUserId: data.userId,
                      })
                    }
                  />
                ))}
            </>
          )}
        </>
      )}
    </>
  );
}
