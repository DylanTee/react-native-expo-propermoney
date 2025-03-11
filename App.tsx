import React, { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@libs/react.query.client.lib";
import NavigationStack from "@libs/react.navigation.lib";
import { ExpoUpdatesLibs } from "@libs/expo-updates.libs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { AppState, AppStateStatus } from "react-native";
dayjs.extend(duration);

if (__DEV__) {
  require("./ReactotronConfig");
}

export default function App() {
  useEffect(() => {
    if (!__DEV__) {
      const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        // Perform actions based on the app state change
        if (nextAppState == "active") {
          ExpoUpdatesLibs.onFetchUpdateAsync();
        }
      };
      AppState.addEventListener("change", handleAppStateChange);
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationStack />
    </QueryClientProvider>
  );
}
