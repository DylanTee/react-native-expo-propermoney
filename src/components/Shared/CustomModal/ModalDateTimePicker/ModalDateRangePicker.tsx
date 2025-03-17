import ContainerLayout from "@components/Layout/ContainerLayout";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import CustomText from "@components/Shared/CustomText";
import Header from "@components/Shared/Header";
import SizedBox from "@components/Shared/SizedBox";
import { sh, sw } from "@libs/responsive.lib";
import React, { ReactNode, useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import ModalDateTimePicker from "./ModalDateTimePicker";
import dayjs from "dayjs";
import { Colors } from "@styles/Colors";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import CustomButton from "@components/Shared/CustomButton";

interface ModalDateRangePickerProps {
  buttonStyle?: ViewStyle;
  listComponents: ReactNode;
  data: {
    startAt: Date | undefined;
    endAt: Date | undefined;
  };
  onChange(date: { startAt: Date; endAt: Date }): void;
}

const dates = [
  {
    name: "This month",
    value: {
      startAt: dayjs().startOf("month"),
      endAt: dayjs().endOf("month"),
    },
  },
  {
    name: "Last month",
    value: {
      startAt: dayjs().startOf("month").subtract(1, "month"),
      endAt: dayjs().endOf("month").subtract(1, "month"),
    },
  },
  {
    name: "Last year",
    value: {
      startAt: dayjs().startOf("year").subtract(1, "year"),
      endAt: dayjs().endOf("year").subtract(1, "year"),
    },
  },
];

export default function ModalDateRangePicker(props: ModalDateRangePickerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{
    startAt: undefined | Date;
    endAt: undefined | Date;
  }>({ startAt: props.data.startAt, endAt: props.data.endAt });

  useEffect(() => {}, [props.data]);
  return (
    <>
      <TouchableOpacity
        style={props.buttonStyle}
        onPress={() => {
          setIsVisible(true);
        }}
      >
        {props.listComponents}
      </TouchableOpacity>
      <Modal animationType="slide" visible={isVisible}>
        <ContainerLayout>
          <KeyboardLayout>
            <View
              style={{
                flex: 1,
                paddingTop: Platform.OS === "android" ? 0 : sw(50),
              }}
            >
              <Header
                containerStyle={{ padding: sw(15) }}
                onBack={() => {
                  setIsVisible(false);
                }}
              />

              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {dates.map((date) => (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        borderWidth: 1,
                        borderColor: Colors.suvaGrey,
                        backgroundColor:
                          dayjs(dateRange.startAt).format("DD-MM-YYYY") ==
                          dayjs(date.value.startAt).format("DD-MM-YYYY")
                            ? Colors.primary
                            : "transparent",
                        borderRadius: sw(30),
                        padding: sw(5),
                        paddingHorizontal: sw(20),
                        marginHorizontal: sw(5),
                      }}
                      onPress={() =>
                        setDateRange((prevState) => ({
                          ...prevState,
                          startAt: date.value.startAt.toDate(),
                          endAt: date.value.endAt.toDate(),
                        }))
                      }
                    >
                      <CustomText
                        label={date.name}
                        size="medium"
                        textStyle={{
                          color:
                            dayjs(dateRange.startAt).format("DD-MM-YYYY") ==
                            dayjs(date.value.startAt).format("DD-MM-YYYY")
                              ? `#D6FFBC`
                              : Colors.primary,
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={{ paddingHorizontal: sw(15) }}>
                <SizedBox height={sh(20)} />
                <CustomText label="Choose a date range" size="extra-big" />
                <SizedBox height={sh(40)} />
                <>
                  <ModalDateTimePicker
                    value={new Date(dateRange.startAt as Date)}
                    listComponents={
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ gap: sh(10) }}>
                          <CustomText
                            label={`Start`}
                            textStyle={{ color: `#9F9F9F` }}
                            size="big"
                          />
                          <CustomText
                            label={dayjs(dateRange.startAt).format(
                              "DD MMMM YYYY"
                            )}
                            textStyle={{ color: Colors.matterhorn }}
                            size="medium"
                          />
                        </View>
                        <View style={{ marginLeft: "auto" }}>
                          <ExpoVectorIcon
                            name="right"
                            size={sw(15)}
                            color={Colors.black}
                          />
                        </View>
                      </View>
                    }
                    onChange={(date) => {
                      setDateRange((prevState) => ({
                        ...prevState,
                        startAt: date,
                      }));
                    }}
                  />
                  <SizedBox height={sh(20)} />
                  <ModalDateTimePicker
                    value={new Date(dateRange.endAt as Date)}
                    listComponents={
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ gap: sh(10) }}>
                          <CustomText
                            label={`End`}
                            textStyle={{ color: `#9F9F9F` }}
                            size="big"
                          />
                          <CustomText
                            label={dayjs(dateRange.endAt).format(
                              "DD MMMM YYYY"
                            )}
                            textStyle={{ color: Colors.matterhorn }}
                            size="medium"
                          />
                        </View>
                        <View style={{ marginLeft: "auto" }}>
                          <ExpoVectorIcon
                            name="right"
                            size={sw(15)}
                            color={Colors.black}
                          />
                        </View>
                      </View>
                    }
                    onChange={(date) => {
                      setDateRange((prevState) => ({
                        ...prevState,
                        endAt: date,
                      }));
                    }}
                  />
                </>
              </View>
            </View>
          </KeyboardLayout>
          <CustomButton
            buttonStyle={{ marginBottom: sh(25), marginHorizontal: sw(15) }}
            disabled={
              dateRange.startAt == undefined || dateRange.endAt == undefined
            }
            type={"primary"}
            size={"medium"}
            title={"Confirm"}
            onPress={() => {
              if (dateRange.startAt && dateRange.endAt) {
                props.onChange({
                  startAt: dateRange.startAt,
                  endAt: dateRange.endAt,
                });
                setIsVisible(false);
              }
            }}
          />
        </ContainerLayout>
      </Modal>
    </>
  );
}
