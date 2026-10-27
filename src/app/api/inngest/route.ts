import { inngest } from "@/inngest/client";
import { sendWelcomeEmail } from "@/inngest/functions/notifications";
import { generateAthleteIdCardFunction } from "@/inngest/functions/id-card-generator";
import { generateCompetitionCertificateFunction } from "@/inngest/functions/certificate-generator";
import { generateCredentialsWorker } from "@/inngest/functions/generate-credentials";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendWelcomeEmail,
    generateAthleteIdCardFunction,
    generateCompetitionCertificateFunction,
    generateCredentialsWorker,
  ],
});