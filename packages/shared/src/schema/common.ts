import { text, timestamp, uuid } from "drizzle-orm/pg-core";

export const baseSchema = {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const auditFields = {
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
};

export const softDeleteField = {
  deletedAt: timestamp("deleted_at"),
  deletedBy: text("deleted_by"),
};

export const baseAuditSchema = {
  ...baseSchema,
  ...auditFields,
};

export const baseSoftDeleteSchema = {
  ...baseAuditSchema,
  ...softDeleteField,
};
