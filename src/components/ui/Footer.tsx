"use client";

import { Mail, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on fullscreen broadcast displays
  if (
    pathname?.startsWith('/live/jumbotron') ||
    pathname?.startsWith('/live/overlay') ||
    pathname?.startsWith('/live/warmup')
  ) {
    return null;
  }
  // Check if current route is an administrative or athlete dashboard workspace
  const isWorkspaceRoute =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/super-admin') ||
    pathname?.startsWith('/referee') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register');

  return (
    <footer className="relative w-full bg-gym-black pt-6 md:pt-10">
      {/* ── Top Call To Action Strip (Displayed exclusively on public / marketing pages) ── */}
      {!isWorkspaceRoute && (
        <div className="mx-auto mb-10 md:mb-14 w-full max-w-7xl px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#1c0704]/90 via-[#100604]/95 to-[#080201] p-6 sm:p-10 md:p-14 text-center shadow-[0_0_50px_rgba(230,80,27,0.15)] backdrop-blur-xl">
            {/* Ambient Background Radial Glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-gradient-to-b from-gym-primary/25 via-gym-red/10 to-transparent blur-3xl" />
            <div className="absolute left-1/2 top-0 h-1 w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gym-primary to-transparent opacity-80" />

            {/* Federation Badge */}
            <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-gym-primary animate-pulse" />
              <span>WPI ASSOCIATION OF GUJARAT</span>
            </div>

            {/* Dynamic Prestige Heading */}
            <h2 className="relative z-10 mb-3 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-xl">
              World Powerlifting India <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-gym-primary via-[#ff8855] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.6)]">
                Association of Gujarat
              </span>
            </h2>

            <p className="relative z-10 mx-auto mb-8 max-w-2xl text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal">
              Official Gujarat state governing body for powerlifting championships, accredited strength coaching, and platform referee certification under <strong className="text-white">World Powerlifting India</strong>.
            </p>

            {/* Trust Pill Indicators */}
            <div className="relative z-10 mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-semibold text-gray-400">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Instant WhatsApp Desk</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1">
                <span>🏆 14+ Specialized Coaching Splits</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1">
                <span>🛡️ WPI Platform Certified</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://wa.me/917043951377?text=Hi%20WPI%20Gujarat%20Team,%20I%20want%20to%20inquire%20about%20powerlifting%20championships%20and%20coaching!"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-8 py-3.5 font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(16,185,129,0.45)] hover:shadow-[0_0_35px_rgba(37,211,102,0.7)] hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <WhatsAppIcon variant="badge" className="h-5 w-5" />
                <span>Chat On WhatsApp</span>
              </a>
              <Link
                href="/coaching"
                className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gym-primary hover:text-gym-primary transition-all duration-300 hover:scale-105 shadow-sm"
              >
                <span>Explore All Plans</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Footer Directory ── */}
      <div className="border-t border-white/10 bg-[#080808] px-6 pb-8 pt-10 md:pt-12 md:px-12 lg:px-16">
        <div className="mx-auto mb-14 grid w-full max-w-7xl grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          
          {/* Brand & Head Coaches */}
          <div className="flex flex-col items-start">
            <Link href="/" className="group mb-4 flex items-center gap-3">
              <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-amber-500/80 bg-black shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <Image
                  src="/images/wpi-logo-transparent.png"
                  alt="WPI Association of Gujarat Official Logo"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                  WPI <span className="text-gym-primary">Gujarat</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Association of Gujarat
                </span>
              </div>
            </Link>

            <p className="mb-4 text-xs font-medium leading-relaxed text-gray-400">
              State governing body for powerlifting under World Powerlifting India (WPI). Platform championships, athlete licensing, referee certifications, and coaching academy.
            </p>

            <div className="flex flex-col gap-1.5 text-xs text-gray-300 mb-4">
              <a 
                href="https://instagram.com/akash._.fit" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-gym-primary transition-colors flex items-center gap-1.5"
              >
                <span className="text-gym-primary font-bold">IG:</span> @akash._.fit
              </a>
              <a 
                href="https://instagram.com/tanvifitfusion" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-gym-primary transition-colors flex items-center gap-1.5"
              >
                <span className="text-gym-primary font-bold">IG:</span> @tanvifitfusion
              </a>
            </div>
          </div>

          {/* Coaching Programs */}
          <FooterLinks
            title="Coaching Programs"
            links={[
              ["Starter Plan (₹699/mo)", "/coaching/plans"],
              ["Basic Plan (₹999/mo)", "/coaching/plans"],
              ["Transformation (₹1,499/mo)", "/coaching/plans"],
              ["Premium 1-to-1 (₹1,999/mo)", "/coaching/plans"],
              ["Full Coaching Hub", "/coaching"],
            ]}
          />

          {/* Specialized & Federation */}
          <FooterLinks
            title="Federation & Coaching"
            links={[
              ["National Coaching Academy", "/coaching/academy"],
              ["Referee Command Center", "/referee/dashboard"],
              ["Attempt Strategy War Room", "/tools/attempt-strategy"],
              ["Plate & Warm-Up Calculator", "/tools/warmup-calculator"],
              ["Weigh-In Refeed Protocol", "/tools/weigh-in-planner"],
              ["NADA & WADA Doping Control", "/doping-control"],
              ["Championship Leaderboard", "/leaderboard"],
            ]}
          />

          {/* Contact & Consultation */}
          <div className="flex flex-col">
            <h4 className="mb-5 inline-block self-start border-b border-gym-primary/30 pb-2 text-xs font-bold uppercase tracking-widest text-white">
              Direct Contact
            </h4>
            <ul className="flex flex-col gap-3.5 text-xs font-medium text-gray-400">
              <li className="flex items-center gap-2.5">
                <WhatsAppIcon variant="official" className="h-4 w-4 shrink-0" />
                <a href="https://wa.me/917043951377" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  WhatsApp: +91 7043951377
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gym-primary" />
                <span>WPI Association of Gujarat • World Powerlifting India State Portal</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gym-primary" />
                <span>contact@wpigujarat.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            &copy; {new Date().getFullYear()} WPI Association of Gujarat • World Powerlifting India. All Rights Reserved.
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-600">
            Strength • Integrity • Platform Excellence
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[][] }) {
  return (
    <div className="flex flex-col">
      <h4 className="mb-6 inline-block self-start border-b border-gym-primary/30 pb-2 text-sm font-bold uppercase tracking-widest text-white">
        {title}
      </h4>
      <ul className="flex flex-col gap-4">
        {links.map(([label, href]) => (
          <li key={`${title}-${label}`}>
            <Link href={href} className="text-sm font-bold tracking-wider text-gray-500 transition-colors hover:text-gym-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}