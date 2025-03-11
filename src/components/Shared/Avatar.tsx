import { sw } from "@libs/responsive.lib";
import React from "react";
import { Image } from "react-native";
import { ViewStyle } from "react-native";
import ModalZoomableImage from "./CustomModal/ModalZoomableImage";

type AvatarProps = {
  size: "small" | "medium" | "big";
  profileImage: string;
};

const Avatar = ({ profileImage, size }: AvatarProps) => {
  let containerStyles: ViewStyle = {};
  if (size == "small") {
    containerStyles = {
      padding: sw(2),
      width: sw(20),
      height: sw(20),
      borderRadius: sw(20) / 2,
    };
  }
  if (size == "medium") {
    containerStyles = {
      padding: sw(2),
      width: sw(25),
      height: sw(25),
      borderRadius: sw(25) / 2,
    };
  }
  if (size == "big") {
    containerStyles = {
      padding: sw(5),
      width: sw(50),
      height: sw(50),
      borderRadius: sw(50) / 2,
    };
  }
  return (
    <ModalZoomableImage
      buttonStyle={containerStyles}
      listComponents={
        <>
          <Image
            style={{
              width: "100%",
              height: "100%",
              borderRadius: sw(50) / 2,
              objectFit: "cover",
            }}
            source={{ uri: profileImage }}
          />
        </>
      }
      imagePath={profileImage}
    />
  );
};
export default Avatar;
