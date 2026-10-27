"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateIpfGl } from "@/lib/calculations";

export interface MissedAttemptDiagnostic {
  discipline: "Squat" | "Bench Press" | "Deadlift";
  attemptNumber: 1 | 2 | 3;
  weight: number;
  technicalFlawEn: string;
  technicalFlawHi: string;
  biomechanicalCause: string;
  coachRemedyEn: string;
  coachRemedyHi: string;
  recommendedDrills: string[];
}

export interface CompetitionHistoryItem {
  id: string; // resultId
  eventId: string;
  eventTitle: string;
  eventLocation: string;
  eventDate: string;
  eventStatus: string;
  division: string;
  equipment: string;
  bodyweight: number;
  weightClass: string;
  gender: string;

  // Attempts
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
  rank: number;
  totalCompetitorsInMeet: number;

  // Coach & Athlete Analytics
  attemptsCount: number;
  successfulCount: number;
  failedCount: number;
  successRate: number; // percentage (e.g. 77.8)

  missedDiagnostics: MissedAttemptDiagnostic[];
  coachSummaryNotes: {
    primaryFocus: string;
    strengthBalance: string;
    nextMeetTargetKg: number;
  };
}

export interface AthleteCompetitionSummary {
  totalMeetsPlayed: number;
  bestOverallRank: number | null;
  highestTotalKg: number;
  highestIpfGl: number;
  overallSuccessRate: number;
  competitions: CompetitionHistoryItem[];
}

function generateMissedAttemptDiagnostic(
  discipline: "Squat" | "Bench Press" | "Deadlift",
  attemptNumber: 1 | 2 | 3,
  weight: number
): MissedAttemptDiagnostic {
  const absWeight = Math.abs(weight);

  if (discipline === "Squat") {
    if (attemptNumber === 1) {
      return {
        discipline,
        attemptNumber,
        weight: absWeight,
        technicalFlawEn: "Depth Validation or Start Command Error",
        technicalFlawHi: "Depth (Parallel) ya Start Command ki jaldbazi",
        biomechanicalCause:
          "The crease of the hip did not visibly descend below the top surface of the knee cap, or descent started before the head referee's start command.",
        coachRemedyEn:
          "Open your stance slightly, focus on outward knee tracking (external rotation), and sink the hips 1 inch deeper before reversing.",
        coachRemedyHi:
          "Stance thoda chauda karein, ghutne bahar ki taraf rakhein aur reverse karne se pehle hips ko 1 inch aur depth me le jayein.",
        recommendedDrills: [
          "2-Second Paused Squats at Parallel (3x3 @ 75%)",
          "Pin Squats in the bottom hole (4x2)",
          "Ankle & Hip Mobility Drills (Daily)",
        ],
      };
    } else if (attemptNumber === 2) {
      return {
        discipline,
        attemptNumber,
        weight: absWeight,
        technicalFlawEn: "Sticking Point Out of the Hole (Midway Ascent)",
        technicalFlawHi: "Hole se nikalte waqt midway sticking point par phasna",
        biomechanicalCause:
          "Loss of chest angle and forward torso collapse when passing through 90-degree knee flexion, causing bar path to drift forward over toes.",
        coachRemedyEn:
          "Drive the traps aggressively back into the bar during ascent to keep the chest proud and maintain spinal rigidity.",
        coachRemedyHi:
          "Ascent ke time bar ko traps par peechhe ki taraf dabayein taaki chest up rahe aur bar aage na gire.",
        recommendedDrills: [
          "Tempo 3-1-0 Squats (Slow eccentric control)",
          "Belt Squats / High Bar Quad Overload (3x8)",
          "Heavy Ab Wheel / McGill Big-3 for core rigidity",
        ],
      };
    } else {
      return {
        discipline,
        attemptNumber,
        weight: absWeight,
        technicalFlawEn: "Maximal Core Bracing & Posterior Chain Limit",
        technicalFlawHi: "Heavy load par core bracing loose hona ya spinal flexion",
        biomechanicalCause:
          "Intra-abdominal pressure gave out under near-1RM bar load, leading to lumbar flexion and failure to push the floor away.",
        coachRemedyEn:
          "Practice 360-degree diaphragm expansion into the belt. Ensure your second attempt set up a realistic +5kg to +7.5kg jump rather than overreaching.",
        coachRemedyHi:
          "Belt ke andar 360-degree saans bhar ke brace karein. Next competition me jumps ko +5kg se +7.5kg ke realistic gap me plan karein.",
        recommendedDrills: [
          "Heavy Walkouts & Over-load Holds (105% 1RM for 10s)",
          "Safety Squat Bar (SSB) Good Mornings",
          "Paused Box Squats without rocking",
        ],
      };
    }
  }

  if (discipline === "Bench Press") {
    if (attemptNumber === 1) {
      return {
        discipline,
        attemptNumber,
        weight: absWeight,
        technicalFlawEn: "Chest Pause Instability or Buttock Elevation",
        technicalFlawHi: "Chest par bar hilna ya bench se hips uthana",
        biomechanicalCause:
          "Bar was moving or sinking into the sternum during the pause, or aggressive leg drive lifted the glutes off the bench pad.",
        coachRemedyEn:
          "Tuck shoulder blades fully into your back pockets, pull the bar down with the lats, and drive backward through the floor with feet flat.",
        coachRemedyHi:
          "Shoulder blades ko tight peeche lock karein, lats se bar ko stable pakdein aur pairo se peeche floor ko push karein bina hips uthaye.",
        recommendedDrills: [
          "Long 3-Second Competition Paused Bench (4x3 @ 75%)",
          "Larsen Press (Legless bench for upper back stability)",
          "Face Pulls & Band Pull-Aparts for scapular control",
        ],
      };
    } else if (attemptNumber === 2) {
      return {
        discipline,
        attemptNumber,
        weight: absWeight,
        technicalFlawEn: "Mid-Range Stalling (Pec to Triceps Transition)",
        technicalFlawHi: "Chest se 3-4 inch upar aakar bar ruk jana",
        biomechanicalCause:
          "Elbows flared outward prematurely, shifting maximal torque onto anterior deltoids and losing triceps mechanical advantage.",
        coachRemedyEn:
          "Keep elbows tucked at 45-degrees until passing through the sticking point, then flare and punch through to lockout.",
        coachRemedyHi:
          "Elbows ko 45-degree angle par andar rakhein jab tak sticking point cross na ho, fir lockout ke liye punch karein.",
        recommendedDrills: [
          "Spoto Press (Hold 1-inch off chest for 1s pause)",
          "Close-Grip Incline Bench Press (3x6)",
          "Heavy Dumbbell Floor Press for triceps power",
        ],
      };
    } else {
      return {
        discipline,
        attemptNumber,
        weight: absWeight,
        technicalFlawEn: "Terminal Elbow Lockout & Asymmetric Extension",
        technicalFlawHi: "Final lockout me hath poora seedha na hona ya uneven lockout",
        biomechanicalCause:
          "Triceps fatigue caused one arm to lock out before the other, violating IPF downward motion and uneven lockout rules.",
        coachRemedyEn:
          "Build heavy lockout tolerance. Focus on squeezing triceps at the very top of each warm-up and accessory rep.",
        coachRemedyHi:
          "Triceps ki heavy lockout strength badhayein. Har warm-up rep ke top par dono arms ko barabar lock karne ki aadat dalein.",
        recommendedDrills: [
          "Board Press / Pin Press at high lockout position",
          "JM Press (Heavy triceps compound)",
          "Heavy Dips with chains or dip belt",
        ],
      };
    }
  }

  // Deadlift
  if (attemptNumber === 1) {
    return {
      discipline,
      attemptNumber,
      weight: absWeight,
      technicalFlawEn: "Grip Slip / Premature Bar Release",
      technicalFlawHi: "Grip khul jana ya referee signal se pehle bar chhod dena",
      biomechanicalCause:
        "Fingers unwrapped under friction or the athlete dropped the bar before the referee's downward signal.",
      coachRemedyEn:
        "Deepen your hook grip tape technique or squeeze the knurling 100% until the bar settles fully on the platform.",
      coachRemedyHi:
        "Hook grip ya mix grip ko gehra pakdein aur referee ke 'Down' kehne ke baad hi bar ko zameen tak le kar jayein.",
      recommendedDrills: [
        "Timed Barbell Holds at Lockout (3x15s with competition weight)",
        "Axle Bar Holds & Pinch Grip Work",
        "Chalk application and thumb taping drills",
      ],
    };
  } else if (attemptNumber === 2) {
    return {
      discipline,
      attemptNumber,
      weight: absWeight,
      technicalFlawEn: "Bar Drifting Forward Away from Shins",
      technicalFlawHi: "Bar ka shins se door aage ki taraf nikal jana",
      biomechanicalCause:
        "Lats failed to engage, allowing the barbell to swing away from the center of mass, vastly multiplying spinal lever load.",
      coachRemedyEn:
        "Think 'bend the bar around your shins' before pulling to activate the latissimus dorsi and keep the bar glued to your body.",
      coachRemedyHi:
        "Bar ko pull karne se pehle lats ko tight karein taaki bar shins aur thighs se chipki hui upar aaye.",
      recommendedDrills: [
        "Deficit Deadlifts from 1.5-inch plate (Speed off floor)",
        "Straight-Arm Lat Pulldowns with resistance bands",
        "Barbell Romanian Deadlifts (RDLs) maintaining shin contact",
      ],
    };
  } else {
    return {
      discipline,
      attemptNumber,
      weight: absWeight,
      technicalFlawEn: "Lockout Hitching / Knee Re-Bending",
      technicalFlawHi: "Lockout par thighs par bar ko sahara dena (Hitching)",
      biomechanicalCause:
        "Glutes failed to push hips forward through the bar, causing the knees to re-bend to support the bar load (illegal under IPF rules).",
      coachRemedyEn:
        "Drive the hips aggressively through the bar as soon as the bar passes the knees. Squeeze glutes and extend tall, not leaning back.",
      coachRemedyHi:
        "Bar jaise hi ghutno se upar aaye, hips ko zor se aage dhakelein aur glutes ko squeeze karein bina peechhe jhooke.",
      recommendedDrills: [
        "Block / Rack Pulls from just below the knee (3x3 heavy)",
        "Barbell Hip Thrusts for terminal glute strength",
        "Banded Deadlifts for explosive lockout velocity",
      ],
    };
  }
}

export async function getUserCompetitionHistoryAction(
  targetUserId?: string
): Promise<{
  success: boolean;
  summary?: AthleteCompetitionSummary;
  error?: string;
}> {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;
    const currentUserRole = session?.user?.role;

    const resolvedUserId = targetUserId && currentUserRole === "ADMIN" ? targetUserId : currentUserId;

    if (!resolvedUserId) {
      return { success: false, error: "Authentication required." };
    }

    const user = await prisma.user.findUnique({
      where: { id: resolvedUserId },
      include: { profile: true },
    });

    if (!user) {
      return { success: false, error: "Athlete record not found." };
    }

    // Fetch all results for this user
    const results = await prisma.result.findMany({
      where: { userId: resolvedUserId },
      include: {
        event: true,
      },
      orderBy: { event: { date: "desc" } },
    });

    if (results.length === 0) {
      return {
        success: true,
        summary: {
          totalMeetsPlayed: 0,
          bestOverallRank: null,
          highestTotalKg: 0,
          highestIpfGl: 0,
          overallSuccessRate: 0,
          competitions: [],
        },
      };
    }

    // Process each competition result
    const competitions: CompetitionHistoryItem[] = [];
    let bestRank: number | null = null;
    let maxTotal = 0;
    let maxGl = 0;
    let totalAttemptsAll = 0;
    let successfulAttemptsAll = 0;

    // Batch fetch registrations and all competitors across the events in parallel (eliminates N+1 loop)
    const eventIds = results.map((r) => r.eventId);
    const [registrations, allEventsResults] = await Promise.all([
      prisma.meetRegistration.findMany({
        where: {
          userId: resolvedUserId,
          eventId: { in: eventIds },
        },
      }),
      prisma.result.findMany({
        where: { eventId: { in: eventIds } },
        select: { id: true, eventId: true, total: true, ipfGlPoints: true },
        orderBy: [{ total: "desc" }, { ipfGlPoints: "desc" }],
      }),
    ]);

    const regMap = new Map(registrations.map((reg) => [reg.eventId, reg]));
    const meetResultsByEvent = new Map<string, typeof allEventsResults>();
    for (const r of allEventsResults) {
      const list = meetResultsByEvent.get(r.eventId) ?? [];
      list.push(r);
      meetResultsByEvent.set(r.eventId, list);
    }

    for (const res of results) {
      const registration = regMap.get(res.eventId) || null;
      const allMeetResults = meetResultsByEvent.get(res.eventId) || [];

      const totalCompetitors = allMeetResults.length;
      const rankIndex = allMeetResults.findIndex((r) => r.id === res.id);
      const computedRank = rankIndex !== -1 ? rankIndex + 1 : res.rank || 1;

      if (bestRank === null || computedRank < bestRank) {
        bestRank = computedRank;
      }

      if ((res.total ?? 0) > maxTotal) {
        maxTotal = res.total ?? 0;
      }

      if ((res.ipfGlPoints ?? 0) > maxGl) {
        maxGl = res.ipfGlPoints ?? 0;
      }

      // Compute attempt conversions
      const attemptsList = [
        { d: "Squat" as const, num: 1 as const, val: res.squat1 },
        { d: "Squat" as const, num: 2 as const, val: res.squat2 },
        { d: "Squat" as const, num: 3 as const, val: res.squat3 },
        { d: "Bench Press" as const, num: 1 as const, val: res.bench1 },
        { d: "Bench Press" as const, num: 2 as const, val: res.bench2 },
        { d: "Bench Press" as const, num: 3 as const, val: res.bench3 },
        { d: "Deadlift" as const, num: 1 as const, val: res.deadlift1 },
        { d: "Deadlift" as const, num: 2 as const, val: res.deadlift2 },
        { d: "Deadlift" as const, num: 3 as const, val: res.deadlift3 },
      ];

      let attemptsCount = 0;
      let successfulCount = 0;
      let failedCount = 0;
      const missedDiagnostics: MissedAttemptDiagnostic[] = [];

      for (const att of attemptsList) {
        if (att.val !== null && att.val !== undefined && att.val !== 0) {
          attemptsCount++;
          if (att.val > 0) {
            successfulCount++;
          } else {
            failedCount++;
            missedDiagnostics.push(
              generateMissedAttemptDiagnostic(att.d, att.num, att.val)
            );
          }
        }
      }

      totalAttemptsAll += attemptsCount;
      successfulAttemptsAll += successfulCount;

      const successRate =
        attemptsCount > 0 ? parseFloat(((successfulCount / attemptsCount) * 100).toFixed(1)) : 100;

      // Coach Summary Notes
      const primaryFocus =
        missedDiagnostics.length === 0
          ? "Maintain high technical consistency and plan +7.5 KG progression on openers."
          : `Address ${missedDiagnostics[0].discipline} Attempt #${missedDiagnostics[0].attemptNumber} mechanical error (${missedDiagnostics[0].technicalFlawEn}).`;

      const bSquat = res.bestSquat || 0;
      const bBench = res.bestBench || 0;
      const bDead = res.bestDeadlift || 0;
      const currentTotal = res.total && res.total > 0 ? res.total : (bSquat + bBench + bDead);

      const bw = registration?.bodyweight || 82.5;
      const computedGl =
        res.ipfGlPoints && res.ipfGlPoints > 0
          ? res.ipfGlPoints
          : calculateIpfGl(bw, currentTotal, user.profile?.gender || "MALE");

      if (currentTotal > maxTotal) {
        maxTotal = currentTotal;
      }
      if (computedGl > maxGl) {
        maxGl = computedGl;
      }

      const strengthBalance =
        currentTotal > 0
          ? `Squat: ${((bSquat / currentTotal) * 100).toFixed(0)}% | Bench: ${((bBench / currentTotal) * 100).toFixed(0)}% | Deadlift: ${((bDead / currentTotal) * 100).toFixed(0)}%`
          : "Standard Powerlifting Ratio (35% SQ / 25% BP / 40% DL)";

      competitions.push({
        id: res.id,
        eventId: res.eventId,
        eventTitle: res.event.title,
        eventLocation: res.event.location,
        eventDate: res.event.date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        eventStatus: res.event.status,
        division: registration?.division || "OPEN",
        equipment: registration?.equipment || "RAW",
        bodyweight: bw,
        weightClass: user.profile?.weightClass || "83 KG",
        gender: user.profile?.gender || "MALE",

        squat1: res.squat1,
        squat2: res.squat2,
        squat3: res.squat3,
        bestSquat: res.bestSquat,

        bench1: res.bench1,
        bench2: res.bench2,
        bench3: res.bench3,
        bestBench: res.bestBench,

        deadlift1: res.deadlift1,
        deadlift2: res.deadlift2,
        deadlift3: res.deadlift3,
        bestDeadlift: res.bestDeadlift,

        total: currentTotal,
        ipfGlPoints: computedGl,
        rank: computedRank,
        totalCompetitorsInMeet: totalCompetitors,

        attemptsCount,
        successfulCount,
        failedCount,
        successRate,
        missedDiagnostics,
        coachSummaryNotes: {
          primaryFocus,
          strengthBalance,
          nextMeetTargetKg: Math.round(currentTotal * 1.05),
        },
      });
    }

    const overallSuccessRate =
      totalAttemptsAll > 0
        ? parseFloat(((successfulAttemptsAll / totalAttemptsAll) * 100).toFixed(1))
        : 100;

    return {
      success: true,
      summary: {
        totalMeetsPlayed: competitions.length,
        bestOverallRank: bestRank,
        highestTotalKg: maxTotal,
        highestIpfGl: maxGl,
        overallSuccessRate,
        competitions,
      },
    };
  } catch (err: any) {
    console.error("Failed to load user competition history:", err);
    return { success: false, error: err.message || "Failed to load competition history." };
  }
}
