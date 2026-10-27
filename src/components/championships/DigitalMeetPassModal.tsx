"use client";

import type { DigitalMeetTicketPayload } from "@/actions/championship-registration.actions";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  ExternalLink,
  Flame,
  MapPin,
  Printer,
  QrCode,
  Scale,
  Share2,
  ShieldCheck,
  Trophy,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DigitalMeetPassModalProps {
  ticket: DigitalMeetTicketPayload;
  isOpen: boolean;
  onClose: () => void;
}

export function DigitalMeetPassModal({
  ticket,
  isOpen,
  onClose,
}: DigitalMeetPassModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(ticket.verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const whatsappMessage = encodeURIComponent(
    `🎟️ *OFFICIAL CHAMPIONSHIP ENTRY PASS & WEIGH-IN ACCREDITATION*\n\n` +
      `Athlete: *${ticket.athleteName}*\n` +
      `Meet: *${ticket.meetTitle}*\n` +
      `Division: *${ticket.weightClass} • ${ticket.division} (${ticket.equipment})*\n` +
      `Lot Number: *#${ticket.lotNumber}* | Flight: *${ticket.flight}*\n` +
      `Weigh-In Window: *${ticket.weighInTime}*\n` +
      `Nominated Openers: Squat *${ticket.squatOpener}kg* | Bench *${ticket.benchOpener}kg* | Deadlift *${ticket.deadliftOpener}kg*\n` +
      `Accreditation Ticket: *${ticket.ticketCode}*\n\n` +
      `Official Verification: ${ticket.verificationUrl}`
  );

  const modalContent = (
    <div
      id="print-meetpass-modal-root"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/85 transition-opacity duration-200"
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body > *:not(#print-meetpass-modal-root) {
            display: none !important;
          }
          #print-meetpass-modal-root {
            position: absolute !important;
            inset: 0 !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .screen-only-pass {
            display: none !important;
          }
          .print-only-pass {
            display: block !important;
            color: #000000 !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════════════════
          1. SCREEN VIEW (Interactive Luxury Olympic Accreditation Badge)
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="screen-only-pass relative w-full max-w-3xl rounded-3xl border border-gym-primary/40 bg-gradient-to-b from-[#180803] via-[#0e0301] to-[#120402] p-5 sm:p-7 shadow-[0_0_80px_rgba(230,80,27,0.3)] text-white my-auto">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                OFFICIAL MEET ACCREDITATION PASS
              </span>
              <span className="block text-[10px] font-mono text-emerald-400">
                STATUS: CONFIRMED &amp; RATIFIED
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-300 hover:border-gym-primary hover:bg-gym-primary hover:text-white transition-all cursor-pointer"
              title="Print Official A4 Weigh-In Pass"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print Pass</span>
            </button>

            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
              title="Share via WhatsApp"
            >
              <WhatsAppIcon variant="official" className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-300 hover:border-white hover:text-white transition-all cursor-pointer"
              title="Copy Verification Link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy Link"}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition-all cursor-pointer ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── PASS BODY ── */}
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#1c0803] to-[#0a0201] p-5 sm:p-6 relative overflow-hidden shadow-2xl">
          
          {/* Subtle Olympic Watermark Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gym-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />

          {/* Pass Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-gym-primary/80 shadow-[0_0_15px_rgba(230,80,27,0.4)] bg-black shrink-0">
                <Image
                  src="/images/at-logo.png"
                  alt="A&T Fitness Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
                  A&amp;T <span className="text-gym-primary">POWERLIFTING</span>
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Affiliated with Indian Powerlifting Federation (IPF)
                </span>
              </div>
            </div>

            {/* Meet Lot Number Plaque */}
            <div className="flex items-center gap-2">
              <div className="rounded-xl border-2 border-gym-primary bg-gym-primary/20 px-4 py-1.5 text-center shadow-[0_0_20px_rgba(230,80,27,0.3)]">
                <span className="block text-[9px] font-semibold uppercase tracking-widest text-gym-primary">
                  ASSIGNED LOT
                </span>
                <span className="font-heading text-2xl font-bold text-white">
                  #{ticket.lotNumber}
                </span>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-center">
                <span className="block text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                  PLATFORM FLIGHT
                </span>
                <span className="font-heading text-base font-bold text-emerald-400">
                  {ticket.flight.split("(")[0].trim()}
                </span>
              </div>
            </div>
          </div>

          {/* Event Title Banner */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gym-primary">
              SANCTIONED CHAMPIONSHIP
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase text-white mt-0.5">
              {ticket.meetTitle}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gym-primary" />
                <strong className="text-white">{ticket.meetDate}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gym-primary" />
                <span>{ticket.meetVenue}, {ticket.meetCity}</span>
              </span>
            </div>
          </div>

          {/* Athlete Profile & QR Code Grid */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
            
            {/* Left 2 Cols: Athlete Details */}
            <div className="sm:col-span-2 space-y-4">
              <div className="flex items-center gap-4">
                {ticket.athletePhoto ? (
                  <div className="relative h-18 w-18 rounded-2xl overflow-hidden border-2 border-gym-primary/60 shadow-lg shrink-0">
                    <Image
                      src={ticket.athletePhoto}
                      alt={ticket.athleteName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-18 w-18 items-center justify-center rounded-2xl border-2 border-gym-primary/60 bg-gym-primary/20 font-heading text-2xl font-bold text-gym-primary shadow-lg shrink-0">
                    {ticket.athleteName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-heading text-2xl font-bold uppercase tracking-wide text-white">
                    {ticket.athleteName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-gym-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-black">
                      {ticket.weightClass}
                    </span>
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-200">
                      {ticket.division}
                    </span>
                    <span className="rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold">
                      {ticket.equipment}
                    </span>
                  </div>
                  <span className="block mt-1 text-[11px] text-gray-400 font-mono">
                    ID: {ticket.ticketCode}
                  </span>
                </div>
              </div>

              {/* Schedule Info Box */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[10px] uppercase">
                    <Scale className="h-3 w-3" />
                    <span>Official Weigh-In</span>
                  </div>
                  <span className="block font-heading text-sm font-black text-white mt-1">
                    {ticket.weighInTime.split("(")[0]}
                  </span>
                  <span className="block text-[9px] text-gray-400">Scale Room 1</span>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[10px] uppercase">
                    <Clock className="h-3 w-3" />
                    <span>Lifting Starts</span>
                  </div>
                  <span className="block font-heading text-sm font-black text-white mt-1">
                    {ticket.liftingTime}
                  </span>
                  <span className="block text-[9px] text-gray-400">Platform Stage 1</span>
                </div>
              </div>

              {/* Nominated Openers Pill */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="block text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Nominated Opening Attempts &amp; Technical Rack Pin
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-white/5 p-2">
                    <span className="text-[10px] text-gym-primary font-bold">SQUAT</span>
                    <span className="block font-heading text-base font-bold text-white mt-0.5">
                      {ticket.squatOpener} <span className="text-[10px] font-normal text-gray-400">KG</span>
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">Pin #{ticket.squatRackPin}</span>
                  </div>

                  <div className="rounded-lg bg-white/5 p-2">
                    <span className="text-[10px] text-gym-primary font-bold">BENCH</span>
                    <span className="block font-heading text-base font-bold text-white mt-0.5">
                      {ticket.benchOpener} <span className="text-[10px] font-normal text-gray-400">KG</span>
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">Pin #{ticket.benchRackPin}</span>
                  </div>

                  <div className="rounded-lg bg-white/5 p-2">
                    <span className="text-[10px] text-gym-primary font-bold">DEADLIFT</span>
                    <span className="block font-heading text-base font-bold text-white mt-0.5">
                      {ticket.deadliftOpener} <span className="text-[10px] font-normal text-gray-400">KG</span>
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">Platform Bar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Dynamic QR Code Box */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-white p-4 text-center shadow-lg text-black">
              <div className="relative h-40 w-40 overflow-hidden">
                <Image
                  src={ticket.qrDataUrl}
                  alt="Ticket Verification QR"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-black">
                WEIGH-IN DESK SCAN
              </span>
              <span className="text-[8px] font-bold text-gray-500">
                Official Marshal Check-in
              </span>
              <span className="mt-1 font-mono text-[9px] font-bold text-gray-700 break-all">
                {ticket.ticketCode}
              </span>
            </div>

          </div>

          {/* Footer Barcode & Rules Notice */}
          <div className="mt-5 border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-[11px]">
                NADA Strict Liability &amp; IPF Technical Rules Verified. Bring valid Govt Photo ID to Scale.
              </span>
            </div>

            <Link
              href={`/tools/warmup-calculator`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-gym-primary hover:underline"
            >
              <Dumbbell className="h-3 w-3" />
              <span>Launch Warm-Up Room &amp; Plate Planner →</span>
            </Link>
          </div>

        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          2. PRINT-ONLY SHEET (1-Page A4 Portrait Official Technical Accreditation Pass)
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="print-only-pass hidden w-full max-w-2xl bg-white text-black p-8 font-sans border-4 border-black">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wider uppercase">
              INDIAN POWERLIFTING FEDERATION
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-700">
              OFFICIAL CHAMPIONSHIP ACCREDITATION &amp; WEIGH-IN PASS
            </p>
          </div>
          <div className="text-right">
            <div className="border-2 border-black px-4 py-1 inline-block">
              <span className="block text-[10px] font-semibold uppercase">LOT NUMBER</span>
              <span className="text-2xl font-bold">#{ticket.lotNumber}</span>
            </div>
          </div>
        </div>

        {/* Meet Banner */}
        <div className="my-4 bg-gray-100 p-3 border border-black">
          <p className="text-[10px] font-bold uppercase text-gray-600">SANCTIONED MEET</p>
          <h2 className="text-lg font-bold uppercase leading-tight">{ticket.meetTitle}</h2>
          <p className="text-xs mt-1 font-semibold">
            {ticket.meetDate} • {ticket.meetVenue}, {ticket.meetCity}
          </p>
        </div>

        {/* Main Grid: Lifter & QR */}
        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="col-span-2 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-600">ATHLETE NAME</p>
              <h3 className="text-2xl font-bold uppercase">{ticket.athleteName}</h3>
              <p className="text-xs font-bold text-gray-800 font-mono mt-0.5">
                Reg ID: {ticket.ticketCode} • PayRef: {ticket.paymentTxnId}
              </p>
            </div>

            <table className="w-full text-xs border border-black">
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-2 font-bold bg-gray-100 w-1/3">WEIGHT CLASS</td>
                  <td className="p-2 font-black">{ticket.weightClass} ({ticket.gender})</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-2 font-bold bg-gray-100">DIVISION</td>
                  <td className="p-2 font-black">{ticket.division}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-2 font-bold bg-gray-100">EQUIPMENT</td>
                  <td className="p-2 font-black">{ticket.equipment}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-2 font-bold bg-gray-100">WEIGH-IN WINDOW</td>
                  <td className="p-2 font-black">{ticket.weighInTime}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-gray-100">PLATFORM TIME</td>
                  <td className="p-2 font-black">{ticket.liftingTime}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-black p-2 text-center">
            <div className="relative h-36 w-36">
              <Image
                src={ticket.qrDataUrl}
                alt="Ticket QR"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-[9px] font-semibold uppercase mt-2">WEIGH-IN DESK SCAN</p>
            <p className="text-[8px] font-mono text-gray-700">{ticket.ticketCode}</p>
          </div>
        </div>

        {/* Nominated Opener Card */}
        <div className="my-4 border-2 border-black p-3">
          <p className="text-xs font-bold uppercase border-b border-black pb-1 mb-2">
            OFFICIAL PLATFORM NOMINATIONS &amp; RACK HEIGHTS
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="border border-black p-2">
              <p className="text-[10px] font-bold uppercase">SQUAT OPENER</p>
              <p className="text-xl font-bold">{ticket.squatOpener} KG</p>
              <p className="text-[10px]">Rack Pin: #{ticket.squatRackPin}</p>
            </div>
            <div className="border border-black p-2">
              <p className="text-[10px] font-bold uppercase">BENCH OPENER</p>
              <p className="text-xl font-bold">{ticket.benchOpener} KG</p>
              <p className="text-[10px]">Rack Pin: #{ticket.benchRackPin}</p>
            </div>
            <div className="border border-black p-2">
              <p className="text-[10px] font-bold uppercase">DEADLIFT OPENER</p>
              <p className="text-xl font-bold">{ticket.deadliftOpener} KG</p>
              <p className="text-[10px]">Platform Standard</p>
            </div>
          </div>
        </div>

        {/* Official Check-In Desk Signoff */}
        <div className="mt-8 pt-4 border-t-2 border-black grid grid-cols-3 gap-4 text-xs text-center">
          <div>
            <div className="h-10 border-b border-black mb-1"></div>
            <p className="font-bold">Official Weigh-In Marshall</p>
            <p className="text-[10px] text-gray-600">Scale Reading: _______ KG</p>
          </div>
          <div>
            <div className="h-10 border-b border-black mb-1"></div>
            <p className="font-bold">Equipment Check Marshall</p>
            <p className="text-[10px] text-gray-600">Suit / Belt / Sleeves Approved</p>
          </div>
          <div>
            <div className="h-10 border-b border-black mb-1"></div>
            <p className="font-bold">Athlete Signature</p>
            <p className="text-[10px] text-gray-600">Agreed to Declaration</p>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
