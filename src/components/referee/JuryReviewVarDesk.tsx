"use client";

import React, { useState, useTransition } from "react";
import { submitJuryOverruleAction, LiftField } from "@/actions/scoring.actions";
import { refereeVoice } from "@/lib/referee-voice-commands";
import {
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  X,
  FileCheck,
  Award,
} from "lucide-react";

export interface RecentAttemptDecision {
  resultId: string;
  athleteName: string;
  weightClass: string;
  discipline: "squat" | "bench" | "deadlift";
  attemptNum: 1 | 2 | 3;
  liftField: LiftField;
  recordedWeight: number; // Positive = Good Lift, Negative = No Lift
  timestamp: string;
}

interface JuryReviewVarDeskProps {
  recentDecisions: RecentAttemptDecision[];
  onOverruleSuccess: () => void;
}

export function JuryReviewVarDesk({ recentDecisions, onOverruleSuccess }: JuryReviewVarDeskProps) {
  const [selectedDecision, setSelectedDecision] = useState<RecentAttemptDecision | null>(null);
  const [overruleTo, setOverruleTo] = useState<"GOOD_LIFT" | "NO_LIFT">("GOOD_LIFT");
  const [overruleReason, setOverruleReason] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleOpenModal = (dec: RecentAttemptDecision) => {
    setSelectedDecision(dec);
    setOverruleTo(dec.recordedWeight > 0 ? "NO_LIFT" : "GOOD_LIFT");
    setOverruleReason("");
  };

  const handleExecuteOverrule = () => {
    if (!selectedDecision) return;
    if (!overruleReason.trim()) {
      alert("Please provide official technical justification for the Jury Overrule.");
      return;
    }

    startTransition(async () => {
      refereeVoice.playJuryHorn();
      const res = await submitJuryOverruleAction({
        resultId: selectedDecision.resultId,
        liftField: selectedDecision.liftField,
        overruleTo,
        reason: overruleReason,
      });

      if (res.success) {
        setStatusNotice(
          `Decision successfully overturned by Technical Jury! Attempt updated to ${res.recordedWeight} KG.`
        );
        setTimeout(() => setStatusNotice(null), 4000);
        setSelectedDecision(null);
        onOverruleSuccess();
      } else {
        alert(res.error || "Failed to execute Jury overrule.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
              Official Technical Jury &amp; VAR Appeal Desk
            </h3>
          </div>
          <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            IPF Rulebook Section 8.7
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          The Technical Jury possesses supreme platform authority to review referee adjudications by video/visual evidence. By majority vote, the Jury may overturn an incorrect ⚪ Good Lift or 🔴 No Lift decision.
        </p>

        {statusNotice && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{statusNotice}</span>
          </div>
        )}
      </div>

      {/* ── RECENT DECISION LEDGER ── */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Recent Platform Adjudications ({recentDecisions.length})
          </span>
          <span className="text-[10px] text-zinc-500">Click any row to initiate Jury VAR Review</span>
        </div>

        {recentDecisions.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs font-medium">
            No attempts logged for this meet yet. Referees can submit decisions via the switchboard above.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {recentDecisions.map((dec) => {
              const isGood = dec.recordedWeight > 0;
              const absWeight = Math.abs(dec.recordedWeight);

              return (
                <div
                  key={`${dec.resultId}-${dec.liftField}`}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white/5 px-2 rounded-xl transition-all cursor-pointer"
                  onClick={() => handleOpenModal(dec)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isGood
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-red-500/20 text-red-400 border border-red-500/40"
                      }`}
                    >
                      {isGood ? "⚪⚪⚪" : "🔴🔴🔴"}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-white">
                        {dec.athleteName}{" "}
                        <span className="text-[10px] text-zinc-400 font-normal">({dec.weightClass})</span>
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                        <span className="capitalize font-bold text-gym-primary">
                          {dec.discipline} (Att {dec.attemptNum})
                        </span>
                        <span>•</span>
                        <span className="font-mono font-bold text-white">{absWeight} KG</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isGood
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {isGood ? "GOOD LIFT" : "NO LIFT"}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(dec);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Jury Overrule</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── JURY OVERRULE MODAL ── */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedDecision(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-amber-500/40 bg-zinc-950 p-6 sm:p-8 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <h3 className="font-heading text-lg font-bold uppercase text-white">
                  Execute Jury VAR Overrule
                </h3>
              </div>
              <button
                onClick={() => setSelectedDecision(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-black/60 border border-white/10 p-3 text-xs space-y-1">
              <div>Lifter: <strong className="text-white">{selectedDecision.athleteName}</strong></div>
              <div>Lift: <strong className="text-gym-primary uppercase">{selectedDecision.discipline} Att {selectedDecision.attemptNum} ({Math.abs(selectedDecision.recordedWeight)} KG)</strong></div>
              <div>Current Adjudication: <strong className={selectedDecision.recordedWeight > 0 ? "text-emerald-400" : "text-red-400"}>{selectedDecision.recordedWeight > 0 ? "GOOD LIFT" : "NO LIFT"}</strong></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-zinc-400 block">
                Reverse Platform Verdict To:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOverruleTo("GOOD_LIFT")}
                  className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    overruleTo === "GOOD_LIFT"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                      : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  ⚪ Good Lift (Valid)
                </button>
                <button
                  type="button"
                  onClick={() => setOverruleTo("NO_LIFT")}
                  className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    overruleTo === "NO_LIFT"
                      ? "bg-red-600 text-white shadow-lg shadow-red-950"
                      : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  🔴 No Lift (Disallow)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-zinc-400 block">
                Mandatory Jury Technical Justification:
              </label>
              <textarea
                rows={3}
                value={overruleReason}
                onChange={(e) => setOverruleReason(e.target.value)}
                placeholder="e.g. Video angle confirmed hip crease broke knee top plane before upward ascent."
                className="w-full bg-zinc-900 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDecision(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/15 text-zinc-300 font-bold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteOverrule}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Executing Overrule..." : "Confirm & Broadcast Overrule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
