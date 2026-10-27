"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MeetStatus } from "@prisma/client";
import { runCryptographicLotDraw, CryptographicDrawResult } from "@/lib/cryptographic-lot-randomizer";
import { classifyIpfWeightClass } from "@/lib/ipf-weight-classes";

const db = prisma as any;

export type WeighInData = {
  registrationId: string;
  bodyweight: number;
  lotNumber: number;
  openingSquat?: number;
  openingBench?: number;
  openingDeadlift?: number;
  rackHeightSquat?: string;
  rackHeightBench?: string;
  isReclassified?: boolean;
  reclassifiedClass?: string;
};

/**
 * Enhanced Weigh-In Submission with Opening Attempts & Audit Trail
 */
export async function submitWeighIn(data: WeighInData) {
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId || (session.user?.role !== "ADMIN" && session.user?.role !== "REFEREE" && session.user?.role !== "SUPER_ADMIN")) {
    return { success: false, error: "Unauthorized. Admin/Referee access required." };
  }

  if (
    !data.registrationId ||
    !Number.isFinite(data.bodyweight) ||
    data.bodyweight <= 0 ||
    !Number.isInteger(data.lotNumber) ||
    data.lotNumber <= 0
  ) {
    return { success: false, error: "Enter a valid bodyweight and lot number." };
  }

  try {
    const updatedRegistration = await db.$transaction(async (tx: any) => {
      // 1. Update registration bodyweight and lot number
      const registration = await tx.meetRegistration.update({
        where: { id: data.registrationId },
        data: {
          bodyweight: data.bodyweight,
          lotNumber: data.lotNumber,
        },
        include: {
          user: { include: { profile: true } },
          event: true,
        },
      });

      // 2. If opening attempts provided, upsert into Result table for match day scoring
      if (
        (data.openingSquat && data.openingSquat > 0) ||
        (data.openingBench && data.openingBench > 0) ||
        (data.openingDeadlift && data.openingDeadlift > 0)
      ) {
        await tx.result.upsert({
          where: {
            userId_eventId: {
              userId: registration.userId,
              eventId: registration.eventId,
            },
          },
          update: {
            squat1: data.openingSquat || null,
            bench1: data.openingBench || null,
            deadlift1: data.openingDeadlift || null,
          },
          create: {
            userId: registration.userId,
            eventId: registration.eventId,
            squat1: data.openingSquat || null,
            bench1: data.openingBench || null,
            deadlift1: data.openingDeadlift || null,
          },
        });
      }

      // 3. Create Audit Log
      await tx.auditLog.create({
        data: {
          adminId,
          action: "WEIGH_IN_COMPLETED",
          entityType: "MEET_REGISTRATION",
          entityId: data.registrationId,
          details: JSON.stringify({
            athleteName: registration.user?.name,
            bodyweight: data.bodyweight,
            lotNumber: data.lotNumber,
            openingSquat: data.openingSquat,
            openingBench: data.openingBench,
            openingDeadlift: data.openingDeadlift,
            rackHeightSquat: data.rackHeightSquat,
            rackHeightBench: data.rackHeightBench,
            isReclassified: data.isReclassified,
            reclassifiedClass: data.reclassifiedClass,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      return registration;
    });

    revalidatePath("/admin/weigh-in");
    revalidatePath("/live");
    revalidatePath("/referee/dashboard");

    return {
      success: true,
      message: `Weigh-in recorded for ${updatedRegistration.user.name ?? "athlete"} (BW: ${data.bodyweight} kg, Lot #${data.lotNumber}).`,
    };
  } catch (error: any) {
    console.error("Weigh-in failed:", error);
    return { success: false, error: error.message || "Database error during weigh-in submission." };
  }
}

/**
 * Provably Fair Cryptographic Lot Number Draw Action
 * 
 * Runs a cryptographically secure random permutation for all approved
 * registrations in a championship meet, writes proof hash to audit logs,
 * and updates database lot numbers.
 */
export async function runCryptographicLotDrawAction(
  eventId: string
): Promise<{ success: boolean; result?: CryptographicDrawResult; error?: string }> {
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId || (session.user?.role !== "ADMIN" && session.user?.role !== "REFEREE" && session.user?.role !== "SUPER_ADMIN")) {
    return { success: false, error: "Unauthorized. Admin privileges required to run lot draw." };
  }

  try {
    const registrations = await db.meetRegistration.findMany({
      where: {
        eventId,
        status: MeetStatus.APPROVED,
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (registrations.length === 0) {
      return { success: false, error: "No approved athletes found for this championship meet." };
    }

    const athletesPayload = registrations.map((r: any) => ({
      id: r.id,
      name: r.user?.name || "Athlete",
    }));

    // Run cryptographic random draw
    const drawResult = runCryptographicLotDraw(eventId, athletesPayload);

    // Save lot numbers in transaction
    await db.$transaction(async (tx: any) => {
      for (const assignment of drawResult.assignments) {
        await tx.meetRegistration.update({
          where: { id: assignment.registrationId },
          data: { lotNumber: assignment.lotNumber },
        });
      }

      // Record immutable audit log with cryptographic proof hash
      await tx.auditLog.create({
        data: {
          adminId,
          action: "CRYPTOGRAPHIC_LOT_DRAW_COMPLETED",
          entityType: "EVENT",
          entityId: eventId,
          details: JSON.stringify({
            proofHash: drawResult.proofHash,
            seedHex: drawResult.seedHex,
            timestamp: drawResult.sessionTimestamp,
            totalAthletes: drawResult.totalAthletes,
            algorithm: drawResult.algorithm,
            verifiedBy: drawResult.verifiedBy,
          }),
        },
      });
    });

    revalidatePath("/admin/weigh-in");
    revalidatePath("/live");
    revalidatePath("/referee/dashboard");

    return {
      success: true,
      result: drawResult,
    };
  } catch (err: any) {
    console.error("runCryptographicLotDrawAction error:", err);
    return { success: false, error: err.message || "Failed to execute cryptographic lot draw." };
  }
}