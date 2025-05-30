import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { fileTypeFromBuffer } from "file-type";
import { Hono } from "hono";
import { s3Client } from "../s3.js";
import { honoAuthMiddleware } from "../trpc/core.js";
import { BOM_DIR_NAME, BOM_FILE_NAME, HISTORY_DIR_NAME } from "./constants.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const fileRoutes = new Hono();

fileRoutes.post(
  "/upload-company-logo",
  honoAuthMiddleware(["BasicInfoManagement"]),
  async (c) => {
    const body = await c.req.parseBody();
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

// fileRoutes.post(
//   "/upload-bom/:projectId",
//   honoAuthMiddleware(["BasicInfoManagement"]),
//   async (c) => {
//     const { projectId } = c.req.param();
//     const body = await c.req.parseBody();
//     const file = body["file"] as File;

//     if (!file) {
//       throw new TRPCError({
//         code: "BAD_REQUEST",
//         message: "No file provided",
//       });
//     }

//     const arrayBuffer = await file.arrayBuffer();
//     const fileBuffer = Buffer.from(arrayBuffer);

//     const mimeType = file.type;

//     // Validate against allowed types
//     const validMimeTypes = [
//       "text/csv",
//       "application/csv",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     ];

//     if (!validMimeTypes.includes(mimeType)) {
//       throw new TRPCError({
//         code: "BAD_REQUEST",
//         message: `Invalid file type: ${mimeType}. Only CSV and Excel files are allowed.`,
//       });
//     }

//     const BUCKET_NAME = process.env.S3_BUCKET_NAME;
//     const bomDirPath = `projects/${projectId}/${BOM_DIR_NAME}/`;
//     const historyDirPath = `${bomDirPath}${HISTORY_DIR_NAME}/`;
//     const bomFilePath = `${bomDirPath}${BOM_FILE_NAME}`;

//     try {
//       // Check if BOM file already exists
//       const listCommand = new ListObjectsV2Command({
//         Bucket: BUCKET_NAME,
//         Prefix: bomFilePath,
//       });

//       const listedObjects = await s3Client.send(listCommand);

//       // If BOM file exists, move it to history with timestamp
//       if (listedObjects.Contents && listedObjects.Contents.length > 0) {
//         // Ensure history directory exists
//         await s3Client.send(
//           new PutObjectCommand({
//             Bucket: BUCKET_NAME,
//             Key: historyDirPath,
//             Body: Buffer.from(""),
//           })
//         );

//         // Create timestamp for the history file
//         const now = new Date().toISOString().replace(/[:T-]|\.\d{3}Z$/g, "");
//         const historyFileName = `TeklaBom_${now}.csv`;
//         const historyFilePath = `${historyDirPath}${historyFileName}`;

//         // Copy existing BOM to history
//         await s3Client.send(
//           new CopyObjectCommand({
//             Bucket: BUCKET_NAME,
//             CopySource: `/${BUCKET_NAME}/${bomFilePath}`,
//             Key: historyFilePath,
//           })
//         );

//         // Delete the original BOM file
//         await s3Client.send(
//           new DeleteObjectCommand({
//             Bucket: BUCKET_NAME,
//             Key: bomFilePath,
//           })
//         );
//       }

//       // Upload the new BOM file
//       const uploadCommand = new PutObjectCommand({
//         Bucket: BUCKET_NAME,
//         Key: bomFilePath,
//         Body: fileBuffer,
//         ContentType: mimeType,
//       });

//       await s3Client.send(uploadCommand);

//       // Construct the S3 URL
//       const baseUrl = `https://${BUCKET_NAME}.s3.amazonaws.com`;
//       const objectUrl = `${baseUrl}/${bomFilePath}`;

//       return c.json({
//         success: true,
//         message: "BOM file uploaded successfully",
//         fileUrl: objectUrl,
//         filePath: bomFilePath,
//       });
//     } catch (error) {
//       console.error("S3 upload error:", error);
//       throw new TRPCError({
//         code: "INTERNAL_SERVER_ERROR",
//         message: "Failed to upload BOM file",
//         cause: error instanceof Error ? error.message : "unknown error",
//       });
//     }
//   }
// );

fileRoutes.get(
  "/presigned-url/bom-upload/:projectId",
  honoAuthMiddleware(["BasicInfoManagement"]),
  async (c) => {
    const { projectId } = c.req.param();
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;
    const bomDirPath = `projects/${projectId}/${BOM_DIR_NAME}/`;
    const historyDirPath = `${bomDirPath}${HISTORY_DIR_NAME}/`;
    const bomFilePath = `${bomDirPath}${BOM_FILE_NAME}`;

    console.log("[bom-upload] Handler start. projectId:", projectId);
    console.log("[bom-upload] BUCKET_NAME:", BUCKET_NAME);
    console.log("[bom-upload] bomDirPath:", bomDirPath);
    console.log("[bom-upload] bomFilePath:", bomFilePath);
    console.log("[bom-upload] historyDirPath:", historyDirPath);

    try {
      // Check if BOM file already exists
      console.log("[bom-upload] Listing objects for:", bomFilePath);
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: bomFilePath,
      });

      const listedObjects = await s3Client.send(listCommand);
      console.log("[bom-upload] Listed objects:", listedObjects);
      let historyFilePath = null;

      // If BOM file exists, prepare to move it to history
      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        console.log("[bom-upload] BOM exists, preparing to move to history.");
        // Ensure history directory exists
        console.log("[bom-upload] Ensuring history directory exists:", historyDirPath);
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: historyDirPath,
            Body: Buffer.from(""),
          })
        );
        console.log("[bom-upload] History directory ensured.");

        // Create timestamp for the history file
        const now = new Date().toISOString().replace(/[:T-]|\.\d{3}Z$/g, "");
        const historyFileName = `TeklaBom_${now}.csv`;
        historyFilePath = `${historyDirPath}${historyFileName}`;
        console.log("[bom-upload] historyFilePath:", historyFilePath);

        // Copy existing BOM to history
        console.log("[bom-upload] Copying BOM to history:", historyFilePath);
        await s3Client.send(
          new CopyObjectCommand({
            Bucket: BUCKET_NAME,
            CopySource: `${encodeURIComponent(BUCKET_NAME!)}/${encodeURIComponent(bomFilePath)}`,
            Key: historyFilePath,
          })
        );
        console.log("[bom-upload] BOM copied to history.");

        // Delete the original BOM file
        console.log("[bom-upload] Deleting original BOM:", bomFilePath);
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: bomFilePath,
          })
        );
        console.log("[bom-upload] Original BOM deleted.");
      } else {
        console.log("[bom-upload] No existing BOM file found.");
      }

      // Generate a pre-signed URL for PUT operation with required headers
      console.log("[bom-upload] Generating presigned URL for:", bomFilePath);
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: bomFilePath,
        ContentType: "text/csv",
        // Metadata: {
        //   "original-filename": BOM_FILE_NAME,
        // },
      });

      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      console.log("[bom-upload] Presigned URL generated:", uploadUrl);

      console.log("[bom-upload] Returning JSON response.");
      return c.json({
        success: true,
        uploadUrl,
        s3Key: bomFilePath,
        // filePath: bomFilePath,
        // historyFilePath: historyFilePath || null,
      });
    } catch (error) {
      console.error("[bom-upload] Error in pre-signed URL generation:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to prepare for file upload",
        cause: error instanceof Error ? error.message : "unknown error",
      });
    }
  }
);

export default fileRoutes;
