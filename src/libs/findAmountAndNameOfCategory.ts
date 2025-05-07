import { currencyList } from "@mcdylanproperenterprise/nodejs-proper-money-types/lists/currency";
import { TTransactionCategory } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import dayjs from "dayjs";

export default function findAmountAndNameOfCategory({
  message,
  transactionCategories,
}: {
  message: string;
  transactionCategories: TTransactionCategory[];
}) {
  function extractValues(inputString: string) {
    const regexAmount = /Amount:\s*([^\n]*)/;
    const regexNote = /Note:\s*([^\n]*)/;
    const regexCurrency = /Currency:\s*([^\n]*)/;
    const regexDate = /Date:\s*([^\n]*)/;
    const regexCategory = /Category:\s*([^\n]*)/;

    const matchAmount = regexAmount.exec(inputString);
    const matchNote = regexNote.exec(inputString);
    const matchCurrency = regexCurrency.exec(inputString);
    const matchDate = regexDate.exec(inputString);
    const matchCategory = regexCategory.exec(inputString);

    const values = {
      Amount: matchAmount ? matchAmount[1] : null,
      Note: matchNote ? matchNote[1] : null,
      Currency: matchCurrency ? matchCurrency[1] : null,
      Date: matchDate ? matchDate[1] : null,
      Category: matchCategory ? matchCategory[1] : null,
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
    if (extractedValues.Note) {
      if (checkIsNoFound(extractedValues.Note)) {
      } else {
        note = extractedValues.Note;
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

  const getDateBasedExtractedValues = () => {
    let transactedAt: Date | null = null;
    if (dayjs(extractedValues.Date).isValid()) {
      transactedAt = dayjs(extractedValues.Date).toDate();
    }
    return transactedAt;
  };

  const getCategoryBasedExtractedValues = () => {
    let id: string | undefined = undefined;
    if (extractedValues.Category) {
      const category = transactionCategories.find(
        (z) => z.name == extractedValues.Category
      );
      if (category) {
        id = category._id;
      }
    }
    return id;
  };

  const detectedTextResult = {
    currency:
      currencyList.find((x) => x.iso == extractedValues.Currency)?.iso ?? null,
    amount: getAmountBasedExtractedValues(),
    note: getNoteBasedExtractedValues(),
    transactedAt: getDateBasedExtractedValues(),
    transactionCategoryId: getCategoryBasedExtractedValues(),
  };
  return detectedTextResult;
}
