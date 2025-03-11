import * as Device from "expo-device";

const isTablet = Device.deviceType === Device.DeviceType.TABLET;

export const ExpoDeviceLib = {
  isTablet,
};
