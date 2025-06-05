// src/schemas/process-work-detail.schema.ts
import { pgTable, text, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseAuditSchema } from "./common";
import { processWorkTypesTable } from "./process-work-type";

export enum ProcessWorkDetailStatus {
  COMPLETE = "完成",
  ERROR = "錯誤",
  CHECK = "檢測",
}

export const processWorkDetailStatusEnum = pgEnum(
  "process_work_detail_status",
  [
    ProcessWorkDetailStatus.COMPLETE,
    ProcessWorkDetailStatus.ERROR,
    ProcessWorkDetailStatus.CHECK,
  ]
);

export const processWorkDetailsTable = pgTable("process_work_detail", {
  ...baseAuditSchema,
  name: text("name").notNull(),
  type: processWorkDetailStatusEnum("type").notNull(),

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
