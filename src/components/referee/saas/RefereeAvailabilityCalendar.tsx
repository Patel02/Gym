"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Save,
  Share2,
} from "lucide-react";

type AvailabilityStatus = "AVAILABLE" | "UNAVAILABLE" | "PARTIAL";

interface DayData {
  day: number;
  status: AvailabilityStatus;
  notes?: string;
}

export function RefereeAvailabilityCalendar() {
  const currentMonth = "October 2026";
  const [selectedDay, setSelectedDay] = useState<number>(5);

  // Initial demo schedule for current month
  const [days, setDays] = useState<Record<number, AvailabilityStatus>>({
    1: "AVAILABLE",
    2: "AVAILABLE",
    3: "AVAILABLE",
    4: "AVAILABLE",
    5: "AVAILABLE", // Today (Active State Meet)
    6: "AVAILABLE",
    7: "UNAVAILABLE",
    8: "UNAVAILABLE",
    10: "PARTIAL",
    11: "AVAILABLE",
    12: "AVAILABLE",
    17: "AVAILABLE",
    18: "AVAILABLE",
    24: "AVAILABLE",
    25: "PARTIAL",
    31: "AVAILABLE",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleDayStatus = (dayNum: number) => {
    setDays((prev) => {
      const current = prev[dayNum] || "AVAILABLE";
      let next: AvailabilityStatus = "AVAILABLE";
      if (current === "AVAILABLE") next = "PARTIAL";
      else if (current === "PARTIAL") next = "UNAVAILABLE";
      else next = "AVAILABLE";

      return { ...prev, [dayNum]: next };
    });
    setSelectedDay(dayNum);
    setSavedSuccess(false);
  };

  const setStatusExplicitly = (status: AvailabilityStatus) => {
    setDays((prev) => ({ ...prev, [selectedDay]: status }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const availableCount = Object.values(days).filter((s) => s === "AVAILABLE").length;
  const partialCount = Object.values(days).filter((s) => s === "PARTIAL").length;
  const unavailableCount = Object.values(days).filter((s) => s === "UNAVAILABLE").length;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#130a05] to-[#080201] p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gym-primary/20 text-gym-primary">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gym-primary">
              Roster &amp; Scheduling • Phase 2
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            Official Technical Referee Availability Roster
          </h2>
          <p className="text-xs text-zinc-400">
            Keep your monthly judging calendar updated so meet directors can assign you to state platforms.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Available ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Partial / Evening ({partialCount})</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span>Unavailable ({unavailableCount})</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
              {currentMonth}
            </h3>
            <div className="text-xs text-zinc-400">Click any day to toggle availability</div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-zinc-500">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* 31-day Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset for Thursday Oct 1 start */}
            <div className="h-12 sm:h-14 rounded-xl border border-transparent bg-transparent" />
            <div className="h-12 sm:h-14 rounded-xl border border-transparent bg-transparent" />
            <div className="h-12 sm:h-14 rounded-xl border border-transparent bg-transparent" />
            <div className="h-12 sm:h-14 rounded-xl border border-transparent bg-transparent" />

            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const status = days[day] || "AVAILABLE";
              const isSelected = selectedDay === day;
              const isToday = day === 5;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDayStatus(day)}
                  className={`h-12 sm:h-14 rounded-xl border p-1.5 flex flex-col justify-between transition-all ${
                    isSelected
                      ? "ring-2 ring-gym-primary shadow-lg"
                      : "hover:scale-[1.03]"
                  } ${
                    status === "AVAILABLE"
                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                      : status === "PARTIAL"
                      ? "border-amber-500/30 bg-amber-950/20 text-amber-300"
                      : "border-red-500/30 bg-red-950/20 text-red-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isToday ? "text-gym-primary underline" : "text-white"}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="h-1.5 w-1.5 rounded-full bg-gym-primary animate-ping" />
                    )}
                  </div>
                  <div className="flex items-center justify-end w-full">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === "AVAILABLE"
                          ? "bg-emerald-400"
                          : status === "PARTIAL"
                          ? "bg-amber-400"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Action Box */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
              Selected Date
            </div>
            <div className="font-heading text-2xl font-bold text-white">
              October {selectedDay}, 2026
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Current Status:{" "}
              <strong
                className={
                  days[selectedDay] === "AVAILABLE"
                    ? "text-emerald-400"
                    : days[selectedDay] === "PARTIAL"
                    ? "text-amber-400"
                    : "text-red-400"
                }
              >
                {days[selectedDay] || "AVAILABLE"}
              </strong>
            </div>

            <div className="mt-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
                Quick Set Status
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setStatusExplicitly("AVAILABLE")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    days[selectedDay] === "AVAILABLE"
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Full Day Available (All Flights)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusExplicitly("PARTIAL")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    days[selectedDay] === "PARTIAL"
                      ? "border-amber-500 bg-amber-500/20 text-amber-300"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Partial (Evening Flights Only)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusExplicitly("UNAVAILABLE")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    days[selectedDay] === "UNAVAILABLE"
                      ? "border-red-500 bg-red-500/20 text-red-300"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span>Unavailable / Off Duty</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2.5">
            {savedSuccess && (
              <div className="text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Roster Synced to Federation Secretary</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-red-600 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save &amp; Broadcast Availability</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
