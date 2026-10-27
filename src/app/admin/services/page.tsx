import { auth } from "@/auth";
import ServicesEditor from "@/components/admin/ServicesEditor";
import { PageNavigation } from "@/components/ui/PageNavigation";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import type { ServicesData } from "@/actions/services.actions";

export const revalidate = 30;

const SERVICES_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-services.json");

async function getServicesData(): Promise<ServicesData> {
  try {
    const data = await fs.readFile(SERVICES_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    throw new Error("Could not load services data.");
  }
}

export default async function AdminServicesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const servicesData = await getServicesData();

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Breadcrumb */}
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Admin Hub", href: "/admin" },
            { label: "Coaching & Services Editor" },
          ]}
          badge="Coaching Engine"
          className="mb-8"
        />

        {/* Interactive Services Editor */}
        <ServicesEditor initialData={servicesData} />
      </div>
    </div>
  );
}
