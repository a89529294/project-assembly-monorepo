import { QueryClient } from "@tanstack/react-query";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      placeholderData: (p: unknown) => p,
    },
  },
});
