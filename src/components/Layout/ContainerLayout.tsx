import React, { ReactNode } from "react";
import { View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@styles/Colors";
import { Global } from "@styles/Global";
import { ExpoDeviceLib } from "@libs/expo-devices.lib";

interface LayoutProps {
  children: ReactNode;
}

export default function ContainerLayout({ children }: LayoutProps) {
  const windowDimensions = useWindowDimensions();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {ExpoDeviceLib.isTablet ? (
        <View
          style={[
            {
              flex: ExpoDeviceLib.isTablet ? 0 : 1,
              width: 360,
              height: 700,
              marginTop: windowDimensions.height / 6,
              backgroundColor: Colors.white,
              alignSelf: "center",
            },
            Global.shadowLine,
          ]}
        >
          {children}
        </View>
      ) : (
        <>{children}</>
      )}
    </SafeAreaView>
  );
}
