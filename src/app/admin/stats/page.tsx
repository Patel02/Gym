import { auth } from "@/auth";
import { StatsEditor } from "@/components/admin/StatsEditor";
import { TrendingUp } from "lucide-react";
import { PageNavigation } from "@/components/ui/PageNavigation";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

export const revalidate = 30;

const STATS_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-stats.json");

const DEFAULT_STATS = [
  { id: "years", value: "50", suffix: "+", label: "Years of Heritage" },
  { id: "athletes", value: "10,000", suffix: "+", label: "Registered Athletes" },
  { id: "medals", value: "900", suffix: "+", label: "International Medals" },
  { id: "states", value: "37", suffix: "+", label: "Affiliated State Units" }
];

import { unstable_cache } from "next/cache";

const getCachedStats = unstable_cache(
  async () => {
    try {
      const data = await fs.readFile(STATS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch {
      return DEFAULT_STATS;
    }
  },
  ["federation-stats-cache"],
  { revalidate: 30, tags: ["stats"] }
);

export default async function AdminStatsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const stats = await getCachedStats();

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Admin Hub", href: "/admin" },
            { label: "Public Stats Manager" },
          ]}
          badge="Metrics Engine"
          className="mb-8"
        />

        {/* Page Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-gym-primary to-gym-red text-white shadow-[0_0_20px_rgba(230,80,27,0.4)]">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-heading text-4xl font-black uppercase tracking-wider">
              Public Stats <span className="text-gym-primary">Manager</span>
            </h1>
            <p className="text-sm font-medium text-gray-400 mt-0.5">
              Edit the live numbers and metric titles displayed on the Federation homepage.
            </p>
          </div>
        </div>

        {/* Client Stats Editor */}
        <StatsEditor initialStats={stats} />
      </div>
    </div>
  );
}
