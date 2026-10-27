"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function publishCircular(title: string, fileUrl: string) {
  const session = await auth();
  const adminId = session?.user?.id;
  const normalizedTitle = title.trim();

  if (!adminId || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
    return { success: false, error: "Unauthorized access. Admin privileges required." };
  }

  if (!normalizedTitle || normalizedTitle.length > 200) {
    return { success: false, error: "Provide a valid document title (up to 200 characters)." };
  }

  if (!fileUrl || (!fileUrl.startsWith("https://") && !fileUrl.startsWith("http://"))) {
    return { success: false, error: "Provide a valid uploaded file URL." };
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
          details: JSON.stringify({ title: normalizedTitle, url: fileUrl }),
        },
      });

      return createdCircular;
    });

    // Also sync to federation-events.json so Homepage announcements reflect it immediately
    try {
      const eventsFilePath = path.join(process.cwd(), "src", "data", "federation-events.json");
      const currentData = await fs.readFile(eventsFilePath, "utf-8");
      const parsed = JSON.parse(currentData);
      const newAnnouncements = [
        {
          id: circular.id,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase(),
          title: normalizedTitle,
          type: "rule",
          fileUrl: fileUrl,
        },
        ...(parsed.announcements || []).filter((a: any) => a.title !== normalizedTitle)
      ];
      await fs.writeFile(eventsFilePath, JSON.stringify({ ...parsed, announcements: newAnnouncements }, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not sync to federation-events.json:", e);
    }

    revalidatePath("/admin/cms");
    revalidatePath("/circulars");
    revalidatePath("/");
    revalidatePath("/admin/events");

    return { 
      success: true, 
      circular,
      message: "Circular published successfully! It is now live on /circulars and the Homepage." 
    };
  } catch (error: any) {
    console.error("Failed to publish circular:", error);
    return { success: false, error: error.message || "Database error while publishing circular." };
  }
}

export async function deleteCircular(id: string) {
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    await prisma.circular.delete({ where: { id } });

    // Also remove from federation-events.json if synced
    try {
      const eventsFilePath = path.join(process.cwd(), "src", "data", "federation-events.json");
      const currentData = await fs.readFile(eventsFilePath, "utf-8");
      const parsed = JSON.parse(currentData);
      const newAnnouncements = (parsed.announcements || []).filter((a: any) => String(a.id) !== String(id));
      await fs.writeFile(eventsFilePath, JSON.stringify({ ...parsed, announcements: newAnnouncements }, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not sync deletion to federation-events.json:", e);
    }

    revalidatePath("/admin/cms");
    revalidatePath("/circulars");
    revalidatePath("/");
    revalidatePath("/admin/events");

    return { success: true, message: "Circular permanently deleted." };
  } catch (error: any) {
    console.error("Failed to delete circular:", error);
    return { success: false, error: error.message || "Failed to delete circular." };
  }
}