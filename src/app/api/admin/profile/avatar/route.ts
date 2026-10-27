import { requireUserRole } from "@/lib/authz";
import {
  avatarExtensionByType,
  avatarUploadSchema,
  getLocalAvatarFilename,
  hasValidImageSignature,
} from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const authorizedAdmin = await requireUserRole("ADMIN", "SUPER_ADMIN");
    if (!authorizedAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: authorizedAdmin.id },
    });

    if (
      !admin ||
      !admin.isActive ||
      (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        { error: "Admin account not found in database." },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a valid image file to upload." },
        { status: 400 }
      );
    }

    const metadata = avatarUploadSchema.safeParse({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!metadata.success) {
      return NextResponse.json(
        { error: "Upload a JPG, PNG, WEBP, or GIF image no larger than 5MB." },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidImageSignature(metadata.data.type, bytes)) {
      return NextResponse.json(
        { error: "Image content does not match the declared file type." },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeFilename = `admin-${admin.id}-${randomUUID()}.${avatarExtensionByType[metadata.data.type]}`;
    const filePath = path.join(uploadsDir, safeFilename);
    await fs.writeFile(filePath, Buffer.from(bytes), { flag: "wx" });

    const fileUrl = `/uploads/avatars/${safeFilename}`;

    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: admin.id },
          data: { image: fileUrl },
        }),
        prisma.auditLog.create({
          data: {
            adminId: admin.id,
            action: "UPLOAD_ADMIN_AVATAR",
            entityType: "USER",
            entityId: admin.id,
            details: `Uploaded new admin profile avatar: ${fileUrl}`,
          },
        }),
      ]);
    } catch (error) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error("[Admin Avatar Cleanup Error]:", cleanupError);
      }
      throw error;
    }

    const oldFilename = getLocalAvatarFilename(admin.image);
    if (oldFilename) {
      try {
        await fs.unlink(path.join(uploadsDir, oldFilename));
      } catch (cleanupError) {
        if (!(cleanupError instanceof Error && "code" in cleanupError && cleanupError.code === "ENOENT")) {
          console.error("[Admin Old Avatar Cleanup Error]:", cleanupError);
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/profile");

    return NextResponse.json({
      success: true,
      fileUrl,
      message: "Admin photo updated successfully!",
    });
  } catch (error) {
    console.error("[Avatar Upload API Error]:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar." },
      { status: 500 }
    );
  }
}
