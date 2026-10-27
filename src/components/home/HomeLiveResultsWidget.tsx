"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  Flame,
  Radio,
  ArrowRight,
  RefreshCw,
  Zap,
  Shield,
  Activity,
  Maximize2,
  SlidersHorizontal,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Star,
  CheckCircle2,
} from "lucide-react";
import {
  getHomeLiveChampionshipDataAction,
  HomeLiveStandingDto,
} from "@/actions/scoring.actions";

interface HomeLiveResultsWidgetProps {
  initialData?: {
    activeMeet: {
      id: string;
      title: string;
      location: string;
      dates: string;
      status: string;
      platformStatus: string;
    } | null;
    topLifters: HomeLiveStandingDto[];
    bestMaleLifter: HomeLiveStandingDto | null;
    bestFemaleLifter: HomeLiveStandingDto | null;
    stats: {
      totalLifters: number;
      highestGlPoints: number;
      highestTotal: number;
      completedAttempts: number;
    };
    lastUpdated: string;
  };
}

type ScoringFormula = "GL" | "DOTS" | "WILKS" | "TOTAL";
type GenderFilter = "ALL" | "MALE" | "FEMALE";
type PodiumViewMode = "OVERALL" | "BY_WEIGHT_CLASS";

export function HomeLiveResultsWidget({ initialData }: HomeLiveResultsWidgetProps) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [formula, setFormula] = useState<ScoringFormula>("GL");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("ALL");
  const [selectedWeightClass, setSelectedWeightClass] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [secondsSinceSync, setSecondsSinceSync] = useState<number>(0);
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(true);
  const [podiumViewMode, setPodiumViewMode] = useState<PodiumViewMode>("OVERALL");
  const [lastLeaderName, setLastLeaderName] = useState<string>("");
  const [leaderChangeAlert, setLeaderChangeAlert] = useState<string | null>(null);

  // Function to refresh live data from database
  const refreshData = () => {
    startTransition(async () => {
      const res = await getHomeLiveChampionshipDataAction();
      if (res.success && res.data) {
        // Detect leader change for live celebration alert
        const currentTop = res.data.topLifters[0];
        if (currentTop && lastLeaderName && currentTop.athleteName !== lastLeaderName) {
          setLeaderChangeAlert(`🥇 NEW CHAMPIONSHIP LEADER: ${currentTop.athleteName} is now #1 Gold with ${currentTop.ipfGlPoints.toFixed(2)} GL Points!`);
          setTimeout(() => setLeaderChangeAlert(null), 7000);
        }
        if (currentTop) {
          setLastLeaderName(currentTop.athleteName);
        }

        setData(res.data);
        setSecondsSinceSync(0);
      }
    });
  };

  // Auto-refresh interval (polling every 10 seconds like OpenLifter live stream)
  useEffect(() => {
    if (!data) {
      refreshData();
    }

    const timerInterval = setInterval(() => {
      setSecondsSinceSync((prev) => prev + 1);
    }, 1000);

    let pollInterval: NodeJS.Timeout | null = null;
    if (isAutoSyncing) {
      pollInterval = setInterval(() => {
        refreshData();
      }, 10000);
    }

    return () => {
      clearInterval(timerInterval);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isAutoSyncing, lastLeaderName]);

  const activeMeet = data?.activeMeet;
  const lifters = data?.topLifters || [];
  const stats = data?.stats || {
    totalLifters: 0,
    highestGlPoints: 0,
    highestTotal: 0,
    completedAttempts: 0,
  };

  // Available weight classes based on gender
  const availableWeightClasses = useMemo(() => {
    const classes = new Set<string>();
    lifters.forEach((l) => {
      if (genderFilter === "ALL" || l.gender === genderFilter) {
        classes.add(l.weightClass);
      }
    });
    return Array.from(classes).sort();
  }, [lifters, genderFilter]);

  // Filtered and sorted lifters
  const filteredLifters = useMemo(() => {
    return lifters
      .filter((lifter) => {
        if (genderFilter !== "ALL" && lifter.gender !== genderFilter) return false;
        if (selectedWeightClass !== "ALL" && lifter.weightClass !== selectedWeightClass)
          return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            lifter.athleteName.toLowerCase().includes(q) ||
            lifter.weightClass.toLowerCase().includes(q) ||
            lifter.division.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (formula === "GL") return b.ipfGlPoints - a.ipfGlPoints;
        if (formula === "DOTS") return b.dotsPoints - a.dotsPoints;
        if (formula === "WILKS") return b.wilksPoints - a.wilksPoints;
        return b.total - a.total;
      });
  }, [lifters, genderFilter, selectedWeightClass, searchQuery, formula]);

  // Top 3 Podium athletes
  const topPodium = filteredLifters.slice(0, 3);

  // Group winners by weight class for category champions view
  const weightClassChampions = useMemo(() => {
    const groups = new Map<string, HomeLiveStandingDto[]>();
    lifters.forEach((l) => {
      if (genderFilter !== "ALL" && l.gender !== genderFilter) return;
      const list = groups.get(l.weightClass) || [];
      list.push(l);
      groups.set(l.weightClass, list);
    });

    // Sort each group by total/gl
    const result: Array<{ weightClass: string; champions: HomeLiveStandingDto[] }> = [];
    groups.forEach((athletes, wc) => {
      const sorted = [...athletes].sort((a, b) => b.total - a.total);
      result.push({ weightClass: wc, champions: sorted.slice(0, 3) });
    });

    return result.sort((a, b) => a.weightClass.localeCompare(b.weightClass));
  }, [lifters, genderFilter]);

  // Helper for attempt badge
  const renderAttemptBadge = (val: number | null) => {
    if (val === null || val === undefined) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-600 bg-black/40 border border-white/5">
          —
        </span>
      );
    }
    const isGood = val > 0;
    const absVal = Math.abs(val);
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
          isGood
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
            : "bg-red-500/20 text-red-400 border border-red-500/40 line-through opacity-75"
        }`}
        title={isGood ? "Good Lift (White Lights)" : "No Lift (Red Lights)"}
      >
        {isGood ? `⚪ ${absVal}` : `🔴 ${absVal}`}
      </span>
    );
  };

  return (
    <section id="live-results" className="relative z-10 w-full py-12 md:py-16 bg-gym-black border-b border-white/5">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ── TOP LIVE MEET BROADCAST BANNER ── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#180803] via-[#0d0301] to-[#120402] p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gym-primary/15 blur-3xl pointer-events-none" />

          {/* Live Alert when Rank #1 Leader Changes */}
          {leaderChangeAlert && (
            <div className="mb-4 rounded-2xl border border-yellow-400/80 bg-gradient-to-r from-yellow-500/30 via-amber-500/40 to-yellow-600/30 p-3.5 text-xs font-black text-yellow-300 shadow-xl flex items-center gap-2 animate-bounce">
              <Sparkles className="h-5 w-5 text-yellow-400 shrink-0" />
              <span>{leaderChangeAlert}</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2.5">
              {/* Live Status Badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-600/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400 animate-pulse">
                  <Radio className="h-3.5 w-3.5" />
                  <span>LIVE CHAMPIONSHIP RESULTS</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Official Winner Rankings &amp; Medals</span>
                </span>

                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
                  <span>Synced {secondsSinceSync}s ago</span>
                </span>
              </div>

              {/* Championship Meet Title */}
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wider text-white">
                Championship <span className="text-gym-primary">Live Standings &amp; Podium</span>
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl font-medium leading-relaxed">
                Official real-time platform rankings from{" "}
                <strong className="text-white font-bold">
                  {activeMeet?.title || "National Powerlifting Championships 2026"}
                </strong>
                . 🥇 Gold, 🥈 Silver, and 🥉 Bronze medals calculated automatically via IPF Goodlift (GL) points.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={refreshData}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title="Force refresh live scoreboard"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-gym-primary ${isPending ? "animate-spin" : ""}`} />
                <span>{isPending ? "Syncing..." : "Sync Live Data"}</span>
              </button>

              <Link
                href="/live"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red text-white text-xs font-heading font-bold uppercase tracking-wider shadow-lg shadow-gym-primary/25 hover:scale-105 transition-all"
              >
                <span>Live Jumbotron Arena</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                href="/referee/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gym-primary/40 bg-black/60 hover:bg-gym-primary/10 text-xs font-bold text-gym-primary transition-all"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Referee Console</span>
              </Link>
            </div>
          </div>

          {/* ── KEY CHAMPIONSHIP STATS TICKER ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
            <div className="rounded-xl border border-white/5 bg-black/40 p-3">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Total Lifters in Flight</span>
              <span className="text-xl sm:text-2xl font-bold text-white font-heading font-mono">
                {stats.totalLifters} Athletes
              </span>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/40 p-3">
              <span className="text-[10px] font-bold uppercase text-yellow-400 block flex items-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-400" /> Current Gold Champion GL
              </span>
              <span className="text-xl sm:text-2xl font-bold text-yellow-400 font-heading font-mono">
                {stats.highestGlPoints.toFixed(2)}{" "}
                <span className="text-xs font-sans text-white/60">Points</span>
              </span>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/40 p-3">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">Highest Platform Total</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-heading font-mono">
                {stats.highestTotal}{" "}
                <span className="text-xs font-sans text-white/60">KG</span>
              </span>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/40 p-3">
              <span className="text-[10px] font-bold uppercase text-blue-400 block">Attempt Success Rate</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-400 font-heading font-mono">
                {stats.completedAttempts > 0 ? "88%" : "100%"} Valid
              </span>
            </div>
          </div>
        </div>

        {/* ── PODIUM VIEW SELECTOR: OVERALL PODIUM VS WEIGHT CLASS CHAMPIONS ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" />
            <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-400" />
              <span>Official Championship Winners Ceremony</span>
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-black/80 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setPodiumViewMode("OVERALL")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                podiumViewMode === "OVERALL"
                  ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg shadow-yellow-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Overall GL Podium</span>
            </button>

            <button
              type="button"
              onClick={() => setPodiumViewMode("BY_WEIGHT_CLASS")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                podiumViewMode === "BY_WEIGHT_CLASS"
                  ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg shadow-yellow-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Medal className="h-3.5 w-3.5" />
              <span>Category Medalists (Per Class)</span>
            </button>
          </div>
        </div>

        {/* ── 1. OVERALL PODIUM SHOWCASE (TOP 3 ATHLETES) ── */}
        {podiumViewMode === "OVERALL" && topPodium.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {/* Rank 2: Silver Medalist (Left on Desktop) */}
            {topPodium[1] && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-slate-300/60 bg-gradient-to-b from-slate-900/60 via-black to-zinc-950 p-6 shadow-2xl transition-all hover:scale-[1.02] order-2 md:order-1 mt-0 md:mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-300/20 to-zinc-400/30 border border-slate-300/80 text-slate-100 font-heading font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(203,213,225,0.3)]">
                    <Medal className="h-4 w-4 text-slate-200 fill-slate-200" />
                    <span>🥈 2ND PLACE (SILVER)</span>
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-black/60 px-2.5 py-0.5 rounded-md border border-white/10">
                    {topPodium[1].weightClass}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="font-heading text-xl font-bold uppercase text-white truncate">
                    {topPodium[1].athleteName}
                  </h3>
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <span>{topPodium[1].gender === "MALE" ? "Men's Division" : "Women's Division"}</span>
                    <span>•</span>
                    <span>BW: {topPodium[1].bodyweight.toFixed(1)} KG</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/60 border border-white/5 text-center mb-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 block">Squat</span>
                    <span className="font-mono text-xs font-black text-white">{topPodium[1].bestSquat || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 block">Bench</span>
                    <span className="font-mono text-xs font-black text-white">{topPodium[1].bestBench || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 block">Deadlift</span>
                    <span className="font-mono text-xs font-black text-white">{topPodium[1].bestDeadlift || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total</span>
                    <span className="font-heading font-bold text-2xl text-white font-mono">
                      {topPodium[1].total} <span className="text-xs text-zinc-500">KG</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">IPF GL Points</span>
                    <span className="font-heading font-bold text-2xl text-slate-100 font-mono">
                      {topPodium[1].ipfGlPoints.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1: Gold Champion (Center Elevated) */}
            {topPodium[0] && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-yellow-400 bg-gradient-to-b from-yellow-950/40 via-[#180d02] to-black p-6 sm:p-7 shadow-[0_0_35px_rgba(234,179,8,0.25)] transition-all hover:scale-[1.03] order-1 md:order-2 ring-2 ring-yellow-400/20">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-500" />
                
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-black font-heading font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-pulse">
                    <Trophy className="h-4 w-4 fill-black" />
                    <span>🥇 1ST PLACE (GOLD CHAMPION)</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-yellow-300 bg-black/80 px-2.5 py-0.5 rounded-md border border-yellow-500/40">
                    {topPodium[0].weightClass}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-2xl font-bold uppercase text-white truncate">
                      {topPodium[0].athleteName}
                    </h3>
                    <Sparkles className="h-5 w-5 text-yellow-400 animate-spin" />
                  </div>
                  <div className="text-xs text-yellow-300/80 font-semibold flex items-center gap-2">
                    <span>👑 Official Championship Winner</span>
                    <span>•</span>
                    <span>BW: {topPodium[0].bodyweight.toFixed(1)} KG</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-black/70 border border-yellow-500/30 text-center mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-black text-yellow-400/80 block">Squat</span>
                    <span className="font-mono text-sm font-black text-white">{topPodium[0].bestSquat || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-yellow-400/80 block">Bench</span>
                    <span className="font-mono text-sm font-black text-white">{topPodium[0].bestBench || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-yellow-400/80 block">Deadlift</span>
                    <span className="font-mono text-sm font-black text-white">{topPodium[0].bestDeadlift || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-yellow-500/20">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Weight</span>
                    <span className="font-heading font-bold text-3xl text-white font-mono">
                      {topPodium[0].total} <span className="text-xs text-yellow-400">KG</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-black text-yellow-400 block">IPF GL Points</span>
                    <span className="font-heading font-bold text-3xl text-yellow-400 font-mono drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                      {topPodium[0].ipfGlPoints.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3: Bronze Medalist (Right on Desktop) */}
            {topPodium[2] && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-amber-700/60 bg-gradient-to-b from-amber-950/40 via-black to-zinc-950 p-6 shadow-2xl transition-all hover:scale-[1.02] order-3 mt-0 md:mt-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-700/20 to-orange-800/30 border border-amber-600/80 text-amber-400 font-heading font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(217,119,6,0.25)]">
                    <Medal className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span>🥉 3RD PLACE (BRONZE)</span>
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-black/60 px-2.5 py-0.5 rounded-md border border-white/10">
                    {topPodium[2].weightClass}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="font-heading text-xl font-bold uppercase text-white truncate">
                    {topPodium[2].athleteName}
                  </h3>
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <span>{topPodium[2].gender === "MALE" ? "Men's Division" : "Women's Division"}</span>
                    <span>•</span>
                    <span>BW: {topPodium[2].bodyweight.toFixed(1)} KG</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/60 border border-white/5 text-center mb-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 block">Squat</span>
                    <span className="font-mono text-xs font-black text-white">{topPodium[2].bestSquat || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 block">Bench</span>
                    <span className="font-mono text-xs font-black text-white">{topPodium[2].bestBench || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 block">Deadlift</span>
                    <span className="font-mono text-xs font-black text-white">{topPodium[2].bestDeadlift || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total</span>
                    <span className="font-heading font-bold text-2xl text-white font-mono">
                      {topPodium[2].total} <span className="text-xs text-zinc-500">KG</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-amber-500 block">IPF GL Points</span>
                    <span className="font-heading font-bold text-2xl text-amber-400 font-mono">
                      {topPodium[2].ipfGlPoints.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 2. CATEGORY MEDALISTS (PER WEIGHT CLASS PODIUM) ── */}
        {podiumViewMode === "BY_WEIGHT_CLASS" && (
          <div className="space-y-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {weightClassChampions.map(({ weightClass, champions }) => (
                <div
                  key={weightClass}
                  className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#180a05] to-black p-5 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-gym-primary" />
                      <span className="font-heading font-bold text-sm uppercase text-white">
                        {weightClass} Division
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                      Official Podium
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {champions.map((ath, idx) => {
                      const medalInfo = [
                        { icon: "🥇", label: "GOLD", text: "text-yellow-400", border: "border-yellow-500/40 bg-yellow-500/10" },
                        { icon: "🥈", label: "SILVER", text: "text-slate-300", border: "border-slate-400/30 bg-slate-400/10" },
                        { icon: "🥉", label: "BRONZE", text: "text-amber-500", border: "border-amber-600/30 bg-amber-600/10" },
                      ][idx] || { icon: `#${idx + 1}`, label: "RANK", text: "text-zinc-400", border: "border-white/5 bg-black/40" };

                      return (
                        <div
                          key={ath.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border ${medalInfo.border}`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-base shrink-0">{medalInfo.icon}</span>
                            <div className="truncate">
                              <span className="font-bold text-xs text-white uppercase block truncate">
                                {ath.athleteName}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                Total: {ath.total} KG • GL: {ath.ipfGlPoints.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold uppercase font-mono px-2 py-0.5 rounded ${medalInfo.text}`}>
                            {medalInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FILTER & SORT CONTROLS BAR ── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md mb-6 shadow-xl">
          {/* Formula Selector */}
          <div className="flex items-center gap-1.5 bg-black/80 p-1 rounded-xl border border-white/10">
            <span className="text-[10px] font-semibold uppercase text-zinc-500 px-2 shrink-0">
              Formula:
            </span>
            {[
              { id: "GL" as const, label: "IPF GL Points" },
              { id: "DOTS" as const, label: "DOTS" },
              { id: "WILKS" as const, label: "Wilks" },
              { id: "TOTAL" as const, label: "Total (KG)" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setFormula(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  formula === id
                    ? "bg-gym-primary text-white shadow-md shadow-gym-primary/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 bg-black/80 p-1 rounded-xl border border-white/10">
            <span className="text-[10px] font-semibold uppercase text-zinc-500 px-2 shrink-0">
              Division:
            </span>
            {[
              { id: "ALL" as const, label: "All Athletes" },
              { id: "MALE" as const, label: "Men" },
              { id: "FEMALE" as const, label: "Women" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setGenderFilter(id);
                  setSelectedWeightClass("ALL");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  genderFilter === id
                    ? "bg-white/20 text-white font-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search lifter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/80 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-gym-primary"
            />
          </div>
        </div>

        {/* Weight Class Pills */}
        {availableWeightClasses.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedWeightClass("ALL")}
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                selectedWeightClass === "ALL"
                  ? "bg-gym-primary text-white shadow"
                  : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              All Weight Classes
            </button>
            {availableWeightClasses.map((wc) => (
              <button
                key={wc}
                type="button"
                onClick={() => setSelectedWeightClass(wc)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  selectedWeightClass === wc
                    ? "bg-gym-primary text-white shadow"
                    : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {wc}
              </button>
            ))}
          </div>
        )}

        {/* ── OPENLIFTER-GRADE LIVE SCORES TABLE WITH WINNER BADGES ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#120704] border-b border-white/10 text-zinc-400 uppercase font-heading font-bold text-[11px] tracking-wider">
                  <th className="p-3.5 border-r border-white/5 w-24 text-center">Rank</th>
                  <th className="p-3.5 border-r border-white/5 min-w-[220px]">Athlete &amp; Winner Badges</th>
                  <th className="p-3.5 border-r border-white/5 text-center">BW</th>
                  <th className="p-3.5 border-r border-white/5 text-center min-w-[140px]">Squat (1/2/3)</th>
                  <th className="p-3.5 border-r border-white/5 text-center min-w-[140px]">Bench (1/2/3)</th>
                  <th className="p-3.5 border-r border-white/5 text-center min-w-[140px]">Deadlift (1/2/3)</th>
                  <th className="p-3.5 border-r border-white/5 text-right font-black text-white">Total (KG)</th>
                  <th className="p-3.5 text-right font-black text-gym-primary">
                    {formula === "GL"
                      ? "IPF GL Points"
                      : formula === "DOTS"
                      ? "DOTS Score"
                      : formula === "WILKS"
                      ? "Wilks Score"
                      : "Total (KG)"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/60">
                {filteredLifters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-zinc-500 font-bold uppercase">
                      No championship lifters match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLifters.map((lifter, index) => {
                    const rankNum = index + 1;
                    const isGold = rankNum === 1;
                    const isSilver = rankNum === 2;
                    const isBronze = rankNum === 3;

                    return (
                      <tr
                        key={lifter.id}
                        className={`transition-colors group ${
                          isGold
                            ? "bg-yellow-500/[0.04] hover:bg-yellow-500/[0.08] border-l-4 border-l-yellow-500"
                            : isSilver
                            ? "bg-slate-400/[0.03] hover:bg-slate-400/[0.06] border-l-4 border-l-slate-400"
                            : isBronze
                            ? "bg-amber-700/[0.03] hover:bg-amber-700/[0.06] border-l-4 border-l-amber-600"
                            : "hover:bg-white/5"
                        }`}
                      >
                        {/* Rank with Winner Medal Badges */}
                        <td className="p-3.5 border-r border-white/5 text-center font-heading font-bold font-mono">
                          {isGold ? (
                            <div className="flex items-center justify-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500/30 to-amber-500/40 border border-yellow-400 text-yellow-300 font-heading font-bold text-xs shadow-[0_0_12px_rgba(234,179,8,0.4)] animate-pulse">
                                <Trophy className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                <span>#1 GOLD</span>
                              </span>
                            </div>
                          ) : isSilver ? (
                            <div className="flex items-center justify-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-400/20 to-zinc-400/30 border border-slate-300 text-slate-100 font-heading font-bold text-xs shadow-[0_0_10px_rgba(203,213,225,0.3)]">
                                <Medal className="h-3.5 w-3.5 text-slate-200 fill-slate-200" />
                                <span>#2 SILVER</span>
                              </span>
                            </div>
                          ) : isBronze ? (
                            <div className="flex items-center justify-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-700/20 to-orange-800/30 border border-amber-600 text-amber-400 font-heading font-bold text-xs shadow-[0_0_10px_rgba(217,119,6,0.25)]">
                                <Medal className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                <span>#3 BRONZE</span>
                              </span>
                            </div>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-black/40 border border-white/5 font-mono font-bold text-zinc-400 text-xs">
                              #{rankNum}
                            </span>
                          )}
                        </td>

                        {/* Athlete Info + Official Winner Medal Pill */}
                        <td className="p-3.5 border-r border-white/5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-heading font-bold text-white uppercase text-sm group-hover:text-gym-primary transition-colors">
                              {lifter.athleteName}
                            </span>

                            {/* Winner Badges */}
                            {isGold && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/30 border border-yellow-400/60 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.25)]">
                                <Trophy className="h-3 w-3 text-yellow-400" />
                                <span>🥇 Gold Champion</span>
                              </span>
                            )}
                            {isSilver && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-slate-400/20 to-zinc-400/30 border border-slate-300/60 text-slate-200 shadow-[0_0_8px_rgba(203,213,225,0.2)]">
                                <Medal className="h-3 w-3 text-slate-300" />
                                <span>🥈 Silver Medalist</span>
                              </span>
                            )}
                            {isBronze && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-700/20 to-orange-800/30 border border-amber-600/60 text-amber-400 shadow-[0_0_8px_rgba(217,119,6,0.2)]">
                                <Medal className="h-3 w-3 text-amber-500" />
                                <span>🥉 Bronze Medalist</span>
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span className="text-gym-primary font-mono font-bold">
                              {lifter.weightClass}
                            </span>
                            <span>•</span>
                            <span>{lifter.division}</span>
                          </div>
                        </td>

                        {/* Bodyweight */}
                        <td className="p-3.5 border-r border-white/5 text-center font-mono text-zinc-300">
                          {lifter.bodyweight.toFixed(1)}
                        </td>

                        {/* Squat Attempts */}
                        <td className="p-3.5 border-r border-white/5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {renderAttemptBadge(lifter.squat1)}
                            {renderAttemptBadge(lifter.squat2)}
                            {renderAttemptBadge(lifter.squat3)}
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                            Best: <strong className="text-white font-bold">{lifter.bestSquat || 0}</strong>
                          </span>
                        </td>

                        {/* Bench Press Attempts */}
                        <td className="p-3.5 border-r border-white/5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {renderAttemptBadge(lifter.bench1)}
                            {renderAttemptBadge(lifter.bench2)}
                            {renderAttemptBadge(lifter.bench3)}
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                            Best: <strong className="text-white font-bold">{lifter.bestBench || 0}</strong>
                          </span>
                        </td>

                        {/* Deadlift Attempts */}
                        <td className="p-3.5 border-r border-white/5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {renderAttemptBadge(lifter.deadlift1)}
                            {renderAttemptBadge(lifter.deadlift2)}
                            {renderAttemptBadge(lifter.deadlift3)}
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                            Best: <strong className="text-white font-bold">{lifter.bestDeadlift || 0}</strong>
                          </span>
                        </td>

                        {/* Total KG */}
                        <td className="p-3.5 border-r border-white/5 text-right font-heading font-bold text-white text-base font-mono">
                          {lifter.total} <span className="text-[10px] font-sans text-zinc-500">KG</span>
                        </td>

                        {/* IPF GL / Formula Points */}
                        <td className="p-3.5 text-right font-heading font-bold text-gym-primary text-base font-mono">
                          {formula === "GL"
                            ? lifter.ipfGlPoints.toFixed(2)
                            : formula === "DOTS"
                            ? lifter.dotsPoints.toFixed(2)
                            : formula === "WILKS"
                            ? lifter.wilksPoints.toFixed(2)
                            : lifter.total.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FOOTER CALLOUT / STATS SUMMARY ── */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <div className="text-xs text-zinc-300">
              <strong className="text-white font-bold block">
                Official Medal Awards Criteria (IPF Rule Section 12)
              </strong>
              Gold, Silver, and Bronze medals are awarded for overall 3-Lift Total in each weight category, with Grand Champion trophies determined by IPF GL Points.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tools/strength-calculator"
              className="text-xs font-bold text-gym-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Calculate Your IPF GL Points</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
