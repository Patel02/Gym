'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { name: 'Philosophy', href: '#philosophy' },
  { name: 'Athletes', href: '/athletes' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Facility', href: '/facility' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'border-b border-gym-white/10 bg-gym-black/95 py-4 shadow-lg shadow-gym-orange/5 backdrop-blur-md'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
        <Link href="/" className="group flex items-center gap-1">
          <span className="font-heading text-3xl font-black uppercase tracking-widest text-gym-white">
            FEDERATION<span className="text-gym-orange transition-colors duration-300 group-hover:text-gym-white">.</span>
          </span>
          </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group relative text-sm font-bold uppercase tracking-[0.15em] text-gym-white transition-colors duration-300 hover:text-gym-orange"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-gym-orange transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <Link
          href="/register"
          className="group relative hidden md:block"
        >
          <span className="absolute inset-0 -skew-x-[15deg] border-2 border-gym-orange transition-colors duration-300 group-hover:bg-gym-orange" />
          <span className="relative z-10 block -skew-x-[15deg] px-6 py-2 text-sm font-bold uppercase tracking-widest text-gym-white transition-colors duration-300 group-hover:text-gym-black">
            <span className="block skew-x-[15deg]">Join Now</span>
          </span>
        </Link>

        <button
          type="button"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          className="text-gym-white transition-colors hover:text-gym-orange md:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-0 top-full flex w-full flex-col items-center gap-6 overflow-hidden border-b-2 border-gym-orange bg-gym-darkgray py-8 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-heading text-xl font-bold uppercase tracking-widest text-gym-white hover:text-gym-orange"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 skew-x-[-15deg] bg-gym-orange px-10 py-3 font-bold uppercase tracking-widest text-gym-white"
            >
              <span className="block skew-x-[15deg]">Join Now</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
