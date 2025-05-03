import Header from "@components/Shared/Header";
import { Colors } from "@styles/Colors";
import React, { ReactNode, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { sh, sw } from "@libs/responsive.lib";
import ContainerLayout from "@components/Layout/ContainerLayout";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";

interface ModalZoomableImageProps {
  listComponents: ReactNode;
  imagePath: string;
  buttonStyle?: ViewStyle;
}

export default function ModalZoomableImage(props: ModalZoomableImageProps) {
  const windowDimensions = useWindowDimensions();
  const [isVisible, setIsVisible] = useState<boolean>(false);
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
            <View style={{ flex: 1, backgroundColor: Colors.black }}>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  zIndex: 1,
                  padding: sw(15),
                  paddingTop: sh(20),
                }}
                onPress={() => setIsVisible(false)}
              >
                <ExpoVectorIcon
                  name={"close"}
                  size={sw(30)}
                  color={Colors.white}
                />
              </TouchableOpacity>
              <ReactNativeZoomableView
                maxZoom={10}
                minZoom={1}
                zoomStep={2}
                onZoomBefore={() => {
                  return false;
                }}
                contentHeight={windowDimensions.height}
                contentWidth={windowDimensions.width}
              >
                <Image
                  source={{
                    uri: props.imagePath,
                  }}
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                  resizeMode={"contain"}
                />
              </ReactNativeZoomableView>
            </View>
          </View>
        </ContainerLayout>
      </Modal>
    </>
  );
}
