import React, { ReactNode, useState } from "react";
import { languageList } from "@mcdylanproperenterprise/nodejs-proper-money-types/lists/language";
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

interface ModalLanguagePickerProps {
  language: string;
  buttonStyle: ViewStyle;
  listComponents: ReactNode;
  onChange(data: string): void;
}

export default function ModalLanguagePicker(props: ModalLanguagePickerProps) {
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
            />
            <ScrollView>
              {languageList.map((option) => (
                <CustomButtonItemPicker
                  key={option.value}
                  text={`${option.name} (${option.value})`}
                  isSelect={props.language == option.value}
                  onPress={() => {
                    props.onChange(option.value);
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
