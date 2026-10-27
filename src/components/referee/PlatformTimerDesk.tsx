"use client";

import React, { useState, useEffect, useRef } from "react";
import { meetTimerAudio } from "@/lib/meet-timer-audio";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  Flame,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface PlatformTimerDeskProps {
  athleteName: string;
  discipline: string;
  attemptNumber: number;
  declaredWeight: number;
  onTimeExpired?: () => void;
  externalResetSignal?: number;
  onTimerEvent?: (event: "BAR_LOADED" | "TIMER_START" | "TIMER_PAUSE" | "TIMER_RESET", seconds?: number) => void;
}

export function PlatformTimerDesk({
  athleteName,
  discipline,
  attemptNumber,
  declaredWeight,
  onTimeExpired,
  externalResetSignal,
  onTimerEvent,
}: PlatformTimerDeskProps) {
  const [totalDuration, setTotalDuration] = useState<number>(60); // 60s or 90s
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmissionClockRunning, setIsSubmissionClockRunning] = useState<boolean>(false);
  const [submissionTimeLeft, setSubmissionTimeLeft] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync mute state with audio engine
  meetTimerAudio.isMuted = isMuted;

  // React to external clock reset trigger (e.g. Loader weight mismatch IPF 8.4)
  const initialMount = useRef(true);
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (externalResetSignal !== undefined) {
      setIsRunning(false);
      setTotalDuration(60);
      setTimeLeft(60);
    }
  }, [externalResetSignal]);

  // Platform Attempt Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
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
            if (onTimeExpired) onTimeExpired();
          }

          return Math.max(0, next);
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onTimeExpired]);

  // Next Attempt Declaration 60s timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSubmissionClockRunning && submissionTimeLeft > 0) {
      interval = setInterval(() => {
        setSubmissionTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (submissionTimeLeft === 0) {
      setIsSubmissionClockRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSubmissionClockRunning, submissionTimeLeft]);

  // Reset attempt timer
  const handleResetTimer = (seconds: number = 60) => {
    setIsRunning(false);
    setTotalDuration(seconds);
    setTimeLeft(seconds);
    onTimerEvent?.("TIMER_RESET", seconds);
  };

  // Start "Bar is Loaded!" signal
  const handleStartBarLoaded = () => {
    meetTimerAudio.playBarLoadedSignal();
    setTimeLeft(totalDuration);
    setIsRunning(true);
    onTimerEvent?.("BAR_LOADED", totalDuration);
  };

  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const isUrgent = timeLeft <= 10 && timeLeft > 0;
  const isWarning = timeLeft <= 30 && timeLeft > 10;
  const isExpired = timeLeft === 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#160d09] via-[#0e0705] to-[#080302] p-5 shadow-2xl">
      {/* Glow pulse when urgent */}
      {isUrgent && (
        <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none" />
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gym-primary" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-white">
            Official Platform Attempt Clock (IPF Rule 8.1)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "Unmute Clock Audio" : "Mute Clock Audio"}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </button>

          <div className="flex rounded-lg border border-white/10 bg-black/60 p-0.5 text-[10px] font-semibold uppercase">
            <button
              type="button"
              onClick={() => handleResetTimer(60)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                totalDuration === 60 ? "bg-gym-primary text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              60s Standard
            </button>
            <button
              type="button"
              onClick={() => handleResetTimer(90)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                totalDuration === 90 ? "bg-gym-primary text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              90s Consecutive
            </button>
          </div>
        </div>
      </div>

      {/* Main Countdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Large Digital Clock Dial */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl border border-white/10 bg-black/70 relative">
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-zinc-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke={isExpired ? "#ef4444" : isUrgent ? "#dc2626" : isWarning ? "#f59e0b" : "#e6501b"}
                strokeWidth="7"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * (100 - progressPercent)) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 ease-linear"
              />
            </svg>

            {/* Time Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`font-heading text-4xl font-bold tracking-tight ${
                  isExpired
                    ? "text-red-500 animate-bounce"
                    : isUrgent
                    ? "text-red-400 scale-110 animate-pulse"
                    : isWarning
                    ? "text-amber-400"
                    : "text-white"
                }`}
              >
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">
                {isExpired ? "TIME EXPIRED" : isRunning ? "RUNNING" : "PAUSED"}
              </span>
            </div>
          </div>

          {/* Time Status Label */}
          <div className="mt-2 text-center">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isExpired
                  ? "text-red-400"
                  : isUrgent
                  ? "text-red-400"
                  : isWarning
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {isExpired
                ? "⚠️ 1-Minute Clock Expired - No Lift Penalty"
                : isUrgent
                ? "⚡ Final 10 Seconds Remaining"
                : isWarning
                ? "🔔 30-Second Warning Issued"
                : "Barbell Ready on Platform"}
            </span>
          </div>
        </div>

        {/* Action Controls & Official Commands */}
        <div className="sm:col-span-7 flex flex-col justify-between gap-3">
          {/* Signal: Bar is Loaded (Primary Referee Action) */}
          <button
            type="button"
            onClick={handleStartBarLoaded}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
          >
            <Bell className="h-4 w-4 fill-white" />
            <span>Signal: "BAR IS LOADED!" (Start 60s Clock)</span>
          </button>

          {/* Clock controls: Pause / Resume / Reset */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const nextRunning = !isRunning;
                setIsRunning(nextRunning);
                onTimerEvent?.(nextRunning ? "TIMER_START" : "TIMER_PAUSE", timeLeft);
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isRunning
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  : "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Clock</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Resume Clock</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleResetTimer(totalDuration)}
              className="py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset {totalDuration}s</span>
            </button>
          </div>

          {/* Coach 60s Next Attempt Submission Clock */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
                Next Attempt Declaration Window (IPF Rule 8.2)
              </span>
              <span className="text-xs font-black text-amber-400 font-mono">
                Coach Window: 00:{submissionTimeLeft < 10 ? `0${submissionTimeLeft}` : submissionTimeLeft}
              </span>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSubmissionTimeLeft(60);
                  setIsSubmissionClockRunning(true);
                }}
                className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] font-semibold uppercase text-amber-300 transition-colors cursor-pointer"
              >
                Start 60s
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmissionClockRunning(false);
                  setSubmissionTimeLeft(60);
                }}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold uppercase text-zinc-400 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
