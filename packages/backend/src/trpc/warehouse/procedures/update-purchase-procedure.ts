import { TRPCError } from "@trpc/server";
import { db } from "../../../db";
import { protectedProcedure } from "../../core";
import { createPurchaseInputSchema, materialsTable } from "@myapp/shared";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const updatePurchaseInputSchema = createPurchaseInputSchema.extend({
  id: z.string(),
});

export const updatePurchaseProcedure = protectedProcedure([
  "WarehouseManagement",
])
  .input(updatePurchaseInputSchema)
  .mutation(async ({ input }) => {
    try {
      const { id, ...updateData } = input;

      const [updatedMaterial] = await db
        .update(materialsTable)
        .set({
          ...updateData,
          length: String(updateData.length),
          weight: String(updateData.weight),
          loadingDate: updateData.loadingDate
            ? new Date(updateData.loadingDate)
            : undefined,
          currentSource: "MANUAL",
        })
        .where(eq(materialsTable.id, id))
        .returning();

      if (!updatedMaterial) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase not found.",
        });
      }

      return updatedMaterial;
    } catch (error) {
      console.error("Failed to update purchase:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while updating the purchase.",
        cause: error,
      });
    }
  });
