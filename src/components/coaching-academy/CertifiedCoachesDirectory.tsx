"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Award, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { SEED_CERTIFIED_COACHES, CertifiedCoachRecord } from "@/data/coaching-academy-data";
import CoachLicensePassModal from "./CoachLicensePassModal";

export default function CertifiedCoachesDirectory() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "LEVEL_1" | "LEVEL_2">("ALL");
  const [selectedCoach, setSelectedCoach] = useState<CertifiedCoachRecord | null>(null);

  const coaches = SEED_CERTIFIED_COACHES.filter((c) => {
    const matchesLevel = levelFilter === "ALL" || c.level === levelFilter;
    const query = search.toLowerCase().trim();
    if (!query) return matchesLevel;

    const matchesName = c.name.toLowerCase().includes(query);
    const matchesClub = c.clubAffiliation.toLowerCase().includes(query);
    const matchesState = c.state.toLowerCase().includes(query);
    const matchesCode = c.licenseCode.toLowerCase().includes(query);

    return matchesLevel && (matchesName || matchesClub || matchesState || matchesCode);
  });

  return (
    <div className="space-y-6">
      {/* ── Header Bar ── */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-black/80 to-black p-6 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
              <Users className="h-4 w-4" />
              <span>National Roster of Certified Strength Coaches</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white mt-1">
              Accredited Coaches & Platform Handlers Registry
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Verify licensed coaches across Indian states, affiliated barbell clubs, and coaching specializations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-300">
              {coaches.length} Verified Coaches
            </span>
          </div>
        </div>

        {/* ── Search & Filter ── */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by coach name, club, state, or license code..."
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none placeholder-gray-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setLevelFilter("ALL")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                levelFilter === "ALL"
                  ? "bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/25"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setLevelFilter("LEVEL_1")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                levelFilter === "LEVEL_1"
                  ? "bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/25"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              Level 1
            </button>
            <button
              onClick={() => setLevelFilter("LEVEL_2")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                levelFilter === "LEVEL_2"
                  ? "bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/25"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              Level 2
            </button>
          </div>
        </div>
      </div>

      {/* ── Coaches Roster Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coaches.map((coach) => (
          <motion.div
            key={coach.id}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-white/10 bg-zinc-950 p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  {coach.licenseCode}
                </span>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  coach.level === "LEVEL_2"
                    ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                    : "border-blue-500/40 bg-blue-500/15 text-blue-300"
                }`}>
                  {coach.level === "LEVEL_2" ? "★ Level 2 National" : "Level 1 Club"}
                </span>
              </div>

              <h3 className="text-lg font-bold uppercase text-white tracking-wide">
                {coach.name}
              </h3>
              <p className="text-xs text-amber-300/90 font-medium">
                {coach.levelTitle}
              </p>

              <div className="mt-4 space-y-2 text-xs text-gray-400 border-t border-white/10 pt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                  <span>{coach.city}, {coach.state}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                  <span className="truncate">{coach.clubAffiliation}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                  <span>Spec: {coach.specialization}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified ({coach.verifiedYear})</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCoach(coach)}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/25 px-2.5 py-1.5 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm hover:scale-105"
                  title="View Official Accreditation Diploma"
                >
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  <span>Diploma</span>
                </button>

                <a
                  href={`https://wa.me/${coach.contactWhatsApp}?text=Hello%20Coach%20${encodeURIComponent(coach.name)},%20I%20saw%20your%20credentials%20on%20the%20Official%20Powerlifting%20Coaching%20Academy%20registry.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-all shadow-sm"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  <span>Connect</span>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Coach License Pass Modal for Directory ── */}
      {selectedCoach && (
        <CoachLicensePassModal
          isOpen={!!selectedCoach}
          onClose={() => setSelectedCoach(null)}
          candidateName={selectedCoach.name}
          licenseCode={selectedCoach.licenseCode}
          level={selectedCoach.level}
          levelTitle={selectedCoach.levelTitle}
          scorePercentage={95}
          ratificationDate={`${selectedCoach.verifiedYear}-01-15`}
        />
      )}
    </div>
  );
}
