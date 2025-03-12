import React, { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  TouchableOpacity,
  Vibration,
  View,
  ViewStyle,
} from "react-native";
import { sw } from "@libs/responsive.lib";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import { Colors } from "@styles/Colors";
import CustomText from "../CustomText";
import {
  CameraView,
  useCameraPermissions,
  PermissionStatus,
  BarcodeScanningResult,
} from "expo-camera";
import ContainerLayout from "@components/Layout/ContainerLayout";

interface ModalScanQrCodeProps {
  buttonStyle: ViewStyle;
  listComponents: ReactNode;
  onChange(data: string): void;
}

export default function ModalScanQrCode(props: ModalScanQrCodeProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const viewCenter = useMemo(() => {
    const { width, height } = Dimensions.get("window");
    return { x: width / 2, y: height / 2 };
  }, []);

  const [status, requestPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermission();
  }, []);

  const handleScanned = async (e: BarcodeScanningResult) => {
    const handleData = async (data: string) => {
      Vibration.vibrate();
      setIsVisible(false);
      props.onChange(data);
    };

    const { cornerPoints } = e;
    const quadrilateralCenterX =
      (cornerPoints[0].x +
        cornerPoints[1].x +
        cornerPoints[2].x +
        cornerPoints[3].x) /
      4;

    const quadrilateralCenterY =
      (cornerPoints[0].y +
        cornerPoints[1].y +
        cornerPoints[2].y +
        cornerPoints[3].y) /
      4;

    const isCenterAligned =
      Math.abs(viewCenter.x - quadrilateralCenterX) +
        Math.abs(viewCenter.y - quadrilateralCenterY) <=
      (viewCenter.x + viewCenter.y) / 20;

    if (Platform.OS === "android" && isCenterAligned) {
      handleData(e.data);
    } else {
      handleData(e.data);
    }
  };

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
            <View style={{ flex: 1 }}>
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  zIndex: 10,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(52, 52, 52, 0.7)",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: sw(40),
                      height: sw(40),
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: sw(40 / 2),
                      margin: sw(20),
                    }}
                    onPress={() => {
                      setIsVisible(false);
                    }}
                  >
                    <ExpoVectorIcon
                      name="close"
                      size={sw(24)}
                      color={Colors.white}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flex: 0.5,
                    backgroundColor: "rgba(52, 52, 52, 0.7)",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    padding: sw(0),
                  }}
                >
                  <CustomText
                    label="Scan QR in white box"
                    size="medium"
                    textStyle={{ color: Colors.white, marginBottom: sw(10) }}
                  />
                </View>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(52, 52, 52, 0.7)",
                    }}
                  />
                  <View
                    style={{
                      flex: 2,
                      borderWidth: 2,
                      borderColor: Colors.white,
                    }}
                  />
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(52, 52, 52, 0.7)",
                    }}
                  />
                </View>
                <View
                  style={{
                    flex: 1.5,
                    backgroundColor: "rgba(52, 52, 52, 0.7)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                />
              </View>
              {status?.status === PermissionStatus.GRANTED && (
                <CameraView
                  style={{ flex: 1, width: "100%" }}
                  facing={"back"}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={handleScanned}
                />
              )}
            </View>
          </View>
        </ContainerLayout>
      </Modal>
    </>
  );
}
