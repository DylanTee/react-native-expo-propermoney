import { sfont, sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React, { ReactNode, useEffect, useState } from "react";
import { TextStyle, TouchableOpacity, ViewStyle } from "react-native";
import CustomText from "./CustomText";
import SizedBox from "./SizedBox";
import { AsyncStorageLib } from "@libs/async.storage.lib";

interface ButtonProps {
  type: "primary" | "secondary" | "tertiary";
  size: "big" | "medium" | "small";
  title: string;
  icon?: ReactNode;
  disabled?: boolean;
  isTimer?: boolean;
  onPress(): void;
}

const CustomButton = ({
  type,
  size,
  title,
  icon = undefined,
  disabled = false,
  isTimer = false,
  onPress,
}: ButtonProps) => {
  const [seconds, setSeconds] = useState<number | null>(null);
  const isDisabled = disabled || seconds ? true : false;
  let buttonStyle: ViewStyle = {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: sw(5),
    opacity: isDisabled ? 0.6 : 1,
  };
  let textStyle: TextStyle = {
    fontWeight: "bold",
  };
  if (type == "primary") {
    buttonStyle = {
      ...buttonStyle,
      backgroundColor: Colors.primary,
      borderWidth: 2,
      borderColor: Colors.primary,
    };
    textStyle = { ...textStyle, color: Colors.white };
  }
  if (type == "secondary") {
    buttonStyle = {
      ...buttonStyle,
      backgroundColor: Colors.white,
      borderWidth: 2,
      borderColor: Colors.primary,
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
    buttonStyle = {
      padding: sh(10),
      ...buttonStyle,
    };
    textStyle = {
      ...textStyle,
      fontSize: sfont(14),
    };
  }
  if (size == "medium") {
    buttonStyle = {
      padding: sh(8),
      ...buttonStyle,
    };
    textStyle = {
      ...textStyle,
      fontSize: sfont(12),
    };
  }
  if (size == "small") {
    buttonStyle = {
      ...buttonStyle,
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
      style={buttonStyle}
      onPress={() => onPress()}
    >
      {icon && (
        <>
          {icon}
          <SizedBox width={sw(10)} />
        </>
      )}
      <CustomText
        size={size}
        label={title + `${isTimer && seconds ? ` (${seconds})` : ``}`}
        textStyle={textStyle}
      />
    </TouchableOpacity>
  );
};
export default CustomButton;
