import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { generateSecuritySignature } from "@/lib/pdf/security-signer";
import { generateCompetitionCertificatePdf } from "@/lib/pdf/certificate-pdf";
import { generatePodiumBadgeSvg } from "@/lib/pdf/digital-badges";
import { uploadCredentialToStorage } from "@/lib/pdf/storage-uploader";
import { dispatchCertificateEmail } from "@/lib/pdf/email-dispatcher";

export const generateCompetitionCertificateFunction = inngest.createFunction(
  {
    id: "generate-competition-certificate",
    name: "Automated Competition Certificate & Podium Badge Generator",
    retries: 2,
    triggers: [
      { event: "certificate/generate" },
      { event: "meet/results.finalized" },
    ],
  },
  async ({ event, step }: any) => {
    const { certificateId, verificationCode, userId, eventId, resultId } = event.data;

    // 1. Fetch Certificate, Event, User, and Result
    const data = await step.run("fetch-certificate-and-result-data", async () => {
      // Find or locate Certificate
      let cert = await prisma.certificate.findFirst({
        where: {
          OR: [
            certificateId ? { id: certificateId } : undefined,
            verificationCode ? { verificationCode } : undefined,
            userId && eventId ? { userId, eventId } : undefined,
          ].filter(Boolean) as any[],
        },
      });

      const targetUserId = cert?.userId || userId;
      const targetEventId = cert?.eventId || eventId;

      if (!targetUserId || !targetEventId) {
        throw new Error("Missing target user or event for certificate generation");
      }

      const [user, meetEvent, result] = await Promise.all([
        prisma.user.findUnique({
          where: { id: targetUserId },
          include: { profile: true },
        }),
        prisma.event.findUnique({
          where: { id: targetEventId },
        }),
        prisma.result.findFirst({
          where: {
            OR: [
              resultId ? { id: resultId } : undefined,
              { userId: targetUserId, eventId: targetEventId },
            ].filter(Boolean) as any[],
          },
        }),
      ]);

      if (!user) throw new Error(`User not found: ${targetUserId}`);
      if (!meetEvent) throw new Error(`Event not found: ${targetEventId}`);

      // If certificate record does not exist yet, create one
      if (!cert) {
        const generatedCode = `IPF-CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        cert = await prisma.certificate.create({
          data: {
            verificationCode: generatedCode,
            userId: targetUserId,
            eventId: targetEventId,
            issueDate: new Date(),
          },
        });
      }

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

      const division = (result as any)?.division || user.profile?.gender || "Open";
      const weightClass = (result as any)?.weightClass || user.profile?.weightClass || "Open";
      const equipment = (result as any)?.equipment || "Raw / Classic";

      return {
        certificateId: cert.id,
        verificationCode: cert.verificationCode,
        issueDate: cert.issueDate.toISOString().split("T")[0],
        userId: user.id,
        userName: user.name || "Athlete",
        userEmail: user.email,
        gender: user.profile?.gender || "Open",
        meetId: meetEvent.id,
        meetTitle: meetEvent.title,
        meetLocation: meetEvent.location || "National Stadium Complex",
        meetDate: meetEvent.date ? new Date(meetEvent.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-IN"),
        bestSquat: result?.bestSquat || 0,
        bestBench: result?.bestBench || 0,
        bestDeadlift: result?.bestDeadlift || 0,
        total: result?.total || 0,
        ipfGlPoints: result?.ipfGlPoints || 0,
        rank,
        medal,
        medalText,
        division,
        weightClass,
        equipment,
      };
    });

    // 2. Generate Cryptographic Tamper-Proof Security Signature
    const security = await step.run("generate-cryptographic-hash", async () => {
      return generateSecuritySignature({
        id: data.certificateId,
        type: "CERTIFICATE",
        userId: data.userId,
        code: data.verificationCode,
        metadata: `${data.total}KG-${data.ipfGlPoints.toFixed(2)}GL`,
      });
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "https://ipf-federation.in";
    const verificationUrl = `${baseUrl}/verify/${encodeURIComponent(data.verificationCode)}`;

    // 3. Generate High-Res PDF & Vector Digital Podium Badge
    const { pdfBase64, badgeSvg } = await step.run(
      "generate-pdf-and-digital-badge",
      async () => {
        const pdfBuffer = await generateCompetitionCertificatePdf({
          certificateId: data.certificateId,
          verificationCode: data.verificationCode,
          verificationUrl,
          athleteName: data.userName,
          division: data.division,
          weightClass: data.weightClass,
          gender: data.gender,
          equipment: data.equipment,
          meetTitle: data.meetTitle,
          meetLocation: data.meetLocation,
          meetDate: data.meetDate,
          bestSquat: data.bestSquat,
          bestBench: data.bestBench,
          bestDeadlift: data.bestDeadlift,
          total: data.total,
          ipfGlPoints: data.ipfGlPoints,
          rank: data.rank,
          medal: data.medal,
          medalText: data.medalText,
          issueDate: data.issueDate,
          securityHash: security.fullHash,
          shortHash: security.shortHash,
        });

        const svg = generatePodiumBadgeSvg({
          athleteName: data.userName,
          medal: data.medal,
          rank: data.rank,
          meetTitle: data.meetTitle,
          total: data.total,
          ipfGlPoints: data.ipfGlPoints,
          shortHash: security.shortHash,
          year: new Date().getFullYear().toString(),
        });

        return {
          pdfBase64: pdfBuffer.toString("base64"),
          badgeSvg: svg,
        };
      }
    );

    // 4. Upload Assets to Cloud Storage (Uploadthing / Resilient Fallback)
    const uploads = await step.run("upload-to-cloud-storage", async () => {
      const pdfBuffer = Buffer.from(pdfBase64, "base64");
      const badgeBuffer = Buffer.from(badgeSvg, "utf-8");

      const pdfResult = await uploadCredentialToStorage(
        pdfBuffer,
        `${data.verificationCode}.pdf`,
        "application/pdf"
      );

      const badgeResult = await uploadCredentialToStorage(
        badgeBuffer,
        `${data.verificationCode}-badge.svg`,
        "image/svg+xml"
      );

      return {
        pdfUrl: pdfResult.url,
        badgeUrl: badgeResult.url,
        provider: pdfResult.provider,
      };
    });

    // 5. Update Database Record with Cloud URLs & Cryptographic Hash
    await step.run("update-database-record", async () => {
      await prisma.certificate.update({
        where: { id: data.certificateId },
        data: {
          pdfUrl: uploads.pdfUrl,
          badgeUrl: uploads.badgeUrl,
          securityHash: security.fullHash,
          rank: data.rank,
          medal: data.medal,
        } as Prisma.CertificateUpdateInput,
      });
    });

    // 6. Dispatch Email with Digital Badge & PDF Attachment
    const emailResult = await step.run("dispatch-email-notification", async () => {
      if (!data.userEmail) {
        return { delivered: false, reason: "No user email" };
      }

      const pdfBuffer = Buffer.from(pdfBase64, "base64");
      return await dispatchCertificateEmail({
        recipientEmail: data.userEmail,
        recipientName: data.userName,
        meetTitle: data.meetTitle,
        medalText: data.medalText,
        total: data.total,
        ipfGlPoints: data.ipfGlPoints,
        pdfUrl: uploads.pdfUrl,
        pdfBuffer,
        badgeSvg,
        badgeUrl: uploads.badgeUrl,
        shortHash: security.shortHash,
        verificationCode: data.verificationCode,
        verificationUrl,
      });
    });

    return {
      success: true,
      certificateId: data.certificateId,
      verificationCode: data.verificationCode,
      pdfUrl: uploads.pdfUrl,
      badgeUrl: uploads.badgeUrl,
      securityHash: security.shortHash,
      emailDelivered: emailResult.delivered,
    };
  }
);
