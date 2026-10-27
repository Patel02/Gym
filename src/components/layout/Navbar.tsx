'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Globe, MapPin, Menu, MessageCircle, ShieldCheck, Sparkles, X } from 'lucide-react'
import { LogoutButton } from '@/components/auth/LogoutButton'
import WhatsAppIcon from '@/components/ui/WhatsAppIcon'

interface DropdownItem {
  name: string
  href: string
  desc: string
}

interface NavItem {
  name: string
  href: string
  dropdown?: DropdownItem[]
}

const navItems: NavItem[] = [
  {
    name: 'About',
    href: '/about',
    dropdown: [
      { name: 'About Federation', href: '/about', desc: 'Estd. 1975 national governing body hub' },
      { name: 'Mission & Values', href: '/about/mission', desc: 'Core doctrine & clean sport policy' },
      { name: 'Historic Timeline', href: '/about/timeline', desc: 'Milestones from 1975 to 2026' },
      { name: 'Hall of Glory & Awards', href: '/about/honors', desc: '7 Arjuna & Dronacharya awardees' },
      { name: 'National Secretariat', href: '/about/governance', desc: '37 State bodies & governance' },
      { name: 'Accredited Clubs & Gyms', href: '/clubs', desc: 'Nationwide verified barbell academies' },
    ],
  },
  {
    name: 'Coaching',
    href: '/coaching',
    dropdown: [
      { name: '🎓 National Coaching Academy', href: '/coaching/academy', desc: 'Level 1 & 2 coach accreditation, periodization exam & license' },
      { name: '4 Monthly Plans', href: '/coaching/plans', desc: 'Starter (₹699) to Premium 1-on-1 (₹1,999)' },
      { name: 'Powerlifting Coaching', href: '/coaching/powerlifting', desc: 'IPF platform programming & peaking' },
      { name: 'Bodybuilding & Hypertrophy', href: '/coaching/bodybuilding', desc: 'Muscle sculpting splits & macro plans' },
      { name: 'Fat Loss & Recomposition', href: '/coaching/fat-loss', desc: 'Sustainable deficits with zero starvation' },
      { name: 'Clean Muscle Gain', href: '/coaching/muscle-gain', desc: 'Lean surplus & progressive overload' },
      { name: 'PCOS & Clinical Nutrition', href: '/coaching/clinical', desc: 'Hormonal & metabolic lifestyle support' },
      { name: 'Full Coaching Hub', href: '/coaching', desc: 'All 14 goals & interactive programs' },
    ],
  },
  {
    name: 'Championships',
    href: '/championships',
    dropdown: [
      { name: '🔴 Live Match Day Arena', href: '/live', desc: 'Real-time attempts, referee lights & scoreboard' },
      { name: '📺 Venue Stage Jumbotron', href: '/live/jumbotron', desc: 'Full-screen projector HUD, giant referee lights & timer' },
      { name: '⏱️ Backstage Warmup Matrix', href: '/live/warmup', desc: 'Real-time flight queue order, In The Hole alerts & bar loading' },
      { name: '📡 OBS Stream Overlay', href: '/live/overlay', desc: 'Transparent lower-third broadcast HUD for streamers' },
      { name: '🎯 Attempt Strategy & War Room', href: '/tools/attempt-strategy', desc: '9-for-9 peaking, 60s submission clock & rack heights' },
      { name: '🏋️ Warm-Up & Plate Calculator', href: '/tools/warmup-calculator', desc: 'Sleeve loader, rest clock & attempt matrix' },
      { name: '🥗 Weigh-In & Refeed Protocol', href: '/tools/weigh-in-planner', desc: '5-day water load, sodium taper & 2h rapid refeed' },
      { name: '🔀 IPF Flight & Lot Sorter', href: '/admin/flights', desc: 'Auto 14-lifter flights, CSPRNG lot draw, A4 weigh-in sheet & WhatsApp' },
      { name: '2026 Meet Calendar', href: '/championships', desc: 'Upcoming national & zonal championship meets' },
      { name: 'Official Circulars & Forms', href: '/circulars', desc: 'Entry circulars, schedules & PDF downloads' },
    ],
  },
  {
    name: 'Rankings',
    href: '/leaderboard',
    dropdown: [
      { name: '📊 Strength & GL Calculator', href: '/tools/strength-calculator', desc: 'IPF GL points, national percentile & 1RM peaking' },
      { name: 'National Leaderboard', href: '/leaderboard', desc: 'Live IPF points & national rankings' },
      { name: 'National Records', href: '/records', desc: 'Ratified Indian benchmarks across weight classes' },
      { name: 'Elite Athlete Directory', href: '/athletes', desc: 'Roster of verified federation competitors' },
    ],
  },
  {
    name: 'IPF Rules',
    href: '/rules',
    dropdown: [
      { name: '⚖️ Referee & Jury Command Center', href: '/referee/dashboard', desc: 'Live 3-light switchboard, voice commands & VAR desk' },
      { name: '🎓 Referee Exam & Certification', href: '/rules/referee-exam', desc: 'Interactive certification pass & VAR training' },
      { name: '🛍️ Official Pro-Shop & Gear', href: '/shop', desc: 'IPF approved singlets, 13mm belts & refeed bundles' },
      { name: 'IPF Technical Rules', href: '/rules', desc: 'Squat, bench & deadlift criteria rulebook' },
      { name: '🛡️ NADA & WADA Doping Control Desk', href: '/doping-control', desc: 'Random meet draw, A/B bottle security & substance checker' },
      { name: 'Anti-Doping & Clean Sport', href: '/anti-doping', desc: 'NADA & WADA strict liability compliance' },
      { name: 'Approved Equipment', href: '/equipment', desc: 'IPF legal belts, knee sleeves & calibrated plates' },
    ],
  },
  {
    name: 'Services',
    href: '/services',
  },
  {
    name: 'Facility',
    href: '/facility',
  },
]

export default function Navbar({ session }: { session: any }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null)
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null)
  const [hasJoined, setHasJoined] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isObsCapture, setIsObsCapture] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Track visitor vs joined/registered status
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const checkStatus = () => {
        const joinedLocal = localStorage.getItem('federation_has_joined') === 'true'
        const joinedCookie = document.cookie.includes('federation_has_joined=true')
        if (session?.user) {
          localStorage.setItem('federation_has_joined', 'true')
          setHasJoined(true)
        } else if (joinedLocal || joinedCookie) {
          setHasJoined(true)
        } else {
          setHasJoined(false)
        }
      }

      checkStatus()

      const handleJoinedEvent = () => checkStatus()
      window.addEventListener('federation_joined', handleJoinedEvent)
      window.addEventListener('storage', handleJoinedEvent)
      return () => {
        window.removeEventListener('federation_joined', handleJoinedEvent)
        window.removeEventListener('storage', handleJoinedEvent)
      }
    }
  }, [session])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Robust hash navigation handling for cross-page and same-page clicks
  useEffect(() => {
    const scrollToHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1)
        const el = document.getElementById(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    const timer = setTimeout(scrollToHash, 150)
    return () => clearTimeout(timer)
  }, [pathname])

  // Preload key routes in background for instant sub-second page transitions
  useEffect(() => {
    const priorityRoutes = [
      '/championships',
      '/live',
      '/live/jumbotron',
      '/live/warmup',
      '/live/overlay',
      '/tools/attempt-strategy',
      '/tools/warmup-calculator',
      '/tools/weigh-in-planner',
      '/circulars',
      '/leaderboard',
      '/records',
      '/athletes',
      '/tools/strength-calculator',
      '/rules',
      '/anti-doping',
      '/equipment',
      '/services',
      '/facility',
      '/about',
      '/coaching',
    ]

    const adminRoutes =
      session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'
        ? [
            '/admin',
            '/admin/events',
            '/admin/flights',
            '/admin/athletes',
            '/admin/memberships',
            '/admin/live-scoring',
            '/admin/records-manager',
            '/admin/weigh-in',
            '/admin/cms',
            '/admin/stats',
            '/admin/about',
          ]
        : []

    const timer = setTimeout(() => {
      ;[...priorityRoutes, ...adminRoutes].forEach((r) => {
        try {
          router.prefetch(r)
        } catch {}
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [router, session])

  // Automatically close all dropdowns and mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setActiveDesktopDropdown(null)
    setActiveMobileDropdown(null)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setIsObsCapture(
        Boolean(
          pathname?.startsWith('/live/overlay') &&
          (params.get('obs') === '1' || params.get('embed') === '1')
        )
      )
    }
  }, [pathname])

  const handlePrefetch = (href: string) => {
    if (!href.startsWith('/#') && !href.startsWith('http')) {
      try {
        router.prefetch(href)
      } catch {}
    }
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '')
      if (pathname === '/') {
        e.preventDefault()
        const element = document.getElementById(targetId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
          window.history.pushState(null, '', `/#${targetId}`)
        }
      } else {
        e.preventDefault()
        router.push(href)
      }
      setIsMobileMenuOpen(false)
      setActiveDesktopDropdown(null)
      return
    }

    // Direct instant navigation without click cancellation
    // Delay menu close slightly to ensure synthetic click finishes propagating cleanly
    setTimeout(() => {
      setIsMobileMenuOpen(false)
      setActiveDesktopDropdown(null)
    }, 60)
  }

  // Only hide global navbar on explicit OBS capture embed requests (?obs=1)
  // Evaluated AFTER all hooks have executed, strictly following the Rules of Hooks
  if (isObsCapture) {
    return null
  }

  return (
    <header className="fixed top-0 z-50 w-full transition-all duration-300">
      
      {/* ── Top Coaching & Federation Prestige Strip ── */}
      <div className="w-full bg-[#140402] border-b border-white/5 py-1.5 px-3 sm:px-4 lg:px-4 xl:px-6 2xl:px-8 text-[11px] font-semibold text-gray-400 hidden lg:block">
        <div className="mx-auto flex max-w-[1536px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-gym-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>WPI ASSOCIATION OF GUJARAT</span>
            </span>
            <span className="text-white/20">|</span>
            <span className="text-gray-300">
              WORLD POWERLIFTING INDIA • GUJARAT STATE GOVERNING BODY
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/917043951377?text=Hi%20WPI%20Gujarat%20Team,%20I%20am%20interested%20in%20powerlifting%20and%20coaching%20programs!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <WhatsAppIcon variant="official" className="h-3.5 w-3.5" />
              <span>WHATSAPP: +91 7043951377</span>
            </a>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1 text-gray-400">
              <Globe className="h-3 w-3 text-gym-primary" />
              <span>ONLINE & 1-TO-1 COACHING</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Bar ── */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'border-b border-white/10 bg-gym-bg/90 py-3 shadow-2xl shadow-black/60 backdrop-blur-xl'
            : 'bg-gym-bg/60 backdrop-blur-md py-3.5'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between px-3 sm:px-4 xl:px-6 2xl:px-8">
          
          {/* Official WPI Association of Gujarat Logo */}
          <Link href="/" prefetch={true} className="group flex items-center gap-2 xl:gap-2.5 shrink-0">
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 xl:h-12 xl:w-12 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.4)] bg-black shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/wpi-logo-transparent.png"
                alt="WPI Association of Gujarat Official Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base sm:text-lg xl:text-xl font-bold uppercase tracking-wider text-white leading-none whitespace-nowrap">
                WPI <span className="text-gym-primary">GUJARAT</span>
              </span>
              <span className="hidden sm:block text-[8px] xl:text-[9px] font-bold uppercase tracking-[0.16em] xl:tracking-[0.22em] text-gray-400 whitespace-nowrap">
                Association of Gujarat • Powerlifting
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Rich Dropdowns */}
          <nav className="hidden items-center gap-1 xl:gap-2 2xl:gap-3 lg:flex shrink-0" suppressHydrationWarning>
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative py-2 group/menu"
                onMouseEnter={() => item.dropdown && setActiveDesktopDropdown(item.name)}
                onMouseLeave={() => setActiveDesktopDropdown(null)}
              >
                <Link
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => handlePrefetch(item.href)}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="flex items-center gap-0.5 xl:gap-1 text-[11px] xl:text-xs 2xl:text-[13px] font-bold uppercase tracking-wider text-gray-300 transition-colors duration-200 hover:text-white group-hover/menu:text-gym-primary whitespace-nowrap px-1.5 xl:px-2 py-1"
                >
                  <span>{item.name}</span>
                  {item.dropdown && (
                    <ChevronDown className="h-3 w-3 xl:h-3.5 xl:w-3.5 text-gray-400 transition-transform duration-200 group-hover/menu:rotate-180 group-hover/menu:text-gym-primary shrink-0" />
                  )}
                </Link>

                  {/* Dropdown Menu */}
                  {item.dropdown && (
                    <div
                      suppressHydrationWarning
                      className={`absolute top-full -left-4 w-72 rounded-2xl bg-[#140402]/98 backdrop-blur-2xl border border-gym-primary/30 p-2 shadow-2xl z-50 overflow-hidden transition-all duration-150 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-[''] ${
                        activeDesktopDropdown === item.name
                          ? 'opacity-100 pointer-events-auto translate-y-0 visible'
                          : 'opacity-0 pointer-events-none translate-y-1 invisible group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto group-hover/menu:translate-y-0 group-hover/menu:visible'
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gym-primary to-transparent opacity-80" />
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          prefetch={true}
                          onMouseEnter={() => handlePrefetch(sub.href)}
                          onClick={(e) => handleNavClick(e, sub.href)}
                          className="group/item flex flex-col p-3 rounded-xl transition-colors hover:bg-white/[0.08]"
                        >
                          <div className="text-xs font-bold uppercase tracking-wider text-white group-hover/item:text-gym-primary transition-colors">
                            {sub.name}
                          </div>
                          <div className="text-[11px] text-gray-400 font-medium leading-snug mt-0.5">
                            {sub.desc}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </nav>

          {/* Right Actions & Utilities (Live Arena + Auth Buttons) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 2xl:gap-3 shrink-0">
            {/* Live Match Day Arena Indicator Pill */}
            <Link
              href="/live"
              className="hidden 2xl:inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-gradient-to-r from-red-600/20 to-red-950/40 px-2.5 xl:px-3 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-[0_0_12px_rgba(239,68,68,0.25)] shrink-0"
              title="Watch Live Match Day Arena"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="tracking-widest">LIVE ARENA</span>
            </Link>

            {/* Auth Actions:
                1. If Logged in -> Dashboard + Sign Out (always fully visible)
                2. If Joined/Registered -> Primary Login button + Subtle Join
                3. If New Visitor -> Primary Join Federation button + Subtle Login
            */}
            {session?.user ? (
              <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
                <Link
                  href={session.user.role === "SUPER_ADMIN" ? "/super-admin" : session.user.role === "ADMIN" ? "/admin" : session.user.role === "REFEREE" ? "/referee/dashboard" : "/dashboard"}
                  prefetch={true}
                  className="group relative flex items-center justify-center rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-3 xl:px-4 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(230,80,27,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(230,80,27,0.6)] whitespace-nowrap shrink-0"
                >
                  Dashboard
                </Link>
                <LogoutButton />
              </div>
            ) : mounted && hasJoined ? (
              <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
                <Link
                  href="/login"
                  prefetch={true}
                  className="group relative flex items-center justify-center rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-4 xl:px-5 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(230,80,27,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(230,80,27,0.6)] whitespace-nowrap shrink-0"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  className="text-[11px] xl:text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors whitespace-nowrap px-1 py-1"
                >
                  Join
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
                <Link
                  href="/login"
                  prefetch={true}
                  className="text-[11px] xl:text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors whitespace-nowrap px-1 py-1"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  className="group relative flex items-center justify-center rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-3.5 xl:px-4 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(230,80,27,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(230,80,27,0.6)] whitespace-nowrap shrink-0"
                >
                  Join Federation
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            className="text-white transition-colors hover:text-gym-primary lg:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </motion.div>

      {/* ── Mobile Menu Dropdown ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full overflow-y-auto max-h-[85vh] border-b-2 border-gym-primary bg-[#140402]/98 backdrop-blur-2xl px-6 py-6 lg:hidden shadow-2xl flex flex-col gap-4"
          >
            {/* Live Arena Mobile Feature Banner */}
            <Link
              href="/live"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl border border-red-500/40 bg-gradient-to-r from-red-600/20 via-black to-red-950/40 p-3 text-white shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <span className="font-heading text-sm font-bold uppercase tracking-wider text-red-400">
                  Live Match Day Arena
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500 text-white animate-pulse">
                STREAM LIVE
              </span>
            </Link>
            <div className="flex flex-col divide-y divide-white/10">
              {navItems.map((item) => (
                <div key={item.name} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      prefetch={true}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="font-heading text-lg font-bold uppercase tracking-wider text-white hover:text-gym-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                    {item.dropdown && (
                      <button
                        type="button"
                        aria-label={`Toggle ${item.name} menu`}
                        onClick={() =>
                          setActiveMobileDropdown(activeMobileDropdown === item.name ? null : item.name)
                        }
                        className="p-2 text-gray-400 hover:text-gym-primary"
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-200 ${
                            activeMobileDropdown === item.name ? 'rotate-180 text-gym-primary' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {item.dropdown && activeMobileDropdown === item.name && (
                    <div className="mt-2 flex flex-col gap-2 pl-4 border-l-2 border-gym-primary/40">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          prefetch={true}
                          onClick={(e) => handleNavClick(e, sub.href)}
                          className="text-sm text-gray-300 hover:text-gym-primary py-1.5 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Auth Actions */}
            {session?.user ? (
              <div className="flex flex-col items-center gap-3 w-full mt-4">
                <Link
                  href={session.user.role === "SUPER_ADMIN" ? "/super-admin" : session.user.role === "ADMIN" ? "/admin" : session.user.role === "REFEREE" ? "/referee/dashboard" : "/dashboard"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-6 py-3 font-heading text-base font-bold uppercase tracking-widest text-white shadow-lg"
                >
                  Dashboard
                </Link>
                <div className="mt-1 flex justify-center w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <LogoutButton variant="mobile" />
                </div>
              </div>
            ) : mounted && hasJoined ? (
              <div className="flex flex-col items-center gap-3 w-full mt-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-6 py-3 font-heading text-base font-bold uppercase tracking-widest text-white shadow-lg"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center font-heading text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors py-2"
                >
                  Register New Account
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full mt-4">
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-6 py-3 font-heading text-base font-bold uppercase tracking-widest text-white shadow-lg"
                >
                  Join Federation
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center font-heading text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors py-2"
                >
                  Already a Member? Login
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
