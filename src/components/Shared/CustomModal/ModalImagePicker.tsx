import React, { ReactNode, useState } from "react";
import CustomButtonItemPicker from "@components/Shared/CustomButtonItemPicker";
import { useMutation } from "@tanstack/react-query";
import {
  TS3GetPresignedUrlResponse,
  TS3GetPresignedUrlBody,
} from "@mcdylanproperenterprise/nodejs-proper-types/s3";
import * as ImagePicker from "expo-image-picker";
import { Buffer } from "buffer";
import { ENV } from "../../../../environment/index";
import axios from "axios";
import {
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Header from "../Header";
import { sw } from "@libs/responsive.lib";
import ContainerLayout from "@components/Layout/ContainerLayout";
interface ModalImagePickerProps {
  userId: string;
  buttonStyle?: ViewStyle;
  listComponents: ReactNode;
  type: "profileImage" | "transaction_image";
  onChange(data: string): void;
}

export default function ModalImagePicker(props: ModalImagePickerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const getS3PresignedUrlMutation = useMutation({
    mutationFn: async (data: TS3GetPresignedUrlBody) => {
      return axios.post(`${ENV.PROPER_API_URL}/s3/getPreSignedUrl`, data);
    },
  });

  enum EMethods {
    camera = "Camera",
    gallery = "Gallery",
  }

  const handleImageUpload = (file: ImagePicker.ImagePickerAsset) => {
    const mimeType = file.mimeType?.replace("image/", "");
    const fileName = `${props.userId}_${new Date().getTime()}.${mimeType}`;
    const imagePathKey = `propermoney/${props.type}/${fileName}`;
    getS3PresignedUrlMutation.mutate(
      {
        bucketName: ENV.S3_BUCKET_NAME,
        mime: mimeType as string,
        key: imagePathKey,
      },
      {
        onSuccess: async (response) => {
          const data: TS3GetPresignedUrlResponse = response.data;
          const buffer = Buffer.from(file.base64 ?? "", "base64");
          await fetch(data.presignedUrl, {
            method: "PUT",
            body: buffer,
            headers: {
              "Content-Type": file.mimeType ?? "image/jpeg",
            },
          });
          props.onChange(`${ENV.S3_BUCKET_NAME_BASE_URL}/${imagePathKey}`);
          setIsVisible(false);
        },
        onError: (e) => {},
      }
    );
  };

  const handleOptionsPicked = async (option: EMethods) => {
    const getAsset = (result: ImagePicker.ImagePickerResult) => {
      if (result && result.assets && result.assets.length > 0) {
        const assest = result
          .assets[0] as unknown as ImagePicker.ImagePickerAsset;
        handleImageUpload(assest);
      }
    };

    if (option == EMethods.camera) {
      let assets = await ImagePicker.launchCameraAsync({
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        // aspect: [4, 3],
        quality: 1,
      });

      await getAsset(assets);
    } else if (option == EMethods.gallery) {
      let assets = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        // aspect: [4, 3],
        quality: 1,
      });

      await getAsset(assets);
    }
  };

  const list = [EMethods.camera, EMethods.gallery];
  return (
    <>
      <TouchableOpacity
        style={props.buttonStyle}
        onPress={() => {
          setIsVisible(true);
        }}
      >
        {props.listComponents}
      </TouchableOpacity>
      <Modal animationType="slide" visible={isVisible}>
        <ContainerLayout>
          <View
            style={{
              flex: 1,
              paddingTop: Platform.OS === "android" ? 0 : sw(50),
            }}
          >
            <Header
              onBack={() => {
                setIsVisible(false);
              }}
            />
            <ScrollView>
              {list.map((option) => (
                <CustomButtonItemPicker
                  key={option}
                  text={option}
                  isSelect={false}
                  onPress={() => {
                    handleOptionsPicked(option);
                    setIsVisible(false);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </ContainerLayout>
      </Modal>
    </>
  );
}
