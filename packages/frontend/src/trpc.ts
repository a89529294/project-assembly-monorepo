import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../backend/src/trpc/router";

import { QueryClient } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { routeTree } from "./routeTree.gen";
import { createRouter } from "@tanstack/react-router";
import { sessionTokenKey } from "@/auth/auth-provider";

export const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  context: { queryClient, auth: undefined! },
});

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: import.meta.env.PROD
        ? "https://awstesthonobe.zapto.org/trpc"
        : "http://localhost:3000/trpc",
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
