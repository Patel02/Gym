"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  Dumbbell, 
  Sparkles, 
  ArrowRight,
  HelpCircle,
  Award,
  Layers,
  CheckSquare,
  Square
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { PageNavigation } from "@/components/ui/PageNavigation";

const WHATSAPP_PHONE = "917043951377";

interface GearSpec {
  name: string;
  category: string;
  maxSpec: string;
  material: string;
  mandatoryRules: string[];
  approvedBrands: string[];
}

const GEAR_SPECS: GearSpec[] = [
  {
    name: "Lifting Belt",
    category: "Torso Stability",
    maxSpec: "Max Width: 10 cm (4\") • Max Thickness: 13 mm",
    material: "Leather, vinyl, or non-stretch material. No padding on inside.",
    mandatoryRules: [
      "Fastened by single prong, double prong, or approved quick-release lever.",
      "The tongue may not exceed 10 cm beyond the buckle.",
      "No velcro fastening permitted on the competition platform.",
    ],
    approvedBrands: ["SBD", "Inzer", "A7", "Titan", "Pioneer (IPF Approved Lines)"],
  },
  {
    name: "Knee Sleeves (Classic / Raw)",
    category: "Knee Joint Support",
    maxSpec: "Max Thickness: 7 mm • Max Length: 30 cm",
    material: "Single-ply non-supportive neoprene with fabric outer/inner lamination.",
    mandatoryRules: [
      "Must be pulled on without assisting straps, plastic bags, or coaching help on the platform.",
      "Must not touch the singlet leg or deadlift socks during the attempt.",
      "Criss-crossing of fabric or internal supportive ribs strictly banned.",
    ],
    approvedBrands: ["SBD", "A7 Cone Sleeves", "Inzer ErgoPro", "Titan", "Iron Bull (IPF Line)"],
  },
  {
    name: "Wrist Wraps",
    category: "Wrist Stabilization",
    maxSpec: "Max Length: 1.0 Meter • Max Width: 8 cm",
    material: "One-piece elastic woven polyester/cotton blend.",
    mandatoryRules: [
      "Thumb loop MUST be removed from thumb prior to starting the lift attempt.",
      "Wrap must not extend more than 2 cm below or 10 cm above the wrist joint.",
      "No sweatbands or watches underneath or alongside the wrap.",
    ],
    approvedBrands: ["SBD", "Titan Titanium", "Inzer Gripper", "A7", "Eleiko"],
  },
  {
    name: "Competition Singlet & Shirt",
    category: "Apparel & Uniform",
    maxSpec: "One-Piece Lifting Suit • Non-Supportive",
    material: "Single-ply stretch fabric (Spandex/Lycra/Polyester).",
    mandatoryRules: [
      "Legs must extend at least 3 cm down the thigh and no lower than midway down the thigh.",
      "Cotton crew-neck T-shirt is MANDATORY for Squat and Bench Press (optional for Men's Deadlift).",
      "No supportive powerlifting canvas or multi-ply suits permitted in Classic/Raw division.",
    ],
    approvedBrands: ["SBD", "A7", "Titan", "Virus", "Strength Shop"],
  },
  {
    name: "Deadlift Shin Socks & Footwear",
    category: "Hygiene & Platform Traction",
    maxSpec: "Shin-Length Deadlift Socks • Max Sole: 5 cm",
    material: "Heavy woven cotton/nylon for socks; firm non-compressible sole for shoes.",
    mandatoryRules: [
      "Deadlift socks MUST completely cover the shins up to just below the knee cap (prevents shin cuts/blood on bar).",
      "Socks must not touch the knee sleeve.",
      "Shoes must not have protruding cleats or irregular spikes.",
    ],
    approvedBrands: ["SBD Deadlift Socks", "Notorious Lift Slippers", "Saboton", "Nike Romaleos"],
  },
  {
    name: "Calibrated Barbells & Steel Plates",
    category: "Platform Equipment",
    maxSpec: "20kg Barbell (29mm) • Calibrated to ±10 Grams",
    material: "Hard-chrome alloy steel with IPF aggressive center/outer knurling.",
    mandatoryRules: [
      "Barbell outer diameter: 29mm (Men's) / 28mm (Women's 15kg where applicable).",
      "Calibrated steel/cast-iron discs with 450mm outer diameter for 25kg & 20kg plates.",
      "Competition collars: 2.5 kg each with dual-lock clamping system.",
    ],
    approvedBrands: ["Eleiko IPF Competition Set", "Rogue Calibrated Steel", "Leoko", "Uesaka"],
  },
];

export default function EquipmentPage() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    belt: false,
    sleeves: false,
    wraps: false,
    singlet: false,
    socks: false,
    tshirt: false,
  });

  const toggleItem = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const isReady = completedCount === 6;

  return (
    <div className="min-h-screen bg-gym-black text-white pt-32 sm:pt-36 lg:pt-40 pb-20 relative overflow-hidden">
      
      {/* ── Ambient Background Glows ── */}
      <motion.div 
        animate={{ y: [0, -25, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" 
      />
      <motion.div 
        animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" 
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        
        {/* ── Breadcrumb & Navigation ── */}
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "IPF Rules", href: "/rules" },
            { label: "Approved Equipment" },
          ]}
          badge="IPF Legal Catalog"
          className="mb-8"
        />

        {/* ── Hero ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-[0_0_20px_rgba(230,80,27,0.2)]"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>IPF Technical Committee Standards</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-xl"
          >
            Approved Competition <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.5)]">
              Equipment & Gear
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal"
          >
            Ensure your competition apparel, belts, knee sleeves, and wraps comply strictly with IPF platform technical specifications. Avoid disqualification during official equipment check-in.
          </motion.p>
        </div>

        {/* ── Interactive Platform-Ready Gear Checklist ── */}
        <div className="rounded-3xl border border-white/15 bg-[#120402]/90 p-6 sm:p-8 backdrop-blur-xl mb-14 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gym-primary">Athlete Self-Audit Tool</div>
              <h3 className="font-heading text-2xl font-bold uppercase text-white">
                Platform-Ready Gear Inspection Checklist
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                isReady
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-gym-primary/20 text-gym-primary border-gym-primary/40"
              }`}>
                {completedCount} / 6 Verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: "belt", label: "IPF Legal Belt (Max 10cm / 13mm, no velcro)" },
              { key: "sleeves", label: "7mm Neoprene Knee Sleeves (Max 30cm length)" },
              { key: "wraps", label: "Wrist Wraps (Max 1m, thumb loop removed)" },
              { key: "singlet", label: "Single-Ply Lifting Singlet (Mid-thigh cut)" },
              { key: "socks", label: "Deadlift Shin Socks (Full shin coverage)" },
              { key: "tshirt", label: "Cotton Crew-Neck Shirt (No collar, no zip)" },
            ].map(item => {
              const checked = checklist[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleItem(item.key)}
                  className={`flex items-center gap-3 rounded-2xl p-4 text-left border transition-all cursor-pointer ${
                    checked
                      ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
                  }`}
                >
                  {checked ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-500 shrink-0" />
                  )}
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>

          {isReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>All 6 Critical Items Cleared! Your equipment is 100% compliant for national check-in.</span>
            </motion.div>
          )}
        </div>

        {/* ── Equipment Specifications Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {GEAR_SPECS.map((gear, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl hover:border-gym-primary/50 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-gym-primary mb-1">
                  {gear.category}
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-white mb-2">
                  {gear.name}
                </h3>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-bold text-white mb-4">
                  {gear.maxSpec}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Rules & Infractions:</div>
                  {gear.mandatoryRules.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-gym-primary mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Approved Brand Examples:</div>
                <div className="flex flex-wrap gap-1.5">
                  {gear.approvedBrands.map((b, i) => (
                    <span key={i} className="text-[11px] font-medium text-gray-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Official Pro-Shop Banner ── */}
        <div className="rounded-3xl border border-white/15 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary">
              <span>🛍️ OFFICIAL FEDERATION PRO-SHOP</span>
            </div>
            <h3 className="font-heading text-2xl font-bold uppercase text-white">
              Get 100% IPF Approved Competition Gear
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Equip yourself with official Team India singlets, 13mm quick-release lever belts, 7mm conical knee sleeves, and meet day rapid refeed bundles.
            </p>
          </div>

          <Link
            href="/shop"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 transition-all shadow-lg shadow-orange-950 cursor-pointer"
          >
            <span>Explore Official Pro-Shop</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Bottom Coach Consultation CTA ── */}
        <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1b0603] to-[#0c0201] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Equipment Consultation</div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Unsure If Your Gear Passes Meet Check-In?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Send photos or brand links of your belt, sleeves, or singlet to Coaches Akash & Tanvi on WhatsApp to verify IPF approval before purchasing or traveling to a meet.
            </p>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coaches Akash & Tanvi, I want to verify if my lifting gear is approved for upcoming IPF powerlifting competitions.")}`}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-7 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-105 transition-all cursor-pointer shrink-0"
          >
            <WhatsAppIcon variant="badge" className="h-6 w-6" />
            <span>Verify Gear via WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
}
