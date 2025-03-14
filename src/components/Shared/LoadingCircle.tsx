import { Colors } from "@styles/Colors";
import React from "react";
import { ActivityIndicator, ViewStyle } from "react-native";

type LoadingCircleProps = {
  containerStyle?: ViewStyle;
  visible: boolean;
};

const LoadingCircle = ({ visible, containerStyle }: LoadingCircleProps) => {
  return (
    <>
      {visible && (
        <ActivityIndicator
          size={"large"}
          color={Colors.black}
          style={containerStyle}
        />
      )}
    </>
  );
};

export default LoadingCircle;
