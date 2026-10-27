export interface RefereeCase {
  id: number;
  lift: "Squat" | "Bench Press" | "Deadlift";
  title: string;
  lifterName: string;
  division: string;
  attemptWeight: string;
  attemptNumber: string;
  visualScenario: {
    badge: string;
    description: string;
    barbellTrajectory: "clean_ascent" | "downward_dip" | "uneven_extension" | "chest_sink" | "thigh_hitch" | "early_drop";
    faultVisualCue: string;
    visualHighlightColor: string; // e.g., 'red', 'blue', 'yellow', 'emerald'
  };
  correctDecision: "GOOD_LIFT" | "NO_LIFT";
  correctCard: "NONE" | "RED" | "BLUE" | "YELLOW";
  ruleCitation: {
    rulebookArticle: string;
    ruleTitle: string;
    verbatimRule: string;
  };
  technicalExplanation: string;
  refereeJuryBreakdown: {
    chiefRef: "WHITE" | "RED";
    leftSideRef: "WHITE" | "RED";
    rightSideRef: "WHITE" | "RED";
    consensus: string;
  };
}

export const REFEREE_EXAM_CASES: RefereeCase[] = [
  {
    id: 1,
    lift: "Squat",
    title: "Squat Depth Inspection (Side Profile)",
    lifterName: "Arjun Singh",
    division: "83.0 KG Division • Senior Men Raw",
    attemptWeight: "275.0 KG",
    attemptNumber: "3rd Attempt (National Record)",
    visualScenario: {
      badge: "Depth Parallel Violation",
      description: "Lifter descends smoothly but reverses momentum exactly when the hip crease is level with the uppermost part of the knee joint, failing to break the parallel horizontal plane.",
      barbellTrajectory: "downward_dip",
      faultVisualCue: "Hip crease did not descend below the superior surface of the knee cap.",
      visualHighlightColor: "red",
    },
    correctDecision: "NO_LIFT",
    correctCard: "RED",
    ruleCitation: {
      rulebookArticle: "IPF Technical Rules — Section: Causes for Disqualification of a Squat, Rule 3",
      ruleTitle: "Failure to Break Depth Plane",
      verbatimRule: "Failure to bend the knees and lower the body until the top surface of the legs at the hip joint is lower than the top of the knees.",
    },
    technicalExplanation: "In IPF technical rules, parallel is not sufficient. The top surface of the thigh at the hip crease must distinctly break below the horizontal plane defined by the top of the knee cap.",
    refereeJuryBreakdown: {
      chiefRef: "RED",
      leftSideRef: "RED",
      rightSideRef: "WHITE",
      consensus: "2-1 NO LIFT. Side referee 1 caught the shallow hip joint plane.",
    },
  },
  {
    id: 2,
    lift: "Squat",
    title: "Deep Squat with Explosive Ascent",
    lifterName: "Kavita Rao",
    division: "63.0 KG Division • Open Women Raw",
    attemptWeight: "172.5 KG",
    attemptNumber: "2nd Attempt",
    visualScenario: {
      badge: "Flawless Technical Execution",
      description: "Lifter waits motionless for the Chief Referee's 'Squat' command, breaks depth by 2 full inches below parallel, ascends continuously without lateral knee collapse, and stands erect until the 'Rack' signal.",
      barbellTrajectory: "clean_ascent",
      faultVisualCue: "Clear daylight between hip crease and knee line. Motionless start & finish.",
      visualHighlightColor: "emerald",
    },
    correctDecision: "GOOD_LIFT",
    correctCard: "NONE",
    ruleCitation: {
      rulebookArticle: "IPF Technical Rules — Section: Squat Rules of Performance, Articles 1-4",
      ruleTitle: "Valid Squat Performance",
      verbatimRule: "Upon receiving the Chief Referee's signal, the lifter must bend the knees... recover under control to an upright position with knees locked.",
    },
    technicalExplanation: "All criteria met: Motionless start under signal, undisputed depth, smooth ascent without downward hitching, locked knees at finish, and racked only after the 'Rack' signal.",
    refereeJuryBreakdown: {
      chiefRef: "WHITE",
      leftSideRef: "WHITE",
      rightSideRef: "WHITE",
      consensus: "3-0 UNANIMOUS GOOD LIFT.",
    },
  },
  {
    id: 3,
    lift: "Squat",
    title: "Bar Dip / Reversal During Upward Ascent",
    lifterName: "Rohan Kulkarni",
    division: "93.0 KG Division • Junior Men Raw",
    attemptWeight: "260.0 KG",
    attemptNumber: "3rd Attempt",
    visualScenario: {
      badge: "Downward Movement in Ascent",
      description: "Lifter reaches deep depth. Midway through the sticking point at half-ascent, the barbell visibly drops 1.5 cm downward before the lifter pushes through to lockout.",
      barbellTrajectory: "downward_dip",
      faultVisualCue: "Barbell reversed downward motion during the upward concentric phase.",
      visualHighlightColor: "blue",
    },
    correctDecision: "NO_LIFT",
    correctCard: "BLUE",
    ruleCitation: {
      rulebookArticle: "IPF Technical Rules — Causes for Disqualification of a Squat, Rule 5",
      ruleTitle: "Downward Movement During Ascent",
      verbatimRule: "Any downward movement of the barbell or change in the position of the hands on the bar during the ascent is prohibited.",
    },
    technicalExplanation: "Even though the lifter successfully locked out the weight, any downward motion of the barbell once the upward recovery has commenced constitutes an automatic foul (Blue Card).",
    refereeJuryBreakdown: {
      chiefRef: "RED",
      leftSideRef: "RED",
      rightSideRef: "RED",
      consensus: "3-0 UNANIMOUS NO LIFT. All three platform officials observed downward dip.",
    },
  },
  {
    id: 4,
    lift: "Bench Press",
    title: "Competition Bench Press with Distinct Pause",
    lifterName: "Tanvi Saxena",
    division: "57.0 KG Division • Open Women Raw",
    attemptWeight: "115.0 KG",
    attemptNumber: "3rd Attempt",
    visualScenario: {
      badge: "Masterclass Chest Pause",
      description: "Lifter receives handoff, holds bar motionless with locked elbows, lowers under control to sternum, maintains clear motionless pause, explodes upward upon 'Press' command, locks out evenly, and waits for 'Rack'.",
      barbellTrajectory: "clean_ascent",
      faultVisualCue: "Head, shoulders, buttocks remain rooted. 0.8s motionless chest pause.",
      visualHighlightColor: "emerald",
    },
    correctDecision: "GOOD_LIFT",
    correctCard: "NONE",
    ruleCitation: {
      rulebookArticle: "IPF Technical Rules — Section: Bench Press Rules of Performance, Rules 1-5",
      ruleTitle: "Valid Bench Press Execution",
      verbatimRule: "The bar must be lowered to the chest/sternum, held motionless with a distinct pause, and pressed to straight arm's length with elbows locked simultaneously.",
    },
    technicalExplanation: "Flawless lift. No heave into the ribcage, buttocks stayed fully in contact with the leather bench pad, feet remained flat, and elbows locked out simultaneously.",
    refereeJuryBreakdown: {
      chiefRef: "WHITE",
      leftSideRef: "WHITE",
      rightSideRef: "WHITE",
      consensus: "3-0 UNANIMOUS GOOD LIFT.",
    },
  },
  {
    id: 5,
    lift: "Bench Press",
    title: "Heaving / Sinking Bar into Sternum After Pause",
    lifterName: "Devendra Patil",
    division: "105.0 KG Division • Senior Men Raw",
    attemptWeight: "205.0 KG",
    attemptNumber: "2nd Attempt",
    visualScenario: {
      badge: "Heave & Chest Depression Violation",
      description: "Lifter pauses the bar on the chest. Upon hearing 'Press', the lifter allows the bar to sink deeper into the chest ribcage by 2 cm and bounces off the sternum to gain upward momentum.",
      barbellTrajectory: "chest_sink",
      faultVisualCue: "Bar sank deeper into chest after motionless pause to create artificial bounce.",
      visualHighlightColor: "blue",
    },
    correctDecision: "NO_LIFT",
    correctCard: "BLUE",
    ruleCitation: {
      rulebookArticle: "IPF Technical Rules — Causes for Disqualification of a Bench Press, Rule 3",
      ruleTitle: "Sinking or Bouncing Barbell",
      verbatimRule: "Bouncing or heaving the bar off the chest, or allowing the bar to sink into the chest after receiving the Chief Referee's signal to press.",
    },
    technicalExplanation: "Sinking the bar into the chest after the Chief Referee's 'Press' signal or creating an elastic bounce off the ribs invalidates the motionless pause requirement and receives a Blue Card.",
    refereeJuryBreakdown: {
      chiefRef: "RED",
      leftSideRef: "RED",
      rightSideRef: "RED",
      consensus: "3-0 UNANIMOUS NO LIFT. Chief and side referees flagged deliberate chest bounce.",
    },
  },
  {
    id: 6,
    lift: "Bench Press",
    title: "Buttocks Lifting Off Bench Pad",
    lifterName: "Siddharth Mehra",
    division: "83.0 KG Division • Open Men Raw",
    attemptWeight: "185.0 KG",
    attemptNumber: "3rd Attempt",
    visualScenario: {
      badge: "Anatomical Contact Infraction",
      description: "During maximum concentric press effort, the lifter creates aggressive leg drive that elevates the gluteal muscles 1 inch off the bench pad before returning to the pad at lockout.",
      barbellTrajectory: "downward_dip",
      faultVisualCue: "Buttocks separated completely from the surface of the bench pad during the press.",
      visualHighlightColor: "yellow",
    },
    correctDecision: "NO_LIFT",
    correctCard: "YELLOW",
    ruleCitation: {
      rulebookArticle: "IPF Technical Rules — Causes for Disqualification of a Bench Press, Rule 4",
      ruleTitle: "Loss of Bench Contact",
      verbatimRule: "Any change in the elected lifting position during the lift proper (i.e. head, shoulders, or buttocks rising from the bench, or lateral movement of the hands on the bar).",
    },
    technicalExplanation: "The IPF enforces strict 5-point contact (head, upper back/shoulders, buttocks, and both feet). Loss of contact between buttocks and bench pad constitutes an infraction tagged with Yellow Card.",
    refereeJuryBreakdown: {
      chiefRef: "RED",
      leftSideRef: "RED",
      rightSideRef: "WHITE",
      consensus: "2-1 NO LIFT. Side referee on the lifter's hip side clearly spotted air under buttocks.",
    },
  },
  {
    id: 7,
    lift: "Bench Press",
    title: "Uneven Extension with Delayed Left Lockout",
    lifterName: "Gurpreet Singh",
    division: "120.0 KG Division • Masters 1 Raw",
    attemptWeight: "192.5 KG",
    attemptNumber: "1st Attempt",
    visualScenario: {
      badge: "Asymmetrical Lockout Violation",
      description: "Right arm locks out immediately while left arm struggles at 80% extension. The lifter holds the right arm locked, pauses, and pushes the left arm forward into final lockout.",
      barbellTrajectory: "uneven_extension",
      faultVisualCue: "Severely uneven extension; right elbow locked while left remained bent for >1 second.",
      visualHighlightColor: "blue",
    },
    correctDecision: "NO_LIFT",
    correctCard: "BLUE",
    ruleCitation: {
      rulebookArticle: "IPF Technical Rules — Causes for Disqualification of a Bench Press, Rule 5",
      ruleTitle: "Uneven or Incomplete Lockout",
      verbatimRule: "Uneven extension of the arms during the lift proper or at the completion of the lift.",
    },
    technicalExplanation: "Both elbows must reach full extension simultaneously without excessive asymmetry or one arm remaining stationary while the other is pressed out.",
    refereeJuryBreakdown: {
      chiefRef: "RED",
      leftSideRef: "RED",
      rightSideRef: "RED",
      consensus: "3-0 UNANIMOUS NO LIFT. Pronounced uneven lockout across all referee angles.",
    },
  },
  {
    id: 8,
    lift: "Deadlift",
    title: "Flawless Sumo Deadlift Platform Lockout",
    lifterName: "Ananya Deshmukh",
    division: "52.0 KG Division • Junior Women Raw",
    attemptWeight: "195.0 KG",
    attemptNumber: "3rd Attempt (National Record)",
    visualScenario: {
      badge: "Picture-Perfect Deadlift",
      description: "Lifter initiates lift from the floor, pulls bar upward in one uninterrupted velocity curve, locks knees straight, erects torso with shoulders pulled erect, holds motionless, and lowers under control on 'Down' command.",
      barbellTrajectory: "clean_ascent",
      faultVisualCue: "Zero thigh contact support. Full erect posture. Hands gripped bar down to floor.",
      visualHighlightColor: "emerald",
    },
    correctDecision: "GOOD_LIFT",
    correctCard: "NONE",
    ruleCitation: {
      rulebookArticle: "IPF Technical Rules — Section: Deadlift Rules of Performance, Rules 1-3",
      ruleTitle: "Valid Deadlift Performance",
      verbatimRule: "The lifter must pull upward continuously until standing erect with knees locked and shoulders pulled back... return the bar to the platform with both hands maintaining control.",
    },
    technicalExplanation: "Textbook deadlift. Continuous ascent without hitching, erect posture at lockout, knees straight, and hands stayed on the bar all the way until touching the platform.",
    refereeJuryBreakdown: {
      chiefRef: "WHITE",
      leftSideRef: "WHITE",
      rightSideRef: "WHITE",
      consensus: "3-0 UNANIMOUS GOOD LIFT. Ratified as New National Record!",
    },
  },
  {
    id: 9,
    lift: "Deadlift",
    title: "Thigh Hitching & Ramping During Lockout",
    lifterName: "Manpreet Sandhu",
    division: "105.0 KG Division • Open Men Raw",
    attemptWeight: "320.0 KG",
    attemptNumber: "3rd Attempt",
    visualScenario: {
      badge: "Ramping on Quads Infraction",
      description: "As the bar reaches mid-thigh, the lifter bends both knees forward under the bar, rests the barbell on the thighs, and secondary jerks upward to complete hip extension.",
      barbellTrajectory: "thigh_hitch",
      faultVisualCue: "Knees rebent under barbell; barbell weight was supported by anterior thighs.",
      visualHighlightColor: "blue",
    },
    correctDecision: "NO_LIFT",
    correctCard: "BLUE",
    ruleCitation: {
      rulebookArticle: "IPF Technical Rules — Causes for Disqualification of a Deadlift, Rule 2",
      ruleTitle: "Supporting Barbell on Thighs (Hitching)",
      verbatimRule: "Supporting the barbell on the thighs during the performance of the lift. If the bar edges up the thighs but is not supported, this is not reason for disqualification.",
    },
    technicalExplanation: "Re-bending the knees under the barbell to rest the shaft on the quadriceps creates mechanical support and constitutes hitching/ramping, which is strictly prohibited (Blue Card).",
    refereeJuryBreakdown: {
      chiefRef: "RED",
      leftSideRef: "RED",
      rightSideRef: "RED",
      consensus: "3-0 UNANIMOUS NO LIFT. Blatant thigh support flagged by all 3 referees.",
    },
  },
  {
    id: 10,
    lift: "Deadlift",
    title: "Dropping Barbell from Hands Before Platform Contact",
    lifterName: "Rajesh Kumar",
    division: "83.0 KG Division • Masters 2 Raw",
    attemptWeight: "245.0 KG",
    attemptNumber: "2nd Attempt",
    visualScenario: {
      badge: "Premature Release Infraction",
      description: "Lifter completes a valid lockout and waits for the Chief Referee's 'Down' signal. Upon hearing 'Down', the lifter opens both hands at knee height, dropping the bar freely to the floor.",
      barbellTrajectory: "early_drop",
      faultVisualCue: "Hands opened and released barbell while it was still 18 inches above platform.",
      visualHighlightColor: "yellow",
    },
    correctDecision: "NO_LIFT",
    correctCard: "YELLOW",
    ruleCitation: {
      rulebookArticle: "IPF Technical Rules — Causes for Disqualification of a Deadlift, Rule 5",
      ruleTitle: "Releasing Barbell from Hands",
      verbatimRule: "Allowing the barbell to return to the platform without maintaining the control with both hands (i.e. releasing the barbell from the palm of the hands).",
    },
    technicalExplanation: "Even though the lifter received the 'Down' signal, the barbell must be guided all the way down until it contacts the platform. Dropping or releasing the bar prematurely is an automatic Yellow Card foul.",
    refereeJuryBreakdown: {
      chiefRef: "RED",
      leftSideRef: "RED",
      rightSideRef: "RED",
      consensus: "3-0 UNANIMOUS NO LIFT. Disqualified for releasing barbell before platform contact.",
    },
  },
];
