import React, { ReactNode, useState } from "react";
import { currencyList } from "@mcdylanproperenterprise/nodejs-proper-money-types/lists/currency";
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
import ContainerLayout from "@components/Layout/ContainerLayout";

interface ModalCurrencyPickerProps {
  currency: string;
  buttonStyle: ViewStyle;
  listComponents: ReactNode;
  onChange(data: string): void;
}

export default function ModalCurrencyPicker(props: ModalCurrencyPickerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
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
              containerStyle={{
                padding: sw(15),
              }}
            />
            <ScrollView>
              {currencyList.map((option, index) => (
                <CustomButtonItemPicker
                  key={index}
                  text={`${option.name} (${option.iso})`}
                  isSelect={props.currency == option.iso}
                  onPress={() => {
                    props.onChange(option.iso);
                    setIsVisible(false);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </ContainerLayout>
      </Modal>
    </>
  );
}
