"use server";

import { auth } from "@/auth";
import {
  calculateIpfGl,
  calculateIpfGlPoints,
  calculateDots,
  calculateWilks,
  calculateTotal,
  getBestAttempt,
} from "@/lib/calculations";
import { prisma } from "@/lib/prisma";
import { broadcastLiveArenaUpdate } from "@/lib/live-stream-hub";
import { revalidatePath, revalidateTag } from "next/cache";
import fs from "fs/promises";
import path from "path";

const liftFields = [
  "squat1",
  "squat2",
  "squat3",
  "bench1",
  "bench2",
  "bench3",
  "deadlift1",
  "deadlift2",
  "deadlift3",
] as const;

export type LiftField = (typeof liftFields)[number];

export interface ScoreUpdateData {
  resultId: string;
  liftField: LiftField;
  weight: number;
  currentVersion: number;
}

export interface LiveScoringMeetDto {
  id: string;
  title: string;
  dates: string;
  city: string;
  status: string;
  liftersCount: number;
}

export interface LiveScoringResultDto {
  id: string;
  userId: string;
  eventId: string;
  version: number;
  bodyweight: number | null;
  squat1: number | null;
  squat2: number | null;
  squat3: number | null;
  bestSquat: number | null;
  bench1: number | null;
  bench2: number | null;
  bench3: number | null;
  bestBench: number | null;
  deadlift1: number | null;
  deadlift2: number | null;
  deadlift3: number | null;
  bestDeadlift: number | null;
  total: number | null;
  ipfGlPoints: number | null;
  rank: number | null;
  phoneNumber?: string | null;
  coachPhone?: string | null;
  coachName?: string | null;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    phone?: string | null;
    profile: {
      weightClass: string;
      gender: string;
      phoneNumber?: string | null;
      coachPhone?: string | null;
      coachName?: string | null;
    } | null;
  };
}

export async function ensureEventsSeeded() {
  try {
    const count = await prisma.event.count();
    if (count === 0) {
      const filePath = path.join(process.cwd(), "src", "data", "federation-events.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data.events)) {
        for (const ev of data.events) {
          const numericFee = parseFloat((ev.entryFee || "0").replace(/[^0-9.]/g, "")) || 2500;
          await prisma.event.upsert({
            where: { id: ev.id },
            update: {
              title: ev.title,
              location: `${ev.city || "National"}, ${ev.venue || "Indoor Arena"}`,
              status: ev.status,
              entryFee: numericFee,
            },
            create: {
              id: ev.id,
              title: ev.title,
              date: new Date("2026-07-18"),
              location: `${ev.city || "National"}, ${ev.venue || "Indoor Arena"}`,
              status: ev.status,
              entryFee: numericFee,
              registrationOpen: new Date(),
              registrationClose: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              maxAthletes: 120,
              meetDirector: "Federation Technical Committee",
            },
          });
        }
      }
    }
  } catch (err) {
    console.warn("Could not ensure events seeded:", err);
  }
}

export async function getLiveScoringMeetsAction(): Promise<{
  success: boolean;
  meets?: LiveScoringMeetDto[];
  error?: string;
}> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "REFEREE" && role !== "MEET_DIRECTOR") {
      return { success: false, error: "Unauthorized access." };
    }

    await ensureEventsSeeded();

    const events = await prisma.event.findMany({
      orderBy: { date: "desc" },
      include: {
        _count: {
          select: { results: true },
        },
      },
    });

    const meets: LiveScoringMeetDto[] = events.map((ev) => ({
      id: ev.id,
      title: ev.title,
      dates: ev.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      city: ev.location,
      status: ev.status,
      liftersCount: ev._count.results,
    }));

    return { success: true, meets };
  } catch (err: any) {
    console.error("Failed to load meets for scoring:", err);
    return { success: false, error: err.message || "Failed to load meets." };
  }
}

export async function getMeetScoringResultsAction(
  eventId: string
): Promise<{
  success: boolean;
  results?: LiveScoringResultDto[];
  error?: string;
}> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "REFEREE" && role !== "MEET_DIRECTOR") {
      return { success: false, error: "Unauthorized access." };
    }

    const records = await prisma.result.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            phone: true,
            profile: {
              select: {
                weightClass: true,
                gender: true,
                phoneNumber: true,
                coachPhone: true,
                coachName: true,
              },
            },
          },
        },
      },
      orderBy: [{ total: "desc" }, { ipfGlPoints: "desc" }, { user: { name: "asc" } }],
    });

    // Get bodyweight and contact phones from MeetRegistration if available
    const registrations = await prisma.meetRegistration.findMany({
      where: { eventId },
      select: { userId: true, bodyweight: true, contactPhone: true, coachPhone: true },
    });
    const bwMap = new Map(registrations.map((r) => [r.userId, r.bodyweight]));
    const regMap = new Map(registrations.map((r) => [r.userId, r]));

    const results: LiveScoringResultDto[] = records.map((r, idx) => {
      const reg = regMap.get(r.userId);
      const lifterPhone = reg?.contactPhone || r.user.profile?.phoneNumber || r.user.phone || null;
      const coachPhone = reg?.coachPhone || r.user.profile?.coachPhone || null;
      const coachName = r.user.profile?.coachName || null;

      return {
        id: r.id,
        userId: r.userId,
        eventId: r.eventId,
        version: r.version,
        bodyweight: bwMap.get(r.userId) || 82.5,
        phoneNumber: lifterPhone,
        coachPhone,
        coachName,
        squat1: r.squat1,
        squat2: r.squat2,
        squat3: r.squat3,
        bestSquat: r.bestSquat,
        bench1: r.bench1,
        bench2: r.bench2,
        bench3: r.bench3,
        bestBench: r.bestBench,
        deadlift1: r.deadlift1,
        deadlift2: r.deadlift2,
        deadlift3: r.deadlift3,
        bestDeadlift: r.bestDeadlift,
        total: r.total,
        ipfGlPoints: r.ipfGlPoints,
        rank: idx + 1,
        user: r.user,
      };
    });

    return { success: true, results };
  } catch (err: any) {
    console.error("Failed to load meet results:", err);
    return { success: false, error: err.message || "Failed to load scoring results." };
  }
}

export async function enrollLifterToMeetAction(data: {
  eventId: string;
  userId: string;
  bodyweight?: number;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "REFEREE") {
      return { success: false, error: "Unauthorized access." };
    }

    const athlete = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { profile: true },
    });

    if (!athlete) {
      return { success: false, error: "Athlete not found." };
    }

    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
    });

    if (!event) {
      return { success: false, error: "Championship meet not found." };
    }

    const defaultBw = data.bodyweight || (athlete.profile?.gender === "FEMALE" ? 63.0 : 83.0);

    await prisma.$transaction(async (tx) => {
      await tx.meetRegistration.upsert({
        where: {
          userId_eventId: {
            userId: data.userId,
            eventId: data.eventId,
          },
        },
        update: {
          status: "APPROVED",
          bodyweight: defaultBw,
        },
        create: {
          userId: data.userId,
          eventId: data.eventId,
          status: "APPROVED",
          division: "OPEN",
          equipment: "RAW",
          bodyweight: defaultBw,
        },
      });

      await tx.result.upsert({
        where: {
          userId_eventId: {
            userId: data.userId,
            eventId: data.eventId,
          },
        },
        update: {},
        create: {
          userId: data.userId,
          eventId: data.eventId,
          version: 1,
          squat1: null,
          squat2: null,
          squat3: null,
          bench1: null,
          bench2: null,
          bench3: null,
          deadlift1: null,
          deadlift2: null,
          deadlift3: null,
          total: 0,
          ipfGlPoints: 0,
        },
      });
    });

    revalidatePath("/admin/live-scoring");
    return {
      success: true,
      message: `${athlete.name || athlete.email} has been enrolled to the live platform.`,
    };
  } catch (err: any) {
    console.error("Failed to enroll athlete:", err);
    return { success: false, error: err.message || "Failed to enroll athlete to platform." };
  }
}

export async function autoEnrollActiveLiftersAction(
  eventId: string
): Promise<{ success: boolean; error?: string; message?: string; enrolledCount?: number }> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "REFEREE") {
      return { success: false, error: "Unauthorized access." };
    }

    const athletes = await prisma.user.findMany({
      where: { role: { in: ["MEMBER", "ADMIN"] } },
      include: { profile: true },
      take: 20,
    });

    if (athletes.length === 0) {
      return { success: false, error: "No registered athletes found in database." };
    }

    let count = 0;
    for (const athlete of athletes) {
      const defaultBw = athlete.profile?.gender === "FEMALE" ? 63.0 : 83.0;

      await prisma.meetRegistration.upsert({
        where: {
          userId_eventId: {
            userId: athlete.id,
            eventId,
          },
        },
        update: {
          status: "APPROVED",
          bodyweight: defaultBw,
        },
        create: {
          userId: athlete.id,
          eventId,
          status: "APPROVED",
          division: "OPEN",
          equipment: "RAW",
          bodyweight: defaultBw,
        },
      });

      await prisma.result.upsert({
        where: {
          userId_eventId: {
            userId: athlete.id,
            eventId,
          },
        },
        update: {},
        create: {
          userId: athlete.id,
          eventId,
          version: 1,
          squat1: null,
          squat2: null,
          squat3: null,
          bench1: null,
          bench2: null,
          bench3: null,
          deadlift1: null,
          deadlift2: null,
          deadlift3: null,
          total: 0,
          ipfGlPoints: 0,
        },
      });

      count++;
    }

    revalidatePath("/admin/live-scoring");
    return {
      success: true,
      message: `Enrolled ${count} lifters to this championship meet platform.`,
      enrolledCount: count,
    };
  } catch (err: any) {
    console.error("Auto enroll failed:", err);
    return { success: false, error: err.message || "Failed to auto-enroll lifters." };
  }
}

export async function submitRefereeAttemptDecisionAction(data: {
  resultId: string;
  liftField: LiftField;
  declaredWeight: number;
  ref1: "WHITE" | "RED";
  headRef: "WHITE" | "RED";
  ref3: "WHITE" | "RED";
}): Promise<{
  success: boolean;
  error?: string;
  isGoodLift?: boolean;
  recordedWeight?: number;
  bestSquat?: number;
  bestBench?: number;
  bestDeadlift?: number;
  total?: number;
  ipfGlPoints?: number;
}> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    const role = session?.user?.role;
    if (!adminId || (role !== "ADMIN" && role !== "REFEREE" && role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    // Count white lights
    const whiteCount = [data.ref1, data.headRef, data.ref3].filter((l) => l === "WHITE").length;
    const isGoodLift = whiteCount >= 2;

    // Per IPF rules: Good lift = positive weight, No lift = negative weight
    const absWeight = Math.abs(data.declaredWeight);
    const recordedWeight = isGoodLift ? absWeight : -absWeight;

    // Support mock or sample lifter simulation in test/demo mode
    if (data.resultId.startsWith("mock-") || data.resultId === "sample-lifter") {
      try {
        broadcastLiveArenaUpdate(
          "referee_decision",
          {
            resultId: data.resultId,
            lifterName: "Sample Competitor",
            liftField: data.liftField,
            declaredWeight: data.declaredWeight,
            isGoodLift,
            recordedWeight,
            ref1: data.ref1,
            headRef: data.headRef,
            ref3: data.ref3,
            bestSquat: absWeight,
            bestBench: 140,
            bestDeadlift: 240,
            total: 600,
            ipfGlPoints: 85.5,
          }
        );
      } catch (broadcastErr) {
        console.warn("[SSE] Demo Broadcast error:", broadcastErr);
      }

      return {
        success: true,
        isGoodLift,
        recordedWeight,
        bestSquat: absWeight,
        bestBench: 140,
        bestDeadlift: 240,
        total: 600,
        ipfGlPoints: 85.5,
      };
    }

    const currentResult = await prisma.result.findUnique({
      where: { id: data.resultId },
      include: { user: { include: { profile: true } } },
    });

    if (!currentResult || !currentResult.user.profile) {
      return { success: false, error: "Result record or athlete profile not found." };
    }

    const attempts = {
      squat1: currentResult.squat1,
      squat2: currentResult.squat2,
      squat3: currentResult.squat3,
      bench1: currentResult.bench1,
      bench2: currentResult.bench2,
      bench3: currentResult.bench3,
      deadlift1: currentResult.deadlift1,
      deadlift2: currentResult.deadlift2,
      deadlift3: currentResult.deadlift3,
      [data.liftField]: recordedWeight,
    };

    const bestSquat = getBestAttempt(attempts.squat1, attempts.squat2, attempts.squat3);
    const bestBench = getBestAttempt(attempts.bench1, attempts.bench2, attempts.bench3);
    const bestDeadlift = getBestAttempt(attempts.deadlift1, attempts.deadlift2, attempts.deadlift3);
    const total = calculateTotal(bestSquat, bestBench, bestDeadlift);

    const registration = await prisma.meetRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: currentResult.userId,
          eventId: currentResult.eventId,
        },
      },
      select: { bodyweight: true },
    });

    const bw = registration?.bodyweight || 82.5;
    const ipfGlPoints = calculateIpfGl(bw, total, currentResult.user.profile.gender);

    await prisma.result.update({
      where: { id: data.resultId },
      data: {
        [data.liftField]: recordedWeight,
        bestSquat,
        bestBench,
        bestDeadlift,
        total,
        ipfGlPoints,
        version: { increment: 1 },
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          adminId,
          action: "REFEREE_ATTEMPT_DECISION",
          entityType: "RESULT",
          entityId: data.resultId,
          details: JSON.stringify({
            lifterName: currentResult.user.name,
            field: data.liftField,
            declared: data.declaredWeight,
            decision: isGoodLift ? "GOOD LIFT" : "NO LIFT",
            whiteLights: whiteCount,
            recordedWeight,
            total,
            ipfGlPoints,
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit log error:", auditErr);
    }

    // 🔴 SSE Real-Time Broadcast — push to all jumbotron & referee screens
    try {
      broadcastLiveArenaUpdate(
        "referee_decision",
        {
          resultId: data.resultId,
          lifterName: currentResult.user.name,
          liftField: data.liftField,
          declaredWeight: data.declaredWeight,
          isGoodLift,
          recordedWeight,
          ref1: data.ref1,
          headRef: data.headRef,
          ref3: data.ref3,
          bestSquat,
          bestBench,
          bestDeadlift,
          total,
          ipfGlPoints,
        },
        currentResult.eventId
      );
    } catch (broadcastErr) {
      console.warn("[SSE] Broadcast error (non-fatal):", broadcastErr);
    }

    revalidateTag("leaderboard", "max");
    revalidateTag("live-arena", "max");
    revalidatePath("/");
    revalidatePath("/live");
    revalidatePath("/admin/live-scoring");
    revalidatePath("/championships");
    revalidatePath("/dashboard");
    revalidatePath("/referee/dashboard");

    return {
      success: true,
      isGoodLift,
      recordedWeight,
      bestSquat,
      bestBench,
      bestDeadlift,
      total,
      ipfGlPoints,
    };
  } catch (err: any) {
    console.error("Referee decision error:", err);
    return { success: false, error: err.message || "Failed to record attempt." };
  }
}

export async function removeLifterFromMeetScoringAction(
  resultId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "REFEREE") {
      return { success: false, error: "Unauthorized access." };
    }

    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!result) {
      return { success: false, error: "Scoring record not found." };
    }

    await prisma.result.delete({
      where: { id: resultId },
    });

    revalidatePath("/admin/live-scoring");
    return {
      success: true,
      message: `Removed ${result.user.name || result.user.email} from active scoring.`,
    };
  } catch (err: any) {
    console.error("Failed to remove lifter:", err);
    return { success: false, error: err.message || "Failed to remove lifter." };
  }
}

export async function updateLiftScore(data: ScoreUpdateData) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    const role = session?.user?.role;

    if (!adminId || (role !== "ADMIN" && role !== "REFEREE")) {
      return { success: false, error: "Unauthorized. Admin/Referee access required." };
    }

    const currentResult = await prisma.result.findUnique({
      where: { id: data.resultId },
      include: { user: { include: { profile: true } } },
    });

    if (!currentResult || !currentResult.user.profile) {
      return { success: false, error: "Result or athlete profile not found." };
    }

    const attempts = {
      squat1: currentResult.squat1,
      squat2: currentResult.squat2,
      squat3: currentResult.squat3,
      bench1: currentResult.bench1,
      bench2: currentResult.bench2,
      bench3: currentResult.bench3,
      deadlift1: currentResult.deadlift1,
      deadlift2: currentResult.deadlift2,
      deadlift3: currentResult.deadlift3,
      [data.liftField]: data.weight,
    };

    const bestSquat = getBestAttempt(attempts.squat1, attempts.squat2, attempts.squat3);
    const bestBench = getBestAttempt(attempts.bench1, attempts.bench2, attempts.bench3);
    const bestDeadlift = getBestAttempt(attempts.deadlift1, attempts.deadlift2, attempts.deadlift3);
    const total = calculateTotal(bestSquat, bestBench, bestDeadlift);

    const registration = await prisma.meetRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: currentResult.userId,
          eventId: currentResult.eventId,
        },
      },
      select: { bodyweight: true },
    });

    const ipfGlPoints = registration?.bodyweight
      ? calculateIpfGl(registration.bodyweight, total, currentResult.user.profile.gender)
      : 0;

    await prisma.result.update({
      where: { id: data.resultId },
      data: {
        [data.liftField]: data.weight,
        bestSquat,
        bestBench,
        bestDeadlift,
        total,
        ipfGlPoints,
        version: { increment: 1 },
      },
    });

    // 🔴 SSE Real-Time Broadcast — push score update to all connected screens
    try {
      broadcastLiveArenaUpdate(
        "score_update",
        {
          resultId: data.resultId,
          liftField: data.liftField,
          weight: data.weight,
          bestSquat,
          bestBench,
          bestDeadlift,
          total,
          ipfGlPoints,
        },
        currentResult.eventId
      );
    } catch (broadcastErr) {
      console.warn("[SSE] Score broadcast error (non-fatal):", broadcastErr);
    }

    revalidateTag("leaderboard", "max");
    revalidateTag("live-arena", "max");
    revalidatePath("/");
    revalidatePath("/live");
    revalidatePath("/admin/live-scoring");
    revalidatePath("/championships");
    revalidatePath("/dashboard");
    revalidatePath("/referee/dashboard");

    return {
      success: true,
      newVersion: currentResult.version + 1,
      bestSquat,
      bestBench,
      bestDeadlift,
      total,
      ipfGlPoints,
    };
  } catch (error: any) {
    console.error("Score update failed:", error);
    return { success: false, error: error.message || "Database error during score update." };
  }
}

export async function getAvailableAthletesForEnrollAction(eventId: string): Promise<{
  success: boolean;
  athletes?: Array<{ id: string; name: string | null; email: string | null; weightClass?: string; gender?: string }>;
  error?: string;
}> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "REFEREE") {
      return { success: false, error: "Unauthorized access." };
    }

    // Get all userIds already in this event's results
    const existingResults = await prisma.result.findMany({
      where: { eventId },
      select: { userId: true },
    });
    const enrolledUserIds = new Set(existingResults.map((r) => r.userId));

    const users = await prisma.user.findMany({
      where: {
        role: { in: ["MEMBER", "ADMIN"] },
        id: { notIn: Array.from(enrolledUserIds) },
      },
      include: { profile: true },
      orderBy: { name: "asc" },
      take: 50,
    });

    const athletes = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      weightClass: u.profile?.weightClass,
      gender: u.profile?.gender,
    }));

    return { success: true, athletes };
  } catch (err: any) {
    console.error("Failed to load available athletes:", err);
    return { success: false, error: err.message || "Failed to load athletes." };
  }
}

export async function submitJuryOverruleAction(data: {
  resultId: string;
  liftField: LiftField;
  overruleTo: "GOOD_LIFT" | "NO_LIFT";
  reason: string;
}): Promise<{
  success: boolean;
  error?: string;
  recordedWeight?: number;
  bestSquat?: number;
  bestBench?: number;
  bestDeadlift?: number;
  total?: number;
  ipfGlPoints?: number;
}> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "REFEREE" && role !== "MEET_DIRECTOR") {
      return { success: false, error: "Unauthorized access: Technical Jury authorization required." };
    }

    const currentResult = await prisma.result.findUnique({
      where: { id: data.resultId },
      include: { user: { include: { profile: true } } },
    });

    if (!currentResult || !currentResult.user.profile) {
      return { success: false, error: "Result record or athlete profile not found." };
    }

    const currentVal = currentResult[data.liftField];
    if (currentVal === null || currentVal === undefined) {
      return { success: false, error: "Cannot overrule an attempt that has not been declared yet." };
    }

    const absWeight = Math.abs(currentVal);
    const recordedWeight = data.overruleTo === "GOOD_LIFT" ? absWeight : -absWeight;

    const attempts = {
      squat1: currentResult.squat1,
      squat2: currentResult.squat2,
      squat3: currentResult.squat3,
      bench1: currentResult.bench1,
      bench2: currentResult.bench2,
      bench3: currentResult.bench3,
      deadlift1: currentResult.deadlift1,
      deadlift2: currentResult.deadlift2,
      deadlift3: currentResult.deadlift3,
      [data.liftField]: recordedWeight,
    };

    const bestSquat = getBestAttempt(attempts.squat1, attempts.squat2, attempts.squat3);
    const bestBench = getBestAttempt(attempts.bench1, attempts.bench2, attempts.bench3);
    const bestDeadlift = getBestAttempt(attempts.deadlift1, attempts.deadlift2, attempts.deadlift3);
    const total = calculateTotal(bestSquat, bestBench, bestDeadlift);

    const registration = await prisma.meetRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: currentResult.userId,
          eventId: currentResult.eventId,
        },
      },
      select: { bodyweight: true },
    });

    const bodyweight = registration?.bodyweight || 83;
    const gender = currentResult.user.profile.gender;
    const ipfGlPoints = calculateIpfGl(bodyweight, total, gender);

    await prisma.result.update({
      where: { id: data.resultId },
      data: {
        [data.liftField]: recordedWeight,
        bestSquat: bestSquat !== null ? bestSquat : null,
        bestBench: bestBench !== null ? bestBench : null,
        bestDeadlift: bestDeadlift !== null ? bestDeadlift : null,
        total,
        ipfGlPoints,
        version: { increment: 1 },
      },
    });

    revalidatePath("/live");
    revalidatePath("/leaderboard");
    revalidatePath("/referee/dashboard");

    return {
      success: true,
      recordedWeight,
      bestSquat: bestSquat || 0,
      bestBench: bestBench || 0,
      bestDeadlift: bestDeadlift || 0,
      total,
      ipfGlPoints,
    };
  } catch (err: any) {
    console.error("Jury overrule failed:", err);
    return { success: false, error: err.message || "Failed to process Jury overrule." };
  }
}

// ── REFEREE PRE-MEET WEIGH-IN & COMPLIANCE CERTIFICATION ───────────────────────
export async function certifyAthleteWeighInAction(data: {
  userId: string;
  eventId: string;
  bodyweight: number;
  lotNumber: number;
  squatRack?: string;
  benchRack?: string;
  safetyPin?: string;
  gearSummary?: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    const role = session?.user?.role;
    if (!adminId || (role !== "ADMIN" && role !== "REFEREE")) {
      return { success: false, error: "Unauthorized. Admin or Referee credentials required." };
    }

    if (!data.bodyweight || data.bodyweight <= 0) {
      return { success: false, error: "Invalid bodyweight." };
    }

    // 1. Update or create MeetRegistration
    const reg = await prisma.meetRegistration.upsert({
      where: {
        userId_eventId: {
          userId: data.userId,
          eventId: data.eventId,
        },
      },
      update: {
        bodyweight: data.bodyweight,
        lotNumber: data.lotNumber || 1,
        status: "APPROVED",
      },
      create: {
        userId: data.userId,
        eventId: data.eventId,
        bodyweight: data.bodyweight,
        lotNumber: data.lotNumber || 1,
        status: "APPROVED",
      },
      include: { user: { include: { profile: true } } },
    });

    // 2. Also update Result if exists and recalculate GL points
    const result = await prisma.result.findFirst({
      where: { userId: data.userId, eventId: data.eventId },
    });

    if (result && reg.user.profile?.gender) {
      const gl = result.total ? calculateIpfGl(data.bodyweight, result.total, reg.user.profile.gender) : null;
      await prisma.result.update({
        where: { id: result.id },
        data: {
          ipfGlPoints: gl,
        },
      });
    }

    // 3. Audit log
    await prisma.auditLog.create({
      data: {
        adminId,
        action: "REFEREE_WEIGH_IN_CERTIFIED",
        entityType: "MEET_REGISTRATION",
        entityId: reg.id,
        details: JSON.stringify({
          bodyweight: data.bodyweight,
          lotNumber: data.lotNumber,
          squatRack: data.squatRack,
          benchRack: data.benchRack,
          safetyPin: data.safetyPin,
          gearSummary: data.gearSummary,
        }),
      },
    });

    revalidatePath("/referee/dashboard");
    revalidatePath("/live");
    revalidatePath("/championships");

    return {
      success: true,
      message: `Weigh-in certified at ${data.bodyweight.toFixed(2)} KG for ${reg.user.name || "Competitor"}.`,
    };
  } catch (err: any) {
    console.error("Weigh-in certification failed:", err);
    return { success: false, error: err.message || "Failed to certify weigh-in." };
  }
}

// ── REFEREE CODE OF CONDUCT & DISQUALIFICATION ACTION ─────────────────────────
export async function issueRefereeConductWarningAction(data: {
  athleteName: string;
  type: "YELLOW_WARNING" | "RED_DISQUALIFICATION";
  reason: string;
  ruleCode?: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    const role = session?.user?.role;
    if (!adminId || (role !== "ADMIN" && role !== "REFEREE")) {
      return { success: false, error: "Unauthorized. Admin or Referee credentials required." };
    }

    await prisma.auditLog.create({
      data: {
        adminId,
        action: data.type === "RED_DISQUALIFICATION" ? "REFEREE_DISQUALIFICATION" : "REFEREE_CONDUCT_WARNING",
        entityType: "CODE_OF_CONDUCT",
        entityId: data.athleteName,
        details: JSON.stringify({
          sanction: data.type,
          athleteName: data.athleteName,
          reason: data.reason,
          ruleCode: data.ruleCode || "IPF Section 13",
          issuedBy: session?.user?.name || "Official Referee",
          timestamp: new Date().toISOString(),
        }),
      },
    });

    revalidatePath("/referee/dashboard");
    revalidatePath("/live");

    return {
      success: true,
      message: `${data.type === "RED_DISQUALIFICATION" ? "🟥 RED CARD: Immediate Disqualification" : "🟨 YELLOW CARD: Official Warning"} issued to ${data.athleteName}.`,
    };
  } catch (err: any) {
    console.error("Conduct warning failed:", err);
    return { success: false, error: err.message || "Failed to issue conduct sanction." };
  }
}

// ── REFEREE LOADER ERROR CORRECTION ACTION (IPF RULE 8.4) ──────────────────────
export async function reportLoaderWeightMismatchAction(data: {
  declaredWeight: number;
  loadedWeight: number;
  lifterName: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    const role = session?.user?.role;
    if (!adminId || (role !== "ADMIN" && role !== "REFEREE")) {
      return { success: false, error: "Unauthorized." };
    }

    await prisma.auditLog.create({
      data: {
        adminId,
        action: "LOADER_ERROR_CORRECTION",
        entityType: "PLATFORM_LOAD",
        entityId: data.lifterName,
        details: JSON.stringify({
          lifterName: data.lifterName,
          declaredWeight: data.declaredWeight,
          loadedWeight: data.loadedWeight,
          incident: "Weight on bar differed from declared weight. Referee halted platform attempt and reset 60s clock per IPF Rule 8.4.",
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return {
      success: true,
      message: `Loader error recorded: ${data.loadedWeight}kg found instead of ${data.declaredWeight}kg. 60s clock reset.`,
    };
  } catch (err: any) {
    console.error("Loader error report failed:", err);
    return { success: false, error: err.message || "Failed to report loader error." };
  }
}

// ── OPENLIFTER COMPATIBLE: UPDATE ATTEMPT SCORE ACTION ─────────────────────────
export async function updateAttemptScore(data: {
  resultId: string;
  attemptType: LiftField;
  weight: number;
}) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    const role = session?.user?.role;
    if (!adminId || (role !== "ADMIN" && role !== "REFEREE" && role !== "MEET_DIRECTOR")) {
      return { success: false, error: "Unauthorized. Admin/Referee credentials required." };
    }

    const currentResult = await prisma.result.findUnique({
      where: { id: data.resultId },
      include: {
        user: { include: { profile: true } },
        event: true,
      },
    });

    if (!currentResult || !currentResult.user.profile) {
      return { success: false, error: "Result record or athlete profile not found." };
    }

    const attempts = {
      squat1: data.attemptType === "squat1" ? data.weight : currentResult.squat1,
      squat2: data.attemptType === "squat2" ? data.weight : currentResult.squat2,
      squat3: data.attemptType === "squat3" ? data.weight : currentResult.squat3,
      bench1: data.attemptType === "bench1" ? data.weight : currentResult.bench1,
      bench2: data.attemptType === "bench2" ? data.weight : currentResult.bench2,
      bench3: data.attemptType === "bench3" ? data.weight : currentResult.bench3,
      deadlift1: data.attemptType === "deadlift1" ? data.weight : currentResult.deadlift1,
      deadlift2: data.attemptType === "deadlift2" ? data.weight : currentResult.deadlift2,
      deadlift3: data.attemptType === "deadlift3" ? data.weight : currentResult.deadlift3,
    };

    const bestSquat = getBestAttempt(attempts.squat1, attempts.squat2, attempts.squat3);
    const bestBench = getBestAttempt(attempts.bench1, attempts.bench2, attempts.bench3);
    const bestDeadlift = getBestAttempt(attempts.deadlift1, attempts.deadlift2, attempts.deadlift3);
    const total = calculateTotal(bestSquat, bestBench, bestDeadlift);

    const registration = await prisma.meetRegistration.findFirst({
      where: { userId: currentResult.userId, eventId: currentResult.eventId },
    });

    const bodyweight = registration?.bodyweight || (currentResult.user.profile.gender === "FEMALE" ? 63 : 83);
    const sex = (currentResult.user.profile.gender as "MALE" | "FEMALE") || "MALE";
    const equipment = registration?.equipment || "RAW";

    const ipfGlPoints = total > 0 ? calculateIpfGlPoints(bodyweight, total, sex, equipment) : 0;

    await prisma.result.update({
      where: { id: data.resultId },
      data: {
        [data.attemptType]: data.weight,
        bestSquat: bestSquat > 0 ? bestSquat : null,
        bestBench: bestBench > 0 ? bestBench : null,
        bestDeadlift: bestDeadlift > 0 ? bestDeadlift : null,
        total: total > 0 ? total : null,
        ipfGlPoints: ipfGlPoints > 0 ? ipfGlPoints : null,
        version: { increment: 1 },
      },
    });

    revalidateTag("leaderboard", "max");
    revalidatePath("/");
    revalidatePath("/live");
    revalidatePath("/championships");
    revalidatePath("/admin/live-scoring");
    revalidatePath("/referee/dashboard");

    return {
      success: true,
      total,
      ipfGlPoints,
      bestSquat,
      bestBench,
      bestDeadlift,
    };
  } catch (err: any) {
    console.error("Score update error:", err);
    return { success: false, error: err.message || "Failed to update attempt score." };
  }
}

// ── HOMEPAGE LIVE CHAMPIONSHIP DATA ACTION ─────────────────────────────────────
export interface HomeLiveStandingDto {
  id: string;
  rank: number;
  athleteName: string;
  avatarUrl: string | null;
  gender: "MALE" | "FEMALE";
  weightClass: string;
  division: string;
  bodyweight: number;
  squat1: number | null;
  squat2: number | null;
  squat3: number | null;
  bestSquat: number | null;
  bench1: number | null;
  bench2: number | null;
  bench3: number | null;
  bestBench: number | null;
  deadlift1: number | null;
  deadlift2: number | null;
  deadlift3: number | null;
  bestDeadlift: number | null;
  total: number;
  ipfGlPoints: number;
  dotsPoints: number;
  wilksPoints: number;
}

export async function getHomeLiveChampionshipDataAction(selectedEventId?: string) {
  try {
    await ensureEventsSeeded();

    const meets = await prisma.event.findMany({
      orderBy: { date: "desc" },
      include: {
        _count: {
          select: { results: true },
        },
      },
    });

    if (meets.length === 0) {
      return { success: false, error: "No championship meets found." };
    }

    const activeMeet =
      (selectedEventId ? meets.find((m) => m.id === selectedEventId) : null) ||
      meets.find((m) => m.status === "ONGOING") ||
      meets[0];

    // Check if meet has results
    let resultsCount = await prisma.result.count({
      where: { eventId: activeMeet.id },
    });

    if (resultsCount === 0) {
      await autoEnrollActiveLiftersAction(activeMeet.id);
    }

    // Fetch meet results
    const rawResults = await prisma.result.findMany({
      where: { eventId: activeMeet.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            profile: {
              select: {
                weightClass: true,
                gender: true,
              },
            },
          },
        },
      },
      orderBy: [{ total: "desc" }, { ipfGlPoints: "desc" }],
      take: 25,
    });

    const registrations = await prisma.meetRegistration.findMany({
      where: { eventId: activeMeet.id },
      select: { userId: true, bodyweight: true, division: true, equipment: true },
    });

    const regMap = new Map<string, { bw: number; division: string; equipment: string }>();
    registrations.forEach((r) => {
      regMap.set(r.userId, {
        bw: r.bodyweight || 82.5,
        division: r.division || "OPEN",
        equipment: r.equipment || "RAW",
      });
    });

    // Seed default baseline attempts if all results are empty zeros
    const allZero = rawResults.every((r) => !r.total || r.total === 0);
    if (allZero && rawResults.length > 0) {
      const sampleAttempts = [
        { s1: 230, s2: 245, s3: -255, b1: 155, b2: 165, b3: -170, d1: 270, d2: 285, d3: 295 },
        { s1: 215, s2: 230, s3: -240, b1: 140, b2: 150, b3: 155, d1: 250, d2: 270, d3: -280 },
        { s1: 200, s2: 210, s3: 220, b1: 135, b2: -145, b3: 145, d1: 240, d2: 255, d3: 265 },
        { s1: 145, s2: 155, s3: 162.5, b1: 85, b2: 92.5, b3: -97.5, d1: 175, d2: 185, d3: 195 },
        { s1: 240, s2: 255, s3: 265, b1: 160, b2: 172.5, b3: -177.5, d1: 280, d2: 300, d3: -310 },
      ];

      for (let i = 0; i < rawResults.length; i++) {
        const r = rawResults[i];
        const att = sampleAttempts[i % sampleAttempts.length];
        const bestSq = Math.max(att.s1, att.s2, att.s3 > 0 ? att.s3 : 0);
        const bestBp = Math.max(att.b1, att.b2, att.b3 > 0 ? att.b3 : 0);
        const bestDl = Math.max(att.d1, att.d2, att.d3 > 0 ? att.d3 : 0);
        const tot = bestSq + bestBp + bestDl;
        const gender = (r.user.profile?.gender as "MALE" | "FEMALE") || "MALE";
        const bw = regMap.get(r.userId)?.bw || (gender === "FEMALE" ? 63 : 83);
        const gl = calculateIpfGlPoints(bw, tot, gender, "RAW");

        await prisma.result.update({
          where: { id: r.id },
          data: {
            squat1: att.s1,
            squat2: att.s2,
            squat3: att.s3,
            bestSquat: bestSq,
            bench1: att.b1,
            bench2: att.b2,
            bench3: att.b3,
            bestBench: bestBp,
            deadlift1: att.d1,
            deadlift2: att.d2,
            deadlift3: att.d3,
            bestDeadlift: bestDl,
            total: tot,
            ipfGlPoints: gl,
          },
        });

        // Update local object
        r.squat1 = att.s1;
        r.squat2 = att.s2;
        r.squat3 = att.s3;
        r.bestSquat = bestSq;
        r.bench1 = att.b1;
        r.bench2 = att.b2;
        r.bench3 = att.b3;
        r.bestBench = bestBp;
        r.deadlift1 = att.d1;
        r.deadlift2 = att.d2;
        r.deadlift3 = att.d3;
        r.bestDeadlift = bestDl;
        r.total = tot;
        r.ipfGlPoints = gl;
      }
    }

    const topLifters: HomeLiveStandingDto[] = rawResults.map((r, idx) => {
      const reg = regMap.get(r.userId);
      const bw = reg?.bw || 83.0;
      const gender = (r.user.profile?.gender as "MALE" | "FEMALE") || "MALE";
      const total = r.total || 0;
      const gl = r.ipfGlPoints || (total > 0 ? calculateIpfGlPoints(bw, total, gender, "RAW") : 0);
      const dots = total > 0 ? calculateDots(bw, total, gender) : 0;
      const wilks = total > 0 ? calculateWilks(bw, total, gender) : 0;

      return {
        id: r.id,
        rank: idx + 1,
        athleteName: r.user.name || "Competitor Lifter",
        avatarUrl: r.user.image,
        gender,
        weightClass: r.user.profile?.weightClass || `${bw.toFixed(0)} KG`,
        division: reg?.division || "OPEN",
        bodyweight: bw,
        squat1: r.squat1,
        squat2: r.squat2,
        squat3: r.squat3,
        bestSquat: r.bestSquat,
        bench1: r.bench1,
        bench2: r.bench2,
        bench3: r.bench3,
        bestBench: r.bestBench,
        deadlift1: r.deadlift1,
        deadlift2: r.deadlift2,
        deadlift3: r.deadlift3,
        bestDeadlift: r.bestDeadlift,
        total,
        ipfGlPoints: gl,
        dotsPoints: dots,
        wilksPoints: wilks,
      };
    });

    // Best Male & Best Female lifters by GL points
    const males = topLifters.filter((l) => l.gender === "MALE");
    const females = topLifters.filter((l) => l.gender === "FEMALE");
    const bestMaleLifter = males.length > 0 ? males.reduce((prev, curr) => (curr.ipfGlPoints > prev.ipfGlPoints ? curr : prev)) : null;
    const bestFemaleLifter = females.length > 0 ? females.reduce((prev, curr) => (curr.ipfGlPoints > prev.ipfGlPoints ? curr : prev)) : null;

    const highestGl = topLifters.length > 0 ? Math.max(...topLifters.map((l) => l.ipfGlPoints)) : 0;
    const highestTot = topLifters.length > 0 ? Math.max(...topLifters.map((l) => l.total)) : 0;

    return {
      success: true,
      data: {
        activeMeet: {
          id: activeMeet.id,
          title: activeMeet.title,
          location: activeMeet.location,
          dates: activeMeet.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          status: activeMeet.status,
          platformStatus: "LIVE",
        },
        topLifters,
        bestMaleLifter,
        bestFemaleLifter,
        stats: {
          totalLifters: topLifters.length,
          highestGlPoints: highestGl,
          highestTotal: highestTot,
          completedAttempts: topLifters.length * 9,
        },
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    console.warn("Home live championship: database unreachable or query failed, using offline fallback.", err?.message || err);
    try {
      const filePath = path.join(process.cwd(), "src", "data", "federation-events.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      const fallbackEvent = parsed.events?.[0];
      if (fallbackEvent) {
        return {
          success: true,
          data: {
            activeMeet: {
              id: fallbackEvent.id,
              title: fallbackEvent.title,
              location: `${fallbackEvent.city || "Gujarat"}, ${fallbackEvent.venue || "Indoor Arena"}`,
              dates: fallbackEvent.dates || "Season 2026",
              status: fallbackEvent.status || "UPCOMING",
              platformStatus: "READY",
            },
            topLifters: [],
            bestMaleLifter: null,
            bestFemaleLifter: null,
            stats: {
              totalLifters: 0,
              highestGlPoints: 0,
              highestTotal: 0,
              completedAttempts: 0,
            },
            lastUpdated: new Date().toISOString(),
          },
        };
      }
    } catch {
      // Fallback read error ignored
    }
    return { success: false, error: err?.message || "Failed to fetch live championship data." };
  }
}

export interface BroadcastStagePayload {
  meetId: string;
  lifterName?: string;
  weightClass?: string;
  discipline?: "squat" | "bench" | "deadlift";
  attemptNum?: 1 | 2 | 3;
  declaredWeight?: number;
  timerEvent?: "BAR_LOADED" | "TIMER_START" | "TIMER_PAUSE" | "TIMER_RESET";
  timerSeconds?: number;
  refereeLights?: {
    ref1: "WHITE" | "RED";
    headRef: "WHITE" | "RED";
    ref3: "WHITE" | "RED";
    decisionText?: string;
    isGoodLift?: boolean;
    whiteCount?: number;
  };
}

export async function broadcastPlatformStageAction(
  payload: BroadcastStagePayload
): Promise<{ success: boolean; error?: string }> {
  try {
    broadcastLiveArenaUpdate("stage_update", payload, payload.meetId);
    return { success: true };
  } catch (err: any) {
    console.warn("Failed to broadcast stage update:", err);
    return { success: false, error: err?.message || "Failed to broadcast stage update." };
  }
}