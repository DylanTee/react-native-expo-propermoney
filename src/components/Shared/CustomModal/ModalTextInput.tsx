import React, { ReactNode, useEffect } from "react";
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
import CustomText from "../CustomText";

interface ModalTextInputProps {
  buttonStyle?: ViewStyle;
  listComponents: ReactNode;
  headerText: string;
  textInputLabel: string;
  value: string;
  onChange(data: string): void;
}

export default function ModalTextInput(props: ModalTextInputProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

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
                padding: sw(15),
              }}
            >
              <Header
                onBack={() => {
                  setIsVisible(false);
                }}
              />
              <SizedBox height={sh(20)} />
              <CustomText label={props.headerText} size="extra-big" />
              <SizedBox height={sh(40)} />
              <CustomTextInput
                label={props.textInputLabel}
                onChangeText={(text) => setValue(text)}
                value={value}
                style={{
                  height: sh(60),
                  width: "100%",
                  borderColor: "#253A14",
                }}
                multiline={true}
                maxLength={100}
                autoFocus={true}
              />
              <SizedBox height={sh(20)} />
            </View>
          </KeyboardLayout>
          <CustomButton
            buttonStyle={{
              marginHorizontal: sw(15),
              marginBottom: sw(Platform.OS === "android" ? 15 : 35),
            }}
            size={"medium"}
            type={"primary"}
            title={"Save"}
            onPress={() => {
              props.onChange(value);
              setIsVisible(false);
            }}
          />
        </ContainerLayout>
      </Modal>
    </>
  );
}
