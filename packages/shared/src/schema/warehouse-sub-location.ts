import { relations } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { baseSchema } from './common';
import { warehouseLocationsTable } from './warehouse-location';
import { materialsTable } from './material';

export const warehouseSubLocationsTable = pgTable('warehouse_sub_locations', {
  ...baseSchema,
  name: text('name').notNull(),
  warehouseLocationId: uuid('warehouse_location_id')
    .notNull()
    .references(() => warehouseLocationsTable.id, { onDelete: 'cascade' }),
});

export const warehouseSubLocationRelations = relations(
  warehouseSubLocationsTable,
  ({ one, many }) => ({
    warehouseLocation: one(warehouseLocationsTable, {
      fields: [warehouseSubLocationsTable.warehouseLocationId],
      references: [warehouseLocationsTable.id],
    }),
    materials: many(materialsTable),
  }),
);

export type WarehouseSubLocation = typeof warehouseSubLocationsTable.$inferSelect;
export type NewWarehouseSubLocation = typeof warehouseSubLocationsTable.$inferInsert;
