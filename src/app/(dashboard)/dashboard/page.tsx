import { auth } from "@/auth";
import { UserCard } from "@/components/dashboard/UserCard";
import { MembershipCheckout } from "@/components/dashboard/MembershipCheckout";
import { AthleteCompetitionHistory } from "@/components/dashboard/AthleteCompetitionHistory";
import { getUserCompetitionHistoryAction } from "@/actions/athlete-competition.actions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AthleteActiveRegistrations } from "@/components/dashboard/AthleteActiveRegistrations";
import { getUserActiveRegistrationsAction } from "@/actions/championship-registration.actions";
import Link from "next/link";
import { ArrowUpRight, Clock, Shield, UserCog, Target, Scale } from "lucide-react";

// Short ISR cache for snappy dashboard transitions
import { PageNavigation } from "@/components/ui/PageNavigation";

export const revalidate = 30;

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const db = prisma as any;

  // Fetch competition history, active registrations, and user account all in parallel
  const [compHistoryRes, activeRegistrationsRes, user] = await Promise.all([
    getUserCompetitionHistoryAction(userId),
    getUserActiveRegistrationsAction(),
    db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        deletionRequest: true,
        memberships: {
          where: { status: "ACTIVE" },
          orderBy: { endDate: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  const activeRegistrations = activeRegistrationsRes.registrations || [];
  const competitionSummary = compHistoryRes.summary || {
    totalMeetsPlayed: 0,
    bestOverallRank: null,
    highestTotalKg: 0,
    highestIpfGl: 0,
    overallSuccessRate: 0,
    competitions: [],
  };

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-gym-black text-white">Account not found. Please contact support.</div>;
  }

  const userRecord = user as any;
  const membership = userRecord.memberships?.[0] || null;
  const formattedUser = {
    name: userRecord.name,
    email: userRecord.email,
    image: userRecord.image,
    role: userRecord.role,
    profile: userRecord.profile,
    activeMembership: membership
      ? { cardNumber: membership.cardNumber, planType: membership.planType, status: membership.status, endDate: membership.endDate }
      : null,
    deletionRequest: userRecord.deletionRequest
      ? { status: userRecord.deletionRequest.status }
      : null,
  };

  const isDeletionPending = userRecord.deletionRequest?.status === "PENDING";

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <PageNavigation href="/" label="Back to Public Portal" badge="Athlete Dashboard" />
        
        {/* Pending Account Deletion Alert Banner */}
        {isDeletionPending && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-5 text-amber-300 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm uppercase tracking-wider text-white">Account Deletion Request Under Review</p>
                <p className="text-xs text-amber-200/80">You have requested permanent account deletion. An Administrator will review and approve removal.</p>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="shrink-0 inline-flex items-center justify-center rounded-xl border border-amber-500/50 bg-amber-500/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-200 hover:bg-amber-500 hover:text-black transition-all cursor-pointer shadow-sm"
            >
              Review or Withdraw
            </Link>
          </div>
        )}

        {/* Dashboard Header Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wider">Athlete <span className="text-gym-primary">Headquarters</span></h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage your competitive profile, memberships, and records</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {userRecord.role === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-red-500/50 bg-red-500/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Command Center</span>
              </Link>
            )}
            {(userRecord.role === "ADMIN" || userRecord.role === "REFEREE") && (
              <Link
                href="/referee/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500 hover:text-black transition-all shadow-md"
              >
                <Scale className="h-3.5 w-3.5" />
                <span>Referee Console</span>
              </Link>
            )}
            <Link
              href="/tools/attempt-strategy"
              className="inline-flex items-center gap-2 rounded-full border border-gym-primary/50 bg-gradient-to-r from-gym-primary to-gym-red px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 transition-all shadow-md"
            >
              <Target className="h-4 w-4" />
              <span>Meet Day War Room</span>
            </Link>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 rounded-full border border-gym-primary/40 bg-gym-primary/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white transition-all shadow-sm"
            >
              <UserCog className="h-4 w-4" />
              <span>Edit Profile & Security</span>
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-6">
            <UserCard user={formattedUser} />
            {!membership && <MembershipCheckout />}
          </div>
          <div className="flex flex-col gap-8 lg:col-span-2">
            <AthleteActiveRegistrations initialRegistrations={activeRegistrations} />
            <AthleteCompetitionHistory
              initialSummary={competitionSummary}
              athleteName={formattedUser.name || "Athlete"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}