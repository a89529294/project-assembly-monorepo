// src/schemas/project-assembly-location.schema.ts
import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { baseAuditSchema } from "./common";
import { projectAssemblySubLocationsTable } from "./project-assembly-sub-location";

export const projectAssemblyLocationsTable = pgTable(
  "project_assembly_location",
  {
    ...baseAuditSchema,
    district: text("district").notNull(),
  }
);

export const projectAssemblyLocationRelations = relations(
  projectAssemblyLocationsTable,
  ({ many }) => ({
    subLocations: many(projectAssemblySubLocationsTable),
  })
);

export type ProjectAssemblyLocation =
  typeof projectAssemblyLocationsTable.$inferSelect;
export type NewProjectAssemblyLocation =
  typeof projectAssemblyLocationsTable.$inferInsert;
