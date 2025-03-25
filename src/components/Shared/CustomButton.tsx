import { sfont, sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React, { ReactNode, useEffect, useState } from "react";
import { TextStyle, TouchableOpacity, ViewStyle } from "react-native";
import CustomText from "./CustomText";
import SizedBox from "./SizedBox";
import { AsyncStorageLib } from "@libs/async.storage.lib";
import LoadingCircle from "./LoadingCircle";

interface ButtonProps {
  type: "primary" | "secondary" | "tertiary";
  size: "big" | "medium" | "small";
  title: string;
  icon?: ReactNode;
  disabled?: boolean;
  isTimer?: boolean;
  buttonStyle?: ViewStyle;
  isLoading?: boolean;
  onPress(): void;
}

const CustomButton = ({
  type,
  size,
  title,
  icon = undefined,
  disabled = false,
  isTimer = false,
  isLoading = false,
  buttonStyle,
  onPress,
}: ButtonProps) => {
  const [seconds, setSeconds] = useState<number | null>(null);
  const isDisabled = disabled || seconds ? true : false;
  let styles = {};
  let textStyle: TextStyle = {
    fontWeight: "bold",
  };
  if (type == "primary") {
    styles = {
      backgroundColor: Colors.primary,
      borderWidth: 2,
      borderColor: Colors.primary,
      ...buttonStyle,
    };
    textStyle = { ...textStyle, color: Colors.white };
  }
  if (type == "secondary") {
    styles = {
      backgroundColor: Colors.white,
      borderWidth: 2,
      borderColor: Colors.primary,
      ...buttonStyle,
    };
    textStyle = { ...textStyle, color: Colors.primary };
  }
  if (type == "tertiary") {
    textStyle = {
      color: Colors.primary,
      textDecorationLine: "underline",
    };
  }
  if (size == "big") {
    styles = {
      padding: sh(10),
      ...styles,
      ...buttonStyle,
    };
    textStyle = {
      ...textStyle,
      fontSize: sfont(14),
    };
  }
  if (size == "medium") {
    styles = {
      padding: sh(8),
      ...styles,
      ...buttonStyle,
    };
    textStyle = {
      ...textStyle,
      fontSize: sfont(12),
    };
  }
  if (size == "small") {
    styles = {
      ...buttonStyle,
      ...styles,
      padding: sh(5),
    };
    textStyle = {
      ...textStyle,
      fontSize: sfont(10),
    };
  }

  useEffect(() => {
    const init = async () => {
      if (isTimer) {
        const seconds = await AsyncStorageLib.getTimerToRequestOTP();
        setSeconds(seconds);
      }
    };
    init();
  }, [onPress]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (seconds) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          const leftSeconds = (prevSeconds as number) - 1;
          AsyncStorageLib.setTimerToRequestOTP(leftSeconds);
          return leftSeconds;
        });
      }, 1000);
    } else if (seconds === 0) {
      setSeconds(null);
      AsyncStorageLib.removeTimerToRequestOTP();
    }
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <TouchableOpacity
      disabled={isDisabled}
      style={[
        {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: sw(5),
          opacity: isDisabled ? 0.4 : 1,
        },
        styles,
      ]}
      onPress={() => onPress()}
    >
      {icon && (
        <>
          {icon}
          <SizedBox width={sw(10)} />
        </>
      )}
      {isLoading ? (
        <LoadingCircle visible={true} size="small" />
      ) : (
        <CustomText
          size={size}
          label={title + `${isTimer && seconds ? ` (${seconds})` : ``}`}
          textStyle={textStyle}
        />
      )}
    </TouchableOpacity>
  );
};
export default CustomButton;
