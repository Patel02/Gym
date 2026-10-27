"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Award,
  Flame,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Star,
  Zap,
  CheckCircle2,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface SpotlightAthlete {
  id: string;
  name: string;
  category: "MEN_OPEN" | "WOMEN_OPEN" | "JUNIOR" | "MASTERS";
  categoryLabel: string;
  weightClass: string;
  gender: "MALE" | "FEMALE";
  club: string;
  state: string;
  squat: number;
  bench: number;
  deadlift: number;
  total: number;
  dots: number;
  recordsHeld?: string[];
  honors?: string[];
  image?: string | null;
  licenseNumber?: string;
  isNationalChampion?: boolean;
}

interface AthleteSpotlightProps {
  initialAthletes?: SpotlightAthlete[];
}

const DEFAULT_SPOTLIGHT_ATHLETES: SpotlightAthlete[] = [
  {
    id: "ath-rakesh-patel",
    name: "Patel Rakesh",
    category: "MEN_OPEN",
    categoryLabel: "Men Open",
    weightClass: "83 KG",
    gender: "MALE",
    club: "Baroda Barbell Club",
    state: "Gujarat",
    squat: 245,
    bench: 165,
    deadlift: 295,
    total: 705,
    dots: 97.59,
    recordsHeld: ["Gujarat State Deadlift Record: 295 KG", "Senior Men Total Record: 705 KG"],
    honors: ["National Selection Trials 2026 Gold", "Best Lifter WPI West Zone 2025"],
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    licenseNumber: "WPI-GJ-2026-0881",
    isNationalChampion: true,
  },
  {
    id: "ath-priya-sharma",
    name: "Priya Sharma",
    category: "WOMEN_OPEN",
    categoryLabel: "Women Open",
    weightClass: "63 KG",
    gender: "FEMALE",
    club: "Ahmedabad Iron Guild",
    state: "Gujarat",
    squat: 172.5,
    bench: 97.5,
    deadlift: 205,
    total: 475,
    dots: 95.84,
    recordsHeld: ["Gujarat Women Deadlift Record: 205 KG", "National 63KG Squat Bronze"],
    honors: ["All India Inter-State 2025 Silver", "Gujarat State Champion 2024 & 2025"],
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    licenseNumber: "WPI-GJ-2026-0422",
    isNationalChampion: true,
  },
  {
    id: "ath-amar-patel",
    name: "Patel Amar",
    category: "MEN_OPEN",
    categoryLabel: "Men Open",
    weightClass: "83 KG",
    gender: "MALE",
    club: "Surat Powerlifting Academy",
    state: "Gujarat",
    squat: 230,
    bench: 155,
    deadlift: 270,
    total: 655,
    dots: 90.67,
    recordsHeld: ["West Zone Silver Medalist", "State Sub-Junior Record Holder 2024"],
    honors: ["Gujarat State Senior Silver 2026", "National Youth Games Finalist"],
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    licenseNumber: "WPI-GJ-2026-0792",
    isNationalChampion: false,
  },
  {
    id: "ath-neha-joshi",
    name: "Neha Joshi",
    category: "WOMEN_OPEN",
    categoryLabel: "Women Open",
    weightClass: "57 KG",
    gender: "FEMALE",
    club: "Kutch Strength Sanctuary",
    state: "Gujarat",
    squat: 155,
    bench: 85,
    deadlift: 180,
    total: 420,
    dots: 92.4,
    recordsHeld: ["Gujarat Women 57KG Bench Record: 85 KG"],
    honors: ["Gujarat State Gold 2025", "IPF National Championship Finalist"],
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    licenseNumber: "WPI-GJ-2026-0315",
    isNationalChampion: false,
  },
  {
    id: "ath-aryan-mehta",
    name: "Aryan Mehta",
    category: "JUNIOR",
    categoryLabel: "Junior (U-23)",
    weightClass: "74 KG",
    gender: "MALE",
    club: "Rajkot Barbell Foundry",
    state: "Gujarat",
    squat: 215,
    bench: 140,
    deadlift: 255,
    total: 610,
    dots: 88.9,
    recordsHeld: ["Gujarat Junior 74KG Total Record: 610 KG"],
    honors: ["National Junior Championships 2025 Gold", "Rising Star of Gujarat 2026"],
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
    licenseNumber: "WPI-GJ-2026-0941",
    isNationalChampion: true,
  },
  {
    id: "ath-bhavin-vyas",
    name: "Bhavin Vyas",
    category: "MASTERS",
    categoryLabel: "Masters I (40+)",
    weightClass: "93 KG",
    gender: "MALE",
    club: "Gandhinagar Barbell Club",
    state: "Gujarat",
    squat: 250,
    bench: 175,
    deadlift: 285,
    total: 710,
    dots: 93.8,
    recordsHeld: ["National Masters 93KG Bench Press Record: 175 KG"],
    honors: ["All India Masters Powerlifting 2025 Gold", "Asian Masters Selection 2026"],
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
    licenseNumber: "WPI-GJ-2026-0104",
    isNationalChampion: true,
  },
];

type CategoryFilter = "ALL" | "MEN_OPEN" | "WOMEN_OPEN" | "JUNIOR" | "MASTERS";

export function AthleteSpotlight({ initialAthletes }: AthleteSpotlightProps) {
  const athletes = initialAthletes && initialAthletes.length > 0 ? initialAthletes : DEFAULT_SPOTLIGHT_ATHLETES;
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");
  const [selectedAthlete, setSelectedAthlete] = useState<SpotlightAthlete>(athletes[0]);

  const filteredAthletes = useMemo(() => {
    if (activeCategory === "ALL") return athletes;
    return athletes.filter((a) => a.category === activeCategory);
  }, [athletes, activeCategory]);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-gym-black via-zinc-950 to-gym-black py-24 sm:py-32">
      {/* Background Ambience Orbs */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-gym-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Trophy className="h-3.5 w-3.5 fill-current text-amber-400" />
              <span>Gujarat State Hall of Fame &bull; Elite Strength Benchmarks</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white">
              Platform Champions &amp; <span className="text-gym-primary">Record Breakers</span>
            </h2>

            <p className="max-w-2xl text-sm sm:text-base text-gray-400 leading-relaxed">
              Official Gujarat state powerlifting athletes setting benchmarks across National championships,
              sanctioned under World Powerlifting India ratified technical standards.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            {[
              { id: "ALL", label: "All Champions" },
              { id: "MEN_OPEN", label: "Men Open" },
              { id: "WOMEN_OPEN", label: "Women Open" },
              { id: "JUNIOR", label: "Junior (U-23)" },
              { id: "MASTERS", label: "Masters (40+)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as CategoryFilter)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategory === tab.id
                    ? "bg-gym-primary text-black shadow-lg shadow-gym-primary/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spotlight Athlete Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAthletes.map((athlete, index) => {
              const maxSbd = Math.max(athlete.squat, athlete.bench, athlete.deadlift);

              return (
                <motion.div
                  key={athlete.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-black/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-gym-primary/50 hover:shadow-2xl hover:shadow-gym-primary/10"
                >
                  {/* Top Bar with Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-gym-primary/15 border border-gym-primary/30 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-gym-primary">
                          {athlete.weightClass}
                        </span>
                        <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-gray-300">
                          {athlete.categoryLabel}
                        </span>
                      </div>

                      {athlete.isNationalChampion && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                          <Medal className="h-3 w-3 fill-current text-amber-400" />
                          National Gold
                        </span>
                      )}
                    </div>

                    {/* Athlete Name & Identity */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-white/20 bg-zinc-900 shrink-0 shadow-md">
                        {athlete.image ? (
                          <Image
                            src={athlete.image}
                            alt={athlete.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-heading font-black text-2xl text-gym-primary bg-gym-primary/10">
                            {athlete.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading text-2xl font-black uppercase tracking-wide text-white truncate group-hover:text-gym-primary transition-colors">
                            {athlete.name}
                          </h3>
                          <span title="WPI Gujarat Verified Athlete">
                            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {athlete.club} &bull; {athlete.state}
                        </p>
                        {athlete.licenseNumber && (
                          <span className="inline-block font-mono text-[10px] text-gray-500 mt-1">
                            {athlete.licenseNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SBD Lift Visual Cards */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block">
                          SQUAT
                        </span>
                        <span className="font-heading text-lg font-black text-white">
                          {athlete.squat} <span className="text-[10px] text-gray-400">KG</span>
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block">
                          BENCH
                        </span>
                        <span className="font-heading text-lg font-black text-white">
                          {athlete.bench} <span className="text-[10px] text-gray-400">KG</span>
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block">
                          DEADLIFT
                        </span>
                        <span className="font-heading text-lg font-black text-white">
                          {athlete.deadlift} <span className="text-[10px] text-gray-400">KG</span>
                        </span>
                      </div>

                      <div className="rounded-xl border border-gym-primary/40 bg-gradient-to-b from-gym-primary/20 to-black/60 p-2.5 text-center shadow-inner">
                        <span className="text-[10px] font-bold tracking-widest text-gym-primary uppercase block">
                          TOTAL
                        </span>
                        <span className="font-heading text-lg font-black text-gym-primary">
                          {athlete.total} <span className="text-[10px] text-gym-primary/70">KG</span>
                        </span>
                      </div>
                    </div>

                    {/* DOTS & Standing Ribbon */}
                    <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2 text-xs mb-5">
                      <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        <span>IPF GL / DOTS</span>
                      </div>
                      <span className="font-mono font-black text-white text-sm">
                        {athlete.dots.toFixed(2)} pts
                      </span>
                    </div>

                    {/* Records Held Chip list */}
                    {athlete.recordsHeld && athlete.recordsHeld.length > 0 && (
                      <div className="space-y-1.5 mb-5">
                        {athlete.recordsHeld.map((rec, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs font-semibold text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1"
                          >
                            <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{rec}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Link */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href="/athletes"
                      className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gym-primary transition-colors flex items-center gap-1"
                    >
                      <span>Athlete Profile</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/records"
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      View State Records &rarr;
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Banner: Call to Action for Aspiring Lifters */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-[#180803] via-[#0e0301] to-[#120402] p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gym-primary/15 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gym-primary">
                <Sparkles className="h-4 w-4" />
                <span>Begin Your Championship Journey</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-black uppercase text-white">
                Are You Gujarat&apos;s Next <span className="text-gym-primary">National Champion?</span>
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Register officially with World Powerlifting India (WPI) Gujarat. Obtain your ratified athlete license,
                qualify through district &amp; state selection trials, and set official state records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-gym-primary/30 transition-all hover:scale-105 active:scale-95"
              >
                <Users className="h-4 w-4" />
                <span>Register As Athlete</span>
              </Link>

              <Link
                href="/athletes"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/40"
              >
                <span>Full State Roster</span>
                <ChevronRight className="h-4 w-4 text-gym-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
