import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import SizedBox from "@components/Shared/SizedBox";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import { sh, sw } from "@libs/responsive.lib";
import { Colors } from "@styles/Colors";
import React from "react";
import { Linking, View } from "react-native";
import { useTranslation } from "@libs/i18n/index";
import CustomText from "@components/Shared/CustomText";
import CustomButtonIconRight from "@components/Shared/CustomButtonIconRight";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import { useAuthStore } from "@libs/zustand/authStore";

const ContactSupportScreen: AppNavigationScreen<"ContactSupportScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const contactNumber = "+60174449716";
  const emailAddress = "aksoonz@gmail.com";
  const text = `Hi, i would like to ask some questions regarding the app.\n\n\nID:${authStore.user?._id}\nMEMBER:${authStore.user?.feature.name}`;
  return (
    <ContainerLayout>
      <Header
        containerStyle={{ padding: sw(15) }}
        onBack={() => navigation.goBack()}
      />
      <View style={{ padding: sw(15) }}>
        <CustomText label={t("chooseMethod")} size={"medium"} />
        <SizedBox height={sh(20)} />
        <CustomButtonIconRight
          title={"WhatsApps"}
          onPress={() =>
            Linking.openURL(
              `https://api.whatsapp.com/send?phone=${contactNumber}&text=${text}`
            )
          }
        >
          <ExpoVectorIcon name="phone" size={sw(25)} color={Colors.black} />
        </CustomButtonIconRight>
        <SizedBox height={sh(10)} />
        <CustomButtonIconRight
          title={"Mail"}
          onPress={() =>
            Linking.openURL(
              `mailto:${emailAddress}?subject=Contact Support[Proper Money]&body=${text}`
            )
          }
        >
          <ExpoVectorIcon name="mail" size={sw(25)} color={Colors.black} />
        </CustomButtonIconRight>
      </View>
    </ContainerLayout>
  );
};
export default ContactSupportScreen;
