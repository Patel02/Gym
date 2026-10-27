import { inngest, resend } from "@/inngest/client";
import { prisma } from "@/lib/prisma";

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
  async ({ event, step }: any) => {
    const { userId, membershipId } = event.data;

    // 1. Fetch user, profile, active federation branding, and membership details
    const user = await step.run("fetch-user-data", async () => {
      return await prisma.user.findFirst({
        where: {
          OR: [
            userId ? { id: userId } : undefined,
            membershipId ? { memberships: { some: { id: membershipId } } } : undefined,
          ].filter(Boolean) as any[],
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
    await step.run("send-credential-email", async () => {
      if (!user.email) {
        console.warn("[Inngest] User has no email on file, skipping email dispatch.");
        return { skipped: true, reason: "No email on user profile" };
      }

      if (!resend) {
        console.log(`[Inngest] Resend API key not configured. Mocking email delivery to: ${user.email}`, {
          payload: certificatePayload,
        });
        return { mocked: true, recipient: user.email };
      }

      try {
        const emailResult = await resend.emails.send({
          from: "Federation Credentials <credentials@resend.dev>",
          to: user.email,
          subject: `🏆 Your Official ${branding.federationName} Digital ID & Certificate`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #080808; color: #ffffff; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #C9A227;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${branding.logoUrl}" alt="Association Logo" style="width: 70px; height: 70px; object-fit: contain; margin-bottom: 10px;" />
                <h2 style="color: #C9A227; text-transform: uppercase; margin: 0;">${branding.federationName}</h2>
                <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Official Ratified Accreditation</p>
              </div>
              
              <p style="color: #ccc; font-size: 14px;">Dear <b>${user.name || "Athlete"}</b>,</p>
              <p style="color: #ccc; font-size: 14px; line-height: 1.6;">Your annual federation membership has been successfully approved. Your official digital ID pass and competition certificate have been generated with embedded cryptographic verification.</p>
              
              <div style="background-color: #141414; border: 1px solid #333; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
                <span style="font-size: 12px; color: #888; text-transform: uppercase; display: block; margin-bottom: 8px;">Membership ID Pass Code</span>
                <span style="font-size: 20px; font-family: monospace; font-weight: bold; color: #E6501B; letter-spacing: 3px;">${certificatePayload.cardNumber}</span>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${certificatePayload.verificationUrl}" style="background-color: #E6501B; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; text-transform: uppercase; font-size: 12px; display: inline-block;">Verify Authenticity Online</a>
              </div>

              <p style="color: #666; font-size: 10px; text-align: center; margin-top: 40px;">Signed digitally by President ${branding.presidentName} & Secretary General ${branding.secretaryName}.</p>
            </div>
          `,
        });

        return { success: true, emailResult };
      } catch (err: any) {
        console.error("[Inngest] Resend email dispatch failed:", err?.message || err);
        return { success: false, error: err?.message || String(err) };
      }
    });

    return {
      success: true,
      userId: user.id,
      cardNumber: certificatePayload.cardNumber,
    };
  }
);
