import React from "react";
import { View } from "react-native";
import CustomText from "./CustomText";
import { ENV } from "../../../environment/index";

export default function VersionText() {
  return (
    <View style={{ alignSelf: "center" }}>
      <CustomText
        size={"small"}
        label={`${ENV.STORE_VERSION.MAJOR}.${ENV.STORE_VERSION.MINOR}.${ENV.STORE_VERSION.PATCH}(${ENV.STORE_VERSION.EXPO_PATCH}) © MCDYLAN PROPER ENTERPRISE`}
      />
    </View>
  );
}
