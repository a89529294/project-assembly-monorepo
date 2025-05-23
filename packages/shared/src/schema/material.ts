// src/schemas/material.schema.ts
import {
  pgTable,
  text,
  uuid,
  varchar,
  decimal,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "./common";
import { projectAssemblyMaterialRelation } from "./project-assembly";

export const materialsTable = pgTable("materials", {
  ...baseSchema,
  // Basic Information
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  description: text("description"),
  specification: text("specification"),
  unit: varchar("unit", { length: 50 }),

  // Material Properties
  materialType: varchar("material_type", { length: 100 }),
  materialGrade: varchar("material_grade", { length: 100 }),
  thickness: decimal("thickness", { precision: 10, scale: 2 }),
  width: decimal("width", { precision: 10, scale: 2 }),
  length: decimal("length", { precision: 10, scale: 2 }),
  weight: decimal("weight", { precision: 12, scale: 4 }),
  color: varchar("color", { length: 50 }),

  // Supplier Information
  supplierName: varchar("supplier_name", { length: 255 }),
  supplierCode: varchar("supplier_code", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 255 }),

  // Inventory
  stockQuantity: decimal("stock_quantity", { precision: 12, scale: 4 }).default(
    "0"
  ),
  minStockLevel: decimal("min_stock_level", { precision: 12, scale: 4 }),
  maxStockLevel: decimal("max_stock_level", { precision: 12, scale: 4 }),
  reorderPoint: decimal("reorder_point", { precision: 12, scale: 4 }),

  // Costing
  unitCost: decimal("unit_cost", { precision: 12, scale: 4 }),
  currency: varchar("currency", { length: 3 }).default("TWD"),

  // Additional Metadata
  isActive: boolean("is_active").default(true),
  notes: text("notes"),

  // Audit
  lastStockUpdate: timestamp("last_stock_update"),
  lastPurchaseDate: timestamp("last_purchase_date"),
});

export const materialRelations = relations(materialsTable, ({ many }) => ({
  projectAssemblies: many(projectAssemblyMaterialRelation),
}));

export type Material = typeof materialsTable.$inferSelect;
export type NewMaterial = typeof materialsTable.$inferInsert;
