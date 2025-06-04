import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { companyInfoTable } from "../../db/schema.js";
import { protectedProcedure } from "../core.js";
import { s3Client } from "../../s3.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const readCompanyInfoProcedure = protectedProcedure([
  "BasicInfoManagement",
]).query(async () => {
  const result = await db.select().from(companyInfoTable).limit(1);
  if (result.length === 0) {
    return null;
  }
  const { id, ...rest } = result[0];

  return rest;
});

export const createCompanyInfoProcedure = protectedProcedure([
  "BasicInfoManagement",
])
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

export const updateCompanyInfoProcedure = protectedProcedure([
  "BasicInfoManagement",
])
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

export const deleteCompanyInfoLogoProcedure = protectedProcedure([
  "BasicInfoManagement",
]).mutation(async () => {
  // Step 1: Check if companyInfo exists
  const existing = await db
    .select()
    .from(companyInfoTable)
    .where(eq(companyInfoTable.id, 1))
    .limit(1);
  if (existing.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Company info not found.",
    });
  }
  const companyInfo = existing[0];
  const logoURL = companyInfo.logoURL;

  // Step 2: Delete from S3 if logoURL exists
  if (logoURL) {
    try {
      // Parse the S3 key from the logoURL
      // Example: https://bucket.s3.amazonaws.com/company-logo/logo.png
      const url = new URL(logoURL);
      // Remove the leading slash from pathname
      const s3Key = url.pathname.startsWith("/")
        ? url.pathname.slice(1)
        : url.pathname;
      const BUCKET_NAME = process.env.S3_BUCKET_NAME;
      if (!BUCKET_NAME) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "S3 bucket name not configured.",
        });
      }
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
        })
      );
    } catch (err) {
      console.error("Failed to delete logo from S3:", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete logo from S3.",
      });
    }
  }
  // Step 3: Set logoURL to null in DB
  await db
    .update(companyInfoTable)
    .set({ logoURL: null })
    .where(eq(companyInfoTable.id, 1));
  // Step 4: Return success
  return { success: true };
});
