import React, { ReactNode, useEffect, useMemo, useState } from "react";
import CustomButtonItemPicker from "@components/Shared/CustomButtonItemPicker";
import { useMutation } from "@tanstack/react-query";
import {
  TS3GetPresignedUrlResponse,
  TS3GetPresignedUrlBody,
} from "@mcdylanproperenterprise/nodejs-proper-types/s3";
import * as ImagePicker from "expo-image-picker";
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
import * as FileSystem from "expo-file-system";
import SizedBox from "../SizedBox";

interface ModalImagePickerProps {
  userId: string;
  buttonStyle?: ViewStyle;
  loadingStyle?: ViewStyle;
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

  const [
    grantedImagePickerMediaLibraryPermission,
    setGrantedImagePickerMediaLibraryPermission,
  ] = useState<boolean | undefined>(undefined);
  const [
    grantedImagePickerCameraPermission,
    setGrantedImagePickerCameraPermission,
  ] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const imagePickerCameraPermissions =
          await ImagePicker.requestCameraPermissionsAsync();
        setGrantedImagePickerCameraPermission(
          imagePickerCameraPermissions.granted
        );
        const imagePickerMediaLibraryPermissions =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        setGrantedImagePickerMediaLibraryPermission(
          imagePickerMediaLibraryPermissions.granted
        );
        
      } catch (e) {}
    };

    checkPermissions();
  }, []);

  async function uploadFileWithProgress({
    putUrl,
    fileUri,
    mimeType,
    onProgress,
  }: {
    putUrl: string;
    fileUri: string;
    mimeType?: string;
    onProgress: (progress: number) => void;
  }) {
    const uploadTask = FileSystem.createUploadTask(
      putUrl,
      fileUri,
      {
        fieldName: "file", // optional for S3 PUT but you can leave it
        httpMethod: "PUT",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          "Content-Type": mimeType ?? "image/jpeg",
        },
      },
      ({ totalBytesSent, totalBytesExpectedToSend }) => {
        const progress = totalBytesExpectedToSend
          ? totalBytesSent / totalBytesExpectedToSend
          : 0;

        onProgress(parseFloat(progress.toFixed(2)));
      }
    );

    const result = await uploadTask.uploadAsync();

    return result;
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
          await uploadFileWithProgress({
            putUrl: data.presignedUrl,
            fileUri: file.uri,
            mimeType: "image/jpeg",
            onProgress: (progress) => {
              if (progress * 100 == 100) {
                seProgressText(0);
              } else {
                seProgressText(progress * 100);
              }
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
        mediaTypes: "images",
        allowsEditing: true,
        quality: 1,
      });

      getAsset(assets);
      setIsVisible(false);
    } else if (option == EMethods.gallery) {
      let assets = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        mediaTypes: "images",
        allowsEditing: true,
        quality: 1,
      });

      getAsset(assets);
      setIsVisible(false);
    }
  };

  const list = useMemo(() => {
    [EMethods.camera, EMethods.gallery];
    let actions = [];
    if (grantedImagePickerCameraPermission) {
      actions.push(EMethods.camera);
    }
    if (grantedImagePickerMediaLibraryPermission) {
      actions.push(EMethods.gallery);
    }
    return actions;
  }, [
    grantedImagePickerCameraPermission,
    grantedImagePickerMediaLibraryPermission,
  ]);
  return (
    <>
      <TouchableOpacity
        style={props.buttonStyle}
        onPress={() => {
          setIsVisible(true);
        }}
      >
        {getS3PresignedUrlMutation.isPending || progressText != 0 ? (
          <View style={[{ flexDirection: "row" }, props.loadingStyle]}>
            <LoadingCircle visible={true} size="small" />
            <SizedBox width={sw(5)} />
            <CustomText size="medium" label={`${progressText.toFixed(0)}%`} />
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
