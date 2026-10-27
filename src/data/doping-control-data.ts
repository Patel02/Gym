export interface ProhibitedSubstance {
  id: string;
  name: string;
  chemicalName: string;
  brandNames: string[];
  categoryCode: "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "M1" | "P1";
  categoryName: string;
  prohibitedWhen: "AT_ALL_TIMES" | "IN_COMPETITION_ONLY";
  standardSanction: string;
  typicalDetectionWindow: string;
  biologicalHalfLife: string;
  primaryRiskAndSideEffects: string;
  commonMisuseReason: string;
  tueEligible: boolean;
  wadaClassDescription: string;
}

export const WADA_PROHIBITED_SUBSTANCES: ProhibitedSubstance[] = [
  // S1: Anabolic Agents
  {
    id: "sub-01",
    name: "Testosterone (Exogenous)",
    chemicalName: "4-Androsten-17beta-ol-3-one",
    brandNames: ["Sustanon", "Testoviron", "Depo-Testosterone", "Androgel"],
    categoryCode: "S1",
    categoryName: "Anabolic Androgenic Steroids (AAS)",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban (First Offense)",
    typicalDetectionWindow: "3 - 18 Months (depends on ester: propionate vs enanthate/undecanoate)",
    biologicalHalfLife: "4.5 to 21 Days (ester dependent)",
    primaryRiskAndSideEffects: "Cardiovascular hypertrophy, severe dyslipidemia, suppression of natural HPTA axis, hepatotoxicity.",
    commonMisuseReason: "Dramatically enhances protein synthesis, nitrogen retention, and absolute muscle strength.",
    tueEligible: true,
    wadaClassDescription: "Non-endogenous administration or elevated T/E (Testosterone/Epitestosterone) ratio exceeding 4:1 confirmed via IRMS (Isotope Ratio Mass Spectrometry)."
  },
  {
    id: "sub-02",
    name: "Trenbolone",
    chemicalName: "17beta-hydroxyestra-4,9,11-trien-3-one",
    brandNames: ["Finaplix", "Parabolan", "Tren-Ace", "Tren-E"],
    categoryCode: "S1",
    categoryName: "Anabolic Androgenic Steroids (AAS)",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "5 - 9 Months (acetate: 5 months; hexahydrobenzylcarbonate: 9+ months)",
    biologicalHalfLife: "2 - 3 Days (Acetate), 7 - 10 Days (Enanthate)",
    primaryRiskAndSideEffects: "Renal strain, acute insomnia, hypertension, aggressive mood alterations, severe lipid derangement.",
    commonMisuseReason: "Extremely high anabolic:androgenic binding affinity (500:500 vs 100:100 for testosterone) to rapidly increase 1RM power without water retention.",
    tueEligible: false,
    wadaClassDescription: "Veterinary-grade synthetic AAS with zero approved clinical human indications in India or globally."
  },
  {
    id: "sub-03",
    name: "Nandrolone (19-Nortestosterone)",
    chemicalName: "19-Nor-4-androsten-17beta-ol-3-one",
    brandNames: ["Deca-Durabolin", "Decaneurabol", "Retabolil"],
    categoryCode: "S1",
    categoryName: "Anabolic Androgenic Steroids (AAS)",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "12 - 18 Months (metabolite 19-norandrosterone lingers in adipose tissue)",
    biologicalHalfLife: "6 - 12 Days (Decanoate ester)",
    primaryRiskAndSideEffects: "Prolactin elevation, erectile dysfunction ('Deca Dick'), extreme HPTA shutdown, atherosclerosis.",
    commonMisuseReason: "Joint collagen synthesis masking pain in heavy squats, combined with sustained lean mass accrual.",
    tueEligible: true,
    wadaClassDescription: "Urinary concentration of 19-norandrosterone exceeding 2.5 ng/mL triggers an Adverse Analytical Finding (AAF)."
  },
  {
    id: "sub-04",
    name: "Oxandrolone (Anavar)",
    chemicalName: "17beta-hydroxy-17alpha-methyl-2-oxa-5alpha-androstan-3-one",
    brandNames: ["Anavar", "Oxandrin", "Lonavar"],
    categoryCode: "S1",
    categoryName: "Anabolic Androgenic Steroids (AAS)",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "3 - 4 Weeks (Oral)",
    biologicalHalfLife: "9 - 12 Hours",
    primaryRiskAndSideEffects: "Profound HDL suppression, elevated liver transaminases (ALT/AST), premature epiphyseal closure.",
    commonMisuseReason: "Favored in weight-class sports for rapid strength gains via phosphocreatine synthesis without adding water weight.",
    tueEligible: true,
    wadaClassDescription: "Oral 17-alpha-alkylated anabolic steroid with low androgenicity and high anabolic potency."
  },
  {
    id: "sub-05",
    name: "Stanozolol (Winstrol)",
    chemicalName: "17alpha-methyl-5alpha-androst-2-eno[3,2-c]pyrazol-17beta-ol",
    brandNames: ["Winstrol", "Stromba", "Stanover"],
    categoryCode: "S1",
    categoryName: "Anabolic Androgenic Steroids (AAS)",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "2 - 3 Months (Oral), 5 - 6 Months (Injectable suspension)",
    biologicalHalfLife: "9 Hours (Oral) / 24 Hours (Injectable)",
    primaryRiskAndSideEffects: "Severe tendon brittleness leading to patellar/pectoral tendon ruptures under heavy squat loads, hepatotoxicity.",
    commonMisuseReason: "Increases speed-strength, power density, and dry muscle retention during weight class cuts.",
    tueEligible: false,
    wadaClassDescription: "DHT-derived 17-alpha alkylated steroid detectable via high-sensitivity 3'-hydroxy-stanozolol mass spectrometry."
  },

  // S2: Peptide Hormones & Growth Factors
  {
    id: "sub-06",
    name: "Human Growth Hormone (hGH / Somatropin)",
    chemicalName: "191-amino acid single-chain polypeptide",
    brandNames: ["Genotropin", "Norditropin", "Saizen", "Humatrope"],
    categoryCode: "S2",
    categoryName: "Peptide Hormones, Growth Factors & Related Substances",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "24 - 48 Hours (Isoform differential immunoassay) / Up to 21 Days (hGH Biomarker Test using IGF-1 & P-III-NP)",
    biologicalHalfLife: "20 - 30 Minutes (circulating intact hormone)",
    primaryRiskAndSideEffects: "Acromegaly (skull/jaw/hand bone enlargement), carpal tunnel syndrome, insulin resistance, organomegaly.",
    commonMisuseReason: "Connective tissue hypertrophy, accelerated tendon remodeling between heavy peaking blocks, and body fat reduction.",
    tueEligible: true,
    wadaClassDescription: "Detected via WADA dual-marker ratio of 22kDa:total hGH or the secondary Biomarker Score of IGF-1 and P-III-NP."
  },
  {
    id: "sub-07",
    name: "Erythropoietin (EPO)",
    chemicalName: "Glycoprotein cytokine hormone",
    brandNames: ["Epogen", "Procrit", "NeoRecormon"],
    categoryCode: "S2",
    categoryName: "Peptide Hormones, Growth Factors & Related Substances",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "2 - 4 Days (direct urine electrophoretic test) / Long-term detection via Athlete Biological Passport (ABP) haematological module",
    biologicalHalfLife: "4 - 13 Hours",
    primaryRiskAndSideEffects: "Severe hyperviscosity syndrome, thromboembolism, myocardial infarction, strokes.",
    commonMisuseReason: "Elevates red blood cell volume (hematocrit) to enhance backstage recovery between warm-up ramp sets and high-volume flights.",
    tueEligible: true,
    wadaClassDescription: "Prohibited under WADA Section S2 due to artificial stimulation of erythropoiesis."
  },

  // S3: Beta-2 Agonists
  {
    id: "sub-08",
    name: "Clenbuterol",
    chemicalName: "(RS)-1-(4-amino-3,5-dichlorophenyl)-2-(tert-butylamino)ethanol",
    brandNames: ["Spiropent", "Ventipulmin", "Dilaterol"],
    categoryCode: "S3",
    categoryName: "Beta-2 Agonists",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "5 - 14 Days (sensitive GC-MS detects picogram quantities)",
    biologicalHalfLife: "36 - 39 Hours",
    primaryRiskAndSideEffects: "Cardiac arrhythmias, severe muscle cramping, hypokalemia, tremors, acute myocardial necrosis.",
    commonMisuseReason: "Powerful thermogenic beta-2 adrenergic stimulation for aggressive bodyweight cuts before official weigh-in.",
    tueEligible: false,
    wadaClassDescription: "Non-threshold substance prohibited at all times. Any detected level in urine triggers an Adverse Analytical Finding."
  },
  {
    id: "sub-09",
    name: "Salbutamol (Albuterol) - Above Permitted Threshold",
    chemicalName: "4-[2-(tert-butylamino)-1-hydroxyethyl]-2-(hydroxymethyl)phenol",
    brandNames: ["Asthalin", "Ventolin", "Proventil"],
    categoryCode: "S3",
    categoryName: "Beta-2 Agonists",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "2 - 4 Years Ineligibility Ban (if exceeding 1000 ng/mL)",
    typicalDetectionWindow: "24 - 48 Hours",
    biologicalHalfLife: "4 - 6 Hours",
    primaryRiskAndSideEffects: "Tachycardia, peripheral vasodilation, nervousness, electrolyte disturbance.",
    commonMisuseReason: "Bronchodilation and mild acute lipolysis before platform attempts.",
    tueEligible: true,
    wadaClassDescription: "Permitted by inhalation up to max 1600 mcg over 24h (not exceeding 600 mcg in any 8-hour period). Urinary levels > 1000 ng/mL constitute a doping violation unless proven via controlled pharmacokinetic study."
  },

  // S4: Hormone and Metabolic Modulators (SARMs, SERMs, AIs)
  {
    id: "sub-10",
    name: "GW501516 (Cardarine / Endurobol)",
    chemicalName: "{4-[({4-methyl-2-[4-(trifluoromethyl)phenyl]-1,3-thiazol-5-yl}methyl)sulfanyl]-2-methylphenoxy}acetic acid",
    brandNames: ["Cardarine", "Endurobol", "GW-501,516"],
    categoryCode: "S4",
    categoryName: "Hormone & Metabolic Modulators",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "30 - 60 Days (metabolite sulfone and sulfoxide)",
    biologicalHalfLife: "16 - 24 Hours",
    primaryRiskAndSideEffects: "Preclinical trials abandoned due to rapid induction of multi-organ carcinogenic cell proliferation in laboratory studies.",
    commonMisuseReason: "PPAR-delta agonist shifting skeletal muscle substrate utilization towards fatty acid oxidation, dramatically improving work capacity.",
    tueEligible: false,
    wadaClassDescription: "Classified as non-approved metabolic modulator under S4.4. Zero clinical authorization."
  },
  {
    id: "sub-11",
    name: "MK-2866 (Ostarine / Enobosarm)",
    chemicalName: "((2S)-3-(4-cyanophenoxy)-N-[4-cyano-3-(trifluoromethyl)phenyl]-2-hydroxy-2-methylpropanamide)",
    brandNames: ["Ostarine", "Enobosarm", "GTx-024"],
    categoryCode: "S4",
    categoryName: "Hormone & Metabolic Modulators (SARMs)",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "2 - 3 Months",
    biologicalHalfLife: "24 Hours",
    primaryRiskAndSideEffects: "Testosterone suppression, hepatic stress, dyslipidemia, potential testicular atrophy.",
    commonMisuseReason: "Selective Androgen Receptor Modulator marketed as a 'safer oral alternative' for lean mass retention during weight cutting.",
    tueEligible: false,
    wadaClassDescription: "Prohibited under WADA Section S4.1 (SARMs). One of the most frequently detected adulterants in tainted OTC gym supplements in India."
  },
  {
    id: "sub-12",
    name: "RAD-140 (Testolone)",
    chemicalName: "2-chloro-4-[[(1R,2S)-1-[5-(4-cyanophenyl)-1,3,4-oxadiazol-2-yl]-2-hydroxypropyl]amino]-3-methylbenzonitrile",
    brandNames: ["Testolone", "RAD-140"],
    categoryCode: "S4",
    categoryName: "Hormone & Metabolic Modulators (SARMs)",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "60 - 90 Days",
    biologicalHalfLife: "60 Hours",
    primaryRiskAndSideEffects: "Profound intrinsic testosterone suppression, severe liver cholestasis, elevated systolic blood pressure.",
    commonMisuseReason: "High anabolic ratio designed to mimic androgenic muscle building on squat and deadlift platform performance.",
    tueEligible: false,
    wadaClassDescription: "Experimental non-steroidal SARM under active WADA analytical monitoring."
  },
  {
    id: "sub-13",
    name: "Anastrozole (Arimidex)",
    chemicalName: "2,2'-[5-(1H-1,2,4-triazol-1-ylmethyl)-1,3-phenylene]bis(2-methylpropanenitrile)",
    brandNames: ["Arimidex", "Armotraz", "Altraz"],
    categoryCode: "S4",
    categoryName: "Hormone & Metabolic Modulators (Aromatase Inhibitors)",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "2 - 3 Weeks",
    biologicalHalfLife: "48 Hours",
    primaryRiskAndSideEffects: "Severe joint pain and cartilage stiffness (due to zero estrogen), bone mineral density reduction, hot flashes.",
    commonMisuseReason: "Used to suppress estrogen conversion during exogenous steroid cycles, or in PCT (Post Cycle Therapy) regimens.",
    tueEligible: true,
    wadaClassDescription: "Non-steroidal third-generation aromatase inhibitor prohibited under Section S4.2."
  },
  {
    id: "sub-14",
    name: "Tamoxifen (Nolvadex)",
    chemicalName: "(Z)-2-[4-(1,2-diphenylbut-1-enyl)phenoxy]-N,N-dimethylethanamine",
    brandNames: ["Nolvadex", "Tamodex", "Cytotam"],
    categoryCode: "S4",
    categoryName: "Hormone & Metabolic Modulators (SERMs)",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "4 Years Ineligibility Ban",
    typicalDetectionWindow: "4 - 8 Weeks",
    biologicalHalfLife: "5 - 7 Days",
    primaryRiskAndSideEffects: "Deep vein thrombosis, hypertriglyceridemia, ocular toxicity (cataracts/retinopathy).",
    commonMisuseReason: "Selective Estrogen Receptor Modulator used to kickstart endogenous luteinizing hormone (LH) and prevent gynecomastia.",
    tueEligible: true,
    wadaClassDescription: "Prohibited under WADA S4.3 (SERMs)."
  },

  // S5: Diuretics and Masking Agents
  {
    id: "sub-15",
    name: "Furosemide (Lasix)",
    chemicalName: "4-chloro-2-[(furan-2-ylmethyl)amino]-5-sulfamoylbenzoic acid",
    brandNames: ["Lasix", "Frusix", "Salix"],
    categoryCode: "S5",
    categoryName: "Diuretics & Masking Agents",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "2 - 4 Years Ineligibility Ban",
    typicalDetectionWindow: "24 - 48 Hours",
    biologicalHalfLife: "1.5 - 2 Hours",
    primaryRiskAndSideEffects: "Severe acute dehydration, severe hypokalemia triggering fatal cardiac arrest, catastrophic backstage muscle cramping.",
    commonMisuseReason: "Rapid chemical dumping of 3 - 6 kg of water weight within 6 hours of weigh-in, and dilution of other doping metabolites.",
    tueEligible: true,
    wadaClassDescription: "Loop diuretic strictly prohibited at all times. Also requires TUE + proving specific non-performance medical indication."
  },
  {
    id: "sub-16",
    name: "Spironolactone (Aldactone)",
    chemicalName: "7alpha-acetylthio-3-oxo-17alpha-pregn-4-ene-21,17beta-carbolactone",
    brandNames: ["Aldactone", "Spilactone"],
    categoryCode: "S5",
    categoryName: "Diuretics & Masking Agents",
    prohibitedWhen: "AT_ALL_TIMES",
    standardSanction: "2 - 4 Years Ineligibility Ban",
    typicalDetectionWindow: "48 - 72 Hours",
    biologicalHalfLife: "1.4 Hours (Spironolactone) / 16 Hours (Canrenone metabolite)",
    primaryRiskAndSideEffects: "Hyperkalemia (excessive potassium causing heart stoppage), severe hypotension, gynecomastia.",
    commonMisuseReason: "Potassium-sparing diuretic used to mask subcutaneous water retention and manipulate weigh-in scale numbers.",
    tueEligible: true,
    wadaClassDescription: "Aldosterone antagonist prohibited at all times under S5."
  },

  // S6: Stimulants (In-Competition)
  {
    id: "sub-17",
    name: "Methylhexanamine (DMAA / 1,3-Dimethylamylamine)",
    chemicalName: "4-methylhexan-2-amine",
    brandNames: ["Geranamine", "Jack3d (old formula)", "Floradrene", "Forthane"],
    categoryCode: "S6",
    categoryName: "Stimulants",
    prohibitedWhen: "IN_COMPETITION_ONLY",
    standardSanction: "2 Years Ineligibility Ban",
    typicalDetectionWindow: "48 - 105 Hours",
    biologicalHalfLife: "8 - 12 Hours",
    primaryRiskAndSideEffects: "Acute cerebral hemorrhage, severe tachycardia, shortness of breath, sudden cardiac collapse under max valsalva pressure.",
    commonMisuseReason: "Potent central nervous system stimulant taken 30 minutes before heavy deadlifts to heighten aggression and sympathetic drive.",
    tueEligible: false,
    wadaClassDescription: "Prohibited In-Competition under S6.b (Specified Stimulant). Extremely common undeclared ingredient in grey-market pre-workout powders."
  },
  {
    id: "sub-18",
    name: "Ephedrine (Concentration > 10 mcg/mL in Urine)",
    chemicalName: "(1R,2S)-2-(methylamino)-1-phenylpropan-1-ol",
    brandNames: ["Ephedra", "Ma Huang", "Dristan", "Efidac"],
    categoryCode: "S6",
    categoryName: "Stimulants",
    prohibitedWhen: "IN_COMPETITION_ONLY",
    standardSanction: "2 Years Ineligibility Ban (if urinary level > 10 mcg/mL)",
    typicalDetectionWindow: "24 - 48 Hours",
    biologicalHalfLife: "3 - 6 Hours",
    primaryRiskAndSideEffects: "Hypertensive crisis, stroke, heat stroke, psychosis.",
    commonMisuseReason: "ECA (Ephedrine-Caffeine-Aspirin) stack for acute platform CNS stimulation and pre-meet metabolic burn.",
    tueEligible: true,
    wadaClassDescription: "Prohibited when urinary concentration exceeds 10 mcg/mL during in-competition testing."
  },
  {
    id: "sub-19",
    name: "Modafinil",
    chemicalName: "2-(diphenylmethylsulfinyl)acetamide",
    brandNames: ["Modalert", "Provigil", "Modvigil"],
    categoryCode: "S6",
    categoryName: "Stimulants",
    prohibitedWhen: "IN_COMPETITION_ONLY",
    standardSanction: "2 - 4 Years Ineligibility Ban",
    typicalDetectionWindow: "48 - 72 Hours",
    biologicalHalfLife: "12 - 15 Hours",
    primaryRiskAndSideEffects: "Severe cutaneous adverse reactions (Stevens-Johnson syndrome), anxiety, severe palpitations.",
    commonMisuseReason: "Wakefulness-promoting agent used to combat backstage fatigue in extended 8-hour championship flights.",
    tueEligible: true,
    wadaClassDescription: "Non-specified stimulant prohibited In-Competition under S6.a."
  }
];

export interface DopingTestDrawCandidate {
  id: string;
  name: string;
  division: string;
  weightClass: string;
  clubOrState: string;
  lotNumber: number;
  flight: "Flight A" | "Flight B" | "Flight C";
  reasonForSelection: "PODIUM_GOLD" | "NATIONAL_RECORD" | "RANDOM_LOTTERY" | "TARGETED_INTELLIGENCE";
  notificationSlipNumber: string;
  chaperoneAssigned: string;
  notificationTimestamp: string;
  selectionConfidenceScore: number;
}

export interface DopingChainOfCustodyRecord {
  id: string;
  testCode: string;
  athleteName: string;
  athleteId: string;
  meetTitle: string;
  collectionDate: string;
  collectionTime: string;
  aSampleBarcode: string;
  bSampleBarcode: string;
  sampleVolumeMl: number;
  specificGravity: number;
  samplePh: number;
  dcoOfficerName: string;
  dcoLicenseNumber: string;
  chaperoneName: string;
  athleteDeclaration: string;
  testingLabDestination: string;
  status: "SAMPLES_SEALED" | "DISPATCHED_TO_LAB" | "RECEIVED_AT_NDTL" | "ANALYSIS_PENDING" | "CLEAN_NEGATIVE" | "ADVERSE_ANALYTICAL_FINDING";
}

export const SEED_CHAIN_OF_CUSTODY_RECORDS: DopingChainOfCustodyRecord[] = [
  {
    id: "coc-01",
    testCode: "NADA-2026-IND-0891",
    athleteName: "Patel Rakesh",
    athleteId: "cmu3n9gdd0004toa6di565n31",
    meetTitle: "Indian National Senior Men & Women Powerlifting Championship 2026",
    collectionDate: "2026-09-18",
    collectionTime: "11:45 AM",
    aSampleBarcode: "A-NADA-88492-SEC",
    bSampleBarcode: "B-NADA-88493-SEC",
    sampleVolumeMl: 105,
    specificGravity: 1.018,
    samplePh: 6.2,
    dcoOfficerName: "Dr. Arvind Rao, MD (Senior NADA DCO)",
    dcoLicenseNumber: "DCO-NADA-IND-042",
    chaperoneName: "Inspector Rajesh Kumar (Police Sports Board)",
    athleteDeclaration: "Declared Asthma Inhaler (Salbutamol 200mcg inhaled under approved TUE-2026-081) and Whey Protein Isolate.",
    testingLabDestination: "National Dope Testing Laboratory (NDTL), WADA-Accredited, Jawaharlal Nehru Stadium Complex, New Delhi",
    status: "SAMPLES_SEALED"
  },
  {
    id: "coc-02",
    testCode: "NADA-2026-IND-0892",
    athleteName: "Vikramjit Singh",
    athleteId: "cmu3n9gdd0004toa6di565n32",
    meetTitle: "Indian National Senior Men & Women Powerlifting Championship 2026",
    collectionDate: "2026-09-18",
    collectionTime: "12:15 PM",
    aSampleBarcode: "A-NADA-88494-SEC",
    bSampleBarcode: "B-NADA-88495-SEC",
    sampleVolumeMl: 95,
    specificGravity: 1.022,
    samplePh: 6.5,
    dcoOfficerName: "Dr. Arvind Rao, MD (Senior NADA DCO)",
    dcoLicenseNumber: "DCO-NADA-IND-042",
    chaperoneName: "Mahesh Patil",
    athleteDeclaration: "Declared Multivitamin tablet, Omega-3 Fish Oil, Creatine Monohydrate.",
    testingLabDestination: "National Dope Testing Laboratory (NDTL), WADA-Accredited, Jawaharlal Nehru Stadium Complex, New Delhi",
    status: "DISPATCHED_TO_LAB"
  }
];
