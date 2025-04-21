import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../backend/src/trpc/router";
import superjson from "superjson";

import { sessionTokenKey } from "@/constants";
// import { QueryClient } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { queryClient } from "@/query-client";

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: import.meta.env.PROD
        ? "https://awstesthonobe.zapto.org/trpc"
        : "http://localhost:3000/trpc",
      transformer: superjson,
      headers: () => {
        const token = localStorage.getItem(sessionTokenKey);

        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
