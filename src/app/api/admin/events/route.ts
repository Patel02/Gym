import { requireUserRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EVENTS_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-events.json");

export async function GET() {
  try {
    const data = await fs.readFile(EVENTS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return NextResponse.json({
      events: parsed.events || [],
      announcements: parsed.announcements || []
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate"
      }
    });
  } catch (error) {
    console.error("Failed to load federation events:", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ error: "Failed to load federation events." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireUserRole("ADMIN", "SUPER_ADMIN"))) {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const parsed = z
      .object({
        events: z.array(z.record(z.string(), z.unknown())).max(1000),
        announcements: z.array(z.record(z.string(), z.unknown())).max(1000).optional(),
      })
      .safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid events format. Array expected." }, { status: 400 });
    }

    const payload = {
      events: parsed.data.events,
      announcements: parsed.data.announcements ?? [],
    };

    await fs.mkdir(path.dirname(EVENTS_FILE_PATH), { recursive: true });
    await fs.writeFile(EVENTS_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");

    // Revalidate public and admin pages immediately
    revalidatePath("/championships");
    revalidatePath("/");
    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return NextResponse.json({ 
      success: true, 
      message: "Events and circulars successfully persisted and revalidated.",
      events: payload.events, 
      announcements: payload.announcements 
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate"
      }
    });
  } catch (error) {
    console.error("Error saving federation events:", error);
    return NextResponse.json({ error: "Failed to save events." }, { status: 500 });
  }
}
