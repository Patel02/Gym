import { requireUserRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const titleSchema = z.string().trim().min(1).max(160);
const fileUrlSchema = z.string().trim().min(1).max(2048).refine((value) => {
  if (value.startsWith("/uploads/circulars/") && !value.includes("..")) return true;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (url.hostname === "utfs.io" || url.hostname.endsWith(".ufs.sh"))
    );
  } catch {
    return false;
  }
}, "Document URL must use an approved secure upload host.");
const uploadSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
  size: z.number().int().positive().max(4 * 1024 * 1024),
});

function hasValidFileSignature(type: string, bytes: Uint8Array) {
  if (type === "application/pdf") {
    return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  }
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => bytes[index] === byte,
    );
  }
  if (type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

export async function GET() {
  try {
    const circulars = await prisma.circular.findMany({
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json({ circulars });
  } catch (error) {
    console.error("Failed to fetch public circulars:", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch circulars." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireUserRole("ADMIN", "SUPER_ADMIN");
    if (!admin) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    let title: string;
    let fileUrl: string;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const parsedTitle = titleSchema.safeParse(formData.get("title"));
      if (!parsedTitle.success) {
        return NextResponse.json({ error: "A valid document title is required." }, { status: 400 });
      }
      title = parsedTitle.data;

      const fileValue = formData.get("file");
      if (fileValue instanceof File && fileValue.size > 0) {
        const metadata = uploadSchema.safeParse({
          name: fileValue.name,
          type: fileValue.type,
          size: fileValue.size,
        });
        if (!metadata.success) {
          return NextResponse.json(
            { error: "Upload a PDF or image no larger than 4MB." },
            { status: 400 },
          );
        }

        const bytes = new Uint8Array(await fileValue.arrayBuffer());
        if (!hasValidFileSignature(metadata.data.type, bytes)) {
          return NextResponse.json(
            { error: "File content does not match the declared type." },
            { status: 400 },
          );
        }

        const extensionByType = {
          "application/pdf": "pdf",
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        } as const;
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "circulars");
        await fs.mkdir(uploadsDir, { recursive: true });

        const safeName = `${Date.now()}-${randomUUID()}.${extensionByType[metadata.data.type]}`;
        await fs.writeFile(path.join(uploadsDir, safeName), Buffer.from(bytes));
        fileUrl = `/uploads/circulars/${safeName}`;
      } else {
        const parsedUrl = fileUrlSchema.safeParse(formData.get("fileUrl"));
        if (!parsedUrl.success) {
          return NextResponse.json({ error: "A valid PDF or image URL is required." }, { status: 400 });
        }
        fileUrl = parsedUrl.data;
      }
    } else if (contentType.includes("application/json")) {
      const parsedBody = z
        .object({ title: titleSchema, fileUrl: fileUrlSchema })
        .safeParse(await req.json());
      if (!parsedBody.success) {
        return NextResponse.json({ error: "Provide a valid title and document URL." }, { status: 400 });
      }
      title = parsedBody.data.title;
      fileUrl = parsedBody.data.fileUrl;
    } else {
      return NextResponse.json({ error: "Unsupported content type." }, { status: 415 });
    }

    const circular = await prisma.$transaction(async (transaction) => {
      const created = await transaction.circular.create({
        data: { title, fileUrl, publishedAt: new Date() },
      });
      await transaction.auditLog.create({
        data: {
          adminId: admin.id,
          action: "PUBLISHED_CIRCULAR",
          entityType: "CIRCULAR",
          entityId: created.id,
          details: JSON.stringify({ title, fileUrl }),
        },
      });
      return created;
    });

    revalidatePath("/circulars");
    revalidatePath("/admin/cms");
    revalidatePath("/");
    revalidatePath("/championships");
    revalidatePath("/admin/events");

    return NextResponse.json({
      success: true,
      circular,
      message: "Document published successfully.",
    });
  } catch (error) {
    console.error("Circular publishing failed:", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ error: "Failed to publish circular." }, { status: 500 });
  }
}
