import { auth } from '@/auth'
import fs from 'fs/promises'
import path from 'path'
import Hero from '@/components/home/Hero'
import { LiveMeetCountdownTicker } from '@/components/home/LiveMeetCountdownTicker'
import { AthleteSpotlight } from '@/components/home/AthleteSpotlight'
import WelcomeFederation from '@/components/ui/WelcomeFederation'
import PowerStats from '@/components/ui/PowerStats'
import Philosophy from '@/components/ui/Philosophy'
import Services from '@/components/ui/Services'
import Leaderboard from '@/components/ui/Leaderboard'
import Events from '@/components/ui/Events'
import { prisma } from '@/lib/prisma'
import { HomeLiveResultsWidget } from '@/components/home/HomeLiveResultsWidget'
import { getHomeLiveChampionshipDataAction } from '@/actions/scoring.actions'

// ISR cache home page for 60 seconds - renders instantly on WPI logo click
export const revalidate = 60;

const STATS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'federation-stats.json')
const EVENTS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'federation-events.json')

const DEFAULT_STATS = [
  { id: 'years', value: '50', suffix: '+', label: 'Years of Heritage' },
  { id: 'athletes', value: '10,000', suffix: '+', label: 'Registered Athletes' },
  { id: 'medals', value: '900', suffix: '+', label: 'International Medals' },
  { id: 'states', value: '37', suffix: '+', label: 'Affiliated State Units' }
]

async function getStats() {
  try {
    const data = await fs.readFile(STATS_FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return DEFAULT_STATS
  }
}

async function getEventsData() {
  let events = [];
  let announcements: any[] = [];

  try {
    const data = await fs.readFile(EVENTS_FILE_PATH, 'utf-8')
    const parsed = JSON.parse(data)
    events = parsed.events || [];
    announcements = parsed.announcements || [];
  } catch {}

  // Merge database circulars from CMS if present
  try {
    const dbCirculars = await prisma.circular.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 4,
    });

    for (const c of dbCirculars) {
      if (!announcements.some((a) => a.title.toLowerCase() === c.title.toLowerCase())) {
        announcements.unshift({
          id: c.id,
          title: c.title,
          date: new Date(c.publishedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
          type: 'rule',
          fileUrl: c.fileUrl,
        });
      }
    }
  } catch (err) {
    console.warn("Could not query db circulars for home page:", err);
  }

  return { events, announcements }
}

async function getSpotlightAthletesData() {
  try {
    const topResults = await prisma.result.findMany({
      where: { total: { gt: 0 } },
      orderBy: [{ ipfGlPoints: 'desc' }, { total: 'desc' }],
      take: 6,
      include: {
        user: {
          include: {
            profile: {
              include: {
                club: true,
              },
            },
          },
        },
      },
    });

    if (topResults.length === 0) return undefined;

    return topResults.map((r) => {
      const gender = (r.user.profile?.gender === "FEMALE" ? "FEMALE" : "MALE") as "MALE" | "FEMALE";
      const isFemale = gender === "FEMALE";
      const category: "MEN_OPEN" | "WOMEN_OPEN" = isFemale ? "WOMEN_OPEN" : "MEN_OPEN";

      return {
        id: r.user.id,
        name: r.user.name || "State Champion",
        category,
        categoryLabel: isFemale ? "Women Open" : "Men Open",
        weightClass: (r.user.profile?.weightClass || "83 KG").replace("WC_", "") + (r.user.profile?.weightClass?.includes("KG") ? "" : " KG"),
        gender,
        club: r.user.profile?.club?.name || "Gujarat State Unit",
        state: r.user.profile?.club?.state || "Gujarat",
        squat: r.bestSquat || 0,
        bench: r.bestBench || 0,
        deadlift: r.bestDeadlift || 0,
        total: r.total || 0,
        dots: r.ipfGlPoints || 0,
        recordsHeld: [
          `Gujarat State Total: ${r.total} KG`,
          `Best SBD: SQ ${r.bestSquat || 0} / BP ${r.bestBench || 0} / DL ${r.bestDeadlift || 0}`,
        ],
        honors: ["WPI Ratified Championship Medalist"],
        image: r.user.image || null,
        licenseNumber: (r.user as any).licenseNumber || `WPI-GJ-${r.user.id.slice(-4).toUpperCase()}`,
        isNationalChampion: true,
      };
    });
  } catch (err) {
    console.warn("Could not query spotlight athletes from DB:", err);
    return undefined; // Falls back to DEFAULT_SPOTLIGHT_ATHLETES inside AthleteSpotlight component
  }
}

export default async function Home() {
  const [session, stats, eventsData, liveChampionshipRes, spotlightAthletes] = await Promise.all([
    auth(),
    getStats(),
    getEventsData(),
    getHomeLiveChampionshipDataAction(),
    getSpotlightAthletesData(),
  ])

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-gym-black relative">
      <Hero session={session} />
      <LiveMeetCountdownTicker initialEvents={eventsData.events} />
      <WelcomeFederation />
      <PowerStats initialStats={stats} />
      <AthleteSpotlight initialAthletes={spotlightAthletes} />
      <Philosophy />
      <Services />
      <HomeLiveResultsWidget initialData={liveChampionshipRes.success ? liveChampionshipRes.data : undefined} />
      <Leaderboard />
      <Events 
        initialEvents={eventsData.events} 
        initialAnnouncements={eventsData.announcements} 
      />
    </main>
  )
}
