import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      placeholderData: (p: unknown) => p,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
  // TODO: Use this instead of all the individual onError for each mutation call.
  // You can simply customize the error message by throwing an erro from the backend.
  queryCache: new QueryCache({
    onError: (error) => toast.error(`錯誤訊息: ${error.message}`),
  }),
  mutationCache: new MutationCache({
    onError: (error) => toast.error(`錯誤訊息: ${error.message}`),
  }),
});
