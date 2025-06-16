import { z } from "zod";
import { and, eq, or } from "drizzle-orm";
import { db } from "../../../db";
import { protectedProcedure } from "../../core";
import { materialsTable, Material, MATERIAL_STATUS } from "@myapp/shared";

export const readPurchasesProcedure = protectedProcedure([
  "WarehouseManagement",
])
  .input(
    z.object({
      cursor: z.number(),
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
    const limit = 10;
    const offset = input.cursor;

    const items = await db
      .select()
      .from(materialsTable)
      .where(
        or(
          eq(materialsTable.status, MATERIAL_STATUS[0]), // TRANSPORTING
          eq(materialsTable.status, MATERIAL_STATUS[1]) // ARRIVED
        )
      )
      .orderBy(materialsTable.createdAt) // Order is important for consistent pagination
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
