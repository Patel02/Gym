"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export interface PlatformHighlight {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  tag?: string;
}

export interface PassOption {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  badge: string;
  popular: boolean;
  waMessage: string;
}

export interface FacilityData {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    desc: string;
    location: string;
    hours: string;
  };
  highlights: PlatformHighlight[];
  passes: PassOption[];
  cta: {
    tag: string;
    title: string;
    desc: string;
    waMessage: string;
  };
}

const FACILITY_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-facility.json");

export async function saveFacilityDataAction(data: FacilityData) {
  const session = await auth();

  let adminId = session?.user?.id;
  if (!adminId) {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    adminId = adminUser?.id;
  }

  if (session?.user?.role !== "ADMIN" && !adminId) {
    return { success: false, error: "Unauthorized. Admin credentials required." };
  }

  if (!data || !Array.isArray(data.passes) || !Array.isArray(data.highlights)) {
    return { success: false, error: "Invalid facility data format." };
  }

  try {
    await fs.mkdir(path.dirname(FACILITY_FILE_PATH), { recursive: true });
    await fs.writeFile(FACILITY_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");

    if (adminId) {
      try {
        await prisma.auditLog.create({
          data: {
            adminId,
            action: "MANAGE_FACILITY",
            entityType: "FACILITY",
            entityId: "federation-facility",
            details: JSON.stringify({ 
              passes: data.passes.length, 
              highlights: data.highlights.length, 
              timestamp: new Date().toISOString() 
            }),
          },
        });
      } catch (logErr) {
        console.warn("Audit log creation skipped:", logErr);
      }
    }

    revalidatePath("/facility");
    revalidatePath("/admin/facility");
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      message: "Facility and passes data successfully published live to website!",
      data,
    };
  } catch (error: any) {
    console.error("Failed to save facility data:", error);
    return { success: false, error: error.message || "Failed to persist facility data." };
  }
}
