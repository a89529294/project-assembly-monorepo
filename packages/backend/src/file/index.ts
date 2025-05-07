import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { fileTypeFromBuffer } from "file-type";
import { Hono } from "hono";
import { s3Client } from "../s3.js";
import { honoAuthMiddleware } from "../trpc/core.js";

const fileRoutes = new Hono();

fileRoutes.post(
  "/upload-company-logo",
  honoAuthMiddleware(["BasicInfoManagement"]),
  async (c) => {
    const body = await c.req.parseBody();
    console.log(body["file"]); // File | string
    const file = body["file"] as File;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Detect mime type
    const mimeType = await fileTypeFromBuffer(fileBuffer);

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

      return c.json({
        logoURL: objectUrl,
      });
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upload company logo.",
      });
    }
  }
);

export default fileRoutes;
