import { requireUserRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const ABOUT_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-about.json");

export async function GET() {
  try {
    const data = await fs.readFile(ABOUT_FILE_PATH, "utf-8");
    const aboutData = JSON.parse(data);
    return NextResponse.json({ about: aboutData });
  } catch (error) {
    console.error("Failed to load about data:", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ error: "Could not load about data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireUserRole("ADMIN", "SUPER_ADMIN"))) {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const parsed = z
      .object({ about: z.record(z.string(), z.unknown()) })
      .safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid about data payload." }, { status: 400 });
    }

    await fs.mkdir(path.dirname(ABOUT_FILE_PATH), { recursive: true });
    await fs.writeFile(ABOUT_FILE_PATH, JSON.stringify(parsed.data.about, null, 2), "utf-8");

    // Revalidate public and admin pages
    revalidatePath("/about");
    revalidatePath("/admin/about");

    return NextResponse.json({ success: true, about: parsed.data.about });
  } catch (error) {
    console.error("Error updating about data:", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ error: "Failed to save about data." }, { status: 500 });
  }
}
