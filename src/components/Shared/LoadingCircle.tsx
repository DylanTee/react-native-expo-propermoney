import { Colors } from "@styles/Colors";
import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

type LoadingCircleProps = {
  visible: boolean;
};

const LoadingCircle = ({ visible }: LoadingCircleProps) => {
  return (
    <>{visible && <ActivityIndicator size={"large"} color={Colors.black} />}</>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    zIndex: 1000,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
export default LoadingCircle;
