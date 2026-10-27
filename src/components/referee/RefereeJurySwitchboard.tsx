"use client";

import React, { useState, useEffect, useCallback } from "react";
import { refereeVoice } from "@/lib/referee-voice-commands";
import {
  Volume2,
  VolumeX,
  Mic,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Dumbbell,
  Send,
  RotateCcw,
  Keyboard,
  Radio,
} from "lucide-react";

export type RefereeColor = "WHITE" | "RED";
export type InfractionCard = "NONE" | "RED" | "BLUE" | "YELLOW";

export type RefereeStation = "ALL" | "REF1" | "CHIEF" | "REF3";

interface RefereeJurySwitchboardProps {
  athleteName: string;
  weightClass: string;
  discipline: "squat" | "bench" | "deadlift";
  attemptNumber: 1 | 2 | 3;
  declaredWeight: number;
  onDecisionSubmit: (
    ref1: RefereeColor,
    chiefRef: RefereeColor,
    ref3: RefereeColor,
    card: InfractionCard,
    reason: string
  ) => void;
  isSubmitting?: boolean;
  onToggleShortcutsModal?: () => void;
}

export function RefereeJurySwitchboard({
  athleteName,
  weightClass,
  discipline,
  attemptNumber,
  declaredWeight,
  onDecisionSubmit,
  isSubmitting = false,
  onToggleShortcutsModal,
}: RefereeJurySwitchboardProps) {
  const [station, setStation] = useState<RefereeStation>("ALL");
  const [ref1, setRef1] = useState<RefereeColor>("WHITE");
  const [chiefRef, setChiefRef] = useState<RefereeColor>("WHITE");
  const [ref3, setRef3] = useState<RefereeColor>("WHITE");
  const [selectedCard, setSelectedCard] = useState<InfractionCard>("NONE");
  const [infractionReason, setInfractionReason] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

  // Sync mute state
  refereeVoice.isMuted = isMuted;

  // Compute decision
  const whiteCount = [ref1, chiefRef, ref3].filter((l) => l === "WHITE").length;
  const isGoodLift = whiteCount >= 2;

  // Handle Voice Commands
  const triggerVoice = useCallback((cmd: string) => {
    switch (cmd) {
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
  }, []);

  const handleSubmit = useCallback(() => {
    if (isGoodLift) {
      refereeVoice.playWhiteLightChime();
    } else {
      refereeVoice.playRedLightBuzzer();
    }
    // Haptic vibration feedback on supported devices (phones / tablets)
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      navigator.vibrate(isGoodLift ? [50, 50, 100] : [120, 80, 120]);
    }
    onDecisionSubmit(ref1, chiefRef, ref3, isGoodLift ? "NONE" : selectedCard, infractionReason);
  }, [isGoodLift, onDecisionSubmit, ref1, chiefRef, ref3, selectedCard, infractionReason]);

  const resetLights = useCallback(() => {
    setRef1("WHITE");
    setChiefRef("WHITE");
    setRef3("WHITE");
    setSelectedCard("NONE");
    setInfractionReason("");
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case "1":
          e.preventDefault();
          setRef1("WHITE");
          setLastKeyPressed("1 (Ref 1 White)");
          break;
        case "2":
          e.preventDefault();
          setRef1("RED");
          setLastKeyPressed("2 (Ref 1 Red)");
          break;
        case "3":
          e.preventDefault();
          setChiefRef("WHITE");
          setLastKeyPressed("3 (Chief White)");
          break;
        case "4":
          e.preventDefault();
          setChiefRef("RED");
          setLastKeyPressed("4 (Chief Red)");
          break;
        case "5":
          e.preventDefault();
          setRef3("WHITE");
          setLastKeyPressed("5 (Ref 3 White)");
          break;
        case "6":
          e.preventDefault();
          setRef3("RED");
          setLastKeyPressed("6 (Ref 3 Red)");
          break;
        case " ":
          e.preventDefault();
          handleSubmit();
          setLastKeyPressed("Space (Submit)");
          break;
        case "r":
        case "R":
          e.preventDefault();
          resetLights();
          setLastKeyPressed("R (Reset)");
          break;
        case "s":
        case "S":
          e.preventDefault();
          if (discipline === "squat") triggerVoice("SQUAT");
          if (discipline === "bench") triggerVoice("START");
          setLastKeyPressed("S (Command)");
          break;
        case "p":
        case "P":
          e.preventDefault();
          if (discipline === "bench") triggerVoice("PRESS");
          setLastKeyPressed("P (Press)");
          break;
        case "k":
        case "K":
          e.preventDefault();
          triggerVoice("RACK");
          setLastKeyPressed("K (Rack)");
          break;
        case "d":
        case "D":
          e.preventDefault();
          if (discipline === "deadlift") triggerVoice("DOWN");
          setLastKeyPressed("D (Down)");
          break;
        case "?":
          e.preventDefault();
          if (onToggleShortcutsModal) onToggleShortcutsModal();
          break;
      }

      setTimeout(() => setLastKeyPressed(null), 1500);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [discipline, handleSubmit, onToggleShortcutsModal, resetLights, triggerVoice]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-700 bg-gradient-to-b from-[#18181b] via-[#101013] to-[#09090b] p-6 sm:p-8 shadow-2xl">
      {/* Corner metallic rivets */}
      <div className="absolute top-3 left-3 h-2 w-2 rounded-full bg-zinc-600 border border-zinc-400 opacity-60" />
      <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-zinc-600 border border-zinc-400 opacity-60" />
      <div className="absolute bottom-3 left-3 h-2 w-2 rounded-full bg-zinc-600 border border-zinc-400 opacity-60" />
      <div className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-zinc-600 border border-zinc-400 opacity-60" />

      {/* ── TOP CONSOLE BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-gym-primary font-heading">
              IPF Category 1 / 2 Electronic Jury Console
            </span>
          </div>
          <h3 className="text-xl font-bold uppercase tracking-wider text-white font-heading mt-0.5">
            Platform 1 Official Switchboard
          </h3>
        </div>

        {/* Station Mode & Utilities */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Station Switcher */}
          <div className="flex items-center rounded-xl border border-zinc-700 bg-black/60 p-1 text-[10px] font-semibold uppercase">
            <button
              type="button"
              onClick={() => setStation("ALL")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                station === "ALL" ? "bg-gym-primary text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              All 3 Lights
            </button>
            <button
              type="button"
              onClick={() => setStation("CHIEF")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                station === "CHIEF" ? "bg-gym-primary text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Chief Seat
            </button>
            <button
              type="button"
              onClick={() => setStation("REF1")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                station === "REF1" ? "bg-gym-primary text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Left (Ref 1)
            </button>
            <button
              type="button"
              onClick={() => setStation("REF3")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                station === "REF3" ? "bg-gym-primary text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Right (Ref 3)
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          {onToggleShortcutsModal && (
            <button
              type="button"
              onClick={onToggleShortcutsModal}
              className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-2 text-zinc-400 hover:text-gym-primary hover:border-gym-primary/40 transition-all cursor-pointer"
              title="Keyboard Shortcuts (Hotkeys)"
            >
              <Keyboard className="h-4 w-4" />
            </button>
          )}

          {/* Audio Mute/Unmute */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-2 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title={isMuted ? "Unmute Voice Commands" : "Mute Voice Commands"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>

          {/* Reset Switchboard */}
          <button
            type="button"
            onClick={resetLights}
            className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset ⚪⚪⚪</span>
          </button>
        </div>
      </div>

      {/* Floating Key Pressed Notice */}
      {lastKeyPressed && (
        <div className="absolute top-4 right-1/2 translate-x-1/2 z-20 px-3 py-1 rounded-full bg-gym-primary text-white font-mono text-[11px] font-semibold uppercase shadow-lg shadow-gym-primary/30 animate-bounce">
          ⚡ Hotkey: {lastKeyPressed}
        </div>
      )}

      {/* ── ACTIVE PLATFORM CALLOUT ── */}
      <div className="rounded-2xl border border-white/10 bg-black/60 p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
            Lifter on Platform
          </span>
          <div className="text-lg font-bold uppercase text-white font-heading">
            {athleteName}{" "}
            <span className="text-xs text-zinc-400 font-sans font-normal">({weightClass})</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
              Attempt Call
            </span>
            <span className="text-base font-bold uppercase text-gym-primary font-heading">
              {discipline} • Attempt {attemptNumber}
            </span>
          </div>

          <div className="rounded-xl border border-gym-primary/40 bg-gym-primary/15 px-4 py-2 text-center">
            <span className="text-[9px] font-bold uppercase text-gym-primary block">Declared</span>
            <span className="text-xl font-bold text-white font-heading font-mono">{declaredWeight} KG</span>
          </div>
        </div>
      </div>

      {/* ── CHIEF REFEREE VOICE COMMANDS BUTTONS ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Mic className="h-3.5 w-3.5 text-gym-primary" />
            <span>Chief Referee Platform Audible Commands:</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            Hotkeys: [S], [P], [K], [D]
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {discipline === "squat" && (
            <>
              <button
                type="button"
                onClick={() => triggerVoice("SQUAT")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>🔊 "Squat!"</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono">S</kbd>
              </button>
              <button
                type="button"
                onClick={() => triggerVoice("RACK")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-zinc-700 to-zinc-600 hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>🔊 "Rack!"</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono">K</kbd>
              </button>
            </>
          )}

          {discipline === "bench" && (
            <>
              <button
                type="button"
                onClick={() => triggerVoice("START")}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>🔊 "Start!"</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono">S</kbd>
              </button>
              <button
                type="button"
                onClick={() => triggerVoice("PRESS")}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>🔊 "Press!"</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono">P</kbd>
              </button>
              <button
                type="button"
                onClick={() => triggerVoice("RACK")}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-zinc-700 to-zinc-600 hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>🔊 "Rack!"</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono">K</kbd>
              </button>
            </>
          )}

          {discipline === "deadlift" && (
            <button
              type="button"
              onClick={() => triggerVoice("DOWN")}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <span>🔊 "Down!" (Hand Signal)</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono">D</kbd>
            </button>
          )}
        </div>
      </div>

      {/* ── 3-REFEREE LIGHT SWITCHBOARD (LEFT, CHIEF, RIGHT) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* REF 1 (LEFT SIDE) */}
        <div
          className={`rounded-2xl border p-5 flex flex-col items-center justify-between text-center space-y-4 transition-all ${
            station === "REF1"
              ? "border-gym-primary/80 bg-gym-primary/5 ring-2 ring-gym-primary/30"
              : "border-zinc-800 bg-black/60"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Left Side Referee (Ref 1)
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] font-mono text-zinc-400">1/2</kbd>
          </div>

          {/* Light Bulb */}
          <div
            onClick={() => setRef1(ref1 === "WHITE" ? "RED" : "WHITE")}
            className={`h-24 w-24 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer active:scale-95 ${
              ref1 === "WHITE"
                ? "border-white bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.9)]"
                : "border-red-500 bg-red-600 text-white shadow-[0_0_50px_rgba(239,68,68,0.9)]"
            }`}
          >
            <span className="font-heading text-3xl font-bold">
              {ref1 === "WHITE" ? "⚪" : "🔴"}
            </span>
          </div>

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => setRef1("WHITE")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                ref1 === "WHITE"
                  ? "bg-white text-black shadow-md"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <span>White</span>
              <kbd className="text-[9px] opacity-70">[1]</kbd>
            </button>
            <button
              type="button"
              onClick={() => setRef1("RED")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                ref1 === "RED"
                  ? "bg-red-600 text-white shadow-md shadow-red-950"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <span>Red</span>
              <kbd className="text-[9px] opacity-70">[2]</kbd>
            </button>
          </div>
        </div>

        {/* CHIEF CENTER REFEREE */}
        <div
          className={`rounded-2xl border-2 p-5 flex flex-col items-center justify-between text-center space-y-4 shadow-xl transition-all ${
            station === "CHIEF"
              ? "border-gym-primary ring-4 ring-gym-primary/40 bg-gradient-to-b from-gym-primary/20 via-black to-black"
              : "border-gym-primary/50 bg-gradient-to-b from-gym-primary/10 via-black/80 to-black"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gym-primary font-heading">
              Chief Center Referee
            </span>
            <span className="rounded bg-gym-primary/20 text-gym-primary text-[9px] font-semibold px-1.5 py-0.5">
              LEAD
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] font-mono text-zinc-400">3/4</kbd>
          </div>

          {/* Large Bulb */}
          <div
            onClick={() => setChiefRef(chiefRef === "WHITE" ? "RED" : "WHITE")}
            className={`h-28 w-28 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer active:scale-95 ${
              chiefRef === "WHITE"
                ? "border-white bg-white text-black shadow-[0_0_60px_rgba(255,255,255,0.95)]"
                : "border-red-500 bg-red-600 text-white shadow-[0_0_60px_rgba(239,68,68,0.95)]"
            }`}
          >
            <span className="font-heading text-4xl font-bold">
              {chiefRef === "WHITE" ? "⚪" : "🔴"}
            </span>
          </div>

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => setChiefRef("WHITE")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                chiefRef === "WHITE"
                  ? "bg-white text-black shadow-md"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <span>White</span>
              <kbd className="text-[9px] opacity-70">[3]</kbd>
            </button>
            <button
              type="button"
              onClick={() => setChiefRef("RED")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                chiefRef === "RED"
                  ? "bg-red-600 text-white shadow-md shadow-red-950"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <span>Red</span>
              <kbd className="text-[9px] opacity-70">[4]</kbd>
            </button>
          </div>
        </div>

        {/* REF 3 (RIGHT SIDE) */}
        <div
          className={`rounded-2xl border p-5 flex flex-col items-center justify-between text-center space-y-4 transition-all ${
            station === "REF3"
              ? "border-gym-primary/80 bg-gym-primary/5 ring-2 ring-gym-primary/30"
              : "border-zinc-800 bg-black/60"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Right Side Referee (Ref 3)
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] font-mono text-zinc-400">5/6</kbd>
          </div>

          {/* Light Bulb */}
          <div
            onClick={() => setRef3(ref3 === "WHITE" ? "RED" : "WHITE")}
            className={`h-24 w-24 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer active:scale-95 ${
              ref3 === "WHITE"
                ? "border-white bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.9)]"
                : "border-red-500 bg-red-600 text-white shadow-[0_0_50px_rgba(239,68,68,0.9)]"
            }`}
          >
            <span className="font-heading text-3xl font-bold">
              {ref3 === "WHITE" ? "⚪" : "🔴"}
            </span>
          </div>

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => setRef3("WHITE")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                ref3 === "WHITE"
                  ? "bg-white text-black shadow-md"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <span>White</span>
              <kbd className="text-[9px] opacity-70">[5]</kbd>
            </button>
            <button
              type="button"
              onClick={() => setRef3("RED")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                ref3 === "RED"
                  ? "bg-red-600 text-white shadow-md shadow-red-950"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <span>Red</span>
              <kbd className="text-[9px] opacity-70">[6]</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* ── LIVE VERDICT PREVIEW BANNER ── */}
      <div
        className={`rounded-2xl border p-4 my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all ${
          isGoodLift
            ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300 shadow-lg shadow-emerald-950/30"
            : "border-red-500/50 bg-red-950/30 text-red-300 shadow-lg shadow-red-950/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {isGoodLift ? (
            <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-7 w-7 text-red-400 shrink-0" />
          )}
          <div>
            <div className="text-base font-bold uppercase font-heading flex items-center gap-2">
              <span>{isGoodLift ? `GOOD LIFT (${whiteCount} WHITE LIGHTS)` : `NO LIFT (${3 - whiteCount} RED LIGHTS)`}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40">
                {ref1 === "WHITE" ? "⚪" : "🔴"} {chiefRef === "WHITE" ? "⚪" : "🔴"} {ref3 === "WHITE" ? "⚪" : "🔴"}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {isGoodLift
                ? `Will be recorded as +${declaredWeight} KG in official championship results.`
                : `Will be recorded as -${declaredWeight} KG with card infraction penalty.`}
            </p>
          </div>
        </div>

        {/* 3-Card Infraction Pills if No Lift */}
        {!isGoodLift && (
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "RED", label: "🟥 Red (Depth / Lockout)", desc: "Rule 4.2.1 / 4.2.2" },
              { id: "BLUE", label: "🟦 Blue (Downward / Hitch)", desc: "Rule 4.2.3 / 5.2.2" },
              { id: "YELLOW", label: "🟨 Yellow (Foot / Command)", desc: "Rule 4.2.4 / 5.2.1" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCard(c.id as any);
                  setInfractionReason(c.desc);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-start ${
                  selectedCard === c.id
                    ? "bg-white text-black font-black shadow-lg scale-105"
                    : "bg-black/60 border border-white/15 text-zinc-300 hover:text-white"
                }`}
              >
                <span>{c.label}</span>
                <span className="text-[9px] opacity-75">{c.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── SUBMIT VERDICT BUTTON ── */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl active:scale-[0.99] ${
          isGoodLift
            ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:brightness-110 text-white shadow-emerald-950"
            : "bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:brightness-110 text-white shadow-red-950"
        } disabled:opacity-50`}
      >
        <Send className="h-4 w-4" />
        <span>
          {isSubmitting
            ? "Broadcasting to Match Arena..."
            : `Submit Verdict: ${isGoodLift ? "GOOD LIFT (⚪⚪⚪)" : "NO LIFT (🔴🔴🔴)"} — [Space]`}
        </span>
      </button>
    </div>
  );
}
