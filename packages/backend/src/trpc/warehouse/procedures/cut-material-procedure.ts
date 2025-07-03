import { materialsTable } from "@myapp/shared";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../db";
import { protectedProcedure } from "../../core";

export const cutMaterialInputSchema = z.object({
  materialId: z.string(),
  count: z.number().int().positive().lte(10),
});

export const cutMaterialProcedure = protectedProcedure(["WarehouseManagement"])
  .input(cutMaterialInputSchema)
  .mutation(async ({ input }) => {
    const { materialId, count } = input;

    return db.transaction(async (tx) => {
      const [originalMaterial] = await tx
        .select()
        .from(materialsTable)
        .where(eq(materialsTable.id, materialId));

      if (!originalMaterial) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Material not found.",
        });
      }

      const newMaterials = [];
      for (let i = 1; i <= count; i++) {
        const newLabelId = `${originalMaterial.labelId}-${i
          .toString()
          .padStart(3, "0")}`;

        const newMaterial = {
          ...originalMaterial,
          labelId: newLabelId,
          isCuttable: false,
        };

        const { id, ...newMaterialWithoutId } = newMaterial;

        newMaterials.push(newMaterialWithoutId);
      }

      if (newMaterials.length > 0) {
        await tx.insert(materialsTable).values(newMaterials);
      }

      await tx.delete(materialsTable).where(eq(materialsTable.id, materialId));

      return { success: true, count: newMaterials.length };
    });
  });
