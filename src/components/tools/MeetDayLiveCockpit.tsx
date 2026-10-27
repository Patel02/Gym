"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MeetTacticsState,
  LiftDiscipline,
  LiftAttempt,
  AttemptResult,
  NoLiftReason,
  evaluateContingency,
  ContingencyAdvice,
  roundToIpfIncrement,
  calculateMeetDiagnostics,
} from "@/lib/attempt-tactics";
import { meetTimerAudio } from "@/lib/meet-timer-audio";
import {
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Dumbbell,
  Check,
} from "lucide-react";

interface MeetDayLiveCockpitProps {
  tactics: MeetTacticsState;
  setTactics: React.Dispatch<React.SetStateAction<MeetTacticsState>>;
}

export function MeetDayLiveCockpit({ tactics, setTactics }: MeetDayLiveCockpitProps) {
  const [activeDiscipline, setActiveDiscipline] = useState<LiftDiscipline>("SQUAT");
  const [activeAttemptNum, setActiveAttemptNum] = useState<1 | 2 | 3>(1);

  // 60-Second Attempt Submission Timer State
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modal / Drawer state for logging attempt
  const [selectedRpe, setSelectedRpe] = useState<number>(8.0);
  const [selectedNoLiftReason, setSelectedNoLiftReason] = useState<NoLiftReason>("DEPTH");
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Sound engine sync
  useEffect(() => {
    meetTimerAudio.isMuted = isMuted;
  }, [isMuted]);

  // Timer Interval Hook
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;

          // Sound triggers
          if (next === 30) {
            meetTimerAudio.playThirtySecondWarning();
          } else if (next <= 10 && next > 0) {
            meetTimerAudio.playTenSecondTick();
          } else if (next === 0) {
            meetTimerAudio.playTimeoutBuzzer();
          }

          if (next <= 0) {
            setIsTimerRunning(false);
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  const resetTimer = (seconds: number = 60) => {
    setIsTimerRunning(false);
    setTimeLeft(seconds);
  };

  const startTimer = () => {
    if (timeLeft <= 0) setTimeLeft(60);
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  // Current Lift and Attempt
  const discKey = activeDiscipline.toLowerCase() as "squat" | "bench" | "deadlift";
  const currentAttempts = tactics[discKey].attempts;
  const currentAttempt = currentAttempts[activeAttemptNum - 1];
  const nextAttempt = activeAttemptNum === 1 ? currentAttempts[1] : activeAttemptNum === 2 ? currentAttempts[2] : null;

  // Evaluate Contingency Advice
  const contingencyAdvice: ContingencyAdvice = evaluateContingency(
    activeDiscipline,
    activeAttemptNum === 3 ? 2 : (activeAttemptNum as 1 | 2),
    currentAttempt.weightKg,
    currentAttempt.result,
    currentAttempt.rpe || selectedRpe,
    currentAttempt.noLiftReason || selectedNoLiftReason,
    nextAttempt?.weightKg
  );

  // Mark Attempt Result
  const handleSetAttemptResult = (result: AttemptResult) => {
    setTactics((prev) => {
      const updated = [...prev[discKey].attempts] as [LiftAttempt, LiftAttempt, LiftAttempt];
      updated[activeAttemptNum - 1] = {
        ...updated[activeAttemptNum - 1],
        result,
        rpe: result === "GOOD_LIFT" ? selectedRpe : undefined,
        noLiftReason: result === "NO_LIFT" ? selectedNoLiftReason : undefined,
      };

      return {
        ...prev,
        [discKey]: {
          ...prev[discKey],
          attempts: updated,
        },
      };
    });

    // Automatically trigger 60-second timer when an attempt completes
    if (result !== "PENDING" && activeAttemptNum < 3) {
      resetTimer(60);
      setIsTimerRunning(true);
    }
  };

  // Apply Coach Recommendation to Next Attempt
  const applyRecommendedWeight = (weight: number) => {
    if (activeAttemptNum >= 3) return;

    setTactics((prev) => {
      const updated = [...prev[discKey].attempts] as [LiftAttempt, LiftAttempt, LiftAttempt];
      const nextIdx = activeAttemptNum === 1 ? 1 : 2;
      updated[nextIdx] = {
        ...updated[nextIdx],
        weightKg: weight,
      };

      return {
        ...prev,
        strategyRoute: "Custom",
        [discKey]: {
          ...prev[discKey],
          attempts: updated,
        },
      };
    });

    meetTimerAudio.playSubmissionSuccess();
    setAppliedNotice(`Attempt ${activeAttemptNum + 1} updated to ${weight} KG!`);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  // Overall meet stats
  const diagnostics = calculateMeetDiagnostics(tactics);

  // Percentage of timer progress
  const timerPercentage = (timeLeft / 60) * 100;
  const timerColor =
    timeLeft <= 10
      ? "text-red-500 stroke-red-500"
      : timeLeft <= 30
      ? "text-amber-400 stroke-amber-400"
      : "text-emerald-400 stroke-emerald-400";

  return (
    <div className="space-y-8">
      {/* ── TOP COCKPIT BAR ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">
                Backstage Warm-Up &amp; Platform Cockpit
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider font-heading">
              Live Competition Attempt Command
            </h2>
            <p className="text-xs text-zinc-400">
              Lifter: <strong className="text-white">{tactics.athleteName}</strong> • Category:{" "}
              <strong className="text-white">{tactics.weightClass}</strong> • Flight:{" "}
              <strong className="text-gym-primary">{tactics.flight}</strong>
            </p>
          </div>

          {/* Discipline Switcher Tabs */}
          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10">
            {(["SQUAT", "BENCH", "DEADLIFT"] as const).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setActiveDiscipline(d);
                  setActiveAttemptNum(1);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeDiscipline === d
                    ? "bg-gym-primary text-white shadow-lg shadow-orange-950"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SPLIT GRID: 60-SEC SUBMISSION TIMER & ACTIVE ATTEMPT CONTROLLER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: 60-SEC TIMER & IPF CARD SUBMISSION (5 COLS) */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-zinc-950 p-6 flex flex-col items-center justify-between shadow-xl">
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gym-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                IPF 1-Minute Rule
              </span>
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
              title={isMuted ? "Unmute Audio Alerts" : "Mute Audio Alerts"}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
            </button>
          </div>

          {/* Circular Countdown Ring */}
          <div className="relative my-6 flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-zinc-800"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - timerPercentage / 100)}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${timerColor}`}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-5xl font-black font-heading tracking-tight ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-white"}`}>
                {timeLeft}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                SECONDS
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="w-full flex items-center justify-center gap-2.5 pt-2">
            {!isTimerRunning ? (
              <button
                onClick={startTimer}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Clock</span>
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Pause className="h-4 w-4 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={() => resetTimer(60)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset to 60s"
            >
              <RotateCcw className="h-4 w-4" />
              <span>60s</span>
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 text-center mt-4 border-t border-white/10 pt-3">
            IPF Rule Section 8.4: Next attempt card must be submitted within 60 seconds of leaving platform.
          </p>
        </div>

        {/* RIGHT COLUMN: ACTIVE ATTEMPT & CONTINGENCY COCKPIT (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Attempt Selector Pills (1, 2, 3) */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Active Attempt Selector
              </span>
              <span className="text-xs font-bold text-gym-primary uppercase">
                {activeDiscipline} DISCIPLINE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {([1, 2, 3] as const).map((num) => {
                const att = currentAttempts[num - 1];
                const isCurrent = activeAttemptNum === num;
                return (
                  <button
                    key={num}
                    onClick={() => setActiveAttemptNum(num)}
                    className={`rounded-xl border p-3 flex flex-col items-center justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? "border-gym-primary bg-gym-primary/15 shadow-lg"
                        : "border-white/10 bg-black/40 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        ATT {num}
                      </span>
                      {att.result === "GOOD_LIFT" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      {att.result === "NO_LIFT" && (
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                      )}
                    </div>
                    <div className="my-1.5 font-heading text-xl font-bold text-white">
                      {att.weightKg} <span className="text-xs text-gym-primary">KG</span>
                    </div>
                    <span
                      className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded ${
                        att.result === "GOOD_LIFT"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : att.result === "NO_LIFT"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-white/10 text-zinc-400"
                      }`}
                    >
                      {att.result === "PENDING" ? "PENDING" : att.result.replace("_", " ")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Platform Result Buttons */}
            <div className="mt-5 pt-4 border-t border-white/10 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                Register Platform Call for Attempt {activeAttemptNum} ({currentAttempt.weightKg} KG):
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSetAttemptResult("GOOD_LIFT")}
                  className={`py-3 rounded-xl border flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    currentAttempt.result === "GOOD_LIFT"
                      ? "border-emerald-400 bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                      : "border-emerald-500/30 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40"
                  }`}
                >
                  <span className="text-base">⚪⚪⚪</span>
                  <span>Good Lift (Pass)</span>
                </button>

                <button
                  onClick={() => handleSetAttemptResult("NO_LIFT")}
                  className={`py-3 rounded-xl border flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    currentAttempt.result === "NO_LIFT"
                      ? "border-red-400 bg-red-600 text-white shadow-lg shadow-red-950"
                      : "border-red-500/30 bg-red-950/30 text-red-300 hover:bg-red-900/40"
                  }`}
                >
                  <span className="text-base">🔴🔴🔴</span>
                  <span>No Lift (Miss)</span>
                </button>
              </div>

              {/* RPE Selector (if Good Lift) */}
              {currentAttempt.result === "GOOD_LIFT" && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300">Rate Execution Velocity (RPE):</span>
                    <span className="font-black text-white bg-black/50 px-2 py-0.5 rounded border border-emerald-500/30">
                      RPE {selectedRpe}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setSelectedRpe(val);
                          handleSetAttemptResult("GOOD_LIFT");
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          selectedRpe === val
                            ? "bg-emerald-500 text-black font-black"
                            : "bg-black/40 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reason Selector (if No Lift) */}
              {currentAttempt.result === "NO_LIFT" && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 space-y-2">
                  <span className="text-xs font-bold text-red-300 block">
                    Infraction / Miss Reason:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: "DEPTH", label: "🟥 Depth (Squat)" },
                        { id: "DOWNWARD_MOTION", label: "🟦 Downward Bar" },
                        { id: "STRENGTH_STALL", label: "❌ Strength Stall" },
                        { id: "BUTTOCKS_OFF_PAD", label: "🟨 Buttocks Pad" },
                        { id: "FOOT_MOVEMENT", label: "🟨 Foot Movement" },
                        { id: "COMMAND_VIOLATION", label: "🟨 Command Error" },
                      ] as const
                    ).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedNoLiftReason(r.id);
                          handleSetAttemptResult("NO_LIFT");
                        }}
                        className={`px-2 py-1.5 rounded text-[11px] font-bold text-left transition-all cursor-pointer ${
                          selectedNoLiftReason === r.id
                            ? "bg-red-500 text-white font-black"
                            : "bg-black/40 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── COACH CONTINGENCY ADVICE CARD ── */}
          <div className="rounded-2xl border border-gym-primary/30 bg-gradient-to-b from-gym-primary/10 via-black to-black p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gym-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Coach Tactical Recommendation
                </span>
              </div>
              <span className="rounded-full bg-gym-primary/20 border border-gym-primary/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-gym-primary">
                Coach Akash &amp; Tanvi
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white font-heading">
                {contingencyAdvice.headline}
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {contingencyAdvice.rationale}
              </p>
              <div className="rounded-xl bg-black/60 border border-white/10 p-3 text-xs text-zinc-300">
                <strong className="text-gym-primary">Directives: </strong>
                {contingencyAdvice.coachNote}
              </div>
            </div>

            {/* Recommended Weight Action Pill */}
            {activeAttemptNum < 3 && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">Target for Attempt {activeAttemptNum + 1}:</span>
                  <span className="text-lg font-bold text-gym-primary font-heading">
                    {contingencyAdvice.recommendedWeightKg} KG
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => applyRecommendedWeight(contingencyAdvice.recommendedWeightKg)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Apply {contingencyAdvice.recommendedWeightKg} KG</span>
                  </button>

                  {contingencyAdvice.alternativeWeightKg && (
                    <button
                      onClick={() => applyRecommendedWeight(contingencyAdvice.alternativeWeightKg!)}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-zinc-300 text-xs font-bold hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Alt: {contingencyAdvice.alternativeWeightKg} KG
                    </button>
                  )}
                </div>
              </div>
            )}

            {appliedNotice && (
              <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-2 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{appliedNotice}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
