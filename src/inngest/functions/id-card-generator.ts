import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import { generateSecuritySignature } from "@/lib/pdf/security-signer";
import { generateAthleteIdCardPdf } from "@/lib/pdf/id-card-pdf";
import { generateAthleteBadgeSvg } from "@/lib/pdf/digital-badges";
import { uploadCredentialToStorage } from "@/lib/pdf/storage-uploader";
import { dispatchIdCardEmail } from "@/lib/pdf/email-dispatcher";

export const generateAthleteIdCardFunction = inngest.createFunction(
  {
    id: "generate-athlete-id-card",
    name: "Automated Athlete ID Card & Digital Badge Generator",
    retries: 2,
    triggers: [
      { event: "membership/created" },
      { event: "membership/approved" },
      { event: "athlete/id-card.generate" },
    ],
  },
  async ({ event, step }: any) => {
    const { membershipId, cardNumber, userId } = event.data;

    // 1. Fetch Membership and Athlete Profile
    const data = await step.run("fetch-athlete-membership-data", async () => {
      const membership = await prisma.membership.findFirst({
        where: {
          OR: [
            membershipId ? { id: membershipId } : undefined,
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
        throw new Error(`Membership not found for query: ${JSON.stringify(event.data)}`);
      }

      return {
        membershipId: membership.id,
        cardNumber: membership.cardNumber,
        userId: membership.userId,
        planType: membership.planType,
        startDate: membership.startDate.toISOString().split("T")[0],
        endDate: membership.endDate.toISOString().split("T")[0],
        user: {
          id: membership.user.id,
          name: membership.user.name || "Athlete",
          email: membership.user.email,
          role: membership.user.role,
        },
        profile: membership.user.profile
          ? {
            gender: membership.user.profile.gender || "OPEN",
            weightClass: membership.user.profile.weightClass || "OPEN",
            state: membership.user.profile.club?.state || "National",
            club: membership.user.profile.club?.name || "Federation Gym",
          }
          : {
            gender: "OPEN",
            weightClass: "OPEN",
            state: "National",
            club: "Federation Gym",
          },
      };
    });

    // 2. Generate Cryptographic Security Signature & Tamper-Proof Stamp
    const security = await step.run("generate-cryptographic-hash", async () => {
      return generateSecuritySignature({
        id: data.membershipId,
        type: "ID_CARD",
        userId: data.userId,
        code: data.cardNumber,
        metadata: data.planType,
      });
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "https://ipf-federation.in";
    const verificationUrl = `${baseUrl}/verify/${encodeURIComponent(data.cardNumber)}`;

    // 3. Generate High-Res PDF and Vector Digital Badge
    const { pdfBase64, badgeSvg } = await step.run(
      "generate-pdf-and-digital-badge",
      async () => {
        const clubOrState = data.profile.state !== "National" ? data.profile.state : data.profile.club;

        const pdfBuffer = await generateAthleteIdCardPdf({
          cardNumber: data.cardNumber,
          athleteName: data.user.name,
          email: data.user.email,
          gender: data.profile.gender,
          weightClass: data.profile.weightClass,
          clubState: clubOrState,
          planType: data.planType,
          role: data.user.role,
          startDate: data.startDate,
          endDate: data.endDate,
          verificationUrl,
          securityHash: security.fullHash,
          shortHash: security.shortHash,
        });

        const svg = generateAthleteBadgeSvg({
          athleteName: data.user.name,
          cardNumber: data.cardNumber,
          weightClass: data.profile.weightClass,
          gender: data.profile.gender,
          clubState: clubOrState,
          shortHash: security.shortHash,
          validThru: data.endDate,
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
        `${data.cardNumber}-pass.pdf`,
        "application/pdf"
      );

      const badgeResult = await uploadCredentialToStorage(
        badgeBuffer,
        `${data.cardNumber}-badge.svg`,
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
      await prisma.membership.update({
        where: { id: data.membershipId },
        data: {
          idCardPdfUrl: uploads.pdfUrl || null,
          badgeUrl: uploads.badgeUrl || null,
          securityHash: security.fullHash,
        },
      });
    });

    // 6. Dispatch Email with Digital Badge & PDF Attachment
    const emailResult = await step.run("dispatch-email-notification", async () => {
      if (!data.user.email) {
        return { delivered: false, reason: "No user email" };
      }

      const pdfBuffer = Buffer.from(pdfBase64, "base64");
      return await dispatchIdCardEmail({
        recipientEmail: data.user.email,
        recipientName: data.user.name,
        cardNumber: data.cardNumber,
        pdfUrl: uploads.pdfUrl,
        pdfBuffer,
        badgeSvg,
        badgeUrl: uploads.badgeUrl,
        shortHash: security.shortHash,
        verificationUrl,
      });
    });

    return {
      success: true,
      membershipId: data.membershipId,
      cardNumber: data.cardNumber,
      pdfUrl: uploads.pdfUrl,
      badgeUrl: uploads.badgeUrl,
      securityHash: security.shortHash,
      emailDelivered: emailResult.delivered,
    };
  }
);
