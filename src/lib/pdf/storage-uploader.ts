import fs from "fs/promises";
import path from "path";
import { UTApi, UTFile } from "uploadthing/server";

export interface UploadResult {
  url: string;
  provider: "uploadthing" | "local_fallback";
  fileName: string;
  sizeBytes: number;
}

/**
 * Upload buffer directly to Cloud Storage (Uploadthing) with resilient local disk fallback
 */
export async function uploadCredentialToStorage(
  buffer: Buffer,
  fileName: string,
  contentType: "application/pdf" | "image/svg+xml" | "image/png"
): Promise<UploadResult> {
  const sizeBytes = buffer.length;

  // 1. Attempt Cloud Storage via Uploadthing UTApi
  const hasToken = !!process.env.UPLOADTHING_TOKEN || !!process.env.UPLOADTHING_SECRET;
  if (hasToken) {
    try {
      const utapi = new UTApi();
      const utFile = new UTFile([new Uint8Array(buffer)], fileName, {
        type: contentType,
        customId: `cred-${Date.now()}-${fileName}`,
      });

      const response = await utapi.uploadFiles(utFile);
      if (response && response.data?.url) {
        return {
          url: response.data.url,
          provider: "uploadthing",
          fileName,
          sizeBytes,
        };
      } else if (response && response.data?.ufsUrl) {
        return {
          url: response.data.ufsUrl,
          provider: "uploadthing",
          fileName,
          sizeBytes,
        };
      }
      console.warn("Uploadthing response missing url, falling back to local storage:", response);
    } catch (cloudErr) {
      console.warn("Uploadthing cloud storage upload encountered an issue, activating resilient local fallback:", cloudErr);
    }
  }

  // 2. Resilient Local Disk Storage Fallback
  const fallbackDir = path.join(process.cwd(), "public", "uploads", "credentials");
  await fs.mkdir(fallbackDir, { recursive: true });

  const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(fallbackDir, safeFileName);
  await fs.writeFile(filePath, buffer);

  const localUrl = `/uploads/credentials/${safeFileName}`;
  return {
    url: localUrl,
    provider: "local_fallback",
    fileName: safeFileName,
    sizeBytes,
  };
}
