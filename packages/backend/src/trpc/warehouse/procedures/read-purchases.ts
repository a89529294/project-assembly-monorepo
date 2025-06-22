import { z } from "zod";
import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "../../../db";
import { protectedProcedure } from "../../core";
import {
  materialsTable,
  Material,
  MATERIAL_STATUS,
  keyOfMaterialSchema,
} from "@myapp/shared";

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
        const column = materialsTable[filter.field];
        return ilike(column, `%${filter.value}%`);
      });

      whereConditions.push(and(...filterConditions));
    }

    const items = await db
      .select()
      .from(materialsTable)
      .where(and(...whereConditions))
      .orderBy(materialsTable.labelId) // Order is important for consistent pagination
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
