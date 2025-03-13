import Header from "@components/Shared/Header";
import { Colors } from "@styles/Colors";
import React, { ReactNode, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { sw } from "@libs/responsive.lib";
import ContainerLayout from "@components/Layout/ContainerLayout";

interface ModalZoomableImageProps {
  listComponents: ReactNode;
  imagePath: string;
  buttonStyle: ViewStyle;
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
            <Header
              onBack={() => {
                setIsVisible(false);
              }}
            />
            <View style={{ flex: 1, backgroundColor: Colors.black }}>
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
                  onError={(e) => {}}
                />
              </ReactNativeZoomableView>
            </View>
          </View>
        </ContainerLayout>
      </Modal>
    </>
  );
}
