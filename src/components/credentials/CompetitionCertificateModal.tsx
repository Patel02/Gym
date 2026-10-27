"use client";

import type { CompetitionCertificatePayload } from "@/actions/certificate.actions";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Printer,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface CompetitionCertificateModalProps {
  certificate: CompetitionCertificatePayload;
  isOpen: boolean;
  onClose: () => void;
}

export function CompetitionCertificateModal({
  certificate,
  isOpen,
  onClose,
}: CompetitionCertificateModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(certificate.verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `🏆 *OFFICIAL IPF COMPETITION CERTIFICATE RATIFIED*\n\n` +
      `Athlete: *${certificate.athleteName}*\n` +
      `Championship: *${certificate.meetTitle}*\n` +
      `Category: *${certificate.weightClass} KG (${certificate.division} ${certificate.equipment})*\n` +
      `Squat: *${certificate.bestSquat} KG* | Bench: *${certificate.bestBench} KG* | Deadlift: *${certificate.bestDeadlift} KG*\n` +
      `Official Total: *${certificate.total} KG* (IPF GL: *${certificate.ipfGlPoints}*)\n` +
      `Standing: *${certificate.medalText}*\n\n` +
      `Official Verification Code: *${certificate.verificationCode}*\n` +
      `Verify Authenticity Online: ${certificate.verificationUrl}`
  );

  const printStyles = `
    @media print {
      @page {
        size: A4 landscape;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body > *:not(#print-certificate-modal-root) {
        display: none !important;
        visibility: hidden !important;
      }
      #print-certificate-modal-root {
        display: block !important;
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        box-shadow: none !important;
        z-index: 9999999 !important;
      }
      .no-print {
        display: none !important;
      }
      #print-certificate-container {
        display: block !important;
        visibility: visible !important;
        width: 297mm !important;
        height: 210mm !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        margin: 0 !important;
        border: none !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      #print-certificate-container * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;

  return createPortal(
    <div
      id="print-certificate-modal-root"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 print:p-0 print:m-0 print:bg-white print:static print:inset-auto"
    >
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="relative w-full max-w-5xl rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#180802] via-[#0d0301] to-black p-4 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.25)] text-white my-auto print:border-none print:shadow-none print:p-0 print:bg-white">
        
        {/* Modal Top Control Bar */}
        <div className="no-print flex items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-400 shadow-md">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                  Official Competition Certificate
                </span>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Ratified
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Tamper-proof verifiable credential • IPF Rulebook certified
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── THE CERTIFICATE CANVAS (A4 Landscape Proportions) ── */}
        <div className="overflow-x-auto pb-4">
          <div
            id="print-certificate-container"
            ref={certRef}
            className="relative mx-auto w-[860px] min-h-[580px] bg-[#fcfaf5] text-zinc-900 p-8 sm:p-10 rounded-2xl shadow-2xl overflow-hidden border-[12px] border-[#1a0f07] select-text"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.03) 0%, rgba(0, 0, 0, 0) 70%)",
            }}
          >
            {/* Inner Double Gold Filigree Border */}
            <div className="absolute inset-3 border-2 border-[#b8860b]/60 pointer-events-none rounded-lg" />
            <div className="absolute inset-4 border border-[#b8860b]/40 pointer-events-none rounded" />

            {/* Ornate Corner Accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#b8860b] pointer-events-none" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#b8860b] pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#b8860b] pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#b8860b] pointer-events-none" />

            {/* Background Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <Trophy className="w-96 h-96 text-[#b8860b]" />
            </div>

            {/* Certificate Header */}
            <div className="relative z-10 text-center mb-6">
              <div className="flex items-center justify-between px-6 mb-2">
                {/* Federation Logo */}
                <div className="flex items-center gap-2.5">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-[#b8860b] shadow-sm bg-black">
                    <img
                      src={certificate.logoUrl || "/images/at-logo.png"}
                      alt="Federation Logo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-heading text-xs font-bold uppercase tracking-wider text-[#1a0f07]">
                      {certificate.federationName || "Indian Powerlifting Federation"}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-[#b8860b]">
                      {certificate.tagline || "Estd. 1975 • Affiliated Member"}
                    </div>
                  </div>
                </div>

                {/* Verification Code Box */}
                <div className="text-right">
                  <div className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
                    Official Certificate Code
                  </div>
                  <div className="font-mono text-xs font-bold tracking-wider text-[#996515] bg-[#b8860b]/10 px-2.5 py-1 rounded border border-[#b8860b]/30">
                    {certificate.verificationCode}
                  </div>
                </div>
              </div>

              {/* Title Crest */}
              <div className="inline-block border-b-2 border-[#b8860b] pb-1 px-8 mb-2">
                <span className="font-serif text-3xl font-bold uppercase tracking-[0.25em] text-[#1a0f07]">
                  Certificate of Merit
                </span>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#b8860b]">
                National Powerlifting Championships • Official Record
              </div>
            </div>

            {/* Award Text */}
            <div className="relative z-10 text-center space-y-3 mb-6">
              <p className="font-serif italic text-sm text-zinc-600">
                This is officially conferred upon
              </p>

              {/* Athlete Name */}
              <div className="font-serif text-3xl sm:text-4xl font-black uppercase tracking-wider text-[#1a0f07] border-b border-zinc-300 inline-block px-10 pb-1">
                {certificate.athleteName}
              </div>

              <p className="text-xs text-zinc-700 max-w-xl mx-auto leading-relaxed pt-1">
                for distinguished competitive performance in the{" "}
                <strong className="text-zinc-900 font-bold uppercase">
                  {certificate.weightClass} KG Division ({certificate.gender} • {certificate.division} {certificate.equipment})
                </strong>{" "}
                at the sanctioned championship:
              </p>

              {/* Meet Title */}
              <div className="font-heading text-lg font-bold uppercase tracking-wide text-[#b8860b] pt-0.5">
                {certificate.meetTitle}
              </div>

              <div className="text-[11px] font-semibold text-zinc-500">
                Conducted at {certificate.meetLocation} • {certificate.meetDate}
              </div>
            </div>

            {/* Official Performance Breakdown Grid */}
            <div className="relative z-10 bg-white/80 backdrop-blur-xs rounded-xl border border-zinc-200 p-4 mb-6 shadow-xs max-w-2xl mx-auto">
              <div className="grid grid-cols-5 divide-x divide-zinc-200 text-center">
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                    Best Squat
                  </div>
                  <div className="font-heading text-base font-bold text-zinc-900 mt-0.5">
                    {certificate.bestSquat} <span className="text-[10px] text-zinc-500">KG</span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                    Best Bench
                  </div>
                  <div className="font-heading text-base font-bold text-zinc-900 mt-0.5">
                    {certificate.bestBench} <span className="text-[10px] text-zinc-500">KG</span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                    Best Deadlift
                  </div>
                  <div className="font-heading text-base font-bold text-zinc-900 mt-0.5">
                    {certificate.bestDeadlift} <span className="text-[10px] text-zinc-500">KG</span>
                  </div>
                </div>
                <div className="bg-[#b8860b]/5">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#996515]">
                    Total Lifted
                  </div>
                  <div className="font-heading text-base font-bold text-[#996515] mt-0.5">
                    {certificate.total} <span className="text-[10px]">KG</span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                    IPF GL Points
                  </div>
                  <div className="font-heading text-base font-bold text-zinc-900 mt-0.5">
                    {certificate.ipfGlPoints}
                  </div>
                </div>
              </div>
            </div>

            {/* Standing & Medal Plaque */}
            <div className="relative z-10 text-center mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/40 bg-amber-50 px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#996515] shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>{certificate.medalText}</span>
              </span>
            </div>

            {/* Footer Signatures & QR Code */}
            <div className="relative z-10 flex items-end justify-between px-6 pt-2 border-t border-zinc-300">
              
              {/* Dynamic QR Verification Block */}
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 bg-white p-1 rounded-lg border border-zinc-300 shadow-sm shrink-0">
                  <img
                    src={certificate.qrDataUrl}
                    alt="Certificate QR Verification"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="text-left">
                  <div className="text-[8px] font-black uppercase tracking-wider text-zinc-500">
                    Scan to Verify
                  </div>
                  <div className="text-[9px] font-bold text-zinc-700">
                    Official Federation Registry
                  </div>
                  <div className="text-[8px] text-zinc-400 mt-0.5">
                    Issued: {certificate.issueDate}
                  </div>
                </div>
              </div>

              {/* Official Federation Gold Stamp */}
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#b8860b] flex items-center justify-center p-1 bg-amber-50/50">
                  <div className="h-full w-full rounded-full border border-[#b8860b] flex flex-col items-center justify-center text-center">
                    <ShieldCheck className="h-5 w-5 text-[#b8860b]" />
                    <span className="text-[6px] font-black uppercase tracking-widest text-[#996515] px-1 text-center truncate max-w-[55px]">
                      {certificate.sealText || "RATIFIED"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="font-serif italic text-xs text-zinc-800 font-bold border-b border-zinc-400 pb-0.5 px-4">
                    {certificate.presidentName || "Akash & Tanvi"}
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-zinc-500 mt-1">
                    President
                  </div>
                  <div className="text-[7px] font-medium text-zinc-400">
                    {certificate.federationName || "A&T Fitness & Nutrition"}
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-serif italic text-xs text-zinc-800 font-bold border-b border-zinc-400 pb-0.5 px-4">
                    {certificate.secretaryName || "Authorized Signatory"}
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-zinc-500 mt-1">
                    General Secretary
                  </div>
                  <div className="text-[7px] font-medium text-zinc-400">
                    {certificate.federationName || "Indian Powerlifting Federation"}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Modal Bottom Action Controls ── */}
        <div className="no-print mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <QrCode className="h-4 w-4 text-gym-primary" />
            <span>Permanent link: </span>
            <span className="font-mono text-zinc-300 font-semibold truncate max-w-xs">
              {certificate.verificationUrl}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {/* WhatsApp Share */}
            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              <WhatsAppIcon variant="official" className="h-4 w-4" />
              <span>Share on WhatsApp</span>
            </a>

            {/* Direct High-Res PDF Download */}
            <a
              href={`/api/pdf/certificate?code=${encodeURIComponent(certificate.verificationCode)}`}
              target="_blank"
              download={`${certificate.verificationCode}-Certificate.pdf`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 transition-all cursor-pointer"
              title="Download vector PDF certificate"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </a>

            {/* Direct Vector Badge */}
            <a
              href={`/api/badge/podium?code=${encodeURIComponent(certificate.verificationCode)}`}
              target="_blank"
              download={`${certificate.verificationCode}-Badge.svg`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title="Download official digital vector SVG badge"
            >
              <Award className="h-4 w-4 text-amber-400" />
              <span>Badge (SVG)</span>
            </a>

            {/* Print In-Browser */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
