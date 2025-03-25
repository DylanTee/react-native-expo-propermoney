import { Colors } from "@styles/Colors";
import React from "react";
import { ActivityIndicator, ViewStyle } from "react-native";

type LoadingCircleProps = {
  containerStyle?: ViewStyle;
  visible: boolean;
  size?: "small" | "large";
};

const LoadingCircle = ({
  visible,
  containerStyle,
  size,
}: LoadingCircleProps) => {
  return (
    <>
      {visible && (
        <ActivityIndicator
          size={size ? size : "large"}
          color={Colors.black}
          style={containerStyle}
        />
      )}
    </>
  );
};

export default LoadingCircle;
