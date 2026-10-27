import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
  Lock,
  FileCheck2,
  Scale
} from "lucide-react";
import { PublicVerifySearch } from "@/components/verify/PublicVerifySearch";

import { PageNavigation } from "@/components/ui/PageNavigation";

export const metadata: Metadata = {
  title: "Official Public Credential & Certificate Verification Registry | WPI Gujarat",
  description:
    "Official public cryptographic verification registry for IPF / WPI Gujarat state powerlifting competition certificates, athlete digital ID cards, referee licenses, and coaching credentials.",
};

export default function VerifyIndexPage() {
  return (
    <div className="min-h-screen bg-[#080201] text-white pt-32 sm:pt-36 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Atmospheric Lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-gym-primary/15 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-red-900/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-5xl space-y-12">
        <PageNavigation href="/" label="Back to Home" badge="Verification Desk" />
        {/* Header Hero */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-gym-primary">
            <ShieldCheck className="h-4 w-4" />
            <span>National Authenticity Registry</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-wider text-white">
            Verify <span className="text-gym-primary">Credentials</span> &amp; Certificates
          </h1>

          <p className="max-w-2xl text-xs sm:text-sm font-medium text-zinc-400 leading-relaxed">
            Verify the cryptographic authenticity of official WPI Gujarat athlete membership cards, 
            ratified championship certificates, coach accreditation licenses, and NADA doping control records.
          </p>
        </div>

        {/* Search Box & Quick Chips */}
        <PublicVerifySearch />

        {/* 4 Pillars of Federation Authenticity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 backdrop-blur-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/10 border border-gym-primary/20 text-gym-primary">
              <IdCard className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white">
              Athlete Digital Cards
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Verify active federation membership status, ratified weight category, and district club affiliation.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 backdrop-blur-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white">
              Meet Certificates
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Authenticate official state medals, podium finishes, GL points, and ratified national record marks.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 backdrop-blur-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white">
              Coach &amp; Referee Badges
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Confirm Level 1/2 coach accreditation and National Category 1/2 technical official jury licenses.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 backdrop-blur-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FlaskConical className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white">
              Doping Chain of Custody
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Inspect sample collection bottle security, barcode custody audit trail, and WADA laboratory verification.
            </p>
          </div>
        </div>

        {/* QR Scanner Weigh-In Guide Banner */}
        <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-r from-zinc-900 via-[#150702] to-zinc-900 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gym-primary">
              <QrCode className="h-3.5 w-3.5" />
              <span>For Meet Directors &amp; Referees</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
              Official Weigh-In &amp; Equipment Check Desk
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Scan the physical or smartphone QR code on any athlete ID card to immediately pull up verified weight class limits, approved equipment checklist, and photo confirmation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/athletes"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Browse Athletes
            </Link>
            <Link
              href="/admin/weigh-in"
              className="rounded-xl bg-gym-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors shadow-lg"
            >
              Open Weigh-In Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
