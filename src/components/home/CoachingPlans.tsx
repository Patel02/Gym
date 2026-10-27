"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Pill, 
  RotateCcw, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Trophy, 
  UserCheck, 
  Users, 
  Zap 
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

const WHATSAPP_PHONE = "917043951377";
const WHATSAPP_DISPLAY = "7043951377";

export const coachingPlans = [
  {
    id: "starter",
    name: "Starter Plan",
    price: "₹699",
    period: "/ month",
    badge: "Best for: Beginners",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    popular: false,
    description: "Essential workout and basic nutrition guidance to jumpstart your fitness journey.",
    features: [
      "Personalized Workout Plan",
      "Exercise Guidance",
      "Basic Diet Guidance",
      "Weekly Progress Check",
      "WhatsApp Support"
    ],
    waMessage: "Hi Akash & Tanvi, I want to enroll in the Starter Plan (₹699/mo) at A&T Fitness & Nutrition."
  },
  {
    id: "basic",
    name: "Basic Plan",
    price: "₹999",
    period: "/ month",
    badge: "Best Value for Beginners & Intermediate",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    popular: false,
    description: "Structured workout routines with customized diet planning and video exercise guidance.",
    features: [
      "Personalized Workout Plan",
      "Personalized Diet Plan",
      "Exercise Videos / Guidance",
      "Weekly Progress Tracking",
      "WhatsApp Support",
      "Lifestyle Guidance"
    ],
    waMessage: "Hi Akash & Tanvi, I want to enroll in the Basic Plan (₹999/mo) at A&T Fitness & Nutrition."
  },
  {
    id: "transformation",
    name: "Transformation Plan",
    price: "₹1,499",
    period: "/ month",
    badge: "Most Popular • Serious Transformation",
    badgeColor: "bg-gym-primary/25 text-gym-primary border-gym-primary/50",
    popular: true,
    description: "Complete body recomposition, fat loss or muscle gain program with regular coach reviews.",
    features: [
      "Personalized Workout Plan",
      "Personalized Nutrition Plan",
      "Fat Loss / Muscle Gain Strategy",
      "Weekly Progress Tracking",
      "Weight & Measurement Tracking",
      "Regular Coaching Support",
      "Exercise Form Guidance",
      "Supplement Guidance"
    ],
    waMessage: "Hi Akash & Tanvi, I want to enroll in the Transformation Plan (₹1,499/mo) at A&T Fitness & Nutrition."
  },
  {
    id: "premium",
    name: "Premium 1-to-1 Plan",
    price: "₹1,999",
    period: "/ month",
    badge: "Limited Clients • Personal Attention",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    popular: false,
    description: "High-touch personal coaching with video/call check-ins, daily monitoring and form corrections.",
    features: [
      "Fully Personalized Training",
      "Personalized Diet & Nutrition",
      "1-to-1 Online Coaching",
      "Weekly Video / Call Check-in",
      "Exercise Form Correction",
      "Daily / Regular Monitoring",
      "In-Depth Progress Analysis",
      "Supplement Guidance",
      "Lifestyle & Recovery Guidance",
      "Competition Preparation Support"
    ],
    waMessage: "Hi Akash & Tanvi, I want to enroll in the Premium 1-to-1 Coaching Plan (₹1,999/mo) at A&T Fitness & Nutrition."
  }
];

export const specializedPrograms = [
  {
    title: "Powerlifting Coaching",
    priceRange: "₹999 – ₹2,999 / mo",
    icon: Dumbbell,
    accent: "from-gym-primary to-gym-red",
    features: [
      "Squat Programming",
      "Bench Press Programming",
      "Deadlift Programming",
      "Strength Progression",
      "Technique & Form Guidance",
      "Competition Preparation",
      "Weight-Class Strategy"
    ]
  },
  {
    title: "Bodybuilding Coaching",
    priceRange: "₹999 – ₹2,999 / mo",
    icon: Trophy,
    accent: "from-amber-500 to-gym-primary",
    features: [
      "Targeted Workout Splits",
      "Muscle-Building Program",
      "Nutrition & Macro Planning",
      "Progressive Overload",
      "Exercise Selection",
      "Progress Tracking",
      "Body Recomposition"
    ]
  },
  {
    title: "Fat Loss / Weight Loss",
    priceRange: "₹699 – ₹1,499 / mo",
    icon: Flame,
    accent: "from-rose-500 to-gym-primary",
    features: [
      "Calorie & Nutrition Strategy",
      "Custom Workout Plan",
      "Cardio Guidance",
      "Weekly Weight Tracking",
      "Measurement Analysis",
      "Progress Tracking",
      "Lifestyle & Habit Guidance"
    ]
  },
  {
    title: "Muscle Gain / Weight Gain",
    priceRange: "₹699 – ₹1,499 / mo",
    icon: TrendingUp,
    accent: "from-emerald-500 to-teal-500",
    features: [
      "Calorie Surplus Strategy",
      "Protein & Nutrition Guidance",
      "Hypertrophy Workouts",
      "Progressive Overload",
      "Weight Scale Tracking",
      "Strength Progress Tracking",
      "Digestive Health Support"
    ]
  }
];

export const transformationSteps = [
  { step: "01", label: "Assessment", icon: Activity, desc: "Detailed health, habit, and physique intake." },
  { step: "02", label: "Goal Setting", icon: Target, desc: "Setting clear, quantifiable milestones." },
  { step: "03", label: "Workout", icon: Dumbbell, desc: "Tailored gym or home training split." },
  { step: "04", label: "Nutrition", icon: Apple, desc: "Macro-balanced, sustainable diet plan." },
  { step: "05", label: "Tracking", icon: Scale, desc: "Weekly logs, measurements & check-ins." },
  { step: "06", label: "Review", icon: CheckCircle2, desc: "Evaluating response & performance." },
  { step: "07", label: "Adjustment", icon: RotateCcw, desc: "Refining macros and training loads." },
  { step: "08", label: "Transformation", icon: Sparkles, desc: "Sustainable, long-lasting results." },
];

export default function CoachingPlans() {
  const [activeTab, setActiveTab] = useState<"plans" | "specialized" | "clinical">("plans");

  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.toLowerCase();
        if (hash.includes("specialized")) setActiveTab("specialized");
        else if (hash.includes("clinical")) setActiveTab("clinical");
        else if (hash.includes("plans")) setActiveTab("plans");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <section id="coaching" className="relative z-10 w-full border-b border-white/5 bg-gym-black py-12 md:py-16 lg:py-20 flex flex-col items-center">
      
      {/* ── Section Header ── */}
      <div className="mb-8 md:mb-10 flex flex-col items-center text-center px-6">
        
        {/* Brand & Coaches Prestige Pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-3.5">
          <Sparkles className="h-4 w-4 text-gym-primary shrink-0" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
            A&T Fitness & Nutrition • Online Coaching
          </span>
        </div>

        {/* Main Section Title */}
        <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black uppercase leading-[1.04] tracking-tight text-white drop-shadow-xl">
          Transform Your <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">
            Physique & Performance
          </span>
        </h2>

        {/* Subtitle with Coach Credentials */}
        <p className="mt-3.5 max-w-3xl text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed">
          Head Coaches <strong className="text-white font-bold">Akash & Tanvi</strong> — Certified Fitness Trainers, Nutrition Specialists & Supplement Experts. Personalized online coaching starting from just <strong className="text-gym-primary font-bold">₹699/month</strong>.
        </p>

        {/* Credential Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-gray-300">
            <Dumbbell className="h-3.5 w-3.5 text-gym-primary" />
            Certified Fitness Trainer
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-gray-300">
            <Apple className="h-3.5 w-3.5 text-emerald-400" />
            Certified Nutrition Specialist
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-gray-300">
            <Pill className="h-3.5 w-3.5 text-amber-400" />
            Certified Supplement Specialist
          </span>
        </div>

        {/* Section View Tabs */}
        <div className="mt-8 flex items-center gap-2 rounded-full border border-white/15 bg-[#140402] p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "plans"
                ? "bg-gym-primary text-white shadow-[0_0_15px_rgba(230,80,27,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Coaching Plans
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specialized")}
            className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "specialized"
                ? "bg-gym-primary text-white shadow-[0_0_15px_rgba(230,80,27,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Specialized Programs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("clinical")}
            className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "clinical"
                ? "bg-gym-primary text-white shadow-[0_0_15px_rgba(230,80,27,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            PCOS & Clinical Support
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl px-6 md:px-12 lg:px-16 flex flex-col gap-14">

        {/* ── TAB 1: 4-TIER COACHING PLANS ── */}
        {activeTab === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coachingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-gym-primary bg-gradient-to-b from-[#240804] to-[#120301] shadow-[0_0_40px_rgba(230,80,27,0.35)] scale-102 lg:-translate-y-2"
                    : "border border-white/10 bg-[#110402]/80 hover:border-white/25 hover:bg-[#160503]"
                }`}
              >
                {/* Popular ribbon */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-lg">
                    Recommended Choice
                  </div>
                )}

                <div>
                  {/* Badge */}
                  <div className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-4 ${plan.badgeColor}`}>
                    {plan.badge}
                  </div>

                  {/* Plan Name & Price */}
                  <h3 className="font-heading text-2xl font-bold uppercase text-white tracking-wide">
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-heading text-4xl sm:text-5xl font-black text-gym-primary tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">{plan.period}</span>
                  </div>

                  <p className="mt-3 text-xs text-gray-300 leading-relaxed font-normal">
                    {plan.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="my-6 border-t border-white/10 pt-5 flex flex-col gap-2.5">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-gray-200">
                        <Check className="h-4 w-4 shrink-0 text-gym-primary mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WhatsApp Action Button */}
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(plan.waMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer group ${
                    plan.popular
                      ? "bg-gym-primary text-white hover:brightness-110 shadow-[0_0_20px_rgba(230,80,27,0.5)]"
                      : "border border-emerald-500/30 bg-emerald-500/10 text-white hover:bg-emerald-600 hover:border-emerald-500 shadow-sm hover:shadow-[0_0_15px_rgba(37,211,102,0.4)]"
                  }`}
                >
                  <WhatsAppIcon variant="badge" className="h-5 w-5" />
                  <span>Enrol On WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 2: SPECIALIZED PROGRAMS ── */}
        {activeTab === "specialized" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializedPrograms.map((prog) => {
              const Icon = prog.icon;
              return (
                <div
                  key={prog.title}
                  className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#110402]/80 p-6 sm:p-7 backdrop-blur-xl hover:border-gym-primary/50 transition-all duration-300"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-gym-primary/20 to-gym-primary/5 border border-gym-primary/30 text-gym-primary mb-5 group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase text-white tracking-wide mb-2">
                      {prog.title}
                    </h3>
                    
                    <div className="inline-block rounded-lg bg-gym-primary/15 border border-gym-primary/30 px-2.5 py-1 text-xs font-bold text-gym-primary mb-5">
                      {prog.priceRange}
                    </div>

                    <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4">
                      {prog.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-xs text-gray-300">
                          <Check className="h-3.5 w-3.5 text-gym-primary shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi Akash & Tanvi, I am interested in your ${prog.title} coaching program.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-gym-primary/40 bg-gym-primary/10 py-3 text-xs font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white transition-all"
                  >
                    <span>Enquire Program</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB 3: CLINICAL & SPECIAL NUTRITION SUPPORT ── */}
        {activeTab === "clinical" && (
          <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-b from-[#1b0502] to-[#0c0201] p-8 sm:p-12 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8 pb-8 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">
                  <HeartPulse className="h-4 w-4" />
                  Lifestyle & Hormonal Wellness
                </div>
                <h3 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white">
                  Special Nutrition & Fitness Support
                </h3>
                <p className="mt-2 text-sm text-gray-300 max-w-2xl leading-relaxed">
                  We provide tailored fitness and nutrition support for common metabolic and hormonal concerns alongside proper medical advice.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 max-w-md text-xs text-amber-200">
                <strong>Important Note:</strong> We provide fitness, nutrition, and lifestyle guidance alongside your physician's counsel. <em>No medical treatment or disease-cure claims.</em>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-white/10 bg-black/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/15 border border-gym-primary/30 text-gym-primary mb-4">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Diabetes Support</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Low-glycemic index nutritional structuring, insulin sensitivity conditioning, and active lifestyle habits.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-black/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/15 border border-gym-primary/30 text-gym-primary mb-4">
                  <Activity className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Thyroid Support</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Metabolic rate optimization, balanced micronutrient planning, energy management, and sustainable calorie tracking.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-black/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/15 border border-gym-primary/30 text-gym-primary mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">PCOD / PCOS Support</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Hormone-supportive anti-inflammatory diet strategies, strength training to counter insulin resistance, and cycle awareness.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Akash & Tanvi, I would like to consult regarding Special Nutrition & Fitness Support (Diabetes/Thyroid/PCOS).")}`}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gym-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.5)] hover:brightness-110 transition-all"
              >
                <WhatsAppIcon variant="white" className="h-4 w-4" />
                <span>Consult on WhatsApp for Clinical Support</span>
              </a>
            </div>
          </div>
        )}

        {/* ── THE 8-STEP CLIENT TRANSFORMATION JOURNEY ── */}
        <div className="rounded-3xl border border-white/10 bg-[#110402]/60 p-8 sm:p-10 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gym-primary mb-2">
              Structured Methodology
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Every Client's 8-Step Transformation Journey
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {transformationSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.step}
                  className="flex flex-col items-center text-center p-3.5 rounded-xl border border-white/5 bg-black/40 hover:border-gym-primary/40 transition-colors"
                >
                  <span className="text-[10px] font-semibold text-gym-primary tracking-wider mb-1">{step.step}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-200 mb-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-bold text-white mb-1">{step.label}</div>
                  <div className="text-[10px] text-gray-400 leading-tight hidden lg:block">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CLIENT GUARANTEES STRIP ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
            <UserCheck className="h-6 w-6 text-gym-primary shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">100% Personalized Plans</div>
              <div className="text-[11px] text-gray-400">Tailored to your body</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
            <Clock className="h-6 w-6 text-gym-primary shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Flexible Schedule</div>
              <div className="text-[11px] text-gray-400">Work around your routine</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
            <Activity className="h-6 w-6 text-gym-primary shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Regular Monitoring</div>
              <div className="text-[11px] text-gray-400">Weekly weight & habit audits</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
            <HeartHandshake className="h-6 w-6 text-gym-primary shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Dedicated Support</div>
              <div className="text-[11px] text-gray-400">Direct WhatsApp guidance</div>
            </div>
          </div>
        </div>

        {/* ── DIRECT CONTACT & ENQUIRY CTA BAR ── */}
        <div className="rounded-3xl border border-gym-primary/40 bg-gradient-to-r from-[#2a0905] via-[#1c0603] to-[#2a0905] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-gym-primary shrink-0 shadow-[0_0_15px_rgba(230,80,27,0.5)]">
              <Image
                src="/images/at-logo.png"
                alt="A&T Fitness & Nutrition"
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gym-primary">Start Your Transformation</div>
              <div className="font-heading text-2xl font-bold uppercase text-white">
                DM Us For Online Coaching Today
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-300">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-gym-primary" />
                  +{WHATSAPP_DISPLAY}
                </span>
                <span className="flex items-center gap-1">
                  <InstagramIcon className="h-3.5 w-3.5 text-gym-primary" />
                  @akash._.fit • @tanvifitfusion
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Akash & Tanvi, I am interested in starting my online coaching with A&T Fitness & Nutrition.")}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-105 hover:shadow-[0_0_25px_rgba(37,211,102,0.6)] transition-all cursor-pointer"
            >
              <WhatsAppIcon variant="badge" className="h-5 w-5" />
              <span>WhatsApp Direct</span>
            </a>
            <Link
              href="/coaching"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gym-primary transition-all"
            >
              <span>View All Prices</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
