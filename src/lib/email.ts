import { z } from "zod";
import { resend } from "@/inngest/client";

const emailMessageSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
});

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const parsed = emailMessageSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid transactional email message.");
  }
  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    throw new Error("Resend email delivery is not configured.");
  }

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    ...parsed.data,
  });
  if (result.error) {
    throw new Error("Transactional email delivery failed.");
  }
  if (!result.data?.id) {
    throw new Error("Transactional email provider did not confirm delivery.");
  }

  return result.data.id;
}

export function escapeHtml(value: string) {
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
