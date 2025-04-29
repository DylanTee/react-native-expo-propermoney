import React, { ReactNode, useState } from "react";
import CustomButtonItemPicker from "@components/Shared/CustomButtonItemPicker";
import { useMutation } from "@tanstack/react-query";
import {
  TS3GetPresignedUrlResponse,
  TS3GetPresignedUrlBody,
} from "@mcdylanproperenterprise/nodejs-proper-types/s3";
import * as ImagePicker from "expo-image-picker";
import { Buffer } from "buffer";
import axios from "axios";
import {
  Alert,
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
import LoadingCircle from "../LoadingCircle";
import CustomText from "../CustomText";
interface ModalImagePickerProps {
  userId: string;
  buttonStyle?: ViewStyle;
  listComponents: ReactNode;
  type: "profileImage" | "transaction_image";
  onChange(data: string): void;
}

export default function ModalImagePicker(props: ModalImagePickerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [progressText, seProgressText] = useState<number>(0);
  const getS3PresignedUrlMutation = useMutation({
    mutationFn: async (data: TS3GetPresignedUrlBody) => {
      return axios.post(
        `${process.env.EXPO_PUBLIC_PROPER_API_URL}/s3/getPreSignedUrl`,
        data
      );
    },
  });

  enum EMethods {
    camera = "Camera",
    gallery = "Gallery",
  }

  function uploadWithProgress({
    presignedUrl,
    fileBuffer,
    mimeType,
    onProgress,
  }: {
    presignedUrl: string;
    fileBuffer: any; // or ArrayBuffer
    mimeType: string;
    onProgress: (percent: number) => void;
  }) {
    console.log('oiii')
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        console.log(event)
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Upload failed due to a network error."));
      };

      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", mimeType ?? "image/jpeg");
      xhr.send(fileBuffer);
    });
  }

  const handleImageUpload = (file: ImagePicker.ImagePickerAsset) => {
    const mimeType = file.mimeType?.replace("image/", "");
    const fileName = `${props.userId}_${new Date().getTime()}.${mimeType}`;
    const imagePathKey = `propermoney/${props.type}/${fileName}`;
    getS3PresignedUrlMutation.mutate(
      {
        bucketName: process.env.EXPO_PUBLIC_S3_BUCKET_NAME as string,
        mime: mimeType as string,
        key: imagePathKey,
      },
      {
        onSuccess: async (response) => {
          const data: TS3GetPresignedUrlResponse = response.data;
          const buffer = Buffer.from(file.base64 ?? "", "base64");
          // await fetch(data.presignedUrl, {
          //   method: "PUT",
          //   body: buffer,
          //   headers: {
          //     "Content-Type": file.mimeType ?? "image/jpeg",
          //   },
          // });

          await uploadWithProgress({
            presignedUrl: data.presignedUrl,
            fileBuffer: buffer,
            mimeType: file.mimeType ?? "image/jpeg",
            onProgress: (percent) => {
              console.log(`Upload Progress: ${percent}%`);
              seProgressText(percent);
            },
          });

          props.onChange(
            `${process.env.EXPO_PUBLIC_S3_BUCKET_NAME_BASE_URL}/${imagePathKey}`
          );
          setIsVisible(false);
        },
        onError: (e) => {
          Alert.alert(e.message);
        },
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      await getAsset(assets);
    } else if (option == EMethods.gallery) {
      let assets = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
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
        {getS3PresignedUrlMutation.isPending ? (
          <View style={{ flexDirection: "row" }}>
            <CustomText size="medium" label={`${progressText}%`} />
            <LoadingCircle visible={true} />
          </View>
        ) : (
          <>{props.listComponents}</>
        )}
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
              containerStyle={{ padding: sw(15) }}
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
