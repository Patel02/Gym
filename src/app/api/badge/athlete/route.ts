import { NextRequest, NextResponse } from "next/server";
import { requireUserRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { generateAthleteBadgeSvg } from "@/lib/pdf/digital-badges";
import { generateSecuritySignature } from "@/lib/pdf/security-signer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cardNumber = searchParams.get("cardNumber");
    const userId = searchParams.get("userId");
    const requester = userId
      ? await requireUserRole("MEMBER", "ADMIN", "SUPER_ADMIN", "REFEREE", "MEET_DIRECTOR")
      : null;

    if (!cardNumber && !userId) {
      return NextResponse.json({ error: "Provide cardNumber or userId" }, { status: 400 });
    }
    if (userId && !requester) {
      return NextResponse.json({ error: "Sign in to access a member-specific badge." }, { status: 401 });
    }

    const membershipWhere = cardNumber
      ? { cardNumber }
      : userId
        ? { userId }
        : null;
    if (!membershipWhere) {
      return NextResponse.json({ error: "Provide a valid membership lookup." }, { status: 400 });
    }
    const membership = await prisma.membership.findFirst({
      where: membershipWhere,
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
    if (
      userId &&
      requester &&
      membership.userId !== requester.id &&
      requester.role !== "ADMIN" &&
      requester.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "You cannot access another member's badge." }, { status: 403 });
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
  } catch (error) {
    console.error("Athlete badge generation failed:", error);
    return NextResponse.json({ error: "Failed to generate badge." }, { status: 500 });
  }
}
