"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { REFEREE_EXAM_CASES, RefereeCase } from "@/data/referee-exam-cases";
import PlatformTrajectoryVisualizer from "@/components/rules/PlatformTrajectoryVisualizer";
import RefereeConsoleSimulator from "@/components/rules/RefereeConsoleSimulator";
import RefereeScorecardModal from "@/components/rules/RefereeScorecardModal";
import { 
  Scale, 
  ChevronRight, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  RotateCcw, 
  Award,
  AlertTriangle,
  HelpCircle
} from "lucide-react";

interface ExamResultRecord {
  caseId: number;
  userDecision: "GOOD_LIFT" | "NO_LIFT" | "TIMEOUT";
  userCard: "NONE" | "RED" | "BLUE" | "YELLOW";
  isCorrect: boolean;
}

export default function RefereeExamPage() {
  const [cases, setCases] = useState<RefereeCase[]>(REFEREE_EXAM_CASES);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [examResults, setExamResults] = useState<ExamResultRecord[]>([]);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [lastSubmissionRevealed, setLastSubmissionRevealed] = useState(false);

  const currentCase = cases[currentCaseIndex];
  const isLastCase = currentCaseIndex === cases.length - 1;

  // Called when user votes on a case
  const handleDecisionSubmit = (result: ExamResultRecord) => {
    setExamResults((prev) => {
      const filtered = prev.filter((r) => r.caseId !== result.caseId);
      return [...filtered, result];
    });
    setLastSubmissionRevealed(true);
  };

  // Advance to next case or show scorecard
  const handleNextCase = () => {
    if (isLastCase) {
      setIsExamCompleted(true);
    } else {
      setCurrentCaseIndex((prev) => prev + 1);
      setLastSubmissionRevealed(false);
    }
  };

  // Retake the entire examination
  const handleRetakeExam = () => {
    // Shuffle slightly or reset
    setCases([...REFEREE_EXAM_CASES]);
    setCurrentCaseIndex(0);
    setExamResults([]);
    setIsExamCompleted(false);
    setLastSubmissionRevealed(false);
  };

  return (
    <div className="min-h-screen bg-gym-black text-white pt-28 sm:pt-32 lg:pt-36 pb-20 relative overflow-hidden">
      
      {/* ── Ambient Background Glows ── */}
      <motion.div 
        animate={{ y: [0, -25, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[130px]" 
      />
      <motion.div 
        animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-red-600/10 blur-[140px]" 
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* ── Breadcrumbs ── */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
          <Link href="/" className="hover:text-gym-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <Link href="/rules" className="hover:text-gym-primary transition-colors">IPF Rules</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <span className="text-gym-primary">Technical Referee Exam</span>
        </div>

        {/* ── Hero Section ── */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-3 shadow-[0_0_20px_rgba(230,80,27,0.2)]">
            <Scale className="h-3.5 w-3.5" />
            <span>IPF Category 2 Technical Official Examination</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Platform Referee <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.4)]">
              Simulator & Infraction Exam
            </span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed font-normal">
            Step onto the international jury platform. Review 10 high-stakes platform attempts across Squat, Bench Press, and Deadlift. You have 3 seconds to issue your official White ⚪ or Red 🔴 light decision. Score 80%+ to earn your ratified digital referee credential.
          </p>
        </div>

        {/* ── Exam Progress Tracker ── */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-4 sm:p-5 mb-8 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-400 uppercase tracking-widest">Platform Attempt:</span>
              <span className="font-black text-gym-primary text-sm">
                #{currentCaseIndex + 1} of {cases.length}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                Score: <strong className="text-white">{examResults.filter(r => r.isCorrect).length}</strong> / {examResults.length}
              </span>
              <button
                type="button"
                onClick={handleRetakeExam}
                className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset Exam
              </button>
            </div>
          </div>

          {/* Progress Segment Dots */}
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
            {cases.map((c, idx) => {
              const res = examResults.find((r) => r.caseId === c.id);
              const isCurrent = idx === currentCaseIndex;

              return (
                <div
                  key={c.id}
                  className={`h-2.5 rounded-full transition-all ${
                    res
                      ? res.isCorrect
                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                      : isCurrent
                      ? "bg-gym-primary animate-pulse"
                      : "bg-white/10"
                  }`}
                  title={`Case #${idx + 1}: ${c.lift} - ${c.title}`}
                />
              );
            })}
          </div>
        </div>

        {/* ── Main Simulator Grid: Visual Stage (Top/Left) + Hardware Console (Bottom/Right) ── */}
        <div className="flex flex-col gap-8">
          
          {/* Platform Motion & VAR Trajectory Visualizer */}
          <PlatformTrajectoryVisualizer
            scenario={currentCase}
            isRevealed={lastSubmissionRevealed}
          />

          {/* Interactive Hardware Referee Console Box */}
          <RefereeConsoleSimulator
            scenario={currentCase}
            currentIndex={currentCaseIndex}
            totalCases={cases.length}
            onDecisionSubmit={handleDecisionSubmit}
            onNextCase={handleNextCase}
            isLastCase={isLastCase}
          />

        </div>

        {/* ── Official IPF 3-Card Infraction Cheat Sheet Guide ── */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-[#0d0301] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gym-primary" />
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
              Official IPF Technical Rulebook Infraction Cards
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            In all IPF international and national championships, side referees and the chief referee indicate the exact cause of disqualification using standard colored rule cards:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Red Card */}
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-4 rounded bg-red-600 shadow-[0_0_10px_red]" />
                <span className="font-heading text-sm font-bold uppercase text-red-400">
                  RED CARD
                </span>
              </div>
              <span className="text-[11px] font-bold text-gray-300 block mb-1">
                Depth / Knee Extension Violation
              </span>
              <p className="text-xs text-gray-400 leading-snug">
                Failure to bend the knees until hip crease is below top of knees (Squat), or failure to stand erect with locked knees at lockout.
              </p>
            </div>

            {/* Blue Card */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-4 rounded bg-blue-600 shadow-[0_0_10px_blue]" />
                <span className="font-heading text-sm font-bold uppercase text-blue-400">
                  BLUE CARD
                </span>
              </div>
              <span className="text-[11px] font-bold text-gray-300 block mb-1">
                Downward Motion / Sinking / Hitching
              </span>
              <p className="text-xs text-gray-400 leading-snug">
                Barbell dipping downward during upward ascent, heaving/sinking bar into chest after pause, or supporting bar on thighs (deadlift hitch).
              </p>
            </div>

            {/* Yellow Card */}
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-4 rounded bg-yellow-500 shadow-[0_0_10px_gold]" />
                <span className="font-heading text-sm font-bold uppercase text-yellow-400">
                  YELLOW CARD
                </span>
              </div>
              <span className="text-[11px] font-bold text-gray-300 block mb-1">
                Stepping / Bench Position / Releasing Bar
              </span>
              <p className="text-xs text-gray-400 leading-snug">
                Foot movement or lateral stepping, buttocks rising off bench pad, dropping bar from hands before platform contact, or racking before signal.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Final Scorecard & Certified Credential Modal ── */}
      {isExamCompleted && (
        <RefereeScorecardModal
          results={examResults}
          totalCases={cases.length}
          onRetakeExam={handleRetakeExam}
        />
      )}

    </div>
  );
}
