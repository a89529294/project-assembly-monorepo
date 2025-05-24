// src/schemas/project-sub-statistic-completed-assembly.schema.ts
import {
  pgTable,
  uuid,
  text,
  decimal,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "./common";
import { ProjectAssemblyChangeStatus } from "./constants";
import { projectSubStatisticsTable } from "./project-sub-statistics";

export const projectSubStatisticCompletedAssemblyTable = pgTable(
  "project_sub_statistic_completed_assembly",
  {
    ...baseSchema,
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
    change: text("change", {
      enum: Object.values(ProjectAssemblyChangeStatus) as [string, ...string[]],
    }),

    // Foreign key
    completedSubStatisticId: uuid("completed_sub_statistic_id")
      .notNull()
      .references(() => projectSubStatisticsTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    // Add index on type column for better query performance
    typeIdx: index("project_sub_statistic_completed_assembly_type_idx").on(
      table.type
    ),
  })
);

// Project Sub Statistic Completed Assembly Relations
export const projectSubStatisticCompletedAssemblyRelations = relations(
  projectSubStatisticCompletedAssemblyTable,
  ({ one }) => ({
    // Many-to-one with ProjectSubStatistic
    completedSubStatistic: one(projectSubStatisticsTable, {
      fields: [
        projectSubStatisticCompletedAssemblyTable.completedSubStatisticId,
      ],
      references: [projectSubStatisticsTable.id],
    }),
  })
);

export type ProjectSubStatisticCompletedAssembly =
  typeof projectSubStatisticCompletedAssemblyTable.$inferSelect;
export type NewProjectSubStatisticCompletedAssembly =
  typeof projectSubStatisticCompletedAssemblyTable.$inferInsert;
