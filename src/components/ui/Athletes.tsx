"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const athletes = [
  {
    id: 1,
    name: "Marcus Ruhl",
    category: "120+ KG",
    total: "1050 KG",
    img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Sarah Connor",
    category: "63 KG",
    total: "480 KG",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "David Chen",
    category: "83 KG",
    total: "740 KG",
    img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Elena Volkov",
    category: "76 KG",
    total: "550 KG",
    img: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=2071&auto=format&fit=crop",
  },
];

export default function Athletes() {
  return (
    <section id="athletes" className="relative z-10 w-full border-b border-white/5 bg-gym-black py-20 md:py-28 lg:py-36">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-24">

        {/* Section header */}
        <div className="mb-16 flex w-full flex-col items-center text-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-0.5 w-12 bg-gym-primary" />
              <span className="text-sm font-bold uppercase tracking-[0.3em] text-gym-primary">The Roster</span>
              <span className="h-0.5 w-12 bg-gym-primary" />
            </div>
            <h2 className="mb-4 font-heading text-5xl font-bold uppercase leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
              Elite <span className="text-gym-primary">Athletes</span>
            </h2>
            <p className="max-w-xl text-base text-gray-400 md:text-lg">
              These are the champions of Federation. Train here. Compete here. Become one of them.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/#athletes"
              className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition-colors hover:text-gym-primary"
            >
              <span>View Full Roster</span>
              <ArrowRight className="h-4 w-4 text-gym-primary transition-transform group-hover:translate-x-1.5" />
            </Link>
          </motion.div>
        </div>

        {/* Athlete Cards */}
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {athletes.map((athlete, index) => (
            <motion.div
              key={athlete.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative cursor-pointer overflow-hidden border border-white/10 bg-[#0a0a0a]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={athlete.img}
                  alt={athlete.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-gym-black via-gym-black/40 to-transparent opacity-90 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-6">
                <div className="mb-4 h-1 w-10 skew-x-[-15deg] bg-gym-primary transition-all duration-300 group-hover:w-16" />
                <span className="mb-1 text-xs font-bold tracking-[0.2em] text-gym-primary">
                  {athlete.category}
                </span>
                <h3 className="mb-4 font-heading text-2xl font-bold uppercase tracking-wider text-white">
                  {athlete.name}
                </h3>

                <div className="overflow-hidden">
                  <div className="mb-3 h-px w-full -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0" />
                  <div className="flex items-center justify-between opacity-0 transition-opacity delay-100 duration-500 group-hover:opacity-100">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total</span>
                    <span className="text-xl font-bold text-gym-primary">{athlete.total}</span>
                  </div>
                </div>
              </div>

              {/* Hover CTA */}
              <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-center gap-1 rounded-full bg-gym-primary/90 px-3 py-1.5">
                  <Star className="h-3 w-3 text-white" fill="white" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white">Elite</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-lg font-bold text-white">
            Ready to join the roster? <span className="text-gym-primary">Your spot is waiting.</span>
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 rounded-full bg-gym-primary px-10 py-4 text-base font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(230,80,27,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(230,80,27,0.6)]"
          >
            Start Your Journey
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}