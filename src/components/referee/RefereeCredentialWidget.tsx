"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface RefereeCredentialWidgetProps {
  refereeName?: string;
  credentialCode?: string;
  category?: string;
  scorePercent?: number;
}

export function RefereeCredentialWidget({
  refereeName = "National Technical Official",
  credentialCode = "IPF-REF-2026-ZNPP1",
  category = "IPF Category 2 Official Trainee",
  scorePercent = 100,
}: RefereeCredentialWidgetProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-black to-zinc-950 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/40 text-amber-400 shadow-lg">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                Official Credential Status
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
              {refereeName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
              <span>License: <strong className="font-mono text-white">{credentialCode}</strong></span>
              <span>•</span>
              <span className="text-amber-300 font-bold">{category}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="rounded-xl border border-white/10 bg-black/50 px-3.5 py-1.5 text-center">
            <span className="text-[9px] font-bold uppercase text-zinc-400 block">Exam Accuracy</span>
            <span className="text-sm font-black text-emerald-400 font-heading">
              {scorePercent}% (Pass)
            </span>
          </div>

          <Link
            href="/rules/referee-exam"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
          >
            <span>Retake Exam</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
