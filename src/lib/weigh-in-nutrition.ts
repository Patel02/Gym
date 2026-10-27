export type WeighInFormat = "IPF_2_HOUR" | "OPEN_24_HOUR";

export type CutSafetyTier = "SAFE" | "MODERATE" | "AGGRESSIVE" | "HAZARDOUS";

export interface CutDiagnostics {
  currentWeightKg: number;
  targetWeightKg: number;
  cutWeightKg: number;
  cutPercentage: number;
  safetyTier: CutSafetyTier;
  safetyScore: number; // 0 to 100
  recommendedAction: string;
  strengthImpactDescription: string;
  rehydrationFluidNeededLiters: number;
  waterLoadVolumeLiters: number;
}

export interface DayHydrationPlan {
  dayLabel: string;
  daysOut: number;
  title: string;
  waterLiters: number;
  waterFormula: string;
  sodiumTargetMg: number;
  sodiumStatus: "NORMAL" | "HIGH_LOAD" | "TAPER" | "LOW" | "ZERO";
  carbsPerKg: number;
  fiberStatus: "NORMAL" | "LOW_RESIDUE" | "ZERO_FIBER";
  keyFoods: string[];
  coachDirectives: string;
  warningAlert?: string;
}

export interface RefeedMilestone {
  minuteRange: string;
  title: string;
  goal: string;
  fluidAmountMl: number;
  fluidType: string;
  carbsGrams: number;
  proteinGrams: number;
  sodiumMg: number;
  recommendedFoods: string[];
  physiologyNote: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Weight Cut Analysis Algorithms
// ─────────────────────────────────────────────────────────────────────────────

export function calculateCutDiagnostics(
  currentWeightKg: number,
  targetWeightKg: number,
  format: WeighInFormat = "IPF_2_HOUR"
): CutDiagnostics {
  const safeCurrent = Math.max(30, currentWeightKg);
  const safeTarget = Math.max(30, Math.min(safeCurrent, targetWeightKg));
  const cutWeightKg = Math.max(0, Math.round((safeCurrent - safeTarget) * 100) / 100);
  const cutPercentage = Math.round((cutWeightKg / safeCurrent) * 1000) / 10;

  let safetyTier: CutSafetyTier = "SAFE";
  let safetyScore = 95;
  let recommendedAction = "Optimal competition weight cut. Proceed with light fluid taper.";
  let strengthImpactDescription = "0% to 2% strength compromise. Rapid neurological re-activation.";

  // Safe limits depend on weigh-in format (IPF 2-hour is much stricter than 24-hour)
  const is2Hour = format === "IPF_2_HOUR";

  if (cutPercentage <= (is2Hour ? 2.0 : 3.0)) {
    safetyTier = "SAFE";
    safetyScore = 95;
    recommendedAction = "Optimal cut range. Minor water taper will easily make weight without stress.";
    strengthImpactDescription = "Negligible platform strength loss. Full 100% 1RM preservation expected.";
  } else if (cutPercentage <= (is2Hour ? 4.0 : 6.0)) {
    safetyTier = "MODERATE";
    safetyScore = 75;
    recommendedAction = "Standard competitive cut. Requires disciplined 5-day water loading and low-residue gut clearance.";
    strengthImpactDescription = "Minor 2-4% transient power dip if refeed is delayed. Fully restored with proper isotonic protocol.";
  } else if (cutPercentage <= (is2Hour ? 6.0 : 8.5)) {
    safetyTier = "AGGRESSIVE";
    safetyScore = 50;
    recommendedAction = "Aggressive cut! High risk of cramping, reduced squat endurance, and CNS fatigue. Supervised only.";
    strengthImpactDescription = "Moderate 5-10% strength reduction risk, especially on Squat depth drive. Heavy sodium depletion caution.";
  } else {
    safetyTier = "HAZARDOUS";
    safetyScore = 20;
    recommendedAction = "DANGEROUS: High risk of acute dehydration, renal strain, and severe platform crash. Compete one weight class up!";
    strengthImpactDescription = "Severe 12-20% strength drop. Extreme cramping, postural dizziness, and potential disqualification risk.";
  }

  // Refeed fluid requirement: 1.25 - 1.5 L per kg lost
  const rehydrationFluidNeededLiters = Math.round(cutWeightKg * 1.35 * 10) / 10;
  // Water load starting volume: ~100ml per kg bodyweight (minimum 6L, max 10L)
  const waterLoadVolumeLiters = Math.min(10, Math.max(6, Math.round((safeCurrent * 0.1) * 2) / 2));

  return {
    currentWeightKg: safeCurrent,
    targetWeightKg: safeTarget,
    cutWeightKg,
    cutPercentage,
    safetyTier,
    safetyScore,
    recommendedAction,
    strengthImpactDescription,
    rehydrationFluidNeededLiters,
    waterLoadVolumeLiters,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5-Day Water Loading & Sodium Taper Matrix
// ─────────────────────────────────────────────────────────────────────────────

export function generateFiveDayHydrationPlan(
  bodyweight: number,
  cutKg: number,
  format: WeighInFormat = "IPF_2_HOUR"
): DayHydrationPlan[] {
  const baseLoadLiters = Math.min(10, Math.max(6, Math.round((bodyweight * 0.1) * 2) / 2));

  return [
    {
      dayLabel: "Day -5 (5 Days Out)",
      daysOut: 5,
      title: "Hyper-Hydration Ignition",
      waterLiters: baseLoadLiters,
      waterFormula: `100ml / kg bodyweight (~${baseLoadLiters} Liters)`,
      sodiumTargetMg: 4000,
      sodiumStatus: "NORMAL",
      carbsPerKg: 4.5,
      fiberStatus: "NORMAL",
      keyFoods: ["Oatmeal with whey", "Basmati rice & grilled chicken", "Potatoes with normal table salt", "Electrolyte water"],
      coachDirectives: "Drink 1 glass of water every 45-60 minutes throughout the day. Do not chug all at once. Salt all meals normally.",
    },
    {
      dayLabel: "Day -4 (4 Days Out)",
      daysOut: 4,
      title: "Sodium Overload & Aldosterone Suppression",
      waterLiters: baseLoadLiters,
      waterFormula: `Maintain peak hydration (~${baseLoadLiters} Liters)`,
      sodiumTargetMg: 6000,
      sodiumStatus: "HIGH_LOAD",
      carbsPerKg: 4.5,
      fiberStatus: "NORMAL",
      keyFoods: ["Salted pretzels", "Pickle juice / olives", "Extra salted eggs & rice", "Soy sauce marinated chicken"],
      coachDirectives: "Heavy salt intake suppresses the water-conserving hormone Aldosterone. The body begins flushing sodium and water at maximum velocity.",
    },
    {
      dayLabel: "Day -3 (3 Days Out)",
      daysOut: 3,
      title: "Gut Residue Depletion & Water Maintenance",
      waterLiters: Math.max(5, baseLoadLiters - 2),
      waterFormula: `Begin gentle fluid taper (~${Math.max(5, baseLoadLiters - 2)} Liters)`,
      sodiumTargetMg: 3500,
      sodiumStatus: "NORMAL",
      carbsPerKg: 4.0,
      fiberStatus: "LOW_RESIDUE",
      keyFoods: ["White jasmine rice", "Lean chicken breast / white fish", "Peeled potatoes", "White bread with honey"],
      coachDirectives: "CRITICAL: Eliminate all fibrous veggies, beans, oats, whole grains, and dairy. Low residue empties 1-1.5kg of digestive bowel contents naturally.",
      warningAlert: "Fiber intake must drop under 10 grams per day from this point forward.",
    },
    {
      dayLabel: "Day -2 (2 Days Out)",
      daysOut: 2,
      title: "Sodium Taper & Caloric Concentration",
      waterLiters: Math.max(3.5, baseLoadLiters - 4),
      waterFormula: `Step-down hydration (~${Math.max(3.5, baseLoadLiters - 4)} Liters)`,
      sodiumTargetMg: 1500,
      sodiumStatus: "LOW",
      carbsPerKg: 3.5,
      fiberStatus: "LOW_RESIDUE",
      keyFoods: ["Plain boiled white rice", "Chicken with zero added salt", "Rice cakes with fruit spread", "Distilled / Low-sodium water"],
      coachDirectives: "The body continues flushing water rapidly due to the suppression of Aldosterone, creating massive spontaneous diuresis.",
    },
    {
      dayLabel: "Day -1 (1 Day Out)",
      daysOut: 1,
      title: "Fluid Cut-Off & Dry Carb Loading",
      waterLiters: 1.5,
      waterFormula: "Strict 1.5L ceiling (Cut off completely 14 hours before weigh-in)",
      sodiumTargetMg: 500,
      sodiumStatus: "ZERO",
      carbsPerKg: 3.0,
      fiberStatus: "ZERO_FIBER",
      keyFoods: ["Dry rice cakes with honey", "Plain baked white potatoes", "Sips of distilled water only"],
      coachDirectives: "Stop all liquids 14 hours before official morning weigh-in. Sleep in warm clothing. If within 300g of target, do not stress.",
      warningAlert: "No water or food after 8:00 PM the night prior to weigh-in.",
    },
    {
      dayLabel: "Day 0 (Weigh-In Morning)",
      daysOut: 0,
      title: "Trial Scale & Official Verification",
      waterLiters: 0,
      waterFormula: "Zero intake until stepping off the platform scale",
      sodiumTargetMg: 0,
      sodiumStatus: "ZERO",
      carbsPerKg: 0,
      fiberStatus: "ZERO_FIBER",
      keyFoods: ["Sip cup / sour gum for dry mouth (do not swallow)"],
      coachDirectives: "Step on the federation official test scale 45 minutes early. Strip down to competition underwear. Once verified, begin the 2-Hour Rapid Refeed immediately!",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Post Weigh-In 2-Hour Rapid Refeed Protocol (IPF Standard)
// ─────────────────────────────────────────────────────────────────────────────

export const TWO_HOUR_REFEED_SCHEDULE: RefeedMilestone[] = [
  {
    minuteRange: "0 - 15 Min",
    title: "Off-The-Scale Isotonic Shock",
    goal: "Restore intravascular blood volume without gastric bloating.",
    fluidAmountMl: 750,
    fluidType: "Isotonic Electrolyte Solution (ORS / Electral + Pink Himalayan Salt)",
    carbsGrams: 45,
    proteinGrams: 0,
    sodiumMg: 1200,
    recommendedFoods: ["750ml warm/room-temp ORS electrolyte water", "1 packet Electral in water with pinch of salt", "5-8 gummy bears / dextrose tabs"],
    physiologyNote: "A 6-8% carbohydrate-sodium concentration empties from the stomach into the bloodstream fastest, restoring plasma volume within 15 minutes.",
  },
  {
    minuteRange: "15 - 45 Min",
    title: "Fast Glycogen Priming",
    goal: "Rapid intramuscular glycogen uptake & muscle cellular hydration.",
    fluidAmountMl: 500,
    fluidType: "Electrolyte fruit juice or diluted Gatorade",
    carbsGrams: 75,
    proteinGrams: 25,
    sodiumMg: 600,
    recommendedFoods: ["Plain white bagel with seedless strawberry jam", "1 scoop Whey Protein Isolate in water", "1 medium ripe yellow banana", "Handful of salted pretzels"],
    physiologyNote: "Whey isolate provides rapidly circulating amino acids without slowing gastric motility. Keep dietary fat under 3 grams to prevent delayed digestion.",
  },
  {
    minuteRange: "45 - 75 Min",
    title: "Sustained Energy & Sodium Retention",
    goal: "Solid platform fuel & long-lasting osmotic muscle fullness.",
    fluidAmountMl: 400,
    fluidType: "Regular water with pinch of salt",
    carbsGrams: 50,
    proteinGrams: 15,
    sodiumMg: 800,
    recommendedFoods: ["Salted white jasmine rice with light shredded chicken", "Baby food fruit puree pouches", "Salted rice crackers with honey"],
    physiologyNote: "Sodium intake locks intracellular fluid into skeletal muscle fibers, giving athletes the 'pump' and stabilizing leverage in squat knee sleeves.",
  },
  {
    minuteRange: "75 - 120 Min",
    title: "Warm-Up Transition & Platform CNS Arousal",
    goal: "Maximum adrenaline activation and flight stage preparation.",
    fluidAmountMl: 250,
    fluidType: "Sips of electrolyte water as needed",
    carbsGrams: 20,
    proteinGrams: 0,
    sodiumMg: 300,
    recommendedFoods: ["Pre-workout / Caffeine (150-250mg) 30 min before Squat 1", "Sour candy / dextrose chews between warm-up sets", "Ammonia inhalant capsule in handler's pocket"],
    physiologyNote: "All heavy digestion is complete. Gastrointestinal tract is empty and comfortable. CNS is primed for opening attempt on platform.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Official Backstage Grocery & Supplement Packing List
// ─────────────────────────────────────────────────────────────────────────────

export interface SupplyItem {
  name: string;
  category: "HYDRATION" | "CARBOHYDRATES" | "PROTEIN_ENERGY" | "EQUIPMENT";
  amountNeeded: string;
  purpose: string;
}

export const BACKSTAGE_GROCERY_CHECKLIST: SupplyItem[] = [
  {
    name: "WHO Oral Rehydration Salts (ORS / Electral)",
    category: "HYDRATION",
    amountNeeded: "4-6 sachets",
    purpose: "Rapid rehydration with medical-grade sodium-glucose cotransport.",
  },
  {
    name: "Himalayan Pink Rock Salt",
    category: "HYDRATION",
    amountNeeded: "1 small container",
    purpose: "Electrolyte replenishment to prevent hamstring & back spasms.",
  },
  {
    name: "White New York Style Bagels",
    category: "CARBOHYDRATES",
    amountNeeded: "2-3 bagels",
    purpose: "High-density, low-fiber, fast-digesting platform carbohydrates.",
  },
  {
    name: "Seedless Strawberry / Blueberry Jam",
    category: "CARBOHYDRATES",
    amountNeeded: "1 jar",
    purpose: "Instant glucose + fructose for rapid liver & muscle glycogen recharge.",
  },
  {
    name: "Haribo Goldbears / Dextrose Tablets",
    category: "CARBOHYDRATES",
    amountNeeded: "1 bag",
    purpose: "Fast blood sugar bumps between warm-up ramp sets backstage.",
  },
  {
    name: "100% Whey Protein Isolate",
    category: "PROTEIN_ENERGY",
    amountNeeded: "2 pre-measured scoops",
    purpose: "Fat-free, lactose-free amino acid delivery for muscle repair.",
  },
  {
    name: "Caffeine Tablets / Pre-Workout Powder",
    category: "PROTEIN_ENERGY",
    amountNeeded: "200mg - 300mg",
    purpose: "Central nervous system stimulation 30 minutes before Flight call.",
  },
  {
    name: "Digital Calibrated Kitchen / Luggage Scale",
    category: "EQUIPMENT",
    amountNeeded: "1 unit",
    purpose: "Verifying athlete weight in hotel room before walking to official scale.",
  },
];
