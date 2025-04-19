// import { trpcApiClient, trpcApiClientProvider } from "@/common/trpc-api";

import { InnerApp } from "./inner-app";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/auth/auth-provider";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { queryClient, router } from "@/trpc";

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
