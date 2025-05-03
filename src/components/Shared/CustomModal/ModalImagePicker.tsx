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
import * as DocumentPicker from "expo-document-picker";
import SizedBox from "../SizedBox";

type TModalImagePickerOptions = "Camera" | "Gallery" | "Document";
interface ModalImagePickerProps {
  userId: string;
  options: TModalImagePickerOptions[];
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

  const uploadFile = (file: {
    filePath: string;
    mimeType: string;
    fileExtension: string;
  }) => {
    setIsVisible(false);

    const fileNamePrefix = `${props.userId}_${new Date().getTime()}`;
    const fileName = `${fileNamePrefix}.${file.fileExtension}`;
    const imagePathKey = `propermoney/${props.type}/${fileName}`;
    getS3PresignedUrlMutation.mutate(
      {
        bucketName: process.env.EXPO_PUBLIC_S3_BUCKET_NAME as string,
        mime: file.mimeType,
        key: imagePathKey,
      },
      {
        onSuccess: async (response) => {
          const data: TS3GetPresignedUrlResponse = response.data;
          const uploadTask = FileSystem.createUploadTask(
            data.presignedUrl,
            file.filePath,
            {
              fieldName: fileNamePrefix,
              httpMethod: "PUT",
              uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
              headers: {
                "Content-Type": file.mimeType,
              },
            },
            ({ totalBytesSent, totalBytesExpectedToSend }) => {
              const progress = totalBytesExpectedToSend
                ? totalBytesSent / totalBytesExpectedToSend
                : 0;
              if (progress * 100 == 100) {
                seProgressText(0);
              } else {
                seProgressText(progress * 100);
              }
            }
          );
          await uploadTask.uploadAsync();
          props.onChange(
            `${process.env.EXPO_PUBLIC_S3_BUCKET_NAME_BASE_URL}/${imagePathKey}`
          );
        },
        onError: (e) => {
          Alert.alert(e.message);
        },
      }
    );
  };

  const handleMethodClick = async (option: TModalImagePickerOptions) => {
    if (option == "Camera") {
      let assets = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 1,
      });
      if (assets && assets.assets && assets.assets.length > 0) {
        const file = assets.assets[0];
        if (file.mimeType) {
          uploadFile({
            filePath: file.uri,
            mimeType: file.mimeType,
            fileExtension: file.uri.split(".").pop() as string,
          });
        }
      }
    } else if (option == "Gallery") {
      let assets = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 1,
      });
      if (assets && assets.assets && assets.assets.length > 0) {
        const file = assets.assets[0];
        if (file.mimeType) {
          uploadFile({
            filePath: file.uri,
            mimeType: file.mimeType,
            fileExtension: file.uri.split(".").pop() as string,
          });
        }
      }
    } else if (option == "Document") {
      let assets = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (assets && assets.assets && assets.assets.length > 0) {
        const file = assets.assets[0];
        if (file.mimeType) {
          uploadFile({
            filePath: file.uri,
            mimeType: file.mimeType,
            fileExtension: file.uri.split(".").pop() as string,
          });
        }
      }
    }
  };

  const options = useMemo(() => {
    let options: TModalImagePickerOptions[] = [];
    if (grantedImagePickerCameraPermission) {
      options.push("Camera");
    }
    if (grantedImagePickerMediaLibraryPermission) {
      options.push("Gallery");
    }
    options.push("Document");
    return options;
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
              {options.map((option) => (
                <CustomButtonItemPicker
                  key={option}
                  text={option}
                  isSelect={false}
                  onPress={() => {
                    handleMethodClick(option);
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
