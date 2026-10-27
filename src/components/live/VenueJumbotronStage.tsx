"use client";

import {
  getPublicLiveArenaDataAction,
  type PublicLiveArenaData,
  type PublicLifterStageState,
} from "@/actions/public-live-stream.actions";
import { meetTimerAudio } from "@/lib/meet-timer-audio";
import { calculateBarbellPlates } from "@/lib/plate-calculator";
import {
  Clock,
  Dumbbell,
  Maximize2,
  Minimize2,
  Radio,
  RefreshCw,
  Scale,
  ShieldCheck,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageNavigation } from "@/components/ui/PageNavigation";

interface VenueJumbotronStageProps {
  initialData: PublicLiveArenaData;
}

export function VenueJumbotronStage({ initialData }: VenueJumbotronStageProps) {
  const [data, setData] = useState<PublicLiveArenaData>(initialData);
  const [selectedMeetId, setSelectedMeetId] = useState<string>(initialData.selectedMeetId);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [sseConnected, setSseConnected] = useState<boolean>(false);

  // 60-Second Countdown Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const activeLifter: PublicLifterStageState | null = data.activeLifter;
  const refereeLights = data.refereeLights;

  // Sync audio engine mute state
  useEffect(() => {
    meetTimerAudio.isMuted = !isAudioEnabled;
  }, [isAudioEnabled]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard shortcuts: F = Fullscreen, M = Mute/Unmute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        setIsAudioEnabled((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Attempt Clock tick effect with Audio cues
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            meetTimerAudio.playTimeoutBuzzer();
            return 0;
          }
          if (prev === 31) {
            meetTimerAudio.playThirtySecondWarning();
          } else if (prev <= 11) {
            meetTimerAudio.playTenSecondTick();
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

  // SSE Live Connection
  useEffect(() => {
    const meetId = selectedMeetId || "ALL";
    const url = `/api/live/stream?meetId=${meetId}`;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      setSseConnected(true);
    });

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

    const handleStageUpdate = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data || "{}");

        if (payload.timerEvent === "BAR_LOADED" && payload.timerSeconds) {
          setTimerSeconds(payload.timerSeconds as number);
          setIsTimerRunning(true);
          meetTimerAudio.playBarLoadedSignal();
        } else if (payload.timerEvent === "TIMER_PAUSE") {
          setIsTimerRunning(false);
        } else if (payload.timerEvent === "TIMER_RESET" && payload.timerSeconds) {
          setIsTimerRunning(false);
          setTimerSeconds(payload.timerSeconds as number);
        }

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

          if (payload.refereeLights.isGoodLift) {
            meetTimerAudio.playGoodLiftChime();
          } else {
            meetTimerAudio.playNoLiftBuzzer();
          }
        }
      } catch {
        // silent
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

  // Barbell loading breakdown
  const barLoad = useMemo(() => {
    const weight = activeLifter?.declaredWeight || 200;
    return calculateBarbellPlates(weight, 20, 2.5, false);
  }, [activeLifter?.declaredWeight]);

  // Timer visual states
  const isTimerCritical = timerSeconds <= 10 && isTimerRunning;
  const isTimerWarning = timerSeconds <= 30 && timerSeconds > 10;

  // Queue simulation for bottom marquee
  const queueItems = useMemo(() => {
    const res = data.results || [];
    return [
      {
        label: "NOW ON STAGE",
        name: activeLifter?.name || "Active Athlete",
        weight: activeLifter?.declaredWeight || 200,
        badge: "bg-gym-primary text-black",
      },
      {
        label: "IN THE HOLE (NEXT)",
        name: res[1]?.user?.name || "Amit Patel",
        weight: 210,
        badge: "bg-amber-500/20 text-amber-400 border border-amber-500/40",
      },
      {
        label: "IN THE RACK (2ND)",
        name: res[2]?.user?.name || "Vikramaditya",
        weight: 215,
        badge: "bg-blue-500/20 text-blue-400 border border-blue-500/40",
      },
    ];
  }, [data.results, activeLifter]);

  return (
    <div
      className={`min-h-screen w-full bg-[#050507] text-white font-sans overflow-x-hidden flex flex-col justify-between selection:bg-gym-primary selection:text-black ${
        isFullscreen ? "pt-0" : "pt-32 sm:pt-36 lg:pt-40"
      }`}
    >
      {/* Background Stadium Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className={`absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1100px] rounded-full blur-[180px] transition-all duration-700 ${
            refereeLights.isGoodLift
              ? "bg-emerald-500/10"
              : "bg-red-600/15"
          }`}
        />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gym-primary/10 blur-[160px]" />
      </div>

      {/* TOP BREADCRUMB NAVIGATION */}
      {!isFullscreen && (
        <div className="w-full bg-[#0a0a0c] border-b border-zinc-900 px-6 py-2 shrink-0 z-30">
          <PageNavigation
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Championships", href: "/championships" },
              { label: "Live Arena", href: "/live" },
              { label: "Venue Stage Jumbotron" },
            ]}
            badge="Stage Projector HUD"
            className="mb-0"
          />
        </div>
      )}

      {/* TOP ARENA HUD BAR */}
      <header className="w-full flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl shrink-0 z-20">
        {/* Left: Federation Crest & Championship Details */}
        <div className="flex items-center gap-4">
          <Link
            href="/live"
            className="flex items-center gap-3 group transition-transform hover:scale-105"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gym-primary via-amber-500 to-amber-700 font-black text-black text-lg shadow-[0_0_25px_rgba(230,80,27,0.4)]">
              WPI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gym-primary">
                  World Powerlifting India
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Stage Jumbotron HUD
                </span>
              </div>
              <div className="text-base font-black text-white group-hover:text-gym-primary transition-colors uppercase tracking-tight">
                {data.currentMeet?.title || "National Powerlifting Championships"}
              </div>
            </div>
          </Link>

          {/* Platform & Flight Pill */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-gym-primary animate-pulse" />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-zinc-300">
              Platform 1 • Flight A
            </span>
          </div>

          {/* SSE Live Status */}
          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1">
            <span className="relative flex h-2 w-2">
              {sseConnected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  sseConnected ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
            </span>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-400">
              {sseConnected ? "Live SSE Synced" : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Right: Controls & Navigation */}
        <div className="flex items-center gap-3">
          {/* Audio toggle button */}
          <button
            onClick={() => setIsAudioEnabled((prev) => !prev)}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isAudioEnabled
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            }`}
            title="Press 'M' to toggle sound"
          >
            {isAudioEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span>Audio Horn On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span>Muted</span>
              </>
            )}
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:border-gym-primary hover:text-gym-primary transition-all cursor-pointer shadow-md"
            title="Press 'F' for Fullscreen"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Exit FS</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>

          {/* Return to Arena Hub Link */}
          <Link
            href="/live"
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            Exit Stage
          </Link>
        </div>
      </header>

      {/* MAIN JUMBOTRON ARENA COCKPIT */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col justify-center">
        <div className="w-full flex flex-col lg:flex-row items-stretch gap-4 sm:gap-5">
          {/* ============================================================== */}
          {/* LEFT COLUMN: ACTIVE ATHLETE PROFILE & BARBELL LOADING (58%)  */}
          {/* ============================================================== */}
          <div className="w-full lg:w-[58%] flex flex-col justify-between gap-4">
            {/* 1. Athlete Hero Card */}
            <div className="rounded-3xl border border-zinc-800/90 bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-black p-5 sm:p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
              {/* Top Meta Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gym-primary px-3.5 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(230,80,27,0.4)]">
                    NOW ON PLATFORM
                  </span>
                  <span className="font-mono text-sm font-bold text-zinc-300">
                    {activeLifter?.weightClass || "83 KG"} • {activeLifter?.gender || "MALE"} • {activeLifter?.division || "OPEN"}
                  </span>
                </div>
                <div className="rounded-xl border border-gym-primary/30 bg-gym-primary/10 px-3 py-1 text-xs font-black text-gym-primary uppercase tracking-wider">
                  Platform Rank #{activeLifter?.rank || 1}
                </div>
              </div>

              {/* Athlete Big Name & Declared Weight */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">
                    Championship Competitor
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none drop-shadow-lg">
                    {activeLifter?.name || "Active Athlete"}
                  </h1>
                  <div className="mt-2.5 flex items-center gap-3 text-zinc-400 text-sm font-medium">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Scale className="h-4 w-4 text-gym-primary" />
                      BW: <strong className="text-white font-mono">{activeLifter?.bodyweight?.toFixed(1) || "82.5"} KG</strong>
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span>Equipment: <strong className="text-white uppercase">{activeLifter?.equipment || "RAW"}</strong></span>
                    <span className="text-zinc-600">•</span>
                    <span>Lot: <strong className="text-white font-mono">#14</strong></span>
                  </div>
                </div>

                {/* Declared Attempt Weight Box */}
                <div className="text-left sm:text-right bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-xl shrink-0">
                  <div className="text-xs font-black uppercase tracking-widest text-gym-primary flex items-center justify-start sm:justify-end gap-1.5">
                    <Dumbbell className="h-3.5 w-3.5" />
                    <span>{activeLifter?.currentDiscipline || "SQUAT"} • ATTEMPT {activeLifter?.attemptNumber || 1}</span>
                  </div>
                  <div className="font-mono text-4xl sm:text-5xl font-black text-white leading-none mt-1">
                    {activeLifter?.declaredWeight?.toFixed(1) || "200.0"}{" "}
                    <span className="text-xl sm:text-2xl text-gym-primary font-sans">KG</span>
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">
                    ≈ {((activeLifter?.declaredWeight || 200) * 2.20462).toFixed(1)} LBS
                  </div>
                </div>
              </div>

              {/* Subtotal & Discipline Score Tracker */}
              <div className="grid grid-cols-4 gap-2.5 pt-3 border-t border-zinc-800/80">
                <div className="bg-zinc-950/80 rounded-2xl p-2.5 text-center border border-zinc-800">
                  <div className="text-[10px] font-bold uppercase text-zinc-500">Best Squat</div>
                  <div className="text-lg font-mono font-black text-white mt-0.5">
                    {activeLifter?.bestSquat ? `${activeLifter.bestSquat} KG` : "—"}
                  </div>
                </div>
                <div className="bg-zinc-950/80 rounded-2xl p-2.5 text-center border border-zinc-800">
                  <div className="text-[10px] font-bold uppercase text-zinc-500">Best Bench</div>
                  <div className="text-lg font-mono font-black text-white mt-0.5">
                    {activeLifter?.bestBench ? `${activeLifter.bestBench} KG` : "—"}
                  </div>
                </div>
                <div className="bg-zinc-950/80 rounded-2xl p-2.5 text-center border border-zinc-800">
                  <div className="text-[10px] font-bold uppercase text-zinc-500">Best Deadlift</div>
                  <div className="text-lg font-mono font-black text-white mt-0.5">
                    {activeLifter?.bestDeadlift ? `${activeLifter.bestDeadlift} KG` : "—"}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gym-primary/20 to-zinc-950 rounded-2xl p-2.5 text-center border border-gym-primary/40 shadow-[0_0_15px_rgba(230,80,27,0.15)]">
                  <div className="text-[10px] font-black uppercase text-gym-primary">Live Total</div>
                  <div className="text-lg font-mono font-black text-white mt-0.5">
                    {activeLifter?.total ? `${activeLifter.total} KG` : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Barbell Plate Visualizer Sleeve */}
            <div className="rounded-3xl border border-zinc-800/90 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black p-4 sm:p-5 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-gym-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-300">
                    IPF Calibrated Barbell Diagram
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  Bar: 20kg • Collars: 5kg Total
                </span>
              </div>

              {/* Visual Barbell Sleeve */}
              <div className="py-2.5 flex items-center justify-center">
                <div className="relative flex items-center h-28 bg-zinc-950/90 rounded-2xl p-3 border border-zinc-800/80 w-full justify-center overflow-x-auto">
                  {/* Steel Shaft */}
                  <div className="h-5 w-16 bg-gradient-to-b from-zinc-400 via-zinc-200 to-zinc-500 rounded-l-md border-y border-zinc-300 flex items-center justify-center text-[9px] font-black text-zinc-900 font-mono shadow-inner">
                    BAR 20
                  </div>

                  {/* Inside Collar Rim */}
                  <div className="h-24 w-3.5 bg-gradient-to-b from-zinc-300 to-zinc-500 border-x border-zinc-400 shadow-md" />

                  {/* Loaded Calibrated Plates */}
                  <div className="flex items-center gap-1.5 pl-1.5">
                    {barLoad.platesPerSide.map((p, idx) => (
                      <div
                        key={idx}
                        className={`${p.bgClass} ${p.textClass} rounded-sm flex items-center justify-center font-mono font-black text-xs border border-black/40 shadow-lg transition-transform hover:scale-105`}
                        style={{
                          height: `${Math.max(p.heightPercent * 0.95, 38)}px`,
                          width: `${Math.max(p.widthPx * 1.05, 18)}px`,
                        }}
                        title={`${p.weight} KG (${p.colorName})`}
                      >
                        <span className="-rotate-90 select-none tracking-tighter">
                          {p.weight}
                        </span>
                      </div>
                    ))}
                    {/* Outer 2.5kg Competition Collar */}
                    <div
                      className="h-14 w-3 bg-gradient-to-b from-zinc-100 via-zinc-300 to-zinc-400 border border-zinc-200 rounded-r shadow-md"
                      title="2.5 KG Competition Collar"
                    />
                  </div>
                </div>
              </div>

              {/* Recipe Breakdown Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1">
                  Plates / Side:
                </span>
                {barLoad.plateCountsPerSide.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-0.5 text-xs font-mono font-bold text-white flex items-center gap-1 shadow-sm"
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.plate.hexColor }}
                    />
                    {item.count} × {item.plate.weight}kg
                  </span>
                ))}
                <span className="rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-0.5 text-xs font-mono font-bold text-zinc-400">
                  + 2.5kg Collar
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: 3 GIANT REFEREE LIGHTS & COUNTDOWN CLOCK (42%) */}
          {/* ============================================================== */}
          <div className="w-full lg:w-[42%] flex flex-col justify-between gap-4">
            {/* 1. 60-Second Arena Countdown Clock */}
            <div
              className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 shadow-2xl relative overflow-hidden ${
                isTimerCritical
                  ? "border-red-500 bg-gradient-to-br from-red-950/60 to-black shadow-[0_0_60px_rgba(220,38,38,0.5)] animate-pulse"
                  : isTimerWarning
                  ? "border-amber-500/60 bg-gradient-to-br from-amber-950/30 to-black shadow-[0_0_40px_rgba(245,158,11,0.25)]"
                  : "border-zinc-800/90 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                  <Clock className="h-4 w-4 text-gym-primary" />
                  <span>Platform Attempt Clock</span>
                </div>
                <span
                  className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider font-mono ${
                    isTimerRunning
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {isTimerRunning ? "Clock Active" : "Clock Paused"}
                </span>
              </div>

              {/* Big Digits Display */}
              <div className="py-4 text-center">
                <div
                  className={`font-mono text-7xl sm:text-8xl font-black tracking-tighter leading-none select-none ${
                    isTimerCritical
                      ? "text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.8)]"
                      : isTimerWarning
                      ? "text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                      : "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                  }`}
                >
                  {String(timerSeconds).padStart(2, "0")}
                  <span className="text-3xl text-zinc-600 font-sans ml-2 font-light">s</span>
                </div>
                <div className="mt-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                  {isTimerCritical
                    ? "⚠️ URGENT: COMMENCE ATTEMPT NOW"
                    : isTimerRunning
                    ? "BAR IS LOADED • 1-MINUTE TIME WINDOW"
                    : "STANDBY FOR BAR LOADED SIGNAL"}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-800/80 rounded-full h-3 overflow-hidden border border-zinc-700/50">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isTimerCritical
                      ? "bg-red-500 shadow-[0_0_15px_#ef4444]"
                      : isTimerWarning
                      ? "bg-amber-400 shadow-[0_0_15px_#f59e0b]"
                      : "bg-emerald-500 shadow-[0_0_15px_#10b981]"
                  }`}
                  style={{ width: `${(timerSeconds / 60) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. IPF 3-Referee Platform Decision Lights */}
            <div className="rounded-3xl border border-zinc-800/90 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black p-5 sm:p-6 backdrop-blur-2xl shadow-2xl flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-gym-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-300">
                    Official IPF 3-Referee Jury System
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase text-zinc-500">
                  VAR Platform Desk
                </span>
              </div>

              {/* The 3 Huge Circles */}
              <div className="py-4 flex items-center justify-around gap-4 sm:gap-6">
                {/* Left Referee */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 transition-all duration-300 flex items-center justify-center shadow-2xl ${
                      refereeLights.ref1 === "WHITE"
                        ? "border-white bg-white text-zinc-950 shadow-[0_0_50px_rgba(255,255,255,0.8)] scale-105"
                        : "border-red-600 bg-red-600 text-white shadow-[0_0_50px_rgba(220,38,38,0.8)] scale-105"
                    }`}
                  >
                    <span className="font-mono text-lg sm:text-xl font-black">
                      {refereeLights.ref1 === "WHITE" ? "WHITE" : "RED"}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Left Ref
                  </span>
                </div>

                {/* Chief Referee (Center - Spotlight) */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`h-24 w-24 sm:h-30 sm:w-30 rounded-full border-4 transition-all duration-300 flex items-center justify-center shadow-2xl ${
                      refereeLights.headRef === "WHITE"
                        ? "border-white bg-white text-zinc-950 shadow-[0_0_70px_rgba(255,255,255,0.9)] scale-110"
                        : "border-red-600 bg-red-600 text-white shadow-[0_0_70px_rgba(220,38,38,0.9)] scale-110"
                    }`}
                  >
                    <span className="font-mono text-xl sm:text-2xl font-black">
                      {refereeLights.headRef === "WHITE" ? "WHITE" : "RED"}
                    </span>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-gym-primary">
                    Chief Referee
                  </span>
                </div>

                {/* Right Referee */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 transition-all duration-300 flex items-center justify-center shadow-2xl ${
                      refereeLights.ref3 === "WHITE"
                        ? "border-white bg-white text-zinc-950 shadow-[0_0_50px_rgba(255,255,255,0.8)] scale-105"
                        : "border-red-600 bg-red-600 text-white shadow-[0_0_50px_rgba(220,38,38,0.8)] scale-105"
                    }`}
                  >
                    <span className="font-mono text-lg sm:text-xl font-black">
                      {refereeLights.ref3 === "WHITE" ? "WHITE" : "RED"}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Right Ref
                  </span>
                </div>
              </div>

              {/* Decision Status Announcement Banner */}
              <div
                className={`rounded-2xl py-3 px-6 text-center font-black uppercase tracking-widest text-lg sm:text-xl transition-all shadow-lg ${
                  refereeLights.isGoodLift
                    ? "bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                    : "bg-red-600/20 text-red-400 border-2 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                }`}
              >
                {refereeLights.decisionText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ARENA MARQUEE: FLIGHT QUEUE TICKER */}
      <footer className="w-full border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4">
        {/* Flight Queue */}
        <div className="flex items-center gap-4 overflow-x-auto py-1">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500 shrink-0">
            Platform Flight Order:
          </span>
          {queueItems.map((q, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 shrink-0"
            >
              <span className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${q.badge}`}>
                {q.label}
              </span>
              <span className="font-bold text-white text-xs uppercase">{q.name}</span>
              <span className="font-mono font-black text-gym-primary text-xs">{q.weight} KG</span>
            </div>
          ))}
        </div>

        {/* Quick Suite Jump Links */}
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Link href="/live/overlay" className="hover:text-gym-primary transition-colors">
            OBS Overlay
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/live/warmup" className="hover:text-gym-primary transition-colors">
            Warmup Matrix
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/referee/dashboard" className="hover:text-gym-primary transition-colors">
            Referee Switchboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
