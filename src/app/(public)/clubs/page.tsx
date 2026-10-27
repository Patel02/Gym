import { Metadata } from "next";
import Link from "next/link";
import { 
  Building2, 
  ChevronRight, 
  Dumbbell, 
  Landmark, 
  ShieldCheck, 
  Sparkles, 
  Trophy, 
  Users, 
  Zap 
} from "lucide-react";
import { getAffiliatedClubsAction } from "@/actions/club-affiliation.actions";
import ClubDirectoryView from "@/components/clubs/ClubDirectoryView";

export const metadata: Metadata = {
  title: "Accredited Strength Clubs & Barbell Gyms Directory • Indian Powerlifting Federation",
  description: "Official nationwide directory of IPF-affiliated strength training gyms, certified powerlifting clubs, and Eleiko competition platform facilities across India.",
};

export const revalidate = 60;

export default async function ClubsDirectoryPage() {
  const { clubs, availableStates } = await getAffiliatedClubsAction();

  return (
    <div className="min-h-screen bg-gym-black text-white pt-28 sm:pt-32 lg:pt-36 pb-20 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
          <Link href="/" className="hover:text-gym-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <Link href="/about/governance" className="hover:text-gym-primary transition-colors">Governance</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <span className="text-gym-primary">Accredited Clubs</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-[0_0_20px_rgba(230,80,27,0.2)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>National Platform Network</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-xl">
            Accredited Strength Clubs & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.5)]">
              Training Academies
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed">
            Discover ratified powerlifting facilities across India adhering to official IPF technical platform standards, calibrated steel discs, and Olympic coaching ethics.
          </p>
        </div>

        {/* Accreditation Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/20 text-gym-primary mb-3">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg font-bold uppercase text-white">Calibrated Standards</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Certified competition racks, 29mm IPF power bars, and calibrated steel discs calibrated to within 10 grams.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg font-bold uppercase text-white">Clean Sport Mandate</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Strict liability under WADA & NADA testing protocols. Zero tolerance for prohibited performance substances.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-3">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg font-bold uppercase text-white">State Quota Representation</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Athletes training at accredited clubs receive official state championship nomination & ranking eligibility.
            </p>
          </div>
        </div>

        {/* Interactive Club Directory */}
        <ClubDirectoryView
          initialClubs={clubs}
          availableStates={availableStates}
        />
      </div>
    </div>
  );
}
