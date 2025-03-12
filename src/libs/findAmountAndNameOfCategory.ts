import { TTransactionCategory } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { currencyList } from "@mcdylanproperenterprise/nodejs-proper-money-types/lists/currency";

export default function findAmountAndNameOfCategory({
  transactionCategories,
  message,
}: {
  transactionCategories: TTransactionCategory[];
  message: string;
}) {
  function extractValues(inputString: string) {
    const regexCategory = /Category:\s*([^\n]*)/;
    const regexAmount = /Amount:\s*([^\n]*)/;
    const regexContext = /Context:\s*([^\n]*)/;
    const regexCurrency = /Currency:\s*([^\n]*)/;

    const matchCategory = regexCategory.exec(inputString);
    const matchAmount = regexAmount.exec(inputString);
    const matchContext = regexContext.exec(inputString);
    const matchCurrency = regexCurrency.exec(inputString);

    const values = {
      Category: matchCategory
        ? matchCategory[1].replace("**", "").trim()
        : null,
      Amount: matchAmount ? matchAmount[1].replace("**", "").trim() : null,
      Context: matchContext ? matchContext[1].replace("**", "").trim() : null,
      Currency: matchCurrency
        ? matchCurrency[1].replace("**", "").trim()
        : null,
    };
    return values;
  }
  const extractedValues = extractValues(message);
  const checkIsNoFound = (text: string) => {
    const textIncludeNoFound = [
      "specific",
      "n/a",
      "nan",
      "found",
      "detail",
      "nofound",
      "no found",
    ].filter((data) => text.replace(/\s/g, "").toLowerCase().includes(data));
    if (textIncludeNoFound.length > 0) {
      return true;
    } else {
      return false;
    }
  };
  const getNoteBasedExtractedValues = () => {
    let note: string | null = null;
    if (extractedValues.Context) {
      if (checkIsNoFound(extractedValues.Context)) {
      } else {
        note = extractedValues.Context;
      }
    }
    return note;
  };
  const getAmountBasedExtractedValues = () => {
    let amount: string | null = null;
    if (extractedValues.Amount) {
      amount = (
        Math.round(
          parseFloat(extractedValues.Amount.replace(/[^\d.]/g, "")) * 100
        ) / 100
      )
        .toFixed(2)
        .toString();
      if (amount == "NaN") {
        amount == null;
      }
    }
    return amount;
  };
  const detectedTextResult = {
    transactionCategory:
      transactionCategories.find((x) => x.name == extractedValues.Category) ??
      null,
    currency:
      currencyList.find((x) => x.iso == extractedValues.Currency)?.iso ?? null,
    amount: getAmountBasedExtractedValues(),
    note: getNoteBasedExtractedValues(),
  };
  return detectedTextResult;
}
