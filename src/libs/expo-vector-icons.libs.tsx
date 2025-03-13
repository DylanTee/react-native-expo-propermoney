import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { ColorValue, StyleProp, TextStyle } from "react-native";
interface ExpoVectorIconProps {
  name:
    | "left"
    | "right"
    | "down"
    | "check"
    | "eye"
    | "eyeo"
    | "ellipsis1"
    | "plus"
    | "search1"
    | "close"
    | "camerao"
    | "swap"
    | "addusergroup"
    | "tagso"
    | "folder1"
    | "flag"
    | "customerservice"
    | "camera"
    | "phone"
    | "mail"
    | "copy1"
    | "logout"
    | "warning"
    | "scan1"
    | "edit"
    | "upload"
    | "delete"
  size: number;
  color: ColorValue;
  style?: StyleProp<TextStyle>;
}

export default function ExpoVectorIcon(props: ExpoVectorIconProps) {
  return (
    <AntDesign
      name={props.name}
      size={props.size}
      color={props.color}
      style={props.style}
    />
  );
}
