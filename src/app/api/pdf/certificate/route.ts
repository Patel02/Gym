import { NextRequest, NextResponse } from "next/server";
import { requireUserRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { generateCompetitionCertificatePdf } from "@/lib/pdf/certificate-pdf";
import { generateSecuritySignature } from "@/lib/pdf/security-signer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || searchParams.get("verificationCode");
    const certificateId = searchParams.get("certificateId");
    const userId = searchParams.get("userId");
    const eventId = searchParams.get("eventId");
    const requester = await requireUserRole(
      "MEMBER",
      "ADMIN",
      "SUPER_ADMIN",
      "REFEREE",
      "MEET_DIRECTOR",
    );

    if (!code && !certificateId && !(userId && eventId)) {
      return NextResponse.json(
        { error: "Provide code, certificateId, or userId + eventId" },
        { status: 400 }
      );
    }
    if ((certificateId || userId || eventId) && !requester) {
      return NextResponse.json({ error: "Sign in to access this certificate." }, { status: 401 });
    }

    const certificateWhere = code
      ? { verificationCode: code }
      : certificateId
        ? { id: certificateId }
        : userId && eventId
          ? { userId, eventId }
          : null;
    if (!certificateWhere) {
      return NextResponse.json({ error: "Provide a valid certificate lookup." }, { status: 400 });
    }

    const cert = await prisma.certificate.findFirst({
      where: certificateWhere,
    });

    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    if (
      (certificateId || userId || eventId) &&
      cert.userId !== requester?.id &&
      requester?.role !== "ADMIN" &&
      requester?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "You cannot access another member's certificate." }, { status: 403 });
    }

    const [user, event, result, registration] = await Promise.all([
      prisma.user.findUnique({
        where: { id: cert.userId },
        include: { profile: true },
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
      prisma.meetRegistration.findUnique({
        where: {
          userId_eventId: {
            userId: cert.userId,
            eventId: cert.eventId,
          },
        },
      }),
    ]);

    const rank = result?.rank ?? null;
    let medal: "GOLD" | "SILVER" | "BRONZE" | "PARTICIPATION" = "PARTICIPATION";
    let medalText = "MERIT OF PARTICIPATION";

    if (rank === 1) {
      medal = "GOLD";
      medalText = "1ST PLACE • NATIONAL GOLD MEDALIST";
    } else if (rank === 2) {
      medal = "SILVER";
      medalText = "2ND PLACE • NATIONAL SILVER MEDALIST";
    } else if (rank === 3) {
      medal = "BRONZE";
      medalText = "3RD PLACE • NATIONAL BRONZE MEDALIST";
    } else if (rank && rank > 3) {
      medal = "PARTICIPATION";
      medalText = `TOP PLACEMENT (#${rank} OVERALL)`;
    }

    const division = registration?.division || user?.profile?.gender || "Open";
    const weightClass = user?.profile?.weightClass || "Open";
    const equipment = registration?.equipment || "Raw / Classic";

    const security = generateSecuritySignature({
      id: cert.id,
      type: "CERTIFICATE",
      userId: cert.userId,
      code: cert.verificationCode,
      metadata: `${result?.total || 0}KG`,
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "https://ipf-federation.in";
    const verificationUrl = `${baseUrl}/verify/${encodeURIComponent(cert.verificationCode)}`;

    const pdfBuffer = await generateCompetitionCertificatePdf({
      certificateId: cert.id,
      verificationCode: cert.verificationCode,
      verificationUrl,
      athleteName: user?.name || "Athlete",
      division,
      weightClass,
      gender: user?.profile?.gender || "Open",
      equipment,
      meetTitle: event?.title || "National Championship",
      meetLocation: event?.location || "National Stadium Complex",
      meetDate: event?.date ? new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-IN"),
      bestSquat: result?.bestSquat || 0,
      bestBench: result?.bestBench || 0,
      bestDeadlift: result?.bestDeadlift || 0,
      total: result?.total || 0,
      ipfGlPoints: result?.ipfGlPoints || 0,
      rank,
      medal,
      medalText,
      issueDate: cert.issueDate.toISOString().split("T")[0],
      securityHash: security.fullHash,
      shortHash: security.shortHash,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.verificationCode}-Certificate.pdf"`,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("Certificate PDF generation endpoint error:", error);
    return NextResponse.json({ error: "Failed to generate certificate PDF." }, { status: 500 });
  }
}
