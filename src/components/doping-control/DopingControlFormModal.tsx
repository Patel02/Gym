"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  Printer,
  X,
  ExternalLink,
  Copy,
  Check,
  Lock,
  FlaskConical,
  Building2,
} from "lucide-react";
import { DopingChainOfCustodyRecord } from "@/data/doping-control-data";
import { generateQrDataUrl } from "@/lib/qr-generator";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

interface DopingControlFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DopingChainOfCustodyRecord | null;
}

// Deterministic SVG Barcode Generator for Code 128 / Tamper-evident seals
function SvgBarcode({ code, height = 32 }: { code: string; height?: number }) {
  const hash = Array.from(code).reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
  const bars: { w: number; isBlack: boolean }[] = [];
  
  for (let i = 0; i < 42; i++) {
    const w = ((hash * (i + 7) * 31) % 3) + 1;
    bars.push({ w, isBlack: i % 2 === 0 });
  }

  let currentX = 4;
  const renderedBars = bars.map((b, idx) => {
    const x = currentX;
    currentX += b.w + 1;
    if (!b.isBlack) return null;
    return <rect key={idx} x={x} y={0} width={b.w} height={height} fill="#0f172a" />;
  });

  return (
    <div className="flex flex-col items-center">
      <svg className="w-full max-w-[190px]" height={height} viewBox={`0 0 ${currentX + 4} ${height}`}>
        {renderedBars}
      </svg>
      <span className="font-mono text-[9px] font-semibold tracking-[0.25em] text-slate-900 uppercase mt-0.5">
        {code}
      </span>
    </div>
  );
}

export default function DopingControlFormModal({
  isOpen,
  onClose,
  record,
}: DopingControlFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [verifyUrl, setVerifyUrl] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!record) return;

    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://ipf-federation.in";

    const params = new URLSearchParams({
      athlete: record.athleteName,
      testCode: record.testCode,
      aBarcode: record.aSampleBarcode,
      bBarcode: record.bSampleBarcode,
      volume: `${record.sampleVolumeMl} mL`,
      sg: record.specificGravity.toFixed(3),
      dco: record.dcoOfficerName,
      meet: record.meetTitle,
    });

    const url = `${origin}/verify/${record.testCode}?${params.toString()}`;
    setVerifyUrl(url);

    generateQrDataUrl(url, {
      width: 260,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.warn("Failed to generate QR in DCF modal:", err));
  }, [record]);

  if (!isOpen || !mounted || !record) return null;

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
      `🧪 *OFFICIAL NADA / WADA DOPING CONTROL FORM & CHAIN OF CUSTODY*\n\n` +
      `*Sample Test Code:* ${record.testCode}\n` +
      `*Athlete:* ${record.athleteName}\n` +
      `*A-Sample Barcode:* ${record.aSampleBarcode}\n` +
      `*B-Sample Barcode:* ${record.bSampleBarcode}\n` +
      `*Sample Integrity:* ${record.sampleVolumeMl} mL • SG ${record.specificGravity.toFixed(3)} • pH ${record.samplePh}\n` +
      `*DCO Officer:* ${record.dcoOfficerName}\n` +
      `*Laboratory:* NDTL New Delhi (WADA-Accredited)\n` +
      `*Status:* ${record.status.replace(/_/g, " ")}\n\n` +
      `*Verify Security Ledger Online:* ${verifyUrl}`;

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
      body > *:not(#print-dcf-modal-root) {
        display: none !important;
        visibility: hidden !important;
      }
      #print-dcf-modal-root {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        box-shadow: none !important;
      }
      .no-print {
        display: none !important;
      }
      #print-dcf-container {
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
      #print-dcf-container * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;

  return createPortal(
    <div
      id="print-dcf-modal-root"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:inset-auto"
    >
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="relative w-full max-w-4xl my-auto print:max-w-none print:w-full print:m-0">
        {/* ── Screen-Only Control Action Bar ── */}
        <div className="no-print mb-4 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/[0.06]">
          {/* Rainbow top stripe */}
          <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 via-indigo-500 via-violet-500 to-purple-600" />

          {/* Main panel — dark command-room bg */}
          <div
            className="relative bg-[#080c14] overflow-hidden"
            style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
          >
            {/* Subtle grid texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            />

            {/* ── TOP ROW: Identity ── */}
            <div className="relative flex items-center gap-4 px-5 pt-4 pb-3 border-b border-white/[0.06]">
              {/* Glowing icon */}
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-blue-500/25 blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/40 text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <FlaskConical className="h-5 w-5" />
                </div>
              </div>

              {/* Title + code */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-white whitespace-nowrap">
                    Official Doping Control Form
                    <span className="ml-2 text-blue-400">(DCF)</span>
                  </h2>
                  {/* Live status badge */}
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
                {/* Meta row */}
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  {/* Test code chip */}
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/25 bg-blue-500/[0.08] px-2 py-0.5 font-mono text-[11px] font-bold tracking-widest text-blue-300">
                    <Lock className="h-2.5 w-2.5" />
                    {record.testCode}
                  </span>
                  <span className="text-gray-700 text-xs">·</span>
                  {/* Compliance badges */}
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Chain of Custody
                  </span>
                  <span className="rounded-md border border-amber-500/25 bg-amber-500/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    WADA ISTI 2026
                  </span>
                  <span className="rounded-md border border-violet-500/25 bg-violet-500/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-400">
                    NADA Compliant
                  </span>
                </div>
              </div>

              {/* Close button — top right */}
              <button
                onClick={onClose}
                className="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-gray-600 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all duration-200 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── BOTTOM ROW: Actions ── */}
            <div className="relative flex flex-wrap items-center gap-2.5 px-5 py-3">
              {/* Label */}
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mr-1 hidden sm:inline">
                Actions:
              </span>

              {/* Print — primary CTA */}
              <button
                onClick={handlePrint}
                className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[length:200%] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_24px_rgba(99,102,241,0.5)] hover:shadow-[0_0_36px_rgba(99,102,241,0.7)] hover:bg-right transition-all duration-300 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print A4 DCF</span>
                <span className="ml-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold tracking-widest">1-PAGE</span>
              </button>

              {/* Verify Online */}
              <a
                href={verifyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-purple-700/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-violet-300 hover:border-violet-400/60 hover:bg-violet-500/15 hover:text-violet-200 transition-all duration-200 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Verify Online</span>
              </a>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#128c3c] to-[#25d366] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(37,211,102,0.3)] hover:shadow-[0_0_28px_rgba(37,211,102,0.5)] hover:brightness-110 transition-all duration-200 cursor-pointer"
              >
                <WhatsAppIcon variant="official" className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </button>

              {/* Separator */}
              <div className="h-6 w-px bg-white/[0.08] hidden sm:block mx-0.5" />

              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  copied
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-white/[0.08] bg-white/[0.03] text-gray-500 hover:bg-white/[0.07] hover:text-gray-300 hover:border-white/20"
                }`}
                title="Copy verification link"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Right meta — print note */}
              <span className="hidden lg:inline-flex items-center gap-1.5 text-[10px] text-gray-700">
                <Building2 className="h-3 w-3" />
                A4 Landscape • 1 page
              </span>
            </div>
          </div>
        </div>

        {/* ── THE OFFICIAL A4 DOPING CONTROL FORM CANVAS ── */}
        <div className="overflow-x-auto pb-2 print:overflow-visible print:pb-0">
          <div
            id="print-dcf-container"
            className="relative mx-auto w-[820px] min-h-[920px] bg-[#fafaf9] text-slate-900 p-6 sm:p-8 rounded-xl border-2 border-slate-800 shadow-2xl select-text print:border print:border-black print:shadow-none print:rounded-none print:w-full print:p-4"
          >
            {/* ── Official Watermark Motif ── */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <ShieldCheck className="h-[460px] w-[460px] text-slate-900" />
            </div>

            {/* ── SECTION 1: OFFICIAL EMBLEM & WADA / NADA HEADER ── */}
            <div className="border-b-2 border-slate-900 pb-3">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 font-mono">
                    GOVERNMENT OF INDIA • MINISTRY OF YOUTH AFFAIRS &amp; SPORTS
                  </div>
                  <div className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-950 font-serif">
                    NATIONAL ANTI-DOPING AGENCY (NADA INDIA)
                  </div>
                  <div className="text-[10px] font-mono text-slate-600">
                    Estd. under National Anti-Doping Act 2022 • Affiliated to World Anti-Doping Agency (WADA)
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 rounded border border-emerald-600/40 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-emerald-800 font-mono">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>WADA ISTI ARTICLE 5 &amp; 6</span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-slate-900 mt-1">
                    FORM CODE: DCF-2026-NADA-IND
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">
                    Sample Test ID: <strong className="text-slate-900">{record.testCode}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 rounded bg-slate-900 text-white text-center py-1">
                <h1 className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em]">
                  OFFICIAL DOPING CONTROL FORM (DCF) &amp; CHAIN OF CUSTODY MANIFEST
                </h1>
              </div>
            </div>

            {/* ── SECTION 2: ATHLETE DEMOGRAPHICS & SANCTIONED MEET SPECIFICATIONS ── */}
            <div className="mt-3 border border-slate-400 bg-white rounded p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1">
                <span>1. Athlete Demographics &amp; Sanctioned Competition Particulars</span>
                <span className="font-mono text-[9px] text-slate-500 font-normal">Strict Liability Binding</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Athlete Full Name</span>
                  <span className="text-xs font-bold uppercase text-slate-900 font-serif">
                    {record.athleteName}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Federation ID</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {record.athleteId.substring(0, 16).toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Collection Date &amp; Time</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {record.collectionDate} • {record.collectionTime}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Selection Criteria</span>
                  <span className="inline-block rounded bg-amber-100 border border-amber-300 px-1.5 py-0.2 text-[9px] font-bold text-amber-900 uppercase">
                    Podium Finish / Record Draw
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Sanctioned Meet Title</span>
                  <span className="text-[11px] font-bold text-slate-900 leading-tight block">
                    {record.meetTitle}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Doping Control Station (DCS)</span>
                  <span className="text-[11px] text-slate-800">
                    Designated Secure Station Room 104 • Platform Warmup Arena
                  </span>
                </div>
              </div>
            </div>

            {/* ── SECTION 3: SAMPLE PHYSICAL INTEGRITY & LABORATORY THRESHOLDS ── */}
            <div className="mt-3 border border-slate-400 bg-white rounded p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1">
                <span>2. Biological Sample Physical Characteristics (Refractometer &amp; Hydration)</span>
                <span className="font-mono text-[9px] text-emerald-700 font-bold">✓ Valid Laboratory Thresholds Met</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-left">
                <div className="rounded border border-slate-300 bg-slate-50 p-2">
                  <span className="text-[8.5px] font-mono uppercase text-slate-500 block">Total Urine Volume</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-black font-mono text-slate-900">{record.sampleVolumeMl}</span>
                    <span className="text-[9px] font-mono text-slate-600">mL</span>
                  </div>
                  <span className="text-[8px] font-mono text-emerald-700 block mt-0.5">Compliant (≥ 90 mL)</span>
                </div>

                <div className="rounded border border-slate-300 bg-slate-50 p-2">
                  <span className="text-[8.5px] font-mono uppercase text-slate-500 block">Refractometer SG</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-black font-mono text-slate-900">{record.specificGravity.toFixed(3)}</span>
                  </div>
                  <span className="text-[8px] font-mono text-emerald-700 block mt-0.5">Compliant (≥ 1.005)</span>
                </div>

                <div className="rounded border border-slate-300 bg-slate-50 p-2">
                  <span className="text-[8.5px] font-mono uppercase text-slate-500 block">Urine Acidity (pH)</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-black font-mono text-slate-900">pH {record.samplePh}</span>
                  </div>
                  <span className="text-[8px] font-mono text-emerald-700 block mt-0.5">Valid (5.0 - 7.5 range)</span>
                </div>

                <div className="rounded border border-slate-300 bg-slate-50 p-2">
                  <span className="text-[8.5px] font-mono uppercase text-slate-500 block">Visual Clarity</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">Clear / Pale Straw</span>
                  <span className="text-[8px] font-mono text-slate-500 block mt-0.5">No Turbidity / Sediment</span>
                </div>
              </div>
            </div>

            {/* ── SECTION 4: TAMPER-EVIDENT A & B SECURITY BOTTLES (DUAL BARCODES) ── */}
            <div className="mt-3 border-2 border-dashed border-slate-500 bg-amber-50/40 rounded p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-800 mb-2 flex items-center justify-between border-b border-amber-200 pb-1">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-red-600" />
                  <span>3. Tamper-Evident Security Bottles Distribution &amp; Barcode Matrix</span>
                </span>
                <span className="font-mono text-[9px] text-red-700 font-bold">WADA Double-Blind Testing Integrity</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Bottle A Security Card */}
                <div className="rounded border-2 border-emerald-600 bg-white p-2.5 text-center shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[8.5px] font-black text-white uppercase font-mono">
                      BOTTLE A • PRIMARY ANALYSIS
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 font-bold">Min: 60 mL</span>
                  </div>
                  
                  {/* Linear Barcode */}
                  <div className="py-1">
                    <SvgBarcode code={record.aSampleBarcode} height={34} />
                  </div>

                  <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[8px] font-mono text-slate-600">
                    <span>Security Seal #RED-9042</span>
                    <span className="text-emerald-700 font-bold">Direct Gas-Chromatography</span>
                  </div>
                </div>

                {/* Bottle B Security Card */}
                <div className="rounded border-2 border-blue-600 bg-white p-2.5 text-center shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                    <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[8.5px] font-black text-white uppercase font-mono">
                      BOTTLE B • CONFIRMATION RESERVE
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 font-bold">Min: 30 mL</span>
                  </div>

                  {/* Linear Barcode */}
                  <div className="py-1">
                    <SvgBarcode code={record.bSampleBarcode} height={34} />
                  </div>

                  <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[8px] font-mono text-slate-600">
                    <span>Security Seal #RED-9043</span>
                    <span className="text-blue-700 font-bold">Cryogenic Frozen (-20°C)</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[8px] font-mono text-slate-600 text-center">
                *The laboratory receives bottles with barcodes ONLY. No athlete personal identity is ever provided to the analyzing scientists.
              </div>
            </div>

            {/* ── SECTION 5: 7-DAY MEDICATION & TUE EXEMPTION DECLARATION ── */}
            <div className="mt-3 border border-slate-400 bg-white rounded p-3 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between border-b border-slate-200 pb-1">
                <span>4. Declared Medications, Inhalers &amp; Dietary Supplements (Past 7 Days)</span>
                <span className="font-mono text-[9px] text-slate-500">Article 5.4.1</span>
              </div>
              <p className="text-[11px] font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded p-2 leading-relaxed">
                {record.athleteDeclaration || "No prescription medications or banned substances declared. Standard multi-vitamin & electrolyte intake only."}
              </p>
            </div>

            {/* ── SECTION 6: TRIPARTITE RATIFICATION & LEGAL SIGNATURES ── */}
            <div className="mt-3 border border-slate-400 bg-white rounded p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1 text-left">
                5. Tripartite Chain of Custody Ratification &amp; Sample Handover Signatures
              </div>

              <div className="grid grid-cols-3 gap-3 text-left">
                {/* Athlete Signature Box */}
                <div className="border border-slate-300 rounded p-2 bg-slate-50">
                  <span className="text-[8px] font-mono uppercase text-slate-500 block">
                    1. Athlete Acknowledgment
                  </span>
                  <div className="h-10 border-b border-slate-400 flex items-end pb-0.5">
                    <span className="font-serif italic text-sm text-slate-900 font-bold">
                      {record.athleteName}
                    </span>
                  </div>
                  <div className="text-[7.5px] text-slate-500 mt-1 leading-tight">
                    "I confirm that sample sealing was conducted under my direct observation and the barcodes match."
                  </div>
                </div>

                {/* Chaperone Signature Box */}
                <div className="border border-slate-300 rounded p-2 bg-slate-50">
                  <span className="text-[8px] font-mono uppercase text-slate-500 block">
                    2. Chaperone Escort
                  </span>
                  <div className="h-10 border-b border-slate-400 flex items-end pb-0.5">
                    <span className="font-serif italic text-sm text-slate-900">
                      {record.chaperoneName}
                    </span>
                  </div>
                  <div className="text-[7.5px] text-slate-500 mt-1 leading-tight">
                    "Continuous visual contact maintained from notification order until DCS entry."
                  </div>
                </div>

                {/* DCO Signature Box */}
                <div className="border border-slate-300 rounded p-2 bg-slate-50">
                  <span className="text-[8px] font-mono uppercase text-slate-500 block">
                    3. Senior DCO In-Charge
                  </span>
                  <div className="h-10 border-b border-slate-400 flex items-end pb-0.5">
                    <span className="font-serif italic text-sm text-slate-900 font-bold">
                      {record.dcoOfficerName}
                    </span>
                  </div>
                  <div className="text-[7.5px] font-mono text-slate-600 mt-1 leading-tight">
                    License: <strong>{record.dcoLicenseNumber}</strong> • Certified DCO
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 7: NDTL LABORATORY COURIER DISPATCH MANIFEST & QR VERIFICATION ── */}
            <div className="mt-3 border-2 border-slate-900 bg-slate-900 text-white rounded p-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 bg-white p-1 rounded border border-white/20 shrink-0 flex items-center justify-center">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="DCF QR Verification" className="h-full w-full object-contain" />
                    ) : (
                      <div className="h-14 w-14 bg-slate-200 animate-pulse" />
                    )}
                  </div>

                  <div>
                    <div className="text-[9px] font-mono uppercase text-amber-400 font-black tracking-wider flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span>OFFICIAL DISPATCH DESTINATION</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      National Dope Testing Laboratory (NDTL)
                    </div>
                    <div className="text-[9px] text-slate-300">
                      WADA-Accredited Lab • Jawaharlal Nehru Stadium Complex, New Delhi 110003
                    </div>
                    <div className="text-[8px] font-mono text-emerald-400 mt-0.5">
                      Status: {record.status.replace(/_/g, " ")} • Cold Chain Lockbox #TLB-04 (2°C - 8°C)
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[8px] font-mono uppercase text-slate-400">
                    Registry Verification Stamp
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-300">
                    {record.testCode}
                  </div>
                  <div className="text-[8px] text-slate-400 mt-0.5">
                    Indian Powerlifting Federation
                  </div>
                  <div className="text-[7.5px] text-emerald-400 font-mono font-bold">
                    ⛓️ Immutable Block Sealed &amp; Verified
                  </div>
                  <div className="text-[7px] text-zinc-400 font-mono">
                    Evidence Act Sec 65B Certified
                  </div>
                </div>
              </div>
            </div>

            {/* ── Document Footer ── */}
            <div className="mt-2.5 pt-1 border-t border-slate-300 flex items-center justify-between text-[7.5px] font-mono text-slate-500">
              <span>NADA FORM DCF-2026/V3 • STRICT CONFIDENTIAL MEDICAL RECORD</span>
              <span>1-PAGE A4 OFFICIAL RATIFIED LEGAL DOCUMENT</span>
              <span>PAGE 1 OF 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
