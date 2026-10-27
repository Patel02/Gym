import { calculateIpfGl, type Equipment, type Gender } from "@/lib/calculations";

export interface PlateDenomination {
  weight: number;
  colorName: string;
  bgClass: string;
  textClass: string;
  hexColor: string;
  borderClass?: string;
  heightPercent: number; // 0-100%
  widthPx: number;
}

export const IPF_PLATE_DENOMINATIONS: PlateDenomination[] = [
  {
    weight: 25,
    colorName: "Red",
    bgClass: "bg-red-600",
    textClass: "text-white",
    hexColor: "#dc2626",
    heightPercent: 100,
    widthPx: 26,
  },
  {
    weight: 20,
    colorName: "Blue",
    bgClass: "bg-blue-600",
    textClass: "text-white",
    hexColor: "#2563eb",
    heightPercent: 100,
    widthPx: 22,
  },
  {
    weight: 15,
    colorName: "Yellow",
    bgClass: "bg-yellow-400",
    textClass: "text-zinc-950",
    hexColor: "#facc15",
    heightPercent: 88,
    widthPx: 20,
  },
  {
    weight: 10,
    colorName: "Green",
    bgClass: "bg-emerald-600",
    textClass: "text-white",
    hexColor: "#16a34a",
    heightPercent: 76,
    widthPx: 18,
  },
  {
    weight: 5,
    colorName: "White",
    bgClass: "bg-white",
    textClass: "text-zinc-950",
    hexColor: "#ffffff",
    borderClass: "border border-zinc-400",
    heightPercent: 58,
    widthPx: 16,
  },
  {
    weight: 2.5,
    colorName: "Black",
    bgClass: "bg-zinc-800",
    textClass: "text-white",
    hexColor: "#27272a",
    borderClass: "border border-zinc-600",
    heightPercent: 48,
    widthPx: 14,
  },
  {
    weight: 1.25,
    colorName: "Silver",
    bgClass: "bg-zinc-400",
    textClass: "text-zinc-950",
    hexColor: "#a1a1aa",
    borderClass: "border border-zinc-500",
    heightPercent: 40,
    widthPx: 12,
  },
  {
    weight: 0.5,
    colorName: "Gold Micro",
    bgClass: "bg-amber-500",
    textClass: "text-zinc-950",
    hexColor: "#f59e0b",
    heightPercent: 34,
    widthPx: 10,
  },
  {
    weight: 0.25,
    colorName: "Micro",
    bgClass: "bg-zinc-500",
    textClass: "text-white",
    hexColor: "#71717a",
    heightPercent: 28,
    widthPx: 8,
  },
];

export interface LoadedPlateItem {
  plate: PlateDenomination;
  count: number;
}

export interface BarbellLoadResult {
  targetWeight: number;
  actualWeight: number;
  barWeight: number;
  collarWeight: number;
  sideWeight: number;
  platesPerSide: PlateDenomination[];
  plateCountsPerSide: LoadedPlateItem[];
  unloadedWeightRemaining: number;
  isExact: boolean;
}

export type WarmupProtocolType = "standard-5" | "heavy-flight-6" | "fast-4";

export interface WarmupSet {
  setNumber: number;
  percentage: number;
  weight: number;
  reps: number | string;
  notes: string;
  load: BarbellLoadResult;
  estimatedMinutesBeforeOpener: number;
}

export interface AttemptJumpPlan {
  name: "Conservative" | "Balanced" | "Aggressive";
  description: string;
  badgeColor: string;
  attempt1: number;
  attempt2: number;
  attempt3: number;
  attempt2JumpKg: number;
  attempt2JumpPercent: number;
  attempt3JumpKg: number;
  attempt3JumpPercent: number;
}

export function roundToCompetitionWeight(weight: number, step: number = 2.5): number {
  if (weight <= 0) return 0;
  return Math.round(weight / step) * step;
}

/**
 * Calculates the exact plates per side for a given total barbell weight
 */
export function calculateBarbellPlates(
  targetWeight: number,
  barWeight: number = 20,
  collarWeightPerCollar: number = 2.5,
  includeMicroPlates: boolean = false
): BarbellLoadResult {
  const totalCollarsWeight = collarWeightPerCollar * 2;
  const baseWeight = barWeight + totalCollarsWeight;

  if (targetWeight <= barWeight) {
    return {
      targetWeight,
      actualWeight: barWeight,
      barWeight,
      collarWeight: 0,
      sideWeight: 0,
      platesPerSide: [],
      plateCountsPerSide: [],
      unloadedWeightRemaining: Math.max(0, targetWeight - barWeight),
      isExact: targetWeight === barWeight,
    };
  }

  let sideWeightNeeded = Math.max(0, (targetWeight - baseWeight) / 2);
  const allowedDenominations = includeMicroPlates
    ? IPF_PLATE_DENOMINATIONS
    : IPF_PLATE_DENOMINATIONS.filter((p) => p.weight >= 1.25);

  const platesPerSide: PlateDenomination[] = [];
  const plateCountsMap = new Map<number, { plate: PlateDenomination; count: number }>();

  for (const denom of allowedDenominations) {
    while (sideWeightNeeded >= denom.weight - 0.001) {
      platesPerSide.push(denom);
      const existing = plateCountsMap.get(denom.weight);
      if (existing) {
        existing.count += 1;
      } else {
        plateCountsMap.set(denom.weight, { plate: denom, count: 1 });
      }
      sideWeightNeeded -= denom.weight;
    }
  }

  const actualSideWeight = platesPerSide.reduce((acc, p) => acc + p.weight, 0);
  const actualTotalWeight = baseWeight + actualSideWeight * 2;
  const unloadedWeightRemaining = Math.abs(targetWeight - actualTotalWeight);

  return {
    targetWeight,
    actualWeight: Number(actualTotalWeight.toFixed(2)),
    barWeight,
    collarWeight: collarWeightPerCollar,
    sideWeight: Number(actualSideWeight.toFixed(2)),
    platesPerSide,
    plateCountsPerSide: Array.from(plateCountsMap.values()),
    unloadedWeightRemaining: Number(unloadedWeightRemaining.toFixed(2)),
    isExact: unloadedWeightRemaining < 0.01,
  };
}

/**
 * Generates an athlete warm-up ramp leading up to platform opener
 */
export function generateWarmupRamp(
  openerWeight: number,
  protocol: WarmupProtocolType = "standard-5",
  barWeight: number = 20,
  collarWeightPerCollar: number = 2.5
): WarmupSet[] {
  const safeOpener = Math.max(barWeight, openerWeight);

  interface ProtocolStep {
    pct: number;
    reps: number | string;
    notes: string;
    minOut: number;
  }

  let steps: ProtocolStep[] = [];

  switch (protocol) {
    case "fast-4":
      steps = [
        { pct: 0, reps: "8-10", notes: "Bar groove & dynamic movement check", minOut: 20 },
        { pct: 0.5, reps: 4, notes: "Motor pattern recruitment & bar speed", minOut: 15 },
        { pct: 0.72, reps: 2, notes: "Gear check (belt & wraps tight)", minOut: 10 },
        { pct: 0.88, reps: 1, notes: "Near-opener intent & command pause", minOut: 6 },
        { pct: 0.94, reps: 1, notes: "Final backstage single (speed primer)", minOut: 3 },
      ];
      break;

    case "heavy-flight-6":
      steps = [
        { pct: 0, reps: "10", notes: "Empty bar mobility & CNS activation", minOut: 28 },
        { pct: 0.4, reps: 5, notes: "Smooth bar speed & bracing check", minOut: 23 },
        { pct: 0.55, reps: 4, notes: "Controlled eccentric tempo", minOut: 18 },
        { pct: 0.7, reps: 3, notes: "Add competitive belt & sleeves/wraps", minOut: 14 },
        { pct: 0.82, reps: 2, notes: "Sharp commands (Squat/Rack/Press)", minOut: 10 },
        { pct: 0.9, reps: 1, notes: "Heavy single — platform focus", minOut: 6 },
        { pct: 0.95, reps: 1, notes: "Final backstage primer (rest 4-5 min)", minOut: 3 },
      ];
      break;

    case "standard-5":
    default:
      steps = [
        { pct: 0, reps: "8-10", notes: "Empty bar mobility & technique rhythm", minOut: 25 },
        { pct: 0.45, reps: 5, notes: "CNS wake up & bar acceleration", minOut: 20 },
        { pct: 0.62, reps: 3, notes: "Form check & belt placement", minOut: 15 },
        { pct: 0.78, reps: 2, notes: "Competition command compliance", minOut: 10 },
        { pct: 0.88, reps: 1, notes: "Heavy transition single", minOut: 6 },
        { pct: 0.94, reps: 1, notes: "Final backstage warm-up single", minOut: 3 },
      ];
      break;
  }

  return steps.map((s, idx) => {
    let rawWeight = s.pct === 0 ? barWeight : safeOpener * s.pct;
    // Round to nearest 2.5kg
    let calculatedWeight = Math.max(barWeight, roundToCompetitionWeight(rawWeight, 2.5));
    // Ensure intermediate warm-up set does not exceed opener
    if (calculatedWeight >= safeOpener && s.pct < 1) {
      calculatedWeight = Math.max(barWeight, safeOpener - 2.5);
    }

    const load = calculateBarbellPlates(calculatedWeight, barWeight, collarWeightPerCollar);
    const actualPct = s.pct === 0 ? Math.round((barWeight / safeOpener) * 100) : Math.round((calculatedWeight / safeOpener) * 100);

    return {
      setNumber: idx + 1,
      percentage: actualPct,
      weight: calculatedWeight,
      reps: s.reps,
      notes: s.notes,
      load,
      estimatedMinutesBeforeOpener: s.minOut,
    };
  });
}

/**
 * Calculates 3-Attempt Jump Matrix (Conservative, Balanced, Aggressive)
 */
export function calculateAttemptStrategies(
  openerWeight: number,
  bodyweight: number = 83,
  gender: Gender = "MALE",
  equipment: Equipment = "RAW"
): AttemptJumpPlan[] {
  const safeOpener = Math.max(20, openerWeight);

  // Conservative: Opener -> +5% -> +3.5%
  const cons2 = roundToCompetitionWeight(safeOpener * 1.05);
  const cons3 = roundToCompetitionWeight(cons2 * 1.035);

  // Balanced: Opener -> +7.5% -> +4.5%
  const bal2 = roundToCompetitionWeight(safeOpener * 1.075);
  const bal3 = roundToCompetitionWeight(bal2 * 1.045);

  // Aggressive: Opener -> +10% -> +6%
  const agg2 = roundToCompetitionWeight(safeOpener * 1.1);
  const agg3 = roundToCompetitionWeight(agg2 * 1.06);

  const plans: AttemptJumpPlan[] = [
    {
      name: "Conservative",
      description: "9-for-9 Strategy: Total builder, zero risk of missing attempts.",
      badgeColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
      attempt1: safeOpener,
      attempt2: cons2,
      attempt3: cons3,
      attempt2JumpKg: Number((cons2 - safeOpener).toFixed(1)),
      attempt2JumpPercent: Math.round(((cons2 - safeOpener) / safeOpener) * 100),
      attempt3JumpKg: Number((cons3 - cons2).toFixed(1)),
      attempt3JumpPercent: Math.round(((cons3 - cons2) / cons2) * 100),
    },
    {
      name: "Balanced",
      description: "Optimal Competition Curve: Standard national championship jump curve.",
      badgeColor: "border-gym-primary/40 bg-gym-primary/10 text-gym-primary",
      attempt1: safeOpener,
      attempt2: bal2,
      attempt3: bal3,
      attempt2JumpKg: Number((bal2 - safeOpener).toFixed(1)),
      attempt2JumpPercent: Math.round(((bal2 - safeOpener) / safeOpener) * 100),
      attempt3JumpKg: Number((bal3 - bal2).toFixed(1)),
      attempt3JumpPercent: Math.round(((bal3 - bal2) / bal2) * 100),
    },
    {
      name: "Aggressive",
      description: "Medal Hunting / Record Chase: High reward, requires maximum CNS peak.",
      badgeColor: "border-red-500/40 bg-red-500/10 text-red-400",
      attempt1: safeOpener,
      attempt2: agg2,
      attempt3: agg3,
      attempt2JumpKg: Number((agg2 - safeOpener).toFixed(1)),
      attempt2JumpPercent: Math.round(((agg2 - safeOpener) / safeOpener) * 100),
      attempt3JumpKg: Number((agg3 - agg2).toFixed(1)),
      attempt3JumpPercent: Math.round(((agg3 - agg2) / agg2) * 100),
    },
  ];

  return plans;
}
