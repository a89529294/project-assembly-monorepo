import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../backend/src/trpc/router";
import { baseURL, sessionTokenKey } from "@/constants";
import { queryClient } from "@/query-client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

const config = {
  url: baseURL + "/trpc",
  transformer: superjson,
  // headers: generateHeaders,
  headers: () => {
    const token = localStorage.getItem(sessionTokenKey);
    return token
      ? { Authorization: `Bearer ${token}` }
      : ({} as Record<string, never>);
  },
};

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink(config)],
});
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
