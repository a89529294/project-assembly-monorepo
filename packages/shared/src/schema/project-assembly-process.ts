// src/schemas/project-assembly-process.schema.ts
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "./common";
import { projectAssembliesTable } from "./project-assembly";
import { processWorkTypesTable } from "./process-work-type";
import { employeesTable } from ".";

export const projectAssemblyProcessTable = pgTable("project_assembly_process", {
  ...baseSchema,
  name: text("name").notNull(),
  operateDate: timestamp("operate_date"),
  detailName: text("detail_name"),
  detailStatus: text("detail_status"),
  sequence: integer("sequence"),
  queue: integer("queue").notNull().default(20),
  memo1: text("memo1"),
  memo2: text("memo2"),
  memo3: text("memo3"),
  memo4: text("memo4"),
  projectAssemblyId: uuid("project_assembly_id")
    .notNull()
    .references(() => projectAssembliesTable.id, { onDelete: "cascade" }),
  workerId: uuid("worker_id").references(() => employeesTable.id, {
    onDelete: "set null",
  }),
  processWorkTypeId: uuid("process_work_type_id").references(
    () => processWorkTypesTable.id,
    {
      onDelete: "set null",
    }
  ),
});

// Relations
export const projectAssemblyProcessRelations = relations(
  projectAssemblyProcessTable,
  ({ one }) => ({
    // Many-to-one relationship with ProjectAssembly
    projectAssembly: one(projectAssembliesTable, {
      fields: [projectAssemblyProcessTable.projectAssemblyId],
      references: [projectAssembliesTable.id],
    }),

    // Many-to-one relationship with Employee (worker)
    worker: one(employeesTable, {
      fields: [projectAssemblyProcessTable.workerId],
      references: [employeesTable.id],
    }),

    // Many-to-one relationship with ProcessWorkType
    processWorkType: one(processWorkTypesTable, {
      fields: [projectAssemblyProcessTable.processWorkTypeId],
      references: [processWorkTypesTable.id],
    }),
  })
);

// Add this to employee.schema.ts if not exists:
// projectAssemblyProcesses: many(projectAssemblyProcessTable),

export type ProjectAssemblyProcess =
  typeof projectAssemblyProcessTable.$inferSelect;
export type NewProjectAssemblyProcess =
  typeof projectAssemblyProcessTable.$inferInsert;
