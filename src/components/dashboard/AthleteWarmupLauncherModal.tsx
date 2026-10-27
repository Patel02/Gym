"use client";

import { WarmupCalculatorApp } from "@/components/tools/WarmupCalculatorApp";
import { Dumbbell, ExternalLink, Flame, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AthleteWarmupLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteName?: string;
  bodyweight?: number;
  initialSquatOpener?: number;
  initialBenchOpener?: number;
  initialDeadliftOpener?: number;
}

export function AthleteWarmupLauncherModal({
  isOpen,
  onClose,
  athleteName = "Athlete",
  bodyweight = 83,
  initialSquatOpener = 210,
  initialBenchOpener = 140,
  initialDeadliftOpener = 230,
}: AthleteWarmupLauncherModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#0e0301] p-4 sm:p-7 shadow-[0_0_80px_rgba(230,80,27,0.3)] text-white my-auto">
        
        {/* Modal Top Controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gym-primary/40 bg-gym-primary/20 text-gym-primary shadow-md">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                  Meet Warm-Up &amp; Plate Calculator
                </span>
                <span className="rounded-full border border-gym-primary/40 bg-gym-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gym-primary">
                  Athlete Hub
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Calibrated plate loading &amp; 3-attempt competition strategy for {athleteName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tools/warmup-calculator"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5 text-gym-primary" />
              <span>Full Screen Page</span>
            </Link>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Embedded Warm-Up Calculator App */}
        <WarmupCalculatorApp
          initialOpener={initialSquatOpener}
          initialDiscipline="SQUAT"
          athleteName={athleteName}
          bodyweight={bodyweight}
        />
      </div>
    </div>,
    document.body
  );
}
