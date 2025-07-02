import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { protectedProcedure } from "../../core";
import { MATERIAL_STATUS, materialsTable } from "@myapp/shared";
import { TRPCError } from "@trpc/server";

export const confirmMaterialArrivalInputSchema = z.object({
  purchaseIds: z.array(z.string().min(1)),
  arrivalConfirmedEmployeeId: z.string().min(1),
});

export const confirmMaterialArrivalProcedure = protectedProcedure([
  "WarehouseManagement",
])
  .input(confirmMaterialArrivalInputSchema)
  .mutation(async ({ input }) => {
    try {
      const { purchaseIds, arrivalConfirmedEmployeeId } = input;

      const result = await db
        .update(materialsTable)
        .set({
          status: MATERIAL_STATUS[1],
          arrivalDate: new Date(),
          arrivalConfirmedEmployeeId,
        })
        .where(
          and(
            inArray(materialsTable.id, purchaseIds),
            eq(materialsTable.status, "TRANSPORTING")
          )
        );

      return { count: result.rowCount };
    } catch (error) {
      console.error("Failed to confirm material arrival:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "An unexpected error occurred while confirming material arrival.",
        cause: error,
      });
    }
  });
