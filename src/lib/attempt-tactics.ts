import { calculateIpfGl, Equipment, Gender } from "@/lib/calculations";
import { calculateDots, calculateWilks } from "@/lib/powerlifting-math";

export type StrategyRoute = "Conservative" | "Balanced" | "Aggressive" | "Custom";

export type LiftDiscipline = "SQUAT" | "BENCH" | "DEADLIFT";

export type AttemptResult = "PENDING" | "GOOD_LIFT" | "NO_LIFT";

export type NoLiftReason = 
  | "DEPTH" 
  | "DOWNWARD_MOTION" 
  | "BUTTOCKS_OFF_PAD" 
  | "FOOT_MOVEMENT" 
  | "HITCHING_RAMPING" 
  | "STRENGTH_STALL" 
  | "COMMAND_VIOLATION";

export interface LiftAttempt {
  attemptNumber: 1 | 2 | 3;
  weightKg: number;
  result: AttemptResult;
  rpe?: number; // 7, 7.5, 8, 8.5, 9, 9.5, 10
  noLiftReason?: NoLiftReason;
  notes?: string;
}

export interface DisciplineStrategy {
  discipline: LiftDiscipline;
  oneRepMax: number;
  attempts: [LiftAttempt, LiftAttempt, LiftAttempt];
  warmupMinutesBeforeOpener: number;
}

export interface RackHeights {
  squatRack: string; // e.g. "14 IN" or "14 OUT"
  benchRack: string; // e.g. "11"
  benchSafety: string; // e.g. "6"
}

export interface MeetTacticsState {
  athleteName: string;
  weightClass: string;
  bodyweight: number;
  gender: Gender;
  equipment: Equipment;
  flight: string; // e.g. "Flight A"
  lotNumber: string;
  strategyRoute: StrategyRoute;
  rackHeights: RackHeights;
  squat: DisciplineStrategy;
  bench: DisciplineStrategy;
  deadlift: DisciplineStrategy;
}

// IPF standard rounding to nearest 2.5 kg
export function roundToIpfIncrement(weight: number): number {
  return Math.max(20, Math.round(weight / 2.5) * 2.5);
}

// Percentage presets for the 3 tactical routes
export const STRATEGY_PERCENTAGES = {
  Conservative: {
    // 9/9 Builder - Build platform momentum and guarantee team/qualifying total
    opener: 0.90, // ~90% 1RM
    attempt2: 0.95, // ~95% 1RM
    attempt3: 0.99, // ~99% 1RM
    desc: "9-for-9 Total Builder: High platform confidence, guarantees baseline total and qualification.",
  },
  Balanced: {
    // Gold Standard - Safe opener, solid builder, calculated PR attempt
    opener: 0.915, // ~91.5% 1RM
    attempt2: 0.97, // ~97% 1RM
    attempt3: 1.02, // ~102% 1RM (Targeted PR)
    desc: "Championship Balance: Safe opener, solid 2nd builder, and calculated 3rd attempt PR.",
  },
  Aggressive: {
    // Podium / National Record Chaser
    opener: 0.93, // ~93% 1RM
    attempt2: 0.985, // ~98.5% 1RM
    attempt3: 1.05, // ~105% 1RM (Gold medal / Record push)
    desc: "Podium Chaser: Aggressive tactical jumps designed to chase medals or national records.",
  },
};

export function generateDisciplineAttempts(
  discipline: LiftDiscipline,
  oneRepMax: number,
  route: StrategyRoute = "Balanced"
): [LiftAttempt, LiftAttempt, LiftAttempt] {
  if (route === "Custom") {
    // Default balanced values for custom baseline
    const att1 = roundToIpfIncrement(oneRepMax * 0.915);
    const att2 = roundToIpfIncrement(oneRepMax * 0.97);
    const att3 = roundToIpfIncrement(oneRepMax * 1.02);
    return [
      { attemptNumber: 1, weightKg: att1, result: "PENDING" },
      { attemptNumber: 2, weightKg: att2, result: "PENDING" },
      { attemptNumber: 3, weightKg: att3, result: "PENDING" },
    ];
  }

  const p = STRATEGY_PERCENTAGES[route];
  const att1 = roundToIpfIncrement(oneRepMax * p.opener);
  const att2 = roundToIpfIncrement(oneRepMax * p.attempt2);
  const att3 = roundToIpfIncrement(oneRepMax * p.attempt3);

  return [
    { attemptNumber: 1, weightKg: att1, result: "PENDING" },
    { attemptNumber: 2, weightKg: Math.max(att1 + 2.5, att2), result: "PENDING" },
    { attemptNumber: 3, weightKg: Math.max(att2 + 2.5, att3), result: "PENDING" },
  ];
}

// Calculate Best Successful Lift for a discipline
export function getBestSuccessfulLift(attempts: [LiftAttempt, LiftAttempt, LiftAttempt]): number {
  let best = 0;
  for (const att of attempts) {
    if (att.result === "GOOD_LIFT" && att.weightKg > best) {
      best = att.weightKg;
    }
  }
  return best;
}

// Calculate Projected Best Lift (if pending, assumes planned weight will be made)
export function getProjectedBestLift(attempts: [LiftAttempt, LiftAttempt, LiftAttempt]): number {
  // If attempt 3 is good, it's attempt 3
  if (attempts[2].result === "GOOD_LIFT") return attempts[2].weightKg;
  if (attempts[1].result === "GOOD_LIFT" && attempts[2].result === "NO_LIFT") return attempts[1].weightKg;
  if (attempts[0].result === "GOOD_LIFT" && attempts[1].result === "NO_LIFT" && attempts[2].result === "NO_LIFT") return attempts[0].weightKg;
  if (attempts[0].result === "NO_LIFT" && attempts[1].result === "NO_LIFT" && attempts[2].result === "NO_LIFT") return 0;

  // Otherwise, return maximum planned weight among non-failed attempts
  let highestPossible = 0;
  for (const att of attempts) {
    if (att.result !== "NO_LIFT" && att.weightKg > highestPossible) {
      highestPossible = att.weightKg;
    }
  }
  return highestPossible || attempts[0].weightKg;
}

// Full Meet Diagnostics Summary
export interface MeetDiagnostics {
  bestSquat: number;
  bestBench: number;
  bestDeadlift: number;
  currentTotal: number;
  projectedTotal: number;
  ipfGlPoints: number;
  dotsPoints: number;
  wilksPoints: number;
  goodLiftsCount: number;
  completedAttemptsCount: number;
  successRate: number;
  isBombOut: boolean;
}

export function calculateMeetDiagnostics(state: MeetTacticsState): MeetDiagnostics {
  const squatSuccess = getBestSuccessfulLift(state.squat.attempts);
  const benchSuccess = getBestSuccessfulLift(state.bench.attempts);
  const deadliftSuccess = getBestSuccessfulLift(state.deadlift.attempts);

  const squatProjected = getProjectedBestLift(state.squat.attempts);
  const benchProjected = getProjectedBestLift(state.bench.attempts);
  const deadliftProjected = getProjectedBestLift(state.deadlift.attempts);

  const allAttempts = [
    ...state.squat.attempts,
    ...state.bench.attempts,
    ...state.deadlift.attempts,
  ];

  let goodCount = 0;
  let completedCount = 0;

  for (const att of allAttempts) {
    if (att.result !== "PENDING") {
      completedCount++;
      if (att.result === "GOOD_LIFT") goodCount++;
    }
  }

  const currentTotal = squatSuccess + benchSuccess + deadliftSuccess;
  const projectedTotal = squatProjected + benchProjected + deadliftProjected;

  const activeTotalForPoints = completedCount === 9 ? currentTotal : projectedTotal;
  const ipfGlPoints = calculateIpfGl(state.bodyweight, activeTotalForPoints, state.gender, state.equipment);
  const mathGender = state.gender.toLowerCase() as "male" | "female";
  const dotsPoints = calculateDots(state.bodyweight, activeTotalForPoints, mathGender);
  const wilksPoints = calculateWilks(state.bodyweight, activeTotalForPoints, mathGender);

  // Check bomb out (3 misses in any discipline)
  const isBombOut = 
    (state.squat.attempts.every(a => a.result === "NO_LIFT")) ||
    (state.bench.attempts.every(a => a.result === "NO_LIFT")) ||
    (state.deadlift.attempts.every(a => a.result === "NO_LIFT"));

  return {
    bestSquat: squatSuccess,
    bestBench: benchSuccess,
    bestDeadlift: deadliftSuccess,
    currentTotal,
    projectedTotal,
    ipfGlPoints,
    dotsPoints,
    wilksPoints,
    goodLiftsCount: goodCount,
    completedAttemptsCount: completedCount,
    successRate: completedCount > 0 ? Math.round((goodCount / completedCount) * 100) : 100,
    isBombOut,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Contingency Guidance Engine ("What-If" Live Platform Handler)
// ─────────────────────────────────────────────────────────────────────────────

export interface ContingencyAdvice {
  verdict: "INCREASE_BOLD" | "INCREASE_STANDARD" | "REPEAT_WEIGHT" | "CONSERVATIVE_BUMP" | "PROTECT_TOTAL";
  recommendedWeightKg: number;
  alternativeWeightKg?: number;
  headline: string;
  rationale: string;
  coachNote: string;
}

export function evaluateContingency(
  discipline: LiftDiscipline,
  attemptNumber: 1 | 2,
  currentWeight: number,
  result: AttemptResult,
  rpe?: number,
  noLiftReason?: NoLiftReason,
  plannedNextWeight?: number
): ContingencyAdvice {
  const defaultNext = plannedNextWeight || currentWeight + 5;

  if (result === "GOOD_LIFT") {
    const liftRpe = rpe || 8.0;

    if (liftRpe <= 7.5) {
      const boldJump = roundToIpfIncrement(currentWeight + (discipline === "BENCH" ? 5 : 10));
      return {
        verdict: "INCREASE_BOLD",
        recommendedWeightKg: boldJump,
        alternativeWeightKg: defaultNext,
        headline: "Bar Speed Was Fast! Exploit High Momentum",
        rationale: `Lift was executed with RPE ${liftRpe} (2+ reps in reserve). You have significant surplus strength today.`,
        coachNote: `Take a confident jump to ${boldJump} KG to maximize podium points without risking form breakdown.`,
      };
    } else if (liftRpe >= 9.5) {
      const conservativeBump = roundToIpfIncrement(currentWeight + 2.5);
      return {
        verdict: "CONSERVATIVE_BUMP",
        recommendedWeightKg: conservativeBump,
        headline: "Maximum Effort Detected (RPE 9.5+). Protect Total",
        rationale: `The lift was passed cleanly, but near maximum neurological threshold. Large jumps run high risk of red lights.`,
        coachNote: `Take the mandatory minimum IPF bump (+2.5 kg to ${conservativeBump} KG). Every made lift adds guaranteed kilograms to your final total.`,
      };
    } else {
      return {
        verdict: "INCREASE_STANDARD",
        recommendedWeightKg: defaultNext,
        headline: "On Schedule! Execute Planned Attempt Jump",
        rationale: `Execution speed matched competition projections (RPE ${liftRpe}). Stay disciplined to the tactical gameplan.`,
        coachNote: `Submit ${defaultNext} KG directly to the scoring table. Keep warm-up arousal steady.`,
      };
    }
  }

  // Handle NO_LIFT contingencies
  if (result === "NO_LIFT") {
    switch (noLiftReason) {
      case "DEPTH":
        return {
          verdict: "REPEAT_WEIGHT",
          recommendedWeightKg: currentWeight,
          alternativeWeightKg: roundToIpfIncrement(currentWeight + 2.5),
          headline: "Red Lights on Depth Only (Strength is Sufficient)",
          rationale: "Bar speed and ascent power were fully adequate. Infraction was purely technical depth criteria at hip crease.",
          coachNote: `Repeat ${currentWeight} KG. Cue your athlete to sink the hips 2 cm deeper into the hole with assertive knee flare. Do NOT panic.`,
        };

      case "COMMAND_VIOLATION":
      case "FOOT_MOVEMENT":
      case "BUTTOCKS_OFF_PAD":
        return {
          verdict: "REPEAT_WEIGHT",
          recommendedWeightKg: currentWeight,
          headline: "Technical Slip / Command Violation. Re-Engage Discipline",
          rationale: "Physical capacity to complete this weight is 100% verified. A procedural error caused the red lights.",
          coachNote: `Stay at ${currentWeight} KG. Remind athlete to wait for the referee's visual and verbal commands (Rack / Down).`,
        };

      case "STRENGTH_STALL":
      case "DOWNWARD_MOTION":
      case "HITCHING_RAMPING":
      default:
        if (attemptNumber === 1) {
          return {
            verdict: "REPEAT_WEIGHT",
            recommendedWeightKg: currentWeight,
            headline: "Opener Failed on Strength / Sticking Point. Mandatory Repeat",
            rationale: "In powerlifting rules, you cannot lower attempt weight. You must register at least one good lift to stay in the meet.",
            coachNote: `Repeat ${currentWeight} KG. Rest 8-10 minutes, adjust stance/grip, and use mental aggression. Bombing out must be avoided!`,
          };
        } else {
          return {
            verdict: "PROTECT_TOTAL",
            recommendedWeightKg: currentWeight,
            headline: "2nd Attempt Missed. Secure Baseline on 3rd",
            rationale: "Attempt 2 failed at mid-range sticking point. Increasing weight further would jeopardize the platform total.",
            coachNote: `Repeat ${currentWeight} KG for Attempt 3 or make a microscopic technical tweak. Fight for three white lights.`,
          };
        }
    }
  }

  return {
    verdict: "INCREASE_STANDARD",
    recommendedWeightKg: defaultNext,
    headline: "Attempt Pending Platform Call",
    rationale: "Awaiting platform outcome.",
    coachNote: "Ensure lifter stays relaxed and hydrated backstage.",
  };
}
