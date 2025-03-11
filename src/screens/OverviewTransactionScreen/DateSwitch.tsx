import React from "react";
import dayjs from "dayjs";
import { useTranslation } from "@libs/i18n/index";
import CustomItemPicker from "@components/Shared/CustomItemPicker";
import ModalDateTimePicker from "@components/Shared/CustomModal/ModalDateTimePicker";

interface DateSwitchProps {
  startTransactedAt: any;
  endTransactedAt: any;
  onDateChange(start: string, end: string): void;
}

export default function DateSwitch({
  startTransactedAt,
  endTransactedAt,
  onDateChange,
}: DateSwitchProps) {
  const { t } = useTranslation();
  return (
    <>
      <ModalDateTimePicker
        value={new Date(startTransactedAt)}
        buttonStyle={{}}
        listComponents={
          <CustomItemPicker
            pickedText={
              `${dayjs(endTransactedAt).format("MMMM ")}` +
              "" +
              `${dayjs(endTransactedAt).format("YYYY")}`
            }
            title={t("date")}
          />
        }
        onChange={(date) => {
          const startAt = dayjs(date).startOf("month") as unknown as string;
          const endAt = dayjs(date).endOf("month") as unknown as string;
          onDateChange(startAt, endAt);
        }}
      />
    </>
  );
}
