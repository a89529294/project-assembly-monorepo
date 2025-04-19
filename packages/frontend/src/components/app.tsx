// import { trpcApiClient, trpcApiClientProvider } from "@/common/trpc-api";

import { InnerApp } from "./inner-app";
import { queryClient, router } from "@/constants";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/auth/auth-provider";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export function App() {
  return (
    // <trpcApiClient.Provider
    //   client={trpcApiClientProvider}
    //   queryClient={queryClient}
    // >
    <>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <InnerApp />
        </QueryClientProvider>
      </AuthProvider>
      <TanStackRouterDevtools router={router} />
    </>
    // </trpcApiClient.Provider>
  );
}
