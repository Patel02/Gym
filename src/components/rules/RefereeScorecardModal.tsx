"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { refereeAudio } from "@/lib/referee-audio";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Printer, 
  Share2, 
  ShieldCheck, 
  User, 
  Calendar, 
  Sparkles,
  ExternalLink
} from "lucide-react";

import { createPortal } from "react-dom";

interface ExamResultRecord {
  caseId: number;
  userDecision: "GOOD_LIFT" | "NO_LIFT" | "TIMEOUT";
  userCard: "NONE" | "RED" | "BLUE" | "YELLOW";
  isCorrect: boolean;
}

interface RefereeScorecardModalProps {
  results: ExamResultRecord[];
  totalCases: number;
  onRetakeExam: () => void;
}

export default function RefereeScorecardModal({
  results,
  totalCases,
  onRetakeExam,
}: RefereeScorecardModalProps) {
  const [mounted, setMounted] = useState(false);
  const [candidateName, setCandidateName] = useState("Official Technical Trainee");
  const [credentialId, setCredentialId] = useState("");
  const [examDate, setExamDate] = useState("");

  const correctCount = results.filter((r) => r.isCorrect).length;
  const scorePercent = Math.round((correctCount / totalCases) * 100);
  const isPassed = scorePercent >= 80;

  useEffect(() => {
    setMounted(true);
    // Generate unique credential code on load
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    setCredentialId(`IPF-REF-2026-${randomSuffix}`);
    setExamDate(new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }));

    if (isPassed) {
      refereeAudio.playSuccessFanfare();
    }
  }, [isPassed]);

  // Pre-filled WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🏛️ *INDIAN POWERLIFTING FEDERATION — TECHNICAL REFEREE CERTIFICATION*\n\n` +
      `Candidate: *${candidateName}*\n` +
      `Score: *${correctCount}/${totalCases} (${scorePercent}%)* — ${isPassed ? "✅ PASSED (Category 2 Official)" : "⚠️ Re-Examination Required"}\n` +
      `Credential ID: *${credentialId}*\n\n` +
      `Test your powerlifting platform judging skills on the official simulator here:\n` +
      `https://atfitnesspowerlifting.com/rules/referee-exam`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!mounted) return null;

  const printStyles = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #000000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body > *:not(#print-referee-scorecard-modal-root) {
        display: none !important;
        visibility: hidden !important;
      }
      #print-referee-scorecard-modal-root {
        display: flex !important;
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #000000 !important;
        z-index: 9999999 !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .no-print {
        display: none !important;
      }
    }
  `;

  return createPortal(
    <div
      id="print-referee-scorecard-modal-root"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto"
    >
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl my-8 rounded-3xl border border-white/20 bg-gradient-to-b from-[#180a06] via-[#0f0402] to-black p-6 sm:p-10 shadow-[0_0_80px_rgba(230,80,27,0.3)] relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-[100px] pointer-events-none ${
          isPassed ? "bg-emerald-500/20" : "bg-red-500/20"
        }`} />

        {/* Header Badge */}
        <div className="text-center relative z-10 mb-8">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-3 ${
            isPassed 
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "bg-red-500/15 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          }`}>
            <Award className="w-4 h-4" />
            <span>{isPassed ? "OFFICIAL ACCREDITATION PASSED" : "RE-EXAMINATION RECOMMENDED"}</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Referee Examination <span className={isPassed ? "text-emerald-400" : "text-red-500"}>Scorecard</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto mt-2">
            {isPassed 
              ? "Congratulations! You have satisfied the 80% passing threshold required for IPF Category 2 National Technical Official status."
              : "The official IPF referee passing score is 80%+. Review the missed rule infractions below and retake the platform trial."
            }
          </p>
        </div>

        {/* Big Score Matrix Meter */}
        <div className="grid grid-cols-3 gap-3 p-4 sm:p-6 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md mb-8 relative z-10 text-center">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Correct Calls
            </span>
            <span className="font-heading text-2xl sm:text-3xl font-bold text-white">
              {correctCount} / {totalCases}
            </span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Accuracy Rate
            </span>
            <span className={`font-heading text-2xl sm:text-3xl font-bold ${
              isPassed ? "text-emerald-400" : "text-red-400"
            }`}>
              {scorePercent}%
            </span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
              IPF Standard
            </span>
            <span className="font-heading text-2xl sm:text-3xl font-bold text-gym-primary">
              80% Min
            </span>
          </div>
        </div>

        {/* Official Credential Certificate Pass (Only shown if passed) */}
        {isPassed && (
          <div className="mb-8 rounded-2xl border-2 border-yellow-500/40 bg-gradient-to-b from-[#241505] via-[#150a03] to-black p-5 sm:p-7 shadow-[0_0_30px_rgba(234,179,8,0.2)] relative z-10">
            {/* Corner Filigrees */}
            <div className="absolute top-2 left-2 text-yellow-500/40 font-mono text-xs">╔══</div>
            <div className="absolute top-2 right-2 text-yellow-500/40 font-mono text-xs">══╗</div>
            <div className="absolute bottom-2 left-2 text-yellow-500/40 font-mono text-xs">╚══</div>
            <div className="absolute bottom-2 right-2 text-yellow-500/40 font-mono text-xs">══╝</div>

            <div className="text-center mb-5 border-b border-yellow-500/20 pb-4">
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-yellow-400 block mb-1">
                INDIAN POWERLIFTING FEDERATION • ESTD. 1975
              </span>
              <h4 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
                Technical Referee Trainee Credential
              </h4>
              <span className="text-[10px] font-mono text-yellow-500 font-bold">
                RATIFIED ACCREDITATION PASS • {credentialId}
              </span>
            </div>

            {/* Candidate Name Input */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Candidate Name on Certificate:
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Enter Your Full Name"
                className="w-full bg-black/60 border border-yellow-500/30 rounded-xl px-4 py-2.5 text-sm font-heading font-bold uppercase text-yellow-300 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-300 mb-4 bg-black/40 p-3.5 rounded-xl border border-white/5">
              <div>
                <span className="text-[9px] text-gray-400 uppercase font-bold block">Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Category 2 Trainee
                </span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 uppercase font-bold block">Exam Date:</span>
                <span className="font-mono text-white mt-0.5 block">{examDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-yellow-500/20 pt-4 text-[10px] text-gray-400">
              <div className="flex flex-col">
                <span className="font-bold text-white uppercase">Coach Akash & Coach Tanvi</span>
                <span>National Technical Directors</span>
              </div>
              <div className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-yellow-400 font-black tracking-widest text-[9px]">
                OFFICIALLY RATIFIED
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="no-print flex flex-col sm:flex-row items-center gap-3 relative z-10">
          {isPassed && (
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-1/3 flex items-center justify-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/20 hover:bg-yellow-500/30 px-4 py-3 text-xs font-bold uppercase tracking-wider text-yellow-300 transition-all cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRetakeExam}
            className={`w-full ${isPassed ? "sm:w-1/3" : "sm:w-1/2"} flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Exam</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className={`w-full ${isPassed ? "sm:w-1/3" : "sm:w-1/2"} flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 cursor-pointer`}
          >
            <WhatsAppIcon variant="official" className="w-4 h-4" />
            <span>Share WhatsApp</span>
          </button>
        </div>

      </motion.div>
    </div>,
    document.body
  );
}
