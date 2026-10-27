"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Shield,
  CreditCard,
  FileText,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Share2,
} from "lucide-react";

export type MatchLifecycleStage =
  | "ASSIGNED"
  | "ACCEPTED"
  | "PRE_MATCH"
  | "CHECK_IN"
  | "LIVE"
  | "COMPLETED"
  | "REPORT_PENDING"
  | "APPROVED"
  | "PAID";

interface LifecycleStep {
  key: MatchLifecycleStage;
  label: string;
  shortLabel: string;
}

const LIFECYCLE_STEPS: LifecycleStep[] = [
  { key: "ASSIGNED", label: "Assigned", shortLabel: "Assign" },
  { key: "ACCEPTED", label: "Accepted", shortLabel: "Accept" },
  { key: "PRE_MATCH", label: "Pre-Match Inspection", shortLabel: "Inspect" },
  { key: "CHECK_IN", label: "Lifter Check-In", shortLabel: "Weigh-in" },
  { key: "LIVE", label: "Live Platform", shortLabel: "Live" },
  { key: "COMPLETED", label: "Session Complete", shortLabel: "Done" },
  { key: "REPORT_PENDING", label: "Report Pending", shortLabel: "Report" },
  { key: "APPROVED", label: "Jury Approved", shortLabel: "Approved" },
  { key: "PAID", label: "Stipend Paid", shortLabel: "Paid" },
];

interface NextMatchCommandCardProps {
  onOpenChecklist?: () => void;
  onOpenReport?: () => void;
  onOpenCalendar?: () => void;
  onOpenAiAssistant?: () => void;
}

export function NextMatchCommandCard({
  onOpenChecklist,
  onOpenReport,
  onOpenCalendar,
  onOpenAiAssistant,
}: NextMatchCommandCardProps) {
  const [currentStage, setCurrentStage] = useState<MatchLifecycleStage>("LIVE");
  const [assignmentAccepted, setAssignmentAccepted] = useState<boolean>(true);

  // Match details
  const matchInfo = {
    title: "Gujarat State Powerlifting Championship 2026",
    sessionName: "Men's Open & Masters 83kg / 93kg — Flight A & B",
    platform: "Platform 1 (Main Stage)",
    role: "Chief Technical Referee & Jury Member",
    date: "Today, October 5, 2026",
    time: "14:00 – 18:30 IST",
    countdown: "Starts in 42 minutes",
    venue: "Sardar Vallabhbhai Patel Indoor Stadium, Navrangpura, Ahmedabad",
    travelDistance: "14 km away",
    estimatedTravelTime: "28 min drive",
    mapsUrl: "https://maps.google.com/?q=Sardar+Vallabhbhai+Patel+Indoor+Stadium+Ahmedabad",
  };

  // Urgent action items
  const [actionItems, setActionItems] = useState([
    {
      id: "act-1",
      type: "URGENT",
      title: "Pre-Match Platform Safety Inspection Required",
      desc: "Complete 10-point combo rack & calibrated scale inspection before Platform 1 goes live.",
      actionLabel: "Start Checklist",
      onClick: onOpenChecklist,
      resolved: false,
    },
    {
      id: "act-2",
      type: "OVERDUE",
      title: "Overdue Session Report: District Baroda Trials Flight C",
      desc: "Jury certification signed, but incident summary report is pending submission.",
      actionLabel: "Submit Report",
      onClick: onOpenReport,
      resolved: false,
    },
    {
      id: "act-3",
      type: "PAYOUT",
      title: "Honorarium Stipend Claim Ready: ₹2,500",
      desc: "Session fee for West Zone Selection Meet approved by Federation Secretary.",
      actionLabel: "View Ledger",
      resolved: false,
    },
  ]);

  const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.key === currentStage);

  return (
    <div className="space-y-6">
      {/* 1. ACTION REQUIRED HIGH-PRIORITY PANEL (The 10-Second Rule) */}
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-zinc-950/80 to-zinc-950 p-4 sm:p-5 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
        <div className="flex items-center justify-between pb-3 border-b border-red-500/20 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-red-400">
                Action Required ({actionItems.filter((a) => !a.resolved).length} Urgent Items)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Mandatory operational tasks requiring immediate technical official sign-off
              </p>
            </div>
          </div>
          <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-300">
            High Priority
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                item.resolved
                  ? "border-emerald-500/20 bg-emerald-950/10 opacity-75"
                  : item.type === "URGENT"
                  ? "border-gym-primary/40 bg-zinc-900/80 hover:border-gym-primary"
                  : item.type === "OVERDUE"
                  ? "border-red-500/40 bg-zinc-900/80 hover:border-red-500"
                  : "border-amber-500/40 bg-zinc-900/80 hover:border-amber-500"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      item.type === "URGENT"
                        ? "bg-gym-primary/20 text-gym-primary border border-gym-primary/30"
                        : item.type === "OVERDUE"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {item.type}
                  </span>
                  {item.resolved && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{item.desc}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={item.onClick}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gym-primary hover:text-orange-400 hover:underline"
                >
                  <span>{item.actionLabel}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActionItems((prev) =>
                      prev.map((a) => (a.id === item.id ? { ...a, resolved: !a.resolved } : a))
                    )
                  }
                  className="text-[10px] text-zinc-500 hover:text-zinc-300"
                >
                  {item.resolved ? "Reopen" : "Dismiss"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. COMMAND CENTER HEADER & NEXT MATCH CARD */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#140b06] to-[#080201] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-gym-primary/10 blur-[80px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Active Shift • Platform Live
              </span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                {matchInfo.platform}
              </span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
              {matchInfo.title}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gym-primary mt-0.5">
              {matchInfo.sessionName} • <span className="text-zinc-300">{matchInfo.role}</span>
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={onOpenChecklist}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-gym-primary px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-orange-600 transition-all active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Pre-Match Checklist</span>
            </button>
            <button
              type="button"
              onClick={onOpenReport}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
            >
              <FileText className="h-4 w-4 text-gym-primary" />
              <span>Match Report</span>
            </button>
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-950/30 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-900/40 hover:text-white transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>AI Notes</span>
            </button>
          </div>
        </div>

        {/* Travel Time & Venue Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-300 shrink-0">
              <Clock className="h-4 w-4 text-gym-primary" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Timing & Status</span>
              <p className="text-xs font-bold text-white mt-0.5">{matchInfo.time}</p>
              <p className="text-[11px] font-semibold text-emerald-400">{matchInfo.countdown}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-300 shrink-0">
              <MapPin className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Championship Venue</span>
              <p className="text-xs font-bold text-white mt-0.5 line-clamp-1">{matchInfo.venue}</p>
              <a
                href={matchInfo.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:underline"
              >
                <Navigation className="h-3 w-3" />
                <span>{matchInfo.travelDistance} ({matchInfo.estimatedTravelTime})</span>
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-300 shrink-0">
              <Calendar className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Official Roster</span>
              <p className="text-xs font-bold text-white mt-0.5">3 Referees • 1 Jury President</p>
              <button
                type="button"
                onClick={onOpenCalendar}
                className="text-[11px] font-semibold text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Sync with Google/Apple Calendar</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. VISUAL MATCH LIFECYCLE PIPELINE */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
              Match Lifecycle Progression Pipeline
            </span>
            <span className="text-xs font-bold text-gym-primary">
              Stage: {LIFECYCLE_STEPS[currentIndex]?.label}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setCurrentStage(step.key)}
                  className={`flex flex-col items-center justify-center rounded-xl p-2 border transition-all text-center ${
                    isCurrent
                      ? "border-gym-primary bg-gym-primary/15 shadow-[0_0_15px_rgba(230,80,27,0.3)] ring-1 ring-gym-primary"
                      : isPast
                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400"
                      : "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold mb-1 ${
                      isCurrent
                        ? "bg-gym-primary text-white"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-white/10 text-zinc-400"
                    }`}
                  >
                    {isPast ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider line-clamp-1 ${
                      isCurrent ? "text-white" : isPast ? "text-emerald-300" : "text-zinc-500"
                    }`}
                  >
                    {step.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
