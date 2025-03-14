import React from "react";
import { sh, sw } from "@libs/responsive.lib";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { Colors } from "@styles/Colors";
import CustomText from "./CustomText";

interface CustomTabProps {
  containerStyle?: ViewStyle;
  value: string | number;
  data: { label: string; value: string | number }[];
  onChange(value: string | number): void;
}

const CustomTab = ({
  containerStyle = {
    flexDirection: "row",
    padding: sw(2),
    borderWidth: 1,
    borderRadius: sw(5),
    borderColor: Colors.gainsboro,
  },
  data,
  value,
  onChange,
}: CustomTabProps) => {
  return (
    <View style={containerStyle}>
      {data.map((item) => (
        <TouchableOpacity
          key={item.value}
          style={[
            styles.button,
            {
              backgroundColor:
                value == item.value ? Colors.suvaGrey : Colors.white,
            },
          ]}
          onPress={() => onChange(item.value)}
        >
          <CustomText
            size={"small"}
            label={item.label}
            textStyle={{
              color: value == item.value ? Colors.white : Colors.suvaGrey,
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: sw(10),
    padding: sh(5),
    borderRadius: sw(5),
  },
});

export default CustomTab;
