import React, { ReactNode } from "react";
import { StyleSheet, View, TouchableOpacity, ViewStyle } from "react-native";
import { sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";

interface HeaderProps {
  containerStyle?: ViewStyle;
  itemRight?: ReactNode;
  onBack(): void;
}

export default function Header({
  containerStyle,
  itemRight = <></>,
  onBack,
}: HeaderProps) {
  return (
    <View style={containerStyle}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => onBack()}>
          <ExpoVectorIcon name={"close"} size={sw(20)} color={Colors.black} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", marginLeft: "auto" }}>
          {itemRight}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: sw(60),
    alignItems: "center",
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    width: sw(40),
    height: sw(40),
    borderRadius: sw(40 / 2),
    backgroundColor: "#DDE0DA",
  },
  titleContainer: {
    justifyContent: "center",
  },
});
