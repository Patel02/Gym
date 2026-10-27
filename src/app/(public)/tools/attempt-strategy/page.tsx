import { AttemptStrategyMaster } from "@/components/tools/AttemptStrategyMaster";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home, Target, ShieldCheck } from "lucide-react";

import { PageNavigation } from "@/components/ui/PageNavigation";

export const metadata: Metadata = {
  title: "Official IPF Meet Day Coach Attempt Strategy & War Room | A&T Powerlifting",
  description:
    "9-for-9 attempt peaking curves, IPF 60-second attempt submission countdown clock, live platform contingency decision tree, and official triplicate rack height card.",
};

export default function AttemptStrategyPage() {
  return (
    <div className="min-h-screen bg-[#080201] text-white pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Breadcrumb Navigation */}
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Championships", href: "/championships" },
            { label: "Attempt Strategy & War Room" },
          ]}
          badge="Coach War Room"
        />

        {/* Master Strategy App */}
        <AttemptStrategyMaster />
      </div>
    </div>
  );
}
