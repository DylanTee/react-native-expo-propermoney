import { sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React, { ReactNode } from "react";
import { TouchableOpacity } from "react-native";
import SizedBox from "./SizedBox";
import CustomText from "./CustomText";
import { View } from "react-native";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";

interface CustomButtonIconRightProps {
  children?: ReactNode;
  title: string;
  onPress(): void;
}

export default function CustomButtonIconRight({
  children,
  title,
  onPress,
}: CustomButtonIconRightProps) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        padding: sh(10),
        paddingLeft: 0,
        alignItems: "center",
      }}
      onPress={() => onPress()}
    >
      {children}
      {children && <SizedBox width={sw(15)} />}
      <CustomText label={title} size={"medium"} />
      <View
        style={{
          marginLeft: "auto",
        }}
      >
        <ExpoVectorIcon name="right" size={sw(15)} color={Colors.black} />
      </View>
    </TouchableOpacity>
  );
}
