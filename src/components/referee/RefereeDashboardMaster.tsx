"use client";

import React, { useState, useTransition, useEffect, useCallback } from "react";
import {
  submitRefereeAttemptDecisionAction,
  broadcastPlatformStageAction,
  LiveScoringMeetDto,
  LiveScoringResultDto,
  LiftField,
} from "@/actions/scoring.actions";
import { meetTimerAudio } from "@/lib/meet-timer-audio";
import { RefereeJurySwitchboard, RefereeColor, InfractionCard } from "./RefereeJurySwitchboard";
import { JuryReviewVarDesk, RecentAttemptDecision } from "./JuryReviewVarDesk";
import { RefereeCredentialWidget } from "./RefereeCredentialWidget";
import { RefereeRulebookQuickMatrix } from "./RefereeRulebookQuickMatrix";
import { PlatformTimerDesk } from "./PlatformTimerDesk";
import { BarbellPlateVisualizer } from "./BarbellPlateVisualizer";
import { AthleteQueueStrip } from "./AthleteQueueStrip";
import { PreMeetWeighInDesk } from "./PreMeetWeighInDesk";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { RefereeVisualSignalConsole } from "./RefereeVisualSignalConsole";
import { RefereeConductDesk } from "./RefereeConductDesk";
import { FlightManagerPanel } from "./FlightManagerPanel";
import {
  useOfflineRefereeSync,
  OfflineSyncStatusBar,
  type QueuedDecision,
} from "@/components/pwa/OfflineRefereeSync";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  Trophy,
  Users,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sparkles,
  RefreshCw,
  Sliders,
  Scale,
  BookOpen,
  BarChart3,
  Maximize2,
  Minimize2,
  Keyboard,
  ExternalLink,
  Layers,
  CreditCard,
  CheckSquare,
  FileText,
  Calendar as CalendarIcon,
} from "lucide-react";
import { getRefereeCredentialPassAction, RefereePassPayload } from "@/actions/referee-management.actions";
import { RefereeCredentialPassModal } from "@/components/credentials/RefereeCredentialPassModal";
import { NextMatchCommandCard } from "./saas/NextMatchCommandCard";
import { PreMatchChecklistDesk } from "./saas/PreMatchChecklistDesk";
import { MatchReportBuilder } from "./saas/MatchReportBuilder";
import { RefereeAvailabilityCalendar } from "./saas/RefereeAvailabilityCalendar";
import { RefereeEarningsLedger } from "./saas/RefereeEarningsLedger";
import { AiReportAssistantModal } from "./saas/AiReportAssistantModal";
import { RefereeMobileBottomNav, RefereeMobileNavTab } from "./saas/RefereeMobileBottomNav";

interface RefereeDashboardMasterProps {
  initialMeets: LiveScoringMeetDto[];
  initialResults: LiveScoringResultDto[];
  userRole?: string;
  userName?: string;
}

type DashboardTab =
  | "platform"
  | "jury"
  | "weighin"
  | "flights"
  | "rules"
  | "conduct"
  | "stats"
  | "checklist"
  | "report"
  | "calendar"
  | "earnings";

export function RefereeDashboardMaster({
  initialMeets,
  initialResults,
  userRole = "REFEREE",
  userName = "Chief Technical Referee",
}: RefereeDashboardMasterProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("platform");
  const [meets] = useState<LiveScoringMeetDto[]>(initialMeets);
  const [selectedMeetId, setSelectedMeetId] = useState<string>(
    initialMeets.length > 0 ? initialMeets[0].id : ""
  );
  const [results, setResults] = useState<LiveScoringResultDto[]>(initialResults);
  const [activeResultIndex, setActiveResultIndex] = useState<number>(0);

  // Discipline & Attempt
  const [discipline, setDiscipline] = useState<"squat" | "bench" | "deadlift">("squat");
  const [attemptNum, setAttemptNum] = useState<1 | 2 | 3>(1);
  const [declaredWeight, setDeclaredWeight] = useState<number>(220);
  const [isSubmitting, startTransition] = useTransition();

  // Clock Reset signal for PlatformTimerDesk
  const [clockResetSignal, setClockResetSignal] = useState<number>(0);

  // Fullscreen & Shortcuts Modal
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Official Credential Pass Modal state
  const [officialPass, setOfficialPass] = useState<RefereePassPayload | null>(null);
  const [isLoadingPass, setIsLoadingPass] = useState<boolean>(false);

  // AI Report Assistant Modal state
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  const handleMobileTabChange = (mTab: RefereeMobileNavTab) => {
    if (mTab === "overview") setActiveTab("platform");
    else if (mTab === "platform") setActiveTab("platform");
    else if (mTab === "checklist") setActiveTab("checklist");
    else if (mTab === "report") setActiveTab("report");
    else if (mTab === "calendar") setActiveTab("calendar");
    else if (mTab === "earnings") setActiveTab("earnings");
  };

  const handleOpenOfficialPass = async () => {
    setIsLoadingPass(true);
    try {
      const res = await getRefereeCredentialPassAction();
      if (res.success && res.pass) {
        setOfficialPass(res.pass);
      }
    } catch (e) {
      console.error("Failed to load pass:", e);
    } finally {
      setIsLoadingPass(false);
    }
  };

  // Audit history of recent decisions
  const [recentDecisions, setRecentDecisions] = useState<RecentAttemptDecision[]>([
    {
      resultId: "mock-1",
      athleteName: "Patel Rakesh",
      weightClass: "83 KG (Senior)",
      discipline: "squat",
      attemptNum: 1,
      liftField: "squat1",
      recordedWeight: 215,
      timestamp: "Just now",
    },
    {
      resultId: "mock-2",
      athleteName: "Vikramjit Singh",
      weightClass: "93 KG (Senior)",
      discipline: "squat",
      attemptNum: 1,
      liftField: "squat1",
      recordedWeight: -260,
      timestamp: "2 mins ago",
    },
  ]);

  // Session Statistics
  const [stats, setStats] = useState({
    totalJudged: 12,
    goodLifts: 9,
    noLifts: 3,
    overruled: 1,
  });

  const activeAthlete = results[activeResultIndex] || {
    id: "sample-lifter",
    user: { name: "Sample Competitor", profile: { weightClass: "83 KG", gender: "MALE" } },
  };

  const athleteName = activeAthlete.user?.name || "Competitor Lifter";
  const weightClass = activeAthlete.user?.profile?.weightClass || "83 KG";

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Keyboard navigation for Prev/Next lifter and Shortcuts Help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (e.key === "ArrowLeft") {
        setActiveResultIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "ArrowRight") {
        setActiveResultIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [results.length]);

  // ── Offline Referee Sync ──────────────────────────────────────────────────
  const onlineSubmitDecision = async (dec: QueuedDecision) => {
    const liftField = `${discipline}${attemptNum}` as LiftField;
    const result = await submitRefereeAttemptDecisionAction({
      resultId: dec.resultId,
      liftField,
      declaredWeight,
      ref1: dec.refereePosition === "LEFT" ? dec.decision as RefereeColor : "WHITE",
      headRef: dec.refereePosition === "CENTER" ? dec.decision as RefereeColor : "WHITE",
      ref3: dec.refereePosition === "RIGHT" ? dec.decision as RefereeColor : "WHITE",
    });
    return result;
  };
  const { isOnline, queueCount, queueDecision, forcSync, lastSyncAt, syncStatus } =
    useOfflineRefereeSync(onlineSubmitDecision);

  // ── SSE broadcast for timer events ──────────────────────────────────────
  const handleTimerEvent = useCallback(
    (timerEvent: "BAR_LOADED" | "TIMER_START" | "TIMER_PAUSE" | "TIMER_RESET", timerSeconds?: number) => {
      if (!selectedMeetId) return;
      broadcastPlatformStageAction({
        meetId: selectedMeetId,
        lifterName: athleteName,
        weightClass,
        discipline,
        attemptNum: attemptNum as 1 | 2 | 3,
        declaredWeight,
        timerEvent,
        timerSeconds,
      }).catch(() => {/* non-fatal */});
    },
    [selectedMeetId, athleteName, weightClass, discipline, attemptNum, declaredWeight]
  );

  // When referee submits decision
  const handleDecisionSubmit = (
    ref1: RefereeColor,
    chiefRef: RefereeColor,
    ref3: RefereeColor,
    card: InfractionCard,
    reason: string
  ) => {
    const liftField = `${discipline}${attemptNum}` as LiftField;

    startTransition(async () => {
      // 1. Route through offline sync handler
      const whiteCount = [ref1, chiefRef, ref3].filter((l) => l === "WHITE").length;
      const overallDecision: "WHITE" | "RED" = whiteCount >= 2 ? "WHITE" : "RED";

      await queueDecision({
        resultId: activeAthlete.id,
        decision: overallDecision,
        refereePosition: "CENTER",
        infractions: reason ? [reason] : [],
        timestamp: Date.now(),
      });

      // Derive pass/fail from already-calculated whiteCount above
      const isGood = whiteCount >= 2;
      const recordedWeight = isGood ? declaredWeight : -declaredWeight;

      // 2. Play IPF match day audio signal (Good Lift chime or No Lift buzzer)
      if (isGood) {
        meetTimerAudio.playGoodLiftChime();
      } else {
        meetTimerAudio.playNoLiftBuzzer();
      }

      // 3. Submit full decision to DB + SSE broadcast (supports mock/sample-lifter too)
      if (isOnline) {
        await submitRefereeAttemptDecisionAction({
          resultId: activeAthlete.id,
          liftField,
          declaredWeight,
          ref1,
          headRef: chiefRef,
          ref3,
        });
      }

      // 4. Update session statistics
      setStats((prev) => ({
        ...prev,
        totalJudged: prev.totalJudged + 1,
        goodLifts: prev.goodLifts + (isGood ? 1 : 0),
        noLifts: prev.noLifts + (isGood ? 0 : 1),
      }));

      // 5. Update local result record so UI updates immediately
      setResults((prev) =>
        prev.map((r, idx) => {
          if (idx === activeResultIndex) {
            return {
              ...r,
              [liftField]: recordedWeight,
              total: (r.total || 0) + (isGood ? declaredWeight : 0),
            };
          }
          return r;
        })
      );

      // 6. Log to local recent decisions
      const newDecision: RecentAttemptDecision = {
        resultId: activeAthlete.id,
        athleteName,
        weightClass,
        discipline,
        attemptNum,
        liftField,
        recordedWeight,
        timestamp: "Just now",
      };

      setRecentDecisions((prev) => [newDecision, ...prev.slice(0, 9)]);

      // 7. Broadcast stage update so spectator arena refreshes immediately
      if (selectedMeetId) {
        broadcastPlatformStageAction({
          meetId: selectedMeetId,
          lifterName: athleteName,
          weightClass,
          discipline,
          attemptNum: attemptNum as 1 | 2 | 3,
          declaredWeight,
          refereeLights: {
            ref1,
            headRef: chiefRef,
            ref3,
            decisionText: isGood
              ? `${whiteCount}-${3 - whiteCount} GOOD LIFT`
              : `${whiteCount}-${3 - whiteCount} NO LIFT`,
            isGoodLift: isGood,
            whiteCount,
          },
        }).catch(() => {/* non-fatal */});
      }

      // 8. Auto-advance to next attempt or next athlete
      if (attemptNum < 3) {
        setAttemptNum((prev) => (prev + 1) as 1 | 2 | 3);
        setDeclaredWeight((prev) => prev + (isGood ? 7.5 : 2.5));
      } else {
        // Move to next discipline or next lifter
        if (discipline === "squat") {
          setDiscipline("bench");
          setAttemptNum(1);
          setDeclaredWeight(145);
        } else if (discipline === "bench") {
          setDiscipline("deadlift");
          setAttemptNum(1);
          setDeclaredWeight(240);
        } else {
          setActiveResultIndex((prev) => (prev + 1) % results.length);
          setDiscipline("squat");
          setAttemptNum(1);
          setDeclaredWeight(210);
        }
      }
    });
  };

  const passRate = stats.totalJudged > 0 ? Math.round((stats.goodLifts / stats.totalJudged) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── OFFLINE SYNC STATUS BAR ── */}
      <OfflineSyncStatusBar
        isOnline={isOnline}
        queueCount={queueCount}
        syncStatus={syncStatus}
        lastSyncAt={lastSyncAt}
        onForceSync={forcSync}
      />

      {/* ── PHASE 1: CORE SAAS ACTION REQUIRED & NEXT MATCH CARD (10-SECOND RULE) ── */}
      <NextMatchCommandCard
        onOpenChecklist={() => setActiveTab("checklist")}
        onOpenReport={() => setActiveTab("report")}
        onOpenCalendar={() => setActiveTab("calendar")}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* ── TOP HERO COMMAND BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#180803] via-[#0e0301] to-[#120402] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-gym-primary/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary">
              <Shield className="h-3.5 w-3.5 fill-current" />
              <span>OFFICIAL TECHNICAL OFFICIAL COMMAND CENTER</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wider text-white">
              Technical Referee <span className="text-gym-primary">&amp; Jury Command</span>
            </h1>

            <p className="text-sm font-medium text-zinc-400 max-w-2xl leading-relaxed">
              Official 3-referee electronic switchboard, 60s/90s attempt countdown clock, calibrated plate loader, live match arena sync, and Technical Jury VAR appeal desk.
            </p>
          </div>

          {/* Quick Meet Status & Utility Badges */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-right space-y-1 w-full sm:w-auto">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">
                Active Championship Meet
              </span>
              <span className="text-base font-bold text-white font-heading block">
                {meets.find((m) => m.id === selectedMeetId)?.title || "Asian & Pacific Powerlifting 2026"}
              </span>
              <div className="flex items-center justify-end gap-2 text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Platform 1 Live Broadcast</span>
                </span>
                <Link
                  href="/live"
                  target="_blank"
                  className="text-gym-primary hover:underline font-bold inline-flex items-center gap-0.5"
                >
                  <span>Open Live Arena</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Quick Action Buttons: Keyboard Shortcuts, Digital Pass & Fullscreen */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleOpenOfficialPass}
                disabled={isLoadingPass}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-bold text-purple-300 hover:text-white transition-colors cursor-pointer"
                title="View Official Technical Accreditation Pass"
              >
                <CreditCard className="h-3.5 w-3.5 text-purple-400" />
                <span>{isLoadingPass ? "Loading..." : "My Official Pass"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShortcutsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Keyboard className="h-3.5 w-3.5 text-gym-primary" />
                <span>Hotkeys [?]</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Toggle Fullscreen Arena Mode"
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                <span>{isFullscreen ? "Exit Full" : "Zen Arena"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── SESSION LIVE STATS TICKER ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="rounded-xl border border-white/5 bg-black/40 p-3">
            <span className="text-[10px] font-bold uppercase text-zinc-500 block">Total Judged Today</span>
            <span className="text-xl font-bold text-white font-heading font-mono">{stats.totalJudged} Attempts</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/40 p-3">
            <span className="text-[10px] font-bold uppercase text-emerald-500/80 block">Good Lifts (White)</span>
            <span className="text-xl font-bold text-emerald-400 font-heading font-mono">
              {stats.goodLifts} <span className="text-xs opacity-70">({passRate}%)</span>
            </span>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/40 p-3">
            <span className="text-[10px] font-bold uppercase text-red-500/80 block">No Lifts (Red)</span>
            <span className="text-xl font-bold text-red-400 font-heading font-mono">
              {stats.noLifts} <span className="text-xs opacity-70">({100 - passRate}%)</span>
            </span>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/40 p-3">
            <span className="text-[10px] font-bold uppercase text-amber-500/80 block">Jury Overruled</span>
            <span className="text-xl font-bold text-amber-400 font-heading font-mono">{stats.overruled} Reviews</span>
          </div>
        </div>
      </div>

      {/* ── CREDENTIAL STATUS WIDGET ── */}
      <RefereeCredentialWidget refereeName={userName} />

      {/* ── MODULAR FUNCTION TABS BAR ── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md">
        {[
          { id: "platform", label: "Platform Console", icon: Play, count: undefined },
          { id: "checklist", label: "Pre-Match Inspection", icon: CheckSquare, count: undefined },
          { id: "report", label: "Session Report", icon: FileText, count: undefined },
          { id: "calendar", label: "Availability Roster", icon: CalendarIcon, count: undefined },
          { id: "earnings", label: "Honorarium & Ledger", icon: CreditCard, count: undefined },
          { id: "jury", label: "Jury VAR Desk", icon: Shield, count: recentDecisions.length },
          { id: "weighin", label: "Weigh-In & Gear", icon: Scale, count: undefined },
          { id: "flights", label: "Flight Manager", icon: Layers, count: undefined },
          { id: "rules", label: "IPF Rulebook", icon: BookOpen, count: undefined },
          { id: "conduct", label: "Conduct & Sanctions", icon: ShieldAlert, count: undefined },
          { id: "stats", label: "Session Scorecard", icon: BarChart3, count: undefined },
        ].map(({ id, label, icon: Icon, count }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as DashboardTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-gym-primary to-gym-red text-white shadow-lg shadow-gym-primary/30 scale-[1.02]"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: LIVE PLATFORM MATCH DAY CONSOLE ── */}
      {activeTab === "platform" && (
        <div className="space-y-6">
          {/* Active Flight Queue Strip */}
          <AthleteQueueStrip
            results={results}
            activeResultIndex={activeResultIndex}
            onSelectAthlete={(idx) => setActiveResultIndex(idx)}
            discipline={discipline}
            attemptNum={attemptNum}
          />

          {/* Platform Setup Controls: Discipline, Attempt, and Declared Weight */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Lifter Selection */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 shrink-0">
                  Current Lifter:
                </span>
                <select
                  value={activeResultIndex}
                  onChange={(e) => setActiveResultIndex(parseInt(e.target.value, 10))}
                  className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-gym-primary cursor-pointer"
                >
                  {results.map((r, i) => (
                    <option key={r.id} value={i}>
                      {r.user?.name || `Competitor ${i + 1}`} ({r.user?.profile?.weightClass || "83 KG"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Discipline Selector */}
              <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
                {(["squat", "bench", "deadlift"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiscipline(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      discipline === d
                        ? "bg-gym-primary text-white shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Attempt Selector */}
              <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
                {([1, 2, 3] as const).map((att) => (
                  <button
                    key={att}
                    type="button"
                    onClick={() => setAttemptNum(att)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      attemptNum === att
                        ? "bg-gym-primary text-white shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Attempt {att}
                  </button>
                ))}
              </div>

              {/* Declared Weight */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 uppercase">Declared Bar:</span>
                <input
                  type="number"
                  step="2.5"
                  value={declaredWeight}
                  onChange={(e) => setDeclaredWeight(parseFloat(e.target.value) || 200)}
                  className="w-24 bg-black/60 border border-white/15 rounded-xl px-2.5 py-1.5 text-center font-heading font-bold text-sm text-white focus:outline-none focus:border-gym-primary font-mono"
                />
                <span className="text-xs font-black text-gym-primary">KG</span>
              </div>
            </div>
          </div>

          {/* Grid: 60s Attempt Timer & Visual Calibrated Barbell Plate Loader */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlatformTimerDesk
              athleteName={athleteName}
              discipline={discipline}
              attemptNumber={attemptNum}
              declaredWeight={declaredWeight}
              onTimeExpired={() => {}}
              externalResetSignal={clockResetSignal}
              onTimerEvent={handleTimerEvent}
            />

            <BarbellPlateVisualizer
              declaredWeight={declaredWeight}
              onWeightChange={(newWeight) => setDeclaredWeight(newWeight)}
            />
          </div>

          {/* Chief Referee Official Verbal & Visual Hand Signals Console */}
          <RefereeVisualSignalConsole
            discipline={discipline}
            lifterName={athleteName}
            declaredWeight={declaredWeight}
            onResetClock={() => setClockResetSignal((prev) => prev + 1)}
          />

          {/* ── 3-REFEREE JURY SWITCHBOARD ── */}
          <RefereeJurySwitchboard
            athleteName={athleteName}
            weightClass={weightClass}
            discipline={discipline}
            attemptNumber={attemptNum}
            declaredWeight={declaredWeight}
            onDecisionSubmit={handleDecisionSubmit}
            isSubmitting={isSubmitting}
            onToggleShortcutsModal={() => setIsShortcutsOpen(true)}
          />
        </div>
      )}

      {/* ── TAB: PRE-MATCH PLATFORM SAFETY CHECKLIST ── */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          <PreMatchChecklistDesk onCertify={() => setActiveTab("platform")} />
        </div>
      )}

      {/* ── TAB: TECHNICAL SESSION REPORT BUILDER ── */}
      {activeTab === "report" && (
        <div className="space-y-6">
          <MatchReportBuilder onOpenAiAssistant={() => setIsAiAssistantOpen(true)} />
        </div>
      )}

      {/* ── TAB: REFEREE AVAILABILITY ROSTER ── */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <RefereeAvailabilityCalendar />
        </div>
      )}

      {/* ── TAB: HONORARIUM & PAYOUT LEDGER ── */}
      {activeTab === "earnings" && (
        <div className="space-y-6">
          <RefereeEarningsLedger />
        </div>
      )}

      {/* ── TAB 2: TECHNICAL JURY VAR DESK ── */}
      {activeTab === "jury" && (
        <div className="space-y-6">
          <JuryReviewVarDesk
            recentDecisions={recentDecisions}
            onOverruleSuccess={() => {
              setStats((prev) => ({ ...prev, overruled: prev.overruled + 1 }));
            }}
          />
        </div>
      )}

      {/* ── TAB 3: WEIGH-IN & GEAR INSPECTION DESK ── */}
      {activeTab === "weighin" && (
        <div className="space-y-6">
          <PreMeetWeighInDesk
            athlete={activeAthlete}
            onUpdateBodyweight={(newBw) => {
              setResults((prev) =>
                prev.map((r, idx) => (idx === activeResultIndex ? { ...r, bodyweight: newBw } : r))
              );
            }}
          />
        </div>
      )}

      {/* ── TAB 4: IPF TECHNICAL RULEBOOK INFRACTION MATRIX ── */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <RefereeRulebookQuickMatrix />
        </div>
      )}

      {/* ── TAB 5: REFEREE CODE OF CONDUCT & DISCIPLINARY SANCTIONS ── */}
      {activeTab === "conduct" && (
        <div className="space-y-6">
          <RefereeConductDesk
            currentAthleteName={athleteName}
            refereeName={userName}
          />
        </div>
      )}

      {/* ── TAB 6: REFEREE SESSION SCORECARD & ANALYTICS ── */}
      {/* ── TAB: FLIGHT MANAGER ── */}
      {activeTab === "flights" && (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#160c08] via-[#0d0705] to-[#070302] p-6 shadow-2xl">
          <FlightManagerPanel
            eventId={selectedMeetId}
            initialData={{
              eventId: selectedMeetId,
              eventTitle: meets.find((m) => m.id === selectedMeetId)?.title || "Championship Meet",
              flights: [],
              totalLifters: results.length,
              totalFlights: 0,
              isLotAssigned: false,
            }}
          />
        </div>
      )}

      {activeTab === "stats" && (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#160c08] via-[#0d0705] to-[#070302] p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                Official Referee Session Audit &amp; Scorecard
              </h3>
              <p className="text-xs text-zinc-400">
                Summary of all adjudicated platform attempts under Chief Referee {userName}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              Print Official Scoresheet
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">White Light Accuracy</span>
              <div className="text-3xl font-bold text-white font-heading font-mono mt-1">
                {stats.goodLifts} / {stats.totalJudged}
              </div>
              <p className="text-xs text-emerald-300/70 mt-1">
                {passRate}% of competitor attempts passed IPF technical criteria.
              </p>
            </div>

            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4">
              <span className="text-[10px] font-bold uppercase text-red-400 block">Red Light Infractions</span>
              <div className="text-3xl font-bold text-white font-heading font-mono mt-1">
                {stats.noLifts} Disqualifications
              </div>
              <p className="text-xs text-red-300/70 mt-1">
                Most common fault: Squat Depth (4.2.1) &amp; Bench Pause (5.2.2).
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
              <span className="text-[10px] font-bold uppercase text-amber-400 block">Jury Interventions</span>
              <div className="text-3xl font-bold text-white font-heading font-mono mt-1">
                {stats.overruled} VAR Appeals
              </div>
              <p className="text-xs text-amber-300/70 mt-1">
                Technical Jury ratified and upheld match day integrity.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── KEYBOARD SHORTCUTS MODAL ── */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* ── OFFICIAL DIGITAL PASS MODAL ── */}
      {officialPass && (
        <RefereeCredentialPassModal
          pass={officialPass}
          isOpen={!!officialPass}
          onClose={() => setOfficialPass(null)}
        />
      )}

      {/* ── AI TECHNICAL REPORT ASSISTANT MODAL ── */}
      <AiReportAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      {/* ── MOBILE-FIRST BOTTOM NAVIGATION ── */}
      <RefereeMobileBottomNav
        activeTab={
          activeTab === "checklist"
            ? "checklist"
            : activeTab === "report"
            ? "report"
            : activeTab === "calendar"
            ? "calendar"
            : activeTab === "earnings"
            ? "earnings"
            : "platform"
        }
        onChangeTab={handleMobileTabChange}
      />
    </div>
  );
}
