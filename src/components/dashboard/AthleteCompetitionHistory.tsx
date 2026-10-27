"use client";

import {
  getUserCompetitionHistoryAction,
  type AthleteCompetitionSummary,
  type CompetitionHistoryItem,
  type MissedAttemptDiagnostic,
} from "@/actions/athlete-competition.actions";
import {
  getAthleteCertificatesAction,
  type CompetitionCertificatePayload,
} from "@/actions/certificate.actions";
import { CompetitionCertificateModal } from "@/components/credentials/CompetitionCertificateModal";
import { AthleteWarmupLauncherModal } from "@/components/dashboard/AthleteWarmupLauncherModal";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Dumbbell,
  Flame,
  Lightbulb,
  Medal,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  UserCheck,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

interface AthleteCompetitionHistoryProps {
  initialSummary: AthleteCompetitionSummary;
  athleteName?: string;
}

export function AthleteCompetitionHistory({
  initialSummary,
  athleteName = "Athlete",
}: AthleteCompetitionHistoryProps) {
  const [summary, setSummary] = useState<AthleteCompetitionSummary>(initialSummary);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedCompId, setSelectedCompId] = useState<string>(
    initialSummary.competitions.length > 0 ? initialSummary.competitions[0].id : ""
  );
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");
  const [activeTab, setActiveTab] = useState<"SCOREBOARD" | "COACH_ANALYSIS">("SCOREBOARD");
  const [selectedCert, setSelectedCert] = useState<CompetitionCertificatePayload | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);
  const [isLoadingCert, setIsLoadingCert] = useState<boolean>(false);
  const [isWarmupModalOpen, setIsWarmupModalOpen] = useState<boolean>(false);

  const handleOpenCertificate = async (meetId?: string) => {
    setIsLoadingCert(true);
    try {
      const res = await getAthleteCertificatesAction();
      if (res.success && res.certificates && res.certificates.length > 0) {
        const found =
          res.certificates.find((c) => c.meetId === meetId || c.meetId === activeComp?.eventId || c.meetId === activeComp?.id) ||
          res.certificates[0];
        setSelectedCert(found);
        setIsCertModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load certificate:", err);
    } finally {
      setIsLoadingCert(false);
    }
  };

  // Keep selectedCompId in sync if competitions change
  useEffect(() => {
    if (
      summary.competitions.length > 0 &&
      !summary.competitions.some((c) => c.id === selectedCompId)
    ) {
      setSelectedCompId(summary.competitions[0].id);
    }
  }, [summary.competitions, selectedCompId]);

  // Manual Sync function
  const handleSyncData = async () => {
    setIsRefreshing(true);
    try {
      const res = await getUserCompetitionHistoryAction();
      if (res.success && res.summary) {
        setSummary(res.summary);
        setLastSyncedTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch (err) {
      console.warn("Manual sync error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Real-time background auto-polling (every 3.5 seconds when tab is active)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      try {
        const res = await getUserCompetitionHistoryAction();
        if (res.success && res.summary) {
          const fresh = res.summary;
          setSummary((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(fresh)) {
              setLastSyncedTime(
                new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              );
              return fresh;
            }
            return prev;
          });
        }
      } catch (err) {
        // Silent background poll error
      }
    }, 3500);

    return () => clearInterval(pollInterval);
  }, []);

  const activeComp: CompetitionHistoryItem | null =
    summary.competitions.find((c) => c.id === selectedCompId) ||
    summary.competitions[0] ||
    null;

  if (summary.totalMeetsPlayed === 0 || !activeComp) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-[#160603] to-[#0d0301] p-10 text-center shadow-2xl backdrop-blur-xl lg:col-span-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gym-primary/30 bg-gym-primary/10 text-gym-primary shadow-inner">
          <Trophy className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wider text-white">
          Championship History & Performance Records
        </h2>
        <p className="mt-2 max-w-md text-xs font-medium text-gray-400 leading-relaxed">
          You have not participated in any sanctioned powerlifting meets yet. Register for an official championship to
          unlock live stage attempts, official IPF ranking, and coach biomechanical diagnostics!
        </p>
        <Link
          href="/championships"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gym-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-gym-primary/20 transition-all hover:brightness-110"
        >
          <span>Explore Sanctioned Meets</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const renderAttemptPill = (label: string, val: number | null) => {
    if (val === null || val === undefined || val === 0) {
      return (
        <div className="flex flex-col items-center rounded-lg border border-white/5 bg-[#120502] p-2 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
          <span className="mt-0.5 text-xs font-bold text-gray-600">—</span>
        </div>
      );
    }

    const isGood = val > 0;
    return (
      <div
        className={`flex flex-col items-center rounded-lg border p-2 text-center transition-all ${
          isGood
            ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            : "border-red-500/30 bg-red-950/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
        }`}
      >
        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
          <span>{label}</span>
          {isGood ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        </div>
        <span
          className={`mt-0.5 font-heading text-sm font-black ${
            isGood ? "text-emerald-300" : "text-red-300 line-through"
          }`}
        >
          {Math.abs(val)} KG
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 lg:col-span-2">
      {/* 1. TOP HEADER & REAL-TIME SYNC STATUS STRIP */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#180603] via-[#0e0301] to-[#120502] p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gym-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                LIVE STAGE SYNCED • IPF REFEREE JURY LINKED
              </span>
            </div>
            <h2 className="mt-1 font-heading text-2xl font-bold uppercase tracking-wider text-white">
              Championship Records <span className="text-gym-primary">& Coach Diagnostic</span>
            </h2>
            <p className="text-xs text-gray-400">
              Live attempt results, ranking placement & biomechanical mistake analysis for athlete and coach.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#200803] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-gray-200 transition-all hover:border-gym-primary hover:text-white"
              title="Click to force refresh from live scoring ledger"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-gym-primary" : ""}`} />
              <span>Sync Now</span>
            </button>
          </div>
        </div>

        {/* 2. SUMMARY KPI STATS TILES */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Competitions Played */}
          <div className="rounded-xl border border-white/10 bg-[#0c0301] p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <Trophy className="h-3.5 w-3.5 text-gym-primary" />
              <span>Competitions</span>
            </div>
            <div className="mt-1 font-heading text-2xl font-bold text-white">
              {summary.totalMeetsPlayed}{" "}
              <span className="text-xs font-bold text-gray-400">
                {summary.totalMeetsPlayed === 1 ? "MEET" : "MEETS"}
              </span>
            </div>
          </div>

          {/* Championship Rank */}
          <div className="rounded-xl border border-white/10 bg-[#0c0301] p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <Medal className="h-3.5 w-3.5 text-amber-400" />
              <span>Current Rank</span>
            </div>
            <div className="mt-1 font-heading text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
              {activeComp.rank === 1 ? (
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-400 font-black">
                  🥇 #1 GOLD
                </span>
              ) : activeComp.rank === 2 ? (
                <span className="rounded bg-gray-400/20 px-2 py-0.5 text-gray-300 font-black">
                  🥈 #2 SILVER
                </span>
              ) : activeComp.rank === 3 ? (
                <span className="rounded bg-amber-700/20 px-2 py-0.5 text-amber-600 font-black">
                  🥉 #3 BRONZE
                </span>
              ) : (
                <span>#{activeComp.rank}</span>
              )}
            </div>
          </div>

          {/* Attempt Conversion Rate */}
          <div className="rounded-xl border border-white/10 bg-[#0c0301] p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <Target className="h-3.5 w-3.5 text-emerald-400" />
              <span>White Light Rate</span>
            </div>
            <div className="mt-1 font-heading text-2xl font-bold text-emerald-400">
              {activeComp.successRate}%
              <span className="ml-1 text-[10px] font-bold text-gray-400">
                ({activeComp.successfulCount}/{activeComp.attemptsCount})
              </span>
            </div>
          </div>

          {/* Best Total KG & IPF GL */}
          <div className="rounded-xl border border-white/10 bg-[#0c0301] p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gym-primary">
              <Flame className="h-3.5 w-3.5 text-gym-primary" />
              <span>Official Total</span>
            </div>
            <div className="mt-1 font-heading text-2xl font-bold text-gym-primary">
              {activeComp.total || 0} <span className="text-xs font-bold">KG</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTI-MEET SELECTOR (IF USER HAS MORE THAN 1 MEET) */}
      {summary.competitions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Select Championship:
          </span>
          {summary.competitions.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setSelectedCompId(comp.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                comp.id === selectedCompId
                  ? "border border-gym-primary bg-gym-primary text-white shadow-md"
                  : "border border-white/10 bg-[#140603] text-gray-400 hover:text-white"
              }`}
            >
              {comp.eventTitle}
            </button>
          ))}
        </div>
      )}

      {/* 4. ACTIVE MEET DETAILS CARD & TAB SWITCHER */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#150603] to-[#0c0301] p-6 shadow-2xl backdrop-blur-xl">
        {/* Meet Banner Header */}
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gym-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-gym-primary">
                {activeComp.division} • {activeComp.equipment}
              </span>
              <span className="text-xs text-gray-400">{activeComp.eventDate}</span>
            </div>
            <h3 className="mt-1 font-heading text-xl font-bold uppercase tracking-wider text-white">
              {activeComp.eventTitle}
            </h3>
            <p className="text-xs text-gray-400">{activeComp.eventLocation}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-[#0e0301] px-3.5 py-2 text-right">
              <div className="text-[10px] font-bold uppercase text-gray-400">Weigh-in Bodyweight</div>
              <div className="text-sm font-black text-white">
                {activeComp.bodyweight} KG{" "}
                <span className="text-xs text-gym-primary">({activeComp.weightClass})</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0e0301] px-3.5 py-2 text-right">
              <div className="text-[10px] font-bold uppercase text-gray-400">IPF GL Points</div>
              <div className="font-mono text-sm font-black text-gym-primary">
                {activeComp.ipfGlPoints ? activeComp.ipfGlPoints.toFixed(2) : "0.00"}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls: Scoreboard vs Coach Analysis & Certificate Action */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("SCOREBOARD")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "SCOREBOARD"
                  ? "border-2 border-gym-primary bg-gym-primary text-white shadow-lg shadow-gym-primary/20"
                  : "border border-white/10 bg-[#100402] text-gray-400 hover:text-white"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Official Attempt Scoreboard</span>
            </button>

            <button
              onClick={() => setActiveTab("COACH_ANALYSIS")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "COACH_ANALYSIS"
                  ? "border-2 border-amber-500 bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "border border-white/10 bg-[#100402] text-amber-400 hover:text-amber-300"
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              <span>Coach & Technical Diagnostic</span>
              {activeComp.failedCount > 0 && (
                <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                  {activeComp.failedCount} Missed
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsWarmupModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-gym-primary/50 bg-gradient-to-r from-gym-primary/20 via-gym-red/30 to-gym-primary/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white transition-all shadow-[0_0_15px_rgba(230,80,27,0.25)] cursor-pointer"
            >
              <Dumbbell className="h-4 w-4 text-gym-primary" />
              <span>Warm-Up &amp; Plate Planner</span>
            </button>

            <button
              onClick={() => handleOpenCertificate(activeComp.id)}
              disabled={isLoadingCert}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer disabled:opacity-50"
            >
              <Award className="h-4 w-4 text-amber-400" />
              <span>{isLoadingCert ? "Loading Certificate..." : "Official Certificate"}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OFFICIAL ATTEMPT SCOREBOARD */}
        {activeTab === "SCOREBOARD" && (
          <div className="mt-6 space-y-6">
            {/* 1. SQUAT SECTION */}
            <div className="rounded-xl border border-white/10 bg-[#100402] p-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gym-primary" />
                  <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                    Squat Attempts
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-400">
                  Best Squat:{" "}
                  <span className="font-heading text-base font-bold text-gym-primary">
                    {activeComp.bestSquat ? `${activeComp.bestSquat} KG` : "—"}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {renderAttemptPill("Attempt 1", activeComp.squat1)}
                {renderAttemptPill("Attempt 2", activeComp.squat2)}
                {renderAttemptPill("Attempt 3", activeComp.squat3)}
              </div>
            </div>

            {/* 2. BENCH PRESS SECTION */}
            <div className="rounded-xl border border-white/10 bg-[#100402] p-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                    Bench Press Attempts
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-400">
                  Best Bench:{" "}
                  <span className="font-heading text-base font-bold text-blue-400">
                    {activeComp.bestBench ? `${activeComp.bestBench} KG` : "—"}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {renderAttemptPill("Attempt 1", activeComp.bench1)}
                {renderAttemptPill("Attempt 2", activeComp.bench2)}
                {renderAttemptPill("Attempt 3", activeComp.bench3)}
              </div>
            </div>

            {/* 3. DEADLIFT SECTION */}
            <div className="rounded-xl border border-white/10 bg-[#100402] p-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                    Deadlift Attempts
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-400">
                  Best Deadlift:{" "}
                  <span className="font-heading text-base font-bold text-emerald-400">
                    {activeComp.bestDeadlift ? `${activeComp.bestDeadlift} KG` : "—"}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {renderAttemptPill("Attempt 1", activeComp.deadlift1)}
                {renderAttemptPill("Attempt 2", activeComp.deadlift2)}
                {renderAttemptPill("Attempt 3", activeComp.deadlift3)}
              </div>
            </div>

            {/* Final Total Banner */}
            <div className="flex items-center justify-between rounded-xl border border-gym-primary/30 bg-gradient-to-r from-[#220a04] to-[#120502] p-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gym-primary">
                  IPF Official Competition Total
                </span>
                <div className="font-heading text-3xl font-bold text-white">
                  {activeComp.total || 0} <span className="text-lg text-gym-primary">KG</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Championship Result
                </span>
                <div className="text-base font-bold text-white">
                  Rank #{activeComp.rank} of {activeComp.totalCompetitorsInMeet} Lifters
                </div>
              </div>
            </div>

            {/* Official Ratified Certificate Action Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#180803] to-[#0d0301] p-4 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-md">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                      Official IPF Competition Certificate
                    </span>
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase text-amber-300">
                      QR Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    High-res verifiable credential with federation seal &amp; attempt breakdown.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenCertificate(activeComp.id)}
                disabled={isLoadingCert}
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
              >
                <Award className="h-4 w-4" />
                <span>{isLoadingCert ? "Loading..." : "Get Certificate"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: COACH & ATHLETE PERFORMANCE DIAGNOSTIC ("KYA KAMI THI AUR KAISE SUDHAREIN") */}
        {activeTab === "COACH_ANALYSIS" && (
          <div className="mt-6 space-y-6">
            {/* Header Strategy Notice */}
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 to-[#140602] p-4 text-amber-200">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
                <Zap className="h-4 w-4" />
                <span>Coach & Athlete Biomechanical Feedback</span>
              </div>
              <p className="mt-1 text-xs text-amber-200/90 leading-relaxed">
                {activeComp.coachSummaryNotes.primaryFocus}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-gray-400 border-t border-white/5 pt-2">
                <span>
                  <strong>Strength Distribution:</strong> {activeComp.coachSummaryNotes.strengthBalance}
                </span>
                <span>
                  <strong>Next Meet Target Total:</strong>{" "}
                  <span className="font-bold text-gym-primary">
                    {activeComp.coachSummaryNotes.nextMeetTargetKg} KG (+5%)
                  </span>
                </span>
              </div>
            </div>

            {/* MISSED ATTEMPTS BREAKDOWN */}
            {activeComp.missedDiagnostics.length === 0 ? (
              /* Flawless Performance Card */
              <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center">
                <Sparkles className="h-10 w-10 text-emerald-400 animate-pulse" />
                <h4 className="mt-3 font-heading text-lg font-bold uppercase tracking-wider text-emerald-300">
                  Flawless 100% White Light Execution!
                </h4>
                <p className="mt-1 max-w-md text-xs text-gray-300">
                  Har attempt par teeno referees ne White Lights diye hain! Koi technical fault ya infractions record nahi
                  hui. Agle competition cycle me apne openers ko +5kg se +7.5kg badha kar train karein.
                </p>
              </div>
            ) : (
              /* Detailed Missed Attempt Remediation Cards */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                    Missed Attempt Biomechanical Diagnostics ({activeComp.missedDiagnostics.length})
                  </h4>
                  <span className="text-[11px] text-gray-400">Action items to practice in gym</span>
                </div>

                {activeComp.missedDiagnostics.map((diag, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-red-500/30 bg-gradient-to-b from-[#180603] to-[#0f0301] p-5 shadow-lg"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-red-600 px-2 py-0.5 font-heading text-xs font-bold uppercase tracking-wider text-white">
                          NO LIFT ✗
                        </span>
                        <h5 className="font-heading text-base font-bold text-white">
                          {diag.discipline} — Attempt #{diag.attemptNumber} @ {diag.weight} KG
                        </h5>
                      </div>
                      <span className="text-xs font-bold text-red-400">
                        {diag.technicalFlawEn}
                      </span>
                    </div>

                    {/* Hindi Explanation of Error */}
                    <div className="mt-3 rounded-lg border border-red-500/20 bg-red-950/30 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                        Kya Kami / Galti Thi:
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-white">{diag.technicalFlawHi}</p>
                      <p className="mt-1 text-[11px] text-gray-300 leading-relaxed">
                        {diag.biomechanicalCause}
                      </p>
                    </div>

                    {/* Coach's Fix & Remedy */}
                    <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        Coach&apos;s Corrective Cue (Sudharne Ka Tareeqa):
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-emerald-300">{diag.coachRemedyHi}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">{diag.coachRemedyEn}</p>
                    </div>

                    {/* Specific Drills to fix */}
                    <div className="mt-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Gym Training Drill Recommendations:
                      </div>
                      <ul className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-xs text-gray-300">
                        {diag.recommendedDrills.map((drill, dIdx) => (
                          <li
                            key={dIdx}
                            className="flex items-center gap-1.5 rounded bg-black/40 px-2.5 py-1.5 text-[11px]"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-gym-primary" />
                            <span>{drill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Competition Certificate Modal */}
      {selectedCert && (
        <CompetitionCertificateModal
          certificate={selectedCert}
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
        />
      )}

      {/* Warm-Up & Plate Loading Calculator Modal */}
      <AthleteWarmupLauncherModal
        isOpen={isWarmupModalOpen}
        onClose={() => setIsWarmupModalOpen(false)}
        athleteName={athleteName}
        bodyweight={activeComp?.bodyweight || 83}
        initialSquatOpener={
          activeComp?.bestSquat
            ? Math.max(20, Math.round((activeComp.bestSquat * 0.9) / 2.5) * 2.5)
            : 210
        }
        initialBenchOpener={
          activeComp?.bestBench
            ? Math.max(20, Math.round((activeComp.bestBench * 0.9) / 2.5) * 2.5)
            : 140
        }
        initialDeadliftOpener={
          activeComp?.bestDeadlift
            ? Math.max(20, Math.round((activeComp.bestDeadlift * 0.9) / 2.5) * 2.5)
            : 230
        }
      />
    </div>
  );
}
