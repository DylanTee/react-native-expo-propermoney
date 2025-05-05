import React from "react";
import { View } from "react-native";
import CustomText from "./CustomText";

export default function VersionText() {
  return (
    <View style={{ alignSelf: "center" }}>
      <CustomText
        size={"small"}
        label={`${process.env.EXPO_PUBLIC_STORE_VERSION} (3) © MCDYLAN PROPER ENTERPRISE`}
      />
    </View>
  );
}
