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
import ModalTextInput from "@components/Shared/CustomModal/ModalTextInput";
import { useMutation } from "@tanstack/react-query";
import { TPostUserUpdateBody } from "@mcdylanproperenterprise/nodejs-proper-money-types/types";
import { AxiosLibs } from "@libs/axios.lib";
import ModalImagePicker from "@components/Shared/CustomModal/ModalImagePicker";
import ModalCurrencyPicker from "@components/Shared/CustomModal/ModalCurrencyPicker";
import { useAuthStore } from "@libs/zustand/authStore";
import VersionText from "@components/Shared/VersionText";
import CustomText from "@components/Shared/CustomText";
import Avatar from "@components/Shared/Avatar";
import { Colors } from "@styles/Colors";
import { useGetUserDetailQuery } from "@libs/react-query/hooks/useGetUserDetailQuery";

const MoreScreen: AppNavigationScreen<"MoreScreen"> = ({
  navigation,
  route,
}) => {
  const authStore = useAuthStore();
  const { t } = useTranslation();
  const { data: user, refetch } = useGetUserDetailQuery();
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
          Alert.alert("Saved");
          refetch();
        },
        onError: (e) => {
          Alert.alert(e.message);
        },
      }
    );
  };
  return (
    <>
      <ContainerLayout>
        <Header
          containerStyle={{ padding: sw(15) }}
          onBack={() => navigation.goBack()}
        />
        <ScrollView bounces={false}>
          <View
            style={{
              paddingHorizontal: sw(15),
              paddingBottom: sh(5),
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Avatar size="big" profileImage={user?.profileImage ?? ``} />
              <SizedBox width={sw(5)} />
              <CustomText label={user?.displayName ?? ``} size={"medium"} />
            </View>
          </View>
          <View style={{ padding: sw(15) }}>
            <ModalTextInput
              headerText="Change Display Name"
              onChange={(data) => {
                handleUpdate({ displayName: data });
              }}
              value={user?.displayName ?? ""}
              textInputLabel="Display Name"
              listComponents={
                <>
                  <CustomItemPicker
                    title={t("name")}
                    pickedText={user?.displayName ?? ""}
                  />
                </>
              }
            />
            <SizedBox height={sh(20)} />
            <ModalImagePicker
              options={["Camera", "Gallery"]}
              type={"profileImage"}
              userId={user?._id ?? ""}
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
              currency={user?.currency ?? ""}
              listComponents={
                <>
                  <CustomItemPicker
                    title={"Currency"}
                    pickedText={user?.currency ?? ""}
                  />
                </>
              }
            />
            {/* <SizedBox height={sh(20)} />
            <ModalLanguagePicker
              buttonStyle={{}}
              onChange={(data) => {
                handleUpdate({ language: data });
              }}
              language={user?.language ?? ""}
              listComponents={
                <>
                  <CustomItemPicker
                    title={"Language"}
                    pickedText={user?.language.toUpperCase() ?? ""}
                  />
                </>
              }
            /> */}
            <SizedBox height={sh(20)} />
            <TouchableOpacity
              style={{
                justifyContent: "flex-end",
                alignItems: "flex-end",
                paddingHorizontal: sw(10),
              }}
              onPress={() => authStore.logOut()}
            >
              <CustomText
                label="Log Out"
                size="medium"
                textStyle={{ color: Colors.red }}
              />
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
