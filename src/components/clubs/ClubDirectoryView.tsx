"use client";

import React, { useState, useMemo } from "react";
import { AffiliatedClub } from "@/actions/club-affiliation.actions";
import ClubAccreditationModal from "./ClubAccreditationModal";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { 
  Building2, 
  CheckCircle2, 
  Dumbbell, 
  ExternalLink, 
  Filter, 
  MapPin, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Users, 
  X, 
  Zap 
} from "lucide-react";

interface ClubDirectoryViewProps {
  initialClubs: AffiliatedClub[];
  availableStates: string[];
}

export default function ClubDirectoryView({
  initialClubs,
  availableStates,
}: ClubDirectoryViewProps) {
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccreditationModalOpen, setIsAccreditationModalOpen] = useState(false);

  // Filter logic
  const filteredClubs = useMemo(() => {
    return initialClubs.filter((club) => {
      const matchesState = selectedState === "ALL" || club.state.toLowerCase() === selectedState.toLowerCase();
      const matchesEquipment = selectedEquipment === "ALL" || club.equipmentRating === selectedEquipment;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        club.name.toLowerCase().includes(q) ||
        club.city.toLowerCase().includes(q) ||
        club.state.toLowerCase().includes(q) ||
        club.headCoach.toLowerCase().includes(q) ||
        club.accreditationCode.toLowerCase().includes(q);
      return matchesState && matchesEquipment && matchesSearch;
    });
  }, [initialClubs, selectedState, selectedEquipment, searchQuery]);

  return (
    <div>
      {/* Action Header Banner */}
      <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-r from-[#1b0603] via-[#210904] to-[#120402] p-6 sm:p-8 mb-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gym-primary mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>National Strength Network</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
            Find an Accredited Training Gym
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            Train at verified barbell clubs equipped with calibrated competition bars, certified combo racks, and federation coaches across India.
          </p>
        </div>

        <button
          onClick={() => setIsAccreditationModalOpen(true)}
          className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gym-primary to-[#ff7a45] px-6 py-3.5 font-heading text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(230,80,27,0.4)] hover:brightness-110 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Apply for Club Accreditation</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-3xl border border-white/10 bg-[#120402]/90 p-5 sm:p-6 backdrop-blur-xl mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search club name, city, coach, or code (e.g. Pune, Delhi, Eleiko)..."
              className="w-full rounded-2xl border border-white/10 bg-black/60 pl-11 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none transition-colors"
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

          {/* State Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none transition-colors cursor-pointer"
            >
              <option value="ALL" className="bg-black text-white">All State Chapters ({availableStates.length})</option>
              {availableStates.map((st) => (
                <option key={st} value={st} className="bg-black text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Rating Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none transition-colors cursor-pointer"
            >
              <option value="ALL" className="bg-black text-white">All Platform Standards</option>
              <option value="ELEIKO_CERTIFIED" className="bg-black text-white">Eleiko Certified Platforms</option>
              <option value="IPF_APPROVED_COMBO" className="bg-black text-white">IPF Approved Combo Racks</option>
              <option value="CALIBRATED_STEEL" className="bg-black text-white">Calibrated Steel Discs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-6 px-1 font-bold uppercase tracking-wider">
        <div>
          Showing <span className="text-white font-mono">{filteredClubs.length}</span> Accredited Clubs
        </div>
        {(selectedState !== "ALL" || selectedEquipment !== "ALL" || searchQuery) && (
          <button
            onClick={() => {
              setSelectedState("ALL");
              setSelectedEquipment("ALL");
              setSearchQuery("");
            }}
            className="text-gym-primary hover:underline cursor-pointer"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center my-8">
          <Dumbbell className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <h3 className="font-heading text-xl font-bold text-white uppercase">No Accredited Club Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            No training gym matched your selected criteria. Try adjusting your state or equipment filter, or apply for affiliation!
          </p>
          <button
            onClick={() => setIsAccreditationModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gym-primary px-6 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Apply to Accredit Your Gym</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const cleanPhone = club.contactPhone.replace(/[^0-9]/g, "");
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello Coach (${club.name}), I am an athlete inquiring about training at your accredited powerlifting facility.`
            )}`;

            const isEleiko = club.equipmentRating === "ELEIKO_CERTIFIED";
            const isCombo = club.equipmentRating === "IPF_APPROVED_COMBO";

            return (
              <div
                key={club.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#120402]/85 p-6 backdrop-blur-xl hover:border-gym-primary/50 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(230,80,27,0.15)]"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-full border border-gym-primary/30 bg-gym-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gym-primary">
                      {club.state}
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      ACCREDITED
                    </span>
                  </div>

                  {/* Club Title & Code */}
                  <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-white group-hover:text-gym-primary transition-colors">
                    {club.name}
                  </h3>
                  <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                    {club.accreditationCode} • Estd. {club.establishedYear}
                  </div>

                  {/* Equipment Badge */}
                  <div className="my-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        isEleiko
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                          : isCombo
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                          : "border-white/15 bg-white/5 text-gray-300"
                      }`}
                    >
                      <Zap className="h-3 w-3" />
                      {club.equipmentRating.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Location & Coach Details */}
                  <div className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 text-xs text-gray-300 my-4">
                    <div className="flex items-start gap-2">
                      <User className="h-3.5 w-3.5 text-gym-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 block">Head Coach:</span>
                        <span className="font-bold text-white">{club.headCoach}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gym-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 block">Facility Location:</span>
                        <span className="text-gray-300 text-[11px] leading-snug">{club.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Platform & Athlete Counts */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                    <div className="rounded-xl border border-white/5 bg-black/40 p-2">
                      <div className="text-[10px] uppercase text-gray-400">Platforms</div>
                      <div className="font-heading text-sm font-black text-white">{club.platformsCount} Platforms</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-2">
                      <div className="text-[10px] uppercase text-gray-400">Athletes</div>
                      <div className="font-heading text-sm font-black text-gym-primary">{club.athletesCount} Lifters</div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-105 transition-all"
                  >
                    <WhatsAppIcon variant="badge" className="h-4 w-4" />
                    <span>Connect with Coach</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Club Accreditation Modal */}
      <ClubAccreditationModal
        isOpen={isAccreditationModalOpen}
        onClose={() => setIsAccreditationModalOpen(false)}
        availableStates={availableStates}
      />
    </div>
  );
}
