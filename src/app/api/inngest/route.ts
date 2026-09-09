import { inngest } from "@/inngest/client";
import { sendWelcomeEmail } from "@/inngest/functions/notifications";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendWelcomeEmail],
});