"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scale, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Dumbbell, 
  ShieldCheck, 
  Info, 
  ArrowRight,
  BookOpen,
  Sparkles
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { PageNavigation } from "@/components/ui/PageNavigation";

const WHATSAPP_PHONE = "917043951377";

interface LiftCriteria {
  name: string;
  badge: string;
  commands: { name: string; trigger: string }[];
  keyRules: string[];
  fouls: string[];
  depthVisualNote: string;
}

const LIFTS: Record<string, LiftCriteria> = {
  squat: {
    name: "Squat Criteria",
    badge: "First Discipline",
    commands: [
      { name: '"Squat"', trigger: "Given once lifter is motionless, knees locked, bar positioned on back." },
      { name: '"Rack"', trigger: "Given once lifter has fully completed ascent and locked both knees." },
    ],
    keyRules: [
      "The lifter must bend the knees and lower the body until the top surface of the legs at the hip joint is lower than the top of the knees.",
      "Only one descent attempt is permitted per command.",
      "The lifter must recover under control without stepping or bouncing.",
    ],
    fouls: [
      "Failure to bend knees and lower body until hip crease is below top of knees (Depth Red Light).",
      "Any downward movement of the barbell during the ascent.",
      "Stepping backward or forward or moving feet laterally during the lift.",
      "Touching elbows or upper arms with the legs.",
      "Racking before the Chief Referee's 'Rack' command.",
    ],
    depthVisualNote: "Valid Depth: Hip crease strictly below the uppermost part of the knee joint.",
  },
  bench: {
    name: "Bench Press Criteria",
    badge: "Second Discipline",
    commands: [
      { name: '"Start"', trigger: "Given when bar is motionless at straight arm's length after handoff." },
      { name: '"Press"', trigger: "Given when bar is held motionless on the chest/sternum with clear visible pause." },
      { name: '"Rack"', trigger: "Given when both arms are fully locked out and bar is motionless." },
    ],
    keyRules: [
      "Head, shoulders, and buttocks must remain in continuous contact with the bench surface throughout the lift.",
      "Feet must remain flat on the platform without lateral sliding.",
      "A distinct, motionless pause on the chest is mandatory before the 'Press' signal.",
    ],
    fouls: [
      "Bouncing or heaving the barbell into the ribcage after the motionless pause.",
      "Any downward movement of the bar during the upward press attempt.",
      "Uneven or incomplete lockout of the elbows at the completion of the lift.",
      "Lifting buttocks off the bench pad at any point during the lift.",
      "Racking the barbell before the Chief Referee's 'Rack' command.",
    ],
    depthVisualNote: "Rule: Zero bounce. Full motionless chest pause required.",
  },
  deadlift: {
    name: "Deadlift Criteria",
    badge: "Third & Final Discipline",
    commands: [
      { name: '"Down"', trigger: "Given once lifter has locked knees and shoulders back, standing erect." },
    ],
    keyRules: [
      "The barbell must be laid horizontally in front of lifter's feet and gripped with two hands.",
      "The lifter must pull upward continuously in a single motion until standing erect.",
      "On completion, knees must be locked straight and shoulders pulled backward.",
      "The bar must be returned to the platform under control with hands maintaining contact.",
    ],
    fouls: [
      "Hitching or supporting the bar on the thighs during the upward pull.",
      "Any downward movement of the barbell before reaching the final lockout position.",
      "Stepping backward or forward, or rocking feet during the lift.",
      "Dropping or releasing the bar from hands before it contacts the platform.",
      "Failure to lock the knees completely straight or failure to stand erect.",
    ],
    depthVisualNote: "Rule: Smooth continuous ascent. Strict ban on thigh ramping or hitching.",
  },
};

const SIMULATOR_SCENARIOS = [
  {
    title: "1. Perfect IPF Legal Squat",
    lift: "Squat",
    lights: [true, true, true],
    decision: "GOOD LIFT (3 WHITE LIGHTS)",
    verdict: "Valid depth passed, clean single ascent, motionless start and finish under commands.",
  },
  {
    title: "2. Squat Missed Depth by 1 Inch",
    lift: "Squat",
    lights: [false, false, true],
    decision: "NO LIFT (2 RED LIGHTS)",
    verdict: "Chief Referee and Left Side Referee gave red lights: Hip crease did not break parallel plane with top of knee.",
  },
  {
    title: "3. Bench Press Heaved / Bounced off Chest",
    lift: "Bench Press",
    lights: [false, false, false],
    decision: "NO LIFT (3 RED LIGHTS)",
    verdict: "Unanimous foul: Barbell was visibly sunk and bounced into sternum after the motionless pause command.",
  },
  {
    title: "4. Deadlift Thigh Hitch / Ramping",
    lift: "Deadlift",
    lights: [false, false, true],
    decision: "NO LIFT (2 RED LIGHTS)",
    verdict: "Lifter supported barbell on thighs and secondary hitched to complete lockout without continuous ascent.",
  },
];

export default function TechnicalRulesPage() {
  const [selectedLift, setSelectedLift] = useState<"squat" | "bench" | "deadlift">("squat");
  const [scenarioIdx, setScenarioIdx] = useState(0);

  const currentLift = LIFTS[selectedLift];
  const currentScenario = SIMULATOR_SCENARIOS[scenarioIdx];

  return (
    <div className="min-h-screen bg-gym-black text-white pt-32 sm:pt-36 lg:pt-40 pb-20 relative overflow-hidden">
      
      {/* ── Ambient Background Glows ── */}
      <motion.div 
        animate={{ y: [0, -25, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" 
      />
      <motion.div 
        animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[130px]" 
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        
        {/* ── Breadcrumb & Navigation ── */}
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "IPF Rules", href: "/rules" },
            { label: "Technical Rules & Criteria" },
          ]}
          badge="Ratified Standards"
          className="mb-8"
        />

        {/* ── Hero ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-[0_0_20px_rgba(230,80,27,0.2)]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Official Technical Rulebook</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-xl"
          >
            IPF Technical <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.5)]">
              Competition Rules
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal"
          >
            Master the official criteria for Squat, Bench Press, and Deadlift. Coached and judged strictly according to the International Powerlifting Federation (IPF) technical rulebook.
          </motion.p>
        </div>

        {/* ── Interactive Referee Simulator Callout ── */}
        <div className="max-w-3xl mx-auto mb-12">
          <Link
            href="/rules/referee-exam"
            className="group relative flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border-2 border-gym-primary/40 bg-gradient-to-r from-red-950/40 via-black to-gym-primary/15 shadow-[0_0_35px_rgba(230,80,27,0.25)] transition-all hover:scale-[1.01] hover:border-gym-primary hover:shadow-[0_0_50px_rgba(230,80,27,0.4)]"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gym-primary/20 text-gym-primary border border-gym-primary/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(230,80,27,0.4)]">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gym-primary bg-gym-primary/15 px-2.5 py-0.5 rounded-full border border-gym-primary/30">
                    INTERACTIVE EXAM
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    CAT. 2 ACCREDITATION
                  </span>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wide text-white mt-1 group-hover:text-gym-primary transition-colors">
                  Official Technical Referee Simulator
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Test your 3-second White ⚪ / Red 🔴 light platform decision speed and earn your official referee certificate pass.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-gym-primary px-5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-white shadow-lg shrink-0 group-hover:bg-[#ff6a33] transition-colors">
              <span>Start Exam</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        {/* ── Lift Discipline Selector ── */}
        <div className="flex items-center justify-center gap-3 mb-10 overflow-x-auto pb-2">
          {[
            { id: "squat", label: "1. Squat Standards", icon: Dumbbell },
            { id: "bench", label: "2. Bench Press Standards", icon: Scale },
            { id: "deadlift", label: "3. Deadlift Standards", icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = selectedLift === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedLift(item.id as any)}
                className={`flex items-center gap-2 rounded-full px-7 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-gym-primary text-white shadow-[0_0_20px_rgba(230,80,27,0.5)] scale-105"
                    : "border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/25"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Lift Breakdown Card ── */}
        <motion.div
          key={selectedLift}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-10 backdrop-blur-xl shadow-2xl mb-14"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">
                {currentLift.badge}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white">
                {currentLift.name}
              </h2>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{currentLift.depthVisualNote}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Referee Commands */}
            <div className="space-y-4">
              <h4 className="font-heading text-lg font-bold uppercase text-white flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gym-primary" />
                <span>Referee Voice Commands</span>
              </h4>
              <div className="space-y-3">
                {currentLift.commands.map((cmd, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-heading text-base font-bold text-gym-primary">{cmd.name}</div>
                    <div className="text-xs text-gray-300 mt-1">{cmd.trigger}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Criteria */}
            <div className="space-y-4">
              <h4 className="font-heading text-lg font-bold uppercase text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Mandatory Execution Rules</span>
              </h4>
              <div className="space-y-3">
                {currentLift.keyRules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-gray-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Light Disqualifications */}
            <div className="space-y-4">
              <h4 className="font-heading text-lg font-bold uppercase text-white flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Common Red Light Fouls</span>
              </h4>
              <div className="space-y-2.5">
                {currentLift.fouls.map((foul, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-gray-300">
                    <span className="text-red-400 font-bold shrink-0">✕</span>
                    <span>{foul}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Interactive 3-Light Referee Simulator ── */}
        <div className="rounded-3xl border border-white/10 bg-[#120402]/90 p-6 sm:p-10 backdrop-blur-xl mb-14 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Interactive Decision Simulator</span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Official 3-Referee Light Board
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Select an attempt scenario below to observe how the Chief Referee and two Side Referees cast their decision on the competition platform.
            </p>
          </div>

          {/* Scenario Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
            {SIMULATOR_SCENARIOS.map((sc, i) => (
              <button
                key={i}
                onClick={() => setScenarioIdx(i)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  scenarioIdx === i
                    ? "bg-white text-black font-black shadow-lg scale-105"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {sc.title}
              </button>
            ))}
          </div>

          {/* Simulated Light Board Display */}
          <div className="mx-auto max-w-md rounded-2xl border border-white/20 bg-[#080201] p-6 text-center shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              Platform Attempt Decision Board
            </div>

            {/* The 3 Lights */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 mb-6">
              {currentScenario.lights.map((isWhite, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className={`h-16 w-16 rounded-full border-4 transition-all duration-300 flex items-center justify-center font-heading font-bold text-xs ${
                      isWhite
                        ? "border-white bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.9)]"
                        : "border-red-600 bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-pulse"
                    }`}
                  >
                    {isWhite ? "WHITE" : "RED"}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {idx === 0 ? "Left Judge" : idx === 1 ? "Head Judge" : "Right Judge"}
                  </span>
                </div>
              ))}
            </div>

            {/* Verdict */}
            <div className="pt-4 border-t border-white/10">
              <div className={`font-heading text-lg font-bold uppercase ${
                currentScenario.decision.includes("GOOD LIFT") ? "text-emerald-400" : "text-red-400"
              }`}>
                {currentScenario.decision}
              </div>
              <div className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
                {currentScenario.verdict}
              </div>
            </div>
          </div>
        </div>

        {/* ── Weigh-In Protocol ── */}
        <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Pre-Competition Procedure</div>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mb-4">
            Official 2-Hour Weigh-In Protocol
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="font-heading text-base font-bold text-white">1. Timeline & Lot Order</div>
              <p className="text-xs text-gray-300 mt-2">
                Weigh-ins commence precisely 2 hours prior to the session start time. Lifters weigh in according to the official lot number drawn during technical briefing.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="font-heading text-base font-bold text-white">2. Weigh-in Apparel</div>
              <p className="text-xs text-gray-300 mt-2">
                Lifters must weigh in wearing only underwear (or nude behind private screens if desired to make weight). No socks, jewelry, or footwear permitted on the calibrated digital scale.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="font-heading text-base font-bold text-white">3. Opening Attempts & Rack Heights</div>
              <p className="text-xs text-gray-300 mt-2">
                During weigh-in, lifters must submit their first attempt for Squat and Bench Press, as well as measured rack heights and safety pin numbers.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom Coach Consultation CTA ── */}
        <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1b0603] to-[#0c0201] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Platform Technique Audit</div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Want Your Squat, Bench & Deadlift Form Certified?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Send your lifting videos to Coaches Akash & Tanvi on WhatsApp for a complete frame-by-frame technical breakdown under official IPF standards.
            </p>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coaches Akash & Tanvi, I want to send my lift video for an official IPF form check and technical feedback.")}`}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-7 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-105 transition-all cursor-pointer shrink-0"
          >
            <WhatsAppIcon variant="badge" className="h-6 w-6" />
            <span>Send Video on WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
}
