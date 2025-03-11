import { sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React from "react";
import { TextInput, View } from "react-native";
import SizedBox from "./SizedBox";
import { TextInputProps } from "react-native";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";

type SearchBarProps = Partial<TextInputProps>;

export default function SearchBar({ ...props }: SearchBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: sw(10),
        borderWidth: 1.5,
        borderColor: Colors.gainsboro,
        borderRadius: sw(5),
        alignItems: "center",
      }}
    >
      <ExpoVectorIcon name="search1" size={sw(15)} color={Colors.black} />
      <SizedBox width={sw(10)} />
      <TextInput
        style={{ width: "95%", color: Colors.black }}
        autoFocus={true}
        placeholderTextColor={Colors.rocketMetalic}
        {...props}
      />
    </View>
  );
}
