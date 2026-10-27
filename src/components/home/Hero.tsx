"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Trophy,
  Radio,
  Calendar,
  Medal,
  ShieldCheck,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
  Zap,
} from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
    tagline: "WPI Association of Gujarat • World Powerlifting India",
    headlinePart1: "Unleash Your",
    headlineHighlight: "Inner Beast.",
    subtext: "Official Gujarat state powerlifting governing body under World Powerlifting India. Build raw strength, dominate the platform, and compete under ratified championship rules.",
    bgText: "GUJARAT",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    tagline: "Championship Standards • WPI Affiliated",
    headlinePart1: "Forged in",
    headlineHighlight: "Iron.",
    subtext: "Compete against Gujarat's finest athletes, officiated by certified technical referees on platforms built for historic records.",
    bgText: "POWER",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop",
    tagline: "Break Boundaries • State & National Glory",
    headlinePart1: "Defy Your",
    headlineHighlight: "Limits.",
    subtext: "Join Gujarat's premier community of registered powerlifters and coaches pushing the absolute benchmarks of strength.",
    bgText: "WPI",
  }
];

interface HeroProps {
  session?: any;
}

export default function Hero({ session }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-gym-black pt-32 sm:pt-36 lg:pt-40 pb-16">
      
      {/* Background Images with Crossfade */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slides[currentSlide].image}
              alt="Powerlifting gym"
              fill
              priority
              className="h-full w-full object-cover object-[center_30%] grayscale opacity-50"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-gym-bg via-gym-bg/75 to-gym-bg/40" />
        <div className="absolute inset-0 z-10 bg-gym-bg/30 backdrop-blur-[2px]" />
      </div>

      {/* Animated Glowing Orbs for Luxurious Empty Space Fill */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none hidden md:block">
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[5%] h-[500px] w-[500px] rounded-full bg-gym-accent/20 blur-[130px]"
        />
        <motion.div
          animate={{
            y: [0, 50, 0],
            x: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[10%] right-[20%] h-[600px] w-[600px] rounded-full bg-orange-600/15 blur-[160px]"
        />
      </div>

      {/* Background Giant Text */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 select-none overflow-hidden mix-blend-overlay">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 0.08, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="whitespace-nowrap font-heading text-[22vw] font-black leading-none text-transparent block"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,0.12)" }}
          >
            {slides[currentSlide].bgText}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12">
        {/* WPI Association of Gujarat Circular Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 flex flex-col items-center"
        >
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.55)] bg-black shrink-0 transition-transform hover:scale-105 duration-300 ring-4 ring-amber-500/20">
            <Image
              src="/images/wpi-logo-transparent.png"
              alt="WPI Association of Gujarat Official Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Tagline */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={`tagline-${currentSlide}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 flex items-center gap-4 sm:gap-6"
          >
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-gym-accent opacity-70" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-gym-accent drop-shadow-md bg-gym-accent/10 px-4 py-1.5 rounded-full border border-gym-accent/25">
              {slides[currentSlide].tagline}
            </span>
            <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-gym-accent opacity-70" />
          </motion.div>
        </AnimatePresence>

        {/* Main Headline */}
        <AnimatePresence mode="wait">
          <motion.h1 
            key={`headline-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="mb-6 font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[1.05] tracking-tight text-white drop-shadow-2xl"
          >
            {slides[currentSlide].headlinePart1} <br />
            <span className="bg-metallic bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(230,80,27,0.5)] animate-glow inline-block">
              {slides[currentSlide].headlineHighlight}
            </span>
          </motion.h1>
        </AnimatePresence>

        {/* Subtext */}
        <AnimatePresence mode="wait">
          <motion.p 
            key={`subtext-${currentSlide}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="mb-8 max-w-2xl text-base sm:text-lg md:text-xl font-normal leading-relaxed text-gray-300 drop-shadow-sm mx-auto min-h-[56px]"
          >
            {slides[currentSlide].subtext}
          </motion.p>
        </AnimatePresence>

        {/* Primary Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5 mb-8"
        >
          {session?.user ? (
            <Link
              href={session.user.role === "SUPER_ADMIN" ? "/super-admin" : session.user.role === "ADMIN" ? "/admin" : session.user.role === "REFEREE" ? "/referee/dashboard" : "/dashboard"}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-9 py-4 text-sm sm:text-base font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(230,80,27,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(230,80,27,0.8)] active:scale-95"
            >
              <span>Go To Dashboard</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-9 py-4 text-sm sm:text-base font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(230,80,27,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(230,80,27,0.8)] active:scale-95"
            >
              <Trophy className="h-4 w-4" />
              <span>Register As Athlete</span>
            </Link>
          )}

          <Link
            href="/championships"
            className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-9 py-4 text-sm sm:text-base font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 active:scale-95"
          >
            <Calendar className="h-4 w-4 text-gym-primary" />
            <span>Championship Schedule</span>
          </Link>
        </motion.div>

        {/* Quick Hub Navigation Pills Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
          className="w-full max-w-4xl rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl shadow-2xl mb-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Link
              href="/live"
              className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-red-950/40 border border-transparent hover:border-red-500/40 p-2.5 transition-all text-gray-300 hover:text-white group"
            >
              <Radio className="h-4 w-4 text-red-500 animate-pulse" />
              <span className="font-bold uppercase tracking-wider">Live Arena</span>
            </Link>

            <Link
              href="/athletes"
              className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-transparent hover:border-gym-primary/40 p-2.5 transition-all text-gray-300 hover:text-white group"
            >
              <Medal className="h-4 w-4 text-gym-primary" />
              <span className="font-bold uppercase tracking-wider">State Rankings</span>
            </Link>

            <Link
              href="/records"
              className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-transparent hover:border-amber-500/40 p-2.5 transition-all text-gray-300 hover:text-white group"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="font-bold uppercase tracking-wider">State Records</span>
            </Link>

            <Link
              href="/referee/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-transparent hover:border-emerald-500/40 p-2.5 transition-all text-gray-300 hover:text-white group"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-bold uppercase tracking-wider">Referee Center</span>
            </Link>
          </div>
        </motion.div>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center gap-3 z-30">
          <div className="flex items-center gap-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-4 py-2 shadow-2xl">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Switch to slide ${index + 1}`}
                className={`transition-all duration-500 rounded-full cursor-pointer ${
                  currentSlide === index
                    ? "w-8 h-2 bg-gradient-to-r from-gym-primary to-gym-red shadow-[0_0_12px_rgba(230,80,27,0.9)]"
                    : "w-2 h-2 bg-white/30 hover:bg-white/70 hover:scale-125"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hidden sm:inline-block font-mono">
            0{currentSlide + 1} / 0{slides.length}
          </span>
        </div>
      </div>

      <div className="absolute right-12 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex">
        <div className="h-24 w-px bg-gym-surface" />
        <span className="my-10 rotate-90 text-xs uppercase tracking-[0.3em] text-gym-muted font-mono font-bold">EST. 2026</span>
        <div className="h-24 w-px bg-gym-surface" />
      </div>
    </section>
  );
}
