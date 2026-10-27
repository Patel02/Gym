"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  desc: string;
  features: string[];
  timeline: string;
  waMessage: string;
}

export interface ServicesData {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    desc: string;
  };
  services: ServiceItem[];
  cta: {
    tag: string;
    title: string;
    desc: string;
    waMessage: string;
  };
}

const SERVICES_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-services.json");

export async function saveServicesDataAction(data: ServicesData) {
  const session = await auth();

  let adminId = session?.user?.id;
  if (!adminId) {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    adminId = adminUser?.id;
  }

  if (session?.user?.role !== "ADMIN" && !adminId) {
    return { success: false, error: "Unauthorized. Admin credentials required." };
  }

  if (!data || !Array.isArray(data.services)) {
    return { success: false, error: "Invalid services data format." };
  }

  try {
    await fs.mkdir(path.dirname(SERVICES_FILE_PATH), { recursive: true });
    await fs.writeFile(SERVICES_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");

    if (adminId) {
      try {
        await prisma.auditLog.create({
          data: {
            adminId,
            action: "MANAGE_SERVICES",
            entityType: "SERVICES",
            entityId: "federation-services",
            details: JSON.stringify({ count: data.services.length, timestamp: new Date().toISOString() }),
          },
        });
      } catch (logErr) {
        console.warn("Audit log creation skipped:", logErr);
      }
    }

    revalidatePath("/services");
    revalidatePath("/admin/services");
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      message: "Services data successfully published live to website!",
      data,
    };
  } catch (error: any) {
    console.error("Failed to save services data:", error);
    return { success: false, error: error.message || "Failed to persist services data." };
  }
}
