import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

const envPath = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envPath });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
