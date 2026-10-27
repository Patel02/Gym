import { WeighInPlannerMaster } from "@/components/tools/WeighInPlannerMaster";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home, Scale, Apple } from "lucide-react";

import { PageNavigation } from "@/components/ui/PageNavigation";

export const metadata: Metadata = {
  title: "Official IPF Weigh-In Water Cut & Rapid Refeed Protocol | A&T Powerlifting",
  description:
    "Scientific 5-day water loading and sodium taper protocol, safe bodyweight cut analyzer, and 120-minute post weigh-in rapid glycogen refeed formulated by Coach Akash & Coach Tanvi.",
};

export default function WeighInPlannerPage() {
  return (
    <div className="min-h-screen bg-[#080201] text-white pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Breadcrumb Navigation */}
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Championships", href: "/championships" },
            { label: "Weigh-In & Refeed Protocol" },
          ]}
          badge="Nutrition Protocol"
        />

        {/* Master Nutrition Application */}
        <WeighInPlannerMaster />
      </div>
    </div>
  );
}
