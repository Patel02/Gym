"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type WeighInData = {
  registrationId: string;
  bodyweight: number;
  lotNumber: number;
};

export async function submitWeighIn(data: WeighInData) {
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId || (session.user?.role !== "ADMIN" && session.user?.role !== "REFEREE")) {
    return { success: false, error: "Unauthorized. Admin/Referee access required." };
  }

  if (!data.registrationId || !Number.isFinite(data.bodyweight) || data.bodyweight <= 0 || !Number.isInteger(data.lotNumber) || data.lotNumber <= 0) {
    return { success: false, error: "Enter a valid bodyweight and lot number." };
  }

  try {
    const updatedRegistration = await prisma.$transaction(async (transaction) => {
      const registration = await transaction.meetRegistration.update({
        where: { id: data.registrationId },
        data: {
          bodyweight: data.bodyweight,
          lotNumber: data.lotNumber,
        },
        include: { user: true },
      });

      await transaction.auditLog.create({
        data: {
          adminId,
          action: "WEIGH_IN_COMPLETED",
          entityType: "MEET_REGISTRATION",
          entityId: data.registrationId,
          details: JSON.stringify({ bodyweight: data.bodyweight, lotNumber: data.lotNumber }),
        },
      });

      return registration;
    });

    revalidatePath("/admin/weigh-in");
    return { success: true, message: `Weigh-in recorded for ${updatedRegistration.user.name ?? "athlete"}.` };
  } catch (error) {
    console.error("Weigh-in failed:", error);
    return { success: false, error: "Database error during weigh-in submission." };
  }
}