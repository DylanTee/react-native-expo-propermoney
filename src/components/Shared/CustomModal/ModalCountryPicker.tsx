import React, { ReactNode, useState } from "react";
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
import {
  countryList,
  TCountry,
} from "@mcdylanproperenterprise/nodejs-proper-money-types/lists/country";
import CustomButtonItemPicker from "../CustomButtonItemPicker";
import ContainerLayout from "@components/Layout/ContainerLayout";

interface ModalCountryPickerProps {
  countryCode: string;
  buttonStyle: ViewStyle;
  listComponents: ReactNode;
  onChange(countryCode: TCountry): void;
}

export default function ModalCountryPicker(props: ModalCountryPickerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setIsVisible(true);
        }}
        style={props.buttonStyle}
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
              containerStyle={{
                padding: sw(15),
              }}
              onBack={() => {
                setIsVisible(false);
              }}
            />
            <ScrollView>
              {countryList.map((option, index) => (
                <CustomButtonItemPicker
                  key={index}
                  text={`${option.name} (${option.countryCode})`}
                  isSelect={props.countryCode == option.countryCode}
                  onPress={() => {
                    props.onChange(option);
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
