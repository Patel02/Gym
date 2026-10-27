import { requireUserRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SERVICES_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-services.json");

export async function GET() {
  try {
    const data = await fs.readFile(SERVICES_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return NextResponse.json(parsed, {
      headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" }
    });
  } catch {
    return NextResponse.json({ hero: {}, services: [], cta: {} });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireUserRole("ADMIN", "SUPER_ADMIN");
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const parsed = z
      .object({
        services: z.array(z.record(z.string(), z.unknown())).max(100),
      })
      .passthrough()
      .safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid services format." }, { status: 400 });
    }
    const payload = parsed.data;

    await fs.mkdir(path.dirname(SERVICES_FILE_PATH), { recursive: true });
    await fs.writeFile(SERVICES_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "MANAGE_SERVICES",
        entityType: "SERVICES",
        entityId: "federation-services",
        details: JSON.stringify({ count: payload.services.length, timestamp: new Date().toISOString() }),
      },
    });

    revalidatePath("/services");
    revalidatePath("/admin/services");
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Services data successfully updated and revalidated.",
      data: payload,
    }, {
      headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" }
    });
  } catch (error: any) {
    console.error("Error saving services:", error);
    return NextResponse.json({ error: error.message || "Failed to save services" }, { status: 500 });
  }
}
