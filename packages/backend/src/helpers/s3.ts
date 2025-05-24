import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../s3";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

export interface S3FileMetadata {
  etag: string;
  lastModified: Date;
  contentLength: number;
  contentType?: string;
}

export async function getS3FileMetadata(
  bucket: string,
  key: string
): Promise<S3FileMetadata | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    return {
      etag: response.ETag || '',
      lastModified: response.LastModified || new Date(0),
      contentLength: response.ContentLength || 0,
      contentType: response.ContentType,
    };
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
      return null;
    }
    throw error;
  }
}

export async function downloadFileFromS3(
  bucket: string,
  key: string,
  destinationPath: string
): Promise<void> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3Client.send(command);
  const body = response.Body as Readable;

  if (!body) {
    throw new Error("No data received from S3");
  }

  const writer = createWriteStream(destinationPath);
  await pipeline(body, writer);
}
