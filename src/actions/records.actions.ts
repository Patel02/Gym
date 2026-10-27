"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Division, EquipmentType, Gender, LiftType, WeightClass } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

export type RecordApprovalData = {
  liftType: LiftType;
  weightClass: WeightClass;
  division: Division;
  equipment: EquipmentType;
  gender: Gender;
  weight: number;
  athleteId: string;
  meetId: string;
};

export async function approveRecord(data: RecordApprovalData) {
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  if (!Number.isFinite(data.weight) || data.weight <= 0 || !data.athleteId || !data.meetId) {
    return { success: false, error: "Invalid national record data." };
  }

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const current = await transaction.nationalRecord.findUnique({
        where: {
          liftType_weightClass_division_equipment_gender: {
            liftType: data.liftType,
            weightClass: data.weightClass,
            division: data.division,
            equipment: data.equipment,
            gender: data.gender,
          },
        },
        select: { weight: true },
      });

      if (current && data.weight <= current.weight) {
        return { approved: false as const, currentWeight: current.weight };
      }

      const record = await transaction.nationalRecord.upsert({
        where: {
          liftType_weightClass_division_equipment_gender: {
            liftType: data.liftType,
            weightClass: data.weightClass,
            division: data.division,
            equipment: data.equipment,
            gender: data.gender,
          },
        },
        update: {
          weight: data.weight,
          athleteId: data.athleteId,
          meetId: data.meetId,
          dateSet: new Date(),
        },
        create: { ...data, dateSet: new Date() },
      });

      await transaction.auditLog.create({
        data: {
          adminId,
          action: "APPROVED_NATIONAL_RECORD",
          entityType: "RECORD",
          entityId: record.id,
          details: JSON.stringify({ weight: data.weight, athleteId: data.athleteId, liftType: data.liftType }),
        },
      });

      return { approved: true as const };
    });

    if (!result.approved) {
      return { success: false, error: `Approval rejected. Current record is ${result.currentWeight} kg or higher.` };
    }

    revalidateTag("records", "max");
    revalidatePath("/admin/records-manager");
    revalidatePath("/records");

    return { success: true };
  } catch (error) {
    console.error("Failed to approve national record:", error);
    return { success: false, error: "Database error during record approval." };
  }
}