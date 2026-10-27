import { WarmupCalculatorApp } from "@/components/tools/WarmupCalculatorApp";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Dumbbell, Home, ShieldCheck } from "lucide-react";

import { PageNavigation } from "@/components/ui/PageNavigation";

export const metadata: Metadata = {
  title: "Official IPF Warm-Up & Barbell Plate Loading Calculator | A&T Powerlifting",
  description:
    "Calibrated Olympic barbell plate loading visualizer, backstage flight timing countdown, and 3-attempt competition jump strategy matrix for powerlifters & coaches.",
};

export default function WarmupCalculatorPage() {
  return (
    <div className="min-h-screen bg-[#080201] text-white pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Breadcrumb Navigation */}
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Championships", href: "/championships" },
            { label: "Warm-Up & Plate Calculator" },
          ]}
          badge="Warm-Up Engine"
        />

        {/* Cross-Link Banner to Meet Day War Room */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-gym-primary/30 bg-gym-primary/10 p-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-base">🎯</span>
            <div>
              <span className="font-bold text-white uppercase tracking-wider block">
                Meet Day Coach War Room &amp; 9-Attempt Peaking
              </span>
              <span className="text-zinc-400">
                Plan all 9 competition attempts, track the official 60s submission clock, and print triplicate cards with rack heights.
              </span>
            </div>
          </div>
          <Link
            href="/tools/attempt-strategy"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-4 py-2 font-black uppercase tracking-wider text-white shadow-sm hover:brightness-110 transition-all"
          >
            <span>Launch War Room</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* The Master Warm-Up Application */}
        <WarmupCalculatorApp
          initialOpener={210}
          initialDiscipline="SQUAT"
          athleteName="Competitor Lifter"
          bodyweight={83}
        />
      </div>
    </div>
  );
}
