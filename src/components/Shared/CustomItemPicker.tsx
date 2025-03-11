import React, { ReactNode } from "react";
import CustomText from "./CustomText";
import SizedBox from "./SizedBox";
import { sfont, sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import { View } from "react-native";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";

interface CustomItemPickerProps {
  isRequired?: boolean;
  title: string;
  pickedText: string;
  itemLeft?: ReactNode;
}

const CustomItemPicker = ({
  isRequired = false,
  title,
  pickedText,
  itemLeft,
}: CustomItemPickerProps) => {
  return (
    <>
      <CustomText size={"medium"} label={title} isRequired={isRequired} />
      <SizedBox height={sh(5)} />
      <View
        style={{
          flexDirection: "row",
          padding: sh(10),
          borderWidth: 1.5,
          borderColor: Colors.gainsboro,
          borderRadius: sw(5),
          alignItems: "center",
        }}
      >
        {itemLeft}
        {pickedText.trim().length > 0 ? (
          <CustomText label={pickedText} size={"medium"} />
        ) : (
          <CustomText
            label={"Select an option..."}
            size={"medium"}
            textStyle={{
              color: Colors.rocketMetalic,
              fontSize: sfont(12),
            }}
          />
        )}
        <View style={{ marginLeft: "auto" }}>
          <ExpoVectorIcon name="right" size={sw(15)} color={Colors.black} />
        </View>
      </View>
    </>
  );
};
export default CustomItemPicker;
