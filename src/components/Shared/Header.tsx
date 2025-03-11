import React, { ReactNode } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import SizedBox from "./SizedBox";
import CustomText from "./CustomText";
import ContainerStack from "./ContainerStack";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import { ExpoDeviceLib } from "@libs/expo-devices.lib";

interface HeaderProps {
  title: string;
  itemRight?: ReactNode;
  onBack(): void;
}

export default function Header({
  title,
  itemRight = <></>,
  onBack,
}: HeaderProps) {
  const getTitle = () => {
    if (ExpoDeviceLib.isTablet) {
      if (title.length > 12) {
        return title.substring(0, 12) + "...";
      } else {
        return title;
      }
    } else {
      return title;
    }
  };
  return (
    <ContainerStack>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.container}
        onPress={() => onBack()}
      >
        <View style={styles.backButton}>
          <ExpoVectorIcon name={"left"} size={sw(20)} color={Colors.black} />
        </View>
        <SizedBox width={sw(10)} />
        <View style={styles.titleContainer}>
          <CustomText size={"medium"} label={getTitle()} />
        </View>
        <View style={{ flexDirection: "row", marginLeft: "auto" }}>
          {itemRight}
        </View>
      </TouchableOpacity>
    </ContainerStack>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: sw(50),
    alignItems: "center",
  },
  backButton: {
    justifyContent: "center",
    bottom: sw(-1),
  },
  titleContainer: {
    justifyContent: "center",
  },
});
