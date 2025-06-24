import { TRPCError } from "@trpc/server";
import { db } from "../../../db";
import { protectedProcedure } from "../../core";
import { createPurchaseInputSchema, materialsTable } from "@myapp/shared";

export const createPurchaseProcedure = protectedProcedure([
  "WarehouseManagement",
])
  .input(createPurchaseInputSchema)
  .mutation(async ({ input }) => {
    try {
      const [newMaterial] = await db
        .insert(materialsTable)
        .values({
          ...input,
          length: String(input.length),
          weight: String(input.weight),
          loadingDate: input.loadingDate
            ? new Date(input.loadingDate)
            : undefined,
          status: "TRANSPORTING",
          originalSource: "MANUAL",
          currentSource: "MANUAL",
        })
        .returning();

      console.log(newMaterial);

      if (!newMaterial) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create purchase.",
        });
      }

      return newMaterial;
    } catch (error) {
      console.error("Failed to create purchase:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while creating the purchase.",
        cause: error,
      });
    }
  });
