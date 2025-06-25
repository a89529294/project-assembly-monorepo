import {
  employeesTable,
  materialsTable,
  uploadMaterialsUsingXLSXInputSchema,
} from "@myapp/shared";
import { eq, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { protectedProcedure } from "../../core";

export const createPurchasesUsingXLSXProcedure = protectedProcedure([
  "WarehouseManagement",
])
  .input(uploadMaterialsUsingXLSXInputSchema)
  .mutation(async ({ input }) => {
    const determineMaterialStatus = (material: {
      consumedDate?: Date | null;
      arrivalDate?: Date | null;
    }): "CONSUMED" | "ARRIVED" | "TRANSPORTING" => {
      if (material.consumedDate) {
        return "CONSUMED";
      }
      if (material.arrivalDate) {
        return "ARRIVED";
      }
      return "TRANSPORTING";
    };

    // 1. Employee Name to ID Mapping
    const allEmployeeNames = [
      ...new Set([
        ...input.map((row) => row.arrivalConfirmedEmployeeName).filter(Boolean),
        ...input.map((row) => row.consumedByEmployeeName).filter(Boolean),
      ]),
    ] as string[];

    const employees =
      allEmployeeNames.length > 0
        ? await db
            .select({ id: employeesTable.id, chName: employeesTable.chName })
            .from(employeesTable)
            .where(inArray(employeesTable.chName, allEmployeeNames))
        : [];

    const employeeMap = employees.reduce(
      (acc, employee) => {
        if (employee.chName) {
          acc[employee.chName] = employee.id;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    return await db.transaction(async (tx) => {
      const updatePromises: Promise<any>[] = [];
      const materialsToInsert: any[] = [];
      let updatedCount = 0;

      // Pre-fetch existing materials by labelId for efficient lookup
      const inputLabelIds = input
        .map((i) => i.labelId)
        .filter(Boolean) as string[];
      const existingMaterials =
        inputLabelIds.length > 0
          ? await tx
              .select()
              .from(materialsTable)
              .where(inArray(materialsTable.labelId, inputLabelIds))
          : [];
      const existingMaterialsMap = new Map(
        existingMaterials.map((m) => [m.labelId, m])
      );

      for (const newMaterial of input) {
        const status = determineMaterialStatus(newMaterial);

        const processedMaterial = {
          ...newMaterial,
          status,
          arrivalConfirmedEmployeeId:
            newMaterial.arrivalConfirmedEmployeeName &&
            employeeMap[newMaterial.arrivalConfirmedEmployeeName]
              ? employeeMap[newMaterial.arrivalConfirmedEmployeeName]
              : undefined,
          consumedByEmployeeId:
            newMaterial.consumedByEmployeeName &&
            employeeMap[newMaterial.consumedByEmployeeName]
              ? employeeMap[newMaterial.consumedByEmployeeName]
              : undefined,
          length: String(newMaterial.length),
          weight: String(newMaterial.weight),
        };

        const existing = newMaterial.labelId
          ? existingMaterialsMap.get(newMaterial.labelId)
          : undefined;

        if (existing) {
          // Update existing material
          updatePromises.push(
            tx
              .update(materialsTable)
              .set(processedMaterial)
              .where(eq(materialsTable.id, existing.id))
          );
          updatedCount++;
        } else {
          // Add new material to insertion list
          materialsToInsert.push({
            ...processedMaterial,
            originalSource: "MANUAL" as const,
            currentSource: "MANUAL" as const,
          });
        }
      }

      // Batch insert new materials
      if (materialsToInsert.length > 0) {
        updatePromises.push(
          tx.insert(materialsTable).values(materialsToInsert)
        );
      }

      await Promise.all(updatePromises);

      return {
        updated: updatedCount,
        created: materialsToInsert.length,
        message: "Upload processed successfully.",
      };
    });
  });
