import React, { ReactNode, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import SizedBox from "./SizedBox";
import { sfont, sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import CustomText from "./CustomText";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";

type CustomTextInputProps = {
  isRequired?: boolean;
  label?: string;
  hasSecureEntry?: boolean;
  itemLeft?: ReactNode;
} & Partial<TextInputProps>;

export default function CustomTextInput({
  isRequired = false,
  label = "",
  itemLeft,
  hasSecureEntry = false,
  ...props
}: CustomTextInputProps) {
  const [isSecureEntry, setIsSecureEntry] = useState<boolean>(hasSecureEntry);
  const hasItemLeft = itemLeft;
  return (
    <>
      <CustomText size={"medium"} label={label} isRequired={isRequired} />
      <SizedBox height={sh(5)} />
      <View style={styles.inputContainer}>
        {hasItemLeft && (
          <>
            {itemLeft}
            {Platform.OS == "ios" && <SizedBox width={sw(5)} />}
          </>
        )}
        <TextInput
          style={[
            styles.input,
            Platform.OS === "android" ? { padding: sw(10) } : {},
          ]}
          secureTextEntry={isSecureEntry}
          scrollEnabled={props.multiline ? false : true}
          placeholderTextColor={Colors.rocketMetalic}
          {...props}
        />
        {hasSecureEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() =>
              setIsSecureEntry((prevState) => {
                return (prevState = !isSecureEntry);
              })
            }
          >
            {isSecureEntry ? (
              <ExpoVectorIcon name="eye" size={sw(15)} color={Colors.black} />
            ) : (
              <ExpoVectorIcon name="eyeo" size={sw(15)} color={Colors.black} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {props.maxLength && (
        <>
          <SizedBox height={sh(3)} />
          <CustomText
            size={"small"}
            label={props.value?.length + " / " + props.maxLength}
            textStyle={{
              marginLeft: "auto",
              color: Colors.rocketMetalic,
              fontSize: sfont(10),
            }}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  labelText: {
    fontWeight: "500",
    fontSize: sfont(12),
  },
  inputContainer: {
    flexDirection: "row",
    padding: Platform.OS == "android" ? 0 : sw(10),
    paddingHorizontal: Platform.OS == "android" ? sw(10) : sw(10),
    borderWidth: 1.5,
    borderColor: Colors.gainsboro,
    borderRadius: sw(5),
    alignItems: "center",
  },
  input: {
    fontSize: sfont(12),
    width: "95%",
    color: Colors.black,
  },
  eyeButton: {
    justifyContent: "center",
    alignItems: "center",
  },
});
