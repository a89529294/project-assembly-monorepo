// src/schemas/process-work-type.schema.ts
import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { baseSoftDeleteSchema } from "./common";

import { employeesTable, projectAssemblyProcessTable, projectsTable } from ".";
import { processWorkDetailsTable } from "./process-work-detail";
import { projectSubStatisticsTable } from "./project-sub-statistics";

export const processWorkTypesTable = pgTable("process_work_type", {
  ...baseSoftDeleteSchema,
  name: text("name").notNull(),
  startAt: timestamp("start_at"),
  endAt: timestamp("end_at"),
  sequence: integer("sequence").notNull(),
  queue: integer("queue").notNull().default(20),

  // Foreign keys
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id),
});

// Many-to-many relationship between ProcessWorkType and Employee
export const processWorkTypeEmployee = pgTable(
  "process_work_type_employee",
  {
    processWorkTypeId: uuid("process_work_type_id")
      .notNull()
      .references(() => processWorkTypesTable.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employeesTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.processWorkTypeId, table.employeeId] }),
  ]
);

// Relations
export const processWorkTypeRelations = relations(
  processWorkTypesTable,
  ({ one, many }) => ({
    // Many-to-one with Project
    project: one(projectsTable, {
      fields: [processWorkTypesTable.projectId],
      references: [projectsTable.id],
    }),

    // One-to-many with ProcessWorkDetail (as processWorkType)
    processWorkDetails: many(processWorkDetailsTable, {
      relationName: "processWorkTypeDetails",
    }),

    // One-to-many with ProcessWorkDetail (as checkTarget)
    checkDetails: many(processWorkDetailsTable, {
      relationName: "checkTargetDetails",
    }),

    // Many-to-many with Employee
    workers: many(processWorkTypeEmployee),

    // One-to-many with ProjectAssemblyProcess
    projectAssemblyProcesses: many(projectAssemblyProcessTable),

    // One-to-one with ProjectSubStatistic
    projectSubStatistic: one(projectSubStatisticsTable, {
      fields: [processWorkTypesTable.id],
      references: [projectSubStatisticsTable.processWorkTypeId],
    }),
  })
);

// Employee relation for the many-to-many relationship
export const processWorkTypeEmployeeRelations = relations(
  processWorkTypeEmployee,
  ({ one }) => ({
    processWorkType: one(processWorkTypesTable, {
      fields: [processWorkTypeEmployee.processWorkTypeId],
      references: [processWorkTypesTable.id],
    }),
    employee: one(employeesTable, {
      fields: [processWorkTypeEmployee.employeeId],
      references: [employeesTable.id],
    }),
  })
);

export type ProcessWorkType = typeof processWorkTypesTable.$inferSelect;
export type NewProcessWorkType = typeof processWorkTypesTable.$inferInsert;
