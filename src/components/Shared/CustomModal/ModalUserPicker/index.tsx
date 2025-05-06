import ContainerLayout from "@components/Layout/ContainerLayout";
import Header from "@components/Shared/Header";
import { sw } from "@libs/responsive.lib";
import { ReactNode, useMemo, useState } from "react";
import React, {
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useGetUserDetailQuery } from "@libs/react-query/hooks/useGetUserDetailQuery";
import CustomButtonItemPicker from "@components/Shared/CustomButtonItemPicker";

interface ModalUserCategoryPickerProps {
  userId: string | undefined;
  listComponents: ReactNode;
  buttonStyle?: ViewStyle;
  onChange(id: string | undefined): void;
}

export default function ModalUserPicker(props: ModalUserCategoryPickerProps) {
  const { data: user } = useGetUserDetailQuery();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const options = useMemo(() => {
    let users: { text: string; id: undefined | string }[] = [];
    if (user && user?.sharedUserInfo) {
      users = [
        { text: "Everyone", id: undefined },
        { text: user.displayName, id: user._id },
        { text: user.sharedUserInfo.displayName, id: user.sharedUserInfo._id },
      ];
    }
    return users;
  }, [user]);

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setIsVisible(true);
        }}
        style={props.buttonStyle}
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
              containerStyle={{ padding: sw(15) }}
              onBack={() => {
                setIsVisible(false);
              }}
            />
            <ScrollView>
              {options.map((option,index) => (
                <CustomButtonItemPicker
                  key={index}
                  text={option.text}
                  isSelect={props.userId == option.id}
                  onPress={() => {
                    props.onChange(option.id);
                    setIsVisible(false);
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
