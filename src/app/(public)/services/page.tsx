import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import ServicesView from "@/components/services/ServicesView";
import type { ServicesData } from "@/actions/services.actions";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Official Federation Services & Accreditation • Indian Powerlifting Federation",
  description: "Official athlete sanctioning, referee certification clinics, state affiliation, and championship equipment rental.",
};

const SERVICES_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-services.json");

async function getServicesData(): Promise<ServicesData> {
  try {
    const data = await fs.readFile(SERVICES_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return {
      hero: {
        badge: "Federation Governance & Portfolios",
        title: "Federation Services",
        subtitle: "& Accreditation",
        desc: "Supporting athletes, state bodies, certified officials, and strength gyms nationwide.",
      },
      services: [],
      cta: {
        tag: "Secretariat Helpdesk",
        title: "Need Assistance With Affiliation or Licenses?",
        desc: "Connect directly with the Federation Administration on WhatsApp.",
        waMessage: "Hi Federation Secretariat, I need assistance regarding federation services.",
      }
    };
  }
}

export default async function ServicesPage() {
  const servicesData = await getServicesData();

  return <ServicesView initialData={servicesData} />;
}
