// Official IPF, DOTS, and Wilks Mathematical Engine

export type Gender = "male" | "female";
export type Equipment = "raw" | "equipped";

export interface StrengthClassification {
  tier: "Elite / National Podium" | "Master / National Qualifier" | "Class 1 / State Champion" | "Class 2 / Regional" | "Class 3 / Club Lifter" | "Novice / Gym Lifter";
  percentile: number; // e.g. 96 meaning top 4%
  badgeColor: string;
  description: string;
}

export interface LiftBalanceAnalysis {
  squatPercent: number;
  benchPercent: number;
  deadliftPercent: number;
  archetype: "Balanced Lifter" | "Deadlift Dominant" | "Squat Specialist" | "Bench Press Specialist";
  coachTip: string;
}

export interface PlateBreakdown {
  targetWeight: number;
  barWeight: number;
  weightPerSide: number;
  plates: { weight: number; countPerSide: number; color: string }[];
  exactMatch: boolean;
}

// ── 1. IPF GL Points Formula (Official Goodlift 2026) ──
export function calculateIpfGlPoints(
  bodyweight: number,
  total: number,
  gender: Gender = "male",
  equipment: Equipment = "raw"
): number {
  if (bodyweight <= 0 || total <= 0) return 0;

  // Goodlift parameter coefficients
  let A = 1199.72839;
  let B = 1025.18162;
  let C = 0.00921;

  if (gender === "male") {
    if (equipment === "raw") {
      A = 1199.72839;
      B = 1025.18162;
      C = 0.00921;
    } else {
      A = 1236.25115;
      B = 1443.43529;
      C = 0.0164;
    }
  } else {
    if (equipment === "raw") {
      A = 610.32796;
      B = 539.02058;
      C = 0.01526;
    } else {
      A = 758.63878;
      B = 749.19828;
      C = 0.0193;
    }
  }

  const denominator = A - B * Math.exp(-C * bodyweight);
  if (denominator <= 0) return 0;

  const points = (100 * total) / denominator;
  return parseFloat(points.toFixed(2));
}

// ── 2. DOTS Formula (Dynamic Objective Team Scoring) ──
export function calculateDots(
  bodyweight: number,
  total: number,
  gender: Gender = "male"
): number {
  if (bodyweight <= 0 || total <= 0) return 0;

  let A: number, B: number, C: number, D: number, E: number;

  if (gender === "male") {
    A = -0.000001093;
    B = 0.0007391293;
    C = -0.1918759221;
    D = 24.0900756;
    E = -307.75076;
  } else {
    A = -0.0000010706;
    B = 0.0005158568;
    C = -0.1126655495;
    D = 13.6175032;
    E = -57.96288;
  }

  const bw = bodyweight;
  const denominator =
    A * Math.pow(bw, 4) +
    B * Math.pow(bw, 3) +
    C * Math.pow(bw, 2) +
    D * bw +
    E;

  if (denominator <= 0) return 0;
  const dots = (total * 500) / denominator;
  return parseFloat(dots.toFixed(2));
}

// ── 3. Wilks Formula (Classic International Standard) ──
export function calculateWilks(
  bodyweight: number,
  total: number,
  gender: Gender = "male"
): number {
  if (bodyweight <= 0 || total <= 0) return 0;

  let a: number, b: number, c: number, d: number, e: number, f: number;

  if (gender === "male") {
    a = -216.0475144;
    b = 16.2606339;
    c = -0.002388645;
    d = -0.00113732;
    e = 7.01863e-6;
    f = -1.291e-8;
  } else {
    a = 594.3174777;
    b = -27.23842536;
    c = 0.82112226;
    d = -0.009307339;
    e = 4.731582e-5;
    f = -9.054e-8;
  }

  const bw = bodyweight;
  const denominator =
    a +
    b * bw +
    c * Math.pow(bw, 2) +
    d * Math.pow(bw, 3) +
    e * Math.pow(bw, 4) +
    f * Math.pow(bw, 5);

  if (denominator <= 0) return 0;
  const wilks = (total * 500) / denominator;
  return parseFloat(wilks.toFixed(2));
}

// ── 4. National Strength Tier & Percentile Classification ──
export function getStrengthClassification(
  glPoints: number,
  gender: Gender = "male"
): StrengthClassification {
  // Male thresholds
  if (gender === "male") {
    if (glPoints >= 95) {
      return {
        tier: "Elite / National Podium",
        percentile: 98,
        badgeColor: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
        description: "Top 2% in India. Competes for Gold at Senior Nationals and qualifies for Asian / World Championships.",
      };
    }
    if (glPoints >= 85) {
      return {
        tier: "Master / National Qualifier",
        percentile: 92,
        badgeColor: "text-purple-400 border-purple-500/40 bg-purple-500/10",
        description: "Top 8% in India. Meets strict National Championship A-standard qualifying totals.",
      };
    }
    if (glPoints >= 74) {
      return {
        tier: "Class 1 / State Champion",
        percentile: 80,
        badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
        description: "Top 20% in India. State level podium contender with high technical proficiency.",
      };
    }
    if (glPoints >= 62) {
      return {
        tier: "Class 2 / Regional",
        percentile: 60,
        badgeColor: "text-blue-400 border-blue-500/40 bg-blue-500/10",
        description: "Top 40% in India. Experienced regional competitor with solid progressive overload.",
      };
    }
    if (glPoints >= 50) {
      return {
        tier: "Class 3 / Club Lifter",
        percentile: 40,
        badgeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
        description: "Above average barbell club lifter. Building platform confidence.",
      };
    }
    return {
      tier: "Novice / Gym Lifter",
      percentile: 20,
      badgeColor: "text-gray-400 border-gray-500/40 bg-gray-500/10",
      description: "Beginning the powerlifting journey. Excellent room for rapid neuromuscular gains.",
    };
  }

  // Female thresholds (GL points scale similarly calibrated)
  if (glPoints >= 90) {
    return {
      tier: "Elite / National Podium",
      percentile: 98,
      badgeColor: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
      description: "Top 2% in India. Senior National Medalist & International contender.",
    };
  }
  if (glPoints >= 80) {
    return {
      tier: "Master / National Qualifier",
      percentile: 90,
      badgeColor: "text-purple-400 border-purple-500/40 bg-purple-500/10",
      description: "Top 10% in India. National championship qualification caliber.",
    };
  }
  if (glPoints >= 70) {
    return {
      tier: "Class 1 / State Champion",
      percentile: 78,
      badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
      description: "Top 22% in India. Dominant state-level competitor.",
    };
  }
  if (glPoints >= 58) {
    return {
      tier: "Class 2 / Regional",
      percentile: 55,
      badgeColor: "text-blue-400 border-blue-500/40 bg-blue-500/10",
      description: "Top 45% in India. Dedicated competitive lifter.",
    };
  }
  if (glPoints >= 45) {
    return {
      tier: "Class 3 / Club Lifter",
      percentile: 35,
      badgeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
      description: "Competent club lifter on regular periodized training.",
    };
  }
  return {
    tier: "Novice / Gym Lifter",
    percentile: 18,
    badgeColor: "text-gray-400 border-gray-500/40 bg-gray-500/10",
    description: "Foundational strength phase. Rapid progress ahead.",
  };
}

// ── 5. Lift Balance Analysis (S:B:D Distribution) ──
export function analyzeLiftBalance(
  squat: number,
  bench: number,
  deadlift: number
): LiftBalanceAnalysis {
  const total = squat + bench + deadlift;
  if (total <= 0) {
    return {
      squatPercent: 0,
      benchPercent: 0,
      deadliftPercent: 0,
      archetype: "Balanced Lifter",
      coachTip: "Enter your Squat, Bench, and Deadlift weights to view balance ratios.",
    };
  }

  const sPct = parseFloat(((squat / total) * 100).toFixed(1));
  const bPct = parseFloat(((bench / total) * 100).toFixed(1));
  const dPct = parseFloat(((deadlift / total) * 100).toFixed(1));

  let archetype: "Balanced Lifter" | "Deadlift Dominant" | "Squat Specialist" | "Bench Press Specialist" = "Balanced Lifter";
  let coachTip = "Your lift distribution closely aligns with the standard Olympic ratio (~36% Squat, ~24% Bench, ~40% Deadlift).";

  if (dPct >= 45) {
    archetype = "Deadlift Dominant";
    coachTip = `Your Deadlift accounts for ${dPct}% of your total. You have exceptional posterior chain leverage. Focusing on quad hypertrophy & pause squats will unlock massive total gains.`;
  } else if (sPct >= 40) {
    archetype = "Squat Specialist";
    coachTip = `Your Squat represents ${sPct}% of your total. Powerful knee extension & trunk bracing. Prioritize upper back volume & grip work to pull your deadlift closer to your squat.`;
  } else if (bPct >= 28) {
    archetype = "Bench Press Specialist";
    coachTip = `Your Bench Press accounts for ${bPct}% of your total. Superior pec & tricep drive. Bring up your lower body squat volume to round out your national ranking.`;
  }

  return {
    squatPercent: sPct,
    benchPercent: bPct,
    deadliftPercent: dPct,
    archetype,
    coachTip,
  };
}

// ── 6. 1RM Peaking Training Matrix & Plate Math ──
export const PEAKING_PERCENTAGES = [
  { percent: 65, label: "65% — Deload / Speed", reps: "5x5 Speed / Dynamic Effort" },
  { percent: 70, label: "70% — Hypertrophy Base", reps: "4x8 Volume Base" },
  { percent: 75, label: "75% — Strength Volume", reps: "5x5 Classic Strength" },
  { percent: 80, label: "80% — Intensification", reps: "4x4 Progressive Overload" },
  { percent: 85, label: "85% — Heavy Triples", reps: "3x3 Pre-Competition Peaking" },
  { percent: 90, label: "90% — Heavy Doubles", reps: "2x2 Platform Simulation" },
  { percent: 95, label: "95% — Platform Opener", reps: "1x1 Competition Attempt 1 Test" },
];

export function calculatePlateLoad(
  targetWeight: number,
  barWeight: number = 20
): PlateBreakdown {
  const roundTarget = Math.round(targetWeight / 2.5) * 2.5;
  const weightToLoad = Math.max(0, roundTarget - barWeight);
  const weightPerSide = weightToLoad / 2;

  const availablePlates = [
    { weight: 25, color: "bg-red-600 text-white border-red-500" },
    { weight: 20, color: "bg-blue-600 text-white border-blue-500" },
    { weight: 15, color: "bg-yellow-500 text-black border-yellow-400" },
    { weight: 10, color: "bg-emerald-600 text-white border-emerald-500" },
    { weight: 5, color: "bg-white text-black border-gray-300" },
    { weight: 2.5, color: "bg-black text-white border-white/40" },
    { weight: 1.25, color: "bg-gray-400 text-black border-gray-300" },
  ];

  let remaining = weightPerSide;
  const plates: { weight: number; countPerSide: number; color: string }[] = [];

  for (const plate of availablePlates) {
    if (remaining >= plate.weight) {
      const count = Math.floor(remaining / plate.weight);
      plates.push({
        weight: plate.weight,
        countPerSide: count,
        color: plate.color,
      });
      remaining = parseFloat((remaining % plate.weight).toFixed(3));
    }
  }

  return {
    targetWeight: roundTarget,
    barWeight,
    weightPerSide,
    plates,
    exactMatch: remaining === 0,
  };
}
