import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { companyInfoTable, employeesTable } from "../../db/schema.js";
import { protectedProcedure, publicProcedure } from "../core.js";

export const getEmployeesProcedure = publicProcedure.query(async () => {
  return db.select().from(employeesTable);
});

export const getCompanyInfoProcedure = protectedProcedure(
  "company-info:read"
).query(async () => {
  const result = await db.select().from(companyInfoTable).limit(1);
  if (result.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Company info not found.",
    });
  }
  return result[0];
});

export const createCompanyInfoProcedure = protectedProcedure(
  "company-info:create"
)
  .input(
    z.object({
      name: z.string().min(1),
      phone: z.string().min(1),
      email: z.string().min(1),
      fax: z.string().min(1),
      taxId: z.string().min(1),
      county: z.string().min(1),
      district: z.string().min(1),
      address: z.string().min(1),
      logoURL: z.string().min(1).optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Only allow insert if no row exists
    const existing = await db.select().from(companyInfoTable).limit(1);
    if (existing.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Company info already exists. Only one row allowed.",
      });
    }
    await db.insert(companyInfoTable).values({
      id: 1,
      ...input,
    });
    return { success: true };
  });

export const updateCompanyInfoProcedure = protectedProcedure(
  "company-info:update"
)
  .input(
    z.object({
      name: z.string().min(1).optional(),
      phone: z.string().min(1).optional(),
      email: z.string().min(1).optional(),
      county: z.string().min(1).optional(),
      district: z.string().min(1).optional(),
      address: z.string().min(1).optional(),
      fax: z.string().min(1).optional(),
      taxId: z.string().min(1).optional(),
      logoURL: z.string().min(1).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const updateFields = input;
    const existing = await db
      .select()
      .from(companyInfoTable)
      .where(eq(companyInfoTable.id, 1))
      .limit(1);
    if (existing.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Company info not found for update.",
      });
    }
    await db
      .update(companyInfoTable)
      .set(updateFields)
      .where(eq(companyInfoTable.id, 1));
    return { success: true };
  });

// export const uploadCompanyLogoProcedure = protectedProcedure(
//   "company-info:create"
// )
//   .input(z.instanceof(File))
//   .mutation(async ({ input, ctx }) => {

//   });
