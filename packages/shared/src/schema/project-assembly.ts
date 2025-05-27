// src/schemas/project-assembly.schema.ts
import { relations } from "drizzle-orm";
import {
  decimal,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { baseAuditSchema } from "./common";

import { projectsTable } from ".";
import { materialsTable } from "./material";
import { projectAssemblyProcessTable } from "./project-assembly-process";
import { projectAssemblySubLocationsTable } from "./project-assembly-sub-location";
import { projectPartsTable } from "./project-part";

// Create enum for change status
export const projectAssemblyChangeStatus = pgEnum(
  "project_assembly_change_status",
  ["CREATED", "UPDATED", "DELETED", "REPLACED"]
);

export const projectAssembliesTable = pgTable(
  "project_assemblies",
  {
    ...baseAuditSchema,

    tagId: text("tag_id").notNull().unique(),
    assemblyId: text("assembly_id").notNull(),
    name: text("name").notNull(),
    installPosition: text("install_position").notNull(),
    installHeight: decimal("install_height", {
      precision: 11,
      scale: 2,
    }).notNull(),
    areaType: text("area_type").notNull(),
    transportNumber: text("transport_number"),
    transportDesc: text("transport_desc"),
    tagTransportNumber: text("tag_transport_number"),
    drawingName: text("drawing_name").notNull(),
    totalWidth: decimal("total_width", { precision: 11, scale: 2 }).notNull(),
    totalHeight: decimal("total_height", { precision: 11, scale: 2 }).notNull(),
    totalLength: decimal("total_length", { precision: 11, scale: 2 }).notNull(),
    totalWeight: decimal("total_weight", { precision: 11, scale: 2 }).notNull(),
    totalArea: decimal("total_area", { precision: 11, scale: 2 }).notNull(),
    specification: text("specification").notNull(),
    material: text("material").notNull(),
    type: text("type").notNull(),
    memo1: text("memo1"),
    memo2: text("memo2"),
    vehicleIdentificationNumber: text("vehicle_identification_number"),
    shippingNumber: text("shipping_number"),
    shippingDate: timestamp("shipping_date"),
    change: projectAssemblyChangeStatus("change"),

    // Foreign keys
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id),

    projectAssemblySubLocationId: uuid(
      "project_assembly_sub_location_id"
    ).references(() => projectAssemblySubLocationsTable.id, {
      onDelete: "set null",
    }),
  },
  (table) => [index("project_assembly_project_id_idx").on(table.projectId)]
);

// Many-to-many relationship table
export const projectAssemblyMaterialRelation = pgTable(
  "project_assembly_material_relation",
  {
    projectAssemblyId: uuid("project_assembly_id")
      .notNull()
      .references(() => projectAssembliesTable.id, { onDelete: "cascade" }),
    materialId: uuid("material_id")
      .notNull()
      .references(() => materialsTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.projectAssemblyId, table.materialId] }),
  ]
);

// Relations
export const projectAssemblyRelations = relations(
  projectAssembliesTable,
  ({ one, many }) => ({
    // Project relationship
    project: one(projectsTable, {
      fields: [projectAssembliesTable.projectId],
      references: [projectsTable.id],
    }),

    // Sub-location relationship
    projectAssemblySubLocation: one(projectAssemblySubLocationsTable, {
      fields: [projectAssembliesTable.projectAssemblySubLocationId],
      references: [projectAssemblySubLocationsTable.id],
    }),

    // Many-to-many with Material
    materialRelations: many(projectAssemblyMaterialRelation),

    // One-to-many relationships
    projectParts: many(projectPartsTable),
    projectAssemblyProcesses: many(projectAssemblyProcessTable),
  })
);

// Material relation relations
export const projectAssemblyMaterialRelations = relations(
  projectAssemblyMaterialRelation,
  ({ one }) => ({
    projectAssembly: one(projectAssembliesTable, {
      fields: [projectAssemblyMaterialRelation.projectAssemblyId],
      references: [projectAssembliesTable.id],
    }),
    material: one(materialsTable, {
      fields: [projectAssemblyMaterialRelation.materialId],
      references: [materialsTable.id],
    }),
  })
);

export type ProjectAssembly = typeof projectAssembliesTable.$inferSelect;
export type NewProjectAssembly = typeof projectAssembliesTable.$inferInsert;
