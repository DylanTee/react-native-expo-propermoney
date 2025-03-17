import React, { ReactNode, useState } from "react";
import { TouchableOpacity, ViewStyle } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface ModalDateTimePickerProps {
  buttonStyle?: ViewStyle;
  listComponents: ReactNode;
  value: Date;
  onChange(date: Date): void;
}

export default function ModalDateTimePicker(props: ModalDateTimePickerProps) {
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
      <DateTimePickerModal
        date={props.value}
        isVisible={isVisible}
        onConfirm={(date) => {
          props.onChange(date);
          setIsVisible(false);
        }}
        onCancel={() => {
          setIsVisible(false);
        }}
        maximumDate={new Date()}
      />
    </>
  );
}
