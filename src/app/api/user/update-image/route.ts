import { NextResponse } from "next/server";
import { requireUserRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const imageUrlSchema = z.string().trim().min(1).max(2048).refine((value) => {
  if (value.startsWith("/uploads/avatars/") && !value.includes("..")) return true;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (url.hostname === "utfs.io" ||
        url.hostname.endsWith(".ufs.sh") ||
        url.hostname === "images.unsplash.com")
    );
  } catch {
    return false;
  }
}, "Image URL must use an approved secure image host.");

export async function POST(req: Request) {
  try {
    const user = await requireUserRole("MEMBER", "ADMIN", "SUPER_ADMIN", "REFEREE", "MEET_DIRECTOR");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = z.object({ image: imageUrlSchema }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "A valid image URL is required." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { image: parsed.data.image },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user image", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
