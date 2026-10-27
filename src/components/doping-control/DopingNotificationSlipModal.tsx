"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  Printer,
  X,
  Clock,
  UserCheck,
  AlertTriangle,
  FileText,
  Building2,
} from "lucide-react";
import { DopingTestDrawCandidate } from "@/data/doping-control-data";

interface DopingNotificationSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: DopingTestDrawCandidate[];
  meetTitle: string;
}

export default function DopingNotificationSlipModal({
  isOpen,
  onClose,
  athletes,
  meetTitle,
}: DopingNotificationSlipModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !athletes.length) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const printStyles = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 8mm;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body > *:not(#print-slips-modal-root) {
        display: none !important;
        visibility: hidden !important;
      }
      #print-slips-modal-root {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        box-shadow: none !important;
      }
      .no-print {
        display: none !important;
      }
      #print-slips-container {
        display: block !important;
        visibility: visible !important;
        width: 100% !important;
        max-width: 195mm !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
        background: #ffffff !important;
        color: #0f172a !important;
        box-shadow: none !important;
      }
      .slip-card {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        border: 2px solid #0f172a !important;
        margin-bottom: 6mm !important;
        padding: 5mm !important;
        background: #ffffff !important;
        color: #0f172a !important;
      }
      #print-slips-container * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;

  return createPortal(
    <div
      id="print-slips-modal-root"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:inset-auto"
    >
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="relative w-full max-w-4xl my-auto print:max-w-none print:w-full print:m-0">
        {/* Screen Action Bar */}
        <div className="no-print mb-3 rounded-2xl border border-white/10 bg-zinc-950/95 p-3.5 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                Official Chaperone Notification Slips ({athletes.length} Athletes)
              </div>
              <p className="text-[11px] text-gray-400">
                1-Page A4 Printable Escort Orders • 60-Minute Mandatory DCS Arrival Window
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Slips (1-Page A4)</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Slips Container */}
        <div className="overflow-x-auto pb-2 print:overflow-visible print:pb-0">
          <div
            id="print-slips-container"
            className="relative mx-auto w-[820px] bg-[#fafaf9] text-slate-900 p-6 rounded-xl border-2 border-slate-800 shadow-2xl select-text print:border-none print:shadow-none print:rounded-none print:w-full print:p-0"
          >
            {athletes.map((athlete, idx) => (
              <div
                key={athlete.id}
                className={`slip-card rounded border border-slate-400 bg-white p-4 text-left ${
                  idx > 0 ? "mt-4" : ""
                }`}
              >
                {/* Header */}
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-600 font-mono">
                      NATIONAL ANTI-DOPING AGENCY (NADA INDIA) • WADA ISTI ARTICLE 5.4
                    </div>
                    <div className="text-sm font-bold uppercase text-slate-950 font-serif">
                      OFFICIAL ATHLETE DOPING CONTROL NOTIFICATION ORDER
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="rounded bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold">
                      SLIP #{athlete.notificationSlipNumber}
                    </span>
                    <div className="text-[8px] text-slate-500 mt-0.5">
                      Issued: {athlete.notificationTimestamp}
                    </div>
                  </div>
                </div>

                {/* Details Matrix */}
                <div className="mt-2.5 grid grid-cols-4 gap-2 text-[10px]">
                  <div className="border-r border-slate-200 pr-2">
                    <span className="text-[8px] font-mono uppercase text-slate-500 block">Selected Athlete</span>
                    <span className="font-serif font-black uppercase text-slate-900 text-xs block">
                      {athlete.name}
                    </span>
                    <span className="text-[9px] text-slate-600 block">{athlete.clubOrState}</span>
                  </div>

                  <div className="border-r border-slate-200 pr-2">
                    <span className="text-[8px] font-mono uppercase text-slate-500 block">Category / Lot</span>
                    <span className="font-bold text-slate-800 block">
                      {athlete.weightClass} • {athlete.division}
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 block">
                      {athlete.flight} (Lot #{athlete.lotNumber})
                    </span>
                  </div>

                  <div className="border-r border-slate-200 pr-2">
                    <span className="text-[8px] font-mono uppercase text-slate-500 block">Selection Reason</span>
                    <span className="inline-block rounded bg-amber-100 border border-amber-300 px-1.5 py-0.2 text-[8.5px] font-bold text-amber-900 uppercase">
                      {athlete.reasonForSelection.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] font-mono uppercase text-slate-500 block">Assigned Chaperone</span>
                    <span className="font-bold text-slate-800 block text-[11px]">
                      {athlete.chaperoneAssigned}
                    </span>
                  </div>
                </div>

                {/* 60-Minute Escort Notice */}
                <div className="mt-2 rounded border border-amber-400 bg-amber-50 p-2 flex items-center justify-between text-[9px]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-700 shrink-0" />
                    <div>
                      <strong className="text-amber-900 uppercase">Mandatory 60-Minute Reporting Window:</strong>
                      <span className="text-amber-800 ml-1">
                        Athlete must report to the Doping Control Station Room 104 under continuous chaperone visual observation.
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded text-[10px] shrink-0">
                    60:00 ESCORT LIMIT
                  </span>
                </div>

                {/* Signatures */}
                <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-4 text-[9px]">
                  <div className="border border-slate-300 rounded p-1.5 bg-slate-50">
                    <span className="text-[7.5px] font-mono uppercase text-slate-500 block">
                      Chaperone Escort Declaration
                    </span>
                    <div className="h-6 border-b border-slate-400 flex items-end pb-0.5">
                      <span className="font-serif italic text-xs text-slate-800">
                        {athlete.chaperoneAssigned.split("(")[0]}
                      </span>
                    </div>
                    <span className="text-[7px] text-slate-500 block mt-0.5">
                      I served this order personally and will keep continuous visual contact.
                    </span>
                  </div>

                  <div className="border border-slate-300 rounded p-1.5 bg-slate-50">
                    <span className="text-[7.5px] font-mono uppercase text-slate-500 block">
                      Athlete Acknowledgment of Notification
                    </span>
                    <div className="h-6 border-b border-slate-400 flex items-end pb-0.5">
                      <span className="font-serif italic text-xs text-slate-800">
                        {athlete.name}
                      </span>
                    </div>
                    <span className="text-[7px] text-slate-500 block mt-0.5">
                      I acknowledge notification and understand failure to comply constitutes an ADRV (Article 2.3).
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
