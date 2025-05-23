// src/schemas/project-statistic.schema.ts
import {
  pgTable,
  uuid,
  decimal,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "./common";
import { projectsTable } from ".";
import { projectSubStatisticsTable } from "./project-sub-statistics";

export const projectStatisticsTable = pgTable("project_statistic", {
  ...baseSchema,
  projectTotalWeight: decimal("project_total_weight", {
    precision: 11,
    scale: 2,
  }).notNull(),
  projectTotalQuantity: decimal("project_total_quantity", {
    precision: 11,
    scale: 2,
  }).notNull(),
  projectCompleteTotalWeight: decimal("project_complete_total_weight", {
    precision: 11,
    scale: 2,
  }).notNull(),
  projectCompleteTotalQuantity: decimal("project_complete_total_quantity", {
    precision: 11,
    scale: 2,
  }).notNull(),

  // Foreign key
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" })
    .unique(),
});

// Project Statistic Relations
export const projectStatisticRelations = relations(
  projectStatisticsTable,
  ({ one, many }) => ({
    // One-to-one with Project
    project: one(projectsTable, {
      fields: [projectStatisticsTable.projectId],
      references: [projectsTable.id],
    }),

    // One-to-many with ProjectSubStatistic
    subStatistics: many(projectSubStatisticsTable),
  })
);

export type ProjectStatistic = typeof projectStatisticsTable.$inferSelect;
export type NewProjectStatistic = typeof projectStatisticsTable.$inferInsert;
