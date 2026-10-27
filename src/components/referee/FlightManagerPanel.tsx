"use client";

import React, { useState, useTransition, useCallback, useEffect } from "react";
import {
  assignLotNumbersAction,
  reshuffleLotNumbersAction,
  getFlightManagerDataAction,
  setManualLotNumberAction,
  getLiftingOrderAction,
  type FlightManagerData,
  type FlightGroup,
  type LiftingOrderEntry,
} from "@/actions/flight-manager.actions";
import {
  Shuffle,
  Layers,
  Users,
  Trophy,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  BarChart3,
  Hash,
  Dumbbell,
  Scale,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  ExternalLink,
} from "lucide-react";

interface FlightManagerPanelProps {
  initialData: FlightManagerData;
  eventId: string;
}

type ActiveView = "flights" | "liftingOrder";

export function FlightManagerPanel({ initialData, eventId }: FlightManagerPanelProps) {
  const [data, setData] = useState<FlightManagerData>(initialData);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [expandedFlight, setExpandedFlight] = useState<string | null>("A");
  const [activeView, setActiveView] = useState<ActiveView>("flights");
  const [liftingOrder, setLiftingOrder] = useState<LiftingOrderEntry[]>([]);
  const [orderDiscipline, setOrderDiscipline] = useState<"squat" | "bench" | "deadlift">("squat");
  const [orderAttempt, setOrderAttempt] = useState<1 | 2 | 3>(1);
  const [orderFlight, setOrderFlight] = useState<string>("A");
  const [editingLot, setEditingLot] = useState<{ userId: string; value: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshData = useCallback(() => {
    startTransition(async () => {
      const res = await getFlightManagerDataAction(eventId);
      if (res.success && res.data) setData(res.data);
    });
  }, [eventId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleAssignLots = () => {
    startTransition(async () => {
      const res = await assignLotNumbersAction(eventId);
      if (res.success) {
        showToast("success", res.message || "Lot numbers assigned!");
        refreshData();
      } else {
        showToast("error", res.error || "Failed to assign lots.");
      }
    });
  };

  const handleReshuffle = () => {
    startTransition(async () => {
      const res = await reshuffleLotNumbersAction(eventId);
      if (res.success) {
        showToast("success", "🔀 Lots reshuffled via new random draw.");
        refreshData();
      } else {
        showToast("error", res.error || "Reshuffle failed.");
      }
    });
  };

  const handleSetLot = async (userId: string, lotStr: string) => {
    const lot = parseInt(lotStr);
    if (isNaN(lot) || lot < 1) return;
    startTransition(async () => {
      const res = await setManualLotNumberAction(userId, eventId, lot);
      if (res.success) {
        showToast("success", res.message || "Lot updated.");
        setEditingLot(null);
        refreshData();
      } else {
        showToast("error", res.error || "Failed to update lot.");
      }
    });
  };

  const handleLoadLiftingOrder = () => {
    startTransition(async () => {
      const res = await getLiftingOrderAction(eventId, orderDiscipline, orderAttempt, orderFlight);
      if (res.success && res.order) {
        setLiftingOrder(res.order);
        setActiveView("liftingOrder");
      } else {
        showToast("error", res.error || "Failed to generate lifting order.");
      }
    });
  };

  const flightColors: Record<string, string> = {
    A: "from-red-500/20 to-red-900/10 border-red-500/30",
    B: "from-blue-500/20 to-blue-900/10 border-blue-500/30",
    C: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30",
    D: "from-purple-500/20 to-purple-900/10 border-purple-500/30",
    E: "from-amber-500/20 to-amber-900/10 border-amber-500/30",
    F: "from-cyan-500/20 to-cyan-900/10 border-cyan-500/30",
  };

  const flightAccents: Record<string, string> = {
    A: "text-red-400 bg-red-500/20 border-red-500/40",
    B: "text-blue-400 bg-blue-500/20 border-blue-500/40",
    C: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40",
    D: "text-purple-400 bg-purple-500/20 border-purple-500/40",
    E: "text-amber-400 bg-amber-500/20 border-amber-500/40",
    F: "text-cyan-400 bg-cyan-500/20 border-cyan-500/40",
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl border text-sm font-semibold transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-500/40 text-emerald-300"
              : "bg-red-950 border-red-500/40 text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-gym-primary" />
            IPF Flight Manager
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {data.totalLifters} lifters · {data.totalFlights} flights · Max {14}/flight
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refreshData}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 transition-all hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {data.isLotAssigned ? (
            <button
              onClick={handleReshuffle}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-2 text-xs font-bold text-amber-400 transition-all hover:bg-amber-950/60 disabled:opacity-50"
            >
              <Shuffle className="h-3.5 w-3.5" />
              Reshuffle Lots
            </button>
          ) : (
            <button
              onClick={handleAssignLots}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl border border-gym-primary/40 bg-gym-primary/10 px-5 py-2 text-xs font-bold text-gym-primary transition-all hover:bg-gym-primary/20 disabled:opacity-50"
            >
              <Shuffle className="h-4 w-4" />
              Run Lot Draw
            </button>
          )}

          <a
            href="/admin/flights"
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/30 px-3.5 py-2 text-xs font-bold text-purple-300 transition-all hover:bg-purple-900/40"
            title="Open Master IPF Flight Control Room"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Master Flight Suite
          </a>
        </div>
      </div>

      {/* Stats Bar */}
      {data.totalLifters > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Lifters", value: data.totalLifters, icon: Users, color: "text-gym-primary" },
            { label: "Total Flights", value: data.totalFlights, icon: Layers, color: "text-blue-400" },
            { label: "Max Per Flight", value: 14, icon: ClipboardList, color: "text-purple-400" },
            {
              label: "Lots Assigned",
              value: data.isLotAssigned ? "✅ Yes" : "⏳ Pending",
              icon: Hash,
              color: data.isLotAssigned ? "text-emerald-400" : "text-amber-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
            >
              <stat.icon className={`mx-auto h-5 w-5 ${stat.color} mb-1`} />
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {(["flights", "liftingOrder"] as ActiveView[]).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
              activeView === view
                ? "border-gym-primary text-gym-primary"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {view === "flights" ? "✈️ Flights" : "📋 Lifting Order"}
          </button>
        ))}
      </div>

      {/* FLIGHTS VIEW */}
      {activeView === "flights" && (
        <div className="space-y-4">
          {data.flights.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 py-16">
              <Layers className="h-12 w-12 text-gray-600" />
              <div className="text-center">
                <p className="text-base font-bold text-gray-400">No flights configured yet</p>
                <p className="text-sm text-gray-600 mt-1">
                  Run the lot draw to assign lifters to flights automatically.
                </p>
              </div>
              <button
                onClick={handleAssignLots}
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-gym-primary px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-gym-primary/90 disabled:opacity-50"
              >
                <Shuffle className="h-4 w-4" />
                Run Official Lot Draw
              </button>
            </div>
          ) : (
            data.flights.map((flight) => {
              const isExpanded = expandedFlight === flight.label;
              const colorClass = flightColors[flight.label] || flightColors["A"];
              const accentClass = flightAccents[flight.label] || flightAccents["A"];

              return (
                <div
                  key={flight.label}
                  className={`overflow-hidden rounded-3xl border bg-gradient-to-br ${colorClass} shadow-lg`}
                >
                  {/* Flight Header */}
                  <button
                    onClick={() => setExpandedFlight(isExpanded ? null : flight.label)}
                    className="flex w-full items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border font-bold text-xl ${accentClass}`}
                      >
                        {flight.label}
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">
                          Flight {flight.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {flight.lifters.length} lifters · Lots #{flight.lifters[0]?.lotNumber ?? "?"}
                          –#{flight.lifters[flight.lifters.length - 1]?.lotNumber ?? "?"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold text-gray-300">
                        <Users className="h-3 w-3" />
                        {flight.lifters.length}/{14}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Flight Lifters Table */}
                  {isExpanded && (
                    <div className="border-t border-white/10">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-black/30">
                              {["Lift #", "Lot #", "Lifter", "Weight Class", "BW", "Squat", "Bench", "Deadlift"].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-gray-500"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {flight.lifters.map((lifter, idx) => (
                              <tr
                                key={lifter.userId}
                                className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                                  idx % 2 === 0 ? "bg-black/10" : ""
                                }`}
                              >
                                <td className="px-4 py-3 font-bold text-gray-300">
                                  {lifter.liftingOrder}
                                </td>
                                <td className="px-4 py-3">
                                  {editingLot?.userId === lifter.userId ? (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min={1}
                                        max={999}
                                        value={editingLot.value}
                                        onChange={(e) =>
                                          setEditingLot({ ...editingLot, value: e.target.value })
                                        }
                                        className="w-16 rounded-lg border border-white/20 bg-black/60 px-2 py-1 text-center text-white outline-none focus:border-gym-primary"
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => handleSetLot(lifter.userId, editingLot.value)}
                                        disabled={isPending}
                                        className="text-emerald-400 hover:text-emerald-300"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        setEditingLot({
                                          userId: lifter.userId,
                                          value: String(lifter.lotNumber),
                                        })
                                      }
                                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 font-bold text-white hover:border-gym-primary/50 hover:text-gym-primary transition-colors"
                                    >
                                      <Hash className="h-3 w-3" />
                                      {lifter.lotNumber}
                                    </button>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-white">{lifter.name}</div>
                                  <div className="text-gray-500">{lifter.gender}</div>
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-300">
                                  {lifter.weightClass}
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-300">
                                  {lifter.bodyweight.toFixed(1)} kg
                                </td>
                                <td className="px-4 py-3 text-blue-400 font-semibold">
                                  {lifter.squat1Declared} kg
                                </td>
                                <td className="px-4 py-3 text-purple-400 font-semibold">
                                  {lifter.bench1Declared} kg
                                </td>
                                <td className="px-4 py-3 text-amber-400 font-semibold">
                                  {lifter.deadlift1Declared} kg
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* LIFTING ORDER VIEW */}
      {activeView === "liftingOrder" && (
        <div className="space-y-5">
          {/* Controls */}
          <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                Flight
              </label>
              <select
                value={orderFlight}
                onChange={(e) => setOrderFlight(e.target.value)}
                className="rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-gym-primary"
              >
                {data.flights.map((f) => (
                  <option key={f.label} value={f.label}>
                    Flight {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                Discipline
              </label>
              <select
                value={orderDiscipline}
                onChange={(e) => setOrderDiscipline(e.target.value as any)}
                className="rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-gym-primary"
              >
                <option value="squat">Squat</option>
                <option value="bench">Bench Press</option>
                <option value="deadlift">Deadlift</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                Round
              </label>
              <select
                value={orderAttempt}
                onChange={(e) => setOrderAttempt(Number(e.target.value) as 1 | 2 | 3)}
                className="rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-gym-primary"
              >
                <option value={1}>Attempt 1</option>
                <option value={2}>Attempt 2</option>
                <option value={3}>Attempt 3</option>
              </select>
            </div>

            <button
              onClick={handleLoadLiftingOrder}
              disabled={isPending || data.flights.length === 0}
              className="flex items-center gap-2 rounded-xl border border-gym-primary/40 bg-gym-primary/10 px-5 py-2.5 text-sm font-bold text-gym-primary transition-all hover:bg-gym-primary/20 disabled:opacity-50"
            >
              <ArrowUpDown className="h-4 w-4" />
              Generate Order
            </button>
          </div>

          {/* Lifting Order Table */}
          {liftingOrder.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-gym-primary" />
                  Flight {orderFlight} · {orderDiscipline.toUpperCase()} · Attempt {orderAttempt}
                </h4>
                <span className="text-xs text-gray-400">Sorted: lowest weight → lot #</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/30">
                      {["Position", "Lot #", "Lifter", "Weight Class", "BW (kg)", "Declared (kg)"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {liftingOrder.map((entry, idx) => (
                      <tr
                        key={entry.userId || entry.registrationId || `${entry.lotNumber}-${entry.name}-${idx}`}
                        className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                          idx === 0 ? "bg-gym-primary/5" : idx % 2 === 0 ? "bg-black/10" : ""
                        }`}
                      >
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              idx === 0
                                ? "bg-gym-primary text-black"
                                : "bg-white/10 text-gray-300"
                            }`}
                          >
                            {entry.liftingPosition}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-bold text-gray-400">
                          #{entry.lotNumber}
                        </td>
                        <td className="px-5 py-3 font-semibold text-white">
                          {entry.name}
                        </td>
                        <td className="px-5 py-3 text-gray-400">{entry.weightClass}</td>
                        <td className="px-5 py-3 text-gray-400">
                          {entry.bodyweight.toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-bold text-gym-primary">
                            {entry.declaredWeight} kg
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 py-12">
              <ArrowUpDown className="h-10 w-10 text-gray-600" />
              <p className="text-sm font-semibold text-gray-400">
                Select a flight, discipline &amp; round, then click Generate Order.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
