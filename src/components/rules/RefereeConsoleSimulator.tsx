"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefereeCase } from "@/data/referee-exam-cases";
import { refereeAudio } from "@/lib/referee-audio";
import { 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  VolumeX, 
  Timer, 
  HelpCircle, 
  Award, 
  ArrowRight,
  BookOpen,
  Info,
  Sparkles,
  RotateCcw
} from "lucide-react";

interface RefereeConsoleProps {
  scenario: RefereeCase;
  currentIndex: number;
  totalCases: number;
  onDecisionSubmit: (result: {
    caseId: number;
    userDecision: "GOOD_LIFT" | "NO_LIFT" | "TIMEOUT";
    userCard: "NONE" | "RED" | "BLUE" | "YELLOW";
    isCorrect: boolean;
  }) => void;
  onNextCase: () => void;
  isLastCase: boolean;
}

export default function RefereeConsoleSimulator({
  scenario,
  currentIndex,
  totalCases,
  onDecisionSubmit,
  onNextCase,
  isLastCase,
}: RefereeConsoleProps) {
  // Timer & audio states
  const [timerMode, setTimerMode] = useState<"10s" | "3s" | "untimed">("10s");
  const [timeLeft, setTimeLeft] = useState(10.0);
  const [timerActive, setTimerActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // User input states
  const [userDecision, setUserDecision] = useState<"GOOD_LIFT" | "NO_LIFT" | "TIMEOUT" | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<"NONE" | "RED" | "BLUE" | "YELLOW">("NONE");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getMaxTime = (mode: "10s" | "3s" | "untimed") => {
    if (mode === "3s") return 3.0;
    if (mode === "untimed") return 999;
    return 10.0;
  };

  // Reset console whenever the scenario changes or mode changes
  useEffect(() => {
    setTimeLeft(getMaxTime(timerMode));
    setTimerActive(timerMode !== "untimed");
    setUserDecision(null);
    setShowCardModal(false);
    setSelectedCard("NONE");
    setSubmitted(false);
    setIsCorrect(false);
  }, [scenario.id, timerMode]);

  // Sync sound toggle with synthesizer
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    refereeAudio.enabled = nextState;
  };

  // Decision Countdown Timer
  useEffect(() => {
    if (!timerActive || submitted || timerMode === "untimed") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current!);
          setTimerActive(false);
          handleTimeout();
          return 0;
        }
        if (prev <= 1.5 && prev > 1.4) {
          refereeAudio.playCountdownTick();
        }
        return parseFloat((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, submitted, timerMode]);

  // Handle Timeout (Referees who hesitate get timed out)
  const handleTimeout = () => {
    refereeAudio.playTimeoutHorn();
    setUserDecision("TIMEOUT");
    setSubmitted(true);
    setIsCorrect(false);
    onDecisionSubmit({
      caseId: scenario.id,
      userDecision: "TIMEOUT",
      userCard: "NONE",
      isCorrect: false,
    });
  };

  // User presses ⚪ White Light (Good Lift)
  const handleWhiteLightClick = () => {
    if (submitted) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);

    refereeAudio.playWhiteLightSound();
    setUserDecision("GOOD_LIFT");
    setSelectedCard("NONE");
    setSubmitted(true);

    const correct = scenario.correctDecision === "GOOD_LIFT";
    setIsCorrect(correct);

    onDecisionSubmit({
      caseId: scenario.id,
      userDecision: "GOOD_LIFT",
      userCard: "NONE",
      isCorrect: correct,
    });
  };

  // User presses 🔴 Red Light (No Lift) -> Open Card Selector
  const handleRedLightClick = () => {
    if (submitted) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);

    refereeAudio.playRedLightSound();
    setUserDecision("NO_LIFT");
    setShowCardModal(true);
  };

  // Confirm Card Selection for Red Light
  const handleConfirmCard = (card: "RED" | "BLUE" | "YELLOW") => {
    setShowCardModal(false);
    setSelectedCard(card);
    setSubmitted(true);

    const correct = scenario.correctDecision === "NO_LIFT" && scenario.correctCard === card;
    setIsCorrect(correct);

    onDecisionSubmit({
      caseId: scenario.id,
      userDecision: "NO_LIFT",
      userCard: card,
      isCorrect: correct,
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* ── Realistic Hardware Referee Electronic Console Box ── */}
      <div className="relative rounded-3xl border-2 border-white/15 bg-gradient-to-b from-[#18181b] via-[#101012] to-[#080809] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Hardware Metallic Screws in Corners */}
        <div className="absolute top-3 left-3 h-2.5 w-2.5 rounded-full bg-gray-500 border border-gray-400 opacity-60" />
        <div className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-gray-500 border border-gray-400 opacity-60" />
        <div className="absolute bottom-3 left-3 h-2.5 w-2.5 rounded-full bg-gray-500 border border-gray-400 opacity-60" />
        <div className="absolute bottom-3 right-3 h-2.5 w-2.5 rounded-full bg-gray-500 border border-gray-400 opacity-60" />

        {/* Console Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-3.5 w-3.5 rounded-full bg-gym-primary shadow-[0_0_12px_rgba(230,80,27,0.8)] animate-pulse" />
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-white block">
                IPF PLATFORM JURY CONSOLE • CAT. 2
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Case #{scenario.id} of {totalCases} — Lifter: {scenario.lifterName} ({scenario.division})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer Mode Selector */}
            <div className="hidden sm:flex items-center bg-black/60 rounded-full border border-white/10 p-0.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setTimerMode("10s")}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  timerMode === "10s" ? "bg-gym-primary text-white font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                10s Exam
              </button>
              <button
                type="button"
                onClick={() => setTimerMode("3s")}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  timerMode === "3s" ? "bg-gym-primary text-white font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                3s Pro
              </button>
              <button
                type="button"
                onClick={() => setTimerMode("untimed")}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  timerMode === "untimed" ? "bg-gym-primary text-white font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                Untimed
              </button>
            </div>

            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={toggleSound}
              className={`rounded-full p-2 border transition-colors ${
                soundEnabled 
                  ? "border-gym-primary/40 bg-gym-primary/15 text-gym-primary" 
                  : "border-white/10 bg-white/5 text-gray-400"
              }`}
              title={soundEnabled ? "Mute Audio Effects" : "Enable Audio Effects"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Decision Countdown Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Timer className="w-3.5 h-3.5 text-gym-primary" />
              {timerMode === "untimed" ? "Untimed Study Mode" : "Decision Countdown"}
            </span>
            <span className={`font-black text-sm ${
              timerMode === "untimed" 
                ? "text-emerald-400" 
                : timeLeft <= 2.0 
                ? "text-red-500 animate-pulse" 
                : timeLeft <= 5.0 
                ? "text-yellow-400" 
                : "text-emerald-400"
            }`}>
              {timerMode === "untimed" ? "♾️ UNTIMED" : `${timeLeft.toFixed(1)}s`}
            </span>
          </div>

          {timerMode !== "untimed" && (
            <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
              <motion.div
                className={`h-full rounded-full ${
                  timeLeft <= 2.0 
                    ? "bg-gradient-to-r from-red-600 to-red-500" 
                    : timeLeft <= 5.0 
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400" 
                    : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                }`}
                style={{ width: `${(timeLeft / (timerMode === '3s' ? 3.0 : 10.0)) * 100}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          )}
        </div>

        {/* Dual Primary Push Buttons: ⚪ WHITE LIGHT vs 🔴 RED LIGHT */}
        {!submitted ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* White Light Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleWhiteLightClick}
              disabled={submitted}
              className="group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-white/30 bg-gradient-to-b from-white/20 via-white/5 to-black text-white hover:border-white hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-white/80 bg-white shadow-[0_0_30px_rgba(255,255,255,0.8)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <div className="h-8 w-8 rounded-full bg-white/40" />
              </div>
              <span className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                WHITE LIGHT
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mt-1">
                GOOD LIFT (VALID)
              </span>
            </motion.button>

            {/* Red Light Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleRedLightClick}
              disabled={submitted}
              className="group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-red-500/40 bg-gradient-to-b from-red-600/20 via-red-950/20 to-black text-white hover:border-red-500 hover:shadow-[0_0_35px_rgba(239,68,68,0.5)] transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-red-500 bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.8)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <div className="h-8 w-8 rounded-full bg-white/20" />
              </div>
              <span className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                RED LIGHT
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-red-400 mt-1">
                NO LIFT (DISQUALIFIED)
              </span>
            </motion.button>

          </div>
        ) : (
          /* Submitted State: Show Verdict & Platform Consensus */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Feedback Banner */}
            <div className={`rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isCorrect
                ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                : "bg-red-500/10 border-red-500/40 text-white"
            }`}>
              <div className="flex items-start gap-3.5">
                <div className={`mt-0.5 rounded-full p-1.5 shrink-0 ${
                  isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-lg font-bold uppercase tracking-wider">
                      {isCorrect ? "CORRECT JURY CALL!" : "INCORRECT REFEREE CALL"}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isCorrect ? "bg-emerald-500 text-black" : "bg-red-500 text-white"
                    }`}>
                      {isCorrect ? "+1 POINT" : "0 POINTS"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium mt-1">
                    {userDecision === "TIMEOUT" ? (
                      "Decision timed out! In official IPF platform regulations, referees must vote within 3 seconds."
                    ) : userDecision === "GOOD_LIFT" ? (
                      `You gave WHITE LIGHT. Official Decision: ${scenario.correctDecision === "GOOD_LIFT" ? "GOOD LIFT" : "NO LIFT"}.`
                    ) : (
                      `You gave RED LIGHT (${selectedCard} CARD). Official Decision: ${scenario.correctDecision} (${scenario.correctCard} CARD).`
                    )}
                  </p>
                </div>
              </div>

              {/* 3 Referee Platform Lights */}
              <div className="bg-black/60 rounded-xl border border-white/10 p-3 shrink-0">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block text-center mb-1.5">
                  Platform Jury Panel
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full border-2 ${
                      scenario.refereeJuryBreakdown.leftSideRef === "WHITE" 
                        ? "bg-white border-white shadow-[0_0_10px_white]" 
                        : "bg-red-600 border-red-500 shadow-[0_0_10px_red]"
                    }`} />
                    <span className="text-[8px] text-gray-400 mt-1">Side 1</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full border-2 ${
                      scenario.refereeJuryBreakdown.chiefRef === "WHITE" 
                        ? "bg-white border-white shadow-[0_0_15px_white]" 
                        : "bg-red-600 border-red-500 shadow-[0_0_15px_red]"
                    }`} />
                    <span className="text-[8px] font-bold text-gym-primary mt-1">Chief</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full border-2 ${
                      scenario.refereeJuryBreakdown.rightSideRef === "WHITE" 
                        ? "bg-white border-white shadow-[0_0_10px_white]" 
                        : "bg-red-600 border-red-500 shadow-[0_0_10px_red]"
                    }`} />
                    <span className="text-[8px] text-gray-400 mt-1">Side 2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Technical Rulebook Citation */}
            <div className="rounded-2xl border border-gym-primary/30 bg-[#120402] p-5">
              <div className="flex items-center gap-2 text-gym-primary font-bold text-xs uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" />
                <span>{scenario.ruleCitation.rulebookArticle}</span>
              </div>
              <h4 className="text-white font-heading font-bold text-sm uppercase tracking-wide mb-1">
                {scenario.ruleCitation.ruleTitle}
              </h4>
              <p className="text-xs text-gray-300 font-mono italic bg-black/40 p-3 rounded-lg border border-white/5 mb-3">
                "{scenario.ruleCitation.verbatimRule}"
              </p>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                <span className="text-white font-bold">Technical Analysis: </span>
                {scenario.technicalExplanation}
              </p>
            </div>

            {/* Next Attempt Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onNextCase}
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(230,80,27,0.7)]"
              >
                <span>{isLastCase ? "Complete Examination & View Scorecard" : "Next Platform Attempt"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Official IPF Infraction Card Selector Modal (for Red Lights) ── */}
      <AnimatePresence>
        {showCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-red-500/40 bg-[#120402] p-6 sm:p-8 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="h-10 w-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-2 border border-red-500/40">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold uppercase text-white">
                  Assign IPF Infraction Card
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  In IPF international matches, referees must assign the official color card designating the cause for NO LIFT.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Red Card */}
                <button
                  type="button"
                  onClick={() => handleConfirmCard("RED")}
                  className="group flex items-start gap-3.5 p-4 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-900/30 hover:border-red-500 text-left transition-all cursor-pointer"
                >
                  <div className="h-9 w-6 rounded bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.6)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-heading text-sm font-bold uppercase tracking-wider text-red-400 block group-hover:text-red-300">
                      RED CARD — DEPTH / ANATOMICAL EXTENSION
                    </span>
                    <span className="text-[11px] text-gray-300 leading-tight block mt-0.5">
                      Failure to break depth parallel (Squat) or failure to stand erect with locked knees at lockout.
                    </span>
                  </div>
                </button>

                {/* Blue Card */}
                <button
                  type="button"
                  onClick={() => handleConfirmCard("BLUE")}
                  className="group flex items-start gap-3.5 p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 hover:bg-blue-900/30 hover:border-blue-500 text-left transition-all cursor-pointer"
                >
                  <div className="h-9 w-6 rounded bg-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.6)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-heading text-sm font-bold uppercase tracking-wider text-blue-400 block group-hover:text-blue-300">
                      BLUE CARD — DOWNWARD MOVEMENT / SINKING / HITCHING
                    </span>
                    <span className="text-[11px] text-gray-300 leading-tight block mt-0.5">
                      Any downward bar movement during ascent, sinking bar into chest after pause, or supporting bar on thighs (hitching).
                    </span>
                  </div>
                </button>

                {/* Yellow Card */}
                <button
                  type="button"
                  onClick={() => handleConfirmCard("YELLOW")}
                  className="group flex items-start gap-3.5 p-4 rounded-xl border border-yellow-500/30 bg-yellow-950/20 hover:bg-yellow-900/30 hover:border-yellow-500 text-left transition-all cursor-pointer"
                >
                  <div className="h-9 w-6 rounded bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.6)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-heading text-sm font-bold uppercase tracking-wider text-yellow-400 block group-hover:text-yellow-300">
                      YELLOW CARD — STEPPING / BENCH POSITION / EARLY DROP
                    </span>
                    <span className="text-[11px] text-gray-300 leading-tight block mt-0.5">
                      Foot movement, buttocks lifting off bench pad, dropping bar before platform contact, or racking before signal.
                    </span>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
