// src/schemas/material.schema.ts
import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { baseSchema } from "./common";
import { projectAssemblyMaterialRelation } from "./project-assembly";
import { materialSourceEnum, materialStatusEnum } from "./enum";
import { employeesTable } from "./employees";
import { warehouseSubLocationsTable } from "./warehouse-sub-location"; // Added for relation

export const materialsTable = pgTable("materials", {
  ...baseSchema,
  supplier: text("supplier"),
  labelId: text("label_id").unique(), // 素材ID Set when status changes to arrvied
  typeName: text("type_name"), // 素材型號
  material: text("material").notNull(), // 材質
  specification: text("specification").notNull(), // 斷面規格
  length: text("length").notNull(),
  weight: text("weight").notNull(),
  procurementNumber: text("procurement_number"), // 採購案號
  loadingNumber: text("loading_number"), // 裝車單號
  furnaceNumber: text("furnace_number"),
  millSheetNo: text("mill_sheet_no"), // 材質證明
  millSheetNoNR: text("mill_sheet_no_nr"), // 無輻射證明,
  // if millSheetNoNR is provided in xlsx use it
  // else if millSHeetNo is provided, use `${millSheetNo}_nr`
  arrivalConfirmedEmployeeId: uuid("arrival_confirmed_employee_id").references(
    () => employeesTable.id
  ), // 進貨人員
  arrivalDate: timestamp("arrival_date"), // 進貨日期
  consumedByEmployeeId: uuid("consumed_by_employee_id").references(
    () => employeesTable.id
  ), // 銷貨人員
  consumedDate: timestamp("consumed_date"), // 銷貨日期
  defaultCode: text("default_code"), // 預設工程代碼
  loadingDate: timestamp("loading_date", {
    withTimezone: true,
    mode: "date",
  }), // 中龍出廠日期
  memo1: text("memo1"),
  memo2: text("memo2"),
  memo3: text("memo3"),
  memo4: text("memo4"),
  memo5: text("memo5"),

  warehouseSubLocationId: uuid("warehouse_sub_location_id").references(
    () => warehouseSubLocationsTable.id
  ),
  status: materialStatusEnum("status").notNull(),
  stockedByEmployeeId: uuid("stocked_by_employee_id").references(
    () => employeesTable.id
  ),
  stockedDate: timestamp("stocked_date"),
  originalSource: materialSourceEnum("original_source").notNull(), // set once on creation
  currentSource: materialSourceEnum("current_source").notNull(), // updates everytime material is updated either through excel or sync, or manual if the material is created.
});

export const materialRelations = relations(materialsTable, ({ one, many }) => ({
  projectAssemblies: many(projectAssemblyMaterialRelation),
  warehouseSubLocation: one(warehouseSubLocationsTable, {
    fields: [materialsTable.warehouseSubLocationId],
    references: [warehouseSubLocationsTable.id],
  }),
}));

export type Material = typeof materialsTable.$inferSelect;
export type NewMaterial = typeof materialsTable.$inferInsert;
