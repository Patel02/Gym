"use client";

import { motion } from "framer-motion";
import { RefereeCase } from "@/data/referee-exam-cases";
import { AlertCircle, CheckCircle2, Eye, ShieldAlert, Sparkles } from "lucide-react";

interface TrajectoryVisualizerProps {
  scenario: RefereeCase;
  isRevealed: boolean;
}

export default function PlatformTrajectoryVisualizer({
  scenario,
  isRevealed,
}: TrajectoryVisualizerProps) {
  const { lift, visualScenario } = scenario;

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-gradient-to-b from-[#120502] via-[#0c0301] to-black p-4 sm:p-6 overflow-hidden shadow-2xl">
      {/* Background Arena Lighting / Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />
      <div className="absolute top-0 right-0 w-80 h-80 bg-gym-primary/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Bar: Lift & Camera Angle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-400">
            PLATFORM CAMERA 01 • SIDE JURY ANGLE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-gray-300 uppercase tracking-wider">
            {lift} • {scenario.attemptWeight}
          </span>
          <span className="rounded-full bg-gym-primary/15 border border-gym-primary/30 px-2.5 py-0.5 text-[10px] font-semibold text-gym-primary uppercase tracking-wider">
            {scenario.attemptNumber}
          </span>
        </div>
      </div>

      {/* Interactive Platform Motion Simulation Stage */}
      <div className="relative h-64 sm:h-72 w-full flex items-center justify-center bg-black/60 rounded-xl border border-white/5 overflow-hidden">
        
        {/* Scenario-specific SVG Platform graphics */}
        <svg viewBox="0 0 500 240" className="w-full h-full object-contain">
          <defs>
            <linearGradient id="barbellGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#888" />
              <stop offset="50%" stopColor="#fff" />
              <stop offset="100%" stopColor="#888" />
            </linearGradient>
            <linearGradient id="plateGradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e53e3e" />
              <stop offset="100%" stopColor="#9b2c2c" />
            </linearGradient>
            <linearGradient id="goldFiligree" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f6ad55" />
              <stop offset="100%" stopColor="#dd6b20" />
            </linearGradient>
          </defs>

          {/* Wooden Platform Floor */}
          <rect x="20" y="210" width="460" height="12" rx="4" fill="#3a2215" stroke="#683d26" strokeWidth="2" />
          <line x1="20" y1="210" x2="480" y2="210" stroke="#f6ad55" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

          {/* Lift 1: SQUAT GRAPHICS */}
          {lift === "Squat" && (
            <g>
              {/* Reference Planes: Knee horizontal line & Hip Crease */}
              <line x1="120" y1="140" x2="380" y2="140" stroke="#4a5568" strokeWidth="1.5" strokeDasharray="6 4" />
              <text x="390" y="143" fill="#a0aec0" fontSize="9" fontWeight="bold" fontFamily="monospace">KNEE LINE</text>

              {scenario.id === 1 ? (
                // Missed depth parallel line
                <>
                  <line x1="120" y1="138" x2="380" y2="138" stroke="#e53e3e" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="390" y="130" fill="#fc8181" fontSize="9" fontWeight="black" fontFamily="monospace">HIP CREASE (SHALLOW)</text>
                  <circle cx="240" cy="138" r="5" fill="#e53e3e" className="animate-ping" />
                  <circle cx="240" cy="138" r="4" fill="#e53e3e" />
                </>
              ) : (
                // Legal broken depth line
                <>
                  <line x1="120" y1="156" x2="380" y2="156" stroke="#38a169" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="390" y="160" fill="#68d391" fontSize="9" fontWeight="black" fontFamily="monospace">HIP CREASE (BELOW PARALLEL)</text>
                </>
              )}

              {/* Lifter stick-figure silhouette in squat */}
              <path 
                d={scenario.id === 1 
                  ? "M250,55 L250,75 L230,120 L275,138 L255,210" 
                  : "M250,65 L250,85 L225,130 L275,156 L255,210"} 
                stroke="#cbd5e0" 
                strokeWidth="7" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="none" 
              />
              <circle cx="250" cy={scenario.id === 1 ? 48 : 58} r="10" fill="#e2e8f0" />

              {/* Barbell Across Traps */}
              <motion.g
                animate={scenario.id === 3 ? {
                  y: [0, 50, 25, 33, 0], // downward dip in ascent
                } : {
                  y: [0, 45, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <rect x="150" y={scenario.id === 1 ? 62 : 72} width="200" height="6" rx="2" fill="url(#barbellGrad)" />
                {/* 25KG Calibrated Plates */}
                <rect x="160" y={scenario.id === 1 ? 30 : 40} width="10" height="70" rx="3" fill="url(#plateGradRed)" stroke="#742a2a" strokeWidth="1" />
                <rect x="172" y={scenario.id === 1 ? 35 : 45} width="8" height="60" rx="2" fill="url(#plateGradRed)" />
                <rect x="320" y={scenario.id === 1 ? 35 : 45} width="8" height="60" rx="2" fill="url(#plateGradRed)" />
                <rect x="330" y={scenario.id === 1 ? 30 : 40} width="10" height="70" rx="3" fill="url(#plateGradRed)" stroke="#742a2a" strokeWidth="1" />
              </motion.g>
            </g>
          )}

          {/* Lift 2: BENCH PRESS GRAPHICS */}
          {lift === "Bench Press" && (
            <g>
              {/* Competition Bench Pad & Uprights */}
              <rect x="140" y="160" width="220" height="14" rx="2" fill="#2d3748" stroke="#4a5568" strokeWidth="1.5" />
              <rect x="160" y="174" width="10" height="36" fill="#1a202c" />
              <rect x="330" y="174" width="10" height="36" fill="#1a202c" />

              {/* Lifter Body on Bench */}
              <path d="M160,154 Q210,135 250,154 L300,154 L330,195 L345,210" stroke="#cbd5e0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="150" cy="150" r="9" fill="#e2e8f0" />

              {/* Buttocks Contact Indicator */}
              {scenario.id === 6 && (
                <g>
                  <line x1="240" y1="154" x2="260" y2="140" stroke="#ecc94b" strokeWidth="2" strokeDasharray="3 2" />
                  <circle cx="250" cy="144" r="4" fill="#ecc94b" className="animate-ping" />
                  <text x="210" y="130" fill="#ecc94b" fontSize="8" fontWeight="bold">BUTTOCKS LIFTED</text>
                </g>
              )}

              {/* Barbell Movement */}
              <motion.g
                animate={scenario.id === 5 ? {
                  y: [0, 42, 48, 0], // Sinks deeper on chest
                } : scenario.id === 7 ? {
                  rotate: [0, 0, -6, 0], // Uneven arm extension
                  y: [0, 40, 0]
                } : {
                  y: [0, 42, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <rect x="150" y="105" width="200" height="6" rx="2" fill="url(#barbellGrad)" />
                <rect x="160" y="75" width="10" height="66" rx="3" fill="url(#plateGradRed)" />
                <rect x="330" y="75" width="10" height="66" rx="3" fill="url(#plateGradRed)" />
              </motion.g>
            </g>
          )}

          {/* Lift 3: DEADLIFT GRAPHICS */}
          {lift === "Deadlift" && (
            <g>
              {/* Lifter Pulling Silhouette */}
              <path d="M250,70 L250,120 L230,165 L245,210 M250,120 L270,165 L255,210" stroke="#cbd5e0" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="250" cy="55" r="9" fill="#e2e8f0" />

              {/* Thigh Ramping / Hitch Point Indicator */}
              {scenario.id === 9 && (
                <g>
                  <circle cx="240" cy="145" r="6" fill="#3182ce" className="animate-pulse" />
                  <text x="255" y="148" fill="#63b3ed" fontSize="8" fontWeight="bold">QUAD SUPPORT (HITCH)</text>
                </g>
              )}

              {/* Barbell Ascending */}
              <motion.g
                animate={scenario.id === 10 ? {
                  y: [0, -75, -20, 0], // Dropped early
                } : {
                  y: [0, -75, 0]
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <rect x="150" y="195" width="200" height="6" rx="2" fill="url(#barbellGrad)" />
                <rect x="160" y="162" width="10" height="72" rx="3" fill="url(#plateGradRed)" />
                <rect x="330" y="162" width="10" height="72" rx="3" fill="url(#plateGradRed)" />
              </motion.g>
            </g>
          )}
        </svg>

        {/* Live Tracking Overlay Badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="rounded-lg bg-black/80 border border-white/10 px-2.5 py-1 backdrop-blur-md flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-gym-primary" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-300">
              VAR REPLAY 60 FPS
            </span>
          </div>
          <div className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${
            visualScenario.visualHighlightColor === 'emerald'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
              : visualScenario.visualHighlightColor === 'red'
              ? 'bg-red-950/60 border-red-500/40 text-red-400'
              : visualScenario.visualHighlightColor === 'blue'
              ? 'bg-blue-950/60 border-blue-500/40 text-blue-400'
              : 'bg-yellow-950/60 border-yellow-500/40 text-yellow-400'
          }`}>
            {visualScenario.badge}
          </div>
        </div>
      </div>

      {/* Observation Cue & Lifter Context */}
      <div className="mt-4 bg-white/[0.03] border border-white/5 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-full bg-gym-primary/20 p-1 text-gym-primary shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              Observed Platform Movement
            </span>
            <p className="text-xs text-gray-200 font-medium leading-snug mt-0.5">
              {visualScenario.description}
            </p>
          </div>
        </div>

        {isRevealed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg border px-3 py-1.5 shrink-0 flex items-center gap-1.5 ${
              scenario.correctDecision === "GOOD_LIFT"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "bg-red-500/15 border-red-500/40 text-red-400"
            }`}
          >
            {scenario.correctDecision === "GOOD_LIFT" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider">
              {scenario.correctDecision === "GOOD_LIFT" ? "LEGAL GOOD LIFT" : "DISQUALIFIED NO LIFT"}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
