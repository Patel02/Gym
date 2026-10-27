"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Search, 
  QrCode, 
  Award, 
  IdCard, 
  GraduationCap, 
  FlaskConical, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock
} from "lucide-react";
import Link from "next/link";

export function PublicVerifySearch() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim();
    if (!clean) {
      setError("Please enter a valid credential verification code or ID number.");
      return;
    }
    setError("");
    setLoading(true);
    router.push(`/verify/${encodeURIComponent(clean)}`);
  };

  const handleQuickFill = (sampleCode: string) => {
    setCode(sampleCode);
    setError("");
    setLoading(true);
    router.push(`/verify/${encodeURIComponent(sampleCode)}`);
  };

  return (
    <div className="space-y-8">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative mx-auto max-w-2xl">
        <div className="relative flex items-center rounded-2xl border-2 border-gym-primary/40 bg-zinc-900/90 p-2 shadow-[0_0_50px_rgba(230,80,27,0.2)] backdrop-blur-xl transition-all focus-within:border-gym-primary focus-within:shadow-[0_0_70px_rgba(230,80,27,0.35)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gym-primary/10 text-gym-primary shrink-0 ml-1">
            <Search className="h-6 w-6" />
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter Athlete Card #, Certificate Code, or Coach License..."
            className="w-full bg-transparent px-4 py-3 text-sm md:text-base font-semibold text-white placeholder-zinc-500 focus:outline-none tracking-wide uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-red-600 px-6 py-3.5 text-xs md:text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Checking...</span>
              </span>
            ) : (
              <>
                <span>Verify Now</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-center text-xs font-bold uppercase tracking-wider text-red-400">
            {error}
          </p>
        )}
      </form>

      {/* Quick Test Chips */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500 mb-3">
          Quick Test Credentials (Click to preview live records)
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickFill("WPI-2026-083-001")}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-all hover:border-gym-primary/50 hover:bg-gym-primary/10 hover:text-white"
          >
            <IdCard className="h-3.5 w-3.5 text-gym-primary" />
            <span>Athlete ID Card: <strong className="text-white">WPI-2026-083-001</strong></span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("CERT-WPI-2026-083-01")}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-white"
          >
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span>Meet Certificate: <strong className="text-white">CERT-WPI-2026-083-01</strong></span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("IPF-COACH-2026-L2-001")}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-white"
          >
            <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
            <span>Coach License: <strong className="text-white">IPF-COACH-2026-L2-001</strong></span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("COC-2026-083-001")}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-white"
          >
            <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />
            <span>Doping Custody: <strong className="text-white">COC-2026-083-001</strong></span>
          </button>
        </div>
      </div>
    </div>
  );
}
