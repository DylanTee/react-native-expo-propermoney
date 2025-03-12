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
import { EOverviewTransactionsReport } from "@screens/OverviewTransactionScreen/OverviewTransactionScreen";
import ContainerLayout from "@components/Layout/ContainerLayout";

interface ModalOverviewTransctionsReportPickerProps {
  report: EOverviewTransactionsReport;
  buttonStyle: ViewStyle;
  listComponents: ReactNode;
  onChange(data: EOverviewTransactionsReport): void;
}

export default function ModalOverviewTransctionsReportPicker(
  props: ModalOverviewTransctionsReportPickerProps
) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const list = [
    EOverviewTransactionsReport.Transactions,
    EOverviewTransactionsReport.Categories,
    EOverviewTransactionsReport.Labels,
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
              {list.map((option) => (
                <CustomButtonItemPicker
                  key={option}
                  text={option}
                  isSelect={props.report == option}
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
