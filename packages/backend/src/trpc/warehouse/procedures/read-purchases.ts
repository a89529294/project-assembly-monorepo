import {
  employeesTable,
  keyOfMaterialSchema,
  MATERIAL_STATUS,
  MaterialKey,
  materialsTable,
} from "@myapp/shared";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../db";
import { protectedProcedure } from "../../core";

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

    let query = db
      .select({
        ...getTableColumns(materialsTable),
        arrivalConfirmedEmployee: {
          id: employeesTable.id,
          chName: employeesTable.chName,
        },
      })
      .from(materialsTable)
      .leftJoin(
        employeesTable,
        eq(materialsTable.arrivalConfirmedEmployeeId, employeesTable.id)
      )
      .where(and(...whereConditions))
      .orderBy(desc(materialsTable.createdAt))
      .limit(limit)
      .offset(offset);

    try {
      const materials = await query;

      let nextCursor: number | undefined = undefined;
      if (materials.length === limit) {
        nextCursor = offset + materials.length;
      }

      return {
        items: materials,
        nextCursor,
      };
    } catch (error) {
      console.error("Failed to read purchases:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while reading purchases.",
        cause: error,
      });
    }
  });
