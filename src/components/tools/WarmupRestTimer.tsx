"use client";

import { Bell, BellOff, Clock, Pause, Play, RotateCcw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface WarmupRestTimerProps {
  initialSeconds?: number;
  className?: string;
}

export function WarmupRestTimer({
  initialSeconds = 180,
  className = "",
}: WarmupRestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play synthetic Web Audio API chime
  const playChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Dual frequency completion chord (880Hz & 1320Hz)
      const now = ctx.currentTime;
      [880, 1320].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch {
      // Ignore audio policy blocks
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled]);

  const handleSetPreset = (secs: number) => {
    setIsRunning(false);
    setTotalSeconds(secs);
    setTimeLeft(secs);
  };

  const handleToggle = () => {
    if (timeLeft === 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const isWarning = timeLeft > 0 && timeLeft <= 15;
  const isFinished = timeLeft === 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#180803] via-[#0d0301] to-[#120402] p-4 sm:p-5 shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gym-primary" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-white">
            Warm-Up Rest &amp; Flight Timer
          </span>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          title={soundEnabled ? "Mute audio chime" : "Enable audio chime"}
        >
          {soundEnabled ? (
            <Bell className="h-3.5 w-3.5 text-gym-primary" />
          ) : (
            <BellOff className="h-3.5 w-3.5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Timer Display & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Big Digital Numbers with pulsing border */}
        <div
          className={`flex items-center justify-center rounded-2xl px-6 py-2.5 border transition-all ${
            isFinished
              ? "border-red-500/80 bg-red-950/40 text-red-400 animate-pulse"
              : isWarning
              ? "border-amber-500/80 bg-amber-950/40 text-amber-400 animate-pulse"
              : "border-white/15 bg-black/60 text-white"
          }`}
        >
          <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest leading-none">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
              isRunning
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-gradient-to-r from-gym-primary to-gym-red text-white hover:brightness-110"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{timeLeft === 0 ? "Restart" : "Start"}</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">
          Presets:
        </span>
        {[
          { label: "1m (Primer)", sec: 60 },
          { label: "2m", sec: 120 },
          { label: "3m (Standard)", sec: 180 },
          { label: "4m", sec: 240 },
          { label: "5m (Opener)", sec: 300 },
        ].map((p) => (
          <button
            key={p.sec}
            onClick={() => handleSetPreset(p.sec)}
            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
              totalSeconds === p.sec
                ? "bg-gym-primary text-white shadow-xs"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
