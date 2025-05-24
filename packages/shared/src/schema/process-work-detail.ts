// src/schemas/process-work-detail.schema.ts
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseAuditSchema } from "./common";
import { processWorkTypesTable } from "./process-work-type";

export const processWorkDetailsTable = pgTable("process_work_detail", {
  ...baseAuditSchema,
  name: text("name").notNull(),
  type: text("type").notNull(),

  // Foreign keys
  processWorkTypeId: uuid("process_work_type_id")
    .notNull()
    .references(() => processWorkTypesTable.id, { onDelete: "cascade" }),

  checkTargetId: uuid("check_target_id").references(
    () => processWorkTypesTable.id,
    { onDelete: "set null" }
  ),
});

// Relations
export const processWorkDetailRelations = relations(
  processWorkDetailsTable,
  ({ one }) => ({
    // Many-to-one relationship with ProcessWorkType (as processWorkType)
    processWorkType: one(processWorkTypesTable, {
      fields: [processWorkDetailsTable.processWorkTypeId],
      references: [processWorkTypesTable.id],
      relationName: "processWorkTypeDetails",
    }),

    // Many-to-one relationship with ProcessWorkType (as checkTarget)
    checkTarget: one(processWorkTypesTable, {
      fields: [processWorkDetailsTable.checkTargetId],
      references: [processWorkTypesTable.id],
      relationName: "checkTargetDetails",
    }),
  })
);

export type ProcessWorkDetail = typeof processWorkDetailsTable.$inferSelect;
export type NewProcessWorkDetail = typeof processWorkDetailsTable.$inferInsert;
