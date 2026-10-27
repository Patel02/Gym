import { 
  Activity, 
  ArrowRight, 
  ArrowUpRight, 
  Award, 
  Building2, 
  Calendar, 
  CreditCard, 
  Dumbbell, 
  FileText, 
  Layers, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Trophy, 
  Users 
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

export const revalidate = 30;

const EVENTS_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-events.json");

async function getEventsSummary() {
  try {
    const data = await fs.readFile(EVENTS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    const events = parsed.events || [];
    return {
      total: events.length,
      active: events.filter((e: any) => e.status !== "COMPLETED").length,
      completed: events.filter((e: any) => e.status === "COMPLETED").length
    };
  } catch {
    return { total: 0, active: 0, completed: 0 };
  }
}

import { PageNavigation } from "@/components/ui/PageNavigation";
import { unstable_cache } from "next/cache";

async function getAdminDashboardData() {
  try {
    const [totalAthletes, activeMemberships, totalMeetsDb, recentLogs, eventsSummary] = await Promise.all([
      prisma.user.count({ where: { role: "MEMBER" } }).catch((err) => {
        console.warn("[Admin] Failed to count members:", err?.message || err);
        return 0;
      }),
      prisma.membership.count({ where: { status: "ACTIVE" } }).catch((err) => {
        console.warn("[Admin] Failed to count active memberships:", err?.message || err);
        return 0;
      }),
      prisma.event.count().catch((err) => {
        console.warn("[Admin] Failed to count events:", err?.message || err);
        return 0;
      }),
      prisma.auditLog
        .findMany({
          take: 6,
          orderBy: { timestamp: "desc" },
          include: { admin: { select: { name: true, email: true } } },
        })
        .catch((err) => {
          console.warn("[Admin] Failed to load audit logs:", err?.message || err);
          return [];
        }),
      getEventsSummary(),
    ]);

    return { totalAthletes, activeMemberships, totalMeetsDb, recentLogs, eventsSummary };
  } catch (err) {
    console.error("[AdminDashboardPage] Error loading dashboard metrics:", err);
    const eventsSummary = await getEventsSummary();
    return {
      totalAthletes: 0,
      activeMemberships: 0,
      totalMeetsDb: 0,
      recentLogs: [],
      eventsSummary,
    };
  }
}

const getCachedAdminDashboardData = unstable_cache(
  async () => {
    return await getAdminDashboardData();
  },
  ["admin-dashboard-summary-metrics"],
  {
    revalidate: 30,
    tags: ["admin-dashboard", "events", "memberships"],
  }
);

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const { totalAthletes, activeMemberships, totalMeetsDb, recentLogs, eventsSummary } =
    await getCachedAdminDashboardData();

  const totalMeetsCount = Math.max(totalMeetsDb, eventsSummary.total);

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <PageNavigation href="/" label="Back to Public Portal" badge="Command Center" />
        
        {/* ── Top Header Bar ── */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gym-primary mb-2 shadow-[0_0_15px_rgba(230,80,27,0.2)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Admin Management Hub</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              Command <span className="text-gym-primary">Center</span>
            </h1>
            <p className="text-sm font-medium text-gray-400 mt-1">
              Full administrative control: edit website content, manage championship meets, live scoring, and security logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 transition-all"
            >
              <Calendar className="h-4 w-4" />
              <span>Manage Events & Meets</span>
            </Link>

            <Link
              href="/admin/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-200 hover:border-gym-primary hover:text-white hover:bg-gym-primary/10 transition-all"
            >
              <Building2 className="h-4 w-4" />
              <span>About Page</span>
            </Link>

            <Link
              href="/admin/stats"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-200 hover:border-gym-primary hover:text-white hover:bg-gym-primary/10 transition-all"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Counter Stats</span>
            </Link>
          </div>
        </div>

        {/* ── Top Metric Cards ── */}
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            href="/admin/athletes"
            icon={<Users className="h-8 w-8 text-white" />}
            label="Registered Athletes"
            value={totalAthletes}
            subtext="Verified lifters • Click to manage"
          />
          <MetricCard
            href="/admin/memberships"
            icon={<CreditCard className="h-8 w-8 text-emerald-400" />}
            label="Active Memberships"
            value={activeMemberships}
            valueClass="text-emerald-400"
            subtext="Affiliation ledger • Click to manage"
          />
          <MetricCard
            href="/admin/events"
            icon={<Dumbbell className="h-8 w-8 text-gym-primary" />}
            label="Championship Meets"
            value={totalMeetsCount}
            valueClass="text-gym-primary"
            subtext={`${eventsSummary.active} Active • ${eventsSummary.completed} Past`}
          />
          <div className="relative overflow-hidden rounded-2xl border border-gym-primary/40 bg-gradient-to-br from-gym-primary to-[#b33509] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-black/70 mb-1">
                Platform Action
              </div>
              <h3 className="font-heading text-xl font-black uppercase text-black leading-tight">
                Match Day Live Scoring
              </h3>
              <p className="text-xs text-black/80 font-medium mt-1">
                Launch attempt table & live light board
              </p>
            </div>
            <Link
              href="/admin/live-scoring"
              prefetch={true}
              className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-black px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-zinc-900 transition-colors"
            >
              <span>Launch Platform</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Comprehensive User-Friendly Modules Grid ── */}
        <div className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                Management <span className="text-gym-primary">Modules</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Instant high-speed navigation to manage all federation operations, meets, content, and athletes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Module 1: Events & Meets Manager */}
            <div className="group relative rounded-3xl border border-gym-primary/40 bg-gradient-to-b from-[#180503] to-[#0c0201] p-6 shadow-xl hover:border-gym-primary hover:shadow-[0_0_30px_rgba(230,80,27,0.25)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gym-primary/15 text-gym-primary border border-gym-primary/30 group-hover:scale-105 transition-transform">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    {eventsSummary.active} Active Meets
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  Events & Championships
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Add new national meets, update dates/venues, change status, and delete completed or expired meets from public view.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/events"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gym-primary hover:text-white transition-colors"
                >
                  <span>Manage Events</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <span className="text-[11px] text-gray-500">
                  {eventsSummary.completed > 0 ? `${eventsSummary.completed} Past to clean` : "All Up-to-date"}
                </span>
              </div>
            </div>

            {/* Module: IPF Flight & Lot Sorter */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#180a22] to-[#0a0201] p-6 shadow-xl hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-purple-400 border border-white/10 group-hover:scale-105 transition-transform">
                    <Layers className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                    IPF Compliant
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-purple-400 transition-colors mb-2">
                  Flight & Lot Sorter
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Automated grouping into flights (max 14 lifters) by weight class and nominated openers. Verifiable CSPRNG lot draws with SHA-256 proof certificates.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/flights"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400 hover:text-white transition-colors"
                >
                  <span>Sort Flights & Lots</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">Auto Engine</span>
              </div>
            </div>

            {/* Module 2: Athletes Directory */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gym-primary border border-white/10 group-hover:scale-105 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    Lifter Roster
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  Athlete Directory
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Manage registered athletes, weight classes, profiles, membership validity, and reset credentials.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/athletes"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gym-primary hover:text-white transition-colors"
                >
                  <span>Manage Athletes</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">{totalAthletes} Registered</span>
              </div>
            </div>

            {/* Module 3: Memberships & Affiliations */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-emerald-400 border border-white/10 group-hover:scale-105 transition-transform">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    {activeMemberships} Active
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-emerald-400 transition-colors mb-2">
                  Memberships & ID Cards
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  View athlete affiliations, activate or cancel memberships, verify digital ID cards, and record payments.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/memberships"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 hover:text-white transition-colors"
                >
                  <span>Manage Memberships</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">State / National</span>
              </div>
            </div>

            {/* Module 4: Match Day Live Scoring */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gym-primary border border-white/10 group-hover:scale-105 transition-transform">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gym-primary bg-gym-primary/10 border border-gym-primary/30 px-2.5 py-0.5 rounded-full">
                    Platform Console
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  Live Scoring & Light Board
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Real-time match day attempt input, IPF GL point computation, automatic ranking updates, and spectator scoreboard.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/live-scoring"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gym-primary hover:text-white transition-colors"
                >
                  <span>Launch Scoring</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">Live Platform</span>
              </div>
            </div>

            {/* Module 5: National Records Manager */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-yellow-400 border border-white/10 group-hover:scale-105 transition-transform">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/80 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-0.5 rounded-full">
                    Ratification
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-yellow-400 transition-colors mb-2">
                  National Records
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Review, approve, and manage official national powerlifting records for Squat, Bench Press, Deadlift, and Total across divisions.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/records-manager"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-400 hover:text-white transition-colors"
                >
                  <span>Manage Records</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">Record Scrutiny</span>
              </div>
            </div>

            {/* Module 6: Referee Weigh-In Desk */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-blue-400 border border-white/10 group-hover:scale-105 transition-transform">
                    <Scale className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                    Inspection
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-blue-400 transition-colors mb-2">
                  Weigh-In Desk
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Official 2-hour meet weigh-in station, lot number assignments, opening attempt submission, and equipment check-in verification.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/weigh-in"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-400 hover:text-white transition-colors"
                >
                  <span>Open Weigh-In Desk</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">Match Day</span>
              </div>
            </div>

            {/* Module 7: Circulars & Document Portal */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gym-primary border border-white/10 group-hover:scale-105 transition-transform">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    PDF Library
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  Document Portal (CMS)
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Upload official entry circulars, technical rules PDF documents, meet schedules, and anti-doping guidelines for public download.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/cms"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gym-primary hover:text-white transition-colors"
                >
                  <span>Manage Documents</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">Upload & Publish</span>
              </div>
            </div>

            {/* Module 8: Public Stats & Counter Manager */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gym-primary border border-white/10 group-hover:scale-105 transition-transform">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    Live Counters
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  Public Counter Stats
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Update live homepage statistics: 10,000+ registered athletes, 900+ international medals, 50+ years of heritage, and 37 affiliated states.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/stats"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gym-primary hover:text-white transition-colors"
                >
                  <span>Manage Stats</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">Homepage Banner</span>
              </div>
            </div>

            {/* Module 9: About Federation Manager */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gym-primary border border-white/10 group-hover:scale-105 transition-transform">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    Doctrine & History
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  About Federation Content
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Edit Mission, Vision, 4 Pillars of Culture, 50-Year Historic Timeline (1975–2026), Hall of Glory honors, and Secretariat details.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/about"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gym-primary hover:text-white transition-colors"
                >
                  <span>Manage About Pages</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">5 Sub-sections</span>
              </div>
            </div>

            {/* Module 10: Referees Switchboard */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-emerald-400 border border-white/10 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Judicial Desk
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-emerald-400 transition-colors mb-2">
                  Referees Switchboard
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Platform jury oversight, referee license management, light switchboard testing, and chief referee assignments.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/referees"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 hover:text-white transition-colors"
                >
                  <span>Open Switchboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">Official Roster</span>
              </div>
            </div>

            {/* Module 11: Facility & Equipment */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gym-primary border border-white/10 group-hover:scale-105 transition-transform">
                    <Layers className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    Infrastructure
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  Facility & Calibrated Gear
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Manage certified platforms, calibrated Eleiko/ER racks, plate inventory, bars, and training facility information.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/facility"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gym-primary hover:text-white transition-colors"
                >
                  <span>Manage Facility</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">Equipment CMS</span>
              </div>
            </div>

            {/* Module 12: Coaching & Services */}
            <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl hover:border-gym-primary/50 hover:shadow-[0_0_30px_rgba(230,80,27,0.15)] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-purple-400 border border-white/10 group-hover:scale-105 transition-transform">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                    Programs
                  </span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase text-white group-hover:text-purple-400 transition-colors mb-2">
                  Services & Coaching
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Configure online coaching plans, personal trainer roster, academy certifications, and special athlete packages.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/admin/services"
                  prefetch={true}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400 hover:text-white transition-colors"
                >
                  <span>Manage Services</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[11px] text-gray-500">Coaching Hub</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Security Audit Logs Section ── */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0201] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/10 border border-gym-primary/30 text-gym-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black uppercase tracking-wider text-white">
                  Security & Audit Activity
                </h2>
                <p className="text-xs text-gray-400">Chronological ledger of administrative actions</p>
              </div>
            </div>
            <Link 
              href="/admin/logs" 
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gym-primary transition-colors"
            >
              View Full Logs
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-white/10 bg-[#140402] text-xs font-bold uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Admin Officer</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No recent administrative activity recorded.
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">
                        {log.timestamp.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {log.admin.name ?? log.admin.email ?? "Admin"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            log.action.includes("RECORD")
                              ? "bg-gym-primary/20 text-gym-primary border border-gym-primary/30"
                              : log.action.includes("SCORE")
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">
                        {log.entityId}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  valueClass = "text-white",
  subtext,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  valueClass?: string;
  subtext?: string;
  href?: string;
}) {
  const cardBody = (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0201] p-6 shadow-xl flex flex-col justify-between h-full transition-all duration-200 ${href ? 'hover:border-gym-primary/50 hover:bg-[#150503] cursor-pointer group' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-bold uppercase tracking-widest text-gray-400 ${href ? 'group-hover:text-gym-primary' : ''} transition-colors`}>{label}</p>
        <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${href ? 'group-hover:border-gym-primary/30 group-hover:scale-105' : ''} transition-all`}>{icon}</div>
      </div>
      <div>
        <h2 className={`font-heading text-4xl font-black ${valueClass}`}>{value}</h2>
        {subtext && <p className="text-xs text-gray-400 font-medium mt-1">{subtext}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} prefetch={true} className="block h-full">
        {cardBody}
      </Link>
    );
  }

  return cardBody;
}
