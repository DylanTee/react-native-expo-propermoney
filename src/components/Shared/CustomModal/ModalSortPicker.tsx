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
import ContainerStack from "../ContainerStack";
import { EGetTransactionsBySort } from "@mcdylanproperenterprise/nodejs-proper-money-types/enum";
import ContainerLayout from "@components/Layout/ContainerLayout";

interface ModalSortPickerProps {
  sortBy: EGetTransactionsBySort;
  buttonStyle: ViewStyle;
  listComponents: ReactNode;
  onChange(data: EGetTransactionsBySort): void;
}

export default function ModalSortPicker(props: ModalSortPickerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const list = [EGetTransactionsBySort.recent, EGetTransactionsBySort.highest];
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
              title={`Sort by`}
              onBack={() => {
                setIsVisible(false);
              }}
            />
            <ScrollView>
              <ContainerStack>
                {list.map((option) => (
                  <CustomButtonItemPicker
                    key={option}
                    text={`${option}`}
                    isSelect={props.sortBy == option}
                    onPress={() => {
                      props.onChange(option);
                      setIsVisible(false);
                    }}
                  />
                ))}
              </ContainerStack>
            </ScrollView>
          </View>
        </ContainerLayout>
      </Modal>
    </>
  );
}
