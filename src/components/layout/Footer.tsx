'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone } from 'lucide-react'

function InstagramIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

function YoutubeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gym-black border-t border-white/[0.06] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

        {/* ── Top Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand block — 2 cols wide */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Logo + name */}
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 bg-black">
                <Image
                  src="/images/wpi-logo-transparent.png"
                  alt="WPI Association of Gujarat Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="font-heading text-sm font-bold uppercase tracking-widest text-white leading-tight">
                  WPI Association
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">
                  of Gujarat
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Official state governing body for powerlifting in Gujarat under <span className="text-gray-300 font-semibold">World Powerlifting India (WPI)</span>. Certified athletes, licensed coaches, and NADA/WADA compliant championships.
            </p>

            {/* Contact info */}
            <div className="flex flex-col gap-2 text-[11px] text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-amber-500/60 shrink-0" />
                <span>Gujarat, India — State Powerlifting Authority</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-amber-500/60 shrink-0" />
                <a href="mailto:info@wpigujarat.in" className="hover:text-amber-400 transition-colors">info@wpigujarat.in</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-amber-500/60 shrink-0" />
                <span>A&T Fitness &amp; Nutrition</span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {[
                { href: "https://instagram.com", icon: InstagramIcon, label: "Instagram" },
                { href: "https://youtube.com", icon: YoutubeIcon, label: "YouTube" },
                { href: "mailto:info@wpigujarat.in", icon: Mail, label: "Email" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-500 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400 transition-all duration-200"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mb-4">Platform</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/championships", label: "Championships" },
                { href: "/athletes", label: "Athletes" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/records", label: "National Records" },
                { href: "/live", label: "Live Scoring" },
                { href: "/circulars", label: "Circulars" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-xs text-gray-500 hover:text-amber-400 transition-colors duration-150 flex items-center gap-1.5 group">
                    <span className="h-px w-3 bg-gray-700 group-hover:bg-amber-500/60 group-hover:w-4 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mb-4">Services</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/coaching/academy", label: "Coaching Academy" },
                { href: "/doping-control", label: "Anti-Doping Portal" },
                { href: "/tools/attempt-strategy", label: "Attempt Planner" },
                { href: "/tools/weigh-in-planner", label: "Weigh-In Planner" },
                { href: "/shop", label: "Pro Shop" },
                { href: "/referee/dashboard", label: "Referee Portal" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-xs text-gray-500 hover:text-amber-400 transition-colors duration-150 flex items-center gap-1.5 group">
                    <span className="h-px w-3 bg-gray-700 group-hover:bg-amber-500/60 group-hover:w-4 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Federation */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mb-4">Federation</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "About WPI Gujarat" },
                { href: "/about/governance", label: "Governance" },
                { href: "/about/honors", label: "National Honors" },
                { href: "/rules", label: "Technical Rulebook" },
                { href: "/anti-doping", label: "Anti-Doping" },
                { href: "/clubs", label: "Affiliated Clubs" },
                { href: "/referee/login", label: "Technical Officials Portal" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-xs text-gray-500 hover:text-amber-400 transition-colors duration-150 flex items-center gap-1.5 group">
                    <span className="h-px w-3 bg-gray-700 group-hover:bg-amber-500/60 group-hover:w-4 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-6 w-6 rounded-full overflow-hidden border border-amber-500/40 shrink-0 bg-black">
              <Image src="/images/wpi-logo-transparent.png" alt="WPI Logo" fill className="object-contain" />
            </div>
            <p className="text-[11px] text-gray-600">
              &copy; {currentYear} WPI Association of Gujarat. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-700">
            <Link href="/about" className="hover:text-gray-400 transition-colors">About</Link>
            <span className="text-gray-800">·</span>
            <Link href="/rules" className="hover:text-gray-400 transition-colors">Rules</Link>
            <span className="text-gray-800">·</span>
            <Link href="/anti-doping" className="hover:text-gray-400 transition-colors">Anti-Doping</Link>
            <span className="text-gray-800">·</span>
            <span className="text-amber-600/60 font-semibold">WADA · NADA · WPI Compliant</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
