import React from "react";
import Image from "next/image";
import { Award, ShieldCheck, Printer } from "lucide-react";

export interface OfficialCertificateViewProps {
  athleteName: string;
  federationName: string;
  logoUrl?: string;
  weightClass: string;
  total: number;
  glPoints: number;
  presidentName: string;
  secretaryName: string;
  issueDate?: string;
  certificateCode?: string;
  showPrintButton?: boolean;
}

export function OfficialCertificateView({
  athleteName,
  federationName,
  logoUrl = "/images/wpi-logo-transparent.png",
  weightClass,
  total,
  glPoints,
  presidentName,
  secretaryName,
  issueDate = "2026",
  certificateCode,
  showPrintButton = true,
}: OfficialCertificateViewProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Optional Top Print Toolbar (Hidden during actual print) */}
      {showPrintButton && (
        <div className="mb-4 flex items-center justify-end w-full max-w-[1122px] print:hidden">
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#C9A227]/40 bg-[#C9A227]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#C9A227] hover:bg-[#C9A227]/20 transition-all shadow-md hover:scale-[1.02]"
          >
            <Printer className="h-4 w-4" />
            <span>Print Official Diploma</span>
          </button>
        </div>
      )}

      {/* Diploma Certificate Container */}
      <div className="w-full overflow-x-auto pb-4 flex justify-center">
        <div
          id="official-diploma-print-area"
          className="w-[1122px] min-w-[1122px] h-[794px] bg-[#080808] text-white p-12 relative flex flex-col justify-between border-[12px] border-[#C9A227] shadow-[0_0_50px_rgba(201,162,39,0.2)] overflow-hidden font-serif select-none print:shadow-none print:border-[10px]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(201, 162, 39, 0.04) 0%, rgba(8, 8, 8, 0.98) 80%)",
          }}
        >
          {/* Subtle Outer Filigree Inner Border */}
          <div className="pointer-events-none absolute inset-2.5 border border-[#C9A227]/30" />
          <div className="pointer-events-none absolute inset-4 border border-[#C9A227]/20" />

          {/* Background Association Logo Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-6 pointer-events-none select-none">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Association Watermark"
                className="w-[520px] h-[520px] object-contain grayscale"
              />
            ) : (
              <div className="text-[200px] font-black tracking-widest text-[#C9A227] font-sans">
                WPI
              </div>
            )}
          </div>

          {/* Header with Association Logo & Ratified Record Strip */}
          <div className="relative z-10 flex items-center justify-between border-b-2 border-[#C9A227]/50 pb-5">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full border-2 border-[#C9A227] bg-black p-1 shadow-lg shrink-0">
                <img
                  src={logoUrl || "/images/wpi-logo-transparent.png"}
                  alt="Association Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-widest text-[#C9A227] uppercase font-sans">
                  {federationName}
                </h2>
                <p className="text-[10px] tracking-[4px] text-gray-400 uppercase font-sans font-semibold">
                  Official Ratification &amp; Merit Diploma
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-[#C9A227]">
              <div className="flex items-center gap-1.5 justify-end uppercase tracking-widest font-bold">
                <ShieldCheck className="h-4 w-4 text-[#C9A227]" />
                <span>Ratified Accreditation</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                {certificateCode ? `Diploma Code: ${certificateCode}` : `Issued: ${issueDate}`}
              </div>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="relative z-10 text-center my-auto py-6">
            <span className="text-xs uppercase tracking-[6px] text-[#C9A227] font-sans font-bold block mb-3">
              This is proudly presented to
            </span>

            <h1 className="text-5xl font-black tracking-wider text-white uppercase mb-4 border-b-2 border-t-2 border-[#C9A227]/60 py-4 max-w-3xl mx-auto font-sans shadow-xs">
              {athleteName}
            </h1>

            <p className="text-base text-gray-300 max-w-2xl mx-auto leading-relaxed mb-4 font-serif">
              For exceptional performance, rigorous adherence to technical anti-doping standards,
              and achieving official competition ranking in the{" "}
              <span className="text-[#C9A227] font-bold font-sans">{weightClass}</span> division with a
              sanctioned total of <span className="text-white font-bold font-sans">{total} KG</span> (
              <span className="text-[#C9A227] font-bold font-sans">{glPoints} IPF GL Points</span>).
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-4 py-1 text-[11px] font-sans font-bold uppercase tracking-widest text-[#C9A227]">
              <Award className="h-3.5 w-3.5" />
              <span>Sanctioned Championship Performance Verified</span>
            </div>
          </div>

          {/* Footer Signatures & Official Ratified Seal */}
          <div className="relative z-10 flex items-end justify-between pt-6 border-t-2 border-[#C9A227]/50 font-sans">
            {/* President Signature */}
            <div className="text-center w-56">
              <div className="border-b border-gray-400/80 mb-2 pb-1 font-mono text-xs font-bold text-gray-200">
                {presidentName}
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">
                President / Technical Director
              </span>
            </div>

            {/* Official Gold Seal */}
            <div className="flex flex-col items-center">
              <div className="relative w-22 h-22 rounded-full border-2 border-[#C9A227] flex items-center justify-center p-2 text-center bg-gradient-to-b from-[#C9A227]/20 via-black to-[#C9A227]/10 shadow-[0_0_25px_rgba(201,162,39,0.3)]">
                <div className="absolute inset-1 rounded-full border border-dashed border-[#C9A227]/60" />
                <span className="text-[9px] font-black uppercase text-[#C9A227] leading-tight tracking-wider">
                  Official Seal<br />Ratified
                </span>
              </div>
              <span className="text-[9px] text-gray-500 font-mono mt-1 uppercase">
                IPF Ratified Standard
              </span>
            </div>

            {/* Secretary Signature */}
            <div className="text-center w-56">
              <div className="border-b border-gray-400/80 mb-2 pb-1 font-mono text-xs font-bold text-gray-200">
                {secretaryName}
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">
                Secretary General
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficialCertificateView;
