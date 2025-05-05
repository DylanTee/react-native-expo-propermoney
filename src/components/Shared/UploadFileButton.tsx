import { sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React, {
  Linking,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import CustomText from "./CustomText";
import SizedBox from "./SizedBox";
import AntDesign from "@expo/vector-icons/AntDesign";
import ModalImagePicker from "./CustomModal/ModalImagePicker";
import ModalZoomableImage from "./CustomModal/ModalZoomableImage";
import { useGetUserDetailQuery } from "@libs/react-query/hooks/useGetUserDetailQuery";

type UploadFileButtonProps = {
  containerStyle?: ViewStyle;
  filePath?: string | null;
  onDelete: () => void;
  onUploadSuccess: (imagePath: string) => void;
};

export default function UploadFileButton(props: UploadFileButtonProps) {
  const { data: user } = useGetUserDetailQuery();
  const fileExtension = props.filePath?.split(".").pop();
  const isImage =
    fileExtension === "jpg" ||
    fileExtension === "jpeg" ||
    fileExtension === "png";

  const ImageFileText = () => {
    return (
      <View style={{ flex: 1}}>
        <CustomText
          size="medium"
          textStyle={{ flex: 1 }}
          label={`${props.filePath?.split("/").pop()}`}
        />
        <SizedBox height={sh(5)} />
        <CustomText
          label="Uploaded"
          textStyle={{
            color: Colors.primary,
          }}
          size="small"
        />
      </View>
    );
  };
  return (
    <View
      style={[
        props.containerStyle,
        {
          borderWidth: 1,
          borderColor: Colors.suvaGrey,
          borderRadius: sw(5),
          padding: sw(15),
        },
      ]}
    >
      {props.filePath ? (
        <>
          <View style={{ flexDirection: "row", flex: 1 }}>
            <AntDesign
              name="checkcircle"
              size={sw(24)}
              color={Colors.primary}
            />
            <SizedBox width={sw(20)} />
            {isImage ? (
              <ModalZoomableImage
                buttonStyle={{ flex: 1 }}
                listComponents={<>{ImageFileText()}</>}
                imagePath={props.filePath}
              />
            ) : (
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  if (props.filePath) {
                    Linking.openURL(props.filePath);
                  }
                }}
              >
                {ImageFileText()}
              </TouchableOpacity>
            )}
            <SizedBox width={sw(10)} />
            <TouchableOpacity
              style={{
                backgroundColor: Colors.gainsboro,
                width: sw(30),
                height: sw(30),
                borderRadius: sw(60 / 2),
                justifyContent: "center",
                alignItems: "center",
                marginLeft: "auto",
              }}
              onPress={() => props.onDelete()}
            >
              <AntDesign name="delete" size={sw(17)} color="black" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <ModalImagePicker
            options={["Camera", "Gallery", "Document"]}
            loadingStyle={{ flex: 1, alignSelf: "flex-end" }}
            type={"transaction_image"}
            userId={`${user?._id}`}
            onChange={(data) => {
              props.onUploadSuccess(data);
            }}
            listComponents={
              <>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AntDesign name="upload" size={sw(24)} color="black" />
                  <SizedBox width={sw(20)} />
                  <View>
                    <CustomText
                      label="Upload file"
                      textStyle={{
                        color: Colors.primary,
                        textDecorationLine: "underline",
                      }}
                      size="medium"
                    />
                    <SizedBox height={sh(5)} />
                    <CustomText
                      size="small"
                      label={`PDF, JPEG or PNG less than 10 MB`}
                    />
                  </View>
                </View>
              </>
            }
          />
        </>
      )}
    </View>
  );
}
