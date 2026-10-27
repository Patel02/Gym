import { auth } from "@/auth";
import AboutEditor, { AboutData } from "@/components/admin/AboutEditor";
import { PageNavigation } from "@/components/ui/PageNavigation";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

export const revalidate = 30;

const ABOUT_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-about.json");

import { unstable_cache } from "next/cache";

const getCachedAboutData = unstable_cache(
  async (): Promise<AboutData> => {
    try {
      const data = await fs.readFile(ABOUT_FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      return {
        mission: "",
        vision: "",
        pillars: [],
        timeline: [],
        hallOfGlory: [],
        secretariat: [],
      } as unknown as AboutData;
    }
  },
  ["federation-about-data-cache"],
  { revalidate: 30, tags: ["about"] }
);

export default async function AdminAboutPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const aboutData = await getCachedAboutData();

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Admin Hub", href: "/admin" },
            { label: "About Page Editor" },
          ]}
          badge="CMS Content"
          className="mb-8"
        />

        {/* Interactive Editor */}
        <AboutEditor initialData={aboutData} />
      </div>
    </div>
  );
}
