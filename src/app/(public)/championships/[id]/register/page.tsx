import { getMeetRegistrationDetailsAction } from "@/actions/championship-registration.actions";
import { ChampionshipRegisterWizard } from "@/components/championships/ChampionshipRegisterWizard";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  Dumbbell,
  FileText,
  MapPin,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 30;

interface RegisterPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await getMeetRegistrationDetailsAction(id);
  const title = res.meet?.title || "Championship Registration";

  return {
    title: `Official Entry Registration | ${title} | Indian Powerlifting Federation`,
    description: `Enter the official IPF-sanctioned championship meet, nominate your opening attempts & rack heights, and download your verified weigh-in accreditation pass.`,
  };
}

export default async function ChampionshipRegisterPage({ params }: RegisterPageProps) {
  const { id } = await params;
  const data = await getMeetRegistrationDetailsAction(id);

  if (!data.success || !data.meet) {
    return (
      <div className="min-h-screen bg-gym-black text-white pt-32 pb-20 px-4">
        <div className="mx-auto max-w-xl text-center rounded-3xl border border-white/10 bg-[#120402] p-8">
          <AlertTriangle className="h-12 w-12 text-gym-primary mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold uppercase">Championship Meet Not Found</h1>
          <p className="text-xs text-gray-400 mt-2 mb-6">
            The requested championship meet may not exist, or registration has officially concluded.
          </p>
          <Link
            href="/championships"
            className="inline-flex items-center gap-2 rounded-xl bg-gym-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
          >
            <span>Back to Championship Calendar</span>
          </Link>
        </div>
      </div>
    );
  }

  const { meet, currentUser, existingRegistration } = data;

  return (
    <div className="min-h-screen bg-gym-black text-white pt-28 sm:pt-32 lg:pt-36 pb-24 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-yellow-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          <Link href="/" className="hover:text-gym-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <Link href="/championships" className="hover:text-gym-primary transition-colors">National Championships</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <span className="text-gym-primary">Official Entry Registration</span>
        </div>

        {/* Meet Banner Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#200903] via-[#100301] to-[#150502] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gym-primary">
              <Trophy className="h-3.5 w-3.5" />
              <span>IPF SANCTIONED PLATFORM</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                Prize Pool: <strong className="text-yellow-400">{meet.prizePool}</strong>
              </span>
              <span className="text-xs font-bold text-gray-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                Entry: <strong className="text-emerald-400">{meet.entryFee}</strong>
              </span>
            </div>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white leading-tight">
            {meet.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-gray-300 border-t border-white/10 pt-4">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gym-primary" />
              <strong className="text-white">{meet.dates}</strong>
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gym-primary" />
              <span>{meet.venue}, {meet.city}</span>
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>{meet.daysLeft} Days to Meet</span>
            </span>
          </div>
        </div>

        {/* Registration Wizard Container */}
        <ChampionshipRegisterWizard
          meet={meet}
          currentUser={currentUser || null}
          existingRegistration={existingRegistration}
        />

        {/* Footer Technical Instructions Card */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-gym-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block uppercase">Official Weigh-In</strong>
              <span>Conducted exactly 2 hours prior to flight lifting on calibrated digital scales.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block uppercase">Equipment Check</strong>
              <span>IPF approved wrist wraps, knee sleeves, belts, and singlets are mandatory.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Dumbbell className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block uppercase">Warm-Up Room Access</strong>
              <span>Accredited lifters receive access to the backstage calibrated warm-up racks.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
