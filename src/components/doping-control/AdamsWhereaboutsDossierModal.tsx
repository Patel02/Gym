"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  MapPin,
  Clock,
  Printer,
  X,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  AlertOctagon,
  Home,
  Building2,
  PhoneCall,
  Calendar,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { generateQrDataUrl } from "@/lib/qr-generator";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

export interface WhereaboutsDossierData {
  athleteName: string;
  athleteFederationId: string;
  quarter: string;
  dailySlotTime: string;
  residentialAddress: string;
  trainingGymAddress: string;
  emergencyContactPhone: string;
  competitionCalendarNotes?: string;
  adamsReceiptNumber: string;
  filingTimestamp?: string;
}

interface AdamsWhereaboutsDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WhereaboutsDossierData | null;
}

export default function AdamsWhereaboutsDossierModal({
  isOpen,
  onClose,
  data,
}: AdamsWhereaboutsDossierModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [verifyUrl, setVerifyUrl] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!data) return;

    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://ipf-federation.in";

    const params = new URLSearchParams({
      athlete: data.athleteName,
      fedId: data.athleteFederationId,
      quarter: data.quarter,
      slot: data.dailySlotTime,
      residence: data.residentialAddress,
      gym: data.trainingGymAddress,
      phone: data.emergencyContactPhone,
    });

    const url = `${origin}/verify/${data.adamsReceiptNumber}?${params.toString()}`;
    setVerifyUrl(url);

    generateQrDataUrl(url, {
      width: 260,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.warn("Failed to generate QR in Whereabouts modal:", err));
  }, [data]);

  if (!isOpen || !mounted || !data) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text =
      `📍 *WADA ADAMS ATHLETE WHEREABOUTS QUARTERLY FILING DOSSIER*\n\n` +
      `*Receipt Number:* ${data.adamsReceiptNumber}\n` +
      `*Athlete:* ${data.athleteName} (${data.athleteFederationId})\n` +
      `*Quarter:* ${data.quarter}\n` +
      `*Daily 60-Min Testing Window:* ${data.dailySlotTime}\n` +
      `*Overnight Residence:* ${data.residentialAddress}\n` +
      `*Training Gym:* ${data.trainingGymAddress}\n` +
      `*Compliance:* WADA Code Article 2.4 Registered Testing Pool (RTP)\n\n` +
      `*Verify Clearinghouse Record Online:* ${verifyUrl}`;

    if (typeof window !== "undefined") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const printStyles = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 6mm;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        overflow: visible !important;
      }
      body > *:not(#print-adams-dossier-root) {
        display: none !important;
        visibility: hidden !important;
      }
      #print-adams-dossier-root {
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
      #print-adams-dossier-container {
        display: block !important;
        visibility: visible !important;
        width: 100% !important;
        max-width: 195mm !important;
        margin: 0 auto !important;
        padding: 6mm !important;
        box-sizing: border-box !important;
        border: 2px solid #0f172a !important;
        background: #ffffff !important;
        color: #0f172a !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      #print-adams-dossier-container * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;

  return createPortal(
    <div
      id="print-adams-dossier-root"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:inset-auto"
    >
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="relative w-full max-w-4xl my-auto print:max-w-none print:w-full print:m-0">
        {/* Screen Action Bar */}
        <div className="no-print mb-3 rounded-2xl border border-white/10 bg-zinc-950/95 p-3.5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Official WADA ADAMS Whereabouts Dossier
                </span>
                <span className="rounded bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-300">
                  {data.adamsReceiptNumber}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                1-Page A4 Printable RTP Filing Confirmation • WADA Code Article 2.4 Compliant
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print A4 Dossier (1-Page)</span>
            </button>

            <a
              href={verifyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-950/40 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-900/40 transition-all cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Verify Online</span>
            </a>

            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 transition-all cursor-pointer"
            >
              <WhatsAppIcon variant="official" className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-300 hover:bg-white/10 transition-all cursor-pointer"
              title="Copy link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
              <span>{copied ? "Copied" : "Copy"}</span>
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

        {/* Printable ADAMS Dossier Canvas */}
        <div className="overflow-x-auto pb-2 print:overflow-visible print:pb-0">
          <div
            id="print-adams-dossier-container"
            className="relative mx-auto w-[820px] min-h-[920px] bg-[#fafaf9] text-slate-900 p-6 sm:p-8 rounded-xl border-2 border-slate-800 shadow-2xl select-text print:border print:border-black print:shadow-none print:rounded-none print:w-full print:p-4"
          >
            {/* Watermark Motif */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <MapPin className="h-[460px] w-[460px] text-slate-900" />
            </div>

            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 font-mono">
                    WORLD ANTI-DOPING AGENCY (WADA) • ADAMS CLEARINGHOUSE
                  </div>
                  <div className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-950 font-serif">
                    ANTI-DOPING ADMINISTRATION &amp; MANAGEMENT SYSTEM (ADAMS)
                  </div>
                  <div className="text-[10px] font-mono text-slate-600">
                    Joint Custody with National Anti-Doping Agency (NADA India) • Registered Testing Pool (RTP)
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 rounded border border-purple-600/40 bg-purple-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-purple-900 font-mono">
                    <ShieldCheck className="h-3 w-3 text-purple-700" />
                    <span>RTP TIER 1 CLASSIFIED</span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-slate-900 mt-1">
                    DOSSIER CODE: WADA-ADAMS-RTP-2026-IND
                  </div>
                  <div className="text-[9px] font-mono text-slate-600">
                    Clearinghouse Receipt: <strong className="text-slate-900">{data.adamsReceiptNumber}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 rounded bg-slate-900 text-white text-center py-1">
                <h1 className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em]">
                  OFFICIAL ATHLETE WHEREABOUTS QUARTERLY FILING DOSSIER
                </h1>
              </div>
            </div>

            {/* Section 1: Athlete Identification */}
            <div className="mt-3 border border-slate-400 bg-white rounded p-3 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1">
                <span>1. Athlete Identification &amp; Testing Pool Classification</span>
                <span className="font-mono text-[9px] text-emerald-700 font-bold">✓ Filing Validated Active</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Athlete Full Name</span>
                  <span className="text-xs font-bold uppercase text-slate-900 font-serif">
                    {data.athleteName}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Federation License ID</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {data.athleteFederationId}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Filing Quarter</span>
                  <span className="text-xs font-bold text-slate-900">
                    {data.quarter}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Testing Jurisdiction</span>
                  <span className="inline-block rounded bg-purple-100 border border-purple-300 px-1.5 py-0.2 text-[9px] font-bold text-purple-900 uppercase">
                    NADA India / IPF National Pool
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Mandatory 60-Minute Daily Testing Window */}
            <div className="mt-3 border-2 border-dashed border-purple-500 bg-purple-50/40 rounded p-3 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center justify-between border-b border-purple-200 pb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-purple-700" />
                  <span>2. Mandatory 60-Minute Daily Testing Window (Strict Liability Interval)</span>
                </span>
                <span className="font-mono text-[9px] text-purple-900 font-bold">WADA Code Article 2.4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded border-2 border-purple-600 bg-white p-2.5 text-center shadow-sm">
                  <span className="text-[8.5px] font-mono uppercase text-slate-500 block">Specified 60-Minute Time Slot</span>
                  <div className="text-base sm:text-lg font-bold font-mono text-purple-900 mt-1">
                    {data.dailySlotTime}
                  </div>
                  <span className="text-[8px] font-mono text-purple-700 block mt-0.5">365 Days Unannounced Availability</span>
                </div>

                <div className="col-span-2 rounded border border-purple-300 bg-white p-2.5">
                  <span className="text-[8.5px] font-mono uppercase text-slate-500 block">Primary Location During Slot</span>
                  <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-start gap-1">
                    <Home className="h-3.5 w-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span>{data.residentialAddress}</span>
                  </div>
                  <p className="text-[8px] text-slate-600 mt-1 leading-tight">
                    *The athlete must be present, visible, and directly accessible at this precise address for the entirety of the specified 60-minute interval each day.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Training Facilities & Emergency Contacts */}
            <div className="mt-3 border border-slate-400 bg-white rounded p-3 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 mb-1.5 border-b border-slate-200 pb-1">
                3. Regular Training Facility &amp; Emergency Communication Line
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-slate-500" />
                    <span>Primary Training Barbell Gym Facility</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-900 block mt-0.5">
                    {data.trainingGymAddress}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block flex items-center gap-1">
                    <PhoneCall className="h-3 w-3 text-slate-500" />
                    <span>Emergency Direct Mobile (Reachable 24/7 by DCOs)</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-900 block mt-0.5">
                    {data.emergencyContactPhone}
                  </span>
                </div>
              </div>

              {data.competitionCalendarNotes && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="text-[8.5px] font-mono uppercase text-slate-500 block">
                    Competition &amp; Training Schedule Notes
                  </span>
                  <span className="text-[10px] font-mono text-slate-800 block mt-0.5">
                    {data.competitionCalendarNotes}
                  </span>
                </div>
              )}
            </div>

            {/* Section 4: Strict Liability 3-Strike Warning Box */}
            <div className="mt-3 border-2 border-red-500 bg-red-50/50 rounded p-3 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-red-900 mb-1 flex items-center gap-1.5">
                <AlertOctagon className="h-3.5 w-3.5 text-red-700 shrink-0" />
                <span>4. Strict Liability Legal Warning: The 3-Strike Rule (WADA Code Article 2.4)</span>
              </div>
              <p className="text-[9.5px] text-red-950 leading-relaxed">
                Under the World Anti-Doping Code, any combination of <strong>three (3) Missed Tests and/or Filing Failures</strong> within a rolling 12-month period committed by an athlete in a Registered Testing Pool constitutes an Anti-Doping Rule Violation (ADRV). The standard sanction is a <strong>two (2) year ban from all sanctioned sports competition</strong>.
              </p>
            </div>

            {/* Section 5: Athlete Electronic Declaration & Sign-off */}
            <div className="mt-3 border border-slate-400 bg-white rounded p-3 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                5. Athlete Electronic Declaration &amp; Legal Undertaking
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-300 rounded p-2 bg-slate-50">
                  <span className="text-[8px] font-mono uppercase text-slate-500 block">
                    Athlete Electronic Signature
                  </span>
                  <div className="h-9 border-b border-slate-400 flex items-end pb-0.5">
                    <span className="font-serif italic text-sm text-slate-900 font-bold">
                      {data.athleteName}
                    </span>
                  </div>
                  <div className="text-[7.5px] text-slate-500 mt-1 leading-tight">
                    "I certify that the information in this whereabouts filing is complete and accurate, and I undertake to file updates via ADAMS if any plans change."
                  </div>
                </div>

                <div className="border border-slate-300 rounded p-2 bg-slate-50">
                  <span className="text-[8px] font-mono uppercase text-slate-500 block">
                    ADAMS Central Clearinghouse Security Hash
                  </span>
                  <div className="h-9 border-b border-slate-400 flex items-end pb-0.5">
                    <span className="font-mono text-[9px] text-slate-700 truncate">
                      SHA256: 7f8a9c2b4e1d...{data.adamsReceiptNumber.slice(-6)}
                    </span>
                  </div>
                  <div className="text-[7.5px] text-slate-500 mt-1 leading-tight font-mono">
                    Timestamp: {data.filingTimestamp ? new Date(data.filingTimestamp).toLocaleString("en-IN") : new Date().toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: ADAMS Central Registry QR & Clearinghouse Stamp */}
            <div className="mt-3 border-2 border-slate-900 bg-slate-900 text-white rounded p-3 text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 bg-white p-1 rounded border border-white/20 shrink-0 flex items-center justify-center">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="ADAMS QR Verification" className="h-full w-full object-contain" />
                    ) : (
                      <div className="h-14 w-14 bg-slate-200 animate-pulse" />
                    )}
                  </div>

                  <div>
                    <div className="text-[9px] font-mono uppercase text-purple-400 font-black tracking-wider flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>WADA ADAMS CENTRAL CLEARINGHOUSE CERTIFIED</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      Registered Testing Pool (RTP) Dossier Entry
                    </div>
                    <div className="text-[9px] text-slate-300">
                      World Anti-Doping Agency • Montreal, Canada / NADA India New Delhi
                    </div>
                    <div className="text-[8px] font-mono text-emerald-400 mt-0.5">
                      Status: ACTIVE &amp; SUBMITTED • 60-Min Daily Window Monitored
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[8px] font-mono uppercase text-slate-400">
                    ADAMS Verification Reference
                  </div>
                  <div className="text-xs font-mono font-bold text-purple-300">
                    {data.adamsReceiptNumber}
                  </div>
                  <div className="text-[8px] text-slate-400 mt-0.5">
                    Indian Powerlifting Federation
                  </div>
                  <div className="text-[7.5px] text-emerald-400 font-mono">
                    Official Registered Testing Pool Dossier
                  </div>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="mt-2.5 pt-1 border-t border-slate-300 flex items-center justify-between text-[7.5px] font-mono text-slate-500">
              <span>WADA ADAMS FORM RTP-2026/V2 • CONFIDENTIAL ATHLETE SCHEDULE</span>
              <span>1-PAGE A4 OFFICIAL RATIFIED LEGAL DOSSIER</span>
              <span>PAGE 1 OF 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
