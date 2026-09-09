"use server";

import { auth } from "@/auth";
import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import { membershipSchema, type MembershipInput } from "@/lib/validations/membership.schema";
import { revalidatePath } from "next/cache";

function createCardNumber() {
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase();
  return `FED-${new Date().getFullYear()}-${suffix}`;
}

export async function purchaseMembership(data: MembershipInput) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "Unauthorized access. Please log in." };
    }

    const parsed = membershipSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid membership data." };
    }

    const { planType, amountPaid, durationMonths } = parsed.data;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const membership = await prisma.membership.create({
      data: {
        userId,
        planType,
        amountPaid,
        status: "ACTIVE",
        cardNumber: createCardNumber(),
        startDate,
        endDate,
      },
    });

    if (session.user.email) {
      await inngest.send({
        name: "membership/created",
        data: {
          email: session.user.email,
          name: session.user.name || "Athlete",
          cardNumber: membership.cardNumber,
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, cardNumber: membership.cardNumber };
  } catch (error) {
    console.error("Membership creation failed:", error);
    return { success: false, error: "Internal server error during membership creation." };
  }
}