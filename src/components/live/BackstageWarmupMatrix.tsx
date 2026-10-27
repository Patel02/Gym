"use client";

import {
  getPublicLiveArenaDataAction,
  type PublicLiveArenaData,
  type PublicLifterStageState,
} from "@/actions/public-live-stream.actions";
import type { LiveScoringResultDto } from "@/actions/scoring.actions";
import { meetTimerAudio } from "@/lib/meet-timer-audio";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Dumbbell,
  Edit3,
  ExternalLink,
  Layers,
  MessageSquare,
  Phone,
  Radio,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  UserCheck,
  Users,
  Volume2,
  VolumeX,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageNavigation } from "@/components/ui/PageNavigation";
import {
  dispatchLifterQueueAlertAction,
  updateLifterContactAction,
  type QueuePosition,
} from "@/actions/whatsapp-alerts.actions";

interface BackstageWarmupMatrixProps {
  initialData: PublicLiveArenaData;
}

export function BackstageWarmupMatrix({ initialData }: BackstageWarmupMatrixProps) {
  const [data, setData] = useState<PublicLiveArenaData>(initialData);
  const [selectedMeetId, setSelectedMeetId] = useState<string>(initialData.selectedMeetId);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [sseConnected, setSseConnected] = useState<boolean>(false);

  // 60-Second Countdown Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const activeLifter: PublicLifterStageState | null = data.activeLifter;
  const results = data.results;

  // WhatsApp dispatch and Quick Contact Modal state
  const [alertingLifterId, setAlertingLifterId] = useState<string | null>(null);
  const [alertToast, setAlertToast] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
    waUrl?: string;
    coachWaUrl?: string;
  } | null>(null);

  const [contactModal, setContactModal] = useState<{
    isOpen: boolean;
    userId: string;
    lifterName: string;
    phone: string;
    coachPhone: string;
    coachName: string;
    pendingAlertPosition?: QueuePosition;
    pendingItem?: any;
  } | null>(null);
  const [isSavingContact, setIsSavingContact] = useState<boolean>(false);

  const showAlertNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string,
    waUrl?: string,
    coachWaUrl?: string
  ) => {
    setAlertToast({ type, title, message, waUrl, coachWaUrl });
    setTimeout(() => {
      setAlertToast(null);
    }, 6000);
  };

  const handleOpenContactModal = (item: any, pendingAlertPosition?: QueuePosition) => {
    setContactModal({
      isOpen: true,
      userId: item.userId,
      lifterName: item.name,
      phone: item.phoneNumber || "",
      coachPhone: item.coachPhone || "",
      coachName: item.coachName || "",
      pendingAlertPosition,
      pendingItem: item,
    });
  };

  const handleSaveContactModal = async () => {
    if (!contactModal) return;
    setIsSavingContact(true);
    try {
      const res = await updateLifterContactAction({
        userId: contactModal.userId,
        phoneNumber: contactModal.phone,
        coachPhone: contactModal.coachPhone,
        coachName: contactModal.coachName,
      });

      if (res.success) {
        setData((prev) => ({
          ...prev,
          results: prev.results.map((r) =>
            r.userId === contactModal.userId
              ? {
                  ...r,
                  phoneNumber: contactModal.phone,
                  coachPhone: contactModal.coachPhone,
                  coachName: contactModal.coachName,
                }
              : r
          ),
        }));

        showAlertNotification("success", "Contact Saved", "Phone numbers updated for call room queue.");

        if (contactModal.pendingAlertPosition && contactModal.pendingItem) {
          const itemToAlert = {
            ...contactModal.pendingItem,
            phoneNumber: contactModal.phone,
            coachPhone: contactModal.coachPhone,
            coachName: contactModal.coachName,
          };
          const pos = contactModal.pendingAlertPosition;
          setContactModal(null);
          handleDispatchAlert(itemToAlert, pos);
          return;
        }

        setContactModal(null);
      } else {
        showAlertNotification("error", "Save Failed", res.error || "Could not save contact numbers.");
      }
    } catch (err: any) {
      showAlertNotification("error", "Error", err.message || "Failed to update contact.");
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleDispatchAlert = async (
    item: any,
    queuePosition: QueuePosition,
    targetPhoneOverride?: string
  ) => {
    const targetPhone = targetPhoneOverride || item.phoneNumber;
    if (!targetPhone) {
      handleOpenContactModal(item, queuePosition);
      return;
    }

    setAlertingLifterId(item.id);
    try {
      const res = await dispatchLifterQueueAlertAction({
        meetId: selectedMeetId || "meet",
        meetTitle: data.currentMeet?.title || "Gujarat State Powerlifting Championship",
        lifterId: item.id,
        lifterName: item.name,
        phoneNumber: targetPhoneOverride ? undefined : item.phoneNumber,
        coachPhone: targetPhoneOverride ? targetPhoneOverride : item.coachPhone,
        coachName: item.coachName,
        queuePosition,
        discipline: item.discipline || "squat",
        attemptNumber: item.attemptNum || 1,
        weightKg: item.attemptWeight || 200,
        flight: "Flight A",
      });

      if (res.success) {
        if (res.method === "TWILIO_API") {
          showAlertNotification(
            "success",
            "⚡ Twilio WhatsApp Delivered",
            `Automated message sent to ${item.name} (${targetPhone}).`
          );
        } else {
          if (res.waUrl && typeof window !== "undefined") {
            window.open(res.waUrl, "_blank", "noopener,noreferrer");
          }
          showAlertNotification(
            "info",
            res.method === "FALLBACK_WA_ME"
              ? "⚠️ Fallback: Free WhatsApp Link"
              : "📲 Free 1-Click WhatsApp",
            res.error || `Direct WhatsApp link opened for ${item.name}.`,
            res.waUrl,
            res.coachWaUrl
          );
        }
      } else {
        showAlertNotification(
          "error",
          "Dispatch Issue",
          res.error || "Could not deliver WhatsApp alert."
        );
      }
    } catch (err: any) {
      showAlertNotification("error", "Error", err.message || "Failed to trigger alert.");
    } finally {
      setAlertingLifterId(null);
    }
  };

  // Sync audio engine mute state
  useEffect(() => {
    meetTimerAudio.isMuted = !isAudioEnabled;
  }, [isAudioEnabled]);

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
          meetTimerAudio.playSubmissionSuccess();
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

  // Derive Flight Order & "In The Hole" / "In The Rack"
  const flightQueue = useMemo(() => {
    if (!results || results.length === 0) return [];

    // Filter by search query if any
    return results
      .filter((r) => {
        if (!searchFilter.trim()) return true;
        const query = searchFilter.toLowerCase();
        return (
          r.user.name?.toLowerCase().includes(query) ||
          r.user.email?.toLowerCase().includes(query) ||
          r.user.profile?.weightClass?.toLowerCase().includes(query)
        );
      })
      .map((r, idx) => {
        // Determine current attempt weight
        const curDisc = activeLifter?.currentDiscipline || "squat";
        let attemptWeight = 0;
        let attemptNum: 1 | 2 | 3 = 1;

        if (curDisc === "squat") {
          if (r.squat1 === null) {
            attemptNum = 1;
            attemptWeight = 180;
          } else if (r.squat2 === null) {
            attemptNum = 2;
            attemptWeight = Math.abs(r.squat1) + 7.5;
          } else if (r.squat3 === null) {
            attemptNum = 3;
            attemptWeight = Math.abs(r.squat2) + 5;
          } else {
            attemptNum = 3;
            attemptWeight = Math.abs(r.squat3);
          }
        } else if (curDisc === "bench") {
          if (r.bench1 === null) {
            attemptNum = 1;
            attemptWeight = 120;
          } else if (r.bench2 === null) {
            attemptNum = 2;
            attemptWeight = Math.abs(r.bench1) + 5;
          } else if (r.bench3 === null) {
            attemptNum = 3;
            attemptWeight = Math.abs(r.bench2) + 2.5;
          } else {
            attemptNum = 3;
            attemptWeight = Math.abs(r.bench3);
          }
        } else {
          if (r.deadlift1 === null) {
            attemptNum = 1;
            attemptWeight = 210;
          } else if (r.deadlift2 === null) {
            attemptNum = 2;
            attemptWeight = Math.abs(r.deadlift1) + 10;
          } else if (r.deadlift3 === null) {
            attemptNum = 3;
            attemptWeight = Math.abs(r.deadlift2) + 7.5;
          } else {
            attemptNum = 3;
            attemptWeight = Math.abs(r.deadlift3);
          }
        }

        const attemptsAway = idx;
        const estMinutesAway = Math.round(attemptsAway * 1.5);

        // Suggested Warmup Bar loading
        let warmupSuggestion = "Rest / Hydrate";
        if (attemptsAway >= 12) {
          warmupSuggestion = `General Warmup / Bar (${(attemptWeight * 0.4).toFixed(0)}kg)`;
        } else if (attemptsAway >= 8) {
          warmupSuggestion = `Set 2: ${(attemptWeight * 0.6).toFixed(0)}kg × 3 reps`;
        } else if (attemptsAway >= 5) {
          warmupSuggestion = `Set 3: ${(attemptWeight * 0.75).toFixed(0)}kg × 2 reps`;
        } else if (attemptsAway >= 3) {
          warmupSuggestion = `Set 4 (Heavy): ${(attemptWeight * 0.88).toFixed(0)}kg × 1 rep`;
        } else if (attemptsAway === 2) {
          warmupSuggestion = `Final Opener Prep: ${(attemptWeight * 0.94).toFixed(0)}kg × 1 rep`;
        } else if (attemptsAway === 1) {
          warmupSuggestion = "Knee Sleeves/Wraps On • Chalk Up";
        } else if (attemptsAway === 0) {
          warmupSuggestion = "NOW ON PLATFORM";
        }

        return {
          id: r.id,
          userId: r.userId,
          name: r.user.name || r.user.email || "Lifter",
          phoneNumber:
            r.phoneNumber ||
            (r.user as any)?.phone ||
            (r.user?.profile as any)?.phoneNumber ||
            null,
          coachPhone: r.coachPhone || (r.user?.profile as any)?.coachPhone || null,
          coachName: r.coachName || (r.user?.profile as any)?.coachName || null,
          weightClass: r.user.profile?.weightClass || "83 KG",
          bodyweight: r.bodyweight,
          discipline: curDisc,
          attemptNum,
          attemptWeight,
          attemptsAway,
          estMinutesAway,
          warmupSuggestion,
          total: r.total,
        };
      });
  }, [results, activeLifter?.currentDiscipline, searchFilter]);

  const onPlatformLifter = flightQueue[0];
  const inTheHoleLifter = flightQueue[1];
  const inTheRackLifter = flightQueue[2];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-gym-primary selection:text-black pt-32 sm:pt-36 lg:pt-40 pb-24">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-gym-primary/15 blur-[140px]" />
        <div className="absolute top-1/2 right-10 h-80 w-80 rounded-full bg-blue-600/10 blur-[130px]" />
      </div>

      {/* Top Breadcrumb Navigation */}
      <div className="w-full bg-[#0a0a0c] border-b border-zinc-900 px-6 py-2 shrink-0 z-50">
        <div className="max-w-7xl mx-auto">
          <PageNavigation
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Championships", href: "/championships" },
              { label: "Live Arena", href: "/live" },
              { label: "Backstage Warmup Matrix" },
            ]}
            badge="Backstage Peaking"
            className="mb-0"
          />
        </div>
      </div>

      {/* Header HUD */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/live"
              className="flex items-center gap-2 group transition-transform hover:scale-105"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gym-primary to-amber-600 font-black text-black shadow-lg shadow-gym-primary/20">
                WPI
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-gym-primary">
                  Backstage Warmup Peaking Matrix
                </div>
                <div className="text-sm font-bold text-white group-hover:text-gym-primary transition-colors">
                  {data.currentMeet?.title || "National Championships"}
                </div>
              </div>
            </Link>

            {/* SSE Live Status */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1">
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
                {sseConnected ? "Warmup Room Live Sync" : "Sync Connecting..."}
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsAudioEnabled((prev) => !prev)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                isAudioEnabled
                  ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40"
                  : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {isAudioEnabled ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span className="hidden md:inline">Alert Chimes On</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span className="hidden md:inline">Alerts Muted</span>
                </>
              )}
            </button>

            <Link
              href="/live/jumbotron"
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:border-gym-primary hover:text-gym-primary transition-all"
            >
              Stage Jumbotron
            </Link>

            <Link
              href="/live"
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
            >
              Spectator Arena
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PEAKING STATUS TRIPLE HUD (ON PLATFORM / IN THE HOLE / IN THE RACK) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 1. NOW ON PLATFORM */}
          <div className="rounded-3xl border-2 border-gym-primary bg-gradient-to-br from-gym-primary/15 to-zinc-900/80 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-gym-primary px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black animate-pulse">
                  1. NOW ON PLATFORM
                </span>
                <span className="font-mono text-xs font-bold text-gym-primary">
                  Active
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                {onPlatformLifter?.name || "Lifter on Platform"}
              </h2>
              <div className="text-xs text-zinc-300 mt-1 font-mono">
                {onPlatformLifter?.weightClass || "83 KG"} • BW: {onPlatformLifter?.bodyweight?.toFixed(1) || "82.5"} KG
              </div>
            </div>

            <div>
              <div className="mt-6 pt-4 border-t border-gym-primary/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-zinc-400">
                    {onPlatformLifter?.discipline || "SQUAT"} ATTEMPT {onPlatformLifter?.attemptNum || 1}
                  </div>
                  <div className="font-mono text-3xl font-black text-white">
                    {onPlatformLifter?.attemptWeight || 200} <span className="text-base text-zinc-400 font-sans">KG</span>
                  </div>
                </div>

                {/* 60s Platform Clock */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-center">
                  <div className="text-[9px] font-bold uppercase text-zinc-500">Clock</div>
                  <div
                    className={`font-mono text-2xl font-black leading-none ${
                      timerSeconds <= 10 && isTimerRunning
                        ? "text-red-500 animate-pulse"
                        : "text-white"
                    }`}
                  >
                    {String(timerSeconds).padStart(2, "0")}s
                  </div>
                </div>
              </div>

              {/* WhatsApp Call Room Bar */}
              <div className="mt-4 pt-3 border-t border-gym-primary/20 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  {onPlatformLifter?.phoneNumber ? (
                    <span className="font-mono text-zinc-300 text-[11px] flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gym-primary" />
                      <span>{onPlatformLifter.phoneNumber}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onPlatformLifter && handleOpenContactModal(onPlatformLifter, "ON_PLATFORM")}
                      className="text-[11px] font-bold text-gym-primary underline hover:text-amber-400"
                    >
                      + Add Phone
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPlatformLifter && handleDispatchAlert(onPlatformLifter, "ON_PLATFORM")}
                    disabled={alertingLifterId === onPlatformLifter?.id}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gym-primary px-3 py-1.5 text-xs font-black uppercase text-black hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-gym-primary/20 disabled:opacity-50"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {onPlatformLifter?.coachPhone && (
                    <button
                      onClick={() => onPlatformLifter && handleDispatchAlert(onPlatformLifter, "ON_PLATFORM", onPlatformLifter.coachPhone!)}
                      title={`Alert Coach: ${onPlatformLifter.coachName || "Coach"}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-gym-primary/40 bg-zinc-950/80 px-2 py-1.5 text-[11px] font-bold text-gym-primary hover:bg-gym-primary/20 transition-all"
                    >
                      <UserCheck className="h-3 w-3" />
                      <span className="hidden sm:inline">Coach</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. IN THE HOLE (NEXT LIFTER) */}
          <div className="rounded-3xl border border-amber-500/60 bg-gradient-to-br from-amber-500/10 to-zinc-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                  2. IN THE HOLE (NEXT)
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  ~1.5 Mins
                </span>
              </div>

              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                {inTheHoleLifter?.name || "Standby Next"}
              </h2>
              <div className="text-xs text-zinc-400 mt-1 font-mono">
                {inTheHoleLifter?.weightClass || "83 KG"} • BW: {inTheHoleLifter?.bodyweight?.toFixed(1) || "82.5"} KG
              </div>
            </div>

            <div>
              <div className="mt-6 pt-4 border-t border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-zinc-400">
                    {inTheHoleLifter?.discipline || "SQUAT"} ATTEMPT {inTheHoleLifter?.attemptNum || 1}
                  </div>
                  <div className="font-mono text-3xl font-black text-amber-400">
                    {inTheHoleLifter?.attemptWeight || 205} <span className="text-base text-zinc-400 font-sans">KG</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 px-3.5 py-2 text-right">
                  <div className="text-[9px] font-bold uppercase text-amber-400">Backstage Directive</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    Wraps On • To Curtain
                  </div>
                </div>
              </div>

              {/* WhatsApp Call Room Bar */}
              <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  {inTheHoleLifter?.phoneNumber ? (
                    <span className="font-mono text-zinc-300 text-[11px] flex items-center gap-1">
                      <Phone className="h-3 w-3 text-amber-400" />
                      <span>{inTheHoleLifter.phoneNumber}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => inTheHoleLifter && handleOpenContactModal(inTheHoleLifter, "IN_HOLE")}
                      className="text-[11px] font-bold text-amber-400 underline hover:text-amber-300"
                    >
                      + Add Phone
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => inTheHoleLifter && handleDispatchAlert(inTheHoleLifter, "IN_HOLE")}
                    disabled={alertingLifterId === inTheHoleLifter?.id}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-black uppercase text-black hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {inTheHoleLifter?.coachPhone && (
                    <button
                      onClick={() => inTheHoleLifter && handleDispatchAlert(inTheHoleLifter, "IN_HOLE", inTheHoleLifter.coachPhone!)}
                      title={`Alert Coach: ${inTheHoleLifter.coachName || "Coach"}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-500/40 bg-zinc-950/80 px-2 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all"
                    >
                      <UserCheck className="h-3 w-3" />
                      <span className="hidden sm:inline">Coach</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. IN THE RACK (2ND NEXT) */}
          <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-zinc-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-400">
                  3. IN THE RACK (2ND)
                </span>
                <span className="font-mono text-xs font-bold text-blue-400">
                  ~3.0 Mins
                </span>
              </div>

              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                {inTheRackLifter?.name || "Standby 2nd"}
              </h2>
              <div className="text-xs text-zinc-400 mt-1 font-mono">
                {inTheRackLifter?.weightClass || "83 KG"} • BW: {inTheRackLifter?.bodyweight?.toFixed(1) || "82.5"} KG
              </div>
            </div>

            <div>
              <div className="mt-6 pt-4 border-t border-blue-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-zinc-400">
                    {inTheRackLifter?.discipline || "SQUAT"} ATTEMPT {inTheRackLifter?.attemptNum || 1}
                  </div>
                  <div className="font-mono text-3xl font-black text-blue-400">
                    {inTheRackLifter?.attemptWeight || 210} <span className="text-base text-zinc-400 font-sans">KG</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-950/30 px-3.5 py-2 text-right">
                  <div className="text-[9px] font-bold uppercase text-blue-400">Backstage Directive</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    Belt / Chalk Ready
                  </div>
                </div>
              </div>

              {/* WhatsApp Call Room Bar */}
              <div className="mt-4 pt-3 border-t border-blue-500/20 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  {inTheRackLifter?.phoneNumber ? (
                    <span className="font-mono text-zinc-300 text-[11px] flex items-center gap-1">
                      <Phone className="h-3 w-3 text-blue-400" />
                      <span>{inTheRackLifter.phoneNumber}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => inTheRackLifter && handleOpenContactModal(inTheRackLifter, "IN_RACK")}
                      className="text-[11px] font-bold text-blue-400 underline hover:text-blue-300"
                    >
                      + Add Phone
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => inTheRackLifter && handleDispatchAlert(inTheRackLifter, "IN_RACK")}
                    disabled={alertingLifterId === inTheRackLifter?.id}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500 px-3 py-1.5 text-xs font-black uppercase text-white hover:bg-blue-400 active:scale-95 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {inTheRackLifter?.coachPhone && (
                    <button
                      onClick={() => inTheRackLifter && handleDispatchAlert(inTheRackLifter, "IN_RACK", inTheRackLifter.coachPhone!)}
                      title={`Alert Coach: ${inTheRackLifter.coachName || "Coach"}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-blue-500/40 bg-zinc-950/80 px-2 py-1.5 text-[11px] font-bold text-blue-400 hover:bg-blue-500/20 transition-all"
                    >
                      <UserCheck className="h-3 w-3" />
                      <span className="hidden sm:inline">Coach</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FULL FLIGHT QUEUE & WARMUP SUGGESTIONS TABLE */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Table Header Controls */}
          <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-gym-primary" />
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                  Full Flight Peaking Queue
                </h3>
                <p className="text-xs text-zinc-400">
                  Real-time attempt distance countdown and recommended warmup bar loading
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search athlete or weight class..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-zinc-800 bg-zinc-950/80 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-gym-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/60 border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3 px-4">Flight Order</th>
                  <th className="py-3 px-4">Athlete</th>
                  <th className="py-3 px-4">Weight Class</th>
                  <th className="py-3 px-4 text-center">Attempt</th>
                  <th className="py-3 px-4 text-right">Declared KG</th>
                  <th className="py-3 px-4 text-center">Distance Away</th>
                  <th className="py-3 px-4">Warmup Room Protocol</th>
                  <th className="py-3 px-4 text-center">Alert (WhatsApp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {flightQueue.map((item, index) => {
                  const isCurrent = item.attemptsAway === 0;
                  const isHole = item.attemptsAway === 1;
                  const isRack = item.attemptsAway === 2;
                  const position: QueuePosition = isCurrent
                    ? "ON_PLATFORM"
                    : isHole
                    ? "IN_HOLE"
                    : "IN_RACK";

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isCurrent
                          ? "bg-gym-primary/15 font-bold"
                          : isHole
                          ? "bg-amber-500/10"
                          : isRack
                          ? "bg-blue-500/10"
                          : "hover:bg-zinc-800/30"
                      }`}
                    >
                      <td className="py-4 px-4 font-mono font-bold">
                        {isCurrent ? (
                          <span className="rounded-md bg-gym-primary px-2 py-0.5 text-xs text-black font-black">
                            PLATFORM
                          </span>
                        ) : isHole ? (
                          <span className="rounded-md bg-amber-500/30 text-amber-300 border border-amber-500/50 px-2 py-0.5 text-xs font-black">
                            NEXT
                          </span>
                        ) : isRack ? (
                          <span className="rounded-md bg-blue-500/30 text-blue-300 border border-blue-500/50 px-2 py-0.5 text-xs font-black">
                            2ND
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-xs">#{index + 1}</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-white uppercase">{item.name}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          BW: {item.bodyweight?.toFixed(1) || "82.5"} KG
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs text-zinc-400">
                        {item.weightClass}
                      </td>

                      <td className="py-4 px-4 text-center font-mono font-bold text-xs uppercase text-zinc-300">
                        {item.discipline} #{item.attemptNum}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-black text-base text-white">
                        {item.attemptWeight}{" "}
                        <span className="text-xs text-zinc-500 font-sans">KG</span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {isCurrent ? (
                          <span className="text-gym-primary font-bold text-xs">Now Active</span>
                        ) : (
                          <div>
                            <span className="font-mono font-bold text-white text-xs">
                              {item.attemptsAway} attempts
                            </span>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              ≈ {item.estMinutesAway} mins
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                            isCurrent
                              ? "bg-gym-primary text-black font-black"
                              : isHole
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : isRack
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-zinc-800/80 text-zinc-300"
                          }`}
                        >
                          <Zap className="h-3 w-3" />
                          <span>{item.warmupSuggestion}</span>
                        </div>
                      </td>

                      {/* WhatsApp Direct Action Column */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleDispatchAlert(item, position)}
                            disabled={alertingLifterId === item.id}
                            title={
                              item.phoneNumber
                                ? `Send WhatsApp Alert to ${item.phoneNumber}`
                                : "Add phone number to send WhatsApp alert"
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                              isCurrent
                                ? "bg-gym-primary text-black hover:bg-amber-400"
                                : isHole
                                ? "bg-amber-500 text-black hover:bg-amber-400"
                                : isRack
                                ? "bg-blue-500 text-white hover:bg-blue-400"
                                : "bg-zinc-800 text-zinc-300 hover:bg-emerald-600 hover:text-white"
                            }`}
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>Alert</span>
                          </button>

                          <button
                            onClick={() => handleOpenContactModal(item, position)}
                            title="Edit Contact Phone Number"
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Floating Alert Toast Notification */}
      {alertToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md rounded-2xl border p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom duration-300 ${
            alertToast.type === "success"
              ? "border-emerald-500/50 bg-emerald-950/90 text-emerald-200"
              : alertToast.type === "info"
              ? "border-amber-500/50 bg-zinc-950/95 text-amber-200"
              : "border-red-500/50 bg-red-950/90 text-red-200"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {alertToast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : alertToast.type === "info" ? (
                <MessageSquare className="h-5 w-5 text-amber-400 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 shrink-0" />
              )}
              <h4 className="font-bold text-sm text-white">{alertToast.title}</h4>
            </div>
            <button
              onClick={() => setAlertToast(null)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-1.5 text-xs opacity-90 leading-relaxed">{alertToast.message}</p>

          {(alertToast.waUrl || alertToast.coachWaUrl) && (
            <div className="mt-3 pt-2.5 border-t border-zinc-800 flex flex-wrap items-center gap-2">
              {alertToast.waUrl && (
                <a
                  href={alertToast.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow"
                >
                  <span>Open WhatsApp (Lifter)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {alertToast.coachWaUrl && (
                <a
                  href={alertToast.coachWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
                >
                  <span>Open WhatsApp (Coach)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Contact Editor Modal */}
      {contactModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gym-primary" />
                <h3 className="font-bold text-white text-base">
                  Update Call Room Contact
                </h3>
              </div>
              <button
                onClick={() => setContactModal(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-zinc-400">
              Editing contact for <strong className="text-white uppercase">{contactModal.lifterName}</strong>.
              Phone numbers are saved instantly for live WhatsApp queue alerts.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-zinc-400 mb-1">
                  Athlete Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={contactModal.phone}
                  onChange={(e) =>
                    setContactModal((prev) => (prev ? { ...prev, phone: e.target.value } : null))
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:border-gym-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-zinc-400 mb-1">
                  Coach Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Coach Rahul Sharma"
                  value={contactModal.coachName}
                  onChange={(e) =>
                    setContactModal((prev) => (prev ? { ...prev, coachName: e.target.value } : null))
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:border-gym-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-zinc-400 mb-1">
                  Coach WhatsApp Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={contactModal.coachPhone}
                  onChange={(e) =>
                    setContactModal((prev) => (prev ? { ...prev, coachPhone: e.target.value } : null))
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:border-gym-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setContactModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContactModal}
                disabled={isSavingContact}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gym-primary text-black font-black text-xs uppercase hover:bg-amber-400 active:scale-95 transition-all shadow-md disabled:opacity-50"
              >
                {isSavingContact ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save & Alert</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
