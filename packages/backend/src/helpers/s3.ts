import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../s3";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

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
