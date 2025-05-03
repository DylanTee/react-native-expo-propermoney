import React from "react";
import ContainerLayout from "@components/Layout/ContainerLayout";
import { AppNavigationScreen } from "@libs/react.navigation.lib";
import Header from "@components/Shared/Header";
import { sh, sw } from "@libs/responsive.lib";
import { Alert, View } from "react-native";
import { Colors } from "@styles/Colors";
import ExpoVectorIcon from "@libs/expo-vector-icons.libs";
import CustomText from "@components/Shared/CustomText";
import ModalImagePicker from "@components/Shared/CustomModal/ModalImagePicker";
import { useAuthStore } from "@libs/zustand/authStore";
import SizedBox from "@components/Shared/SizedBox";
import { useMutation } from "@tanstack/react-query";
import {
  TAIImageDetectBody,
  TAIImageDetectResponse,
} from "@mcdylanproperenterprise/nodejs-proper-types/ai";
import axios from "axios";
import { currencyList } from "@mcdylanproperenterprise/nodejs-proper-money-types/lists/currency";
import findAmountAndNameOfCategory from "@libs/findAmountAndNameOfCategory";
import { isNumber } from "@libs/utils";

const PhotoAIScreen: AppNavigationScreen<"PhotoAIScreen"> = ({
  navigation,
  route,
}) => {
  const imageDetectMutation = useMutation({
    mutationFn: async (data: TAIImageDetectBody) => {
      return axios.post(
        `${process.env.EXPO_PUBLIC_PROPER_API_URL}/ai/imageDetect`,
        data
      );
    },
  });
  const authStore = useAuthStore();
  const questionAmount = `1) Amount:`;
  const questionContext = `2) Context:`;
  const questionCurrency = `3) Currency: (pick from ${currencyList.map(
    (z) => z.iso
  )})`;
  const totalQuestionsOnText = `\n\nBased on above example above, construct this format ${questionAmount} ${questionContext} ${questionCurrency}`;
  return (
    <>
      <ContainerLayout>
        <Header
          containerStyle={{ paddingHorizontal: sw(15) }}
          onBack={() => navigation.goBack()}
        />
        {imageDetectMutation.isPending ? (
          <CustomText
            containerStyle={{
              padding: sw(15),
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            label="Loading..."
            size="medium"
          />
        ) : (
          <ModalImagePicker
            options={["Camera", "Gallery", "Document"]}
            loadingStyle={{
              alignItems: "center",
              justifyContent: "center",
            }}
            type={"transaction_image"}
            userId={`${authStore.user?._id}`}
            onChange={(data) => {
              imageDetectMutation.mutate(
                {
                  text: totalQuestionsOnText,
                  imageUrl: data,
                },
                {
                  onSuccess: (response) => {
                    const result = response.data as TAIImageDetectResponse;
                    if (result.messageContent != "") {
                      const detectedText = findAmountAndNameOfCategory({
                        message: result.messageContent,
                      });
                      navigation.replace("TransactionsFormScreen", {
                        id: undefined,
                        isEdit: false,
                        dataFromPhotoAIScreen: {
                          currency: detectedText.currency
                            ? detectedText.currency
                            : undefined,
                          amount: detectedText.amount
                            ? isNumber(detectedText.amount)
                              ? detectedText.amount
                              : undefined
                            : undefined,
                          note: detectedText.note
                            ? detectedText.note
                            : undefined,
                          imagePath: data,
                        },
                        onDelete: () => {},
                        onEdit: () => {},
                      });
                    }
                  },
                  onError: (e) => {
                    Alert.alert(e.message);
                  },
                }
              );
            }}
            listComponents={
              <>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    padding: sw(15),
                  }}
                >
                  <CustomText
                    size="medium"
                    label={`Click "Upload File" to select or take a photo of the receipt. The AI will automatically detect the total amount and generate a note based on the result.`}
                  />
                  <SizedBox height={sh(40)} />
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.suvaGrey,
                      borderRadius: sw(5),
                      padding: sw(20),
                      paddingHorizontal: sw(40),
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ExpoVectorIcon
                      name="upload"
                      size={sw(50)}
                      color={Colors.black}
                    />
                    <SizedBox height={sh(10)} />
                    <View>
                      <CustomText
                        label="Upload file"
                        textStyle={{
                          color: Colors.primary,
                          textDecorationLine: "underline",
                        }}
                        size="medium"
                      />
                    </View>
                  </View>
                </View>
              </>
            }
          />
        )}
      </ContainerLayout>
    </>
  );
};
export default PhotoAIScreen;
