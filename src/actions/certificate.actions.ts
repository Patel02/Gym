"use server";

import { auth } from "@/auth";
import { generateQrDataUrl } from "@/lib/qr-generator";
import { prisma } from "@/lib/prisma";

export interface CompetitionCertificatePayload {
  certificateId: string;
  verificationCode: string;
  verificationUrl: string;
  qrDataUrl: string;
  athleteId: string;
  athleteName: string;
  email: string | null;
  gender: string;
  weightClass: string;
  bodyweight: number;
  division: string;
  equipment: string;
  meetId: string;
  meetTitle: string;
  meetLocation: string;
  meetDate: string;
  bestSquat: number;
  bestBench: number;
  bestDeadlift: number;
  total: number;
  ipfGlPoints: number;
  rank: number | null;
  totalLiftersInClass: number;
  medal: "GOLD" | "SILVER" | "BRONZE" | "PARTICIPATION";
  medalText: string;
  issueDate: string;
  federationName?: string;
  tagline?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  sealText?: string;
  presidentName?: string;
  presidentSignUrl?: string | null;
  secretaryName?: string;
  secretarySignUrl?: string | null;
}

export interface AthleteIdCardPayload {
  cardNumber: string;
  athleteId: string;
  athleteName: string;
  email: string | null;
  image: string | null;
  role: string;
  planType: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "PENDING";
  startDate: string;
  endDate: string;
  gender: string;
  weightClass: string;
  clubState: string;
  qrDataUrl: string;
  verificationUrl: string;
  isVerified: boolean;
  tenantOrganizationName?: string;
  tenantTagline?: string;
  tenantLogoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  sealText?: string;
  presidentName?: string;
  secretaryName?: string;
}

/**
 * Get or auto-issue official competition certificates for an athlete's meets
 */
export async function getAthleteCertificatesAction(
  targetUserId?: string
): Promise<{
  success: boolean;
  certificates?: CompetitionCertificatePayload[];
  error?: string;
}> {
  try {
    const session = await auth();
    const effectiveUserId = targetUserId || session?.user?.id;

    if (!effectiveUserId) {
      return { success: false, error: "Authentication required" };
    }

    const db = prisma as any;

    // Fetch user details
    const user = await db.user.findUnique({
      where: { id: effectiveUserId },
      include: {
        profile: {
          include: { club: true },
        },
      },
    });

    if (!user) {
      return { success: false, error: "Athlete record not found" };
    }

    // Fetch results for this athlete
    const results = await db.result.findMany({
      where: { userId: effectiveUserId },
      include: {
        event: true,
      },
      orderBy: {
        event: {
          date: "desc",
        },
      },
    });

    if (results.length === 0) {
      return { success: true, certificates: [] };
    }

    const certificates: CompetitionCertificatePayload[] = [];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Query active tenant branding if configured
    const activeBranding = await db.tenantBranding.findFirst({
      where: { isApproved: true },
      orderBy: { updatedAt: "desc" },
    });

    for (const r of results) {
      const event = r.event;

      // 1. Fetch or create Certificate record
      let certRecord = await db.certificate.findFirst({
        where: {
          userId: effectiveUserId,
          eventId: event.id,
        },
      });

      if (!certRecord) {
        // Generate unique verifiable code: IPF-CERT-2026-XXXXXX
        const codeSuffix = r.id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || Math.random().toString(36).substring(2, 8).toUpperCase();
        const verificationCode = `IPF-CERT-2026-${codeSuffix}`;

        try {
          certRecord = await db.certificate.create({
            data: {
              verificationCode,
              userId: effectiveUserId,
              eventId: event.id,
              issueDate: new Date(),
            },
          });
        } catch {
          // If collision or concurrent insert, re-query
          certRecord = await db.certificate.findFirst({
            where: {
              userId: effectiveUserId,
              eventId: event.id,
            },
          });
        }
      }

      const verificationCode = certRecord?.verificationCode || `IPF-CERT-2026-${r.id.slice(-6).toUpperCase()}`;
      const verificationUrl = `${appUrl}/verify/${verificationCode}`;

      // Generate dynamic QR Code for instant scanning
      const qrDataUrl = await generateQrDataUrl(verificationUrl, {
        width: 360,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // 2. Fetch meet registration metadata for division & bodyweight
      const registration = await db.meetRegistration.findUnique({
        where: {
          userId_eventId: {
            userId: effectiveUserId,
            eventId: event.id,
          },
        },
      });

      // Count lifters in the same event
      const totalLiftersInClass = await db.result.count({
        where: { eventId: event.id },
      });

      // Determine medal / standing
      const rank = r.rank;
      let medal: "GOLD" | "SILVER" | "BRONZE" | "PARTICIPATION" = "PARTICIPATION";
      let medalText = "MERIT OF EXCELLENCE";

      if (rank === 1) {
        medal = "GOLD";
        medalText = "🥇 1ST PLACE • NATIONAL GOLD MEDALIST";
      } else if (rank === 2) {
        medal = "SILVER";
        medalText = "🥈 2ND PLACE • NATIONAL SILVER MEDALIST";
      } else if (rank === 3) {
        medal = "BRONZE";
        medalText = "🥉 3RD PLACE • NATIONAL BRONZE MEDALIST";
      } else if (rank && rank <= 5) {
        medalText = `TOP 5 NATIONAL PLACEMENT (#${rank} OF ${totalLiftersInClass || 8})`;
      }

      certificates.push({
        certificateId: certRecord?.id || r.id,
        verificationCode,
        verificationUrl,
        qrDataUrl,
        athleteId: effectiveUserId,
        athleteName: user.name || "Verified Athlete",
        email: user.email,
        gender: user.profile?.gender || "MALE",
        weightClass: user.profile?.weightClass?.replace("WC_", "") || "83",
        bodyweight: registration?.bodyweight || (user.profile?.gender === "FEMALE" ? 63 : 83),
        division: registration?.division || "OPEN",
        equipment: registration?.equipment || "RAW",
        meetId: event.id,
        meetTitle: event.title,
        meetLocation: event.location,
        meetDate: event.date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        bestSquat: r.bestSquat || 0,
        bestBench: r.bestBench || 0,
        bestDeadlift: r.bestDeadlift || 0,
        total: r.total || 0,
        ipfGlPoints: r.ipfGlPoints || 0,
        rank: r.rank || null,
        totalLiftersInClass: totalLiftersInClass || 8,
        medal,
        medalText,
        issueDate: (certRecord?.issueDate || new Date()).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        federationName: activeBranding?.organizationName || "Indian Powerlifting Federation",
        tagline: activeBranding?.tagline || "Estd. 1975 • Affiliated Member",
        logoUrl: activeBranding?.logoUrl || "/images/at-logo.png",
        primaryColor: activeBranding?.primaryColor || "#b8860b",
        sealText: activeBranding?.sealText || "OFFICIAL RATIFIED SEAL",
        presidentName: activeBranding?.presidentName || "Akash & Tanvi",
        presidentSignUrl: activeBranding?.presidentSignUrl || null,
        secretaryName: activeBranding?.secretaryName || "Authorized Signatory",
        secretarySignUrl: activeBranding?.secretarySignUrl || null,
      });
    }

    return {
      success: true,
      certificates,
    };
  } catch (error: any) {
    console.error("Failed to get athlete certificates:", error);
    return { success: false, error: error.message || "Failed to load certificates" };
  }
}

/**
 * Get official Athlete Digital ID Card pass details
 */
export async function getAthleteIdCardAction(
  targetUserId?: string
): Promise<{
  success: boolean;
  idCard?: AthleteIdCardPayload;
  error?: string;
}> {
  try {
    const session = await auth();
    const effectiveUserId = targetUserId || session?.user?.id;

    if (!effectiveUserId) {
      return { success: false, error: "Authentication required" };
    }

    const db = prisma as any;

    const user = await db.user.findUnique({
      where: { id: effectiveUserId },
      include: {
        profile: {
          include: { club: true },
        },
        memberships: {
          orderBy: { endDate: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return { success: false, error: "Athlete not found" };
    }

    const membership = user.memberships?.[0] || null;
    const cardNumber = membership?.cardNumber || `FED-2026-${effectiveUserId.slice(-4).toUpperCase()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify/${cardNumber}`;

    const qrDataUrl = await generateQrDataUrl(verificationUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const isExpired = membership ? new Date(membership.endDate) < new Date() : false;
    const status = membership
      ? isExpired
        ? "EXPIRED"
        : (membership.status as any)
      : "PENDING";

    // Query active approved tenant branding if configured
    const activeBranding = await db.tenantBranding.findFirst({
      where: { isApproved: true },
      orderBy: { updatedAt: "desc" },
    });

    const idCard: AthleteIdCardPayload = {
      cardNumber,
      athleteId: effectiveUserId,
      athleteName: user.name || "Federation Athlete",
      email: user.email,
      image: user.image || null,
      role: user.role || "MEMBER",
      planType: membership?.planType?.replace("_", " ") || "ANNUAL COMPETITIVE ATHLETE",
      status,
      startDate: (membership?.startDate || new Date()).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      endDate: (
        membership?.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      ).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      gender: user.profile?.gender || "MALE",
      weightClass: user.profile?.weightClass?.replace("WC_", "") ? `${user.profile.weightClass.replace("WC_", "")} KG` : "83 KG",
      clubState: activeBranding?.organizationName || user.profile?.club?.state || "Maharashtra State Powerlifting Association",
      qrDataUrl,
      verificationUrl,
      isVerified: status === "ACTIVE",
      tenantOrganizationName: activeBranding?.organizationName || "Indian Powerlifting Federation",
      tenantTagline: activeBranding?.tagline || "Affiliated Member State Body",
      tenantLogoUrl: activeBranding?.logoUrl || null,
      primaryColor: activeBranding?.primaryColor || "#e6501b",
      secondaryColor: activeBranding?.secondaryColor || "#0a0a0a",
      sealText: activeBranding?.sealText || "OFFICIAL RATIFIED SEAL",
      presidentName: activeBranding?.presidentName || "President",
      secretaryName: activeBranding?.secretaryName || "General Secretary",
    };

    return {
      success: true,
      idCard,
    };
  } catch (error: any) {
    console.error("Failed to fetch athlete ID card:", error);
    return { success: false, error: error.message || "Failed to load ID card" };
  }
}
