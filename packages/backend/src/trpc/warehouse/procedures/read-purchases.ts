import { z } from "zod";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../../db";
import { protectedProcedure } from "../../core";
import {
  materialsTable,
  Material,
  MATERIAL_STATUS,
  keyOfMaterialSchema,
  MaterialKey,
} from "@myapp/shared";

const DATE_FIELDS = new Set([
  "arrivalDate",
  "consumedDate",
  "loadingDate",
  "stockedDate",
]);

// Helper function to check if a value is a valid date string
function isValidDateString(value: string): boolean {
  return !isNaN(Date.parse(value));
}

// Helper function to create filter condition based on field type
function createFilterCondition(field: MaterialKey, value: string) {
  const column = materialsTable[field];

  if (DATE_FIELDS.has(field) && isValidDateString(value)) {
    return sql`DATE(${column}) = ${value}`;
  }

  // For all other fields, use ILIKE for partial matching
  return ilike(column, `%${value}%`);
}

export const readPurchasesProcedure = protectedProcedure([
  "WarehouseManagement",
])
  .input(
    z.object({
      cursor: z.number(),
      filters: z
        .array(
          z.object({
            field: keyOfMaterialSchema,
            value: z.string(),
          })
        )
        .optional(),
    })
  )
  .output(
    z.object({
      items: z.array(
        z.custom<Material>((data) => typeof data === "object" && data !== null)
      ),
      nextCursor: z.number().nullish(),
    })
  )
  .query(async ({ input }) => {
    const { cursor, filters } = input;
    const limit = 20;
    const offset = cursor;

    const whereConditions = [
      or(
        eq(materialsTable.status, MATERIAL_STATUS[0]), // TRANSPORTING
        eq(materialsTable.status, MATERIAL_STATUS[1]) // ARRIVED
      ),
    ];

    if (filters && filters.length > 0) {
      const filterConditions = filters.map((filter) => {
        return createFilterCondition(filter.field, filter.value);
      });

      whereConditions.push(and(...filterConditions));
    }

    const items = await db
      .select()
      .from(materialsTable)
      .where(and(...whereConditions))
      .orderBy(desc(materialsTable.createdAt))

      .limit(limit)
      .offset(offset);

    let nextCursor: number | undefined = undefined;
    if (items.length === limit) {
      nextCursor = offset + items.length;
    }

    return {
      items,
      nextCursor,
    };
  });
