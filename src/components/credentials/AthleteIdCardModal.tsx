"use client";

import type { AthleteIdCardPayload } from "@/actions/certificate.actions";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import {
  Award,
  Calendar,
  Check,
  CreditCard,
  Download,
  MapPin,
  Printer,
  QrCode,
  RotateCw,
  Scissors,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AthleteIdCardModalProps {
  idCard: AthleteIdCardPayload;
  isOpen: boolean;
  onClose: () => void;
}

export function AthleteIdCardModal({
  idCard,
  isOpen,
  onClose,
}: AthleteIdCardModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const orgName = idCard.tenantOrganizationName || "Indian Powerlifting Federation";
  const tagline = idCard.tenantTagline || "National Competitor Pass";
  const logoUrl = idCard.tenantLogoUrl || "/images/at-logo.png";
  const primaryColor = idCard.primaryColor || "#e6501b";
  const sealText = idCard.sealText || "OFFICIAL RATIFIED SEAL";
  const presidentName = idCard.presidentName || "President";
  const secretaryName = idCard.secretaryName || "General Secretary";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(idCard.verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `🪪 *OFFICIAL ATHLETE DIGITAL ID PASS*\n\n` +
      `Organization: *${orgName}*\n` +
      `Athlete: *${idCard.athleteName}*\n` +
      `Federation ID: *${idCard.cardNumber}*\n` +
      `Status: *${idCard.status} (Verified)*\n` +
      `Category: *${idCard.weightClass} • ${idCard.gender}*\n` +
      `Plan: *${idCard.planType}*\n` +
      `Valid Thru: *${idCard.endDate}*\n\n` +
      `Verify Official Credential Online:\n${idCard.verificationUrl}`
  );

  const printStyles = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 6mm 8mm;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body > *:not(#print-idcard-modal-root) {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
      }
      #print-idcard-modal-root {
        display: block !important;
        position: static !important;
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        box-shadow: none !important;
        overflow: visible !important;
      }
      .screen-only-section,
      .no-print {
        display: none !important;
      }
      .print-only-sheet {
        display: block !important;
        visibility: visible !important;
        width: 100% !important;
        max-width: 100% !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .print-only-sheet * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;

  return createPortal(
    <div
      id="print-idcard-modal-root"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 print:p-0 print:m-0 print:bg-white print:static print:inset-auto print:overflow-visible"
    >
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* ══════════════════════════════════════════════════════════════════════════════
          1. INTERACTIVE SCREEN MODAL (VISIBLE ONLY ON SCREEN, COMPLETELY HIDDEN ON PRINT)
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="screen-only-section no-print relative w-full max-w-xl rounded-3xl border border-white/10 bg-gradient-to-b from-[#180802] via-[#0d0301] to-black p-5 sm:p-8 shadow-[0_0_80px_rgba(230,80,27,0.25)] text-white my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gym-primary/40 bg-gym-primary/20 text-gym-primary shadow-md">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                  Official Athlete ID Pass
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    idCard.status === "ACTIVE"
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                      : "border-amber-500/40 bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {idCard.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {orgName} • Click card or button to flip
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

        {/* Screen Face Selector Tabs */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={() => setIsFlipped(false)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              !isFlipped
                ? "bg-gym-primary text-white shadow-md"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            Front Face
          </button>
          <button
            onClick={() => setIsFlipped(true)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isFlipped
                ? "bg-gym-primary text-white shadow-md"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            Back Face
          </button>
        </div>

        {/* ── 3D FLIP CARD (SCREEN INTERACTION ONLY) ── */}
        <div className="py-2 flex justify-center [perspective:1000px]">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full max-w-[460px] h-[280px] sm:h-[290px] rounded-2xl cursor-pointer transition-transform duration-700 select-none shadow-2xl"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* ── FRONT FACE (SCREEN) ── */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl p-5 border border-white/20 bg-gradient-to-br from-[#1c0803] via-[#0e0301] to-[#1a0703] flex flex-col justify-between overflow-hidden shadow-2xl"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* Holographic Accent Strip */}
              <div className="absolute top-0 right-10 w-24 h-full bg-gradient-to-r from-transparent via-gym-primary/15 to-transparent pointer-events-none -skew-x-12 blur-xs" />

              {/* Card Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div
                    className="relative h-9 w-9 rounded-full overflow-hidden border bg-black shadow-xs shrink-0"
                    style={{ borderColor: primaryColor }}
                  >
                    <Image
                      src={logoUrl}
                      alt={orgName}
                      fill
                      className="object-contain p-0.5"
                      unoptimized={logoUrl.startsWith("http") || logoUrl.startsWith("data:")}
                    />
                  </div>
                  <div>
                    <div className="font-heading text-xs font-bold uppercase tracking-wider text-white">
                      {orgName}
                    </div>
                    <div
                      className="text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: primaryColor }}
                    >
                      {tagline}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>VERIFIED</span>
                </div>
              </div>

              {/* Card Middle: Athlete Photo & Details & QR */}
              <div className="flex items-center justify-between gap-3 relative z-10 my-auto">
                <div className="flex items-center gap-3">
                  <div
                    className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 bg-black/80 shadow-md shrink-0 flex items-center justify-center"
                    style={{ borderColor: primaryColor }}
                  >
                    {idCard.image ? (
                      <Image
                        src={idCard.image}
                        alt={idCard.athleteName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="font-heading text-3xl font-bold text-gym-primary">
                        {idCard.athleteName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                      ATHLETE NAME
                    </div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold uppercase text-white tracking-wide leading-tight">
                      {idCard.athleteName}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-gray-300">
                      <span className="text-gym-primary">{idCard.weightClass}</span>
                      <span>•</span>
                      <span>{idCard.gender}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-gray-400 truncate max-w-[180px] mt-0.5">
                      {idCard.clubState}
                    </div>
                  </div>
                </div>

                {/* Vector QR Code */}
                <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-white/20 shadow-lg shrink-0">
                  <img
                    src={idCard.qrDataUrl}
                    alt="Scan ID QR"
                    className="h-16 w-16 sm:h-18 sm:w-18 object-contain"
                  />
                  <span className="text-[7px] font-black uppercase tracking-widest text-black mt-0.5">
                    SCAN TO VERIFY
                  </span>
                </div>
              </div>

              {/* Card Bottom: ID Number, Plan & Validity */}
              <div className="flex items-center justify-between border-t border-white/10 pt-2.5 relative z-10">
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    FEDERATION ID
                  </div>
                  <div className="font-mono text-sm font-bold tracking-widest text-white">
                    {idCard.cardNumber}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    MEMBERSHIP PLAN
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gym-primary">
                    {idCard.planType}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    VALID THRU
                  </div>
                  <div className="font-mono text-xs font-bold text-gray-200">
                    {idCard.endDate}
                  </div>
                </div>
              </div>
            </div>

            {/* ── BACK FACE (SCREEN) ── */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl p-5 border border-white/20 bg-gradient-to-br from-[#120402] via-[#090201] to-[#120402] flex flex-col justify-between overflow-hidden shadow-2xl text-left"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gym-primary">
                    <ShieldAlert className="h-4 w-4" />
                    <span>IPF ANTI-DOPING & STRICT LIABILITY</span>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400">
                    WADA / NADA
                  </span>
                </div>

                <p className="text-[9px] leading-relaxed text-gray-300">
                  The holder of this credential agrees to abide by all IPF Technical Rules, Constitution, and NADA Anti-Doping Regulations. The competitor is personally responsible for any prohibited substance found in their biological specimen.
                </p>
              </div>

              <div className="my-auto py-2">
                <div className="flex items-center justify-between text-[9px] text-gray-400 mb-1">
                  <span>Emergency Reg ID: {idCard.cardNumber}</span>
                  <span>Registered Athlete</span>
                </div>

                <div className="h-7 w-full bg-white/90 rounded px-2 py-1 flex items-center justify-between gap-1 overflow-hidden">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full bg-black shrink-0"
                      style={{
                        width: `${i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1}px`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[8px] text-gray-400">
                <div>
                  <div className="font-bold text-gray-300">
                    {orgName.toUpperCase()}
                  </div>
                  <div>{sealText} • {secretaryName} (Sec)</div>
                </div>

                <div
                  className="text-right font-mono text-[9px] font-bold"
                  style={{ color: primaryColor }}
                >
                  VERIFIED DIGITAL PASS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flip Hint */}
        <div className="text-center mt-3">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gym-primary transition-colors cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Click card to flip ({isFlipped ? "Showing Back" : "Showing Front"})</span>
          </button>
        </div>

        {/* Modal Controls */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <QrCode className="h-4 w-4 text-gym-primary" />
            <span className="font-mono text-zinc-300 text-[11px] truncate max-w-[180px]">
              {idCard.verificationUrl}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <span>Copy Link</span>
              )}
            </button>

            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              <WhatsAppIcon variant="official" className="h-3.5 w-3.5" />
              <span>Share Pass</span>
            </a>

            <a
              href={`/api/pdf/id-card?cardNumber=${encodeURIComponent(idCard.cardNumber)}`}
              target="_blank"
              download={`${idCard.cardNumber}-Pass.pdf`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
              title="Download high-resolution official vector PDF card"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </a>

            <a
              href={`/api/badge/athlete?cardNumber=${encodeURIComponent(idCard.cardNumber)}`}
              target="_blank"
              download={`${idCard.cardNumber}-Badge.svg`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title="Download official vector SVG badge"
            >
              <Award className="h-3.5 w-3.5 text-gym-primary" />
              <span>Badge (SVG)</span>
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print (A4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          2. DEDICATED PRINT ACCREDITATION SHEET (CALIBRATED FOR A4 PORTRAIT PRINT/PDF)
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="print-only-sheet hidden bg-white text-zinc-950 p-3 sm:p-5 font-sans text-left max-w-[210mm] mx-auto">
        {/* Official Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-zinc-900 bg-black shrink-0">
              <Image
                src={logoUrl}
                alt={orgName}
                fill
                className="object-contain p-0.5"
                unoptimized={logoUrl.startsWith("http") || logoUrl.startsWith("data:")}
              />
            </div>
            <div>
              <div className="text-lg font-bold uppercase tracking-wider text-zinc-950 font-serif leading-none">
                {orgName}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#b8860b] mt-1">
                {tagline} • {sealText}
              </div>
              <div className="text-[9px] font-semibold text-zinc-700">
                Official Athlete Accreditation &amp; Sanctioned Competitor Pass Sheet
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
              Federation Credential Ref
            </div>
            <div className="font-mono text-sm font-black text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
              {idCard.cardNumber}
            </div>
            <div className="text-[8px] font-bold text-emerald-700 uppercase mt-1">
              ● Official Verified Credential
            </div>
          </div>
        </div>

        {/* ── DUAL PASS CUT-OUT CONTAINER (CR80 Standard Wallet / Lanyard Pouch: 85.6mm × 54mm each) ── */}
        <div className="my-3 rounded-xl border-2 border-dashed border-zinc-400 p-3 bg-zinc-50">
          <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-zinc-700 mb-2 border-b border-zinc-300 pb-1">
            <div className="flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5 text-zinc-800" />
              <span>Cut along outer dashed box &amp; fold along center line for standard ID lanyard / wallet pass</span>
            </div>
            <span className="font-mono text-[9px] text-zinc-500">CR80 (85.6mm × 54mm each)</span>
          </div>

          {/* DUAL 2D FACES: SIDE-BY-SIDE ON A4 PORTRAIT */}
          <div className="grid grid-cols-2 gap-3 items-stretch justify-center">
            
            {/* ── 2D FRONT FACE (PRINT CALIBRATED, NO 3D) ── */}
            <div
              className="rounded-xl border-2 border-[#b8860b] text-white p-3 flex flex-col justify-between shadow-xs min-h-[210px]"
              style={{
                background: "linear-gradient(135deg, #180802 0%, #2b0c04 50%, #150602 100%)",
              }}
            >
              {/* Front Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="relative h-6 w-6 rounded-full overflow-hidden border border-[#b8860b] bg-black shrink-0">
                    <Image
                      src={logoUrl}
                      alt={orgName}
                      fill
                      className="object-contain"
                      unoptimized={logoUrl.startsWith("http") || logoUrl.startsWith("data:")}
                    />
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-white leading-none">
                      {orgName}
                    </div>
                    <div className="text-[7px] font-bold uppercase tracking-widest text-[#b8860b]">
                      {tagline}
                    </div>
                  </div>
                </div>

                <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[7px] font-black uppercase text-white">
                  VERIFIED
                </span>
              </div>

              {/* Front Middle */}
              <div className="flex items-center justify-between gap-2 my-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden border-2 border-[#b8860b] bg-black shadow-xs shrink-0 flex items-center justify-center">
                    {idCard.image ? (
                      <Image
                        src={idCard.image}
                        alt={idCard.athleteName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-[#b8860b]">
                        {idCard.athleteName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[7px] font-black uppercase tracking-widest text-zinc-400">
                      ATHLETE NAME
                    </div>
                    <div className="text-xs font-bold uppercase text-white leading-tight">
                      {idCard.athleteName}
                    </div>
                    <div className="text-[8px] font-bold text-[#b8860b] mt-0.5">
                      {idCard.weightClass} • {idCard.gender}
                    </div>
                    <div className="text-[7.5px] text-zinc-400 truncate max-w-[125px]">
                      {idCard.clubState}
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-1 rounded-md border border-zinc-400 shrink-0 text-center">
                  <img src={idCard.qrDataUrl} alt="QR" className="h-12 w-12 object-contain" />
                  <span className="text-[5px] font-black uppercase tracking-widest text-black block mt-0.5">
                    SCAN TO VERIFY
                  </span>
                </div>
              </div>

              {/* Front Footer */}
              <div className="flex items-center justify-between border-t border-white/15 pt-1 text-[8px]">
                <div>
                  <span className="text-zinc-400 block text-[6px] uppercase font-bold">
                    FEDERATION ID
                  </span>
                  <span className="font-mono font-bold text-white text-[9px]">
                    {idCard.cardNumber}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[6px] uppercase font-bold">
                    PLAN
                  </span>
                  <span className="font-bold text-[#b8860b] text-[8px]">
                    {idCard.planType}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 block text-[6px] uppercase font-bold">
                    VALID THRU
                  </span>
                  <span className="font-mono text-white text-[8px]">
                    {idCard.endDate}
                  </span>
                </div>
              </div>
            </div>

            {/* ── 2D BACK FACE (PRINT CALIBRATED, NO 3D) ── */}
            <div
              className="rounded-xl border-2 border-zinc-700 text-white p-3 flex flex-col justify-between shadow-xs min-h-[210px]"
              style={{
                background: "linear-gradient(135deg, #120402 0%, #1e0703 50%, #0d0301 100%)",
              }}
            >
              {/* Back Header */}
              <div>
                <div className="flex items-center justify-between border-b border-white/15 pb-1 mb-1">
                  <div className="text-[8px] font-black uppercase tracking-wider text-[#b8860b]">
                    IPF ANTI-DOPING &amp; STRICT LIABILITY
                  </div>
                  <span className="text-[7px] font-bold text-zinc-400">WADA / NADA</span>
                </div>

                <p className="text-[7.5px] leading-relaxed text-zinc-300">
                  The holder of this credential agrees to abide by all IPF Technical Rules, Constitution, and NADA Anti-Doping Regulations. Strict liability applies to all competitors.
                </p>
              </div>

              {/* Lifter Info & Barcode Strip */}
              <div className="my-1.5">
                <div className="flex items-center justify-between text-[7px] text-zinc-400 mb-0.5">
                  <span>Emergency Reg ID: {idCard.cardNumber}</span>
                  <span>Registered Athlete</span>
                </div>
                <div className="h-6 w-full bg-white rounded px-1.5 py-0.5 flex items-center justify-between gap-0.5 overflow-hidden">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full bg-black shrink-0"
                      style={{
                        width: `${i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1}px`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Back Footer */}
              <div className="border-t border-white/15 pt-1 flex items-center justify-between text-[7px] text-zinc-400">
                <div>
                  <div className="font-bold text-zinc-200">{orgName.toUpperCase()}</div>
                  <div>{presidentName} (Pres) • {secretaryName} (Sec)</div>
                </div>
                <div className="font-mono text-[#b8860b] text-[8px] font-bold">
                  VERIFIED DIGITAL PASS
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── ATHLETE BIOMETRIC & VERIFICATION REGISTER TABLE ── */}
        <div className="my-2.5 rounded-xl border border-zinc-300 p-2.5 bg-white">
          <div className="text-[9px] font-semibold uppercase tracking-widest text-zinc-700 mb-1.5 border-b border-zinc-200 pb-1">
            Official Athlete Biometric &amp; Membership Ledger
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-[9.5px]">
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase font-bold">
                Athlete Full Name:
              </span>
              <span className="font-bold text-zinc-900">{idCard.athleteName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase font-bold">
                Division &amp; Category:
              </span>
              <span className="font-bold text-zinc-900">
                {idCard.weightClass} • {idCard.gender}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase font-bold">
                Affiliated State Association:
              </span>
              <span className="font-bold text-zinc-900">{idCard.clubState}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase font-bold">
                Federation ID Number:
              </span>
              <span className="font-mono font-bold text-zinc-900">{idCard.cardNumber}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase font-bold">
                Membership Status:
              </span>
              <span className="font-bold text-emerald-700">
                {idCard.status} (Eligible for Sanctioned Meets)
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase font-bold">
                Validity Window:
              </span>
              <span className="font-bold text-zinc-900">
                {idCard.startDate} — {idCard.endDate}
              </span>
            </div>
          </div>
        </div>

        {/* ── OFFICIAL REGULATIONS & DISCLAIMER ── */}
        <div className="rounded-xl border border-zinc-200 p-2.5 bg-zinc-50 text-[8px] leading-relaxed text-zinc-600">
          <div className="font-bold text-zinc-900 uppercase text-[8.5px] mb-0.5">
            Official Championship Instructions:
          </div>
          <ol className="list-decimal pl-4 space-y-0.5">
            <li>
              <strong>Weigh-In Clearance:</strong> Present this physical accreditation pass along with a government-issued photo ID (Aadhaar/Passport) at official championship weigh-in.
            </li>
            <li>
              <strong>Real-Time Verification:</strong> Meet directors and IPF jury members verify sanction validity by scanning the dynamic QR code leading to <code>{idCard.verificationUrl}</code>.
            </li>
            <li>
              <strong>Non-Transferable:</strong> This pass is issued strictly to the registered competitor. Misuse, fraudulent alterations, or non-compliance is actionable under Federation disciplinary code.
            </li>
          </ol>
        </div>

        {/* Signatures & Footer Date */}
        <div className="mt-3 pt-2 border-t border-zinc-300 flex items-center justify-between text-[8px] text-zinc-500">
          <div>
            Printed from Official Registry on:{" "}
            <span className="font-mono font-bold text-zinc-700">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-8 text-center">
            <div>
              <div className="font-serif italic font-bold text-zinc-800 text-[10px]">
                {presidentName}
              </div>
              <div className="text-[7px] font-bold uppercase text-zinc-500">
                President / Technical Director
              </div>
            </div>

            <div>
              <div className="font-serif italic font-bold text-zinc-800 text-[10px]">
                {secretaryName}
              </div>
              <div className="text-[7px] font-bold uppercase text-zinc-500">
                General Secretary, {orgName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
