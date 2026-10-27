import { notFound } from "next/navigation";
import { Metadata } from "next";
import { COACHING_PROGRAMS } from "@/data/coaching-programs";
import CoachingProgramView from "../../../../components/coaching/CoachingProgramView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: "plans" },
    { slug: "powerlifting" },
    { slug: "bodybuilding" },
    { slug: "fat-loss" },
    { slug: "muscle-gain" },
    { slug: "clinical" },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = COACHING_PROGRAMS[slug];

  if (!program) {
    return {
      title: "Coaching Program Not Found | A&T Fitness & Nutrition",
    };
  }

  return {
    title: `${program.title} | A&T Fitness & Nutrition`,
    description: program.tagline,
    openGraph: {
      title: `${program.title} — Starting from ${program.price}`,
      description: program.overview,
    },
  };
}

export default async function CoachingProgramPage({ params }: PageProps) {
  const { slug } = await params;
  const program = COACHING_PROGRAMS[slug];

  if (!program) {
    notFound();
  }

  return <CoachingProgramView program={program} />;
}
