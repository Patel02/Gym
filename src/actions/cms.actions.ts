"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function publishCircular(title: string, fileUrl: string) {
  const session = await auth();
  const adminId = session?.user?.id;
  const normalizedTitle = title.trim();

  if (!adminId || session.user?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access." };
  }

  if (!normalizedTitle || normalizedTitle.length > 200 || !fileUrl.startsWith("https://")) {
    return { success: false, error: "Provide a valid title and uploaded PDF URL." };
  }

  try {
    const circular = await prisma.$transaction(async (transaction) => {
      const createdCircular = await transaction.circular.create({
        data: {
          title: normalizedTitle,
          fileUrl,
          publishedAt: new Date(),
        },
      });

      await transaction.auditLog.create({
        data: {
          adminId,
          action: "PUBLISHED_CIRCULAR",
          entityType: "CIRCULAR",
          entityId: createdCircular.id,
          details: JSON.stringify({ title: normalizedTitle }),
        },
      });

      return createdCircular;
    });

    revalidatePath("/admin/cms");
    revalidatePath("/circulars");
    return { success: true, circular };
  } catch (error) {
    console.error("Failed to publish circular:", error);
    return { success: false, error: "Database error while publishing circular." };
  }
}