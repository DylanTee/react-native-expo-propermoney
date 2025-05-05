import React, { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { asyncStoragePersister, queryClient } from "@libs/react.query.client.lib";
import NavigationStack from "@libs/react.navigation.lib";
import { ExpoUpdatesLibs } from "@libs/expo-updates.libs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { AppState, AppStateStatus } from "react-native";
import { AsyncStorageLib } from "@libs/async.storage.lib";
import { persistQueryClient } from '@tanstack/react-query-persist-client';
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
          await AsyncStorageLib.getAppRestartAt();
          ExpoUpdatesLibs.onFetchUpdateAsync();
        }
      };
      AppState.addEventListener("change", handleAppStateChange);
    }
  }, []);

  useEffect(() => {
    persistQueryClient({
      queryClient,
      persister: asyncStoragePersister,
      maxAge: 72 * 60 * 60 * 1000, // cache 3 day
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationStack />
    </QueryClientProvider>
  );
}
