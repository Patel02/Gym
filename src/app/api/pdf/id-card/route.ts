import { NextRequest, NextResponse } from "next/server";
import { requireUserRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { generateAthleteIdCardPdf } from "@/lib/pdf/id-card-pdf";
import { generateSecuritySignature } from "@/lib/pdf/security-signer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cardNumber = searchParams.get("cardNumber");
    const membershipId = searchParams.get("membershipId");
    const userId = searchParams.get("userId");
    const requester = await requireUserRole(
      "MEMBER",
      "ADMIN",
      "SUPER_ADMIN",
      "REFEREE",
      "MEET_DIRECTOR",
    );

    if (!cardNumber && !membershipId && !userId) {
      return NextResponse.json(
        { error: "Provide cardNumber, membershipId, or userId" },
        { status: 400 }
      );
    }
    if ((membershipId || userId) && !requester) {
      return NextResponse.json({ error: "Sign in to access this ID card." }, { status: 401 });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        OR: [
          cardNumber ? { cardNumber } : undefined,
          membershipId ? { id: membershipId } : undefined,
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
      return NextResponse.json({ error: "Membership pass not found" }, { status: 404 });
    }

    const mayViewPrivateData = Boolean(
      requester &&
        (requester.id === membership.userId ||
          requester.role === "ADMIN" ||
          requester.role === "SUPER_ADMIN"),
    );
    if ((requester && !mayViewPrivateData) || ((membershipId || userId) && !mayViewPrivateData)) {
      return NextResponse.json({ error: "You cannot access another member's ID card." }, { status: 403 });
    }

    const security = generateSecuritySignature({
      id: membership.id,
      type: "ID_CARD",
      userId: membership.userId,
      code: membership.cardNumber,
      metadata: membership.planType,
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "https://ipf-federation.in";
    const verificationUrl = `${baseUrl}/verify/${encodeURIComponent(membership.cardNumber)}`;

    const clubOrState = membership.user.profile?.club?.state || membership.user.profile?.club?.name || "National";

    const pdfBuffer = await generateAthleteIdCardPdf({
      cardNumber: membership.cardNumber,
      athleteName: membership.user.name || "Athlete",
      email: mayViewPrivateData ? membership.user.email : "",
      gender: membership.user.profile?.gender || "OPEN",
      weightClass: membership.user.profile?.weightClass || "OPEN",
      clubState: clubOrState,
      planType: membership.planType,
      role: membership.user.role,
      startDate: membership.startDate.toISOString().split("T")[0],
      endDate: membership.endDate.toISOString().split("T")[0],
      verificationUrl,
      securityHash: security.fullHash,
      shortHash: security.shortHash,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${membership.cardNumber}-Pass.pdf"`,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err: any) {
    console.error("PDF generation endpoint error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate PDF" }, { status: 500 });
  }
}
