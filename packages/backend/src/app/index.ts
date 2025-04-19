import { Hono } from "hono";
import authRoutes from "./auth.js";

const appRoutes = new Hono();

// Mount mobile auth routes under /app/auth
appRoutes.route("/auth", authRoutes);

appRoutes.get("/example", (c) => {
  return c.json({ message: "Hello from /app/example" });
});

// Add more /app/* routes here

export default appRoutes;
