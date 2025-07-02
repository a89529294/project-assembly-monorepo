import {
  employeesTable,
  keyOfMaterialSchema,
  MATERIAL_STATUS,
  MaterialKey,
  materialsTable,
} from "@myapp/shared";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, ilike, sql, SQL } from "drizzle-orm";
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

const readMaterialsByStatus = async (
  status: (typeof MATERIAL_STATUS)[number],
  input: { cursor: number; filters?: { field: MaterialKey; value: string }[] }
) => {
  const { cursor, filters } = input;
  const limit = 20;
  const offset = cursor;

  const whereConditions: (SQL<unknown> | undefined)[] = [
    eq(materialsTable.status, status),
  ];

  if (filters && filters.length > 0) {
    const filterConditions = filters
      .map((filter) => createFilterCondition(filter.field, filter.value))
      .filter((condition): condition is SQL<unknown> => !!condition);

    if (filterConditions.length > 0) {
      whereConditions.push(and(...filterConditions));
    }
  }

  const query = db
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
    .where(and(...whereConditions.filter((c): c is SQL<unknown> => !!c)))
    .orderBy(desc(materialsTable.labelId))
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
    console.error("Failed to read materials:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while reading materials.",
      cause: error,
    });
  }
};

const ordersAndPurchasesInput = z.object({
  cursor: z.number(),
  filters: z
    .array(
      z.object({
        field: keyOfMaterialSchema,
        value: z.string(),
      })
    )
    .optional(),
});

export const readOrdersProcedure = protectedProcedure(["WarehouseManagement"])
  .input(ordersAndPurchasesInput)
  .query(({ input }) => {
    return readMaterialsByStatus(MATERIAL_STATUS[0], input); // TRANSPORTING
  });

export const readPurchasesProcedure = protectedProcedure([
  "WarehouseManagement",
])
  .input(ordersAndPurchasesInput)
  .query(({ input }) => {
    return readMaterialsByStatus(MATERIAL_STATUS[1], input); // ARRIVED
  });
