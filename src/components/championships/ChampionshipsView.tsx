"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Award, 
  Users, 
  Clock, 
  ChevronRight, 
  Download, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  FileText,
  Filter
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { PageNavigation } from "@/components/ui/PageNavigation";
import type { MeetItem } from "@/components/admin/EventsManager";

const WHATSAPP_PHONE = "917043951377";

const WEIGHT_DIVISIONS = {
  men: ["59 kg", "66 kg", "74 kg", "83 kg", "93 kg", "105 kg", "120 kg", "+120 kg"],
  women: ["47 kg", "52 kg", "57 kg", "63 kg", "69 kg", "76 kg", "84 kg", "+84 kg"],
};

const QUALIFYING_TOTALS_SAMPLE = [
  { wc: "59 kg", srMen: "440 kg", jrMen: "390 kg", subJrMen: "330 kg" },
  { wc: "66 kg", srMen: "500 kg", jrMen: "440 kg", subJrMen: "380 kg" },
  { wc: "74 kg", srMen: "560 kg", jrMen: "490 kg", subJrMen: "420 kg" },
  { wc: "83 kg", srMen: "615 kg", jrMen: "540 kg", subJrMen: "460 kg" },
  { wc: "93 kg", srMen: "660 kg", jrMen: "580 kg", subJrMen: "495 kg" },
  { wc: "105 kg", srMen: "695 kg", jrMen: "610 kg", subJrMen: "520 kg" },
  { wc: "120 kg", srMen: "725 kg", jrMen: "635 kg", subJrMen: "540 kg" },
  { wc: "+120 kg", srMen: "750 kg", jrMen: "660 kg", subJrMen: "560 kg" },
];

interface ChampionshipsViewProps {
  initialMeets: MeetItem[];
}

export default function ChampionshipsView({ initialMeets }: ChampionshipsViewProps) {
  const [activeTab, setActiveTab] = useState<"calendar" | "divisions" | "mqt">("calendar");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  const filteredMeets = initialMeets.filter((m) => {
    if (statusFilter === "ACTIVE") return m.status !== "COMPLETED";
    if (statusFilter === "COMPLETED") return m.status === "COMPLETED";
    return true;
  });

  return (
    <div className="min-h-screen bg-gym-black text-white pt-32 sm:pt-36 lg:pt-40 pb-20 relative overflow-hidden">
      
      {/* ── Ambient Background Glows ── */}
      <motion.div 
        animate={{ y: [0, -25, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" 
      />
      <motion.div 
        animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" 
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Championships", href: "/championships" },
            { label: "2026 Meet Calendar" },
          ]}
          badge="Championship Calendar"
        />

        {/* ── Hero Section ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-[0_0_20px_rgba(230,80,27,0.2)]"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>IPF Sanctioned National Platform</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-xl"
          >
            National <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.5)]">
              Championships 2026
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal"
          >
            The pinnacle of Indian powerlifting. Verified under official IPF technical rules, calibrated Eleiko/Rogue plates, certified national referees, and 100% NADA anti-doping testing.
          </motion.p>

          {/* Direct CTA Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coaches Akash & Tanvi, I want to inquire about upcoming 2026 National Championship entries & preparation.")}`}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(37,211,102,0.7)] hover:brightness-105 transition-all cursor-pointer overflow-hidden border border-emerald-400/40"
            >
              <WhatsAppIcon variant="badge" className="h-6 w-6" />
              <span>Championship Desk: +91 7043951377</span>
            </a>

            <Link
              href="/live"
              className="flex items-center gap-2.5 rounded-full border border-red-500/50 bg-gradient-to-r from-red-600/20 via-black to-red-950/40 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span>Watch Live Stage</span>
            </Link>

            <Link
              href="/circulars"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gym-primary transition-all"
            >
              <FileText className="h-4 w-4 text-gym-primary" />
              <span>Download Circulars & Forms</span>
            </Link>
          </motion.div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center justify-center gap-3 mb-10 overflow-x-auto pb-2">
          {[
            { id: "calendar", label: "2026 Championship Calendar", icon: Calendar },
            { id: "divisions", label: "Official Divisions & Weight Classes", icon: Users },
            { id: "mqt", label: "National Qualification Standards (MQT)", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gym-primary text-white shadow-[0_0_20px_rgba(230,80,27,0.5)]"
                    : "border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/25"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Filter sub-bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Filter className="h-3.5 w-3.5 text-gym-primary" />
                  <span>Showing {filteredMeets.length} Official Meets</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                  {(["ALL", "ACTIVE", "COMPLETED"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        statusFilter === filter
                          ? "bg-gym-primary text-white shadow-sm"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {filter === "ALL" ? "All Meets" : filter === "ACTIVE" ? "Upcoming / Open" : "Past / Completed"}
                    </button>
                  ))}
                </div>
              </div>

              {filteredMeets.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-white/10 bg-[#120402]/60 p-8">
                  <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <h4 className="font-heading text-xl font-bold uppercase text-gray-300">No Meets Found</h4>
                  <p className="text-xs text-gray-500 mt-1">There are no meets currently matching this filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMeets.map((meet, idx) => (
                    <motion.div
                      key={meet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`group relative rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden ${
                        meet.status === "COMPLETED"
                          ? "border-zinc-800 bg-[#0e0a09]/70 opacity-80"
                          : "border-white/10 bg-[#120402]/80 hover:border-gym-primary/50"
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gym-primary/10 rounded-full blur-2xl group-hover:bg-gym-primary/20 transition-all pointer-events-none" />

                      <div>
                        {/* Header badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                          <span className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${meet.statusColor || "bg-gym-primary/20 text-gym-primary border-gym-primary/40"}`}>
                            {meet.status}
                          </span>
                          {meet.status !== "COMPLETED" ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                              <Clock className="h-3 w-3 text-gym-primary" />
                              <span>{meet.daysLeft > 0 ? `${meet.daysLeft} Days to Meet` : "Happening Now"}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              <span>Concluded</span>
                            </div>
                          )}
                        </div>

                        <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-1">
                          {meet.category}
                        </div>
                        <h3 className="font-heading text-2xl font-bold uppercase text-white group-hover:text-gym-primary transition-colors">
                          {meet.title}
                        </h3>

                        {/* Meta Details */}
                        <div className="mt-4 space-y-2 text-xs sm:text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gym-primary shrink-0" />
                            <span className="font-semibold text-white">{meet.dates}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gym-primary shrink-0" />
                            <span>{meet.venue}, {meet.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />
                            <span>Prize Pool: <strong className="text-yellow-400">{meet.prizePool}</strong></span>
                          </div>
                          {meet.entryFee && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="text-gym-primary font-bold">Entry Fee:</span>
                              <span>{meet.entryFee}</span>
                            </div>
                          )}
                        </div>

                        {/* Divisions included */}
                        {meet.divisions && meet.divisions.length > 0 && (
                          <div className="mt-5 pt-4 border-t border-white/10">
                            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Featured Divisions</div>
                            <div className="flex flex-wrap gap-2">
                              {meet.divisions.map((div, i) => (
                                <span key={i} className="text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                                  {div}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={meet.circularUrl || "/circulars"}
                            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-gym-primary transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Circular</span>
                          </Link>

                          <Link
                            href={`/live?meet=${meet.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                            title="Watch Live Stage Broadcast"
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                            </span>
                            <span>Live Arena</span>
                          </Link>
                        </div>

                        {meet.status !== "COMPLETED" ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi Coaches Akash & Tanvi, I have a question regarding ${meet.title}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-gray-300 hover:border-emerald-500 hover:text-emerald-400 transition-all"
                              title="Ask Coaches on WhatsApp"
                            >
                              <WhatsAppIcon variant="official" className="h-3.5 w-3.5" />
                            </a>

                            <Link
                              href={`/championships/${meet.id}/register`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                            >
                              <Trophy className="h-3.5 w-3.5" />
                              <span>Register Online</span>
                            </Link>
                          </div>
                        ) : (
                          <a
                            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi Coaches, I want to check scorecards & results for ${meet.title}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold uppercase text-zinc-300 hover:bg-white/10 transition-all"
                          >
                            <FileText className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Inquire Results</span>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "divisions" && (
            <motion.div
              key="divisions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Age Categories Card */}
              <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl">
                <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Sanctioned Age Brackets</div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mb-6">
                  National Competitive Divisions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Sub-Junior", age: "14 – 18 Years", desc: "For young rising athletes building foundational platform discipline." },
                    { title: "Junior", age: "19 – 23 Years", desc: "Highly competitive youth division contending for international spots." },
                    { title: "Open / Senior", age: "All Ages", desc: "Premier national open division featuring India's strongest lifters." },
                    { title: "Masters (I – IV)", age: "40 to 70+ Years", desc: "Split into 4 decade brackets celebrating lifelong strength." },
                  ].map((cat, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="font-heading text-lg font-bold uppercase text-white">{cat.title}</div>
                      <div className="text-xs font-bold text-gym-primary my-1">{cat.age}</div>
                      <div className="text-xs text-gray-300">{cat.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weight Classes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl">
                  <h4 className="font-heading text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-gym-primary" />
                    <span>Men's Official Weight Classes</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {WEIGHT_DIVISIONS.men.map((wc, i) => (
                      <div key={i} className="text-center rounded-xl border border-white/10 bg-white/5 py-3 px-2 font-heading font-bold text-sm text-white">
                        {wc}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl">
                  <h4 className="font-heading text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span>Women's Official Weight Classes</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {WEIGHT_DIVISIONS.women.map((wc, i) => (
                      <div key={i} className="text-center rounded-xl border border-white/10 bg-white/5 py-3 px-2 font-heading font-bold text-sm text-white">
                        {wc}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "mqt" && (
            <motion.div
              key="mqt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl overflow-x-auto"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Minimum Qualifying Totals</div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mb-4">
                National Entry Standards (Squat + Bench + Deadlift)
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-6 max-w-2xl">
                Lifters must hit or exceed the certified total in an affiliated State Championship or Zonal Qualifier to earn an official entry to the National Championship.
              </p>

              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/15 text-gray-400 font-black uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Weight Class</th>
                    <th className="py-3 px-4">Senior Men MQT</th>
                    <th className="py-3 px-4">Junior Men MQT</th>
                    <th className="py-3 px-4">Sub-Junior Men MQT</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {QUALIFYING_TOTALS_SAMPLE.map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-heading font-bold text-white">{row.wc}</td>
                      <td className="py-3.5 px-4 font-bold text-gym-primary">{row.srMen}</td>
                      <td className="py-3.5 px-4 text-gray-300">{row.jrMen}</td>
                      <td className="py-3.5 px-4 text-gray-400">{row.subJrMen}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Ratified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Direct Coach Preparation Consultation ── */}
        <div className="mt-14 rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1b0603] to-[#0c0201] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Championship Peaking & Attempt Strategy</span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Preparing for a 2026 National Platform?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-xl">
              Coaches Akash & Tanvi provide custom competition peaking cycles, attempt selection formulas (Opener, 2nd & 3rd attempts), water cut guidance, and meet-day handling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/coaching/powerlifting"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gym-primary transition-all"
            >
              <span>View Prep Coaching</span>
              <ArrowRight className="h-4 w-4 text-gym-primary" />
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coaches Akash & Tanvi, I am preparing for a Powerlifting Championship and need coaching/peaking guidance.")}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md hover:brightness-105 transition-all cursor-pointer"
            >
              <WhatsAppIcon variant="badge" className="h-5 w-5" />
              <span>Ask Coaches on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
