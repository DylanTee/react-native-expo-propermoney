import { sh } from "@libs/responsive.lib";
import React from "react";
import { ColorValue, DimensionValue, StyleSheet, View } from "react-native";

interface ProgressBarProps {
  color: ColorValue;
  width: number;
}

export default function ProgressBar({ color, width }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.line,
          {
            width: ((width > 100 ? 100 : width) +
              "%") as unknown as DimensionValue,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#D4DEEF",
    borderRadius: 1000,
  },
  line: {
    height: sh(5),
    borderRadius: 1000,
  },
});
