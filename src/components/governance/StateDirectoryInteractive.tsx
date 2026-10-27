"use client";

import React, { useState, useMemo } from "react";
import { STATE_ASSOCIATIONS, StateAssociation, StateZone } from "@/data/federation-states";
import StateDossierModal from "./StateDossierModal";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { 
  Building2, 
  Calendar, 
  ChevronRight, 
  Dumbbell, 
  FileText, 
  Landmark, 
  Mail, 
  MapPin, 
  Phone, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Trophy, 
  Users, 
  X 
} from "lucide-react";
import Link from "next/link";

const ZONES: { label: string; value: StateZone; description: string }[] = [
  { label: "All India", value: "ALL", description: "37 State Units & 4 Institutional Boards" },
  { label: "North", value: "NORTH", description: "Delhi, Punjab, Haryana, UP, UK, HP, JK, CH, LK" },
  { label: "West", value: "WEST", description: "Maharashtra, Gujarat, Rajasthan, Goa" },
  { label: "South", value: "SOUTH", description: "Karnataka, Kerala, Tamil Nadu, Telangana, AP, PY" },
  { label: "East & Central", value: "EAST_CENTRAL", description: "Bengal, MP, Bihar, Jharkhand, Odisha, CG" },
  { label: "North-East", value: "NORTH_EAST", description: "Assam, Manipur, Meghalaya, Mizoram, NL, TR, AR, SK" },
  { label: "Institutional", value: "INSTITUTIONAL", description: "Railways, Police, Services, Steel Plants" },
];

export default function StateDirectoryInteractive() {
  const [selectedZone, setSelectedZone] = useState<StateZone>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDossierState, setActiveDossierState] = useState<StateAssociation | null>(null);

  // Compute counts per zone
  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: STATE_ASSOCIATIONS.length };
    STATE_ASSOCIATIONS.forEach((s) => {
      counts[s.zone] = (counts[s.zone] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter states
  const filteredStates = useMemo(() => {
    return STATE_ASSOCIATIONS.filter((s) => {
      const matchesZone = selectedZone === "ALL" || s.zone === selectedZone;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.hqCity.toLowerCase().includes(q) ||
        s.secgen.toLowerCase().includes(q) ||
        s.president.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q);
      return matchesZone && matchesSearch;
    });
  }, [selectedZone, searchQuery]);

  return (
    <section className="mt-16 pt-12 border-t border-white/10" id="state-directory">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gym-primary mb-3">
            <Landmark className="h-3.5 w-3.5" />
            <span>National Secretariat Roster</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            37 Affiliated State & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent">
              Institutional Chapters
            </span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-300 max-w-2xl">
            Locate your regional state association, contact the state Secretary General, review sanctioned state championships, and view accredited training clubs.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:border-gym-primary hover:bg-gym-primary/10 transition-colors"
          >
            <Dumbbell className="h-4 w-4 text-gym-primary" />
            <span>Accredited Clubs Directory →</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar: Zone Pills & Search Bar */}
      <div className="rounded-3xl border border-white/10 bg-[#120402]/90 p-5 sm:p-6 backdrop-blur-xl mb-8 shadow-xl">
        {/* Search Input */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search state name, secretary, president, city, or charter code (e.g. Maharashtra, Punjab, Delhi)..."
            className="w-full rounded-2xl border border-white/10 bg-black/60 pl-11 pr-10 py-3.5 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Zone Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          {ZONES.map((zone) => {
            const isSelected = selectedZone === zone.value;
            const count = zoneCounts[zone.value] || 0;
            return (
              <button
                key={zone.value}
                onClick={() => setSelectedZone(zone.value)}
                className={`group shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  isSelected
                    ? "bg-gym-primary text-white shadow-[0_0_20px_rgba(230,80,27,0.4)]"
                    : "border border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>{zone.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isSelected
                      ? "bg-black/40 text-white"
                      : "bg-white/10 text-gray-400 group-hover:text-white"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Counter */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-6 px-1 font-bold uppercase tracking-wider">
        <div>
          Showing <span className="text-white font-mono">{filteredStates.length}</span> of {STATE_ASSOCIATIONS.length} State & Institutional Units
        </div>
        {searchQuery && (
          <div>
            Filtered by: <span className="text-gym-primary">"{searchQuery}"</span>
          </div>
        )}
      </div>

      {/* Grid of State Associations */}
      {filteredStates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center my-8">
          <Landmark className="h-10 w-10 text-gray-500 mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold text-white uppercase">No State Unit Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            No state associations matched your search query "{searchQuery}". Try searching for another state or reset your zone filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedZone("ALL");
            }}
            className="mt-4 rounded-xl border border-gym-primary/30 bg-gym-primary/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStates.map((unit) => {
            const cleanPhone = unit.phone.replace(/[^0-9]/g, "");
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello Secretary General (${unit.shortName} Powerlifting Association), I am reaching out regarding athlete state registration and sanctioned championship inquiries.`
            )}`;

            return (
              <div
                key={unit.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#120402]/85 p-6 backdrop-blur-xl hover:border-gym-primary/50 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(230,80,27,0.15)]"
              >
                <div>
                  {/* Top Bar: Zone & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-full border border-gym-primary/30 bg-gym-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gym-primary">
                      {unit.zone.replace("_", " ")}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      {unit.sanctionStatus}
                    </span>
                  </div>

                  {/* Title & Code */}
                  <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-white group-hover:text-gym-primary transition-colors">
                    {unit.name}
                  </h3>
                  <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                    {unit.code} • Estd. {unit.establishedYear}
                  </div>

                  {/* Key Leadership */}
                  <div className="my-4 space-y-1.5 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400 uppercase text-[10px]">Sec. General:</span>
                      <span className="font-bold text-white truncate max-w-[170px]">{unit.secgen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 uppercase text-[10px]">President:</span>
                      <span className="font-bold text-white truncate max-w-[170px]">{unit.president}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 uppercase text-[10px]">Headquarters:</span>
                      <span className="text-gray-300 truncate max-w-[170px]">{unit.hqCity}</span>
                    </div>
                  </div>

                  {/* Registered Metrics */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                    <div className="rounded-xl border border-white/5 bg-black/40 p-2">
                      <div className="text-[10px] uppercase text-gray-400">Clubs</div>
                      <div className="font-heading text-sm font-black text-white">{unit.activeClubsCount} Gyms</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-2">
                      <div className="text-[10px] uppercase text-gray-400">Lifters</div>
                      <div className="font-heading text-sm font-black text-gym-primary">{unit.registeredAthletesCount}+</div>
                    </div>
                  </div>

                  {/* Upcoming State Meet Pill */}
                  {unit.upcomingStateMeet && (
                    <div className="mb-4 rounded-xl border border-gym-primary/30 bg-gym-primary/10 p-2.5 text-left text-[11px] text-gray-300">
                      <div className="flex items-center gap-1 font-bold text-gym-primary uppercase text-[10px] mb-0.5">
                        <Trophy className="h-3 w-3" />
                        <span>Sanctioned State Meet</span>
                      </div>
                      <div className="font-bold text-white truncate">{unit.upcomingStateMeet.title}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{unit.upcomingStateMeet.dates}</div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => setActiveDossierState(unit)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-gym-primary" />
                    <span>View Dossier</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer shrink-0"
                    title="WhatsApp State Secretary"
                  >
                    <WhatsAppIcon variant="badge" className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* State Dossier Modal */}
      <StateDossierModal
        stateUnit={activeDossierState}
        isOpen={!!activeDossierState}
        onClose={() => setActiveDossierState(null)}
      />
    </section>
  );
}
