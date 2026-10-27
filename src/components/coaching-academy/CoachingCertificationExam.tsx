"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Award, 
  HelpCircle,
  Clock,
  Send,
  FileCheck2
} from "lucide-react";
import { COACHING_EXAM_QUESTIONS, ExamQuestion } from "@/data/coaching-academy-data";
import { submitCoachCertificationExamAction, ExamResultResponse } from "@/actions/coaching-academy.actions";
import CoachLicensePassModal from "./CoachLicensePassModal";

export default function CoachingCertificationExam() {
  const [candidateName, setCandidateName] = useState("Vikram Sharma");
  const [level, setLevel] = useState<"LEVEL_1" | "LEVEL_2">("LEVEL_2");
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<ExamResultResponse | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const totalCount = COACHING_EXAM_QUESTIONS.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const handleSelectOption = (questionId: string, optionKey: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount < totalCount) {
      alert(`Please answer all ${totalCount} questions before submitting (currently answered: ${answeredCount}/${totalCount}).`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitCoachCertificationExamAction({
        candidateName,
        level,
        answers,
      });

      setExamResult(res);
      if (res.passed) {
        setIsPassModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setExamResult(null);
  };

  return (
    <div className="space-y-8">
      {/* ── Top Header ── */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-black/80 to-black p-6 shadow-[0_0_40px_rgba(168,85,247,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-purple-400">
              <GraduationCap className="h-4 w-4" />
              <span>National Coaching Accreditation Board</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white mt-1">
              Interactive Strength Coach Certification Exam
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              10 real-world platform scenarios. Passing threshold: 80% (8/10 correct) to earn a ratified national coaching license.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-3.5 py-1.5 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>Preview Diploma Pass</span>
            </button>

            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-bold text-purple-300">
              80% Passing Threshold
            </span>
          </div>
        </div>

        {/* ── Candidate Configuration Inputs ── */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Candidate Full Name (As printed on License)
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Accreditation Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="LEVEL_1" className="bg-zinc-950 text-white">Level 1: Club & Regional Strength Coach</option>
              <option value="LEVEL_2" className="bg-zinc-950 text-white">Level 2: National High-Performance Coach</option>
            </select>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400 font-mono">Exam Completion:</span>
            <span className="font-mono font-bold text-purple-400">
              {answeredCount} / {totalCount} Answered ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Exam Result Banner (if completed) ── */}
      {examResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 text-center space-y-3 ${
            examResult.passed
              ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-200"
              : "border-red-500/50 bg-red-950/30 text-red-200"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {examResult.passed ? (
              <Sparkles className="h-6 w-6 text-amber-400 animate-spin" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-400" />
            )}
            <h3 className="text-2xl font-bold uppercase tracking-tight text-white">
              {examResult.passed ? "Accreditation Exam Passed!" : "Passing Threshold Not Met"}
            </h3>
          </div>

          <p className="text-sm max-w-xl mx-auto text-gray-300">
            {examResult.passed ? (
              <>Congratulations <strong>{candidateName}</strong>! You achieved a score of <strong>{examResult.score}/{examResult.totalQuestions} ({examResult.percentage}%)</strong> and earned official accreditation as a <strong>{examResult.levelTitle}</strong>.</>
            ) : (
              <>You achieved a score of <strong>{examResult.score}/{examResult.totalQuestions} ({examResult.percentage}%)</strong>. The minimum passing threshold is 80%. Review the module explanations below and retake the exam.</>
            )}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            {examResult.passed && (
              <button
                onClick={() => setIsPassModalOpen(true)}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-950 shadow-lg shadow-amber-500/30 hover:scale-105 cursor-pointer transition-all"
              >
                View Official Coach License & Diploma
              </button>
            )}

            <button
              onClick={handleRetake}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold uppercase text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              Retake Examination
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Questions Form ── */}
      <form onSubmit={handleSubmitExam} className="space-y-6">
        {COACHING_EXAM_QUESTIONS.map((q) => {
          const selectedKey = answers[q.id];
          const resultDetail = examResult?.detailedResults.find((d) => d.questionNumber === q.questionNumber);

          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-6 transition-all ${
                resultDetail
                  ? resultDetail.isCorrect
                    ? "border-emerald-500/40 bg-emerald-950/10"
                    : "border-red-500/40 bg-red-950/10"
                  : selectedKey
                  ? "border-purple-500/30 bg-zinc-950"
                  : "border-white/10 bg-zinc-950"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2.5 py-0.5 rounded">
                  Question {q.questionNumber} of {totalCount}
                </span>

                <span className="text-xs font-mono text-gray-500">
                  Topic: {q.topic}
                </span>
              </div>

              {/* Scenario */}
              <p className="text-sm font-semibold text-white leading-relaxed mb-4">
                {q.scenario}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const isSelected = selectedKey === opt.key;
                  const isCorrectAnswer = examResult && q.correctAnswer === opt.key;
                  const isWrongSelected = examResult && isSelected && !resultDetail?.isCorrect;

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => !examResult && handleSelectOption(q.id, opt.key)}
                      disabled={!!examResult}
                      className={`w-full text-left rounded-xl p-3.5 text-xs sm:text-sm font-medium transition-all flex items-start gap-3 border cursor-pointer ${
                        isCorrectAnswer
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold"
                          : isWrongSelected
                          ? "border-red-500 bg-red-500/20 text-red-200"
                          : isSelected
                          ? "border-purple-500 bg-purple-500/20 text-white font-bold shadow-md shadow-purple-500/10"
                          : "border-white/10 bg-white/[0.02] text-gray-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                        isCorrectAnswer
                          ? "bg-emerald-500 text-zinc-950"
                          : isWrongSelected
                          ? "bg-red-500 text-white"
                          : isSelected
                          ? "bg-purple-500 text-white"
                          : "bg-white/10 text-gray-400"
                      }`}>
                        {opt.key}
                      </span>
                      <span className="mt-0.5 leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (After submission) */}
              {resultDetail && (
                <div className={`mt-4 rounded-xl p-3 text-xs leading-relaxed border ${
                  resultDetail.isCorrect
                    ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                    : "border-red-500/30 bg-red-950/20 text-red-300"
                }`}>
                  <span className="font-bold block mb-1">
                    {resultDetail.isCorrect ? "✅ Correct!" : `❌ Incorrect (Correct Answer: Option ${q.correctAnswer})`}
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}

        {/* Submit Button */}
        {!examResult && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs text-gray-400 font-mono">
              Ensure all questions are answered before submitting.
            </span>

            <button
              type="submit"
              disabled={submitting || answeredCount < totalCount}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer transition-all"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Evaluating Exam...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Certification Exam</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* ── Coach License Pass Modal (Real Exam Result) ── */}
      {examResult && examResult.passed && examResult.licenseCode && (
        <CoachLicensePassModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          candidateName={examResult.candidateName}
          licenseCode={examResult.licenseCode}
          level={examResult.level}
          levelTitle={examResult.levelTitle}
          scorePercentage={examResult.percentage}
          ratificationDate={examResult.ratificationDate}
          initialQrDataUrl={examResult.qrDataUrl}
        />
      )}

      {/* ── Coach License Pass Modal (Live Preview) ── */}
      {isPreviewModalOpen && (
        <CoachLicensePassModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          candidateName={candidateName.trim() || "Vikram Sharma"}
          licenseCode="IPF-COACH-2026-6117"
          level={level}
          levelTitle={
            level === "LEVEL_2"
              ? "National High-Performance & Championship Technical Coach"
              : "Club Strength & Conditioning Coach"
          }
          scorePercentage={90}
          ratificationDate={new Date().toISOString().split("T")[0]}
        />
      )}
    </div>
  );
}
