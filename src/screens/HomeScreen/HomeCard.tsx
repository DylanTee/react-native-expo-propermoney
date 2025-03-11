import CustomButton from "@components/Shared/CustomButton";
import CustomText from "@components/Shared/CustomText";
import SizedBox from "@components/Shared/SizedBox";
import { sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React, { ReactNode } from "react";
import { View, TouchableOpacity } from "react-native";

export interface HomeCardProps {
  index: number;
  label: string;
  icon: ReactNode;
  description: string;
  onPress(): void;
  linkToVideo?(): void;
}

export default function HomeCard({
  index,
  label,
  icon,
  description,
  onPress,
  linkToVideo,
}: HomeCardProps) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: index == 0?"#9FE874":"#e3f7d6",
        padding: sw(5),
        paddingHorizontal: sw(15),
        borderRadius:sw(20)
      }}
      onPress={onPress}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomText
          label={label}
          size="small"
          textStyle={{
            color: Colors.black,
            textAlign: "center",
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
