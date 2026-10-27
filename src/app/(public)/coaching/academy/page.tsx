import { Metadata } from "next";
import CoachingAcademyMaster from "@/components/coaching-academy/CoachingAcademyMaster";

export const metadata: Metadata = {
  title: "Official National Strength Coaching & Technical Clinic Academy | Indian Powerlifting Federation",
  description:
    "Official Indian Powerlifting Federation Coaching Accreditation Academy directed by Coach Akash & Coach Tanvi. Level 1 & Level 2 certifications, 8-module curriculum, periodization examination, and official coach licenses.",
  openGraph: {
    title: "Official National Strength Coaching & Technical Clinic Academy",
    description:
      "Master SBD platform biomechanics, 1RM supercompensation peaking, weigh-in refeed science, and WADA anti-doping strict liability.",
  },
};

import { PageNavigation } from "@/components/ui/PageNavigation";

export default function CoachingAcademyPage() {
  return (
    <main className="min-h-screen bg-[#080201] text-white pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageNavigation href="/coaching" label="Back to Coaching Hub" badge="National Academy" />
        <CoachingAcademyMaster />
      </div>
    </main>
  );
}
