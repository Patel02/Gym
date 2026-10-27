"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { StateAssociation } from "@/data/federation-states";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Trophy, 
  Users, 
  X 
} from "lucide-react";

interface StateDossierModalProps {
  stateUnit: StateAssociation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StateDossierModal({
  stateUnit,
  isOpen,
  onClose,
}: StateDossierModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !stateUnit || typeof document === "undefined") return null;

  const cleanPhone = stateUnit.phone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello Secretary General (${stateUnit.shortName} Powerlifting Association), I am reaching out regarding athlete state registration and sanctioned championship inquiries.`
  )}`;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gym-primary/30 bg-[#120402] p-6 sm:p-8 text-white shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gym-primary">
            {stateUnit.zone.replace("_", " ")} ZONE
          </span>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            {stateUnit.sanctionStatus} AFFILIATE
          </span>
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white pr-8">
          {stateUnit.name}
        </h2>
        <div className="text-xs font-mono font-bold text-gray-400 mt-1">
          Official Charter Code: <span className="text-gym-primary">{stateUnit.code}</span> • Estd. {stateUnit.establishedYear}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center">
            <div className="text-[10px] font-bold uppercase text-gray-400">Accredited Clubs</div>
            <div className="font-heading text-xl font-bold text-white mt-0.5">{stateUnit.activeClubsCount} Gyms</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center">
            <div className="text-[10px] font-bold uppercase text-gray-400">Registered Lifters</div>
            <div className="font-heading text-xl font-bold text-gym-primary mt-0.5">{stateUnit.registeredAthletesCount}+</div>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center">
            <div className="text-[10px] font-bold uppercase text-gray-400">Headquarters</div>
            <div className="font-heading text-base font-bold text-white truncate mt-1">{stateUnit.hqCity}</div>
          </div>
        </div>

        {/* Executive Office Bearers */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 mb-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gym-primary flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Executive Council Leadership</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-gray-400 block text-[11px] uppercase">State President</span>
              <span className="font-bold text-white text-base">{stateUnit.president}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px] uppercase">Secretary General</span>
              <span className="font-bold text-white text-base">{stateUnit.secgen}</span>
            </div>
          </div>
        </div>

        {/* Upcoming Sanctioned Meet */}
        {stateUnit.upcomingStateMeet && (
          <div className="rounded-2xl border border-gym-primary/30 bg-gradient-to-br from-gym-primary/15 to-transparent p-5 mb-5">
            <div className="text-xs font-bold uppercase tracking-wider text-gym-primary flex items-center gap-1.5 mb-2">
              <Trophy className="h-4 w-4" />
              <span>Official Sanctioned State Championship</span>
            </div>
            <h4 className="font-heading text-base sm:text-lg font-bold text-white">
              {stateUnit.upcomingStateMeet.title}
            </h4>
            <div className="mt-2 space-y-1.5 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-gym-primary shrink-0" />
                <span>{stateUnit.upcomingStateMeet.dates}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gym-primary shrink-0" />
                <span>{stateUnit.upcomingStateMeet.venue}</span>
              </div>
              <div className="text-[11px] text-gray-400 pt-1">
                Entry Deadline: <span className="text-gym-primary font-bold">{stateUnit.upcomingStateMeet.entryDeadline}</span>
              </div>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2.5 text-xs sm:text-sm text-gray-300 mb-6">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gym-primary shrink-0" />
            <a href={`mailto:${stateUnit.email}`} className="text-white hover:text-gym-primary transition-colors">
              {stateUnit.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gym-primary shrink-0" />
            <span>{stateUnit.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gym-primary shrink-0" />
            <span>Secretariat HQ: {stateUnit.hqCity}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/10">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-105 transition-all"
          >
            <WhatsAppIcon variant="badge" className="h-4 w-4" />
            <span>WhatsApp Secretary</span>
          </a>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-heading text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
