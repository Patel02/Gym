import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAthleteBadgeSvg } from "@/lib/pdf/digital-badges";
import { generateSecuritySignature } from "@/lib/pdf/security-signer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cardNumber = searchParams.get("cardNumber");
    const userId = searchParams.get("userId");

    if (!cardNumber && !userId) {
      return NextResponse.json({ error: "Provide cardNumber or userId" }, { status: 400 });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        OR: [
          cardNumber ? { cardNumber } : undefined,
          userId ? { userId } : undefined,
        ].filter(Boolean) as any[],
      },
      include: {
        user: {
          include: {
            profile: {
              include: { club: true },
            },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    if (!membership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    const security = generateSecuritySignature({
      id: membership.id,
      type: "ID_CARD",
      userId: membership.userId,
      code: membership.cardNumber,
    });

    const clubOrState = membership.user.profile?.club?.state || membership.user.profile?.club?.name || "National";

    const svg = generateAthleteBadgeSvg({
      athleteName: membership.user.name || "Athlete",
      cardNumber: membership.cardNumber,
      weightClass: membership.user.profile?.weightClass || "OPEN",
      gender: membership.user.profile?.gender || "OPEN",
      clubState: clubOrState,
      shortHash: security.shortHash,
      validThru: membership.endDate.toISOString().split("T")[0],
    });

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate badge" }, { status: 500 });
  }
}
