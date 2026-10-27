import { NextRequest, NextResponse } from "next/server";
import { requireUserRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { generatePodiumBadgeSvg } from "@/lib/pdf/digital-badges";
import { generateSecuritySignature } from "@/lib/pdf/security-signer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || searchParams.get("verificationCode");
    const certificateId = searchParams.get("certificateId");
    const requester = certificateId
      ? await requireUserRole("MEMBER", "ADMIN", "SUPER_ADMIN", "REFEREE", "MEET_DIRECTOR")
      : null;

    if (!code && !certificateId) {
      return NextResponse.json({ error: "Provide code or certificateId" }, { status: 400 });
    }
    if (certificateId && !requester) {
      return NextResponse.json({ error: "Sign in to access a member-specific badge." }, { status: 401 });
    }

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          code ? { verificationCode: code } : undefined,
          certificateId ? { id: certificateId } : undefined,
        ].filter(Boolean) as any[],
      },
    });

    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    if (
      certificateId &&
      requester &&
      cert.userId !== requester.id &&
      requester.role !== "ADMIN" &&
      requester.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "You cannot access another member's badge." }, { status: 403 });
    }

    const [user, event, result] = await Promise.all([
      prisma.user.findUnique({
        where: { id: cert.userId },
      }),
      prisma.event.findUnique({
        where: { id: cert.eventId },
      }),
      prisma.result.findFirst({
        where: {
          userId: cert.userId,
          eventId: cert.eventId,
        },
      }),
    ]);

    const rank = result?.rank ?? null;
    let medal: "GOLD" | "SILVER" | "BRONZE" | "PARTICIPATION" = "PARTICIPATION";
    if (rank === 1) medal = "GOLD";
    else if (rank === 2) medal = "SILVER";
    else if (rank === 3) medal = "BRONZE";

    const security = generateSecuritySignature({
      id: cert.id,
      type: "CERTIFICATE",
      userId: cert.userId,
      code: cert.verificationCode,
    });

    const svg = generatePodiumBadgeSvg({
      athleteName: user?.name || "Athlete",
      medal,
      rank,
      meetTitle: event?.title || "National Championship",
      total: result?.total || 0,
      ipfGlPoints: result?.ipfGlPoints || 0,
      shortHash: security.shortHash,
      year: event?.date ? new Date(event.date).getFullYear().toString() : new Date().getFullYear().toString(),
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
