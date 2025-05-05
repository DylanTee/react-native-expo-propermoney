import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetQueries = () => {
  queryClient.resetQueries();
};

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_TRANSACTIONS_CACHE',
  throttleTime: 1000, // optional: debounce writes
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 mins
      gcTime: 72 * 60 * 60 * 1000 // // cache 3 day
    },
  },
});

export const ReactQueryLibs = {
  resetQueries,
};
