"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

type Gender = "MEN" | "WOMEN";

type Athlete = {
  rank: number;
  name: string;
  squat: number;
  bench: number;
  deadlift: number;
  total: number;
};

const leaderboardData: Record<Gender, Record<string, Athlete[]>> = {
  MEN: {
    "83KG": [
      { rank: 1, name: "Aarav Sharma", squat: 260, bench: 165, deadlift: 295, total: 720 },
      { rank: 2, name: "Vikram Singh", squat: 245, bench: 155, deadlift: 280, total: 680 },
      { rank: 3, name: "Rahul Verma", squat: 230, bench: 140, deadlift: 260, total: 630 },
    ],
    "93KG": [
      { rank: 1, name: "Kabir Desai", squat: 285, bench: 180, deadlift: 315, total: 780 },
      { rank: 2, name: "Arjun Patel", squat: 270, bench: 170, deadlift: 300, total: 740 },
    ],
  },
  WOMEN: {
    "63KG": [
      { rank: 1, name: "Neha Gupta", squat: 160, bench: 90, deadlift: 185, total: 435 },
      { rank: 2, name: "Pooja Reddy", squat: 145, bench: 85, deadlift: 170, total: 400 },
    ],
  },
};

export default function Leaderboard() {
  const [gender, setGender] = useState<Gender>("MEN");
  const [weightClass, setWeightClass] = useState("83KG");

  const availableWeightClasses = Object.keys(leaderboardData[gender]);
  const currentData = leaderboardData[gender][weightClass] ?? [];

  const handleGenderChange = (nextGender: Gender) => {
    setGender(nextGender);
    setWeightClass(Object.keys(leaderboardData[nextGender])[0]);
  };

  return (
    <section id="leaderboard" className="relative z-10 w-full border-b border-white/5 bg-gym-black py-12 md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-24">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-10 flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-3.5">
            <Trophy className="h-4 w-4 text-gym-primary shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
              National Benchmarks • Live Rankings
            </span>
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black uppercase leading-[1.04] tracking-tight text-white drop-shadow-xl">
            The National <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">
              Leaderboard
            </span>
          </h2>
          <p className="mt-3.5 max-w-xl text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed">
            Verified lifts across official weight classes. Where India's elite athletes prove their platform numbers.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 md:mb-8 flex w-full flex-col items-center justify-center gap-6 rounded-xl border border-white/10 bg-[#0f0f0f] p-4 shadow-2xl lg:flex-row lg:p-6"
        >
          <div className="flex w-full justify-center rounded-lg border border-white/5 bg-[#1a1a1a] p-1.5 gap-2 md:w-auto">
            {(["MEN", "WOMEN"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleGenderChange(option)}
                className={`flex-1 rounded-sm px-8 py-3 font-heading text-base font-bold uppercase tracking-widest transition-all duration-300 md:flex-none md:py-4 md:text-lg ${
                  gender === option ? "bg-gym-primary text-white shadow-lg" : "text-gray-500 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex w-full flex-wrap justify-center gap-3 md:w-auto">
            {availableWeightClasses.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setWeightClass(option)}
                className={`rounded-lg border px-6 py-2.5 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  weightClass === option
                    ? "border-gym-primary bg-gym-primary/10 text-gym-primary shadow-[0_0_15px_rgba(230,80,27,0.3)] scale-105"
                    : "border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full overflow-x-auto rounded-sm border border-white/10 bg-[#0a0a0a] shadow-2xl mb-10"
        >
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0a0a0a] via-gym-primary to-[#0a0a0a]" />
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b-2 border-gym-primary/50 bg-[#151515] text-sm font-bold uppercase tracking-[0.2em] text-gray-300 md:text-base">
                <th className="w-24 px-8 py-6">Rank</th>
                <th className="px-8 py-6">Athlete Name</th>
                <th className="px-8 py-6 text-center">Squat</th>
                <th className="px-8 py-6 text-center">Bench</th>
                <th className="px-8 py-6 text-center">Deadlift</th>
                <th className="px-8 py-6 text-right text-gym-primary">Total</th>
              </tr>
            </thead>
            <tbody className="font-heading text-xl md:text-2xl">
              <AnimatePresence>
                {currentData.map((athlete, index) => (
                  <motion.tr
                    key={`${gender}-${weightClass}-${athlete.rank}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group cursor-pointer border-b border-white/5 transition-all duration-300 hover:bg-[#151515]"
                  >
                    <td className="px-8 py-8 font-black">
                      <span className={`${athlete.rank === 1 ? "text-4xl text-gym-primary" : "text-3xl text-gray-600"} flex items-center gap-2 transition-colors duration-300`}>
                        {athlete.rank === 1 && <Trophy className="h-5 w-5" />}
                        {String(athlete.rank).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-8 py-8 font-sans text-xl font-bold uppercase tracking-wider text-gray-300 transition-colors duration-300 group-hover:text-white">
                      {athlete.name}
                    </td>
                    <td className="px-8 py-8 text-center text-gray-500 transition-colors group-hover:text-gray-300">{athlete.squat} <span className="font-sans text-xs text-gray-600">KG</span></td>
                    <td className="px-8 py-8 text-center text-gray-500 transition-colors group-hover:text-gray-300">{athlete.bench} <span className="font-sans text-xs text-gray-600">KG</span></td>
                    <td className="px-8 py-8 text-center text-gray-500 transition-colors group-hover:text-gray-300">{athlete.deadlift} <span className="font-sans text-xs text-gray-600">KG</span></td>
                    <td className="px-8 py-8 text-right text-4xl font-black text-gym-primary transition-colors duration-300 group-hover:text-white">
                      {athlete.total} <span className="font-sans text-sm tracking-widest text-gym-primary/50 group-hover:text-white/50">KG</span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>

        {/* Conversion CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-6"
        >
          <p className="text-gray-400 text-base">Think you can make the leaderboard?</p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-gym-primary px-7 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(230,80,27,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(230,80,27,0.5)]"
          >
            Register & Compete
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}