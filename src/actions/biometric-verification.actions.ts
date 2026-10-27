"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  executeFacialBiometricVerification,
  type BiometricMatchResult,
} from "@/lib/facial-biometric-engine";

const db = prisma as any;

async function ensureWeighInMarshalAccess() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "REFEREE")) {
    throw new Error("Unauthorized. Technical Marshal, Referee, or Admin clearance required.");
  }
  return session.user;
}

/**
 * Execute Biometric Facial Match at Weigh-In Desk
 */
export async function verifyAthleteBiometricsAction(
  registrationId: string,
  liveCaptureBase64: string,
  options?: { isEnrollment?: boolean }
): Promise<{
  success: boolean;
  result?: BiometricMatchResult;
  athlete?: {
    id: string;
    name: string;
    weightClass: string;
    photoUrl: string | null;
  };
  error?: string;
}> {
  try {
    const caller = await ensureWeighInMarshalAccess();

    const registration = await db.meetRegistration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          include: { profile: true },
        },
        event: true,
      },
    });

    if (!registration) {
      return { success: false, error: "Competitor registration record not found." };
    }

    const athleteName = registration.user?.name || registration.user?.email || "Competitor";
    const referencePhoto = registration.user?.image || null;

    // Run facial matching engine
    const matchResult = executeFacialBiometricVerification({
      athleteId: registration.userId,
      athleteName,
      referenceImage: referencePhoto,
      liveCaptureImage: liveCaptureBase64,
      isEnrollment: options?.isEnrollment,
    });

    // Parse existing metadata in paymentRef
    let meta: any = {};
    try {
      if (registration.paymentRef && registration.paymentRef.startsWith("{")) {
        meta = JSON.parse(registration.paymentRef);
      }
    } catch {
      meta = {};
    }

    // Merge updated biometric verification payload
    const updatedMeta = {
      ...meta,
      biometricVerified: matchResult.isMatch,
      biometricConfidence: matchResult.similarityPercentage,
      biometricConfidenceGrade: matchResult.confidenceGrade,
      biometricStatus: matchResult.status,
      biometricVerifiedAt: matchResult.verifiedAt,
      biometricVerifiedBy: caller.name || caller.email || "Weigh-in Marshal",
      biometricProofHash: matchResult.proofHash,
      isProxyFlagged: !matchResult.isMatch,
    };

    await db.$transaction(async (tx: any) => {
      // 1. If baseline enrollment or athlete had no photo, update user profile photo
      if ((options?.isEnrollment || !registration.user?.image) && liveCaptureBase64) {
        await tx.user.update({
          where: { id: registration.userId },
          data: { image: liveCaptureBase64 },
        });
      }

      // 2. Persist biometric metadata in registration
      await tx.meetRegistration.update({
        where: { id: registrationId },
        data: {
          paymentRef: JSON.stringify(updatedMeta),
        },
      });

      // 3. Write immutable audit log for Technical Jury verification
      await tx.auditLog.create({
        data: {
          adminId: caller.id,
          action: matchResult.isMatch
            ? "BIOMETRIC_CHECKIN_VERIFIED"
            : "BIOMETRIC_PROXY_ALERT_FLAGGED",
          entityType: "MEET_REGISTRATION",
          entityId: registrationId,
          details: JSON.stringify({
            athleteName,
            athleteId: registration.userId,
            similarityPercentage: matchResult.similarityPercentage,
            confidenceGrade: matchResult.confidenceGrade,
            status: matchResult.status,
            proofHash: matchResult.proofHash,
            marshal: caller.name || caller.email,
            timestamp: matchResult.verifiedAt,
          }),
        },
      });
    });

    revalidatePath("/admin/weigh-in");
    revalidatePath("/admin/flights");
    revalidatePath("/referee/dashboard");

    return {
      success: true,
      result: matchResult,
      athlete: {
        id: registration.userId,
        name: athleteName,
        weightClass: registration.user?.profile?.weightClass || "WC_83",
        photoUrl: registration.user?.image || liveCaptureBase64,
      },
    };
  } catch (err: any) {
    console.error("Biometric verification error:", err);
    return { success: false, error: err.message || "Facial biometric matching failed." };
  }
}

/**
 * Flag an athlete as a suspected proxy / imposter
 */
export async function flagSuspectedProxyLifterAction(
  registrationId: string,
  reason: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const caller = await ensureWeighInMarshalAccess();

    const registration = await db.meetRegistration.findUnique({
      where: { id: registrationId },
      include: { user: true },
    });

    if (!registration) return { success: false, error: "Registration not found." };

    let meta: any = {};
    try {
      if (registration.paymentRef && registration.paymentRef.startsWith("{")) {
        meta = JSON.parse(registration.paymentRef);
      }
    } catch {}

    meta.isProxyFlagged = true;
    meta.proxyReason = reason;
    meta.proxyFlaggedAt = new Date().toISOString();
    meta.proxyFlaggedBy = caller.name || caller.email;

    await db.$transaction(async (tx: any) => {
      await tx.meetRegistration.update({
        where: { id: registrationId },
        data: { paymentRef: JSON.stringify(meta) },
      });

      await tx.auditLog.create({
        data: {
          adminId: caller.id,
          action: "ATHLETE_PROXY_FLAGGED_BY_MARSHAL",
          entityType: "MEET_REGISTRATION",
          entityId: registrationId,
          details: JSON.stringify({
            athleteName: registration.user?.name,
            reason,
            marshal: caller.name || caller.email,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    });

    revalidatePath("/admin/weigh-in");

    return { success: true, message: "Competitor flagged for Chief Referee inspection." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to flag competitor." };
  }
}

/**
 * Reset biometric verification state for re-scanning
 */
export async function resetAthleteBiometricStateAction(
  registrationId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await ensureWeighInMarshalAccess();

    const registration = await db.meetRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) return { success: false, error: "Registration not found." };

    let meta: any = {};
    try {
      if (registration.paymentRef && registration.paymentRef.startsWith("{")) {
        meta = JSON.parse(registration.paymentRef);
      }
    } catch {}

    delete meta.biometricVerified;
    delete meta.biometricConfidence;
    delete meta.biometricConfidenceGrade;
    delete meta.biometricStatus;
    delete meta.biometricVerifiedAt;
    delete meta.biometricProofHash;
    delete meta.isProxyFlagged;
    delete meta.proxyReason;

    await db.meetRegistration.update({
      where: { id: registrationId },
      data: { paymentRef: JSON.stringify(meta) },
    });

    revalidatePath("/admin/weigh-in");

    return { success: true, message: "Biometric record cleared. Ready for new live scan." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reset biometrics." };
  }
}
