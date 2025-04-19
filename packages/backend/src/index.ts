import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import * as dotenv from "dotenv";

import appRoutes from "./app/index.js";
import { appRouter } from "./trpc/router.js";

const envPath = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envPath });

const app = new Hono();
app.use("*", cors());

app.get("/", (c) => {
  return c.json({ success: true });
});

// Mount /app routes
app.route("/app", appRoutes);

// Mount tRPC
app.use(
  "/trpc/*",
  trpcServer({ router: appRouter, createContext: (_opts, c) => ({ c }) })
);

serve({
  fetch: app.fetch,
  port: 3000,
});
