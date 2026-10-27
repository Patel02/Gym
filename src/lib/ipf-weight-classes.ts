/**
 * Official IPF (International Powerlifting Federation) Technical Rules 2026
 * Bodyweight Classification & Reclassification Engine
 */

export interface IpfWeightClassDefinition {
  code: string;
  label: string;
  upperLimit: number; // in kg
  lowerLimit: number; // in kg (exclusive or inclusive)
  gender: "MALE" | "FEMALE";
  juniorOnly?: boolean;
}

export const MEN_IPF_CLASSES: IpfWeightClassDefinition[] = [
  { code: "WC_53", label: "53.0 KG (Sub-Jr/Jr)", upperLimit: 53.00, lowerLimit: 0, gender: "MALE", juniorOnly: true },
  { code: "WC_59", label: "59.0 KG", upperLimit: 59.00, lowerLimit: 53.01, gender: "MALE" },
  { code: "WC_66", label: "66.0 KG", upperLimit: 66.00, lowerLimit: 59.01, gender: "MALE" },
  { code: "WC_74", label: "74.0 KG", upperLimit: 74.00, lowerLimit: 66.01, gender: "MALE" },
  { code: "WC_83", label: "83.0 KG", upperLimit: 83.00, lowerLimit: 74.01, gender: "MALE" },
  { code: "WC_93", label: "93.0 KG", upperLimit: 93.00, lowerLimit: 83.01, gender: "MALE" },
  { code: "WC_105", label: "105.0 KG", upperLimit: 105.00, lowerLimit: 93.01, gender: "MALE" },
  { code: "WC_120", label: "120.0 KG", upperLimit: 120.00, lowerLimit: 105.01, gender: "MALE" },
  { code: "WC_120_PLUS", label: "120.0+ KG", upperLimit: 999.00, lowerLimit: 120.01, gender: "MALE" },
];

export const WOMEN_IPF_CLASSES: IpfWeightClassDefinition[] = [
  { code: "WC_43", label: "43.0 KG (Sub-Jr/Jr)", upperLimit: 43.00, lowerLimit: 0, gender: "FEMALE", juniorOnly: true },
  { code: "WC_47", label: "47.0 KG", upperLimit: 47.00, lowerLimit: 43.01, gender: "FEMALE" },
  { code: "WC_52", label: "52.0 KG", upperLimit: 52.00, lowerLimit: 47.01, gender: "FEMALE" },
  { code: "WC_57", label: "57.0 KG", upperLimit: 57.00, lowerLimit: 52.01, gender: "FEMALE" },
  { code: "WC_63", label: "63.0 KG", upperLimit: 63.00, lowerLimit: 57.01, gender: "FEMALE" },
  { code: "WC_69", label: "69.0 KG", upperLimit: 69.00, lowerLimit: 63.01, gender: "FEMALE" },
  { code: "WC_76", label: "76.0 KG", upperLimit: 76.00, lowerLimit: 69.01, gender: "FEMALE" },
  { code: "WC_84", label: "84.0 KG", upperLimit: 84.00, lowerLimit: 76.01, gender: "FEMALE" },
  { code: "WC_84_PLUS", label: "84.0+ KG", upperLimit: 999.00, lowerLimit: 84.01, gender: "FEMALE" },
];

export interface ClassificationResult {
  classifiedCode: string;
  classifiedLabel: string;
  upperLimit: number;
  deltaKg: number; // positive = underweight by X kg, negative = overweight
  status: "EXACT_FIT" | "OVERWEIGHT" | "UNDERWEIGHT" | "RECLASSIFIED";
  message: string;
  registeredMatch: boolean;
  registeredCode?: string;
  reclassificationNote?: string;
  allowanceRemainingKg: number;
}

/**
 * Automatically classifies bodyweight into exact IPF Weight Class
 */
export function classifyIpfWeightClass(
  bodyweight: number,
  gender: "MALE" | "FEMALE" = "MALE",
  registeredClassCode?: string | null
): ClassificationResult {
  const list = gender === "FEMALE" ? WOMEN_IPF_CLASSES : MEN_IPF_CLASSES;

  if (!bodyweight || bodyweight <= 0) {
    return {
      classifiedCode: registeredClassCode || "WC_83",
      classifiedLabel: "Pending Weigh-In",
      upperLimit: 0,
      deltaKg: 0,
      status: "EXACT_FIT",
      message: "Please enter bodyweight scale reading",
      registeredMatch: true,
      allowanceRemainingKg: 0,
    };
  }

  // Find fitting class
  let matched = list[list.length - 1]; // fallback to superheavy
  for (const c of list) {
    if (bodyweight <= c.upperLimit) {
      matched = c;
      break;
    }
  }

  const delta = Number((matched.upperLimit - bodyweight).toFixed(2));
  const cleanRegistered = registeredClassCode?.toUpperCase().trim();
  const registeredMatch = cleanRegistered ? cleanRegistered === matched.code : true;

  let status: ClassificationResult["status"] = "EXACT_FIT";
  let message = `Classified in ${matched.label} (Under limit by ${delta} kg)`;
  let reclassificationNote: string | undefined = undefined;

  if (cleanRegistered && !registeredMatch) {
    const registeredDef = list.find((c) => c.code === cleanRegistered);
    if (registeredDef) {
      if (bodyweight > registeredDef.upperLimit) {
        status = "OVERWEIGHT";
        const overBy = Number((bodyweight - registeredDef.upperLimit).toFixed(2));
        message = `Overweight for registered ${registeredDef.label} (+${overBy} kg)`;
        reclassificationNote = `Athlete exceeds ${registeredDef.label} limit by ${overBy} kg. Automatic reclassification to ${matched.label}, or lifter has up to 2 hours for re-weigh.`;
      } else {
        status = "UNDERWEIGHT";
        message = `Underweight for registered ${registeredDef.label} (Eligible for ${matched.label})`;
        reclassificationNote = `Athlete weighed in below ${registeredDef.label} lower limit. Can either lift in ${matched.label} or remain in ${registeredDef.label}.`;
      }
    }
  }

  return {
    classifiedCode: matched.code,
    classifiedLabel: matched.label,
    upperLimit: matched.upperLimit,
    deltaKg: delta,
    status,
    message,
    registeredMatch,
    registeredCode: cleanRegistered,
    reclassificationNote,
    allowanceRemainingKg: delta,
  };
}
