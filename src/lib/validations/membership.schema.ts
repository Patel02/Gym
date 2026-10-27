import { z } from "zod";

export const membershipSchema = z.object({
  planType: z.enum(["ANNUAL_ATHLETE", "LIFETIME", "COACH_OFFICIAL"], {
    error: "Please select a valid membership plan.",
  }),
  amountPaid: z.number().positive("Amount must be greater than zero."),
  durationMonths: z.number().int().positive("Duration must be a positive integer."),
});

export type MembershipInput = z.infer<typeof membershipSchema>;