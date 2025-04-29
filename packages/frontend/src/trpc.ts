import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../backend/src/trpc/router";
import { baseURL, generateHeaders } from "@/constants";
import { queryClient } from "@/query-client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

const config = {
  url: baseURL + "/trpc",
  transformer: superjson,
  headers: generateHeaders,
};

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink(config)],
});
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
