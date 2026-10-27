"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Zap } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const pillars = [
  "IPF Certified Equipment & Platform",
  "Nationally Accredited Referees",
  "Live Scoring & Record Tracking",
];

export default function Philosophy() {
  return (
    <section id="philosophy" className="relative z-10 w-full border-b border-white/5 bg-gym-black py-12 md:py-16 lg:py-20 flex flex-col items-center">

      {/* ── Centered section label ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 md:mb-10 flex flex-col items-center text-center px-6"
      >
        <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-3.5">
          <Zap className="h-4 w-4 text-gym-primary shrink-0" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
            Technical Standards & Core Philosophy
          </span>
        </div>
        <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black uppercase leading-[1.04] tracking-tight text-white drop-shadow-xl">
          More Than Moving <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">
            Weight.
          </span>
        </h2>
        <p className="mt-3.5 max-w-2xl text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed">
          Engineered for calibrated precision, IPF rulebook compliance, and drug-free athletic excellence.
        </p>
      </motion.div>

      {/* ── Centered glass card ── */}
      <div className="w-full px-6 md:px-12 lg:px-24 flex justify-center">
        <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full glass-panel rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        >
          {/* Top orange glow line */}
          <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gym-primary to-transparent opacity-70 z-10" />

          <div className="flex flex-col lg:flex-row">

            {/* ── Left: Image panel ── */}
            <div className="relative w-full shrink-0 lg:w-[40%]">
              <Image
                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop"
                alt="Raw Powerlifting"
                width={2069}
                height={1379}
                className="h-[280px] w-full object-cover grayscale transition-all duration-700 hover:grayscale-0 lg:h-full lg:min-h-[480px]"
              />
              {/* Gradient blend into right side */}
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#0e0302] hidden lg:block" />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0e0302] to-transparent lg:hidden" />

              {/* ── RAW POWER badge — prominent & glowing ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute bottom-5 left-5 flex items-center gap-2 rounded-xl bg-gym-primary px-5 py-3 shadow-[0_0_25px_rgba(230,80,27,0.7)] border border-gym-primary/50"
              >
                <Zap className="h-4 w-4 text-white fill-white" />
                <span className="font-heading text-base font-bold uppercase tracking-[0.2em] text-white drop-shadow">
                  Raw Power
                </span>
              </motion.div>
            </div>

            {/* ── Right: Content panel ── */}
            <div className="flex flex-col justify-center gap-7 p-8 md:p-10 lg:p-12 bg-black/25">

              <p className="text-base font-normal leading-relaxed text-gray-400 sm:text-lg">
                Powerlifting is a science of precision, discipline, and absolute force. At Federation, we do not do casual fitness. We provide a calibrated environment engineered specifically for athletes who are serious about the platform.
              </p>

              {/* Proof points */}
              <ul className="flex flex-col gap-3.5">
                {pillars.map((p) => (
                  <li key={p} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-gym-primary" />
                    <span className="text-sm font-semibold text-gray-300 sm:text-base">{p}</span>
                  </li>
                ))}
              </ul>

              {/* Lifts grid */}
              <div className="grid grid-cols-3 border-t border-white/10 pt-6">
                {[["01", "Squat"], ["02", "Bench"], ["03", "Deadlift"]].map(([num, lift], i) => (
                  <div
                    key={lift}
                    className={`group flex flex-col items-center text-center py-2 ${i < 2 ? "border-r border-white/10" : ""}`}
                  >
                    <div className="mb-1 font-heading text-3xl font-bold text-gym-primary transition-colors duration-300 group-hover:text-white">
                      {num}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors duration-300 group-hover:text-white">
                      {lift}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Enhanced Join The Federation CTA ── */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 pt-2">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative group inline-block w-fit"
                >
                  {/* Ambient animated gradient glow */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gym-primary via-[#ff6b35] to-gym-red opacity-60 blur-lg transition-all duration-500 group-hover:opacity-100 group-hover:blur-xl animate-pulse" />

                  <Link
                    href="/register"
                    className="relative flex items-center gap-3.5 rounded-full bg-gradient-to-r from-gym-primary via-[#f05a20] to-gym-red pl-8 pr-5 py-4 text-white shadow-[0_10px_30px_rgba(230,80,27,0.45)] border-t border-white/30 border-b border-black/30 overflow-hidden transition-all duration-300 group-hover:shadow-[0_15px_45px_rgba(230,80,27,0.75)]"
                  >
                    {/* Light sweep shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full pointer-events-none" />

                    {/* Button text - clean font-bold, leading-none, ample space */}
                    <span className="relative z-10 inline-block font-heading text-lg sm:text-xl font-bold uppercase tracking-[0.14em] text-white drop-shadow whitespace-nowrap leading-none">
                      Join The Federation
                    </span>

                    {/* Interactive circular icon badge */}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/30 border border-white/20 text-white transition-all duration-300 group-hover:bg-white group-hover:text-gym-primary group-hover:scale-110 group-hover:translate-x-0.5 shadow-inner">
                      <ArrowRight className="h-4 w-4 transition-transform duration-300" />
                    </div>
                  </Link>
                </motion.div>

                {/* Live intake status badge */}
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-400 w-fit whitespace-nowrap">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gym-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-gym-primary"></span>
                  </span>
                  <span className="text-gray-300">2026 Athlete Intake Active</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
