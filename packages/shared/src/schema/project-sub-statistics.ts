// src/schemas/project-sub-statistic.schema.ts
import {
  pgTable,
  uuid,
  text,
  decimal,
  integer,
  jsonb,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { baseSchema } from "./common";
import { projectStatisticsTable } from "./project-statistics";
import { processWorkTypesTable } from "./process-work-type";
import { projectSubStatisticCompletedAssemblyTable } from "./project-sub-statistics-completed-assembly";

export const projectSubStatisticsTable = pgTable(
  "project_sub_statistic",
  {
    ...baseSchema,
    name: text("name").notNull(),
    errorRate: decimal("error_rate", { precision: 11, scale: 2 }).notNull(),
    completeRate: decimal("complete_rate", {
      precision: 11,
      scale: 2,
    }).notNull(),
    averageOutput: decimal("average_output", {
      precision: 11,
      scale: 2,
    }).notNull(),
    averageOutputWeight: decimal("average_output_weight", {
      precision: 11,
      scale: 2,
    }).notNull(),
    completeWeight: decimal("complete_weight", {
      precision: 11,
      scale: 2,
    }).notNull(),
    totalWeight: decimal("total_weight", { precision: 11, scale: 2 }).notNull(),
    completeQuantity: integer("complete_quantity").notNull(),
    totalQuantity: integer("total_quantity").notNull(),
    workDuration: integer("work_duration").notNull(),
    workDays: jsonb("work_days").notNull().$type<string[]>(),

    // Foreign keys
    projectStatisticId: uuid("project_statistic_id")
      .notNull()
      .references(() => projectStatisticsTable.id, { onDelete: "cascade" }),

    processWorkTypeId: uuid("process_work_type_id")
      .notNull()
      .references(() => processWorkTypesTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    // Ensure one-to-one relationship with process_work_type
    uniqueProcessWorkType: unique(
      "project_sub_statistic_process_work_type_unique"
    ).on(table.processWorkTypeId),
  })
);

// Project Sub Statistic Relations
export const projectSubStatisticRelations = relations(
  projectSubStatisticsTable,
  ({ one, many }) => ({
    // Many-to-one with ProjectStatistic
    projectStatistic: one(projectStatisticsTable, {
      fields: [projectSubStatisticsTable.projectStatisticId],
      references: [projectStatisticsTable.id],
    }),

    // One-to-one with ProcessWorkType
    processWorkType: one(processWorkTypesTable, {
      fields: [projectSubStatisticsTable.processWorkTypeId],
      references: [processWorkTypesTable.id],
    }),

    // One-to-many with ProjectSubStatisticCompletedAssembly
    completedProjectAssemblies: many(projectSubStatisticCompletedAssemblyTable),
  })
);

export type ProjectSubStatistic = typeof projectSubStatisticsTable.$inferSelect;
export type NewProjectSubStatistic =
  typeof projectSubStatisticsTable.$inferInsert;
