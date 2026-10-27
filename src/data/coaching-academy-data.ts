export interface AcademyModule {
  id: string;
  moduleNumber: number;
  title: string;
  duration: string;
  level: "LEVEL_1" | "LEVEL_2";
  levelTitle: string;
  summary: string;
  learningOutcomes: string[];
  coachingCues: string[];
  tutors: string[];
  readingMaterial: string;
}

export const ACADEMY_CURRICULUM: AcademyModule[] = [
  // Level 1: Club & Regional Strength Coach
  {
    id: "mod-01",
    moduleNumber: 1,
    level: "LEVEL_1",
    levelTitle: "Level 1: Club & Regional Strength Coach",
    title: "Biomechanics of the Big Three: Squat, Bench Press & Deadlift",
    duration: "12 Hours (Theory + Hands-on Platform Lab)",
    summary: "Comprehensive anatomical analysis of skeletal levers, moment arms, bar path kinematics, and joint angle optimization across varying anthropometries (long femurs vs short torsos).",
    learningOutcomes: [
      "Master high-bar vs low-bar squat mechanics and centre of mass (COM) mid-foot alignment.",
      "Diagnose bench press scapular retraction, lat engagement, and legitimate arch legality.",
      "Differentiate conventional vs sumo deadlift hip hinge mechanics and bar-to-shin proximity."
    ],
    coachingCues: [
      "'Root the tripod foot into the platform before initiating hip hinge.'",
      "'Break the bar across your chest and drive through the heels on bench ascent.'",
      "'Push the platform away rather than pulling the barbell with the lower back.'"
    ],
    tutors: ["Coach Akash (Head of Platform Biomechanics)", "Coach Tanvi (Technical Movement Specialist)"],
    readingMaterial: "IPF Biomechanical Kinematics Manual (Volume 1) & SBD Kinetic Chain Handbook."
  },
  {
    id: "mod-02",
    moduleNumber: 2,
    level: "LEVEL_1",
    levelTitle: "Level 1: Club & Regional Strength Coach",
    title: "Linear & Undulating Periodization for Novice to Intermediate Lifters",
    duration: "10 Hours (Lecture + Spreadsheet Programming)",
    summary: "Designing structured 12-week hypertrophy, strength, and peaking macrocycles. Introduction to Daily Undulating Periodization (DUP), RPE scale calibration, and volume accumulation thresholds.",
    learningOutcomes: [
      "Structure progressive overload via linear volume reduction and intensity escalation.",
      "Accurately prescribe RPE (Rating of Perceived Exertion) and RIR (Reps in Reserve).",
      "Incorporate planned deload weeks (50% volume, 70% intensity) to prevent central nervous system burnout."
    ],
    coachingCues: [
      "'Never sacrifice bar speed for an ego-driven top single in week 4.'",
      "'Accumulate high-quality volume at RPE 7-8; save RPE 10 exclusively for meet day.'"
    ],
    tutors: ["Coach Akash", "Coach Tanvi"],
    readingMaterial: "Scientific Principles of Strength Training by Dr. Mike Israetel & A&T Periodization Matrix."
  },
  {
    id: "mod-03",
    moduleNumber: 3,
    level: "LEVEL_1",
    levelTitle: "Level 1: Club & Regional Strength Coach",
    title: "Backstage Flight Timing & Warm-Up Room Protocol",
    duration: "8 Hours (Practical Flight Simulation)",
    summary: "Managing lifters in rapid-fire 15-lifter flights. Calculating exact plate sleeve progressions, timing rest intervals, and delivering the lifter to the chalk box exactly 30 seconds before platform call.",
    learningOutcomes: [
      "Master the 5-Set Ramp Protocol: from empty bar to final 92% opener rehearsal.",
      "Coordinate warm-up timing with platform scoreboard pacing (~1 lifter per minute).",
      "Handle spotter communications, bar loading collar verification, and knee sleeve inspections."
    ],
    coachingCues: [
      "'Hit your final warm-up single when the platform is 3 lifters away from your opener.'",
      "'Keep a written clipboard; never calculate plate combinations under backstage adrenaline.'"
    ],
    tutors: ["Coach Akash"],
    readingMaterial: "IPF Meet Director & Platform Marshall Field Guide."
  },
  {
    id: "mod-04",
    moduleNumber: 4,
    level: "LEVEL_1",
    levelTitle: "Level 1: Club & Regional Strength Coach",
    title: "IPF Technical Rules, Rack Pin Calibration & Equipment Legality",
    duration: "6 Hours (Classroom + Inspection Deck)",
    summary: "Detailed walk-through of the official IPF Technical Rulebook. Mastering combination rack heights, safety pin offsets, belt thickness checks (13mm max), and approved gear manufacturer lists.",
    learningOutcomes: [
      "Record precise squat and bench rack pin heights during official weigh-in verification.",
      "Understand the 3-referee light majority rule and the 3-card infraction protocol.",
      "Inspect competitor singlets, knee sleeves, and wrist wraps for WADA/IPF legal compliance."
    ],
    coachingCues: [
      "'Always test the bench safety pins with an empty bar before your lifter lies down.'",
      "'Confirm thumb-loop release on wrist wraps immediately before stepping onto the platform.'"
    ],
    tutors: ["Coach Tanvi", "Senior National Technical Official"],
    readingMaterial: "Official IPF Technical Rules of Powerlifting (Approved 2026 Edition)."
  },

  // Level 2: National Technical & High-Performance Coach
  {
    id: "mod-05",
    moduleNumber: 5,
    level: "LEVEL_2",
    levelTitle: "Level 2: National High-Performance Coach",
    title: "Supercompensation, 1RM Peaking & Tapering Dynamics",
    duration: "14 Hours (Advanced Peaking Seminar)",
    summary: "Biophysical models of supercompensation, fitness-fatigue decay curves, and exponential tapering. Fine-tuning the final 14-day deload to peak neuromuscular recruitment on platform day.",
    learningOutcomes: [
      "Execute exponential fast vs slow decay tapers based on lifter muscle mass and age.",
      "Dissipate systemic fatigue while preserving motor unit synchronisation and barbell speed.",
      "Structure the final heavy single (opener test) at 7-10 days out without inducing soft tissue trauma."
    ],
    coachingCues: [
      "'Volume creates fatigue, intensity maintains fitness; slash volume by 60%, hold intensity high.'",
      "'The most common peaking error is panic testing 100% maxes 4 days before the meet.'"
    ],
    tutors: ["Coach Akash", "National High-Performance Director"],
    readingMaterial: "Supertraining by Yuri Verkhoshansky & Mel Siff."
  },
  {
    id: "mod-06",
    moduleNumber: 6,
    level: "LEVEL_2",
    levelTitle: "Level 2: National High-Performance Coach",
    title: "Water Cutting Science, Sodium Manipulation & 120-Min Refeed Protocols",
    duration: "10 Hours (Clinical Sports Nutrition & Lab)",
    summary: "Safe acute weight loss protocols for 2-hour weigh-ins. Aldosterone suppression water loading, low-residue gut clearance, and rapid isotonic plasma volume restoration.",
    learningOutcomes: [
      "Prescribe structured water loads (~100ml/kg) and safe sodium manipulation for 2-4% cuts.",
      "Implement a low-fiber, low-residue gut clearance phase 72h out to drop 1-1.5kg safely.",
      "Execute the 4-stage 120-minute post-weigh-in refeed protocol without gastrointestinal distress."
    ],
    coachingCues: [
      "'Never use diuretics or saunas for cuts over 5% BW; clean sport and health always come first.'",
      "'First 15 minutes off the scale are dedicated exclusively to isotonic sodium fluids, not solid meals.'"
    ],
    tutors: ["Coach Tanvi (Certified Sports Nutritionist & Dietitian)"],
    readingMaterial: "ISSN Position Stand: Nutritional Strategies for Weight-Class Combat & Strength Athletes."
  },
  {
    id: "mod-07",
    moduleNumber: 7,
    level: "LEVEL_2",
    levelTitle: "Level 2: National High-Performance Coach",
    title: "Game-Day Counter-Attempt Tactics & Podium Math",
    duration: "12 Hours (Live Meet War Room Simulation)",
    summary: "Real-time attempt calling under IPF Section 8.4 (1-minute attempt submission card rule). Managing 3rd deadlift changes to hunt podium gold, calculate lot-number advantages, and counter rival attempts.",
    learningOutcomes: [
      "Calculate projected IPF GL points differences in real-time between competing podium contenders.",
      "Execute the double-change rule on 3rd deadlift attempts to force competitors into unrecoverable weights.",
      "Calibrate jump decisions (+2.5kg vs +7.5kg) based on opener bar velocity and lifter RPE feedback."
    ],
    coachingCues: [
      "'Build your total with attempts 1 and 2; hunt medals and records exclusively on attempt 3.'",
      "'If you hold the lower lot number and lighter bodyweight, you hold the tiebreaker advantage.'"
    ],
    tutors: ["Coach Akash", "Senior National Championship Marshall"],
    readingMaterial: "Tactical Game Theory in International Powerlifting Competitions."
  },
  {
    id: "mod-08",
    moduleNumber: 8,
    level: "LEVEL_2",
    levelTitle: "Level 2: National High-Performance Coach",
    title: "Anti-Doping Strict Liability, WADA Code & Athlete Welfare",
    duration: "8 Hours (Legal & Ethical Integrity Deck)",
    summary: "Fostering 100% clean sport culture. Educating athletes on strict liability, WADA Prohibited List classes, tainted supplement cross-contamination, TUE filings, and whereabouts compliance.",
    learningOutcomes: [
      "Conduct third-party supplement batch testing audits (Informed Sport / NSF Certified for Sport).",
      "Guide athletes through the 4-step Therapeutic Use Exemption (TUE) application process.",
      "Protect athletes from predatory grey-market SARM marketing and unsafe cutting compounds."
    ],
    coachingCues: [
      "'A coach's legacy is defined by clean champions who inspire generations, not short-lived asterisks.'",
      "'If a supplement label promises steroid-like results, it is either adulterated or illegal.'"
    ],
    tutors: ["Coach Tanvi", "NADA Senior Medical Commissioner"],
    readingMaterial: "WADA Anti-Doping Code 2026 & Coaches Code of Ethics."
  }
];

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  scenario: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  topic: string;
}

export const COACHING_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: "q-01",
    questionNumber: 1,
    scenario: "During a national championship, your lifter opens their squat at 210 kg. The lift is granted ⚪⚪⚪, but bar velocity was notably sluggish and the lifter rates it at RPE 9.5. Your pre-planned 2nd attempt was 222.5 kg. What is the most tactically sound coaching call?",
    options: [
      { key: "A", text: "Stick to the pre-planned 222.5 kg jump (+12.5 kg); confidence is critical." },
      { key: "B", text: "Make a conservative micro-bump to 215 kg (+5 kg) or 212.5 kg to secure a second valid total builder." },
      { key: "C", text: "Skip the 2nd attempt completely and rest for the 3rd attempt." },
      { key: "D", text: "Increase weight to 225 kg to intimidate the opposing flight lifters." }
    ],
    correctAnswer: "B",
    explanation: "At RPE 9.5 on an opener, the lifter has approximately 0 to 1 rep in reserve. An aggressive +12.5 kg jump will almost certainly cause a technical stall or missed lift. The golden rule of coaching is building the total with a safe, conservative increase.",
    topic: "Game-Day Attempt Calling"
  },
  {
    id: "q-02",
    questionNumber: 2,
    scenario: "Under IPF Section 8.4, within how many seconds of leaving the platform must the coach or lifter submit the weight for their next attempt to the score table?",
    options: [
      { key: "A", text: "30 Seconds" },
      { key: "B", text: "60 Seconds (1 Minute)" },
      { key: "C", text: "90 Seconds" },
      { key: "D", text: "2 Minutes" }
    ],
    correctAnswer: "B",
    explanation: "IPF Rule 8.4 mandates that the attempt card must be submitted within 60 seconds (1 minute). If failed, the next attempt is automatically set to a default +2.5 kg bump if the previous lift was good, or repeated if missed.",
    topic: "IPF Technical Rules"
  },
  {
    id: "q-03",
    questionNumber: 3,
    scenario: "A lifter competing in an afternoon session (14:00) weighs in at 12:00. They cut 2.5 kg via mild water load and gut clearance. What should their nutritional protocol be in the first 15 minutes immediately off the scale?",
    options: [
      { key: "A", text: "Consume a heavy steak and french fries meal with high fat to induce satiety." },
      { key: "B", text: "Sip 750 mL of an isotonic electrolyte fluid (ORS with ~800mg sodium + 45g simple carbs) to rapidly restore blood volume without gastric distress." },
      { key: "C", text: "Drink 2 liters of plain distilled water as fast as possible." },
      { key: "D", text: "Take 400 mg of caffeine immediately on an empty stomach." }
    ],
    correctAnswer: "B",
    explanation: "Following acute dehydration, plasma volume must be restored via isotonic fluids with sodium and glucose to activate SGLT-1 co-transporters in the small intestine. Plain water triggers hyponatremia and heavy fats cause backstage gastric delay.",
    topic: "Weigh-In Nutrition Science"
  },
  {
    id: "q-04",
    questionNumber: 4,
    scenario: "According to the principles of tapering for powerlifting, how should training volume and intensity be modulated during the final 7 to 10 days before a major competition?",
    options: [
      { key: "A", text: "Keep volume high at 85% to burn excess calories, while reducing intensity to 50%." },
      { key: "B", text: "Perform 1RM max tests every 48 hours to gauge CNS readiness." },
      { key: "C", text: "Sharply reduce training volume (by 50-60%) while maintaining high relative intensity (85-90%) on a few crisp singles." },
      { key: "D", text: "Completely stop all physical activity and stay in bed for 7 consecutive days." }
    ],
    correctAnswer: "C",
    explanation: "Volume is the primary driver of systemic fatigue, whereas intensity preserves neuromuscular recruitment and motor unit synchronisation. Slashing volume while maintaining intensity ensures fatigue dissipates while fitness is expressed.",
    topic: "Peaking & Supercompensation"
  },
  {
    id: "q-05",
    questionNumber: 5,
    scenario: "On the bench press, the Chief Center Referee gives the 'Start' command. The lifter lowers the bar, but during the ascent, the bar tilts sideways by 4 cm and briefly stops, but at no point does either side move downward. What is the correct referee decision?",
    options: [
      { key: "A", text: "No Lift - Blue Card (Bar tilt is strictly forbidden regardless of downward motion)." },
      { key: "B", text: "Good Lift - ⚪⚪⚪ (A momentary pause or lateral bar tilt is legal, provided there is zero downward motion)." },
      { key: "C", text: "No Lift - Yellow Card (Platform protocol violation)." },
      { key: "D", text: "Disqualification of the lifter from the meet." }
    ],
    correctAnswer: "B",
    explanation: "Under IPF Technical Rules, uneven extension or a temporary stall during ascent is permissible provided there is NO downward motion of the barbell or either hand.",
    topic: "IPF Technical Rules"
  },
  {
    id: "q-06",
    questionNumber: 6,
    scenario: "A lifter you coach approaches you asking about taking an over-the-counter 'fat burner' powder bought from an unverified local store that promises 'rapid water loss and intense focus'. What is your mandatory duty under the WADA Strict Liability principle?",
    options: [
      { key: "A", text: "Tell them to take half the recommended scoop to be safe." },
      { key: "B", text: "Stop them immediately, explain that grey-market supplements frequently contain unlisted banned stimulants (e.g. DMAA, Ephedrine) or diuretics, and that the athlete remains strictly liable for any positive test regardless of intent." },
      { key: "C", text: "Tell them to take it only during training and stop 24 hours before the competition." },
      { key: "D", text: "Ignore it since it is sold legally in a commercial shop." }
    ],
    correctAnswer: "B",
    explanation: "Under WADA and IPF Strict Liability, the presence of a prohibited substance in an athlete's specimen constitutes an anti-doping violation, regardless of whether ingestion was intentional or from a contaminated supplement.",
    topic: "Clean Sport & Anti-Doping"
  },
  {
    id: "q-07",
    questionNumber: 7,
    scenario: "On the squat, what anatomical landmark determines legal platform depth under IPF Rule 4.2.1?",
    options: [
      { key: "A", text: "The bottom of the hamstring must touch the calf muscle." },
      { key: "B", text: "The top of the surface of the legs at the hip crease must break below the top surface of the knee joint." },
      { key: "C", text: "The barbell must drop below the lifter's sternum level." },
      { key: "D", text: "The lifter's thighs must be exactly parallel with the floor." }
    ],
    correctAnswer: "B",
    explanation: "IPF Rule 4.2.1 states: 'The lifter must bend the knees and lower the body until the top surface of the legs at the hip joint is lower than the top of the knees.'",
    topic: "IPF Technical Rules"
  },
  {
    id: "q-08",
    questionNumber: 8,
    scenario: "Your lifter has a long femur to torso ratio (proportionately very long legs). During the squat, which technical cue will best preserve balance and bar path over the midfoot?",
    options: [
      { key: "A", text: "Force an entirely upright vertical spine like an Olympic front squat." },
      { key: "B", text: "Utilize a low-bar position with a slightly wider stance and deliberate forward torso angle to maintain the system centre of mass directly over the midfoot." },
      { key: "C", text: "Place the heels 5 cm off the floor on wood blocks." },
      { key: "D", text: "Look directly up at the ceiling throughout the entire movement." }
    ],
    correctAnswer: "B",
    explanation: "Lifters with longer femurs require more forward torso inclination to keep the barbell centered over the midfoot tripod. A low-bar placement shortens the resistance moment arm to the hip and optimizes leverage.",
    topic: "Platform Biomechanics"
  },
  {
    id: "q-09",
    questionNumber: 9,
    scenario: "On the 3rd and final deadlift of a national championship, lifter A and lifter B are tied on total, but lifter A has a lighter weigh-in bodyweight (82.4 kg vs 82.9 kg). Lifter B pulls 270 kg successfully. What weight does lifter A need to pull to take the gold medal?",
    options: [
      { key: "A", text: "272.5 kg (+2.5 kg higher total)" },
      { key: "B", text: "270 kg (Tie on total, winning by lighter bodyweight / higher IPF GL Points)" },
      { key: "C", text: "275 kg" },
      { key: "D", text: "267.5 kg" }
    ],
    correctAnswer: "B",
    explanation: "When totals are tied, the lifter with the lighter bodyweight achieves a higher IPF GL Point score and is awarded the higher standing. Lifter A only needs to equal the total.",
    topic: "Tactical Podium Math"
  },
  {
    id: "q-10",
    questionNumber: 10,
    scenario: "During the deadlift, the lifter locks out their knees and hips, but before the Chief Center Referee gives the 'Down' command, the lifter drops the barbell to the platform. What is the referee verdict?",
    options: [
      { key: "A", text: "Good Lift - The bar was locked out at the top." },
      { key: "B", text: "No Lift - 🔴🔴🔴 (Yellow Card: Failure to wait for referee's down command and maintaining control of the bar down to the platform)." },
      { key: "C", text: "Red Card for depth violation." },
      { key: "D", text: "Blue Card for downward motion." }
    ],
    correctAnswer: "B",
    explanation: "Under IPF Deadlift Rule 6.4, dropping the bar or failing to wait for the referee's command is a major platform failure resulting in No Lift (Yellow Card penalty).",
    topic: "IPF Technical Rules"
  }
];

export interface CertifiedCoachRecord {
  id: string;
  name: string;
  level: "LEVEL_1" | "LEVEL_2";
  levelTitle: string;
  licenseCode: string;
  state: string;
  city: string;
  clubAffiliation: string;
  verifiedYear: number;
  specialization: string;
  coachedAthletesCount: number;
  contactWhatsApp: string;
}

export const SEED_CERTIFIED_COACHES: CertifiedCoachRecord[] = [
  {
    id: "coach-01",
    name: "Akash Sharma",
    level: "LEVEL_2",
    levelTitle: "National High-Performance Coach & Master Tutor",
    licenseCode: "IPF-COACH-2026-0001",
    state: "Maharashtra",
    city: "Mumbai",
    clubAffiliation: "A&T Fitness & Nutrition Barbell Academy",
    verifiedYear: 2026,
    specialization: "National Peaking & SBD Biomechanics",
    coachedAthletesCount: 48,
    contactWhatsApp: "917043951377"
  },
  {
    id: "coach-02",
    name: "Tanvi Patel",
    level: "LEVEL_2",
    levelTitle: "National High-Performance Coach & Clinical Nutrition Director",
    licenseCode: "IPF-COACH-2026-0002",
    state: "Maharashtra",
    city: "Mumbai",
    clubAffiliation: "A&T Fitness & Nutrition Barbell Academy",
    verifiedYear: 2026,
    specialization: "Meet-Day Water Refeed & Women's Powerlifting",
    coachedAthletesCount: 39,
    contactWhatsApp: "917043951377"
  },
  {
    id: "coach-03",
    name: "Gurpreet Singh Sandhu",
    level: "LEVEL_2",
    levelTitle: "National Championship Technical Coach",
    licenseCode: "IPF-COACH-2026-0045",
    state: "Punjab",
    city: "Ludhiana",
    clubAffiliation: "Punjab Barbell Guild",
    verifiedYear: 2026,
    specialization: "Heavy Squat & Deadlift Loading",
    coachedAthletesCount: 22,
    contactWhatsApp: "917043951377"
  },
  {
    id: "coach-04",
    name: "Deepak Nambiar",
    level: "LEVEL_1",
    levelTitle: "Club Strength Coach",
    licenseCode: "IPF-COACH-2026-0112",
    state: "Kerala",
    city: "Kochi",
    clubAffiliation: "Malabar Iron Academy",
    verifiedYear: 2026,
    specialization: "Intermediate Linear Periodization & RPE Calibration",
    coachedAthletesCount: 14,
    contactWhatsApp: "917043951377"
  },
  {
    id: "coach-05",
    name: "Meenakshi Sundaram",
    level: "LEVEL_1",
    levelTitle: "Club Strength Coach",
    licenseCode: "IPF-COACH-2026-0119",
    state: "Tamil Nadu",
    city: "Chennai",
    clubAffiliation: "Chennai Barbell Society",
    verifiedYear: 2026,
    specialization: "Bench Press Arch Mechanics & Platform Warm-Ups",
    coachedAthletesCount: 11,
    contactWhatsApp: "917043951377"
  }
];

export interface IssuedCoachCredential {
  name: string;
  level: "LEVEL_1" | "LEVEL_2";
  levelTitle: string;
  score: string;
  ratificationDate: string;
}

const globalForAcademy = global as unknown as {
  issuedCoachLicenses?: Map<string, IssuedCoachCredential>;
};

if (!globalForAcademy.issuedCoachLicenses) {
  globalForAcademy.issuedCoachLicenses = new Map<string, IssuedCoachCredential>();
}

export const ISSUED_COACH_LICENSES = globalForAcademy.issuedCoachLicenses;
