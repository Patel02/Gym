"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Radio,
  Trophy,
  ArrowRight,
  Zap,
  ShieldCheck,
  ChevronRight,
  Flame,
  Users,
  Award,
} from "lucide-react";

export interface TickerMeet {
  id: string;
  title: string;
  dates: string;
  city?: string;
  venue?: string;
  status: string;
  entryFee?: string;
  sanction?: string;
}

interface LiveMeetCountdownTickerProps {
  initialEvents?: TickerMeet[];
}

export function LiveMeetCountdownTicker({ initialEvents = [] }: LiveMeetCountdownTickerProps) {
  // Parse upcoming events or fallback to next official championship
  const upcomingMeets: TickerMeet[] = useMemo(() => {
    if (initialEvents && initialEvents.length > 0) {
      return initialEvents;
    }
    return [
      {
        id: "meet-gujarat-state-2026",
        title: "Gujarat State Powerlifting Championship & National Trials 2026",
        dates: "15-18 Oct 2026",
        city: "Ahmedabad, Gujarat",
        venue: "Sardar Patel Indoor Sports Complex",
        status: "REGISTRATION OPEN",
        entryFee: "₹1,500",
        sanction: "WPI & IPF Affiliated",
      },
      {
        id: "meet-west-zone-2026",
        title: "All India West Zone Raw & Equipped Bench Press Trophy 2026",
        dates: "08-11 Nov 2026",
        city: "Surat, Gujarat",
        venue: "Veer Narmad Indoor Arena",
        status: "UPCOMING",
        entryFee: "₹1,800",
        sanction: "National Sanction #2026-WZ-04",
      },
    ];
  }, [initialEvents]);

  const [selectedMeetIndex, setSelectedMeetIndex] = useState(0);
  const activeMeet = upcomingMeets[selectedMeetIndex] || upcomingMeets[0];

  // Target date for countdown (defaulting to next championship date)
  const targetDate = useMemo(() => {
    // Try to extract date from activeMeet.dates string
    const dateStr = activeMeet?.dates || "15 Oct 2026";
    // Check if dates contains a year like 2026
    const match = dateStr.match(/(\d{1,2})[-–]?\d{0,2}\s+([A-Za-z]+)\s+(\d{4})/);
    if (match) {
      const parsed = new Date(`${match[2]} ${match[1]}, ${match[3]} 09:00:00 GMT+0530`);
      if (!isNaN(parsed.getTime()) && parsed > new Date()) return parsed;
    }
    // Default to future date (e.g. 21 days from now)
    return new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
  }, [activeMeet]);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isLiveNow =
    activeMeet?.status?.toUpperCase().includes("LIVE") ||
    activeMeet?.status?.toUpperCase().includes("IN PROGRESS");

  return (
    <div className="w-full bg-gradient-to-b from-black via-zinc-950 to-gym-black border-y border-white/10 relative z-30 shadow-2xl">
      {/* Background Subtle Accent Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gym-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left: Meet Info & Status Badge */}
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              {isLiveNow ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/20 border border-red-500/50 px-3 py-1 text-xs font-black uppercase tracking-widest text-red-400 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                  Live Match Day Arena Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Flame className="h-3.5 w-3.5 fill-current text-amber-400" />
                  Official Gujarat State Championship
                </span>
              )}

              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                {activeMeet.sanction || "WPI & IPF Affiliated"}
              </span>

              {upcomingMeets.length > 1 && (
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5 text-[10px]">
                  {upcomingMeets.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMeetIndex(idx)}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        selectedMeetIndex === idx
                          ? "bg-gym-primary text-black shadow-sm"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Meet {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <h3 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span>{activeMeet.title}</span>
            </h3>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-gray-300">
              <span className="flex items-center gap-1.5 text-gym-primary font-semibold">
                <Calendar className="h-4 w-4" />
                {activeMeet.dates}
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <MapPin className="h-4 w-4 text-gray-500" />
                {activeMeet.venue ? `${activeMeet.venue}, ${activeMeet.city}` : activeMeet.city || "Gujarat Sports Arena"}
              </span>
              {activeMeet.entryFee && (
                <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-mono font-bold">
                  Fee: {activeMeet.entryFee}
                </span>
              )}
            </div>
          </div>

          {/* Center/Right: Live Countdown Ticker Blocks */}
          <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
            {!isLiveNow ? (
              <div className="flex items-center gap-2">
                {[
                  { label: "DAYS", value: timeLeft.days },
                  { label: "HOURS", value: timeLeft.hours },
                  { label: "MINS", value: timeLeft.minutes },
                  { label: "SECS", value: timeLeft.seconds },
                ].map((block, i) => (
                  <div
                    key={block.label}
                    className="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 to-black/60 px-3 sm:px-4 py-2 min-w-[56px] sm:min-w-[64px] shadow-lg backdrop-blur-md"
                  >
                    <span className="font-heading text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                      {isClient ? String(block.value).padStart(2, "0") : "--"}
                    </span>
                    <span className="text-[9px] font-bold tracking-widest text-gym-primary/80 uppercase">
                      {block.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-950/40 p-3.5 backdrop-blur-md">
                <Radio className="h-6 w-6 text-red-500 animate-pulse" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-red-300">
                    Live Platform 1 &amp; 2 Active
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Squat, Bench &amp; Deadlift Live Scoring
                  </div>
                </div>
              </div>
            )}

            {/* Quick Action CTAs */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isLiveNow ? (
                <Link
                  href="/live"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all hover:bg-red-500 hover:scale-105 active:scale-95"
                >
                  <Radio className="h-4 w-4" />
                  Watch Live Arena
                </Link>
              ) : (
                <Link
                  href="/championships"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(230,80,27,0.6)]"
                >
                  <Trophy className="h-4 w-4" />
                  Enter Meet
                </Link>
              )}

              <Link
                href="/live"
                className="flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-200 transition-all hover:bg-white/10 hover:border-white/40"
                title="View Match Day Arena"
              >
                <span>Live Arena</span>
                <ChevronRight className="h-4 w-4 ml-0.5 text-gym-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
