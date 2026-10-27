"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  CreditCard,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Award,
  Check,
  RotateCw,
  Scissors,
  X,
  Printer,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import type { RefereePassPayload } from "@/actions/referee-management.actions";
import { CATEGORY_META } from "@/lib/referee-constants";

interface RefereeCredentialPassModalProps {
  pass: RefereePassPayload;
  isOpen: boolean;
  onClose: () => void;
}

export function RefereeCredentialPassModal({
  pass,
  isOpen,
  onClose,
}: RefereeCredentialPassModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const orgName = pass.tenantOrganizationName || "Indian Powerlifting Federation";
  const tagline = pass.tenantTagline || "Official Technical Official Accreditation";
  const logoUrl = pass.tenantLogoUrl || "/images/at-logo.png";
  const primaryColor = pass.primaryColor || "#e6501b";
  const sealText = pass.sealText || "OFFICIAL RATIFIED SEAL";
  const presidentName = pass.presidentName || "President";
  const secretaryName = pass.secretaryName || "General Secretary";

  const categoryMeta = CATEGORY_META[pass.category] || CATEGORY_META.NATIONAL_CAT_2;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(pass.verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `⚖️ *OFFICIAL IPF TECHNICAL OFFICIAL ACCREDITATION*\n\n` +
      `Official: *${pass.name}*\n` +
      `License ID: *${pass.licenseNumber}*\n` +
      `Category: *${categoryMeta.label}*\n` +
      `State Body: *${pass.stateAffiliation}*\n` +
      `Status: *${pass.status} (Verified)*\n` +
      `Meets Judged: *${pass.totalMeetsJudged} Championships*\n` +
      `Valid Thru: *${pass.licenseValidUntil}*\n\n` +
      `Verify Official Accreditation Online:\n${pass.verificationUrl}`
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
      body > *:not(#print-referee-pass-root) {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
      }
      #print-referee-pass-root {
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
      id="print-referee-pass-root"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 print:p-0 print:m-0 print:bg-white print:static print:inset-auto print:overflow-visible"
    >
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* ── SCREEN INTERACTIVE SECTION ── */}
      <div className="screen-only-section no-print relative w-full max-w-xl rounded-3xl border border-white/10 bg-gradient-to-b from-[#14081c] via-[#09030e] to-black p-5 sm:p-8 shadow-[0_0_80px_rgba(168,85,247,0.25)] text-white my-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/20 text-purple-300 shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                  Technical Official Pass
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    pass.status === "ACTIVE"
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                      : "border-amber-500/40 bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {pass.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {orgName} • Official Jury &amp; Referee Credential
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

        {/* Face Selector Tabs */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={() => setIsFlipped(false)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              !isFlipped
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            Front Face
          </button>
          <button
            onClick={() => setIsFlipped(true)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isFlipped
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            Back Face
          </button>
        </div>

        {/* ── 3D FLIP PASS ── */}
        <div className="py-2 flex justify-center [perspective:1000px]">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full max-w-[460px] h-[280px] sm:h-[295px] rounded-2xl cursor-pointer transition-transform duration-700 select-none shadow-2xl"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT FACE */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl p-5 border border-purple-500/30 bg-gradient-to-br from-[#1c0a24] via-[#0c0412] to-[#16061e] flex flex-col justify-between overflow-hidden shadow-2xl"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div
                    className="relative h-9 w-9 rounded-full overflow-hidden border bg-black shadow-xs shrink-0 flex items-center justify-center"
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
                    <div className="text-[9px] font-bold uppercase tracking-widest text-purple-300">
                      Technical Official Accreditation
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-purple-300">
                  <ShieldCheck className="h-3 w-3" />
                  <span>JURY SANCTIONED</span>
                </div>
              </div>

              {/* Middle Section: Photo & Details */}
              <div className="flex items-center justify-between gap-3 relative z-10 my-auto">
                <div className="flex items-center gap-3">
                  <div className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 border-purple-500/80 bg-black/80 shadow-md shrink-0 flex items-center justify-center">
                    {pass.image ? (
                      <Image src={pass.image} alt={pass.name} fill className="object-cover" />
                    ) : (
                      <div className="font-heading text-3xl font-bold text-purple-400">
                        {pass.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                      OFFICIAL REFEREE
                    </div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold uppercase text-white tracking-wide leading-tight">
                      {pass.name}
                    </h3>
                    <div className="mt-1">
                      <span className="inline-block rounded-md border border-purple-500/40 bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-300">
                        {categoryMeta.label}
                      </span>
                    </div>
                    <div className="text-[9.5px] font-semibold text-gray-400 truncate max-w-[180px] mt-0.5 flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 text-zinc-500" />
                      <span>{pass.stateAffiliation}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-white/20 shadow-lg shrink-0">
                  <img
                    src={pass.qrDataUrl}
                    alt="Scan QR"
                    className="h-16 w-16 sm:h-18 sm:w-18 object-contain"
                  />
                  <span className="text-[7px] font-black uppercase tracking-widest text-black mt-0.5">
                    VERIFY JURY
                  </span>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="flex items-center justify-between border-t border-white/10 pt-2 relative z-10 text-xs">
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    LICENSE NO.
                  </div>
                  <div className="font-mono text-xs font-bold tracking-wider text-purple-300">
                    {pass.licenseNumber}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    MEETS JUDGED
                  </div>
                  <div className="text-xs font-bold text-white">
                    {pass.totalMeetsJudged} Meets
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    VALID THRU
                  </div>
                  <div className="font-mono text-xs font-bold text-gray-200">
                    {pass.licenseValidUntil}
                  </div>
                </div>
              </div>
            </div>

            {/* BACK FACE */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl p-5 border border-purple-500/30 bg-gradient-to-br from-[#120418] via-[#08020d] to-[#120418] flex flex-col justify-between overflow-hidden shadow-2xl text-left"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400">
                    <Shield className="h-4 w-4" />
                    <span>IPF TECHNICAL OFFICIAL CODE</span>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400">JURY CLEARANCE</span>
                </div>

                <p className="text-[8.5px] leading-relaxed text-gray-300">
                  The official certified herein is authorized to officiate at IPF sanctioned powerlifting championships. The referee must remain impartial, enforce IPF Technical Rules without bias, and ensure absolute lifter safety on platform.
                </p>
              </div>

              {/* Active Assignments */}
              <div className="my-auto py-1">
                <div className="text-[8px] font-black uppercase tracking-widest text-purple-400 mb-1">
                  CURRENT MEET CLEARANCE:
                </div>
                {pass.currentAssignments.length > 0 ? (
                  <div className="space-y-1">
                    {pass.currentAssignments.slice(0, 2).map((asg) => (
                      <div
                        key={asg.id}
                        className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-[9px] flex items-center justify-between"
                      >
                        <span className="font-semibold text-white truncate max-w-[170px]">
                          {asg.eventTitle}
                        </span>
                        <span className="font-bold text-purple-300">
                          {asg.platformName} • {asg.roleLabel.split("(")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[9px] text-zinc-400 italic">
                    Standby Technical Official Pool (Available for Assignment)
                  </div>
                )}
              </div>

              {/* Back Footer */}
              <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[8px] text-gray-400">
                <div>
                  <div className="font-bold text-gray-200">{orgName.toUpperCase()}</div>
                  <div>Technical Officials Committee • {sealText}</div>
                </div>

                <div className="text-right font-mono text-[9px] text-purple-300 font-bold">
                  VERIFIED TECHNICAL PASS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flip Hint */}
        <div className="text-center mt-3">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-purple-400 transition-colors cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Click pass to flip ({isFlipped ? "Showing Back" : "Showing Front"})</span>
          </button>
        </div>

        {/* Modal Controls */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
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

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Accreditation Badge (A4)</span>
          </button>
        </div>
      </div>

      {/* ── PRINT-ONLY DEDICATED A4 ACCREDITATION SHEET ── */}
      <div className="print-only-sheet hidden bg-white text-zinc-950 p-3 sm:p-5 font-sans text-left max-w-[210mm] mx-auto">
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
              <div className="text-[10px] font-bold uppercase tracking-widest text-purple-700 mt-1">
                {tagline} • Technical Committee
              </div>
              <div className="text-[9px] font-semibold text-zinc-700">
                Official Technical Official &amp; Jury Accreditation Credential Sheet
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
              Official License Ref
            </div>
            <div className="font-mono text-sm font-black text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
              {pass.licenseNumber}
            </div>
            <div className="text-[8px] font-bold text-emerald-700 uppercase mt-1">
              ● Official Ratified Official
            </div>
          </div>
        </div>

        {/* DUAL 2D CUT-OUT CONTAINER */}
        <div className="my-3 rounded-xl border-2 border-dashed border-zinc-400 p-3 bg-zinc-50">
          <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-zinc-700 mb-2 border-b border-zinc-300 pb-1">
            <div className="flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5 text-zinc-800" />
              <span>Cut along outer dashed box &amp; fold along center line for standard ID lanyard / wallet pass</span>
            </div>
            <span className="font-mono text-[9px] text-zinc-500">CR80 (85.6mm × 54mm each)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 items-stretch justify-center">
            {/* 2D Front Face */}
            <div className="rounded-xl border-2 border-purple-700 bg-gradient-to-br from-[#1c0a24] to-[#0c0412] text-white p-3 flex flex-col justify-between shadow-xs min-h-[210px]">
              <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="relative h-6 w-6 rounded-full overflow-hidden border border-purple-400 bg-black shrink-0">
                    <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-white leading-none">
                      {orgName}
                    </div>
                    <div className="text-[7px] font-bold uppercase tracking-widest text-purple-300">
                      TECHNICAL OFFICIAL PASS
                    </div>
                  </div>
                </div>

                <span className="rounded bg-purple-600 px-1.5 py-0.5 text-[7px] font-black uppercase text-white">
                  ACCREDITED
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 my-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden border-2 border-purple-400 bg-black shadow-xs shrink-0 flex items-center justify-center">
                    {pass.image ? (
                      <Image src={pass.image} alt={pass.name} fill className="object-cover" />
                    ) : (
                      <div className="text-2xl font-bold text-purple-400">
                        {pass.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[7px] font-black uppercase tracking-widest text-zinc-400">
                      TECHNICAL OFFICIAL
                    </div>
                    <div className="text-xs font-bold uppercase text-white leading-tight">
                      {pass.name}
                    </div>
                    <div className="text-[8px] font-bold text-purple-300 mt-0.5">
                      {categoryMeta.label}
                    </div>
                    <div className="text-[7.5px] text-zinc-400 truncate max-w-[125px]">
                      {pass.stateAffiliation}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-1 rounded-md border border-zinc-400 shrink-0 text-center">
                  <img src={pass.qrDataUrl} alt="QR" className="h-12 w-12 object-contain" />
                  <span className="text-[5px] font-black uppercase tracking-widest text-black block mt-0.5">
                    VERIFY JURY
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/15 pt-1 text-[8px]">
                <div>
                  <span className="text-zinc-400 block text-[6px] uppercase font-bold">LICENSE</span>
                  <span className="font-mono font-bold text-white text-[9px]">{pass.licenseNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[6px] uppercase font-bold">MEETS JUDGED</span>
                  <span className="font-bold text-purple-300 text-[8px]">{pass.totalMeetsJudged}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 block text-[6px] uppercase font-bold">VALID THRU</span>
                  <span className="font-mono text-white text-[8px]">{pass.licenseValidUntil}</span>
                </div>
              </div>
            </div>

            {/* 2D Back Face */}
            <div className="rounded-xl border-2 border-zinc-700 bg-gradient-to-br from-[#120418] to-[#08020d] text-white p-3 flex flex-col justify-between shadow-xs min-h-[210px]">
              <div>
                <div className="flex items-center justify-between border-b border-white/15 pb-1 mb-1">
                  <div className="text-[8px] font-black uppercase tracking-wider text-purple-300">
                    IPF JURY &amp; TECHNICAL ACCREDITATION
                  </div>
                  <span className="text-[7px] font-bold text-zinc-400">OFFICIAL DESK</span>
                </div>

                <p className="text-[7.5px] leading-relaxed text-zinc-300">
                  This pass verifies the official authority of the holder to act as Chief Referee, Side Referee, or Jury Member at official championships in accordance with the IPF rulebook.
                </p>
              </div>

              <div className="my-1.5">
                <div className="flex items-center justify-between text-[7px] text-zinc-400 mb-0.5">
                  <span>Accreditation ID: {pass.licenseNumber}</span>
                  <span>Technical Official</span>
                </div>
                <div className="h-6 w-full bg-white rounded px-1.5 py-0.5 flex items-center justify-between gap-0.5 overflow-hidden">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full bg-black shrink-0"
                      style={{ width: `${i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-white/15 pt-1 flex items-center justify-between text-[7px] text-zinc-400">
                <div>
                  <div className="font-bold text-zinc-200">{orgName.toUpperCase()}</div>
                  <div>Technical Committee • {sealText}</div>
                </div>
                <div className="font-mono text-purple-300 text-[8px] font-bold">
                  VERIFIED JURY PASS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures */}
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
