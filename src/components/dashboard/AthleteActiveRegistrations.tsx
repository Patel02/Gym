"use client";

import type { DigitalMeetTicketPayload } from "@/actions/championship-registration.actions";
import { DigitalMeetPassModal } from "@/components/championships/DigitalMeetPassModal";
import { AthleteWarmupLauncherModal } from "@/components/dashboard/AthleteWarmupLauncherModal";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  MapPin,
  QrCode,
  Scale,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AthleteActiveRegistrationsProps {
  initialRegistrations: DigitalMeetTicketPayload[];
}

export function AthleteActiveRegistrations({
  initialRegistrations,
}: AthleteActiveRegistrationsProps) {
  const [selectedTicket, setSelectedTicket] = useState<DigitalMeetTicketPayload | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);

  // Warm-Up launcher modal state
  const [isWarmupModalOpen, setIsWarmupModalOpen] = useState<boolean>(false);
  const [warmupTicket, setWarmupTicket] = useState<DigitalMeetTicketPayload | null>(null);

  const handleOpenTicket = (ticket: DigitalMeetTicketPayload) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  const handleOpenWarmup = (ticket: DigitalMeetTicketPayload) => {
    setWarmupTicket(ticket);
    setIsWarmupModalOpen(true);
  };

  if (!initialRegistrations || initialRegistrations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-linear-to-br from-[#120402] to-[#080201] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gym-primary" />
            <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white">
              Championship Meet Registrations
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">0 Active</span>
        </div>

        <div className="text-center py-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 mb-3">
            <Trophy className="h-6 w-6" />
          </div>
          <h4 className="font-heading text-sm font-bold uppercase text-white">No Active Championship Registrations</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 mb-4">
            You haven't entered any upcoming national or zonal powerlifting meets yet.
          </p>
          <Link
            href="/championships"
            className="inline-flex items-center gap-2 rounded-xl bg-gym-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 transition-all shadow-md"
          >
            <span>Explore 2026 Meet Calendar &amp; Register →</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-linear-to-br from-[#150602] to-[#0a0201] p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white">
                Active Championship Entry Passes &amp; Accreditation
              </h3>
              <span className="block text-[10px] text-gray-400">
                Official weigh-in slots &amp; match day platform roster entries
              </span>
            </div>
          </div>

          <Link
            href="/championships"
            className="text-xs font-bold text-gym-primary hover:underline"
          >
            View Full Meet Calendar →
          </Link>
        </div>

        {/* List of Registered Meets */}
        <div className="grid grid-cols-1 gap-4">
          {initialRegistrations.map((ticket) => (
            <div
              key={ticket.registrationId}
              className="rounded-2xl border border-gym-primary/30 bg-gradient-to-r from-[#1c0803]/80 via-black/80 to-[#140502]/80 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              
              {/* Meet & Lifter Info */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold uppercase">
                    CONFIRMED ENTRY
                  </span>
                  <span className="rounded-md bg-gym-primary/20 text-gym-primary border border-gym-primary/40 px-2 py-0.5 text-[10px] font-semibold uppercase">
                    LOT #{ticket.lotNumber}
                  </span>
                  <span className="rounded-md bg-white/10 text-gray-300 px-2 py-0.5 text-[10px] font-bold">
                    {ticket.flight}
                  </span>
                </div>

                <h4 className="font-heading text-lg font-bold uppercase text-white">
                  {ticket.meetTitle}
                </h4>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gym-primary" />
                    <strong className="text-white">{ticket.meetDate}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gym-primary" />
                    <span>{ticket.meetVenue}, {ticket.meetCity}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-amber-400" />
                    <span>Weigh-in: <strong className="text-white">{ticket.weighInTime.split("(")[0]}</strong></span>
                  </span>
                </div>

                <div className="text-xs text-gray-400 pt-1">
                  <span>Category: <strong className="text-white">{ticket.weightClass}</strong> • {ticket.division} ({ticket.equipment})</span>
                  <span className="mx-2">•</span>
                  <span>Openers: <strong className="text-emerald-400">S {ticket.squatOpener} | B {ticket.benchOpener} | D {ticket.deadliftOpener} KG</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap md:flex-col items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenTicket(ticket)}
                  className="flex-1 md:flex-initial w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
                >
                  <QrCode className="h-4 w-4" />
                  <span>View Pass (QR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenWarmup(ticket)}
                  className="flex-1 md:flex-initial w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:border-gym-primary hover:bg-gym-primary/10 hover:text-white transition-all cursor-pointer"
                >
                  <Dumbbell className="h-3.5 w-3.5 text-gym-primary" />
                  <span>Warm-Up Planner</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <DigitalMeetPassModal
          ticket={selectedTicket}
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
        />
      )}

      {/* Warmup Modal */}
      {warmupTicket && (
        <AthleteWarmupLauncherModal
          isOpen={isWarmupModalOpen}
          onClose={() => setIsWarmupModalOpen(false)}
          athleteName={warmupTicket.athleteName}
          bodyweight={parseFloat(warmupTicket.weightClass.replace(/[^0-9.]/g, "")) || 83}
          initialSquatOpener={warmupTicket.squatOpener}
          initialBenchOpener={warmupTicket.benchOpener}
          initialDeadliftOpener={warmupTicket.deadliftOpener}
        />
      )}
    </>
  );
}
