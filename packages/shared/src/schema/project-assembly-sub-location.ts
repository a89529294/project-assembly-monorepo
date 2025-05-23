// src/schemas/project-assembly-sub-location.schema.ts
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "./common";
import { projectAssembliesTable } from "./project-assembly";
import { projectAssemblyLocationsTable } from "./project-assembly-location";

export const projectAssemblySubLocationsTable = pgTable(
  "project_assembly_sub_location",
  {
    ...baseSchema,
    name: text("name").notNull(),
    projectAssemblyLocationId: uuid("project_assembly_location_id")
      .notNull()
      .references(() => projectAssemblyLocationsTable.id, {
        onDelete: "cascade",
      }),
  }
);

export const projectAssemblySubLocationRelations = relations(
  projectAssemblySubLocationsTable,
  ({ one, many }) => ({
    projectAssemblyLocation: one(projectAssemblyLocationsTable, {
      fields: [projectAssemblySubLocationsTable.projectAssemblyLocationId],
      references: [projectAssemblyLocationsTable.id],
    }),
    projectAssemblies: many(projectAssembliesTable),
  })
);

export type ProjectAssemblySubLocation =
  typeof projectAssemblySubLocationsTable.$inferSelect;
export type NewProjectAssemblySubLocation =
  typeof projectAssemblySubLocationsTable.$inferInsert;
