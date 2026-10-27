import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import {
  ensureEventsSeeded,
  autoEnrollActiveLiftersAction,
  type LiveScoringMeetDto,
  type LiveScoringResultDto,
} from "@/actions/scoring.actions";
import { RefereeDashboardMaster } from "@/components/referee/RefereeDashboardMaster";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home, Shield } from "lucide-react";
import { PageNavigation } from "@/components/ui/PageNavigation";

export const revalidate = 15;

export const metadata: Metadata = {
  title: "Official Technical Referee & Jury Command Dashboard | A&T Powerlifting",
  description:
    "Official 3-referee electronic switchboard, synthesized platform audio commands, real-time match arena broadcast sync, and Technical Jury VAR appeal desk.",
};

async function loadRefereeDashboardData(): Promise<{
  initialMeets: LiveScoringMeetDto[];
  initialResults: LiveScoringResultDto[];
}> {
  try {
    // Ensure default championship meets exist in DB if active
    await ensureEventsSeeded().catch(() => {});

    // Fetch all championship meets
    const events = await prisma.event.findMany({
      orderBy: { date: "desc" },
      include: {
        _count: {
          select: { results: true },
        },
      },
    });

    const initialMeets: LiveScoringMeetDto[] = events.map((ev) => ({
      id: ev.id,
      title: ev.title,
      dates: ev.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      city: ev.location,
      status: ev.status,
      liftersCount: ev._count.results,
    }));

    const initialSelectedMeetId = initialMeets.length > 0 ? initialMeets[0].id : "";

    // Auto-enroll active lifters if meet has no results yet
    if (initialSelectedMeetId) {
      try {
        const existingCount = await prisma.result.count({
          where: { eventId: initialSelectedMeetId },
        });
        if (existingCount === 0) {
          await autoEnrollActiveLiftersAction(initialSelectedMeetId);
        }
      } catch {}
    }

    // Fetch initial results
    let initialResults: LiveScoringResultDto[] = [];
    if (initialSelectedMeetId) {
      const rawResults = await prisma.result.findMany({
        where: { eventId: initialSelectedMeetId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
              profile: {
                select: {
                  weightClass: true,
                  gender: true,
                },
              },
            },
          },
        },
        orderBy: [{ total: "desc" }, { ipfGlPoints: "desc" }],
        take: 20,
      });

      const registrations = await prisma.meetRegistration.findMany({
        where: { eventId: initialSelectedMeetId },
        select: { userId: true, bodyweight: true },
      });
      const bwMap = new Map<string, number | null>(
        registrations.map((reg) => [reg.userId, reg.bodyweight])
      );

      initialResults = rawResults.map((r) => ({
        id: r.id,
        userId: r.userId,
        eventId: r.eventId,
        version: r.version,
        bodyweight: bwMap.get(r.userId) || 82.5,
        squat1: r.squat1,
        squat2: r.squat2,
        squat3: r.squat3,
        bestSquat: r.bestSquat,
        bench1: r.bench1,
        bench2: r.bench2,
        bench3: r.bench3,
        bestBench: r.bestBench,
        deadlift1: r.deadlift1,
        deadlift2: r.deadlift2,
        deadlift3: r.deadlift3,
        bestDeadlift: r.bestDeadlift,
        total: r.total,
        ipfGlPoints: r.ipfGlPoints,
        rank: r.rank,
        user: {
          name: r.user.name,
          email: r.user.email,
          image: r.user.image,
          profile: r.user.profile,
        },
      }));
    }

    return { initialMeets, initialResults };
  } catch (err: any) {
    console.warn("Could not load referee data from database, using offline platform fallback:", err?.message || err);

    // Read fallback meets from federation-events.json
    let fallbackMeets: LiveScoringMeetDto[] = [];
    try {
      const filePath = path.join(process.cwd(), "src", "data", "federation-events.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data.events)) {
        fallbackMeets = data.events.map((e: any) => ({
          id: e.id,
          title: e.title,
          dates: e.dates || "July 2026",
          city: `${e.city || "Gujarat"}, ${e.venue || "Indoor Arena"}`,
          status: e.status || "REGISTRATION OPEN",
          liftersCount: 14,
        }));
      }
    } catch {}

    if (fallbackMeets.length === 0) {
      fallbackMeets = [
        {
          id: "meet-gujarat-state-2026",
          title: "Gujarat State Powerlifting Championship & Selection Trials 2026",
          dates: "15-18 Oct 2026",
          city: "Ahmedabad, Gujarat",
          status: "IN PROGRESS",
          liftersCount: 14,
        },
      ];
    }

    // Rich fallback lifters so the referee console, lights, timer, and switchboard are fully operable
    const fallbackResults: LiveScoringResultDto[] = [
      {
        id: "res-rakesh-patel",
        userId: "user-rakesh",
        eventId: fallbackMeets[0].id,
        version: 1,
        bodyweight: 82.4,
        squat1: 235,
        squat2: 245,
        squat3: null,
        bestSquat: 245,
        bench1: 155,
        bench2: 165,
        bench3: null,
        bestBench: 165,
        deadlift1: 280,
        deadlift2: 295,
        deadlift3: null,
        bestDeadlift: 295,
        total: 705,
        ipfGlPoints: 97.59,
        rank: 1,
        user: {
          name: "Patel Rakesh",
          email: "rakesh.patel@wpi-gujarat.org",
          image: null,
          profile: { weightClass: "WC_83", gender: "MALE" },
        },
      },
      {
        id: "res-amar-patel",
        userId: "user-amar",
        eventId: fallbackMeets[0].id,
        version: 1,
        bodyweight: 81.8,
        squat1: 220,
        squat2: 230,
        squat3: null,
        bestSquat: 230,
        bench1: 145,
        bench2: 155,
        bench3: null,
        bestBench: 155,
        deadlift1: 255,
        deadlift2: 270,
        deadlift3: null,
        bestDeadlift: 270,
        total: 655,
        ipfGlPoints: 90.67,
        rank: 2,
        user: {
          name: "Patel Amar",
          email: "amar.patel@wpi-gujarat.org",
          image: null,
          profile: { weightClass: "WC_83", gender: "MALE" },
        },
      },
      {
        id: "res-priya-sharma",
        userId: "user-priya",
        eventId: fallbackMeets[0].id,
        version: 1,
        bodyweight: 62.3,
        squat1: 160,
        squat2: 172.5,
        squat3: null,
        bestSquat: 172.5,
        bench1: 90,
        bench2: 97.5,
        bench3: null,
        bestBench: 97.5,
        deadlift1: 190,
        deadlift2: 205,
        deadlift3: null,
        bestDeadlift: 205,
        total: 475,
        ipfGlPoints: 95.84,
        rank: 3,
        user: {
          name: "Priya Sharma",
          email: "priya.sharma@wpi-gujarat.org",
          image: null,
          profile: { weightClass: "WC_63", gender: "FEMALE" },
        },
      },
      {
        id: "res-aryan-mehta",
        userId: "user-aryan",
        eventId: fallbackMeets[0].id,
        version: 1,
        bodyweight: 73.1,
        squat1: 205,
        squat2: 215,
        squat3: null,
        bestSquat: 215,
        bench1: 130,
        bench2: 140,
        bench3: null,
        bestBench: 140,
        deadlift1: 240,
        deadlift2: 255,
        deadlift3: null,
        bestDeadlift: 255,
        total: 610,
        ipfGlPoints: 88.9,
        rank: 4,
        user: {
          name: "Aryan Mehta",
          email: "aryan.mehta@wpi-gujarat.org",
          image: null,
          profile: { weightClass: "WC_74", gender: "MALE" },
        },
      },
    ];

    return { initialMeets: fallbackMeets, initialResults: fallbackResults };
  }
}

export default async function RefereeDashboardPage() {
  const session = await auth();

  // Middleware already guards this, but double-check on the server
  if (!session?.user) {
    redirect("/referee/login");
  }
  if (session.user.role !== "REFEREE" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const userName = session.user.name || "Official Technical Official";
  const userRole = session.user.role || "REFEREE";

  const { initialMeets, initialResults } = await loadRefereeDashboardData();

  return (
    <div className="min-h-screen bg-[#080201] text-white pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Breadcrumb & Navigation */}
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Technical Rules", href: "/rules" },
            { label: "Referee & Jury Command" },
          ]}
          badge={userRole || "Official"}
        />

        {/* Master Referee Dashboard Component */}
        <RefereeDashboardMaster
          initialMeets={initialMeets}
          initialResults={initialResults}
          userName={userName}
          userRole={userRole}
        />
      </div>
    </div>
  );
}
