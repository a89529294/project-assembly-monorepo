// src/schemas/project-parts.schema.ts
import { pgTable, text, uuid, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "./common";
import { projectAssembliesTable } from "./project-assembly";

export const projectPartsTable = pgTable("project_parts", {
  ...baseSchema,
  partNumber: text("part_number").notNull(),
  name: text("name").notNull(),
  quantity: decimal("quantity", { precision: 11, scale: 2 }).notNull(),
  // Add other part fields as needed

  projectAssemblyId: uuid("project_assembly_id")
    .notNull()
    .references(() => projectAssembliesTable.id, { onDelete: "cascade" }),
});

export const projectPartsRelations = relations(
  projectPartsTable,
  ({ one }) => ({
    projectAssembly: one(projectAssembliesTable, {
      fields: [projectPartsTable.projectAssemblyId],
      references: [projectAssembliesTable.id],
    }),
  })
);

export type ProjectParts = typeof projectPartsTable.$inferSelect;
export type NewProjectParts = typeof projectPartsTable.$inferInsert;
