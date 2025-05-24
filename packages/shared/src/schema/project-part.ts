// src/schemas/project-parts.schema.ts
import { pgTable, text, uuid, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseAuditSchema } from "./common";
import { projectAssembliesTable } from "./project-assembly";

export const projectPartsTable = pgTable("project_parts", {
  ...baseAuditSchema,
  name: text("name").notNull(),
  specification: text("specification").notNull(),
  type: text("type").notNull(),
  length: decimal("length", { precision: 11, scale: 2 }).notNull(),
  height: decimal("height", { precision: 11, scale: 2 }).notNull(),
  width: decimal("width", { precision: 11, scale: 2 }).notNull(),
  t1: decimal("t1", { precision: 11, scale: 2 }).notNull(),
  t2: decimal("t2", { precision: 11, scale: 2 }).notNull(),
  material: text("material").notNull(),
  weight: decimal("weight", { precision: 11, scale: 2 }).notNull(),
  area: decimal("area", { precision: 11, scale: 2 }).notNull(),
  drawingName: text("drawing_name").notNull(),

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
