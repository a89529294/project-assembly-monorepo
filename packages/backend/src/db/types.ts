import type { RoleFromDb } from "./schema.js";

export type Role = Pick<RoleFromDb, "id" | "name">;
