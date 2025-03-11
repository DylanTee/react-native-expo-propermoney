import { sfont } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React from "react";
import { Text, TextStyle, View, ViewStyle } from "react-native";
import { useFonts } from "@expo-google-fonts/open-sans";

type CustomTextProps = {
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  isRequired?: boolean;
  label: string;
  size: "2-extra-big" | "extra-big" | "big" | "medium" | "small";
};

const CustomText = ({
  containerStyle,
  textStyle,
  isRequired = false,
  label,
  size,
}: CustomTextProps) => {
  let [fontsLoaded] = useFonts({
    "Open-Sans": require("@assets/fonts/OpenSans-VariableFont_wdth,wght.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  let textStyles: TextStyle = {
    color: Colors.black,
    fontFamily: "Open-Sans",
    ...textStyle,
  };

  if (size == "2-extra-big") {
    textStyles = { ...textStyles, fontSize: sfont(24), fontWeight: "bold" };
  }
  if (size == "extra-big") {
    textStyles = { ...textStyles, fontSize: sfont(21), fontWeight: "bold" };
  }

  if (size == "big") {
    textStyles = { ...textStyles, fontSize: sfont(15), fontWeight: "bold" };
  }

  if (size == "medium") {
    textStyles = { ...textStyles, fontSize: sfont(13), fontWeight: "500" };
  }

  if (size == "small") {
    textStyles = { ...textStyles, fontSize: sfont(11), fontWeight: "500" };
  }

  return (
    <View style={[{ flexDirection: "row" }, containerStyle]}>
      <Text style={textStyles}>{label}</Text>
      {isRequired && <Text style={[textStyles, { color: Colors.red }]}>*</Text>}
    </View>
  );
};
export default CustomText;
