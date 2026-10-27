import { requireUserRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const STATS_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-stats.json");

const DEFAULT_STATS = [
  { id: "years", value: "50", suffix: "+", label: "Years of Heritage" },
  { id: "athletes", value: "10,000", suffix: "+", label: "Registered Athletes" },
  { id: "medals", value: "900", suffix: "+", label: "International Medals" },
  { id: "states", value: "37", suffix: "+", label: "Affiliated State Units" }
];

export async function GET() {
  try {
    const data = await fs.readFile(STATS_FILE_PATH, "utf-8");
    const stats = JSON.parse(data);
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ stats: DEFAULT_STATS });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireUserRole("ADMIN", "SUPER_ADMIN"))) {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const parsed = z
      .object({
        stats: z.array(z.record(z.string(), z.unknown())).min(1).max(20),
      })
      .safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid stats array." }, { status: 400 });
    }
    const { stats } = parsed.data;

    await fs.mkdir(path.dirname(STATS_FILE_PATH), { recursive: true });
    await fs.writeFile(STATS_FILE_PATH, JSON.stringify(stats, null, 2), "utf-8");

    // Revalidate public and admin pages
    revalidatePath("/");
    revalidatePath("/admin/stats");

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Error updating stats:", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ error: "Failed to save stats." }, { status: 500 });
  }
}
