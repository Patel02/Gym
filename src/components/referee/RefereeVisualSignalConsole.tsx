"use client";

import React, { useState } from "react";
import { refereeVoice } from "@/lib/referee-voice-commands";
import { reportLoaderWeightMismatchAction } from "@/actions/scoring.actions";
import {
  Mic,
  Volume2,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";

interface RefereeVisualSignalConsoleProps {
  discipline: "squat" | "bench" | "deadlift";
  lifterName: string;
  declaredWeight: number;
  onResetClock?: (seconds: number) => void;
}

export function RefereeVisualSignalConsole({
  discipline,
  lifterName,
  declaredWeight,
  onResetClock,
}: RefereeVisualSignalConsoleProps) {
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const [signalDescription, setSignalDescription] = useState<string | null>(null);
  const [haltNotice, setHaltNotice] = useState<string | null>(null);
  const [isHalting, setIsHalting] = useState<boolean>(false);

  // Trigger command with both Voice Audio + Animated Visual Arm Signal
  const triggerVisualSignal = (command: string, desc: string) => {
    setActiveSignal(command);
    setSignalDescription(desc);

    switch (command) {
      case "SQUAT":
        refereeVoice.commandSquat();
        break;
      case "RACK":
        refereeVoice.commandRack();
        break;
      case "START":
        refereeVoice.commandBenchStart();
        break;
      case "PRESS":
        refereeVoice.commandBenchPress();
        break;
      case "DOWN":
        refereeVoice.commandDeadliftDown();
        break;
    }

    // Auto-clear signal after 2.5 seconds
    setTimeout(() => {
      setActiveSignal(null);
    }, 2500);
  };

  // Loader Error Correction Handler (IPF Rule 8.4)
  const handleLoaderErrorHalt = async () => {
    setIsHalting(true);
    refereeVoice.playRedLightBuzzer();

    try {
      await reportLoaderWeightMismatchAction({
        declaredWeight,
        loadedWeight: declaredWeight - 2.5, // simulated mismatch
        lifterName,
      });

      if (onResetClock) {
        onResetClock(60);
      }

      setHaltNotice(`⚠️ PLATFORM HALTED: Loading team error detected! Attempt clock reset to 60s per IPF Rule 8.4.`);
      setTimeout(() => setHaltNotice(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to record loader error");
    } finally {
      setIsHalting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#180e0a] via-[#0f0704] to-[#070302] p-5 shadow-2xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-gym-primary" />
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white">
            Chief Referee Official Verbal &amp; Visual Arm Signals
          </h4>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono">
          IPF Standard: Audio Command + Hand Motion
        </span>
      </div>

      {haltNotice && (
        <div className="rounded-xl border border-red-500/50 bg-red-950/60 p-3 text-xs font-bold text-red-300 flex items-center gap-2 animate-bounce">
          <AlertOctagon className="h-4 w-4 text-red-400 shrink-0" />
          <span>{haltNotice}</span>
        </div>
      )}

      {/* Active Visual Signal Animated Display */}
      <div className="rounded-2xl border border-gym-primary/30 bg-black/70 p-4 min-h-[90px] flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500 block">
            Current Signal on Platform
          </span>
          {activeSignal ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gym-primary font-heading animate-pulse">
                🔊 "{activeSignal}!"
              </span>
              <span className="text-xs text-white font-medium">
                — {signalDescription}
              </span>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 italic">
              Awaiting referee command... Click any command button below or press its hotkey.
            </div>
          )}
        </div>

        {/* Visual Arm Icon Indicator */}
        <div className="h-12 w-12 rounded-xl bg-gym-primary/10 border border-gym-primary/30 flex items-center justify-center text-gym-primary">
          {activeSignal === "SQUAT" || activeSignal === "DOWN" || activeSignal === "START" ? (
            <ArrowDown className="h-6 w-6 animate-bounce" />
          ) : activeSignal === "PRESS" ? (
            <ArrowUp className="h-6 w-6 animate-bounce" />
          ) : activeSignal === "RACK" ? (
            <RotateCcw className="h-6 w-6 animate-spin" />
          ) : (
            <Mic className="h-5 w-5 text-zinc-600" />
          )}
        </div>
      </div>

      {/* Lift-Specific Command Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
          <span>Available Commands for {discipline.toUpperCase()}:</span>
          <span className="text-gym-primary">Click or use Hotkey</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {discipline === "squat" && (
            <>
              <button
                type="button"
                onClick={() =>
                  triggerVisualSignal(
                    "SQUAT",
                    "Arm sweeps downward from horizontal (Lifter initiates descent)"
                  )
                }
                className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold uppercase text-amber-300 font-heading block">
                    🔊 1. "SQUAT!" Command
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Downward arm signal when lifter is motionless with knees locked.
                  </span>
                </div>
                <kbd className="px-2 py-1 rounded bg-black/40 text-[10px] font-mono text-zinc-400 group-hover:text-white">
                  S
                </kbd>
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerVisualSignal(
                    "RACK",
                    "Arm moves backward towards rack (Lifter replaces bar)"
                  )
                }
                className="p-3 rounded-xl border border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold uppercase text-zinc-200 font-heading block">
                    🔊 2. "RACK!" Command
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Backward arm signal when lifter locks out and stands fully erect.
                  </span>
                </div>
                <kbd className="px-2 py-1 rounded bg-black/40 text-[10px] font-mono text-zinc-400 group-hover:text-white">
                  K
                </kbd>
              </button>
            </>
          )}

          {discipline === "bench" && (
            <>
              <button
                type="button"
                onClick={() =>
                  triggerVisualSignal(
                    "START",
                    "Arm sweeps downward from above (Lifter lowers bar to chest)"
                  )
                }
                className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold uppercase text-blue-300 font-heading block">
                    🔊 1. "START!" Command
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Given once bar is unracked and motionless over chest.
                  </span>
                </div>
                <kbd className="px-2 py-1 rounded bg-black/40 text-[10px] font-mono text-zinc-400 group-hover:text-white">
                  S
                </kbd>
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerVisualSignal(
                    "PRESS",
                    "Arm moves upward (Lifter presses bar up from chest pause)"
                  )
                }
                className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold uppercase text-amber-300 font-heading block">
                    🔊 2. "PRESS!" Command
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Given after bar is held completely motionless on chest.
                  </span>
                </div>
                <kbd className="px-2 py-1 rounded bg-black/40 text-[10px] font-mono text-zinc-400 group-hover:text-white">
                  P
                </kbd>
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerVisualSignal(
                    "RACK",
                    "Arm moves backward towards rack (Lifter replaces bar onto rack)"
                  )
                }
                className="p-3 rounded-xl border border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-left transition-all cursor-pointer flex items-center justify-between group sm:col-span-2"
              >
                <div>
                  <span className="text-xs font-bold uppercase text-zinc-200 font-heading block">
                    🔊 3. "RACK!" Command
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Given once both arms reach complete anatomical lockout over chest.
                  </span>
                </div>
                <kbd className="px-2 py-1 rounded bg-black/40 text-[10px] font-mono text-zinc-400 group-hover:text-white">
                  K
                </kbd>
              </button>
            </>
          )}

          {discipline === "deadlift" && (
            <>
              <div className="p-3 rounded-xl border border-zinc-800 bg-black/40 flex items-center gap-3 sm:col-span-1">
                <Info className="h-5 w-5 text-gym-primary shrink-0" />
                <div className="text-[11px] text-zinc-400 leading-snug">
                  <strong className="text-white block font-bold">No Start Audio Command in Deadlift:</strong>
                  Lifter initiates pull whenever ready after bar is loaded.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  triggerVisualSignal(
                    "DOWN",
                    "Arm sweeps downward sharply from shoulder (Lifter lowers bar under control)"
                  )
                }
                className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold uppercase text-red-300 font-heading block">
                    🔊 "DOWN!" Command + Arm Signal
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Given when knees locked and shoulders erect. Must lower with grip intact.
                  </span>
                </div>
                <kbd className="px-2 py-1 rounded bg-black/40 text-[10px] font-mono text-zinc-400 group-hover:text-white">
                  D
                </kbd>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ⚠️ LOADER ERROR CORRECTION BUTTON (IPF RULE 8.4) */}
      <div className="pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={handleLoaderErrorHalt}
          disabled={isHalting}
          className="w-full py-2.5 px-4 rounded-xl border border-red-600/40 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <AlertOctagon className="h-4 w-4 text-red-400" />
          <span>Halt Attempt: Loading Team Weight Mismatch (Reset 60s Clock)</span>
        </button>
      </div>
    </div>
  );
}
