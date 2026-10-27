"use client";

import { useEffect, useState, useRef } from "react";
import { useInView, animate, motion } from "framer-motion";

export interface StatItem {
  id: string;
  value: string;
  suffix?: string;
  label: string;
}

const DEFAULT_STATS: StatItem[] = [
  { id: "years", value: "50", suffix: "+", label: "Years of Heritage" },
  { id: "athletes", value: "10,000", suffix: "+", label: "Registered Athletes" },
  { id: "medals", value: "900", suffix: "+", label: "International Medals" },
  { id: "states", value: "37", suffix: "+", label: "Affiliated State Units" }
];

function StatCounter({ 
  rawValue, 
  label, 
  suffix = "", 
  delay = 0 
}: { 
  rawValue: string; 
  label: string; 
  suffix?: string; 
  delay?: number 
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  
  // Extract number from string like "10,000" -> 10000
  const numericTarget = parseFloat(rawValue.replace(/[^0-9.]/g, "")) || 0;
  const hasComma = rawValue.includes(",");
  const [displayNumber, setDisplayNumber] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const controls = animate(0, numericTarget, {
          duration: 2.2,
          ease: "easeOut",
          onUpdate: (val) => setDisplayNumber(Math.floor(val)),
        });
        return () => controls.stop();
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, numericTarget, delay]);

  const formattedDisplay = hasComma
    ? displayNumber.toLocaleString("en-IN")
    : displayNumber.toString();

  return (
    <div ref={ref} className="group relative flex cursor-pointer flex-col items-center justify-center border-b border-gym-primary/20 px-4 sm:px-6 py-7 sm:py-9 text-center transition-all duration-500 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="absolute inset-0 bg-gradient-to-b from-gym-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="stats-number relative z-10 mb-2 flex w-full items-baseline justify-center whitespace-nowrap font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-wide text-white drop-shadow-lg transition-all duration-500 overflow-visible leading-tight py-0.5 group-hover:scale-105 group-hover:-translate-y-0.5 group-hover:text-gym-primary group-hover:drop-shadow-[0_0_25px_rgba(230,80,27,0.6)]">
        {formattedDisplay}
        <span className="ml-1 text-2xl sm:text-3xl lg:text-4xl text-gym-primary transition-colors duration-500 group-hover:text-white">
          {suffix}
        </span>
      </div>

      <div className="relative z-10 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-gray-300 transition-all duration-500 overflow-visible leading-snug group-hover:text-white group-hover:-translate-y-0.5 drop-shadow-sm">
        {label}
      </div>
    </div>
  );
}

export default function PowerStats({ initialStats }: { initialStats?: StatItem[] }) {
  const [stats, setStats] = useState<StatItem[]>(
    initialStats && initialStats.length > 0 ? initialStats : DEFAULT_STATS
  );

  useEffect(() => {
    // If initialStats already provided by server, skip redundant fetch
    if (initialStats && initialStats.length > 0) return;

    async function fetchLatestStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.stats) && data.stats.length > 0) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        // graceful fallback to initial/default
      }
    }
    fetchLatestStats();
  }, [initialStats]);

  return (
    <section id="powerstats" className="relative z-30 w-full px-6 md:px-12 lg:px-24 pt-6 pb-32 md:pt-8 md:pb-48 flex justify-center">
      <div className="w-full max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative glass-panel rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gym-primary/30"
        >
          {/* Subtle Top Inner Glow */}
          <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gym-primary to-transparent opacity-60" />

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 bg-black/50">
            {stats.map((stat, idx) => (
              <StatCounter
                key={stat.id}
                rawValue={stat.value}
                suffix={stat.suffix || ""}
                label={stat.label}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
