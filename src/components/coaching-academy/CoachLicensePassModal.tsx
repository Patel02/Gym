"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  Award, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  X,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy
} from "lucide-react";
import Image from "next/image";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { generateQrDataUrl } from "@/lib/qr-generator";

interface CoachLicensePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  licenseCode: string;
  level: "LEVEL_1" | "LEVEL_2";
  levelTitle: string;
  scorePercentage: number;
  ratificationDate: string;
  initialQrDataUrl?: string;
}

export default function CoachLicensePassModal({
  isOpen,
  onClose,
  candidateName,
  licenseCode,
  level,
  levelTitle,
  scorePercentage,
  ratificationDate,
  initialQrDataUrl,
}: CoachLicensePassModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>(initialQrDataUrl || "");
  const [verificationUrl, setVerificationUrl] = useState<string>(
    `https://ipf-federation.in/verify/${licenseCode}`
  );

  useEffect(() => {
    setMounted(true);
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://ipf-federation.in";
    const params = new URLSearchParams({
      candidate: candidateName,
      level,
      score: `${scorePercentage}%`,
    });
    const fullUrl = `${origin}/verify/${licenseCode}?${params.toString()}`;
    setVerificationUrl(fullUrl);

    if (!initialQrDataUrl) {
      generateQrDataUrl(fullUrl, {
        width: 320,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      })
        .then((url) => {
          if (url) setQrDataUrl(url);
        })
        .catch((err) => console.warn("Failed to generate QR in modal:", err));
    }
  }, [licenseCode, initialQrDataUrl]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🏆 *Official National Strength Coach Accreditation License*\n\n` +
      `*Coach Name:* ${candidateName.toUpperCase()}\n` +
      `*Accreditation:* ${levelTitle}\n` +
      `*License Code:* ${licenseCode}\n` +
      `*Exam Performance:* ${scorePercentage}% (Passed)\n` +
      `*Ratified by:* National Technical Directors Coach Akash & Coach Tanvi\n\n` +
      `*Verify Credential Registry:* ${verificationUrl}`;
    
    if (typeof window !== "undefined") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !mounted) return null;

  const printStyles = `
    @media print {
      @page {
        size: A4 landscape;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #000000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        overflow: hidden !important;
        height: 100% !important;
      }
      body > *:not(#print-coach-license-modal-root) {
        display: none !important;
        visibility: hidden !important;
      }
      #print-coach-license-modal-root {
        display: flex !important;
        visibility: visible !important;
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #000000 !important;
        box-shadow: none !important;
        z-index: 9999999 !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .no-print {
        display: none !important;
      }
      #print-coach-license-container {
        display: block !important;
        visibility: visible !important;
        width: 285mm !important;
        height: 195mm !important;
        max-width: 98vw !important;
        max-height: 98vh !important;
        margin: auto !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        box-shadow: none !important;
        border: 4px double #b8860b !important;
        background: #0c0502 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box !important;
      }
      #print-coach-license-container * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;

  return createPortal(
    <div
      id="print-coach-license-modal-root"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto print:p-0 print:m-0 print:bg-black print:static print:inset-auto"
    >
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="relative w-full max-w-4xl my-auto print:max-w-none print:w-full print:m-0">
        
        {/* ── Screen-Only Action Control Bar ── */}
        <div className="no-print mb-4 rounded-2xl border border-white/10 bg-zinc-950/90 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-400 shadow-md">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  Official Strength Coach Diploma
                </span>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Ratified 2026
                </span>
              </div>
              <p className="text-xs text-gray-400">
                1-Page A4 Printable Diploma • National Coaching Commission
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer shadow-md"
            >
              <Printer className="h-4 w-4" />
              <span>Print A4 Diploma (1-Page)</span>
            </button>

            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/20 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-500/30 transition-all cursor-pointer shadow-md"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Verify Online</span>
            </a>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 transition-all cursor-pointer shadow-md"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── THE OFFICIAL A4 DIPLOMA CANVAS ── */}
        <div className="overflow-x-auto pb-2 print:overflow-visible print:pb-0">
          <div
            id="print-coach-license-container"
            className="relative mx-auto w-[860px] min-h-[580px] bg-gradient-to-b from-[#140b04] via-[#0d0502] to-black text-white p-8 sm:p-10 rounded-2xl border-4 border-double border-amber-500/60 shadow-2xl overflow-hidden select-text print:border-none print:shadow-none print:rounded-none"
          >
            {/* WPI Association of Gujarat Watermark Crest Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] opacity-[0.14] select-none pointer-events-none">
                <Image
                  src="/images/wpi-logo-transparent.png"
                  alt="WPI Association of Gujarat Watermark"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Inner Gold Filigree Double Border */}
            <div className="absolute inset-3 border-2 border-amber-500/40 pointer-events-none rounded-lg" />
            <div className="absolute inset-4 border border-amber-500/20 pointer-events-none rounded" />

            {/* Ornate Corner Accents */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

            <div className="relative z-10 text-center space-y-4">
              {/* Dual Federation Insignias Header */}
              <div className="flex items-center justify-between px-4 border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border-2 border-amber-400 bg-black shrink-0 shadow-md">
                    <Image
                      src="/images/wpi-logo-transparent.png"
                      alt="WPI Association of Gujarat Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-amber-400">
                      WPI ASSOCIATION OF GUJARAT
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      World Powerlifting India • Gujarat State Governing Body
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Award className="h-5 w-5 text-amber-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">National Coaching Commission</span>
                  </div>
                  <span className="text-[8px] font-mono text-gray-400">Accreditation & Technical Directorate</span>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                    WPI Academy
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    High-Performance Wing
                  </div>
                </div>
              </div>

              {/* Main Title */}
              <div className="pt-2">
                <h1 className="text-3xl sm:text-4xl font-serif font-black uppercase tracking-widest text-white">
                  Certificate of Accreditation
                </h1>
                <p className="text-xs font-serif italic text-amber-200/90 mt-1 max-w-xl mx-auto">
                  By virtue of authority vested by the National Technical Directorate, it is hereby certified that
                </p>
              </div>

              {/* Candidate Name in Bold Gold Serif */}
              <div className="py-2">
                <div className="inline-block border-b-2 border-amber-500/70 pb-1.5 px-8">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
                    {candidateName.toUpperCase()}
                  </h2>
                </div>
              </div>

              {/* Accompanying Accreditation Text */}
              <p className="text-xs text-gray-300 max-w-2xl mx-auto leading-relaxed">
                has successfully completed all prescribed curriculum requirements and passed the comprehensive technical examination with a score of <strong>{scorePercentage}%</strong>, and is hereby ratified as an official
              </p>

              <div className="inline-block rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-1.5 text-sm font-bold uppercase tracking-wider text-amber-300 font-mono shadow-sm">
                {levelTitle}
              </div>

              {/* Credentials Ledger Matrix */}
              <div className="pt-2 grid grid-cols-4 gap-2 text-left max-w-2xl mx-auto">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                  <span className="text-[9px] text-gray-400 font-mono block uppercase">License Number</span>
                  <span className="font-mono text-xs font-bold text-amber-300">{licenseCode}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                  <span className="text-[9px] text-gray-400 font-mono block uppercase">Classification</span>
                  <span className="font-mono text-xs font-bold text-white">{level.replace("_", " ")}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                  <span className="text-[9px] text-gray-400 font-mono block uppercase">Issue Date</span>
                  <span className="font-mono text-xs font-bold text-white">{ratificationDate}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                  <span className="text-[9px] text-gray-400 font-mono block uppercase">Standing</span>
                  <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> ACTIVE
                  </span>
                </div>
              </div>

              {/* ── Official Verification Block + Dual Signatures + Central Gold Seal ── */}
              <div className="pt-5 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 max-w-2xl mx-auto">
                {/* Dynamic High-Res Scannable QR Verification Block */}
                <div className="flex items-center gap-3 text-left">
                  <div className="h-16 w-16 sm:h-18 sm:w-18 bg-white p-1 rounded-lg border-2 border-amber-400/80 shadow-md shrink-0 flex items-center justify-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`QR Code verification for ${licenseCode}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-14 w-14 bg-zinc-200 animate-pulse rounded" />
                    )}
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>SCAN TO VERIFY</span>
                    </div>
                    <div className="text-[10px] font-mono text-white font-bold">
                      {licenseCode}
                    </div>
                    <div className="text-[8px] text-gray-400">
                      National Coaching Registry
                    </div>
                    <div className="text-[7.5px] font-mono text-emerald-400 font-bold">
                      WADA / NADA Compliant
                    </div>
                  </div>
                </div>

                {/* Central 24K Gold Seal */}
                <div className="h-16 w-16 rounded-full border-2 border-amber-400/80 bg-gradient-to-br from-amber-500/30 to-yellow-600/40 flex items-center justify-center p-1 shadow-[0_0_25px_rgba(245,158,11,0.35)] shrink-0">
                  <div className="h-full w-full rounded-full border border-amber-400/50 flex flex-col items-center justify-center text-[7px] font-black uppercase tracking-tighter text-amber-200 text-center">
                    <span>★ WPI ★</span>
                    <span className="text-[8px] font-serif text-yellow-100">RATIFIED</span>
                    <span>GUJARAT</span>
                  </div>
                </div>

                {/* Dual Director Signatures */}
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="font-serif italic text-base text-amber-200 border-b border-amber-500/30 pb-0.5">Coach Akash</div>
                    <div className="text-[8px] font-mono uppercase text-gray-300 font-bold mt-0.5">
                      Coach Akash
                    </div>
                    <div className="text-[7px] font-mono text-amber-400/80">
                      National Technical Director
                    </div>
                  </div>

                  <div>
                    <div className="font-serif italic text-base text-amber-200 border-b border-amber-500/30 pb-0.5">Coach Tanvi</div>
                    <div className="text-[8px] font-mono uppercase text-gray-300 font-bold mt-0.5">
                      Coach Tanvi
                    </div>
                    <div className="text-[7px] font-mono text-amber-400/80">
                      High-Performance Director
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
