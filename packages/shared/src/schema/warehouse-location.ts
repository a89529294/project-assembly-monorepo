import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { baseSchema } from './common';
import { warehouseSubLocationsTable } from './warehouse-sub-location';

export const warehouseLocationsTable = pgTable('warehouse_locations', {
  ...baseSchema,
  district: text('district').notNull(),
});

export const warehouseLocationRelations = relations(
  warehouseLocationsTable,
  ({ many }) => ({
    warehouseSubLocations: many(warehouseSubLocationsTable),
  }),
);

export type WarehouseLocation = typeof warehouseLocationsTable.$inferSelect;
export type NewWarehouseLocation = typeof warehouseLocationsTable.$inferInsert;
