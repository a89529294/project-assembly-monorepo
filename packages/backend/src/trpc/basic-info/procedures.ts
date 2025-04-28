import { publicProcedure } from "../core.js";
import { protectedProcedure } from "../core.js";
import { db } from "../../db/index.js";
import { employeesTable } from "../../db/schema.js";
import { companyInfoTable } from "../../db/schema.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "../../s3.js";
import { octetInputParser } from "@trpc/server/http";
import { detectMimeType, streamToBuffer } from "../helpers.js";
import { fileTypeFromBuffer } from "file-type";

export const getEmployeesProcedure = publicProcedure.query(async () => {
  return db.select().from(employeesTable);
});

export const createCompanyInfoProcedure = protectedProcedure(
  "company-info:create"
)
  .input(
    z.object({
      name: z.string().min(1),
      phone: z.string().min(1),
      email: z.string().min(1),
      county: z.string().min(1),
      district: z.string().min(1),
      address: z.string().min(1),
      fax: z.string().min(1),
      taxId: z.string().min(1),
    })
  )
  .mutation(async ({ ctx, input }) => {
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

// --- Company Info Procedures ---

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

export const uploadCompanyLogoProcedure = protectedProcedure(
  "company-info:create"
)
  .input(octetInputParser)
  .mutation(async ({ input, ctx }) => {
    const fileBuffer = await streamToBuffer(input);

    // Detect mime type
    const mimeType = await fileTypeFromBuffer(fileBuffer);
    console.log(mimeType);
    if (!mimeType) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid file type or could not determine file type",
      });
    }

    // Validate file type
    const validMimeTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!validMimeTypes.includes(mimeType.mime)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid file type. Only JPEG, PNG, and SVG are allowed.",
      });
    }

    const BUCKET_NAME = process.env.S3_BUCKET_NAME;
    const fileExtension = mimeType.ext;
    const folderPath = `company-logo/`;
    const key = `${folderPath}logo.${fileExtension}`;

    try {
      // First, list objects in the company logo folder to check if anything exists
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: folderPath,
      });

      const listedObjects = await s3Client.send(listCommand);

      // Delete any existing objects in the folder
      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        for (const object of listedObjects.Contents) {
          if (object.Key) {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: object.Key,
            });
            await s3Client.send(deleteCommand);
          }
        }
      }

      // Upload the new logo
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType.mime,
      });

      await s3Client.send(uploadCommand);

      // Construct the regular S3 URL for storage in DB
      const baseUrl = `https://${BUCKET_NAME}.s3.amazonaws.com`;
      const objectUrl = `${baseUrl}/${key}`;

      return {
        key,
        url: objectUrl,
        fileType: mimeType,
        fileExtension,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upload company logo.",
      });
    }
  });
