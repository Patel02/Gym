// Official IPF, DOTS, and Wilks Mathematical Engine (OpenLifter Compatible)

export type Gender = "MALE" | "FEMALE" | "male" | "female";
export type Equipment = "RAW" | "EQUIPPED" | "CLASSIC_RAW" | "raw" | "equipped";

/**
 * Official IPF Goodlift (GL) Formula Coefficients (3-Lift Powerlifting)
 * Parameters ratified by the International Powerlifting Federation
 */
const IPF_GL_COEFFICIENTS = {
  MALE: {
    RAW: { A: 1199.72839, B: 1025.18162, C: 0.00921 },
    EQUIPPED: { A: 1236.25115, B: 1443.43529, C: 0.0164 },
  },
  FEMALE: {
    RAW: { A: 610.32796, B: 539.02058, C: 0.01526 },
    EQUIPPED: { A: 758.63878, B: 749.19828, C: 0.0193 },
  },
} as const;

function isPositiveFinite(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value) && value > 0;
}

/**
 * Calculate 3-Lift Total from best valid attempts
 * Positive values denote passed lifts, negative/0 denote failed attempts.
 */
export function calculateTotal(
  bestSquat: number | null | undefined,
  bestBench: number | null | undefined,
  bestDeadlift: number | null | undefined,
): number {
  const sq = isPositiveFinite(bestSquat) ? bestSquat : 0;
  const bp = isPositiveFinite(bestBench) ? bestBench : 0;
  const dl = isPositiveFinite(bestDeadlift) ? bestDeadlift : 0;

  return Math.round((sq + bp + dl) * 100) / 100;
}

/**
 * Determine best valid attempt among three attempts
 * In IPF rulebook, failed attempts are stored as negative numbers (e.g. -220).
 * Only positive attempts qualify as valid lifts.
 */
export function getBestAttempt(
  attemptOne: number | null | undefined,
  attemptTwo: number | null | undefined,
  attemptThree: number | null | undefined,
): number {
  const validAttempts = [attemptOne, attemptTwo, attemptThree].filter(
    (w): w is number => w !== null && w !== undefined && Number.isFinite(w) && w > 0
  );

  return validAttempts.length > 0 ? Math.max(...validAttempts) : 0;
}

/**
 * Calculate Official IPF GL (Goodlift) Points
 * Formula: Points = (100 * Total) / (A - B * e^(-C * Bodyweight))
 */
export function calculateIpfGlPoints(
  bodyweight: number,
  total: number,
  sex: Gender = "MALE",
  equipment: Equipment = "RAW",
): number {
  if (!Number.isFinite(bodyweight) || !Number.isFinite(total) || bodyweight <= 0 || total <= 0) {
    return 0;
  }

  const normalizedSex: "MALE" | "FEMALE" =
    sex.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE";
  const normalizedEq: "RAW" | "EQUIPPED" =
    equipment.toUpperCase() === "EQUIPPED" ? "EQUIPPED" : "RAW";

  const { A, B, C } = IPF_GL_COEFFICIENTS[normalizedSex][normalizedEq];
  const denominator = A - B * Math.exp(-C * bodyweight);

  if (denominator <= 0) {
    return 0;
  }

  const points = (100 * total) / denominator;
  return Math.round(points * 100) / 100; // 2 decimal places
}

// Alias for backward compatibility
export const calculateIpfGl = calculateIpfGlPoints;

/**
 * Calculate DOTS (Dynamic Objective Team Scoring) Points
 * 4th degree polynomial formula
 */
export function calculateDots(
  bodyweight: number,
  total: number,
  sex: Gender = "MALE",
): number {
  if (!Number.isFinite(bodyweight) || !Number.isFinite(total) || bodyweight <= 0 || total <= 0) {
    return 0;
  }

  const isMale = sex.toUpperCase() === "MALE";
  let A: number, B: number, C: number, D: number, E: number;

  if (isMale) {
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
  return Math.round(dots * 100) / 100;
}

/**
 * Calculate Wilks Points (Classic International Standard)
 * 5th degree polynomial formula
 */
export function calculateWilks(
  bodyweight: number,
  total: number,
  sex: Gender = "MALE",
): number {
  if (!Number.isFinite(bodyweight) || !Number.isFinite(total) || bodyweight <= 0 || total <= 0) {
    return 0;
  }

  const isMale = sex.toUpperCase() === "MALE";
  let a: number, b: number, c: number, d: number, e: number, f: number;

  if (isMale) {
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
  return Math.round(wilks * 100) / 100;
}

/**
 * OpenLifter-Compatible Calibrated Plate Loading Algorithm
 * Standard Olympic bar: 20kg, Collars: 2.5kg each (5kg total)
 * Calibrated IPF Plates: 25 (Red), 20 (Blue), 15 (Yellow), 10 (Green), 5 (White), 2.5 (Black), 1.25 (Chrome), 0.5, 0.25
 */
export interface BarbellPlateLoading {
  targetWeight: number;
  barWeight: number;
  collarsWeight: number;
  weightPerSide: number;
  loadedWeight: number;
  isExact: boolean;
  platesPerSide: Array<{
    weight: number;
    color: string;
    count: number;
    hex: string;
    label: string;
  }>;
}

export function calculateBarbellPlates(
  targetWeight: number,
  barWeight: number = 20,
  collarsWeight: number = 5,
): BarbellPlateLoading {
  const baseWeight = barWeight + collarsWeight;
  const neededWeight = Math.max(0, targetWeight - baseWeight);
  const perSideTarget = neededWeight / 2;

  const AVAILABLE_PLATES = [
    { weight: 25, color: "Red", hex: "#dc2626", label: "25 KG" },
    { weight: 20, color: "Blue", hex: "#2563eb", label: "20 KG" },
    { weight: 15, color: "Yellow", hex: "#eab308", label: "15 KG" },
    { weight: 10, color: "Green", hex: "#16a34a", label: "10 KG" },
    { weight: 5, color: "White", hex: "#f8fafc", label: "5 KG" },
    { weight: 2.5, color: "Black", hex: "#1e293b", label: "2.5 KG" },
    { weight: 1.25, color: "Chrome", hex: "#94a3b8", label: "1.25 KG" },
    { weight: 0.5, color: "Silver", hex: "#cbd5e1", label: "0.5 KG" },
    { weight: 0.25, color: "Silver", hex: "#e2e8f0", label: "0.25 KG" },
  ];

  let remaining = perSideTarget;
  const platesPerSide: BarbellPlateLoading["platesPerSide"] = [];

  for (const plate of AVAILABLE_PLATES) {
    if (remaining >= plate.weight - 0.001) {
      const count = Math.floor((remaining + 0.001) / plate.weight);
      if (count > 0) {
        platesPerSide.push({
          weight: plate.weight,
          color: plate.color,
          hex: plate.hex,
          label: plate.label,
          count,
        });
        remaining -= count * plate.weight;
      }
    }
  }

  const loadedPerSide = perSideTarget - remaining;
  const loadedWeight = baseWeight + loadedPerSide * 2;
  const isExact = Math.abs(loadedWeight - targetWeight) < 0.01;

  return {
    targetWeight,
    barWeight,
    collarsWeight,
    weightPerSide: perSideTarget,
    loadedWeight,
    isExact,
    platesPerSide,
  };
}