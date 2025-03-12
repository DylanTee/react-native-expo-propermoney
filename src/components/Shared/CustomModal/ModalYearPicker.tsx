import React, { ReactNode, useState } from "react";
import CustomButtonItemPicker from "@components/Shared/CustomButtonItemPicker";
import {
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { sw } from "@libs/responsive.lib";
import Header from "../Header";
import dayjs from "dayjs";
import ContainerLayout from "@components/Layout/ContainerLayout";

interface ModalYearPickerProps {
  year: number | string;
  buttonStyle: ViewStyle;
  listComponents: ReactNode;
  onChange(data: number | string): void;
}

export default function ModalYearPicker(props: ModalYearPickerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const list = [
    "All",
    ...Array.from(
      { length: dayjs().year() - 1997 + 1 },
      (_, index) => new Date().getFullYear() - index
    ),
  ];
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
          <ScrollView>
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

              {list.map((option) => (
                <CustomButtonItemPicker
                  key={option}
                  text={`${option}`}
                  isSelect={props.year == option}
                  onPress={() => {
                    props.onChange(option);
                    setIsVisible(false);
                  }}
                />
              ))}
            </View>
          </ScrollView>
        </ContainerLayout>
      </Modal>
    </>
  );
}
