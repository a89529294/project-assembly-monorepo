import { materialsTable } from "@myapp/shared";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../db";
import { protectedProcedure } from "../../core";

export const deleteMaterialProcedure = protectedProcedure(["WarehouseManagement"])
  .input(z.string())
  .mutation(async ({ input: materialId }) => {
    const result = await db
      .delete(materialsTable)
      .where(eq(materialsTable.id, materialId));

    if (result.rowCount === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Material not found or already deleted.",
      });
    }

    return { success: true };
  });
