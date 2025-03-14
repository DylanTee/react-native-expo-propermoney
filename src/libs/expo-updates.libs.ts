import * as Updates from "expo-updates";

async function onFetchUpdateAsync() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (e) {
    console.log(`Error fetching latest Expo update: ${e}`);
  }
}

const handleAppRestart = () => {
  Updates.reloadAsync();
};

export const ExpoUpdatesLibs = {
  handleAppRestart,
  onFetchUpdateAsync,
};
