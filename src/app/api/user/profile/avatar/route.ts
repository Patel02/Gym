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
    const userSession = await requireUserRole(
      "MEMBER",
      "ADMIN",
      "SUPER_ADMIN",
      "REFEREE",
      "MEET_DIRECTOR",
    );
    if (!userSession) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to upload avatar." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userSession.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const fileValue = formData.get("file");
    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        { error: "Please select an image file to upload." },
        { status: 400 }
      );
    }

    const metadata = avatarUploadSchema.safeParse({
      name: fileValue.name,
      type: fileValue.type,
      size: fileValue.size,
    });
    if (!metadata.success) {
      return NextResponse.json(
        { error: "Upload a JPG, PNG, WEBP, or GIF image no larger than 5MB." },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await fileValue.arrayBuffer());
    if (!hasValidImageSignature(metadata.data.type, bytes)) {
      return NextResponse.json(
        { error: "Image content does not match the declared file type." },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeFilename = `athlete-${user.id}-${randomUUID()}.${avatarExtensionByType[metadata.data.type]}`;
    const filePath = path.join(uploadsDir, safeFilename);
    await fs.writeFile(filePath, Buffer.from(bytes), { flag: "wx" });

    const fileUrl = `/uploads/avatars/${safeFilename}`;

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: fileUrl },
      });
    } catch (error) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error("[Athlete Avatar Cleanup Error]:", cleanupError);
      }
      throw error;
    }

    const oldFilename = getLocalAvatarFilename(user.image);
    if (oldFilename) {
      try {
        await fs.unlink(path.join(uploadsDir, oldFilename));
      } catch (cleanupError) {
        if (!(cleanupError instanceof Error && "code" in cleanupError && cleanupError.code === "ENOENT")) {
          console.error("[Athlete Old Avatar Cleanup Error]:", cleanupError);
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return NextResponse.json({
      success: true,
      fileUrl,
      message: "Profile photo updated successfully!",
    });
  } catch (error) {
    console.error("[Athlete Avatar Upload Error]:", error);
    return NextResponse.json(
      { error: "Failed to upload photo." },
      { status: 500 }
    );
  }
}
