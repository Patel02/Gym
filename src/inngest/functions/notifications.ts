import { inngest, resend } from "@/inngest/client";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return entities[character] ?? character;
  });
}

export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email", triggers: { event: "membership/created" } },
  async ({ event, step }) => {
    const { email, name, cardNumber } = event.data;

    await step.run("send-email-via-resend", async () => {
      if (!resend) {
        throw new Error("RESEND_API_KEY is not configured");
      }

      const safeName = escapeHtml(name);
      const safeCardNumber = escapeHtml(cardNumber);
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "Federation <noreply@yourfederation.com>",
        to: email,
        subject: "Welcome to the Federation - Your Official ID",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 8px;">
            <h1 style="color: #FF4500; text-transform: uppercase;">Welcome, ${safeName}!</h1>
            <p style="color: #cccccc; font-size: 16px;">Your membership has been approved. You are now officially cleared to compete in sanctioned meets.</p>
            <div style="background-color: #111111; border: 1px solid #333333; padding: 20px; border-radius: 4px; margin: 30px 0;">
              <p style="color: #888888; font-size: 12px; text-transform: uppercase; margin: 0 0 5px 0;">Official Federation ID</p>
              <p style="font-size: 24px; font-family: monospace; font-weight: bold; margin: 0; color: #ffffff;">${safeCardNumber}</p>
            </div>
            <p style="color: #cccccc; font-size: 14px;">Use this ID to register for upcoming meets. See you on the platform.</p>
          </div>
        `,
      });

      if (result.error) {
        console.error("Resend API Error:", result.error);
        throw new Error("Failed to send membership email");
      }

      return { success: true, email };
    });
  },
);