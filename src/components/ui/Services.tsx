"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MoveRight, Pause, Play } from "lucide-react";

const services = [
  {
    id: 1,
    number: "01",
    title: "National Coaching",
    category: "1-on-1 IPF Platform Prep",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    number: "02",
    title: "State & Squad Camps",
    category: "High Performance Squads",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    number: "03",
    title: "Sports Science Lab",
    category: "Cryo, Physio & Rehab",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop",
  },
  {
    id: 4,
    number: "04",
    title: "Competition Gear",
    category: "Calibrated Eleiko Platforms",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 5,
    number: "05",
    title: "Anti-Doping & Medical",
    category: "WADA Compliance & Biomechanics",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop",
  }
];

// Repeat dataset 4 times to ensure an unbroken, seamless infinite ribbon on all resolutions
const carouselItems = [...services, ...services, ...services, ...services];

export default function Services() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="services" className="relative w-full bg-gym-black py-12 md:py-16 lg:py-20 overflow-hidden border-b border-white/5">
      <div id="facility" className="absolute -top-24 pointer-events-none" />

      {/* ── Section Header ── */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pb-8 md:pb-10 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          {/* Left: Dominant Heading */}
          <div className="flex flex-col lg:max-w-2xl">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-3.5 w-fit">
              <span className="h-2 w-2 rounded-full bg-gym-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
                Disciplines & Athlete Development
              </span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black uppercase leading-[0.96] tracking-tight text-white drop-shadow-xl">
              Cultivating National <br />
              <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">
                Excellence.
              </span>
            </h2>
          </div>

          {/* Right: Sleek Glass Info & Carousel Control Box */}
          <div className="relative lg:max-w-md w-full">
            <div className="absolute inset-0 -z-10 bg-gym-primary/10 blur-[50px] rounded-full" />
            <div className="glass-panel border border-gym-primary/30 bg-[#110402]/85 p-5 md:p-6 rounded-2xl shadow-2xl backdrop-blur-xl">
              <p className="text-sm md:text-base font-normal leading-relaxed text-gray-300">
                Engineered to cultivate national and international champions. From certified IPF platform coaching to calibrated competition platforms and NADA/WADA drug-tested standards.
              </p>
              
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-gym-primary opacity-75 ${isPaused ? '' : 'animate-ping'}`} />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gym-primary" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300">
                    {isPaused ? "Paused" : "Auto-Scrolling • Infinite Loop"}
                  </span>
                </div>

                {/* Pause / Play Toggle Button */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-gym-primary/20 hover:border-gym-primary/50 transition-all cursor-pointer"
                  title={isPaused ? "Resume Auto-Scroll" : "Pause Auto-Scroll"}
                >
                  {isPaused ? (
                    <>
                      <Play className="h-3 w-3 text-gym-primary fill-gym-primary" />
                      <span>Play</span>
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3 text-gym-primary fill-gym-primary" />
                      <span>Pause</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Auto-Scrolling Infinite Loop Carousel Track ── */}
      <div 
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left & Right Edge Vignette Gradient Masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 md:w-40 bg-gradient-to-r from-gym-black via-gym-black/80 to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 md:w-40 bg-gradient-to-l from-gym-black via-gym-black/80 to-transparent z-20" />

        {/* Continuous Smooth Infinite Marquee Ribbon */}
        <div
          className="animate-infinite-marquee flex gap-5 md:gap-7 py-4"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {carouselItems.map((service, index) => (
            <div
              key={`${service.id}-${index}`}
              className="group relative h-[320px] w-[260px] sm:h-[360px] sm:w-[300px] md:h-[400px] md:w-[330px] lg:h-[420px] lg:w-[350px] shrink-0 overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-gym-surface shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] hover:border-gym-primary/60 hover:shadow-[0_20px_50px_rgba(230,80,27,0.35)] cursor-pointer"
            >
              {/* Background Image */}
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

              {/* Top Number Pill */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-2 rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/15">
                <span className="font-heading text-lg font-bold text-gym-primary">
                  {service.number}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                  {service.category}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wider text-white transition-transform duration-500 group-hover:translate-x-1">
                      {service.title}
                    </h3>
                  </div>

                  {/* Arrow Button */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-500 group-hover:bg-gym-primary group-hover:border-transparent group-hover:scale-110">
                    <MoveRight className="h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-45" />
                  </div>
                </div>
              </div>

              {/* Top orange glow line on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gym-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
