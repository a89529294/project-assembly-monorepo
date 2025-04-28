export async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();

  let done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks);
}

export function detectMimeType(buffer: Buffer): string | null {
  const header = buffer.slice(0, 4).toString("hex");

  if (header.startsWith("89504e47")) return "image/png";
  if (header.startsWith("ffd8ff")) return "image/jpeg";
  if (buffer.toString().match(/<svg/)) return "image/svg+xml";

  return null;
}
