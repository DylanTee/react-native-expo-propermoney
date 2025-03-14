import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import SizedBox from "@components/Shared/SizedBox";
import { sw } from "@libs/responsive.lib";
import React from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { sh } from "@libs/responsive.lib";
import { useTranslation } from "@libs/i18n/index";
import CustomItemPicker from "@components/Shared/CustomItemPicker";
import { View } from "react-native";
import MemberCard from "@components/Shared/Card/MemberCard";
import ModalTextInput from "@components/Shared/CustomModal/ModalTextInput";
import { useMutation } from "@tanstack/react-query";
import { TPostUserUpdateBody } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { AxiosLibs } from "@libs/axios.lib";
import { catchErrorDialog, handleLogOut } from "@libs/utils";
import ModalLanguagePicker from "@components/Shared/CustomModal/ModalLanguagePicker";
import ModalImagePicker from "@components/Shared/CustomModal/ModalImagePicker";
import ModalCurrencyPicker from "@components/Shared/CustomModal/ModalCurrencyPicker";
import { useAuthStore } from "@libs/zustand/authStore";
import VersionText from "@components/Shared/VersionText";
import CustomText from "@components/Shared/CustomText";

const MoreScreen: AppNavigationScreen<"MoreScreen"> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const userUpdateMutation = useMutation({
    mutationFn: (data: TPostUserUpdateBody) => {
      return AxiosLibs.defaultClient.post("/user/update", data);
    },
  });

  const handleUpdate = (data: TPostUserUpdateBody) => {
    userUpdateMutation.mutate(
      {
        ...data,
      },
      {
        onSuccess: () => {
          authStore.getDetail();
          Alert.alert("Saved");
        },
        onError: (e) => {
          catchErrorDialog(e);
        },
        onSettled: () => {},
      }
    );
  };
  return (
    <>
      <ContainerLayout>
        <Header onBack={() => navigation.goBack()} />
        <ScrollView bounces={false}>
          <MemberCard currentRouteName="MoreScreen" />
          <View style={{ padding: sw(15) }}>
            <ModalTextInput
              headerText="Change Display Name"
              onChange={(data) => {
                handleUpdate({ displayName: data });
              }}
              value={authStore.user?.displayName ?? ""}
              textInputLabel="Display Name"
              listComponents={
                <>
                  <CustomItemPicker
                    title={t("name")}
                    pickedText={authStore.user?.displayName ?? ""}
                  />
                </>
              }
            />
            <SizedBox height={sh(20)} />
            <ModalImagePicker
              buttonStyle={{}}
              type={"profileImage"}
              userId={authStore.user?._id ?? ""}
              onChange={(data) => {
                handleUpdate({ profileImage: data });
              }}
              listComponents={
                <>
                  <CustomItemPicker
                    title={"Profile Image"}
                    pickedText={"Click here"}
                  />
                </>
              }
            />
            <SizedBox height={sh(20)} />
            <ModalCurrencyPicker
              buttonStyle={{}}
              onChange={(data) => {
                handleUpdate({ currency: data });
              }}
              currency={authStore.user?.currency ?? ""}
              listComponents={
                <>
                  <CustomItemPicker
                    title={"Currency"}
                    pickedText={authStore.user?.currency ?? ""}
                  />
                </>
              }
            />
            <SizedBox height={sh(20)} />
            <ModalLanguagePicker
              buttonStyle={{}}
              onChange={(data) => {
                handleUpdate({ language: data });
              }}
              language={authStore.user?.language ?? ""}
              listComponents={
                <>
                  <CustomItemPicker
                    title={"Language"}
                    pickedText={authStore.user?.language.toUpperCase() ?? ""}
                  />
                </>
              }
            />
            <SizedBox height={sh(20)} />
            <TouchableOpacity onPress={() => handleLogOut()}>
              <CustomText label="Log Out" size="medium" />
            </TouchableOpacity>
            <SizedBox height={sh(20)} />
            <VersionText />
            <SizedBox height={sh(40)} />
          </View>
        </ScrollView>
      </ContainerLayout>
    </>
  );
};
export default MoreScreen;
