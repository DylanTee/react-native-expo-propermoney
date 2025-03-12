import React, { ReactNode } from "react";
import CustomTextInput from "@components/Shared/CustomTextInput";
import { useState } from "react";
import CustomButton from "@components/Shared/CustomButton";
import SizedBox from "@components/Shared/SizedBox";
import { sh, sw } from "@libs/responsive.lib";
import {
  Modal,
  Platform,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Header from "../Header";
import ContainerLayout from "@components/Layout/ContainerLayout";
import KeyboardLayout from "@components/Layout/KeyboardLayout";

interface ModalTextInputProps {
  buttonStyle: ViewStyle;
  listComponents: ReactNode;
  headerText: string;
  textInputLabel: string;
  value: string;
  onChange(data: string): void;
}

export default function ModalTextInput(props: ModalTextInputProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [value, setValue] = useState<string>(props.value);
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
                onBack={() => {
                  setIsVisible(false);
                }}
              />
              
                <CustomTextInput
                  label={props.textInputLabel}
                  onChangeText={(text) => setValue(text)}
                  value={value}
                />
                <SizedBox height={sh(20)} />
                <CustomButton
                  size={"medium"}
                  type={"primary"}
                  title={"Save"}
                  onPress={() => {
                    props.onChange(value);
                    setIsVisible(false);
                  }}
                />
              
            </View>
          </KeyboardLayout>
        </ContainerLayout>
      </Modal>
    </>
  );
}
