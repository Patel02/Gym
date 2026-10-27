"use client";

import {
  autoEnrollActiveLiftersAction,
  enrollLifterToMeetAction,
  getAvailableAthletesForEnrollAction,
  getMeetScoringResultsAction,
  removeLifterFromMeetScoringAction,
  submitRefereeAttemptDecisionAction,
  updateLiftScore,
  type LiftField,
  type LiveScoringMeetDto,
  type LiveScoringResultDto,
} from "@/actions/scoring.actions";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Edit3,
  ExternalLink,
  Flame,
  Loader2,
  MessageSquare,
  Pause,
  Phone,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Send,
  Sparkles,
  Trash2,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  dispatchLifterQueueAlertAction,
  updateLifterContactAction,
  type QueuePosition,
} from "@/actions/whatsapp-alerts.actions";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

interface MatchDayPlatformConsoleProps {
  initialMeets: LiveScoringMeetDto[];
  initialSelectedMeetId?: string;
  initialResults: LiveScoringResultDto[];
}

export function MatchDayPlatformConsole({
  initialMeets,
  initialSelectedMeetId,
  initialResults,
}: MatchDayPlatformConsoleProps) {
  const [meets, setMeets] = useState<LiveScoringMeetDto[]>(initialMeets);
  const [selectedMeetId, setSelectedMeetId] = useState<string>(
    initialSelectedMeetId || (initialMeets.length > 0 ? initialMeets[0].id : "")
  );
  const [results, setResults] = useState<LiveScoringResultDto[]>(initialResults);
  const [activeLifterId, setActiveLifterId] = useState<string>(
    initialResults.length > 0 ? initialResults[0].id : ""
  );

  // Platform Discipline and Attempt selection
  const [discipline, setDiscipline] = useState<"squat" | "bench" | "deadlift">("squat");
  const [attemptNumber, setAttemptNumber] = useState<1 | 2 | 3>(1);
  const [declaredWeight, setDeclaredWeight] = useState<number>(200);

  // IPF 3-Light Referee Board State
  const [ref1, setRef1] = useState<"WHITE" | "RED">("WHITE");
  const [headRef, setHeadRef] = useState<"WHITE" | "RED">("WHITE");
  const [ref3, setRef3] = useState<"WHITE" | "RED">("WHITE");

  // 60-Second Attempt Clock
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & UI Controls
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [availableAthletes, setAvailableAthletes] = useState<
    Array<{ id: string; name: string | null; email: string | null; weightClass?: string; gender?: string }>
  >([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");
  const [enrollBodyweight, setEnrollBodyweight] = useState<string>("82.5");
  const [isAutoEnrolling, startAutoEnroll] = useTransition();
  const [isSubmittingDecision, startSubmitDecision] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchTableQuery, setSearchTableQuery] = useState<string>("");

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    description: string;
  } | null>(null);

  // Inline edit state
  const [editingCell, setEditingCell] = useState<{ resultId: string; field: LiftField } | null>(null);
  const [cellEditValue, setCellEditValue] = useState<string>("");
  const [isCellUpdating, setIsCellUpdating] = useState<boolean>(false);

  // Timer Tick Effect
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  // Selected Meet Object
  const currentMeet = useMemo(
    () => meets.find((m) => m.id === selectedMeetId),
    [meets, selectedMeetId]
  );

  // Active Lifter Object
  const activeLifter = useMemo(
    () => results.find((r) => r.id === activeLifterId) || results[0] || null,
    [results, activeLifterId]
  );

  // On-Deck Call Room Queue (Current, Next, 2nd Next)
  const onDeckQueue = useMemo(() => {
    if (!results || results.length === 0) return [];
    const activeIndex = results.findIndex((r) => r.id === activeLifterId);
    if (activeIndex === -1) return results.slice(0, 3);
    return [
      results[activeIndex],
      results[activeIndex + 1],
      results[activeIndex + 2],
    ].filter(Boolean);
  }, [results, activeLifterId]);

  // WhatsApp Call Room Alerts state
  const [autoAlertOnDecision, setAutoAlertOnDecision] = useState<boolean>(true);
  const [alertingLifterId, setAlertingLifterId] = useState<string | null>(null);
  const [contactModal, setContactModal] = useState<{
    isOpen: boolean;
    userId: string;
    lifterName: string;
    phone: string;
    coachPhone: string;
    coachName: string;
    pendingPosition?: QueuePosition;
    pendingResult?: LiveScoringResultDto;
  } | null>(null);
  const [isSavingContact, setIsSavingContact] = useState<boolean>(false);

  const handleOpenContactModal = (
    result: LiveScoringResultDto,
    pendingPosition?: QueuePosition
  ) => {
    setContactModal({
      isOpen: true,
      userId: result.userId,
      lifterName: result.user.name || result.user.email || "Lifter",
      phone: result.phoneNumber || (result.user as any)?.phone || "",
      coachPhone: result.coachPhone || "",
      coachName: result.coachName || "",
      pendingPosition,
      pendingResult: result,
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
        setResults((prev) =>
          prev.map((r) =>
            r.userId === contactModal.userId
              ? {
                  ...r,
                  phoneNumber: contactModal.phone,
                  coachPhone: contactModal.coachPhone,
                  coachName: contactModal.coachName,
                }
              : r
          )
        );
        setNotification({
          type: "success",
          title: "Contact Updated",
          description: "Lifter & Coach phone numbers saved for WhatsApp queue dispatch.",
        });

        if (contactModal.pendingPosition && contactModal.pendingResult) {
          const updatedResult: LiveScoringResultDto = {
            ...contactModal.pendingResult,
            phoneNumber: contactModal.phone,
            coachPhone: contactModal.coachPhone,
            coachName: contactModal.coachName,
          };
          const pos = contactModal.pendingPosition;
          setContactModal(null);
          handleDispatchAdminAlert(updatedResult, pos);
          return;
        }

        setContactModal(null);
      } else {
        setNotification({
          type: "error",
          title: "Update Failed",
          description: res.error || "Could not save phone numbers.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Error",
        description: err.message || "Failed to save contact.",
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleDispatchAdminAlert = async (
    result: LiveScoringResultDto,
    queuePosition: QueuePosition,
    targetPhoneOverride?: string
  ) => {
    const targetPhone =
      targetPhoneOverride || result.phoneNumber || (result.user as any)?.phone;
    if (!targetPhone) {
      handleOpenContactModal(result, queuePosition);
      return;
    }

    setAlertingLifterId(result.id);
    try {
      const res = await dispatchLifterQueueAlertAction({
        meetId: selectedMeetId,
        meetTitle: currentMeet?.title || "Gujarat State Powerlifting Championship",
        lifterId: result.id,
        lifterName: result.user.name || result.user.email || "Lifter",
        phoneNumber: targetPhoneOverride
          ? undefined
          : result.phoneNumber || (result.user as any)?.phone,
        coachPhone: targetPhoneOverride ? targetPhoneOverride : result.coachPhone,
        coachName: result.coachName,
        queuePosition,
        discipline,
        attemptNumber,
        weightKg: declaredWeight,
        flight: "Flight A",
      });

      if (res.success) {
        if (res.method === "TWILIO_API") {
          setNotification({
            type: "success",
            title: "⚡ WhatsApp Sent (Twilio)",
            description: `Automated alert dispatched to ${
              result.user.name || "Lifter"
            } (${targetPhone}).`,
          });
        } else {
          if (res.waUrl && typeof window !== "undefined") {
            window.open(res.waUrl, "_blank", "noopener,noreferrer");
          }
          setNotification({
            type: "info",
            title:
              res.method === "FALLBACK_WA_ME"
                ? "⚠️ Twilio Fallback: Free WhatsApp Link"
                : "📲 Free WhatsApp Link Opened",
            description:
              res.error ||
              `Direct WhatsApp link opened for ${result.user.name || "Lifter"}.`,
          });
        }
      } else {
        setNotification({
          type: "error",
          title: "WhatsApp Dispatch Failed",
          description: res.error || "Could not trigger WhatsApp alert.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Dispatch Error",
        description: err.message || "Failed to trigger alert.",
      });
    } finally {
      setAlertingLifterId(null);
    }
  };

  // Keep activeLifterId synced
  useEffect(() => {
    if (results.length > 0 && !results.some((r) => r.id === activeLifterId)) {
      setActiveLifterId(results[0].id);
    }
  }, [results, activeLifterId]);

  // Sync declared weight when active lifter or discipline/attempt changes
  useEffect(() => {
    if (!activeLifter) return;
    const currentField = `${discipline}${attemptNumber}` as LiftField;
    const existingVal = activeLifter[currentField];

    if (existingVal !== null && existingVal !== undefined) {
      setDeclaredWeight(Math.abs(existingVal));
    } else {
      // Default plausible values
      if (discipline === "squat") setDeclaredWeight(200);
      else if (discipline === "bench") setDeclaredWeight(140);
      else setDeclaredWeight(240);
    }
  }, [activeLifter, discipline, attemptNumber]);

  // Calculate Referee Consensus
  const whiteCount = [ref1, headRef, ref3].filter((l) => l === "WHITE").length;
  const isGoodLiftConsensus = whiteCount >= 2;

  // Handle Meet Switch
  const handleSelectMeet = async (meetId: string) => {
    setSelectedMeetId(meetId);
    setIsRefreshing(true);
    try {
      const res = await getMeetScoringResultsAction(meetId);
      if (res.success && res.results) {
        setResults(res.results);
        if (res.results.length > 0) {
          setActiveLifterId(res.results[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh current meet results
  const handleRefreshResults = async () => {
    if (!selectedMeetId) return;
    setIsRefreshing(true);
    try {
      const res = await getMeetScoringResultsAction(selectedMeetId);
      if (res.success && res.results) {
        setResults(res.results);
        setNotification({
          type: "success",
          title: "Scoring Table Synced",
          description: "Live stage scores and attempts refreshed from database.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Sync Failed",
        description: err.message || "Failed to refresh scores.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-Enroll Active Lifters
  const handleAutoEnroll = () => {
    if (!selectedMeetId) return;
    startAutoEnroll(async () => {
      try {
        const res = await autoEnrollActiveLiftersAction(selectedMeetId);
        if (res.success) {
          setNotification({
            type: "success",
            title: "Lifters Enrolled",
            description: res.message || "Lifters successfully enrolled to meet platform.",
          });
          // Refresh results
          const updated = await getMeetScoringResultsAction(selectedMeetId);
          if (updated.success && updated.results) {
            setResults(updated.results);
            if (updated.results.length > 0) {
              setActiveLifterId(updated.results[0].id);
            }
          }
        } else {
          setNotification({
            type: "error",
            title: "Enrollment Failed",
            description: res.error || "Could not auto-enroll lifters.",
          });
        }
      } catch (err: any) {
        setNotification({
          type: "error",
          title: "Enrollment Error",
          description: err.message || "An unexpected error occurred.",
        });
      }
    });
  };

  // Open Enroll Modal and fetch available athletes
  const handleOpenEnrollModal = async () => {
    if (!selectedMeetId) return;
    setIsEnrollModalOpen(true);
    try {
      const res = await getAvailableAthletesForEnrollAction(selectedMeetId);
      if (res.success && res.athletes) {
        setAvailableAthletes(res.athletes);
        if (res.athletes.length > 0) {
          setSelectedAthleteId(res.athletes[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Enroll Single Athlete
  const handleSubmitEnrollAthlete = async () => {
    if (!selectedMeetId || !selectedAthleteId) return;
    const bw = parseFloat(enrollBodyweight);
    try {
      const res = await enrollLifterToMeetAction({
        eventId: selectedMeetId,
        userId: selectedAthleteId,
        bodyweight: isNaN(bw) ? undefined : bw,
      });

      if (res.success) {
        setIsEnrollModalOpen(false);
        setNotification({
          type: "success",
          title: "Athlete Enrolled",
          description: res.message || "Athlete enrolled successfully.",
        });
        // Refresh
        const updated = await getMeetScoringResultsAction(selectedMeetId);
        if (updated.success && updated.results) {
          setResults(updated.results);
          setActiveLifterId(selectedAthleteId);
        }
      } else {
        setNotification({
          type: "error",
          title: "Enroll Failed",
          description: res.error || "Could not enroll athlete.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Enroll Error",
        description: err.message || "Error enrolling athlete.",
      });
    }
  };

  // Remove Lifter from Meet
  const handleRemoveLifter = async (resultId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this championship platform?`)) {
      return;
    }

    try {
      const res = await removeLifterFromMeetScoringAction(resultId);
      if (res.success) {
        setResults((prev) => prev.filter((r) => r.id !== resultId));
        setNotification({
          type: "info",
          title: "Lifter Removed",
          description: `${name} was removed from the active meet roster.`,
        });
      } else {
        setNotification({
          type: "error",
          title: "Remove Failed",
          description: res.error || "Failed to remove lifter.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Error",
        description: err.message || "Failed to remove lifter.",
      });
    }
  };

  // Submit Referee Attempt Decision
  const handleSubmitDecision = () => {
    if (!activeLifter) return;
    const currentLiftField = `${discipline}${attemptNumber}` as LiftField;

    startSubmitDecision(async () => {
      try {
        const res = await submitRefereeAttemptDecisionAction({
          resultId: activeLifter.id,
          liftField: currentLiftField,
          declaredWeight,
          ref1,
          headRef,
          ref3,
        });

        if (res.success) {
          const isGood = res.isGoodLift;
          setNotification({
            type: isGood ? "success" : "error",
            title: isGood ? "GOOD LIFT RECORDED (IPF APPROVED)" : "NO LIFT RECORDED",
            description: `${activeLifter.user.name || "Lifter"} — ${discipline.toUpperCase()} ${attemptNumber} @ ${declaredWeight} KG [${whiteCount}-White Lights]`,
          });

          // Update local state results immediately
          setResults((prev) =>
            prev.map((r) => {
              if (r.id === activeLifter.id) {
                return {
                  ...r,
                  [currentLiftField]: res.recordedWeight ?? null,
                  bestSquat: res.bestSquat ?? r.bestSquat,
                  bestBench: res.bestBench ?? r.bestBench,
                  bestDeadlift: res.bestDeadlift ?? r.bestDeadlift,
                  total: res.total ?? r.total,
                  ipfGlPoints: res.ipfGlPoints ?? r.ipfGlPoints,
                  version: r.version + 1,
                };
              }
              return r;
            })
          );

          // Reset Timer
          setTimerSeconds(60);
          setIsTimerRunning(false);

          // Advance attempt or reset lights
          setRef1("WHITE");
          setHeadRef("WHITE");
          setRef3("WHITE");

          if (attemptNumber < 3) {
            setAttemptNumber((prev) => (prev + 1) as 2 | 3);
            if (isGood) {
              setDeclaredWeight((prev) => prev + 5);
            }
          }

          // Trigger Auto WhatsApp alert for next lifter in queue
          if (autoAlertOnDecision && onDeckQueue[1]) {
            handleDispatchAdminAlert(onDeckQueue[1], "IN_HOLE");
          }
        } else {
          setNotification({
            type: "error",
            title: "Decision Submission Failed",
            description: res.error || "Could not record attempt decision.",
          });
        }
      } catch (err: any) {
        setNotification({
          type: "error",
          title: "Submission Error",
          description: err.message || "Failed to commit decision.",
        });
      }
    });
  };

  // Inline cell quick edit
  const handleInlineScoreSave = async (result: LiveScoringResultDto, field: LiftField) => {
    const val = parseFloat(cellEditValue);
    if (isNaN(val)) {
      setEditingCell(null);
      return;
    }

    setIsCellUpdating(true);
    try {
      const res = await updateLiftScore({
        resultId: result.id,
        liftField: field,
        weight: val,
        currentVersion: result.version,
      });

      if (res.success) {
        setResults((prev) =>
          prev.map((r) =>
            r.id === result.id
              ? {
                  ...r,
                  [field]: val,
                  bestSquat: res.bestSquat ?? r.bestSquat,
                  bestBench: res.bestBench ?? r.bestBench,
                  bestDeadlift: res.bestDeadlift ?? r.bestDeadlift,
                  total: res.total ?? r.total,
                  ipfGlPoints: res.ipfGlPoints ?? r.ipfGlPoints,
                  version: res.newVersion ?? r.version + 1,
                }
              : r
          )
        );
        setNotification({
          type: "success",
          title: "Score Overridden",
          description: `Updated ${result.user.name}'s ${field} to ${val} KG.`,
        });
      } else {
        setNotification({
          type: "error",
          title: "Score Update Failed",
          description: res.error || "Could not update score.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Error",
        description: err.message || "Database update failed.",
      });
    } finally {
      setIsCellUpdating(false);
      setEditingCell(null);
    }
  };

  // Barbell plate visual calculation (standard IPF 20kg bar + collars 2.5kg each = 25kg total)
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

  // Filtered and Sorted Results
  const filteredResults = useMemo(() => {
    return results
      .filter((r) => {
        const name = r.user.name?.toLowerCase() || "";
        const email = r.user.email?.toLowerCase() || "";
        const q = searchTableQuery.toLowerCase();
        return name.includes(q) || email.includes(q);
      })
      .sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  }, [results, searchTableQuery]);

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER & MEET SELECTOR STRIP */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#140603] via-[#0d0402] to-[#120502] p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gym-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gym-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gym-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gym-primary" />
              </span>
              STAGE-1 MATCH DAY LIVE SCORING
            </div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-white sm:text-4xl">
              Platform Action <span className="text-gym-primary">& Referee Console</span>
            </h1>
            <p className="text-sm font-medium text-gray-400">
              IPF 3-light referee decisions, bar load configuration, 1-minute countdown & real-time official scoreboard.
            </p>
          </div>

          {/* Championship Meet Dropdown & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px]">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                Active Championship Meet:
              </label>
              <select
                value={selectedMeetId}
                onChange={(e) => handleSelectMeet(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/20 bg-[#1e0a05] px-4 py-2.5 pr-10 text-sm font-semibold text-white transition-all hover:border-gym-primary focus:border-gym-primary focus:outline-none"
              >
                {meets.length === 0 && <option value="">No championship meets found</option>}
                {meets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.city} • {m.dates})
                  </option>
                ))}
              </select>
              <ChevronRight className="pointer-events-none absolute right-3 top-[34px] h-4 w-4 rotate-90 text-gray-400" />
            </div>

            <div className="flex items-end gap-2 pt-5">
              <button
                onClick={handleOpenEnrollModal}
                disabled={!selectedMeetId}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-[#1c0803] px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-gym-primary hover:bg-gym-primary/20 disabled:opacity-40"
                title="Enroll single athlete to this championship"
              >
                <UserPlus className="h-4 w-4 text-gym-primary" />
                Enroll Lifter
              </button>

              <button
                onClick={handleAutoEnroll}
                disabled={!selectedMeetId || isAutoEnrolling}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-[#b53a0c] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-gym-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
                title="Auto-enroll registered lifters into this meet"
              >
                {isAutoEnrolling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Auto-Enroll Lifters
              </button>

              <button
                onClick={handleRefreshResults}
                disabled={isRefreshing}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#150603] text-gray-300 transition-all hover:border-white/30 hover:text-white"
                title="Refresh score table"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-gym-primary" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all ${
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
              : notification.type === "error"
              ? "border-red-500/30 bg-red-950/40 text-red-300"
              : "border-blue-500/30 bg-blue-950/40 text-blue-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : notification.type === "error" ? (
              <XCircle className="h-5 w-5 text-red-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-400" />
            )}
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">{notification.title}</p>
              <p className="text-xs opacity-90">{notification.description}</p>
            </div>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="rounded-lg p-1 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 1.5. BACKSTAGE CALL ROOM & WHATSAPP QUEUE STRIP */}
      {results.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-zinc-900/80 to-zinc-950 p-4 sm:p-5 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <MessageSquare className="h-4 w-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Live Call Room & WhatsApp Queue
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Instant athlete alerts for warm-up room staging • Zero balance fail-safe active
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Auto dispatch on referee decision toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-emerald-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={autoAlertOnDecision}
                  onChange={(e) => setAutoAlertOnDecision(e.target.checked)}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-bold text-zinc-300">
                  Auto-Alert Next Lifter on Decision
                </span>
              </label>

              <a
                href="/live/warmup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white hover:border-gym-primary transition-all"
              >
                <span>Backstage Matrix</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* On-Deck 3 Lifters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: On Platform */}
            {onDeckQueue[0] ? (
              <div className="rounded-xl border border-gym-primary/50 bg-gym-primary/10 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                    <span className="text-gym-primary">1. Now on Platform</span>
                    <span className="font-mono text-zinc-400">Active</span>
                  </div>
                  <div className="font-bold text-white uppercase text-sm truncate">
                    {onDeckQueue[0].user.name || onDeckQueue[0].user.email || "Lifter"}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-300 mt-0.5">
                    {onDeckQueue[0].user.profile?.weightClass || "83 KG"} • BW:{" "}
                    {onDeckQueue[0].bodyweight?.toFixed(1) || "82.5"} KG
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gym-primary/20 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-zinc-300">
                    {onDeckQueue[0].phoneNumber || (onDeckQueue[0].user as any)?.phone ? (
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Phone className="h-3 w-3 text-gym-primary" />
                        <span>
                          {onDeckQueue[0].phoneNumber || (onDeckQueue[0].user as any)?.phone}
                        </span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenContactModal(onDeckQueue[0], "ON_PLATFORM")}
                        className="text-[10px] font-bold text-gym-primary underline hover:text-amber-400"
                      >
                        + Add Phone
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDispatchAdminAlert(onDeckQueue[0], "ON_PLATFORM")}
                      disabled={alertingLifterId === onDeckQueue[0].id}
                      className="inline-flex items-center gap-1 rounded-lg bg-gym-primary px-2.5 py-1 text-[11px] font-black uppercase text-black hover:bg-amber-400 transition-all disabled:opacity-50"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Alert</span>
                    </button>
                    {onDeckQueue[0].coachPhone && (
                      <button
                        onClick={() =>
                          handleDispatchAdminAlert(
                            onDeckQueue[0],
                            "ON_PLATFORM",
                            onDeckQueue[0].coachPhone!
                          )
                        }
                        title={`Alert Coach: ${onDeckQueue[0].coachName || "Coach"}`}
                        className="p-1 rounded-lg border border-gym-primary/40 bg-zinc-950 text-gym-primary hover:bg-gym-primary/20"
                      >
                        <UserCheck className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenContactModal(onDeckQueue[0], "ON_PLATFORM")}
                      title="Edit Contact"
                      className="p-1 rounded text-zinc-400 hover:text-white"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-3.5 text-center text-xs text-zinc-500">
                No active lifter
              </div>
            )}

            {/* Card 2: In The Hole (Next) */}
            {onDeckQueue[1] ? (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                    <span className="text-amber-400">2. In The Hole (Next)</span>
                    <span className="font-mono text-amber-300">~1.5m</span>
                  </div>
                  <div className="font-bold text-white uppercase text-sm truncate">
                    {onDeckQueue[1].user.name || onDeckQueue[1].user.email || "Standby Next"}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-300 mt-0.5">
                    {onDeckQueue[1].user.profile?.weightClass || "83 KG"} • Wraps On / Chalk Up
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-zinc-300">
                    {onDeckQueue[1].phoneNumber || (onDeckQueue[1].user as any)?.phone ? (
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Phone className="h-3 w-3 text-amber-400" />
                        <span>
                          {onDeckQueue[1].phoneNumber || (onDeckQueue[1].user as any)?.phone}
                        </span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenContactModal(onDeckQueue[1], "IN_HOLE")}
                        className="text-[10px] font-bold text-amber-400 underline hover:text-amber-300"
                      >
                        + Add Phone
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDispatchAdminAlert(onDeckQueue[1], "IN_HOLE")}
                      disabled={alertingLifterId === onDeckQueue[1].id}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-black uppercase text-black hover:bg-amber-400 transition-all disabled:opacity-50"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Alert Next</span>
                    </button>
                    {onDeckQueue[1].coachPhone && (
                      <button
                        onClick={() =>
                          handleDispatchAdminAlert(
                            onDeckQueue[1],
                            "IN_HOLE",
                            onDeckQueue[1].coachPhone!
                          )
                        }
                        title={`Alert Coach: ${onDeckQueue[1].coachName || "Coach"}`}
                        className="p-1 rounded-lg border border-amber-500/40 bg-zinc-950 text-amber-400 hover:bg-amber-500/20"
                      >
                        <UserCheck className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenContactModal(onDeckQueue[1], "IN_HOLE")}
                      title="Edit Contact"
                      className="p-1 rounded text-zinc-400 hover:text-white"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-3.5 text-center text-xs text-zinc-500">
                End of flight
              </div>
            )}

            {/* Card 3: In The Rack (2nd Next) */}
            {onDeckQueue[2] ? (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                    <span className="text-blue-400">3. In The Rack (2nd)</span>
                    <span className="font-mono text-blue-300">~3.0m</span>
                  </div>
                  <div className="font-bold text-white uppercase text-sm truncate">
                    {onDeckQueue[2].user.name || onDeckQueue[2].user.email || "Standby 2nd"}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-300 mt-0.5">
                    {onDeckQueue[2].user.profile?.weightClass || "83 KG"} • Belt / Final Prep
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-blue-500/20 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-zinc-300">
                    {onDeckQueue[2].phoneNumber || (onDeckQueue[2].user as any)?.phone ? (
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Phone className="h-3 w-3 text-blue-400" />
                        <span>
                          {onDeckQueue[2].phoneNumber || (onDeckQueue[2].user as any)?.phone}
                        </span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenContactModal(onDeckQueue[2], "IN_RACK")}
                        className="text-[10px] font-bold text-blue-400 underline hover:text-blue-300"
                      >
                        + Add Phone
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDispatchAdminAlert(onDeckQueue[2], "IN_RACK")}
                      disabled={alertingLifterId === onDeckQueue[2].id}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-2.5 py-1 text-[11px] font-black uppercase text-white hover:bg-blue-400 transition-all disabled:opacity-50"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Alert 2nd</span>
                    </button>
                    {onDeckQueue[2].coachPhone && (
                      <button
                        onClick={() =>
                          handleDispatchAdminAlert(
                            onDeckQueue[2],
                            "IN_RACK",
                            onDeckQueue[2].coachPhone!
                          )
                        }
                        title={`Alert Coach: ${onDeckQueue[2].coachName || "Coach"}`}
                        className="p-1 rounded-lg border border-blue-500/40 bg-zinc-950 text-blue-400 hover:bg-blue-500/20"
                      >
                        <UserCheck className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenContactModal(onDeckQueue[2], "IN_RACK")}
                      title="Edit Contact"
                      className="p-1 rounded text-zinc-400 hover:text-white"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-3.5 text-center text-xs text-zinc-500">
                End of flight
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. THE MAIN STAGE: PLATFORM ACTION COCKPIT */}
      {activeLifter ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: ACTIVE LIFTER & BARBELL LOAD (7 COLS) */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/15 bg-gradient-to-b from-[#160603] to-[#0d0301] p-6 shadow-2xl backdrop-blur-xl lg:col-span-7">
            {/* Header / Lifter Banner */}
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gym-primary/40 bg-gym-primary/20 text-gym-primary shadow-inner">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Lifter on Platform:
                      </span>
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        Active Stage
                      </span>
                    </div>
                    <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-white">
                      {activeLifter.user.name || activeLifter.user.email || "Lifter"}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-gray-400">Division / Class</div>
                  <div className="text-sm font-black text-gym-primary">
                    {activeLifter.user.profile?.weightClass || "83 KG"} •{" "}
                    {activeLifter.user.profile?.gender || "MALE"}
                  </div>
                  <div className="text-xs text-gray-400">
                    BW: <span className="font-bold text-white">{activeLifter.bodyweight || 82.5} KG</span>
                  </div>
                </div>
              </div>

              {/* Discipline & Attempt Selectors */}
              <div className="mt-6 space-y-4">
                {/* Discipline Tabs */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Select Discipline:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["squat", "bench", "deadlift"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDiscipline(d)}
                        className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                          discipline === d
                            ? "border-2 border-gym-primary bg-gym-primary text-white shadow-lg shadow-gym-primary/30"
                            : "border border-white/10 bg-[#120503] text-gray-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <Flame className={`h-4 w-4 ${discipline === d ? "text-white" : "text-gym-primary"}`} />
                        {d === "squat" ? "Squat" : d === "bench" ? "Bench Press" : "Deadlift"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attempt 1, 2, 3 Selector */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Attempt Number:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {([1, 2, 3] as const).map((att) => {
                      const fieldKey = `${discipline}${att}` as LiftField;
                      const recorded = activeLifter[fieldKey];
                      const isSelected = attemptNumber === att;

                      return (
                        <button
                          key={att}
                          onClick={() => setAttemptNumber(att)}
                          className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                            isSelected
                              ? "border-2 border-gym-primary bg-[#240a04] shadow-md"
                              : "border border-white/10 bg-[#120503] hover:border-white/20"
                          }`}
                        >
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isSelected ? "text-gym-primary" : "text-gray-300"
                            }`}
                          >
                            Attempt #{att}
                          </span>
                          <span className="mt-1 text-xs font-bold">
                            {recorded === null || recorded === undefined ? (
                              <span className="text-gray-500">Unattempted</span>
                            ) : recorded > 0 ? (
                              <span className="text-emerald-400">{recorded} KG ✓</span>
                            ) : (
                              <span className="text-red-400 line-through">{Math.abs(recorded)} KG ✗</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Barbell Declared Weight Input & Quick Buttons */}
              <div className="mt-6 rounded-xl border border-white/10 bg-[#100402] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Declared Bar Load (KG):
                  </span>
                  <span className="text-xs font-bold text-gym-primary">IPF Approved Calibration</span>
                </div>

                <div className="mt-3 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setDeclaredWeight((w) => Math.max(25, w - 5))}
                    className="h-11 w-11 rounded-xl border border-white/15 bg-[#180603] font-heading text-lg font-bold text-white transition-all hover:border-gym-primary hover:bg-gym-primary/20 active:scale-95"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => setDeclaredWeight((w) => Math.max(25, w - 2.5))}
                    className="h-11 w-11 rounded-xl border border-white/15 bg-[#180603] font-heading text-sm font-bold text-white transition-all hover:border-gym-primary hover:bg-gym-primary/20 active:scale-95"
                  >
                    -2.5
                  </button>

                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="25"
                      max="600"
                      value={declaredWeight}
                      onChange={(e) => setDeclaredWeight(parseFloat(e.target.value) || 25)}
                      className="w-32 rounded-xl border-2 border-gym-primary/50 bg-[#1c0803] py-1.5 text-center font-heading text-3xl font-bold text-white focus:border-gym-primary focus:outline-none"
                    />
                    <span className="font-heading text-xl font-bold text-gym-primary">KG</span>
                  </div>

                  <button
                    onClick={() => setDeclaredWeight((w) => w + 2.5)}
                    className="h-11 w-11 rounded-xl border border-white/15 bg-[#180603] font-heading text-sm font-bold text-white transition-all hover:border-gym-primary hover:bg-gym-primary/20 active:scale-95"
                  >
                    +2.5
                  </button>
                  <button
                    onClick={() => setDeclaredWeight((w) => w + 5)}
                    className="h-11 w-11 rounded-xl border border-white/15 bg-[#180603] font-heading text-lg font-bold text-white transition-all hover:border-gym-primary hover:bg-gym-primary/20 active:scale-95"
                  >
                    +5
                  </button>
                </div>

                {/* Plate Loading Visualizer */}
                <div className="mt-4 border-t border-white/5 pt-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Each Sleeve Loading (Bar 20kg + Collars 5kg = 25kg):</span>
                    <span className="font-bold text-white">
                      {((declaredWeight - 25) / 2).toFixed(2)} KG / side
                    </span>
                  </div>
                  <div className="mt-2 flex h-10 items-center justify-center gap-1 rounded-lg bg-[#070201] p-1">
                    <div className="h-6 w-3 rounded-l bg-gray-500" title="Barbell Sleeve" />
                    {plateBreakdown.length === 0 && (
                      <span className="text-[10px] text-gray-500">Empty Bar (25kg)</span>
                    )}
                    {plateBreakdown.map((plate, idx) => (
                      <div
                        key={idx}
                        className={`flex h-8 w-6 items-center justify-center rounded-sm text-[10px] font-semibold ${plate.color}`}
                        title={`${plate.weight} KG Plate`}
                      >
                        {plate.label}
                      </div>
                    ))}
                    <div className="h-7 w-2 rounded-r bg-yellow-400" title="IPF Competition Collar" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick lifter summary stats footer */}
            <div className="mt-6 grid grid-cols-4 gap-2 rounded-xl border border-white/10 bg-[#0c0301] p-3 text-center">
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

          {/* RIGHT: IPF 3-LIGHT REFEREE BOARD & ATTEMPT CLOCK (5 COLS) */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/15 bg-gradient-to-b from-[#180603] to-[#0e0302] p-6 shadow-2xl backdrop-blur-xl lg:col-span-5">
            <div>
              {/* Official 1-Minute Clock */}
              <div className="rounded-xl border border-white/10 bg-[#100402] p-4 text-center">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gym-primary" />
                    1-Minute Platform Clock
                  </span>
                  <span
                    className={`font-black ${
                      timerSeconds <= 10 && isTimerRunning
                        ? "animate-pulse text-red-500"
                        : "text-emerald-400"
                    }`}
                  >
                    {isTimerRunning ? "● ACTIVE" : "PAUSED"}
                  </span>
                </div>

                <div className="my-3 flex items-center justify-center">
                  <div
                    className={`font-heading text-6xl font-black tracking-widest ${
                      timerSeconds <= 10
                        ? "text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                        : "text-white"
                    }`}
                  >
                    00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                  </div>
                </div>

                {/* Clock Controls */}
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setIsTimerRunning((prev) => !prev)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all ${
                      isTimerRunning
                        ? "bg-amber-600 hover:bg-amber-500"
                        : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
                  >
                    {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {isTimerRunning ? "Pause Clock" : "Start Clock"}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(60);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#1a0804] px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:border-white/30 hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset 60s
                  </button>
                </div>
              </div>

              {/* IPF 3-LIGHT REFEREE BOARD */}
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gym-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      IPF 3-Light Referee Jury
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">Click lens to toggle light</span>
                </div>

                {/* 3 Referee Lens Fixtures */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Left Referee */}
                  <div className="flex flex-col items-center rounded-xl border border-white/10 bg-[#0d0301] p-3 text-center">
                    <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      REF 1 (LEFT)
                    </span>
                    <button
                      onClick={() => setRef1((l) => (l === "WHITE" ? "RED" : "WHITE"))}
                      className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all duration-300 active:scale-95 ${
                        ref1 === "WHITE"
                          ? "border-white bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.95)]"
                          : "border-red-600 bg-red-600 text-white shadow-[0_0_35px_rgba(239,68,68,0.95)]"
                      }`}
                    >
                      <span className="font-heading text-xs font-bold tracking-widest uppercase">
                        {ref1}
                      </span>
                    </button>
                    <div className="mt-2 flex gap-1">
                      <button
                        onClick={() => setRef1("WHITE")}
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          ref1 === "WHITE" ? "bg-white text-black" : "bg-white/10 text-gray-400"
                        }`}
                      >
                        W
                      </button>
                      <button
                        onClick={() => setRef1("RED")}
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          ref1 === "RED" ? "bg-red-600 text-white" : "bg-white/10 text-gray-400"
                        }`}
                      >
                        R
                      </button>
                    </div>
                  </div>

                  {/* Head Referee (Center) */}
                  <div className="flex flex-col items-center rounded-xl border-2 border-gym-primary/30 bg-[#160603] p-3 text-center">
                    <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gym-primary">
                      HEAD REFEREE
                    </span>
                    <button
                      onClick={() => setHeadRef((l) => (l === "WHITE" ? "RED" : "WHITE"))}
                      className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all duration-300 active:scale-95 ${
                        headRef === "WHITE"
                          ? "border-white bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.95)]"
                          : "border-red-600 bg-red-600 text-white shadow-[0_0_35px_rgba(239,68,68,0.95)]"
                      }`}
                    >
                      <span className="font-heading text-xs font-bold tracking-widest uppercase">
                        {headRef}
                      </span>
                    </button>
                    <div className="mt-2 flex gap-1">
                      <button
                        onClick={() => setHeadRef("WHITE")}
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          headRef === "WHITE" ? "bg-white text-black" : "bg-white/10 text-gray-400"
                        }`}
                      >
                        W
                      </button>
                      <button
                        onClick={() => setHeadRef("RED")}
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          headRef === "RED" ? "bg-red-600 text-white" : "bg-white/10 text-gray-400"
                        }`}
                      >
                        R
                      </button>
                    </div>
                  </div>

                  {/* Right Referee */}
                  <div className="flex flex-col items-center rounded-xl border border-white/10 bg-[#0d0301] p-3 text-center">
                    <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      REF 3 (RIGHT)
                    </span>
                    <button
                      onClick={() => setRef3((l) => (l === "WHITE" ? "RED" : "WHITE"))}
                      className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all duration-300 active:scale-95 ${
                        ref3 === "WHITE"
                          ? "border-white bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.95)]"
                          : "border-red-600 bg-red-600 text-white shadow-[0_0_35px_rgba(239,68,68,0.95)]"
                      }`}
                    >
                      <span className="font-heading text-xs font-bold tracking-widest uppercase">
                        {ref3}
                      </span>
                    </button>
                    <div className="mt-2 flex gap-1">
                      <button
                        onClick={() => setRef3("WHITE")}
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          ref3 === "WHITE" ? "bg-white text-black" : "bg-white/10 text-gray-400"
                        }`}
                      >
                        W
                      </button>
                      <button
                        onClick={() => setRef3("RED")}
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          ref3 === "RED" ? "bg-red-600 text-white" : "bg-white/10 text-gray-400"
                        }`}
                      >
                        R
                      </button>
                    </div>
                  </div>
                </div>

                {/* Consensus Indicator Banner */}
                <div
                  className={`mt-4 flex items-center justify-between rounded-xl border p-3 font-heading font-bold tracking-wider transition-all ${
                    isGoodLiftConsensus
                      ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-400 shadow-lg shadow-emerald-950/50"
                      : "border-red-500/50 bg-red-950/40 text-red-400 shadow-lg shadow-red-950/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isGoodLiftConsensus ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span className="text-base uppercase">
                      {isGoodLiftConsensus
                        ? whiteCount === 3
                          ? "3-0 UNANIMOUS GOOD LIFT"
                          : "2-1 MAJORITY GOOD LIFT"
                        : whiteCount === 1
                        ? "2-1 MAJORITY NO LIFT"
                        : "3-0 UNANIMOUS NO LIFT"}
                    </span>
                  </div>
                  <span className="rounded bg-black/40 px-2 py-0.5 text-xs">
                    {isGoodLiftConsensus ? `+${declaredWeight} KG` : `-${declaredWeight} KG`}
                  </span>
                </div>
              </div>
            </div>

            {/* Commit Decision Button */}
            <div className="mt-6 pt-4">
              <button
                onClick={handleSubmitDecision}
                disabled={isSubmittingDecision}
                className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 font-heading text-base font-bold uppercase tracking-wider text-white shadow-xl transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 ${
                  isGoodLiftConsensus
                    ? "bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-900/40"
                    : "bg-gradient-to-r from-red-600 to-rose-800 shadow-red-900/40"
                }`}
              >
                {isSubmittingDecision ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Scale className="h-5 w-5" />
                )}
                Commit {isGoodLiftConsensus ? "Good Lift" : "No Lift"} Decision to Database
              </button>
              <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                <span>Auto-updates Total, GL points & recalculates ranks</span>
                <span>IPF Rule 14.3</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State when no lifter is enrolled or meet is empty */
        <div className="rounded-2xl border border-white/10 bg-[#120503] p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-600" />
          <h3 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wider text-white">
            No Active Lifters Enrolled in this Meet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            Click &quot;Auto-Enroll Lifters&quot; to populate the platform with registered federation athletes, or
            enroll athletes individually.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleAutoEnroll}
              disabled={isAutoEnrolling}
              className="inline-flex items-center gap-2 rounded-xl bg-gym-primary px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110"
            >
              {isAutoEnrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Auto-Enroll Active Lifters
            </button>
            <button
              onClick={handleOpenEnrollModal}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-[#1c0803] px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white hover:border-gym-primary"
            >
              <UserPlus className="h-4 w-4 text-gym-primary" />
              Enroll Single Athlete
            </button>
          </div>
        </div>
      )}

      {/* 3. REAL-TIME ATTEMPT TABLE & LEADERBOARD */}
      <div className="rounded-2xl border border-white/10 bg-[#0e0402] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gym-primary" />
              <h3 className="font-heading text-2xl font-bold uppercase tracking-wider text-white">
                Championship Attempt Board & Standings
              </h3>
            </div>
            <p className="text-xs text-gray-400">
              Ranked dynamically by Total KG & IPF GL Points. Click &quot;Call to Stage&quot; to load lifter.
            </p>
          </div>

          {/* Table Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search lifters..."
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#180603] py-2 pl-9 pr-4 text-xs font-semibold text-white focus:border-gym-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Table */}
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
                <th className="px-4 py-3 text-center">Stage Action</th>
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
                  <td colSpan={17} className="py-8 text-center text-gray-500">
                    No lifters match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredResults.map((r, index) => {
                  const isActive = r.id === activeLifterId;

                  const renderAttemptCell = (field: LiftField, val: number | null) => {
                    const isCellEditing =
                      editingCell?.resultId === r.id && editingCell?.field === field;

                    if (isCellEditing) {
                      return (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleInlineScoreSave(r, field);
                              if (e.key === "Escape") setEditingCell(null);
                            }}
                            className="w-14 rounded border border-gym-primary bg-black px-1 py-0.5 text-center text-[10px] text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleInlineScoreSave(r, field)}
                            disabled={isCellUpdating}
                            className="text-emerald-400 hover:text-white"
                          >
                            ✓
                          </button>
                        </div>
                      );
                    }

                    if (val === null || val === undefined) {
                      return (
                        <button
                          onClick={() => {
                            setEditingCell({ resultId: r.id, field });
                            setCellEditValue("");
                          }}
                          className="rounded px-1.5 py-0.5 text-[10px] text-gray-600 hover:bg-white/5 hover:text-gray-300"
                        >
                          —
                        </button>
                      );
                    }

                    const isGood = val > 0;
                    return (
                      <button
                        onClick={() => {
                          setEditingCell({ resultId: r.id, field });
                          setCellEditValue(String(val));
                        }}
                        title="Click to edit score"
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all hover:ring-1 hover:ring-white/40 ${
                          isGood
                            ? "bg-emerald-950/60 text-emerald-400"
                            : "bg-red-950/60 text-red-400 line-through"
                        }`}
                      >
                        {Math.abs(val)}
                      </button>
                    );
                  };

                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors hover:bg-white/[0.02] ${
                        isActive ? "bg-gym-primary/10 border-l-4 border-l-gym-primary" : ""
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {index === 0 ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 font-bold text-black text-[10px]">
                              1
                            </span>
                          ) : index === 1 ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 font-bold text-black text-[10px]">
                              2
                            </span>
                          ) : index === 2 ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 font-bold text-white text-[10px]">
                              3
                            </span>
                          ) : (
                            <span className="font-bold text-gray-500">#{index + 1}</span>
                          )}
                        </div>
                      </td>

                      {/* Lifter Info */}
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            {r.user.name || r.user.email}
                            {isActive && (
                              <span className="rounded bg-gym-primary px-1.5 py-0.2 text-[8px] font-black uppercase text-white">
                                ON STAGE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {r.user.profile?.weightClass || "83 KG"} • BW: {r.bodyweight || 82.5} KG
                          </div>
                        </div>
                      </td>

                      {/* Squat Attempts */}
                      <td className="px-2 py-3 text-center">{renderAttemptCell("squat1", r.squat1)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell("squat2", r.squat2)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell("squat3", r.squat3)}</td>
                      <td className="px-2 py-3 text-center font-bold text-gym-primary">
                        {r.bestSquat ? `${r.bestSquat}` : "—"}
                      </td>

                      {/* Bench Attempts */}
                      <td className="px-2 py-3 text-center">{renderAttemptCell("bench1", r.bench1)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell("bench2", r.bench2)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell("bench3", r.bench3)}</td>
                      <td className="px-2 py-3 text-center font-bold text-gym-primary">
                        {r.bestBench ? `${r.bestBench}` : "—"}
                      </td>

                      {/* Deadlift Attempts */}
                      <td className="px-2 py-3 text-center">{renderAttemptCell("deadlift1", r.deadlift1)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell("deadlift2", r.deadlift2)}</td>
                      <td className="px-2 py-3 text-center">{renderAttemptCell("deadlift3", r.deadlift3)}</td>
                      <td className="px-2 py-3 text-center font-bold text-gym-primary">
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

                      {/* Stage Action */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setActiveLifterId(r.id);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                              isActive
                                ? "border border-gym-primary bg-gym-primary text-white"
                                : "border border-white/20 bg-[#1a0703] text-gray-300 hover:border-gym-primary hover:text-white"
                            }`}
                          >
                            {isActive ? "On Stage" : "Call to Stage"}
                          </button>
                          <button
                            onClick={() => handleRemoveLifter(r.id, r.user.name || "Lifter")}
                            className="rounded p-1 text-gray-600 hover:text-red-400"
                            title="Remove from scoring"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ENROLL LIFTER MODAL */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-[#160603] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-gym-primary" />
                <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                  Enroll Athlete to Championship
                </h3>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Select Athlete from Database:
                </label>
                {availableAthletes.length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-black/40 p-4 text-center text-xs text-gray-400">
                    All registered athletes are already enrolled in this meet!
                  </p>
                ) : (
                  <select
                    value={selectedAthleteId}
                    onChange={(e) => setSelectedAthleteId(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-[#220a04] px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  >
                    {availableAthletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name || a.email} ({a.weightClass || "83 KG"} • {a.gender || "MALE"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Weigh-In Bodyweight (KG):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={enrollBodyweight}
                  onChange={(e) => setEnrollBodyweight(e.target.value)}
                  placeholder="82.5"
                  className="w-full rounded-xl border border-white/20 bg-[#220a04] px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
                <span className="mt-1 block text-[11px] text-gray-500">
                  Used for IPF GL Points calculation.
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="rounded-xl border border-white/10 bg-[#120402] px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEnrollAthlete}
                disabled={!selectedAthleteId || availableAthletes.length === 0}
                className="rounded-xl bg-gym-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 disabled:opacity-40"
              >
                Enroll to Platform
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Contact Editor Modal */}
      {contactModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c0803] border border-gym-primary/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gym-primary" />
                <h3 className="font-bold text-white text-base">
                  Update Call Room Contact
                </h3>
              </div>
              <button
                onClick={() => setContactModal(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300">
              Editing phone contact for{" "}
              <strong className="text-white uppercase">
                {contactModal.lifterName}
              </strong>
              . Saved numbers will be used for automated Twilio and 1-Click WhatsApp queue alerts.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                  Athlete Mobile Phone
                </label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={contactModal.phone}
                  onChange={(e) =>
                    setContactModal((prev) =>
                      prev ? { ...prev, phone: e.target.value } : null
                    )
                  }
                  className="w-full rounded-xl border border-white/20 bg-[#120402] px-3.5 py-2 text-xs font-mono text-white placeholder-gray-600 focus:border-gym-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                  Coach Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Coach Rahul Sharma"
                  value={contactModal.coachName}
                  onChange={(e) =>
                    setContactModal((prev) =>
                      prev ? { ...prev, coachName: e.target.value } : null
                    )
                  }
                  className="w-full rounded-xl border border-white/20 bg-[#120402] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-gym-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                  Coach WhatsApp Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={contactModal.coachPhone}
                  onChange={(e) =>
                    setContactModal((prev) =>
                      prev ? { ...prev, coachPhone: e.target.value } : null
                    )
                  }
                  className="w-full rounded-xl border border-white/20 bg-[#120402] px-3.5 py-2 text-xs font-mono text-white placeholder-gray-600 focus:border-gym-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => setContactModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContactModal}
                disabled={isSavingContact}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gym-primary text-white font-bold text-xs uppercase hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-50"
              >
                {isSavingContact ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save Contact</span>
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
