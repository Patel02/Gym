"use client";

import {
  getPublicLiveArenaDataAction,
  type PublicLiveArenaData,
  type PublicLifterStageState,
} from "@/actions/public-live-stream.actions";
import type { LiveScoringResultDto } from "@/actions/scoring.actions";
import {
  Award,
  BarChart2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Dumbbell,
  Eye,
  Flame,
  Medal,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Share2,
  Sparkles,
  Trophy,
  Tv,
  Users,
  Volume2,
  VolumeX,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageNavigation } from "@/components/ui/PageNavigation";

interface LiveSpectatorArenaProps {
  initialData: PublicLiveArenaData;
}

export function LiveSpectatorArena({ initialData }: LiveSpectatorArenaProps) {
  const [data, setData] = useState<PublicLiveArenaData>(initialData);
  const [selectedMeetId, setSelectedMeetId] = useState<string>(initialData.selectedMeetId);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [weightFilter, setWeightFilter] = useState<string>("ALL");
  const [selectedLifterModal, setSelectedLifterModal] = useState<LiveScoringResultDto | null>(null);
  const [shareToast, setShareToast] = useState<boolean>(false);

  // SSE Live Connection State
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [sseLatency, setSseLatency] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 60-Second Platform Clock
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Lifter
  const activeLifter: PublicLifterStageState | null = data.activeLifter;
  const refereeLights = data.refereeLights;

  // Attempt Clock tick effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
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
  }, [isTimerRunning]);

  // Handle Meet Change
  const handleMeetChange = async (meetId: string) => {
    setSelectedMeetId(meetId);
    setIsRefreshing(true);
    try {
      const res = await getPublicLiveArenaDataAction(meetId);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.warn("Meet change error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Manual Sync
  const handleManualSync = async () => {
    setIsRefreshing(true);
    try {
      const res = await getPublicLiveArenaDataAction(selectedMeetId);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.warn("Manual sync error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ⚡ SSE Real-Time Live Broadcast Connection
  useEffect(() => {
    const meetId = selectedMeetId || "ALL";
    const url = `/api/live/stream?meetId=${meetId}`;

    // Close any existing connection before creating a new one
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const es = new EventSource(url);
    eventSourceRef.current = es;
    const pingStart = Date.now();

    es.addEventListener("connected", () => {
      setSseConnected(true);
      setSseLatency(Date.now() - pingStart);
    });

    // On score / referee decision → refetch fresh DB data
    const handleScoringUpdate = async () => {
      try {
        const res = await getPublicLiveArenaDataAction(selectedMeetId);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch {
        // silent
      }
    };

    // On stage_update → apply timer + referee lights optimistically (no DB call needed)
    const handleStageUpdate = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data || "{}");

        // Sync the spectator arena timer with the referee desk
        if (payload.timerEvent === "BAR_LOADED" && payload.timerSeconds) {
          setTimerSeconds(payload.timerSeconds as number);
          setIsTimerRunning(true);
        } else if (payload.timerEvent === "TIMER_PAUSE") {
          setIsTimerRunning(false);
        } else if (payload.timerEvent === "TIMER_RESET" && payload.timerSeconds) {
          setIsTimerRunning(false);
          setTimerSeconds(payload.timerSeconds as number);
        }

        // Update referee lights instantly from stage payload
        if (payload.refereeLights) {
          setData((prev) => ({
            ...prev,
            refereeLights: {
              ref1: payload.refereeLights.ref1,
              headRef: payload.refereeLights.headRef,
              ref3: payload.refereeLights.ref3,
              decisionText: payload.refereeLights.decisionText || prev.refereeLights.decisionText,
              isGoodLift: payload.refereeLights.isGoodLift ?? prev.refereeLights.isGoodLift,
              whiteCount: payload.refereeLights.whiteCount ?? prev.refereeLights.whiteCount,
            },
          }));
        }
      } catch {
        // silent parse error
      }
    };

    es.addEventListener("referee_decision", handleScoringUpdate);
    es.addEventListener("score_update", handleScoringUpdate);
    es.addEventListener("stage_update", handleStageUpdate as EventListener);

    es.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      es.close();
      setSseConnected(false);
    };
  }, [selectedMeetId]);


  // Fallback: Background Auto-Poll every 10s (in case SSE is disconnected)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (sseConnected) return; // Skip polling when SSE is active
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        const res = await getPublicLiveArenaDataAction(selectedMeetId);
        if (res.success && res.data) {
          const fresh = res.data;
          setData((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(fresh)) return fresh;
            return prev;
          });
        }
      } catch {
        // Silent poll error
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [selectedMeetId, sseConnected]);

  // Barbell plate visualizer breakdown
  const declaredWeight = activeLifter ? activeLifter.declaredWeight : 200;
  const plateBreakdown = useMemo(() => {
    let sideWeight = (declaredWeight - 25) / 2;
    if (sideWeight <= 0) return [];
    const plates: Array<{ weight: number; color: string; label: string }> = [];
    const denominations = [
      { weight: 25, color: "bg-red-600 text-white", label: "25" },
      { weight: 20, color: "bg-blue-600 text-white", label: "20" },
      { weight: 15, color: "bg-yellow-500 text-black", label: "15" },
      { weight: 10, color: "bg-green-600 text-white", label: "10" },
      { weight: 5, color: "bg-white text-black", label: "5" },
      { weight: 2.5, color: "bg-gray-800 text-white border border-white/20", label: "2.5" },
      { weight: 1.25, color: "bg-gray-400 text-black", label: "1.25" },
    ];

    for (const d of denominations) {
      while (sideWeight >= d.weight) {
        plates.push(d);
        sideWeight -= d.weight;
      }
    }
    return plates;
  }, [declaredWeight]);

  // Share Stream Link
  const handleShareStream = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  // Filtered Table Results
  const filteredResults = useMemo(() => {
    return data.results.filter((r) => {
      const matchesSearch =
        (r.user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (r.user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());

      const matchesWeight =
        weightFilter === "ALL" ||
        (r.user.profile?.weightClass || "").replace("WC_", "") === weightFilter;

      return matchesSearch && matchesWeight;
    });
  }, [data.results, searchQuery, weightFilter]);

  return (
    <div className="space-y-8">
      {/* Page Navigation & Back Link */}
      <PageNavigation
        backHref="/championships"
        backLabel="Back to Championships"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Championships", href: "/championships" },
          { label: "Live Match Day Arena" },
        ]}
        badge="Live Broadcast"
      />

      {/* 1. TOP BROADCAST CONTROL STRIP */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#180603] via-[#0d0301] to-[#140502] p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gym-primary/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/40 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                ● LIVE MATCH DAY BROADCAST
              </div>

              {/* ⚡ SSE Connection Status Badge */}
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-500 ${
                  sseConnected
                    ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    : "border-yellow-500/30 bg-yellow-950/30 text-yellow-500"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      sseConnected ? "animate-ping bg-emerald-400" : "bg-yellow-500"
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      sseConnected ? "bg-emerald-500" : "bg-yellow-500"
                    }`}
                  />
                </span>
                {sseConnected
                  ? `⚡ SSE Live${sseLatency !== null ? ` · ${sseLatency}ms` : ""}`
                  : "⏳ Connecting…"}
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-bold text-gray-300">
                <Eye className="h-3.5 w-3.5 text-gym-primary" />
                <span>{data.spectatorCount} Spectators Watching</span>
              </div>
            </div>

            <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-white sm:text-4xl">
              Match Day <span className="text-gym-primary">Live Arena</span>
            </h1>
            <p className="text-sm font-medium text-gray-400">
              Watch real-time platform attempts, official IPF 3-light referee jury consensus & live championship standings.
            </p>
          </div>

          {/* Meet Selector & Spectator Tools */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px]">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                Broadcast Championship:
              </label>
              <select
                value={selectedMeetId}
                onChange={(e) => handleMeetChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/20 bg-[#1e0a05] px-4 py-2.5 pr-10 text-sm font-semibold text-white transition-all hover:border-gym-primary focus:border-gym-primary focus:outline-none cursor-pointer"
              >
                {data.meets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.city} • {m.dates})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-[34px] h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-end gap-2 pt-5">
              <button
                onClick={handleShareStream}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-[#1a0703] px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-gym-primary hover:bg-gym-primary/20"
                title="Copy live stream link"
              >
                <Share2 className="h-4 w-4 text-gym-primary" />
                <span>Share Stream</span>
              </button>

              <button
                onClick={handleManualSync}
                disabled={isRefreshing}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#150603] text-gray-300 transition-all hover:border-white/30 hover:text-white"
                title="Sync stage"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-gym-primary" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Broadcast Suite View Mode Switcher */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1">
            Display Mode:
          </span>
          <span className="rounded-xl border border-gym-primary/50 bg-gym-primary/20 px-3 py-1.5 text-xs font-bold text-gym-primary shadow-sm flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5" />
            <span>Spectator Arena</span>
          </span>
          <Link
            href={`/live/jumbotron?meet=${selectedMeetId}`}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-bold text-gray-300 hover:border-gym-primary hover:text-gym-primary transition-all flex items-center gap-1.5"
          >
            <Tv className="h-3.5 w-3.5 text-gym-primary" />
            <span>Venue Jumbotron</span>
          </Link>
          <Link
            href={`/live/overlay?meet=${selectedMeetId}`}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-bold text-gray-300 hover:border-gym-primary hover:text-gym-primary transition-all flex items-center gap-1.5"
          >
            <Radio className="h-3.5 w-3.5 text-amber-400" />
            <span>OBS Stream Overlay</span>
          </Link>
          <Link
            href={`/live/warmup?meet=${selectedMeetId}`}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-bold text-gray-300 hover:border-gym-primary hover:text-gym-primary transition-all flex items-center gap-1.5"
          >
            <Dumbbell className="h-3.5 w-3.5 text-blue-400" />
            <span>Backstage Warmup Matrix</span>
          </Link>
          <Link
            href="/referee/dashboard"
            className="ml-auto rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Referee Switchboard →</span>
          </Link>
        </div>

        {/* Share Toast Notification */}
        {shareToast && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/50 px-4 py-2 text-xs font-bold text-emerald-300 shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Live arena link copied to clipboard! Share with coaches and fans.</span>
          </div>
        )}
      </div>

      {/* 2. THE CENTER STAGE JUMBOTRON: ACTIVE PLATFORM COCKPIT */}
      {activeLifter ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: ACTIVE LIFTER & BARBELL LOAD (7 COLS) */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/15 bg-gradient-to-b from-[#180703] to-[#0c0301] p-6 shadow-2xl backdrop-blur-xl lg:col-span-7">
            <div>
              {/* Lifter Spotlight Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gym-primary/40 bg-gym-primary/20 text-gym-primary shadow-inner">
                    <Dumbbell className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        ON PLATFORM NOW
                      </span>
                      <span className="text-xs font-bold text-gray-400">Rank #{activeLifter.rank}</span>
                    </div>
                    <h2 className="font-heading text-3xl font-bold uppercase tracking-wider text-white">
                      {activeLifter.name}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    Category / Division
                  </div>
                  <div className="font-heading text-base font-bold text-gym-primary">
                    {activeLifter.weightClass} • {activeLifter.gender}
                  </div>
                  <div className="text-xs text-gray-400">
                    Weigh-In BW: <span className="font-bold text-white">{activeLifter.bodyweight} KG</span>
                  </div>
                </div>
              </div>

              {/* Current Discipline & Attempt Badge */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#120402] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-gym-primary" />
                    <span className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                      {activeLifter.currentDiscipline === "squat"
                        ? "Squat"
                        : activeLifter.currentDiscipline === "bench"
                        ? "Bench Press"
                        : "Deadlift"}
                    </span>
                  </div>
                  <span className="rounded-xl border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 font-heading text-xs font-bold uppercase tracking-wider text-gym-primary">
                    Attempt #{activeLifter.attemptNumber}
                  </span>
                </div>

                {/* Declared Bar Load Display */}
                <div className="my-5 text-center">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Barbell Declared Load
                  </div>
                  <div className="mt-1 flex items-baseline justify-center gap-2">
                    <span className="font-heading text-6xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(230,80,27,0.3)]">
                      {activeLifter.declaredWeight}
                    </span>
                    <span className="font-heading text-2xl font-bold text-gym-primary">KG</span>
                  </div>
                  <div className="text-xs text-gray-400">IPF Certified Bar & Calibrated Discs</div>
                </div>

                {/* Barbell Sleeve Plate Visualizer */}
                <div className="rounded-xl border border-white/5 bg-[#080201] p-3.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Each Sleeve Loading (Bar 20kg + Collars 5kg = 25kg):</span>
                    <span className="font-bold text-white">
                      {((activeLifter.declaredWeight - 25) / 2).toFixed(2)} KG / side
                    </span>
                  </div>

                  <div className="mt-2.5 flex h-11 items-center justify-center gap-1 rounded-lg bg-[#040101] p-1">
                    <div className="h-7 w-3 rounded-l bg-gray-500" title="Barbell Sleeve" />
                    {plateBreakdown.length === 0 ? (
                      <span className="text-[10px] text-gray-500">Empty Bar (25kg)</span>
                    ) : (
                      plateBreakdown.map((plate, idx) => (
                        <div
                          key={idx}
                          className={`flex h-9 w-7 items-center justify-center rounded-sm text-[10px] font-semibold shadow-md ${plate.color}`}
                          title={`${plate.weight} KG Plate`}
                        >
                          {plate.label}
                        </div>
                      ))
                    )}
                    <div className="h-8 w-2.5 rounded-r bg-yellow-400 shadow-sm" title="IPF Competition Collar" />
                  </div>
                </div>
              </div>
            </div>

            {/* Current Lifter Stats Footer */}
            <div className="mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-[#0c0301] p-3.5 text-center">
              <div>
                <div className="text-[10px] font-bold uppercase text-gray-400">Best Squat</div>
                <div className="text-sm font-black text-white">{activeLifter.bestSquat ?? "—"} KG</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-gray-400">Best Bench</div>
                <div className="text-sm font-black text-white">{activeLifter.bestBench ?? "—"} KG</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-gray-400">Best Deadlift</div>
                <div className="text-sm font-black text-white">{activeLifter.bestDeadlift ?? "—"} KG</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-gym-primary">IPF Total</div>
                <div className="text-sm font-black text-gym-primary">{activeLifter.total ?? 0} KG</div>
              </div>
            </div>
          </div>

          {/* RIGHT: OFFICIAL IPF 3-LIGHT REFEREE BOARD & ATTEMPT CLOCK (5 COLS) */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/15 bg-gradient-to-b from-[#180703] to-[#0c0301] p-6 shadow-2xl backdrop-blur-xl lg:col-span-5">
            <div>
              {/* 1-Minute Official Attempt Clock */}
              <div className="rounded-2xl border border-white/10 bg-[#120402] p-4 text-center">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gym-primary" />
                    Official Attempt Clock
                  </span>
                  <span
                    className={`font-black ${
                      timerSeconds <= 10 && isTimerRunning
                        ? "animate-pulse text-red-500"
                        : "text-emerald-400"
                    }`}
                  >
                    {isTimerRunning ? "● 60S COUNTDOWN" : "READY"}
                  </span>
                </div>

                <div className="my-3 flex items-center justify-center">
                  <div
                    className={`font-heading text-6xl font-black tracking-widest ${
                      timerSeconds <= 10
                        ? "text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]"
                        : "text-white"
                    }`}
                  >
                    00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setIsTimerRunning((p) => !p)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-all ${
                      isTimerRunning ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
                  >
                    {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {isTimerRunning ? "Pause" : "Start Clock"}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(60);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-[#1a0804] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>
              </div>

              {/* IPF 3-LIGHT REFEREE JURY LENSES */}
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gym-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      IPF 3-Light Referee Jury
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">Live Stage Lights</span>
                </div>

                {/* 3 Giant Illuminated Lens Fixtures */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Left Referee */}
                  <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-[#0d0301] p-3 text-center">
                    <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      REF 1 (LEFT)
                    </span>
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all duration-500 ${
                        refereeLights.ref1 === "WHITE"
                          ? "border-white bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.95)]"
                          : "border-red-600 bg-red-600 text-white shadow-[0_0_35px_rgba(239,68,68,0.95)]"
                      }`}
                    >
                      <span className="font-heading text-xs font-bold tracking-widest uppercase">
                        {refereeLights.ref1}
                      </span>
                    </div>
                  </div>

                  {/* Head Referee (Center) */}
                  <div className="flex flex-col items-center rounded-2xl border-2 border-gym-primary/30 bg-[#160603] p-3 text-center">
                    <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gym-primary">
                      HEAD REFEREE
                    </span>
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all duration-500 ${
                        refereeLights.headRef === "WHITE"
                          ? "border-white bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.95)]"
                          : "border-red-600 bg-red-600 text-white shadow-[0_0_35px_rgba(239,68,68,0.95)]"
                      }`}
                    >
                      <span className="font-heading text-xs font-bold tracking-widest uppercase">
                        {refereeLights.headRef}
                      </span>
                    </div>
                  </div>

                  {/* Right Referee */}
                  <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-[#0d0301] p-3 text-center">
                    <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      REF 3 (RIGHT)
                    </span>
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all duration-500 ${
                        refereeLights.ref3 === "WHITE"
                          ? "border-white bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.95)]"
                          : "border-red-600 bg-red-600 text-white shadow-[0_0_35px_rgba(239,68,68,0.95)]"
                      }`}
                    >
                      <span className="font-heading text-xs font-bold tracking-widest uppercase">
                        {refereeLights.ref3}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consensus Banner */}
                <div
                  className={`mt-4 flex items-center justify-between rounded-2xl border p-4 font-heading font-bold tracking-wider transition-all shadow-xl ${
                    refereeLights.isGoodLift
                      ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-400 shadow-emerald-950/50"
                      : "border-red-500/50 bg-red-950/40 text-red-400 shadow-red-950/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {refereeLights.isGoodLift ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-400" />
                    )}
                    <span className="text-base uppercase">{refereeLights.decisionText}</span>
                  </div>
                  <span className="rounded-lg bg-black/40 px-3 py-1 text-xs">
                    {refereeLights.isGoodLift
                      ? `+${activeLifter.declaredWeight} KG`
                      : `-${activeLifter.declaredWeight} KG`}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Rule Note */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/5 bg-[#090201] p-3 text-[11px] text-gray-500">
              <span>IPF Rule: Minimum 2 white lights required for Good Lift</span>
              <span className="font-bold text-gym-primary">Live Synced</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-[#120503] p-12 text-center">
          <Trophy className="mx-auto h-16 w-16 text-gray-600" />
          <h3 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wider text-white">
            Championship Platform Preparing for Next Flight
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs text-gray-400">
            Athletes are currently warming up in the backroom. Live attempt scores will appear as soon as the referee
            commences the platform flight.
          </p>
        </div>
      )}

      {/* 3. REAL-TIME CHAMPIONSHIP STANDINGS & ATTEMPT LEDGER */}
      <div className="rounded-3xl border border-white/10 bg-[#0e0402] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gym-primary" />
              <h3 className="font-heading text-2xl font-bold uppercase tracking-wider text-white">
                Championship Scoreboard & Standings
              </h3>
            </div>
            <p className="text-xs text-gray-400">
              Ranked in real time by Total (KG) & IPF GL points. Click any athlete row to view full attempt scorecard.
            </p>
          </div>

          {/* Search & Weight Category Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search athletes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#180603] py-2 pl-9 pr-4 text-xs font-semibold text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div className="relative">
              <select
                value={weightFilter}
                onChange={(e) => setWeightFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#180603] px-3 py-2 text-xs font-bold text-white focus:border-gym-primary focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Classes</option>
                <option value="59">59 KG</option>
                <option value="66">66 KG</option>
                <option value="74">74 KG</option>
                <option value="83">83 KG</option>
                <option value="93">93 KG</option>
                <option value="105">105 KG</option>
                <option value="120">120 KG</option>
                <option value="120_PLUS">+120 KG</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Live Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#140603] text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Lifter Info</th>
                <th className="px-3 py-3 text-center" colSpan={4}>
                  Squat (KG)
                </th>
                <th className="px-3 py-3 text-center" colSpan={4}>
                  Bench Press (KG)
                </th>
                <th className="px-3 py-3 text-center" colSpan={4}>
                  Deadlift (KG)
                </th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">IPF GL</th>
                <th className="px-4 py-3 text-center">Scorecard</th>
              </tr>
              <tr className="border-b border-white/5 bg-[#0a0301] text-[9px] font-bold uppercase tracking-widest text-gray-500">
                <th className="px-4 py-1.5" />
                <th className="px-4 py-1.5" />
                <th className="px-2 py-1.5 text-center">1</th>
                <th className="px-2 py-1.5 text-center">2</th>
                <th className="px-2 py-1.5 text-center">3</th>
                <th className="px-2 py-1.5 text-center text-gym-primary">Best</th>
                <th className="px-2 py-1.5 text-center">1</th>
                <th className="px-2 py-1.5 text-center">2</th>
                <th className="px-2 py-1.5 text-center">3</th>
                <th className="px-2 py-1.5 text-center text-gym-primary">Best</th>
                <th className="px-2 py-1.5 text-center">1</th>
                <th className="px-2 py-1.5 text-center">2</th>
                <th className="px-2 py-1.5 text-center">3</th>
                <th className="px-2 py-1.5 text-center text-gym-primary">Best</th>
                <th className="px-4 py-1.5 text-right" />
                <th className="px-4 py-1.5 text-right" />
                <th className="px-4 py-1.5 text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-10 text-center text-gray-500">
                    No lifters match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredResults.map((r, index) => {
                  const isOnStage = activeLifter?.resultId === r.id;

                  const renderAttemptCell = (val: number | null) => {
                    if (val === null || val === undefined || val === 0) {
                      return <span className="text-[10px] text-gray-600">—</span>;
                    }
                    const isGood = val > 0;
                    return (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          isGood
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-950/60 text-red-400 line-through border border-red-500/20"
                        }`}
                      >
                        {Math.abs(val)}
                      </span>
                    );
                  };

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedLifterModal(r)}
                      className={`transition-colors hover:bg-white/[0.03] cursor-pointer ${
                        isOnStage ? "bg-gym-primary/10 border-l-4 border-l-gym-primary" : ""
                      }`}
                    >
                      {/* Rank with Winner Medal Badges */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {index === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/30 to-amber-500/40 border border-yellow-400 text-yellow-300 font-heading font-bold text-[11px] shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                              <Trophy className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              <span>#1 GOLD</span>
                            </span>
                          ) : index === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-slate-300/20 to-zinc-400/30 border border-slate-300 text-slate-100 font-heading font-bold text-[11px]">
                              <Medal className="h-3 w-3 text-slate-200 fill-slate-200" />
                              <span>#2 SILVER</span>
                            </span>
                          ) : index === 2 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-700/20 to-orange-800/30 border border-amber-600 text-amber-400 font-heading font-bold text-[11px]">
                              <Medal className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span>#3 BRONZE</span>
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-gray-500 text-xs">#{index + 1}</span>
                          )}
                        </div>
                      </td>

                      {/* Lifter Info with Winner Tag */}
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-bold text-white flex flex-wrap items-center gap-2">
                            <span>{r.user.name || r.user.email}</span>
                            {index === 0 && (
                              <span className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 text-[9px] font-semibold uppercase text-yellow-400">
                                🥇 Gold Leader
                              </span>
                            )}
                            {index === 1 && (
                              <span className="rounded-full bg-slate-400/20 border border-slate-400/40 px-2 py-0.5 text-[9px] font-semibold uppercase text-slate-200">
                                🥈 Silver Runner-Up
                              </span>
                            )}
                            {index === 2 && (
                              <span className="rounded-full bg-amber-700/20 border border-amber-600/40 px-2 py-0.5 text-[9px] font-semibold uppercase text-amber-400">
                                🥉 Bronze 3rd Place
                              </span>
                            )}
                            {isOnStage && (
                              <span className="rounded bg-gym-primary px-1.5 py-0.2 text-[8px] font-black uppercase text-white animate-pulse">
                                ON STAGE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {r.user.profile?.weightClass?.replace("WC_", "") || "83"} KG • BW: {r.bodyweight || 82.5} KG
                          </div>
                        </div>
                      </td>

                      {/* Squat */}
                      <td className="px-2 py-3 text-center">{renderAttemptCell(r.squat1)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell(r.squat2)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell(r.squat3)}</td>
                      <td className="px-2 py-3 text-center font-bold text-gym-primary">
                        {r.bestSquat ? `${r.bestSquat}` : "—"}
                      </td>

                      {/* Bench */}
                      <td className="px-2 py-3 text-center">{renderAttemptCell(r.bench1)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell(r.bench2)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell(r.bench3)}</td>
                      <td className="px-2 py-3 text-center font-bold text-blue-400">
                        {r.bestBench ? `${r.bestBench}` : "—"}
                      </td>

                      {/* Deadlift */}
                      <td className="px-2 py-3 text-center">{renderAttemptCell(r.deadlift1)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell(r.deadlift2)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell(r.deadlift3)}</td>
                      <td className="px-2 py-3 text-center font-bold text-emerald-400">
                        {r.bestDeadlift ? `${r.bestDeadlift}` : "—"}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-right font-heading text-sm font-black text-white">
                        {r.total ? `${r.total} KG` : "0 KG"}
                      </td>

                      {/* IPF GL */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-gym-primary">
                        {r.ipfGlPoints ? r.ipfGlPoints.toFixed(2) : "0.00"}
                      </td>

                      {/* Card Modal Action */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLifterModal(r);
                          }}
                          className="rounded-lg border border-white/10 bg-[#160603] px-2.5 py-1 text-[10px] font-bold text-gray-300 hover:border-gym-primary hover:text-white"
                        >
                          View Card
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. LIFTER SCORECARD MODAL */}
      {selectedLifterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-b from-[#180603] to-[#0c0301] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/20 text-gym-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-xl font-bold uppercase text-white">
                    {selectedLifterModal.user.name || selectedLifterModal.user.email}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {selectedLifterModal.user.profile?.weightClass?.replace("WC_", "") || "83"} KG • Weigh-In BW:{" "}
                    {selectedLifterModal.bodyweight} KG
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLifterModal(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Attempts Matrix */}
            <div className="mt-5 space-y-4">
              {/* Squat */}
              <div className="rounded-xl border border-white/10 bg-[#100402] p-3.5">
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-2">
                  <span>Squat</span>
                  <span className="text-gym-primary">Best: {selectedLifterModal.bestSquat ?? "—"} KG</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-black/40 p-2">
                    <div className="text-[10px] text-gray-500">Attempt 1</div>
                    <div className="font-bold text-white">{selectedLifterModal.squat1 ?? "—"}</div>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <div className="text-[10px] text-gray-500">Attempt 2</div>
                    <div className="font-bold text-white">{selectedLifterModal.squat2 ?? "—"}</div>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <div className="text-[10px] text-gray-500">Attempt 3</div>
                    <div className="font-bold text-white">{selectedLifterModal.squat3 ?? "—"}</div>
                  </div>
                </div>
              </div>

              {/* Bench */}
              <div className="rounded-xl border border-white/10 bg-[#100402] p-3.5">
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-2">
                  <span>Bench Press</span>
                  <span className="text-blue-400">Best: {selectedLifterModal.bestBench ?? "—"} KG</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-black/40 p-2">
                    <div className="text-[10px] text-gray-500">Attempt 1</div>
                    <div className="font-bold text-white">{selectedLifterModal.bench1 ?? "—"}</div>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <div className="text-[10px] text-gray-500">Attempt 2</div>
                    <div className="font-bold text-white">{selectedLifterModal.bench2 ?? "—"}</div>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <div className="text-[10px] text-gray-500">Attempt 3</div>
                    <div className="font-bold text-white">{selectedLifterModal.bench3 ?? "—"}</div>
                  </div>
                </div>
              </div>

              {/* Deadlift */}
              <div className="rounded-xl border border-white/10 bg-[#100402] p-3.5">
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-2">
                  <span>Deadlift</span>
                  <span className="text-emerald-400">Best: {selectedLifterModal.bestDeadlift ?? "—"} KG</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-black/40 p-2">
                    <div className="text-[10px] text-gray-500">Attempt 1</div>
                    <div className="font-bold text-white">{selectedLifterModal.deadlift1 ?? "—"}</div>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <div className="text-[10px] text-gray-500">Attempt 2</div>
                    <div className="font-bold text-white">{selectedLifterModal.deadlift2 ?? "—"}</div>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <div className="text-[10px] text-gray-500">Attempt 3</div>
                    <div className="font-bold text-white">{selectedLifterModal.deadlift3 ?? "—"}</div>
                  </div>
                </div>
              </div>

              {/* Total Banner */}
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-gym-primary/20 to-transparent p-3.5 border border-gym-primary/30">
                <div>
                  <div className="text-[10px] font-semibold uppercase text-gym-primary">Official Total</div>
                  <div className="font-heading text-2xl font-bold text-white">
                    {selectedLifterModal.total ?? 0} KG
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase text-gray-400">IPF GL Points</div>
                  <div className="font-mono text-xl font-bold text-gym-primary">
                    {selectedLifterModal.ipfGlPoints ? selectedLifterModal.ipfGlPoints.toFixed(2) : "0.00"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedLifterModal(null)}
                className="rounded-xl bg-white/10 px-5 py-2 text-xs font-bold uppercase text-white hover:bg-white/20"
              >
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
