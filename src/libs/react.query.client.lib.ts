import { QueryClient } from "@tanstack/react-query";

export const resetQueries = () => {
  queryClient.resetQueries();
};

export const queryClient = new QueryClient();

export const ReactQueryLibs = {
  resetQueries,
};
