import { Inngest } from "inngest";
import { Resend } from "resend";

export const inngest = new Inngest({ id: "federation-platform" });
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;