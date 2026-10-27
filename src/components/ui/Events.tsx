"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Calendar, ChevronRight, Download, FileText, MapPin, Clock } from "lucide-react";
import Link from "next/link";

const announcements = [
  { id: 1, date: "SEP 12, 2026", title: "WADA Anti-Doping Guidelines Updated for 2026-27", type: "alert" },
  { id: 2, date: "AUG 28, 2026", title: "Technical Rulebook Updates: Paused Bench Press Standards", type: "rule" },
  { id: 3, date: "AUG 15, 2026", title: "National Referee Certification Clinic - Registrations Open", type: "info" },
];

const upcomingEvents = [
  {
    id: 1,
    title: "National Raw Powerlifting Championship 2026",
    date: "OCT 15 - 18, 2026",
    location: "Ahmedabad, Gujarat",
    status: "Registrations Open",
    daysLeft: 33,
  },
  {
    id: 2,
    title: "WPC India Pro Qualifier & Deadlift Only Event",
    date: "NOV 05 - 06, 2026",
    location: "Mumbai, Maharashtra",
    status: "Upcoming",
    daysLeft: 54,
  },
];

export interface UiEventItem {
  id: string | number;
  title: string;
  date: string;
  location: string;
  status: string;
  daysLeft: number;
}

export interface UiAnnouncementItem {
  id: string | number;
  date: string;
  title: string;
  type: "alert" | "rule" | "info" | string;
  fileUrl?: string;
}

interface EventsProps {
  initialEvents?: any[];
  initialAnnouncements?: any[];
}

export default function Events({ initialEvents, initialAnnouncements }: EventsProps) {
  // Process dynamic events if passed
  const displayEvents: UiEventItem[] = (initialEvents && initialEvents.length > 0)
    ? initialEvents
        .filter((e) => e.status !== "COMPLETED" && e.isFeaturedOnHome !== false)
        .slice(0, 3)
        .map((e) => ({
          id: e.id,
          title: e.title,
          date: e.dates || "OCT 15, 2026",
          location: e.venue ? `${e.venue}, ${e.city}` : (e.location || e.city || "National Venue"),
          status: e.status === "REGISTRATION OPEN" ? "Registrations Open" : (e.status || "Upcoming"),
          daysLeft: e.daysLeft ?? 30
        }))
    : upcomingEvents;

  const displayAnnouncements: UiAnnouncementItem[] = (initialAnnouncements && initialAnnouncements.length > 0)
    ? initialAnnouncements.slice(0, 4).map((a) => ({
        id: a.id,
        date: a.date,
        title: a.title,
        type: a.type || "info",
        fileUrl: a.fileUrl || "/circulars"
      }))
    : announcements;
  return (
    <section id="events" className="relative z-10 w-full border-b border-white/5 bg-gym-black py-12 md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-24">

        {/* Header */}
        <div className="mb-8 md:mb-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-3.5">
              <Calendar className="h-4 w-4 text-gym-primary shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
                Calendar & Circulars • Federation Hub
              </span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black uppercase leading-[1.04] tracking-tight text-white drop-shadow-xl">
              Championships & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">
                Official Circulars
              </span>
            </h2>
            <p className="mt-3.5 mx-auto max-w-xl text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed">
              Stay ahead of the platform. Official meet notifications, registration windows, and technical rule updates.
            </p>
          </motion.div>
        </div>

        {/* Two-column grid */}
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">

          {/* Left: Circulars */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col lg:col-span-5"
          >
            <h3 className="mb-6 flex items-center gap-3 font-heading text-xl font-bold uppercase tracking-widest text-white">
              <span className="rounded-sm border border-white/10 bg-[#151515] p-2">
                <FileText className="h-5 w-5 text-gym-primary" />
              </span>
              Official Circulars
            </h3>

            <div className="flex flex-col gap-4">
              {displayAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex cursor-pointer items-start gap-4 overflow-hidden border border-white/5 bg-[#0a0a0a] p-6 transition-all duration-300 hover:bg-[#111111]"
                >
                  <div className="absolute left-0 top-0 h-full w-1 -translate-x-full bg-gym-primary transition-transform duration-300 group-hover:translate-x-0" />
                  <div className="mt-1">
                    {item.type === "alert" ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gym-primary" />
                    )}
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-bold tracking-widest text-gym-primary">{item.date}</span>
                    <h4 className="mb-3 font-sans text-base font-bold leading-snug text-gray-200 transition-colors group-hover:text-white md:text-lg">
                      {item.title}
                    </h4>
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-hover:text-gym-primary">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/circulars" className="group mt-6 mb-8 lg:mb-0 inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-white">
              View All Circulars
              <ChevronRight className="h-4 w-4 text-gym-primary transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Right: Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col lg:col-span-7"
          >
            <h3 className="mb-8 flex items-center gap-3 font-heading text-xl font-bold uppercase tracking-widest text-white">
              <span className="rounded-sm border border-white/10 bg-[#151515] p-2">
                <Calendar className="h-5 w-5 text-gym-primary" />
              </span>
              Upcoming Meets
            </h3>

            <div className="flex flex-col gap-6">
              {displayEvents.map((event) => (
                <div
                  key={event.id}
                  className="group relative flex flex-col overflow-hidden border border-white/10 bg-gradient-to-br from-[#0f0f0f] to-[#050505] shadow-2xl transition-all duration-300 hover:border-gym-primary/40 sm:flex-row"
                >
                  {/* Date block */}
                  <div className="flex flex-col items-center justify-center border-b border-white/5 bg-[#151515] p-6 text-center transition-colors duration-300 group-hover:bg-gym-primary sm:w-40 sm:border-b-0 sm:border-r">
                    <span className="mb-1 text-xs font-bold uppercase tracking-widest text-gym-primary transition-colors group-hover:text-black">
                      {event.date.split(",")[1] || "2026"}
                    </span>
                    <span className="font-heading text-2xl font-bold uppercase leading-tight text-white transition-colors group-hover:text-black">
                      {event.date.split(",")[0]}
                    </span>
                  </div>

                  {/* Info block */}
                  <div className="flex flex-1 flex-col justify-between gap-4 p-6 md:flex-row md:items-center md:p-8">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3 flex-wrap">
                        <span
                          className={`inline-block border px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                            event.status === "Registrations Open"
                              ? "border-gym-primary text-gym-primary"
                              : "border-gray-500 text-gray-500"
                          }`}
                        >
                          {event.status}
                        </span>
                        {event.status === "Registrations Open" && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
                            <Clock className="h-3 w-3" />
                            {event.daysLeft} days left
                          </span>
                        )}
                      </div>
                      <h4 className="mb-3 font-heading text-xl font-bold uppercase tracking-wider text-white transition-colors group-hover:text-gym-primary md:text-2xl">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                        <MapPin className="h-4 w-4 text-gym-primary" />
                        {event.location}
                      </div>
                    </div>

                    <Link
                      href="/championships"
                      className="group/btn relative inline-block shrink-0"
                    >
                      <span className="absolute inset-0 origin-left scale-x-0 bg-gym-primary transition-transform duration-300 group-hover/btn:scale-x-100" />
                      <span className="absolute inset-0 -skew-x-12 border border-white/20 transition-colors duration-300 group-hover/btn:border-transparent" />
                      <span className="relative z-10 block -skew-x-12 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors duration-300 group-hover/btn:text-black">
                        <span className="block skew-x-12">Details</span>
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/championships" className="group mt-6 inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-white">
              View Full Championship Calendar
              <ChevronRight className="h-4 w-4 text-gym-primary transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}