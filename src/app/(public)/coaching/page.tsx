import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { 
  Activity, 
  Apple, 
  ArrowRight, 
  Award, 
  Check, 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  Flame, 
  HeartHandshake, 
  HeartPulse, 
  MessageCircle, 
  Phone, 
  Pill, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Trophy, 
  UserCheck, 
  Zap 
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import CoachingPlans, { coachingPlans, specializedPrograms, transformationSteps } from "@/components/home/CoachingPlans";
import CoachingCardsCarousel from "@/components/coaching/CoachingCardsCarousel";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Online Coaching Plans & Pricing | A&T Fitness & Nutrition",
  description: "Explore all online coaching plans, starting from ₹699/month. Personalized workout & diet plans, powerlifting, bodybuilding, fat loss, muscle gain, and PCOS/Thyroid clinical nutrition support by Coaches Akash & Tanvi.",
};

const WHATSAPP_PHONE = "917043951377";

const coachingGoals = [
  { id: 1, title: "Fat Loss / Weight Loss", category: "Transformation", startPrice: "₹699/mo", range: "₹699 – ₹1,499", desc: "Deficit macro planning, cardio strategy, measurement tracking, lifestyle habits." },
  { id: 2, title: "Weight Gain / Muscle Gain", category: "Hypertrophy", startPrice: "₹699/mo", range: "₹699 – ₹1,499", desc: "Clean calorie surplus, protein structuring, progressive overload, digestive support." },
  { id: 3, title: "Bodybuilding Coaching", category: "Physique", startPrice: "₹999/mo", range: "₹999 – ₹2,999", desc: "Hypertrophy splits, muscle sculpting, body recomposition, contest preparation." },
  { id: 4, title: "Powerlifting Coaching", category: "Strength", startPrice: "₹999/mo", range: "₹999 – ₹2,999", desc: "Squat, bench & deadlift programming, peak cycles, weight-class strategy." },
  { id: 5, title: "Strength & Conditioning", category: "Performance", startPrice: "₹999/mo", range: "₹999 – ₹1,999", desc: "Athletic explosiveness, work capacity, core stability and injury resilience." },
  { id: 6, title: "Personalized Diet & Workout", category: "General", startPrice: "₹699/mo", range: "₹699 – ₹1,499", desc: "Tailored daily nutrition macros and progressive gym or home training plans." },
  { id: 7, title: "Exercise Form Correction", category: "Technique", startPrice: "₹999/mo", range: "Included in Basic+", desc: "Video lift breakdown, cue adjustments, biomechanical efficiency." },
  { id: 8, title: "Supplement Guidance", category: "Nutrition", startPrice: "Included", range: "Included in Plans", desc: "Evidence-backed supplement dosage, timing, safety & budget optimization." },
  { id: 9, title: "Weekly Progress Tracking", category: "Accountability", startPrice: "Included", range: "Included in Plans", desc: "Weekly weight logs, progress pictures, measurement audits, and program tweaks." },
  { id: 10, title: "Diabetes Fitness & Nutrition", category: "Clinical Support", startPrice: "₹999/mo", range: "₹999 – ₹1,999", desc: "Low-glycemic nutritional strategies, insulin sensitivity conditioning (alongside doctor's advice)." },
  { id: 11, title: "Thyroid Support Program", category: "Clinical Support", startPrice: "₹999/mo", range: "₹999 – ₹1,999", desc: "Metabolic rate optimization, balanced micronutrients, energy balance & stamina." },
  { id: 12, title: "PCOD / PCOS Support", category: "Clinical Support", startPrice: "₹999/mo", range: "₹999 – ₹1,999", desc: "Hormone-supportive anti-inflammatory diet strategies, resistance training, cycle awareness." },
  { id: 13, title: "Posture & Mobility Guidance", category: "Wellness", startPrice: "₹699/mo", range: "₹699 – ₹1,499", desc: "Joint mobility, postural correction, desk-worker stiffness relief." },
  { id: 14, title: "1-to-1 Online Personal Coaching", category: "VIP High-Touch", startPrice: "₹1,999/mo", range: "₹1,999/mo", desc: "Daily monitoring, video check-ins, direct coach call access, priority support." },
];

import { PageNavigation } from "@/components/ui/PageNavigation";

export default function CoachingDirectoryPage() {
  return (
    <div className="min-h-screen bg-gym-black text-white pt-32 sm:pt-36 lg:pt-40 pb-20">
      
      {/* ── Top Hero ── */}
      <section className="relative overflow-hidden px-6 py-12 md:py-16 text-center border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gym-primary/15 via-transparent to-transparent pointer-events-none" />

        <div className="mx-auto max-w-4xl relative z-10 flex flex-col items-center">
          <div className="w-full flex justify-start mb-6">
            <PageNavigation href="/" label="Back to Home" badge="Coaching Academy" />
          </div>
          
          {/* Logo Badge */}
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-gym-primary shadow-[0_0_30px_rgba(230,80,27,0.5)] mb-6 bg-black">
            <Image
              src="/images/at-logo.png"
              alt="A&T Fitness & Nutrition Logo"
              fill
              sizes="(max-width: 640px) 80px, 96px"
              className="object-cover"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gym-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official Coaching Catalog & Enrollment</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.05]">
            Online Coaching <br />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">
              Plans & Pricing
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base sm:text-lg text-gray-300 leading-relaxed font-normal">
            "YOUR GOAL. OUR GUIDANCE. YOUR TRANSFORMATION." — Coached directly by certified specialists <strong className="text-white">Akash & Tanvi</strong>.
          </p>

          {/* Coach Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5 text-gym-primary" />
              Certified Fitness Trainer
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Apple className="h-3.5 w-3.5 text-emerald-400" />
              Certified Nutrition Specialist
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5 text-amber-400" />
              Certified Supplement Specialist
            </span>
          </div>

          {/* Direct CTA */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Akash & Tanvi, I want to consult and start online coaching with A&T Fitness & Nutrition.")}`}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(37,211,102,0.7)] hover:brightness-105 transition-all cursor-pointer overflow-hidden border border-emerald-400/40"
            >
              <WhatsAppIcon variant="badge" className="h-6 w-6" />
              <span>Direct WhatsApp: +91 7043951377</span>
            </a>
            <Link
              href="/coaching/plans"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gym-primary transition-all"
            >
              <span>Explore 4 Monthly Plans</span>
              <ArrowRight className="h-4 w-4 text-gym-primary" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── DEDICATED SEPARATE PROGRAM PAGES SHOWCASE ── */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 py-14">
        <div className="text-center mb-10">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-gym-primary mb-2">
            Separate Dedicated Programs
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white">
            Explore Dedicated Coaching Portals
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto">
            Each specialized category has its own comprehensive page with in-depth curriculum, methodology, deliverables, and FAQs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: 4 Monthly Plans */}
          <Link
            href="/coaching/plans"
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] via-[#110301] to-[#080100] p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-gym-primary/60 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(230,80,27,0.3)]"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="rounded-full border border-gym-primary/40 bg-gym-primary/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gym-primary">
                  Monthly Membership
                </span>
                <span className="font-heading text-lg font-bold text-white">₹699 – ₹1,999/mo</span>
              </div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gym-primary/15 border border-gym-primary/30 text-gym-primary group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold uppercase text-white group-hover:text-gym-primary transition-colors">
                  4 Monthly Plans
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-5">
                Starter (₹699), Basic (₹999), Transformation (₹1,499), and Premium 1-to-1 (₹1,999) with full comparison.
              </p>
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4 text-xs text-gray-300 mb-6">
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-gym-primary" /> Tailored Workout & Diet Plans</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-gym-primary" /> Weekly Progress Tracking</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-gym-primary" /> Direct WhatsApp Support</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-bold text-gym-primary group-hover:text-white transition-colors">
              <span>View Dedicated Plans Page</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: Powerlifting Coaching */}
          <Link
            href="/coaching/powerlifting"
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] via-[#110301] to-[#080100] p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-red-500/60 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(239,68,68,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="rounded-full border border-red-500/40 bg-red-500/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
                  Strength & Platform
                </span>
                <span className="font-heading text-lg font-bold text-white">₹999 – ₹2,999/mo</span>
              </div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 group-hover:scale-110 transition-transform">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold uppercase text-white group-hover:text-red-400 transition-colors">
                  Powerlifting Prep
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-5">
                Squat, Bench Press & Deadlift periodization, meet-day peaking, and referee commands under IPF rules.
              </p>
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4 text-xs text-gray-300 mb-6">
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-red-400" /> SBD Video Lift Analysis</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-red-400" /> Peaking Cycles & Tapering</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-red-400" /> Weight-Class Cut Strategy</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-bold text-red-400 group-hover:text-white transition-colors">
              <span>View Powerlifting Page</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Bodybuilding Coaching */}
          <Link
            href="/coaching/bodybuilding"
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] via-[#110301] to-[#080100] p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-500/60 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(245,158,11,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                  Aesthetics & Sculpting
                </span>
                <span className="font-heading text-lg font-bold text-white">₹999 – ₹2,999/mo</span>
              </div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold uppercase text-white group-hover:text-amber-400 transition-colors">
                  Physique & Bodybuilding
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-5">
                Scientific muscle hypertrophy splits, progressive tension overload, and aesthetic symmetry sculpting.
              </p>
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4 text-xs text-gray-300 mb-6">
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> Optimal Hypertrophy Splits</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> Macro & Nutrient Partitioning</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> Contest Prep & Posing</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-bold text-amber-400 group-hover:text-white transition-colors">
              <span>View Bodybuilding Page</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 4: Fat Loss */}
          <Link
            href="/coaching/fat-loss"
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] via-[#110301] to-[#080100] p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-rose-500/60 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(244,63,94,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                  Transformation
                </span>
                <span className="font-heading text-lg font-bold text-white">₹699 – ₹1,499/mo</span>
              </div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 group-hover:scale-110 transition-transform">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold uppercase text-white group-hover:text-rose-400 transition-colors">
                  Fat Loss Coaching
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-5">
                Sustainable caloric deficits with zero crash dieting. Drop stubborn fat while preserving muscle tone.
              </p>
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4 text-xs text-gray-300 mb-6">
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-rose-400" /> Non-Starvation Indian Diet Plans</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-rose-400" /> Weekly Measurement Audits</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-rose-400" /> Metabolic Rate Protection</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-bold text-rose-400 group-hover:text-white transition-colors">
              <span>View Fat Loss Page</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 5: Muscle Gain */}
          <Link
            href="/coaching/muscle-gain"
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] via-[#110301] to-[#080100] p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/60 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(16,185,129,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Clean Bulking
                </span>
                <span className="font-heading text-lg font-bold text-white">₹699 – ₹1,499/mo</span>
              </div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold uppercase text-white group-hover:text-emerald-400 transition-colors">
                  Clean Muscle Gain
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-5">
                Structured clean calorie surplus and heavy progressive compound lifting for hardgainers and skinny-fat builds.
              </p>
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4 text-xs text-gray-300 mb-6">
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> High-Calorie Healthy Meal Guides</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> Progressive Overload Tracking</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> Digestive Health Support</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-bold text-emerald-400 group-hover:text-white transition-colors">
              <span>View Muscle Gain Page</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 6: PCOS & Clinical */}
          <Link
            href="/coaching/clinical"
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] via-[#110301] to-[#080100] p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-purple-500/60 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(168,85,247,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                  Hormonal & Lifestyle
                </span>
                <span className="font-heading text-lg font-bold text-white">₹999 – ₹1,999/mo</span>
              </div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold uppercase text-white group-hover:text-purple-400 transition-colors">
                  PCOS & Clinical Support
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-5">
                Anti-inflammatory nutrition, resistance training for insulin sensitivity, and cycle-synced lifestyle guidance.
              </p>
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4 text-xs text-gray-300 mb-6">
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-purple-400" /> Insulin & Low-GI Nutrition</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-purple-400" /> Cycle-Phase Training Loads</span>
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-purple-400" /> Works with Physician Advice</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-bold text-purple-400 group-hover:text-white transition-colors">
              <span>View Clinical & PCOS Page</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

        </div>
      </section>

      {/* ── ALL 14 COACHING GOALS & STARTING PRICING MATRIX ── */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 py-10 border-t border-white/5">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gym-primary">Comprehensive Matrix</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white mt-1">
              All 14 Coaching Programs & Starting Rates
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md">
            Click any program to immediately initiate WhatsApp consultation with Coaches Akash & Tanvi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coachingGoals.map((goal) => (
            <div
              key={goal.id}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#120402]/80 p-5 hover:border-gym-primary/50 hover:bg-[#180603] transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-md bg-white/5 px-2 py-0.5 text-gray-400 border border-white/5">
                    {goal.category}
                  </span>
                  <span className="text-xs font-black text-gym-primary font-heading tracking-wide">
                    {goal.startPrice}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-white group-hover:text-gym-primary transition-colors">
                  {goal.title}
                </h3>
                <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                  {goal.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-semibold">{goal.range}</span>
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi Akash & Tanvi, I am interested in coaching for: ${goal.title}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-gym-primary hover:text-white transition-colors"
                >
                  <span>Enquire</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CORE 4 PLANS COMPARISON ── */}
      <div id="plans-matrix">
        <CoachingPlans />
      </div>

      {/* ── INTERACTIVE COACHING CARDS AUTO-SCROLL CAROUSEL ── */}
      <CoachingCardsCarousel />

      {/* ── COACHES BIO & CREDENTIALS STRIP ── */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 py-12">
        <div className="rounded-3xl border border-gym-primary/40 bg-gradient-to-r from-[#210603] via-[#140302] to-[#210603] p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gym-primary shadow-[0_0_25px_rgba(230,80,27,0.5)] shrink-0 bg-black">
              <Image
                src="/images/at-logo.png"
                alt="Coaches Akash & Tanvi"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gym-primary">Direct Coach Mentorship</div>
              <h3 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white">
                Coaches Akash & Tanvi
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
                Certified Fitness Trainers, Nutrition Specialists & Supplement Specialists. Reach out directly for personalized guidance, customized plans, or questions.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-300 justify-center sm:justify-start">
                <a href="https://wa.me/917043951377" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300">
                  <WhatsAppIcon variant="official" className="h-4 w-4" />
                  <span>+91 7043951377</span>
                </a>
                <a href="https://instagram.com/akash._.fit" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gym-primary hover:text-white">
                  <InstagramIcon className="h-3.5 w-3.5" />
                  <span>@akash._.fit</span>
                </a>
                <a href="https://instagram.com/tanvifitfusion" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gym-primary hover:text-white">
                  <InstagramIcon className="h-3.5 w-3.5" />
                  <span>@tanvifitfusion</span>
                </a>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coaches Akash & Tanvi, I am ready to start my transformation journey!")}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 rounded-full bg-gym-primary px-8 py-4 font-heading text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(230,80,27,0.5)] hover:brightness-110 transition-all cursor-pointer"
            >
              <WhatsAppIcon variant="white" className="h-4 w-4" />
              <span>Enrol With Coaches Now</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
