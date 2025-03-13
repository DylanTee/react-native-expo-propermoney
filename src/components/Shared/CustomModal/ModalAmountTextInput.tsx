import ContainerLayout from "@components/Layout/ContainerLayout";
import KeyboardLayout from "@components/Layout/KeyboardLayout";
import { sfont, sh, sw } from "@libs/responsive.lib";
import React, { ReactNode, useEffect, useState } from "react";
import {
  Modal,
  Platform,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Header from "../Header";
import SizedBox from "../SizedBox";
import CustomText from "../CustomText";
import CustomTextInput from "../CustomTextInput";
import ModalCurrencyPicker from "./ModalCurrencyPicker";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import { Colors } from "@styles/Colors";
import { useTranslation } from "react-i18next";
import { isNumber } from "@libs/utils";
import CustomButton from "../CustomButton";

interface ModalAmountTextInputProps {
  buttonStyle?: ViewStyle;
  listComponents: ReactNode;
  currency: string;
  amount: string;
  onChange({ amount, currency }: { amount: string; currency: string }): void;
}

export default function ModalAmountTextInput(props: ModalAmountTextInputProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>(props.currency);
  const [amount, setAmount] = useState<string>(props.amount);
  useEffect(() => {
    setAmount(props.amount);
  }, [props.amount]);
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
              <CustomTextInput
                contextMenuHidden={true}
                style={{ fontSize: sfont(31), textAlign: "right",flex:1 }}
                itemLeft={
                  <>
                    <ModalCurrencyPicker
                      buttonStyle={{}}
                      onChange={(data) => {
                        setCurrency(data);
                      }}
                      currency={currency}
                      listComponents={
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <CustomText size={"medium"} label={currency} />
                          <SizedBox width={sw(5)} />
                          <ExpoVectorIcon
                            name="down"
                            size={sw(10)}
                            color={Colors.black}
                          />
                          <SizedBox width={sh(5)} />
                        </View>
                      }
                    />
                  </>
                }
                autoFocus={true}
                placeholder={"0.00"}
                keyboardType={"numeric"}
                onChangeText={(text) => {
                  if (isNumber(text)) {
                    // Format the value with two decimal places
                    let formattedText = text.replace(/[^0-9]/g, "");
                    const length = formattedText.length;
                    if (parseFloat(formattedText) <= 0) {
                      formattedText = ``;
                    } else if (length >= 2) {
                      formattedText = `${formattedText.substring(
                        0,
                        length - 2
                      )}.${formattedText.substring(length - 2)}`;
                    } else if (length == 1) {
                      formattedText = `0.0${formattedText}`;
                    }
                    if (
                      parseFloat(formattedText) >= 0.99 &&
                      parseFloat(formattedText) <= 0.1
                    ) {
                      formattedText = formattedText.replace(/^0+/, "0");
                    } else if (parseFloat(formattedText) >= 1) {
                      formattedText = formattedText.replace(/^0+/, "");
                    }

                    if (formattedText.substring(0, 2) == "00") {
                      formattedText = formattedText.replace("00", "0");
                    } else if (formattedText.substring(0, 1) == ".") {
                      formattedText = formattedText.replace(".", "0.");
                    }
                    setAmount(formattedText);
                  }
                }}
                value={amount}
              />
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
              props.onChange({ amount, currency });
              setIsVisible(false);
            }}
          />
        </ContainerLayout>
      </Modal>
    </>
  );
}
