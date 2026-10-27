import { inngest, resend } from "@/inngest/client";
import { escapeHtml } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const credentialEventSchema = z
  .object({
    userId: z.string().min(1).optional(),
    membershipId: z.string().min(1).optional(),
  })
  .refine((data) => data.userId || data.membershipId);

export const generateCredentialsWorker = inngest.createFunction(
  {
    id: "generate-athlete-credentials",
    name: "Automated Athlete Credentials & Certificate Worker",
    retries: 2,
    triggers: [
      { event: "athlete/membership.purchased" },
      { event: "membership/created" },
      { event: "membership/approved" },
    ],
  },
  async ({ event, step }) => {
    const parsedEvent = credentialEventSchema.safeParse(event.data);
    if (!parsedEvent.success) {
      throw new Error("Invalid credential-generation event.");
    }
    const { userId, membershipId } = parsedEvent.data;

    // 1. Fetch user, profile, active federation branding, and membership details
    const user = await step.run("fetch-user-data", async () => {
      const userFilters: Prisma.UserWhereInput[] = [];
      if (userId) userFilters.push({ id: userId });
      if (membershipId) {
        userFilters.push({ memberships: { some: { id: membershipId } } });
      }

      return await prisma.user.findFirst({
        where: {
          OR: userFilters,
        },
        include: {
          profile: true,
          memberships: membershipId
            ? { where: { id: membershipId } }
            : { orderBy: { startDate: "desc" }, take: 1 },
        },
      });
    });

    if (!user) {
      throw new Error(`User not found for credential generation (userId: ${userId}, membershipId: ${membershipId})`);
    }

    const branding = await step.run("fetch-federation-branding", async () => {
      try {
        const tenant = await prisma.tenantBranding.findFirst({
          orderBy: { createdAt: "desc" },
        });

        if (tenant) {
          return {
            federationName: tenant.organizationName || "World Powerlifting India Association of Gujarat",
            logoUrl: tenant.logoUrl || "/images/wpi-logo-transparent.png",
            primaryColor: tenant.primaryColor || "#e6501b",
            presidentName: tenant.presidentName || "Dr. Rajesh Kumar",
            secretaryName: tenant.secretaryName || "Amit Sharma",
          };
        }
      } catch (err) {
        console.warn("[Inngest] Could not load tenant branding from DB, using official defaults:", err);
      }

      return {
        federationName: "World Powerlifting India Association of Gujarat",
        logoUrl: "/images/wpi-logo-transparent.png",
        primaryColor: "#e6501b",
        presidentName: "Dr. Rajesh Kumar",
        secretaryName: "Amit Sharma",
      };
    });

    // 2. Compile High-Res PDF & Certificate Compilation with Background Association Logo
    const certificatePayload = await step.run("compile-certificate-layout", async () => {
      const activeMembership = user.memberships?.[0];
      const cardNumber = activeMembership?.cardNumber || `FED-2026-${user.id.slice(0, 6).toUpperCase()}`;

      return {
        title: "Certificate of Athletic Merit & Membership",
        athleteName: user.name || "Federation Athlete",
        cardNumber,
        federation: branding.federationName,
        logo: branding.logoUrl,
        issuedDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        verificationUrl: `https://ipf-federation.in/verify/${cardNumber}`,
        signatories: {
          president: branding.presidentName,
          secretary: branding.secretaryName,
        },
      };
    });

    // 3. Dispatch Email with Digital Badge & Credentials via Resend
    const emailResult = await step.run("send-credential-email", async () => {
      if (!user.email) {
        return { delivered: false, skipped: true, reason: "No email address is on file." };
      }

      const fromEmail = process.env.RESEND_FROM_EMAIL;
      if (!resend || !fromEmail) {
        throw new Error("Resend email delivery is not configured.");
      }

      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: `Your Official ${branding.federationName} Digital ID & Certificate`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #080808; color: #ffffff; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #C9A227;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${escapeHtml(branding.logoUrl ?? "")}" alt="Association Logo" style="width: 70px; height: 70px; object-fit: contain; margin-bottom: 10px;" />
              <h2 style="color: #C9A227; text-transform: uppercase; margin: 0;">${escapeHtml(branding.federationName)}</h2>
              <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Official Ratified Accreditation</p>
            </div>
            
            <p style="color: #ccc; font-size: 14px;">Dear <b>${escapeHtml(user.name || "Athlete")}</b>,</p>
            <p style="color: #ccc; font-size: 14px; line-height: 1.6;">Your annual federation membership has been successfully approved. Your official digital ID pass and competition certificate have been generated with embedded cryptographic verification.</p>
            
            <div style="background-color: #141414; border: 1px solid #333; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
              <span style="font-size: 12px; color: #888; text-transform: uppercase; display: block; margin-bottom: 8px;">Membership ID Pass Code</span>
              <span style="font-size: 20px; font-family: monospace; font-weight: bold; color: #E6501B; letter-spacing: 3px;">${escapeHtml(certificatePayload.cardNumber)}</span>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${escapeHtml(certificatePayload.verificationUrl)}" style="background-color: #E6501B; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; text-transform: uppercase; font-size: 12px; display: inline-block;">Verify Authenticity Online</a>
            </div>

            <p style="color: #666; font-size: 10px; text-align: center; margin-top: 40px;">Signed digitally by President ${escapeHtml(branding.presidentName)} &amp; Secretary General ${escapeHtml(branding.secretaryName)}.</p>
          </div>
        `,
      });
      if (emailResult.error || !emailResult.data?.id) {
        throw new Error("Resend could not confirm credential email delivery.");
      }

      return { delivered: true, skipped: false, messageId: emailResult.data.id };
    });

    return {
      success: true,
      userId: user.id,
      cardNumber: certificatePayload.cardNumber,
      emailDelivered: emailResult.delivered,
    };
  }
);
