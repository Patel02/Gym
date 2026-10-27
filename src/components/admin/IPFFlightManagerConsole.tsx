"use client";

import React, { useState, useTransition, useEffect } from "react";
import {
  Layers,
  Shuffle,
  Printer,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  Users,
  Dumbbell,
  Scale,
  Calendar,
  MapPin,
  ExternalLink,
  Phone,
  Copy,
  Check,
  Award,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Edit3,
  X,
  FileText,
  Clock,
  ArrowUpDown,
  Lock,
} from "lucide-react";
import {
  getFlightManagerDataAction,
  generateIPFFlightsAction,
  broadcastFlightWhatsAppAlertsAction,
  setManualLotNumberAction,
  lockRegistrationAndSortFlightsAction,
  seedDemoIPFRosterAction,
  clearDemoRosterAction,
  type FlightManagerData,
  type FlightGroup,
  type FlightLifter,
} from "@/actions/flight-manager.actions";

interface ManageableEvent {
  id: string;
  title: string;
  date: Date | string;
  location: string;
  status: string;
  maxAthletes: number;
  approvedCount: number;
  pendingCount: number;
}

interface IPFFlightManagerConsoleProps {
  initialEvents: ManageableEvent[];
  initialSelectedEventId?: string;
  initialFlightData?: FlightManagerData | null;
}

export default function IPFFlightManagerConsole({
  initialEvents,
  initialSelectedEventId,
  initialFlightData,
}: IPFFlightManagerConsoleProps) {
  const [events, setEvents] = useState<ManageableEvent[]>(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialSelectedEventId || (initialEvents[0]?.id ?? "")
  );

  const [flightData, setFlightData] = useState<FlightManagerData | null>(initialFlightData || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFlightFilter, setActiveFlightFilter] = useState<string>("ALL");

  // Modals & Popups
  const [showProofModal, setShowProofModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppAlerts, setWhatsAppAlerts] = useState<any[]>([]);
  const [selectedFlightForAlerts, setSelectedFlightForAlerts] = useState<string>("");

  // Manual Lot Edit
  const [editingLotLifter, setEditingLotLifter] = useState<FlightLifter | null>(null);
  const [newLotInput, setNewLotInput] = useState<string>("");

  // Notification Toast
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const showNotification = (type: "success" | "error" | "info", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  };

  // Load event flight data when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) return;

    let isMounted = true;
    setIsLoading(true);

    getFlightManagerDataAction(selectedEventId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setFlightData(res.data);
        } else {
          setFlightData(null);
        }
      })
      .catch((err) => {
        console.error("Failed to load flight data:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Trigger Automatic IPF Flight Sorting & CSPRNG Lot Draw
  const handleGenerateFlights = (reshuffle: boolean = false) => {
    if (!selectedEventId) return;

    startTransition(async () => {
      try {
        const res = await generateIPFFlightsAction(selectedEventId, { reshuffleLots: reshuffle });
        if (res.success) {
          showNotification("success", res.message || "IPF Flights and Lot numbers generated!");
          // Refresh flight data
          const freshData = await getFlightManagerDataAction(selectedEventId);
          if (freshData.success && freshData.data) {
            setFlightData(freshData.data);
          }
        } else {
          showNotification("error", res.error || "Failed to generate flights.");
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Error running flight engine.");
      }
    });
  };

  // Handle Manual Lot Number Edit
  const handleSaveManualLot = () => {
    if (!editingLotLifter || !selectedEventId) return;
    const lotNum = parseInt(newLotInput, 10);
    if (isNaN(lotNum) || lotNum < 1) {
      showNotification("error", "Lot number must be a valid positive integer.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await setManualLotNumberAction(editingLotLifter.userId, selectedEventId, lotNum);
        if (res.success) {
          showNotification("success", `Lot #${lotNum} assigned to ${editingLotLifter.name}.`);
          setEditingLotLifter(null);
          // Refresh data
          const freshData = await getFlightManagerDataAction(selectedEventId);
          if (freshData.success && freshData.data) {
            setFlightData(freshData.data);
          }
        } else {
          showNotification("error", res.error || "Failed to update lot.");
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Error updating lot.");
      }
    });
  };

  // Load WhatsApp Alerts for a Flight
  const handleOpenWhatsAppAlerts = async (flightLabel: string) => {
    if (!selectedEventId) return;
    setSelectedFlightForAlerts(flightLabel);
    setIsLoading(true);

    try {
      const res = await broadcastFlightWhatsAppAlertsAction(selectedEventId, flightLabel);
      if (res.success && res.alerts) {
        setWhatsAppAlerts(res.alerts);
        setShowWhatsAppModal(true);
      } else {
        showNotification("error", res.error || "Failed to generate alerts for flight.");
      }
    } catch (err: any) {
      showNotification("error", err?.message || "Error preparing alerts.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyProofHashToClipboard = () => {
    if (!flightData?.proofHash) return;
    navigator.clipboard.writeText(flightData.proofHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 3000);
  };

  const handleLockRegistration = () => {
    if (!selectedEventId) return;
    if (!confirm("Are you sure you want to close registration and officially lock all IPF Flights for this championship?")) return;

    startTransition(async () => {
      try {
        const res = await lockRegistrationAndSortFlightsAction(selectedEventId);
        if (res.success) {
          showNotification("success", res.message || "Registrations locked & flights finalized!");
          const freshData = await getFlightManagerDataAction(selectedEventId);
          if (freshData.success && freshData.data) {
            setFlightData(freshData.data);
          }
        } else {
          showNotification("error", res.error || "Failed to lock registrations.");
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Error locking registrations.");
      }
    });
  };

  const handleSeedDemoRoster = () => {
    if (!selectedEventId) return;
    startTransition(async () => {
      try {
        const res = await seedDemoIPFRosterAction(selectedEventId);
        if (res.success) {
          showNotification("success", res.message || "26 IPF demo competitors seeded and sorted!");
          const freshData = await getFlightManagerDataAction(selectedEventId);
          if (freshData.success && freshData.data) {
            setFlightData(freshData.data);
          }
        } else {
          showNotification("error", res.error || "Failed to seed demo lifters.");
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Error seeding demo roster.");
      }
    });
  };

  const handleClearDemoRoster = () => {
    if (!selectedEventId) return;
    startTransition(async () => {
      try {
        const res = await clearDemoRosterAction(selectedEventId);
        if (res.success) {
          showNotification("info", res.message || "Demo lifters removed.");
          const freshData = await getFlightManagerDataAction(selectedEventId);
          if (freshData.success && freshData.data) {
            setFlightData(freshData.data);
          }
        } else {
          showNotification("error", res.error || "Failed to clear demo roster.");
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Error clearing demo roster.");
      }
    });
  };

  // Filter flights & lifters
  const displayedFlights = (flightData?.flights || []).filter((f) => {
    if (activeFlightFilter === "ALL") return true;
    return f.label === activeFlightFilter || f.fullLabel === activeFlightFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : toast.type === "error"
              ? "bg-red-950/90 border-red-500/40 text-red-300"
              : "bg-cyan-950/90 border-cyan-500/40 text-cyan-300"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === "error" && <AlertTriangle className="w-4 h-4 text-red-400" />}
          {toast.type === "info" && <Sparkles className="w-4 h-4 text-cyan-400" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* ── TOP EVENT SELECTOR & HEADER BAR ── */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#14081c] via-[#09030e] to-black p-6 shadow-2xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-300 shadow-sm">
              <Layers className="h-3.5 w-3.5" />
              <span>IPF Technical Rulebook Compliant</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
              Flight & Lot-Number <span className="text-purple-400">Sorting Engine</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Automated grouping by Gender, Division, and Weight Class with maximum 14 lifters per flight.
              Provably fair CSPRNG lot draws with SHA-256 tamper-proof proof hashes.
            </p>
          </div>

          {/* Event Picker Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Calendar className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full sm:w-72 bg-black/80 border border-white/15 rounded-2xl pl-10 pr-8 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500 appearance-none shadow-inner cursor-pointer"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id} className="bg-zinc-900 text-white">
                    {ev.title} ({ev.approvedCount} Lifters)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => handleGenerateFlights(false)}
              disabled={isPending || isLoading || !selectedEventId}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isPending ? "Sorting Flights..." : "Auto-Sort Flights & Lots"}</span>
            </button>
          </div>
        </div>

        {/* Selected Event Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Total Approved Lifters
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {flightData?.totalLifters ?? selectedEvent?.approvedCount ?? 0}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Verified competitors</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Generated Flights
            </div>
            <div className="text-2xl font-black text-purple-300 mt-1">
              {flightData?.totalFlights ?? 0} Flights
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Max 14 lifters each</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Lot Allocation Status
            </div>
            <div className="text-sm font-bold text-emerald-300 mt-1 flex items-center gap-1.5">
              {flightData?.isLotAssigned ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>CSPRNG Allotted</span>
                </>
              ) : (
                <span className="text-amber-400">Pending Draw</span>
              )}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Fisher-Yates verified</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Fairness Certificate
            </div>
            {flightData?.proofHash ? (
              <button
                onClick={() => setShowProofModal(true)}
                className="mt-1 inline-flex items-center gap-1 text-xs font-mono text-cyan-300 hover:text-white underline text-left truncate"
                title="View Cryptographic Certificate"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{flightData.proofHash.slice(0, 14)}...</span>
              </button>
            ) : (
              <span className="text-xs text-zinc-500 italic mt-1">Draw not run yet</span>
            )}
            <div className="text-[10px] text-zinc-500">SHA-256 Immutable Proof</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Deadline & Status
            </div>
            <div className="text-xs font-bold mt-1 flex items-center gap-1.5">
              {flightData?.eventStatus === "REGISTRATION CLOSED" ? (
                <span className="text-red-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Closed & Locked
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Open For Entries
                </span>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
              Auto-locks on deadline
            </div>
          </div>
        </div>

        {/* Master Toolbar */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleGenerateFlights(true)}
              disabled={isPending || isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm"
              title="Re-run random lot draw"
            >
              <Shuffle className="w-3.5 h-3.5 text-purple-400" />
              <span>Reshuffle Lots</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              disabled={!flightData || flightData.flights.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-all shadow-sm disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print Official Weigh-In Sheet</span>
            </button>

            <button
              onClick={handleLockRegistration}
              disabled={isPending || isLoading || flightData?.eventStatus === "REGISTRATION CLOSED"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-all shadow-sm disabled:opacity-50"
              title="Close registration deadline and lock flights"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{flightData?.eventStatus === "REGISTRATION CLOSED" ? "Flights Locked" : "Lock & Finalize Flights"}</span>
            </button>

            <button
              onClick={handleSeedDemoRoster}
              disabled={isPending || isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-semibold text-purple-300 transition-all shadow-sm"
              title="Seed 26 realistic IPF powerlifters to test flight splitting and lot generation"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Demo Roster (26 Lifters)</span>
            </button>

            {(flightData?.flights || []).some((f) => f.lifters.some((l) => l.email?.includes("demo.lifter"))) && (
              <button
                onClick={handleClearDemoRoster}
                disabled={isPending || isLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300 transition-all shadow-sm"
                title="Remove seeded demo lifters"
              >
                <RotateCw className="w-3.5 h-3.5 text-red-400" />
                <span>Clear Demo</span>
              </button>
            )}

            {flightData?.proofHash && (
              <button
                onClick={() => setShowProofModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition-all shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verify SHA-256 Proof</span>
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lifter, lot, weight..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* ── FLIGHT FILTER TABS ── */}
      {flightData && flightData.flights.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          <button
            onClick={() => setActiveFlightFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
              activeFlightFilter === "ALL"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            All Flights ({flightData.totalLifters} Lifters)
          </button>

          {flightData.flights.map((flight) => (
            <button
              key={flight.fullLabel || flight.label}
              onClick={() => setActiveFlightFilter(flight.label)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap flex items-center gap-2 ${
                activeFlightFilter === flight.label
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{flight.fullLabel || `Flight ${flight.label}`}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-purple-300 font-mono">
                {flight.lifters.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── FLIGHT CARDS & LIFTER ROSTERS ── */}
      {!flightData || flightData.flights.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-black/60 p-12 text-center text-zinc-500">
          <Layers className="w-12 h-12 text-zinc-600 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-white mb-1">No Flights Generated Yet</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mb-5">
            Click &quot;Auto-Sort Flights & Lots&quot; above to organize all approved competitors into IPF-compliant
            flights of maximum 14 lifters by weight class and nominated openers.
          </p>
          <button
            onClick={() => handleGenerateFlights(false)}
            disabled={isPending || !selectedEventId}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase transition-all shadow-lg shadow-purple-900/30"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Flights Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedFlights.map((flight) => {
            const filteredLifters = flight.lifters.filter((l) => {
              const q = searchQuery.toLowerCase().trim();
              if (!q) return true;
              return (
                l.name.toLowerCase().includes(q) ||
                l.weightClass.toLowerCase().includes(q) ||
                String(l.lotNumber).includes(q) ||
                (l.email && l.email.toLowerCase().includes(q))
              );
            });

            return (
              <div
                key={flight.fullLabel || flight.label}
                className="rounded-3xl border border-white/10 bg-[#0d0413]/90 overflow-hidden shadow-2xl"
              >
                {/* Flight Header */}
                <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/40 text-purple-300 font-heading font-black text-xl shadow-inner">
                      {flight.label}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading text-lg font-bold uppercase text-white">
                          {flight.fullLabel || `Flight ${flight.label}`}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {flight.lifters.length} Lifters (Max 14)
                        </span>
                        {flight.gender && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white/5 text-zinc-300">
                            {flight.gender} {flight.equipment || "RAW"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Categories: <span className="text-purple-300 font-semibold">{flight.weightClassesSummary || "Open"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions for this flight */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenWhatsAppAlerts(flight.label)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-all shadow-sm"
                      title="Send WhatsApp alert to all lifters in this flight"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Flight Alert</span>
                    </button>
                  </div>
                </div>

                {/* Lifters Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/60 border-b border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">Order</th>
                        <th className="py-3 px-4 w-16 text-center">Lot #</th>
                        <th className="py-3 px-4">Lifter Identity</th>
                        <th className="py-3 px-4">Weight Category</th>
                        <th className="py-3 px-4">Bodyweight</th>
                        <th className="py-3 px-4">Projected Opener / Total</th>
                        <th className="py-3 px-4">WhatsApp Direct</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {filteredLifters.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-zinc-500 font-mono text-xs">
                            No lifters matching filter.
                          </td>
                        </tr>
                      ) : (
                        filteredLifters.map((lifter, idx) => {
                          const cleanPhone = lifter.phone ? lifter.phone.replace(/[^0-9]/g, "") : "";
                          const waText = encodeURIComponent(
                            `Hi ${lifter.name}, your assigned flight is ${flight.fullLabel || flight.label} with Lot #${lifter.lotNumber} at ${flightData.eventTitle}.`
                          );

                          return (
                            <tr key={lifter.userId} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 text-center font-mono font-bold text-zinc-500">
                                {lifter.liftingOrder || idx + 1}
                              </td>

                              <td className="py-3 px-4 text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-extrabold text-xs border border-purple-500/30">
                                  #{lifter.lotNumber}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-bold text-white">{lifter.name}</div>
                                <div className="text-[11px] text-zinc-500 font-mono">{lifter.email}</div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="inline-block px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 font-mono font-bold text-[11px] border border-cyan-500/30">
                                  {lifter.weightClass}
                                </span>
                              </td>

                              <td className="py-3 px-4 font-mono text-zinc-300">
                                {lifter.bodyweight ? `${lifter.bodyweight.toFixed(1)} KG` : "—"}
                              </td>

                              <td className="py-3 px-4 font-mono">
                                <span className="text-zinc-200 font-semibold">
                                  {lifter.projectedTotal ? `${lifter.projectedTotal} KG` : "—"}
                                </span>
                                <div className="text-[10px] text-zinc-500">
                                  Opener Est: SQ {lifter.squat1Declared} / BP {lifter.bench1Declared} / DL {lifter.deadlift1Declared}
                                </div>
                              </td>

                              <td className="py-3 px-4 font-mono">
                                {cleanPhone ? (
                                  <a
                                    href={`https://wa.me/${cleanPhone}?text=${waText}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all border border-emerald-500/30 text-[11px]"
                                    title="1-Click WhatsApp Direct Chat"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{lifter.phone}</span>
                                  </a>
                                ) : (
                                  <span className="text-zinc-600 text-[11px] italic">No phone</span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setEditingLotLifter(lifter);
                                    setNewLotInput(String(lifter.lotNumber));
                                  }}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                  title="Edit Lot Number manually"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
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
            );
          })}
        </div>
      )}

      {/* ── MODAL: CRYPTOGRAPHIC FAIRNESS PROOF ── */}
      {showProofModal && flightData?.proofHash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-950 border border-cyan-500/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Provably Fair Audit Certificate</h3>
                  <p className="text-xs text-zinc-400">CSPRNG Fisher-Yates with SHA-256 Proof</p>
                </div>
              </div>
              <button
                onClick={() => setShowProofModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-black border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-mono">Immutable Proof Hash:</span>
                  <button
                    onClick={copyProofHashToClipboard}
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-[11px] text-cyan-300 break-all">
                  {flightData.proofHash}
                </div>
              </div>

              <div className="space-y-1.5 text-zinc-400 text-[11px] leading-relaxed">
                <p>• <strong>Algorithm:</strong> CSPRNG Fisher-Yates Permutation over Node.js <code>crypto.randomBytes(32)</code>.</p>
                <p>• <strong>Fairness Guarantee:</strong> Every registered competitor has an exactly equal and unmanipulated probability of drawing any lot number 1..N.</p>
                <p>• <strong>Tamper-Proof Verification:</strong> The proof hash seals the event ID, timestamp, seed, and roster fingerprint. Any manual alteration invalidates the hash.</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowProofModal(false)}
                className="px-5 py-2 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MANUAL LOT NUMBER EDIT ── */}
      {editingLotLifter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-950 border border-purple-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Manual Lot Adjustment</h3>
                  <p className="text-xs text-zinc-400">{editingLotLifter.name} ({editingLotLifter.weightClass})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingLotLifter(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  New Lot Number <span className="text-purple-400">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={newLotInput}
                  onChange={(e) => setNewLotInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Ensure the lot number does not conflict with another athlete in this meet.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingLotLifter(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 text-xs font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManualLot}
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-900/30"
              >
                Save Lot Number
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: WHATSAPP FLIGHT BROADCAST ── */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-950 border border-emerald-500/30 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6 shadow-2xl relative text-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Flight {selectedFlightForAlerts} WhatsApp Broadcast Queue
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Pre-filled official 1-Click WhatsApp direct flight allotment alerts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
              {whatsAppAlerts.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-black border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{alt.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                        Lot #{alt.lotNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {alt.phone || "No phone configured"} • {alt.weightClass}
                    </div>
                  </div>

                  {alt.waUrl ? (
                    <a
                      href={alt.waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Send WhatsApp</span>
                    </a>
                  ) : (
                    <span className="text-zinc-500 italic text-[11px]">Cannot send</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="px-5 py-2 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: OFFICIAL WEIGH-IN SHEET (PRINT OPTIMIZED) ── */}
      {showPrintModal && flightData && (
        <div
          id="print-official-weighin-sheet-root"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto print:fixed print:inset-0 print:bg-white print:p-0 print:z-[99999] print:block print:overflow-visible"
        >
          <style>{`
            @media print {
              @page {
                size: A4 landscape;
                margin: 8mm;
              }
              body > *:not(#print-official-weighin-sheet-root) {
                display: none !important;
              }
              #print-official-weighin-sheet-root {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                padding: 0 !important;
              }
            }
          `}</style>
          <div className="bg-white text-black rounded-3xl w-full max-w-5xl p-8 shadow-2xl relative print:m-0 print:p-4 print:w-full print:max-w-none print:shadow-none print:rounded-none">
            {/* Modal Controls (Hidden in print) */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold">Print Official Weigh-In & Platform Sheet</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow"
                >
                  Print Document
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Print Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-4">
              <h2 className="text-xl font-black uppercase tracking-wider">
                WORLD POWERLIFTING INDIA (WPI GUJARAT)
              </h2>
              <h3 className="text-sm font-bold uppercase mt-0.5">{flightData.eventTitle}</h3>
              <p className="text-xs text-gray-600 mt-1">
                OFFICIAL WEIGH-IN CALLING & ATTEMPT ROSTER SHEET • ORDERED BY LOT NUMBER
              </p>
              <div className="text-[11px] font-mono mt-1 text-gray-500">
                Generated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} • Audit Hash: {flightData.proofHash?.slice(0, 16)}...
              </div>
            </div>

            {/* Tables for each flight */}
            {flightData.flights.map((fl) => (
              <div key={fl.fullLabel || fl.label} className="mb-6 page-break-inside-avoid">
                <div className="bg-gray-100 p-2 font-bold text-xs uppercase flex items-center justify-between border border-black mb-1">
                  <span>{fl.fullLabel || `Flight ${fl.label}`} ({fl.weightClassesSummary})</span>
                  <span>{fl.lifters.length} Lifters</span>
                </div>

                <table className="w-full text-left text-xs border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-200 text-[10px] font-bold uppercase border-b border-black">
                      <th className="p-1.5 border-r border-black text-center w-12">Lot #</th>
                      <th className="p-1.5 border-r border-black">Lifter Name</th>
                      <th className="p-1.5 border-r border-black w-20">Class</th>
                      <th className="p-1.5 border-r border-black w-24">Actual BW (kg)</th>
                      <th className="p-1.5 border-r border-black w-24">Squat 1 (kg)</th>
                      <th className="p-1.5 border-r border-black w-24">Bench 1 (kg)</th>
                      <th className="p-1.5 border-r border-black w-24">Deadlift 1 (kg)</th>
                      <th className="p-1.5 border-r border-black w-24">Rack SQ / BP</th>
                      <th className="p-1.5 text-center">Lifter Sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...fl.lifters].sort((a, b) => a.lotNumber - b.lotNumber).map((l) => (
                      <tr key={l.userId} className="border-b border-black/30">
                        <td className="p-1.5 border-r border-black text-center font-bold">
                          #{l.lotNumber}
                        </td>
                        <td className="p-1.5 border-r border-black font-semibold">{l.name}</td>
                        <td className="p-1.5 border-r border-black font-mono">{l.weightClass}</td>
                        <td className="p-1.5 border-r border-black font-mono">
                          {l.bodyweight ? `${l.bodyweight.toFixed(1)}` : ""}
                        </td>
                        <td className="p-1.5 border-r border-black font-mono">{l.squat1Declared}</td>
                        <td className="p-1.5 border-r border-black font-mono">{l.bench1Declared}</td>
                        <td className="p-1.5 border-r border-black font-mono">{l.deadlift1Declared}</td>
                        <td className="p-1.5 border-r border-black font-mono">____ / ____</td>
                        <td className="p-1.5 text-center">__________</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Signature Footer */}
            <div className="mt-8 pt-4 border-t border-black flex justify-between text-xs font-bold">
              <div>Chief Referee Signature: _______________________</div>
              <div>Technical Jury Marshal: _______________________</div>
              <div>Meet Director: _______________________</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
