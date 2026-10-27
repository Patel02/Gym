"use client";

import {
  getPublicLiveArenaDataAction,
  type PublicLiveArenaData,
  type PublicLifterStageState,
} from "@/actions/public-live-stream.actions";
import { calculateBarbellPlates } from "@/lib/plate-calculator";
import { meetTimerAudio } from "@/lib/meet-timer-audio";
import {
  Clock,
  Dumbbell,
  Radio,
  Scale,
  ShieldCheck,
  Trophy,
  Volume2,
  VolumeX,
  Settings,
  X,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  AlertOctagon,
  Flame,
  Home,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";

export type OverlayDisplayMode = "lower-third" | "lights-only" | "jumbotron" | "ticker";
export type OverlayTheme = "broadcast" | "contrast" | "cyber";

interface StreamOverlayLowerThirdProps {
  initialData: PublicLiveArenaData;
  meetId?: string;
  mode?: OverlayDisplayMode;
  theme?: OverlayTheme;
  soundDefault?: boolean;
  showControlDefault?: boolean;
}

export function StreamOverlayLowerThird({
  initialData,
  meetId: propMeetId,
  mode: initialMode = "lower-third",
  theme: initialTheme = "broadcast",
  soundDefault = false,
  showControlDefault = false,
}: StreamOverlayLowerThirdProps) {
  const [data, setData] = useState<PublicLiveArenaData>(initialData);
  const [currentMode, setCurrentMode] = useState<OverlayDisplayMode>(initialMode);
  const [currentTheme, setCurrentTheme] = useState<OverlayTheme>(initialTheme);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(soundDefault);
  const [isControlOpen, setIsControlOpen] = useState<boolean>(showControlDefault);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const selectedMeetId = propMeetId || initialData.selectedMeetId;

  // 60-Second Platform Clock
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Decision animation trigger
  const [showDecisionBadge, setShowDecisionBadge] = useState<boolean>(false);
  const [decisionInfraction, setDecisionInfraction] = useState<string>("");
  const decisionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // National Record celebration banner trigger
  const [showRecordBanner, setShowRecordBanner] = useState<boolean>(false);
  const [recordDetails, setRecordDetails] = useState<{ headline: string; subtitle: string }>({
    headline: "NEW NATIONAL RECORD! 🇮🇳",
    subtitle: "Indian Powerlifting Federation Ratified Lift",
  });
  const recordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active Connection telemetry
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "offline">(
    "connecting"
  );

  const activeLifter: PublicLifterStageState | null = data.activeLifter;
  const refereeLights = data.refereeLights;

  // Barbell plates calculation for declared weight
  const plateResult = useMemo(() => {
    const weight = activeLifter?.declaredWeight || 200;
    return calculateBarbellPlates(weight, 20, 2.5);
  }, [activeLifter?.declaredWeight]);

  // Clock tick effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === 31 && isSoundEnabled) {
            meetTimerAudio.playThirtySecondWarning();
          } else if (prev <= 11 && prev > 1 && isSoundEnabled) {
            meetTimerAudio.playTenSecondTick();
          }

          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            if (isSoundEnabled) meetTimerAudio.playTenSecondTick();
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
  }, [isTimerRunning, isSoundEnabled]);

  // Keyboard shortcut (Shift + O) to toggle Stream Operator Remote
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "O" || e.key === "o")) {
        e.preventDefault();
        setIsControlOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Zero-Latency SSE Broadcast Stream
  useEffect(() => {
    const meetId = selectedMeetId || "ALL";
    const url = `/api/live/stream?meetId=${meetId}`;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus("connected");
    };

    es.onerror = () => {
      setConnectionStatus("offline");
    };

    // Instant zero-latency referee decision handler
    const handleRefereeDecision = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data || "{}");
        const isGood = payload.isGoodLift ?? (payload.whiteCount ? payload.whiteCount >= 2 : true);
        const ref1 = payload.ref1 || "WHITE";
        const headRef = payload.headRef || "WHITE";
        const ref3 = payload.ref3 || "WHITE";
        const whiteCount = [ref1, headRef, ref3].filter((l: string) => l === "WHITE").length;
        const decisionText = payload.decisionText || (isGood ? "GOOD LIFT" : "NO LIFT");

        setData((prev) => ({
          ...prev,
          refereeLights: {
            ref1,
            headRef,
            ref3,
            decisionText,
            isGoodLift: isGood,
            whiteCount,
          },
        }));

        setDecisionInfraction(payload.infractionReason || payload.reason || "");
        setShowDecisionBadge(true);

        // Sound trigger
        if (isSoundEnabled) {
          if (isGood) {
            meetTimerAudio.playGoodLiftChime();
          } else {
            meetTimerAudio.playNoLiftBuzzer();
          }
        }

        // If National Record
        if (payload.isRecord) {
          setRecordDetails({
            headline: "NEW NATIONAL RECORD BROKEN! 🇮🇳",
            subtitle: `${payload.lifterName || "Athlete"} • ${payload.declaredWeight || 0} KG ${
              payload.liftField?.toUpperCase() || ""
            }`,
          });
          setShowRecordBanner(true);
          if (recordTimeoutRef.current) clearTimeout(recordTimeoutRef.current);
          recordTimeoutRef.current = setTimeout(() => setShowRecordBanner(false), 9000);
        }

        if (decisionTimeoutRef.current) clearTimeout(decisionTimeoutRef.current);
        decisionTimeoutRef.current = setTimeout(() => {
          setShowDecisionBadge(false);
        }, 8500);
      } catch (err) {
        console.warn("[Overlay] Referee decision parse error:", err);
      }
    };

    // Instant individual referee light toggle
    const handleRefereeLight = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data || "{}");
        if (payload.referee && payload.color) {
          setData((prev) => {
            const currentLights = { ...prev.refereeLights };
            if (payload.referee === "LEFT") currentLights.ref1 = payload.color;
            if (payload.referee === "HEAD") currentLights.headRef = payload.color;
            if (payload.referee === "RIGHT") currentLights.ref3 = payload.color;
            return { ...prev, refereeLights: currentLights };
          });
        }
      } catch (err) {
        console.warn("[Overlay] Referee light parse error:", err);
      }
    };

    // Instant Stage and Clock update
    const handleStageUpdate = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data || "{}");

        if (payload.timerEvent === "BAR_LOADED") {
          setTimerSeconds(payload.timerSeconds || 60);
          setIsTimerRunning(true);
          setShowDecisionBadge(false);
          setShowRecordBanner(false);
        } else if (payload.timerEvent === "TIMER_PAUSE") {
          setIsTimerRunning(false);
        } else if (payload.timerEvent === "TIMER_RESET") {
          setIsTimerRunning(false);
          setTimerSeconds(payload.timerSeconds || 60);
        }

        if (payload.lifterName || payload.declaredWeight) {
          setData((prev) => {
            const existing = prev.activeLifter;
            const updatedLifter: PublicLifterStageState = existing
              ? {
                  ...existing,
                  name: payload.lifterName || existing.name,
                  weightClass: payload.weightClass || existing.weightClass,
                  division: payload.division || existing.division,
                  currentDiscipline: (payload.discipline?.toLowerCase() || existing.currentDiscipline) as "squat" | "bench" | "deadlift",
                  attemptNumber: (payload.attemptNum || existing.attemptNumber) as 1 | 2 | 3,
                  declaredWeight: payload.declaredWeight || existing.declaredWeight,
                  bodyweight: payload.bodyweight ?? existing.bodyweight,
                  rank: payload.rank ?? existing.rank,
                  total: payload.total ?? existing.total,
                  ipfGlPoints: payload.ipfGlPoints ?? existing.ipfGlPoints,
                }
              : {
                  resultId: payload.resultId || "res-1",
                  athleteId: payload.athleteId || "ath-1",
                  name: payload.lifterName || "Patel Rakesh",
                  email: null,
                  weightClass: payload.weightClass || "83 KG",
                  gender: "MALE",
                  division: payload.division || "OPEN",
                  equipment: "RAW",
                  bodyweight: payload.bodyweight ?? 82.5,
                  currentDiscipline: (payload.discipline?.toLowerCase() || "squat") as "squat" | "bench" | "deadlift",
                  attemptNumber: (payload.attemptNum || 1) as 1 | 2 | 3,
                  declaredWeight: payload.declaredWeight || 200,
                  bestSquat: 200,
                  bestBench: null,
                  bestDeadlift: null,
                  total: payload.total ?? 200,
                  ipfGlPoints: payload.ipfGlPoints ?? 85.0,
                  rank: payload.rank ?? 1,
                };

            return {
              ...prev,
              activeLifter: updatedLifter,
            };
          });
        }

        if (payload.refereeLights) {
          setData((prev) => ({
            ...prev,
            refereeLights: {
              ...prev.refereeLights,
              ...payload.refereeLights,
            },
          }));
          setShowDecisionBadge(true);
          if (decisionTimeoutRef.current) clearTimeout(decisionTimeoutRef.current);
          decisionTimeoutRef.current = setTimeout(() => setShowDecisionBadge(false), 8500);
        }
      } catch (err) {
        console.warn("[Overlay] Stage update parse error:", err);
      }
    };

    // National record alert
    const handleRecordEvent = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data || "{}");
        setRecordDetails({
          headline: payload.headline || "NEW NATIONAL RECORD! 🇮🇳",
          subtitle: payload.subtitle || "Indian Powerlifting Federation",
        });
        setShowRecordBanner(true);
        if (isSoundEnabled) meetTimerAudio.playGoodLiftChime();
        if (recordTimeoutRef.current) clearTimeout(recordTimeoutRef.current);
        recordTimeoutRef.current = setTimeout(() => setShowRecordBanner(false), 9000);
      } catch {
        // silent
      }
    };

    es.addEventListener("referee_decision", handleRefereeDecision as EventListener);
    es.addEventListener("referee_light", handleRefereeLight as EventListener);
    es.addEventListener("stage_update", handleStageUpdate as EventListener);
    es.addEventListener("national_record", handleRecordEvent as EventListener);

    return () => {
      es.close();
      if (decisionTimeoutRef.current) clearTimeout(decisionTimeoutRef.current);
      if (recordTimeoutRef.current) clearTimeout(recordTimeoutRef.current);
    };
  }, [selectedMeetId, isSoundEnabled]);

  // Simulation broadcast trigger for stream tests
  const triggerSimulatedBroadcast = async (
    type: "referee_decision" | "stage_update" | "timer_event" | "national_record",
    payloadData: any
  ) => {
    try {
      await fetch("/api/live/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-broadcast-key": "WPI_LIVE_BROADCAST_SECURE_KEY_2026",
        },
        body: JSON.stringify({
          type,
          meetId: selectedMeetId || "ALL",
          data: payloadData,
        }),
      });
    } catch (err) {
      console.warn("Simulation trigger failed:", err);
    }
  };

  const copyObsUrl = (modeToCopy: OverlayDisplayMode) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const meetQuery = selectedMeetId ? `&meet=${selectedMeetId}` : "";
    const url = `${origin}/live/overlay?obs=1&mode=${modeToCopy}&theme=${currentTheme}${
      isSoundEnabled ? "&sound=1" : ""
    }${meetQuery}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(modeToCopy);
    setTimeout(() => setCopiedUrl(null), 3000);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-transparent select-none pointer-events-none font-sans z-50">
      {/* ── TOP RIGHT: OPERATOR CONTROLS (VISIBLE ON HOVER OR SHIFT+O) ── */}
      <div className="absolute top-24 sm:top-28 right-4 pointer-events-auto z-[100] flex items-center gap-2">
        <Link
          href="/live"
          prefetch={true}
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-black/90 hover:border-gym-primary transition-all shadow-lg"
          title="Exit overlay to Live Match Day Arena"
        >
          <Home className="h-3.5 w-3.5 text-gym-primary" />
          <span>Exit Overlay</span>
        </Link>
        <button
          onClick={() => setIsControlOpen((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-black/90 hover:border-gym-primary transition-all shadow-lg cursor-pointer"
          title="Toggle Stream Operator Remote (Shift + O)"
        >
          <Settings className="h-3.5 w-3.5 text-gym-primary animate-spin-slow" />
          <span>OBS Remote</span>
          <span
            className={`h-2 w-2 rounded-full ${
              connectionStatus === "connected"
                ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                : "bg-red-400"
            }`}
          />
        </button>
      </div>

      {/* ── NATIONAL RECORD BREAKING BANNER (BURSTS FROM TOP ON RECORD LIFT) ── */}
      <div
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[90] transition-all duration-700 ease-out transform ${
          showRecordBanner
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-16 opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-4 rounded-2xl border-2 border-amber-400/80 bg-zinc-950/95 px-8 py-3.5 shadow-[0_0_60px_rgba(245,158,11,0.6)] backdrop-blur-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-zinc-950 shadow-lg">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                OFFICIAL RATIFIED RECORD
              </span>
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black uppercase tracking-tight text-white mt-0.5 drop-shadow-md">
              {recordDetails.headline}
            </div>
            <div className="text-xs font-mono font-bold text-amber-300">
              {recordDetails.subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* ── REFEREE DECISION POPUP HUD (SLIDES UP ON VOTE) ── */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-[80] transition-all duration-500 ease-out transform ${
          currentMode === "jumbotron" ? "top-28" : "bottom-36 sm:bottom-40"
        } ${
          showDecisionBadge
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-12 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div
          className={`flex items-center gap-6 rounded-2xl px-8 py-4 shadow-2xl backdrop-blur-2xl border-2 ${
            refereeLights.isGoodLift
              ? "bg-zinc-950/95 border-emerald-500 text-white shadow-[0_0_55px_rgba(16,185,129,0.55)]"
              : "bg-zinc-950/95 border-red-500 text-white shadow-[0_0_55px_rgba(239,68,68,0.55)]"
          }`}
        >
          {/* 3 Referee Neon Signal Spheres */}
          <div className="flex items-center gap-3.5">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`h-8 w-8 rounded-full border-2 shadow-lg transition-all duration-300 ${
                  refereeLights.ref1 === "WHITE"
                    ? "bg-white border-white shadow-[0_0_18px_#ffffff]"
                    : "bg-red-600 border-red-500 shadow-[0_0_18px_#ef4444]"
                }`}
              />
              <span className="text-[8px] font-mono font-bold uppercase text-zinc-400">LEFT</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span
                className={`h-10 w-10 rounded-full border-2 shadow-xl transition-all duration-300 ${
                  refereeLights.headRef === "WHITE"
                    ? "bg-white border-white shadow-[0_0_24px_#ffffff]"
                    : "bg-red-600 border-red-500 shadow-[0_0_24px_#ef4444]"
                }`}
              />
              <span className="text-[8px] font-mono font-bold uppercase text-gym-primary">HEAD</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span
                className={`h-8 w-8 rounded-full border-2 shadow-lg transition-all duration-300 ${
                  refereeLights.ref3 === "WHITE"
                    ? "bg-white border-white shadow-[0_0_18px_#ffffff]"
                    : "bg-red-600 border-red-500 shadow-[0_0_18px_#ef4444]"
                }`}
              />
              <span className="text-[8px] font-mono font-bold uppercase text-zinc-400">RIGHT</span>
            </div>
          </div>

          {/* Verdict Text & Infraction Badge */}
          <div className="border-l border-zinc-700/80 pl-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              IPF Platform Decision • {refereeLights.whiteCount} / 3 Lights
            </div>
            <div
              className={`text-2xl font-black uppercase tracking-wider ${
                refereeLights.isGoodLift ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {refereeLights.decisionText}
            </div>
            {decisionInfraction && !refereeLights.isGoodLift && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-red-300 bg-red-950/60 border border-red-800/60 px-2.5 py-0.5 rounded-md">
                <AlertOctagon className="h-3 w-3 shrink-0" />
                <span>{decisionInfraction}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODE 1: TV BROADCAST LOWER-THIRD (DEFAULT)
      ───────────────────────────────────────────────────────────── */}
      {currentMode === "lower-third" && (
        <div className="fixed bottom-6 left-0 right-0 max-w-5xl mx-auto px-4 pointer-events-auto">
          <div className="relative rounded-2xl border border-zinc-700/80 bg-zinc-950/95 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden">
            {/* Top 60s Countdown Bar */}
            <div className="h-1.5 w-full bg-zinc-900">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  timerSeconds <= 10
                    ? "bg-red-500 shadow-[0_0_10px_#ef4444]"
                    : timerSeconds <= 30
                    ? "bg-amber-400"
                    : "bg-gym-primary"
                }`}
                style={{ width: `${(timerSeconds / 60) * 100}%` }}
              />
            </div>

            <div className="flex flex-col md:flex-row items-stretch justify-between p-4 md:p-5 gap-4">
              {/* LEFT: ATHLETE IDENTITY & FEDERATION BADGE */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gym-primary via-amber-500 to-gym-primary font-black text-black shadow-lg">
                  <span className="text-xl tracking-tighter">WPI</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gym-primary/20 border border-gym-primary/40 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-gym-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                      LIVE PLATFORM
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {activeLifter?.weightClass || "83 KG"} • {activeLifter?.division || "OPEN"}
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-0.5 truncate">
                    {activeLifter?.name || "Active Competitor"}
                  </div>

                  <div className="text-xs text-zinc-400 flex items-center gap-2.5 mt-0.5">
                    <span>
                      BW:{" "}
                      <strong className="text-white font-mono">
                        {activeLifter?.bodyweight?.toFixed(1) || "82.5"} KG
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Rank:{" "}
                      <strong className="text-gym-primary font-mono">
                        #{activeLifter?.rank || 1}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Projected Total:{" "}
                      <strong className="text-white font-mono">
                        {activeLifter?.total || 600} KG
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: ATTEMPT WEIGHT, DISC LOADER & 60S CLOCK */}
              <div className="flex items-center gap-5 justify-between md:justify-end border-t md:border-t-0 border-zinc-800/80 pt-3 md:pt-0 shrink-0">
                {/* Discipline & Attempt Weight */}
                <div className="text-left md:text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gym-primary">
                    {activeLifter?.currentDiscipline || "SQUAT"} • ATTEMPT{" "}
                    {activeLifter?.attemptNumber || 1}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white leading-none mt-1">
                    {activeLifter?.declaredWeight?.toFixed(1) || "200.0"}{" "}
                    <span className="text-sm font-sans font-bold text-zinc-400">KG</span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                    {((activeLifter?.declaredWeight || 200) * 2.20462).toFixed(1)} LBS
                  </div>
                </div>

                {/* Olympic Disc Plates Breakdown Bar */}
                <div className="hidden lg:flex flex-col items-center bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5">
                  <div className="text-[8px] font-mono uppercase text-zinc-400 mb-1">
                    Barbell Plates / Side
                  </div>
                  <div className="flex items-center gap-1 h-8">
                    <div className="w-1.5 h-6 bg-zinc-500 rounded-sm" title="Collar 2.5kg" />
                    {plateResult.plateCountsPerSide.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-center rounded-sm font-mono font-bold text-[9px] shadow-sm ${item.plate.bgClass} ${item.plate.textClass}`}
                        style={{
                          height: `${item.plate.heightPercent * 0.32}px`,
                          width: `${item.count * 12 + 6}px`,
                        }}
                        title={`${item.count}x ${item.plate.weight}kg`}
                      >
                        {item.count > 1 ? `${item.count}x` : item.plate.weight}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 60-Second Competition Clock */}
                <div
                  className={`flex flex-col items-center justify-center rounded-xl border px-4 py-2 min-w-[76px] transition-all ${
                    timerSeconds <= 10 && isTimerRunning
                      ? "border-red-500 bg-red-950/80 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      : timerSeconds <= 30 && isTimerRunning
                      ? "border-amber-500/80 bg-amber-950/40 text-amber-300"
                      : "border-zinc-800 bg-zinc-900/90 text-white"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-zinc-400 mb-0.5" />
                  <span className="text-2xl font-black font-mono leading-none">
                    {String(timerSeconds).padStart(2, "0")}
                  </span>
                  <span className="text-[8px] font-mono uppercase text-zinc-400">SEC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE 2: LIGHTS-ONLY COMPACT BUG (TOP-RIGHT CORNER)
      ───────────────────────────────────────────────────────────── */}
      {currentMode === "lights-only" && (
        <div className="fixed top-6 right-6 pointer-events-auto">
          <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-2 mb-3">
              <div>
                <div className="text-[9px] font-black uppercase text-gym-primary">
                  {activeLifter?.currentDiscipline || "SQUAT"} #{activeLifter?.attemptNumber || 1}
                </div>
                <div className="text-base font-black uppercase text-white truncate max-w-[130px]">
                  {activeLifter?.name || "Lifter"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black font-mono text-white">
                  {activeLifter?.declaredWeight || 200} <span className="text-xs">KG</span>
                </div>
                <div className="text-[9px] font-mono text-zinc-400">
                  Clock: {timerSeconds}s
                </div>
              </div>
            </div>

            {/* 3 mini lights */}
            <div className="flex items-center justify-center gap-3">
              <span
                className={`h-6 w-6 rounded-full border-2 ${
                  refereeLights.ref1 === "WHITE"
                    ? "bg-white border-white shadow-[0_0_12px_#fff]"
                    : "bg-red-600 border-red-500 shadow-[0_0_12px_#ef4444]"
                }`}
              />
              <span
                className={`h-8 w-8 rounded-full border-2 ${
                  refereeLights.headRef === "WHITE"
                    ? "bg-white border-white shadow-[0_0_16px_#fff]"
                    : "bg-red-600 border-red-500 shadow-[0_0_16px_#ef4444]"
                }`}
              />
              <span
                className={`h-6 w-6 rounded-full border-2 ${
                  refereeLights.ref3 === "WHITE"
                    ? "bg-white border-white shadow-[0_0_12px_#fff]"
                    : "bg-red-600 border-red-500 shadow-[0_0_12px_#ef4444]"
                }`}
              />
            </div>
            <div className="text-center text-[10px] font-mono font-bold mt-2 text-zinc-300 uppercase">
              {refereeLights.decisionText}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE 3: JUMBOTRON BROADCAST HEADER (TOP HUD)
      ───────────────────────────────────────────────────────────── */}
      {currentMode === "jumbotron" && (
        <div className="fixed top-6 left-0 right-0 max-w-6xl mx-auto px-4 pointer-events-auto">
          <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/95 shadow-2xl backdrop-blur-2xl p-4 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gym-primary to-amber-600 font-black text-black">
                WPI
              </div>
              <div>
                <div className="text-xl font-black uppercase text-white">
                  {activeLifter?.name || "Active Competitor"}
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  {activeLifter?.weightClass} • {activeLifter?.division} • Rank #{activeLifter?.rank}
                </div>
              </div>
            </div>

            {/* Middle 3 Referee Lights */}
            <div className="flex items-center gap-4 bg-zinc-900/90 border border-zinc-800 px-6 py-2 rounded-xl">
              <span
                className={`h-7 w-7 rounded-full border-2 ${
                  refereeLights.ref1 === "WHITE" ? "bg-white border-white" : "bg-red-600 border-red-500"
                }`}
              />
              <span
                className={`h-9 w-9 rounded-full border-2 ${
                  refereeLights.headRef === "WHITE" ? "bg-white border-white" : "bg-red-600 border-red-500"
                }`}
              />
              <span
                className={`h-7 w-7 rounded-full border-2 ${
                  refereeLights.ref3 === "WHITE" ? "bg-white border-white" : "bg-red-600 border-red-500"
                }`}
              />
              <div className="border-l border-zinc-700 pl-4 text-xs font-bold font-mono text-white">
                {refereeLights.decisionText}
              </div>
            </div>

            {/* Right Weight & Clock */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-mono text-gym-primary uppercase font-bold">
                  {activeLifter?.currentDiscipline} • ATT {activeLifter?.attemptNumber}
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {activeLifter?.declaredWeight || 200} KG
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono font-black text-xl text-white">
                {String(timerSeconds).padStart(2, "0")}s
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE 4: NEWS TICKER BAR (BOTTOM EDGE)
      ───────────────────────────────────────────────────────────── */}
      {currentMode === "ticker" && (
        <div className="fixed bottom-0 left-0 right-0 h-12 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-xl flex items-center px-6 justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="rounded bg-gym-primary px-2 py-0.5 text-xs font-black text-black">
              LIVE PLATFORM
            </span>
            <span className="text-sm font-bold text-white uppercase">
              {activeLifter?.name} ({activeLifter?.weightClass})
            </span>
            <span className="text-xs text-zinc-400">
              • {activeLifter?.currentDiscipline} Attempt {activeLifter?.attemptNumber}:{" "}
              <strong className="text-white font-mono">{activeLifter?.declaredWeight} KG</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-3.5 w-3.5 rounded-full ${
                  refereeLights.ref1 === "WHITE" ? "bg-white" : "bg-red-600"
                }`}
              />
              <span
                className={`h-4 w-4 rounded-full ${
                  refereeLights.headRef === "WHITE" ? "bg-white" : "bg-red-600"
                }`}
              />
              <span
                className={`h-3.5 w-3.5 rounded-full ${
                  refereeLights.ref3 === "WHITE" ? "bg-white" : "bg-red-600"
                }`}
              />
            </div>
            <span className="text-xs font-mono font-black text-white">
              {refereeLights.decisionText}
            </span>
            <span className="rounded bg-zinc-900 border border-zinc-700 px-2 py-0.5 text-xs font-mono text-white">
              ⏱️ {timerSeconds}s
            </span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STREAM OPERATOR REMOTE / CALIBRATION DRAWER (POPUP)
      ───────────────────────────────────────────────────────────── */}
      {isControlOpen && (
        <div className="fixed top-12 right-4 w-96 rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl pointer-events-auto z-[150] text-white space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-gym-primary animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider">
                OBS / vMix Broadcast Remote
              </span>
            </div>
            <button
              onClick={() => setIsControlOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Breadcrumb Navigation inside Drawer */}
          <nav className="flex items-center flex-wrap gap-1.5 text-[11px] font-semibold text-zinc-400 bg-black/40 p-2 rounded-lg border border-zinc-800">
            <Link href="/" prefetch={true} className="hover:text-gym-primary transition-colors flex items-center gap-1 text-zinc-400">
              <Home className="h-3 w-3" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            <Link href="/championships" prefetch={true} className="hover:text-gym-primary transition-colors text-zinc-400">
              Championships
            </Link>
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            <Link href="/live" prefetch={true} className="hover:text-gym-primary transition-colors text-zinc-400">
              Live Arena
            </Link>
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            <span className="text-gym-primary uppercase tracking-wider font-bold">
              OBS Overlay
            </span>
          </nav>

          {/* Quick Mode Switcher */}
          <div>
            <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1.5">
              Graphic Layout Mode
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setCurrentMode("lower-third")}
                className={`py-1.5 px-2.5 rounded-lg border text-left transition-all ${
                  currentMode === "lower-third"
                    ? "border-gym-primary bg-gym-primary/20 text-white"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                }`}
              >
                📺 Lower-Third
              </button>
              <button
                onClick={() => setCurrentMode("lights-only")}
                className={`py-1.5 px-2.5 rounded-lg border text-left transition-all ${
                  currentMode === "lights-only"
                    ? "border-gym-primary bg-gym-primary/20 text-white"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                }`}
              >
                ⚪ Lights-Only Bug
              </button>
              <button
                onClick={() => setCurrentMode("jumbotron")}
                className={`py-1.5 px-2.5 rounded-lg border text-left transition-all ${
                  currentMode === "jumbotron"
                    ? "border-gym-primary bg-gym-primary/20 text-white"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                }`}
              >
                🏟️ Jumbotron Header
              </button>
              <button
                onClick={() => setCurrentMode("ticker")}
                className={`py-1.5 px-2.5 rounded-lg border text-left transition-all ${
                  currentMode === "ticker"
                    ? "border-gym-primary bg-gym-primary/20 text-white"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                }`}
              >
                📰 News Ticker
              </button>
            </div>
          </div>

          {/* Sound toggle */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-900/70 border border-zinc-800 p-2.5">
            <div className="flex items-center gap-2">
              {isSoundEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-zinc-500" />
              )}
              <span className="text-xs font-bold">OBS Audio Monitoring Chimes</span>
            </div>
            <button
              onClick={() => setIsSoundEnabled((prev) => !prev)}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-bold uppercase ${
                isSoundEnabled
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {isSoundEnabled ? "ACTIVE" : "MUTED"}
            </button>
          </div>

          {/* Live Simulation Buttons */}
          <div>
            <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1.5">
              Instant Live Test Simulations
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
              <button
                onClick={() =>
                  triggerSimulatedBroadcast("timer_event", {
                    timerEvent: "BAR_LOADED",
                    timerSeconds: 60,
                    lifterName: "Patel Rakesh",
                    declaredWeight: 220,
                  })
                }
                className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left"
              >
                🏋️ Bar Loaded (60s)
              </button>

              <button
                onClick={() =>
                  triggerSimulatedBroadcast("referee_decision", {
                    ref1: "WHITE",
                    headRef: "WHITE",
                    ref3: "WHITE",
                    isGoodLift: true,
                    decisionText: "GOOD LIFT",
                    whiteCount: 3,
                  })
                }
                className="py-1.5 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-left"
              >
                ⚪⚪⚪ 3 White Lights
              </button>

              <button
                onClick={() =>
                  triggerSimulatedBroadcast("referee_decision", {
                    ref1: "RED",
                    headRef: "RED",
                    ref3: "WHITE",
                    isGoodLift: false,
                    decisionText: "NO LIFT",
                    whiteCount: 1,
                    infractionReason: "Depth below parallel not reached",
                  })
                }
                className="py-1.5 px-2 rounded-lg bg-red-950/40 hover:bg-red-950/70 border border-red-800/60 text-red-300 text-left"
              >
                🔴🔴⚪ 2 Red (Depth)
              </button>

              <button
                onClick={() =>
                  triggerSimulatedBroadcast("national_record", {
                    headline: "NEW NATIONAL RECORD! 🇮🇳",
                    subtitle: "Patel Rakesh • 345.0 KG Squat Breaker",
                  })
                }
                className="py-1.5 px-2 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/60 text-amber-300 text-left"
              >
                🏆 National Record
              </button>
            </div>
          </div>

          {/* 1-Click Copy OBS Browser Source URL */}
          <div className="border-t border-zinc-800 pt-3">
            <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1.5">
              OBS Studio / vMix Browser Source URL
            </div>
            <button
              onClick={() => copyObsUrl(currentMode)}
              className="w-full flex items-center justify-between rounded-xl bg-gym-primary px-3.5 py-2 text-xs font-black uppercase text-black hover:brightness-110 shadow-md transition-all"
            >
              <div className="flex items-center gap-2">
                <Copy className="h-3.5 w-3.5" />
                <span>Copy 1080p URL for OBS</span>
              </div>
              {copiedUrl === currentMode ? (
                <Check className="h-4 w-4 text-black" />
              ) : (
                <span className="text-[10px] font-mono">1920x1080</span>
              )}
            </button>
            <div className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
              💡 <strong>OBS Browser Source Settings:</strong> Set Width:{" "}
              <code className="text-white font-mono">1920</code>, Height:{" "}
              <code className="text-white font-mono">1080</code>. Transparent background is
              automatically enabled!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
