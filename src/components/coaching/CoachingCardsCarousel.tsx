"use client";

import { useState, useRef } from "react";
import { 
  Activity, 
  Apple, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Dumbbell, 
  Flame, 
  HeartPulse, 
  MessageCircle, 
  Pause, 
  Pill, 
  Play, 
  Scale, 
  Sparkles, 
  TrendingUp, 
  Trophy, 
  UserCheck, 
  Zap 
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

const WHATSAPP_PHONE = "917043951377";

interface ProgramCardItem {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  price: string;
  subtitle: string;
  icon: any;
  accentGradient: string;
  features: string[];
  waMessage: string;
}

const carouselProgramCards: ProgramCardItem[] = [
  {
    id: "premium-1to1",
    badge: "VIP High-Touch",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    title: "1-to-1 Personal Online Coaching",
    price: "₹1,999 / mo",
    subtitle: "Direct personal mentorship with daily monitoring & video/call check-ins.",
    icon: UserCheck,
    accentGradient: "from-amber-500/30 via-gym-primary/20 to-transparent",
    features: [
      "Weekly 1-to-1 Video or Call Check-in",
      "Daily Habit & Weight Monitoring",
      "Real-time Exercise Form Corrections",
      "Full Custom Diet & Workout Routine",
      "Priority WhatsApp Access to Coaches"
    ],
    waMessage: "Hi Akash & Tanvi, I want to book 1-to-1 Personal Online Coaching (₹1,999/mo)."
  },
  {
    id: "powerlifting",
    badge: "Strength & Competition",
    badgeColor: "bg-gym-primary/25 text-gym-primary border-gym-primary/50",
    title: "Powerlifting Competition Coaching",
    price: "₹999 – ₹2,999 / mo",
    subtitle: "Olympic-standard IPF technical programming to maximize your Total.",
    icon: Dumbbell,
    accentGradient: "from-gym-primary/30 via-gym-red/20 to-transparent",
    features: [
      "Squat, Bench & Deadlift Periodization",
      "Peaking Cycles & Deload Timing",
      "Technical Form & Command Standards",
      "Competition Day Strategy & Warmups",
      "Weight-Class Water & Weight Management"
    ],
    waMessage: "Hi Akash & Tanvi, I am interested in Powerlifting Competition Coaching."
  },
  {
    id: "bodybuilding",
    badge: "Muscle Sculpting",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    title: "Physique & Bodybuilding Coaching",
    price: "₹999 – ₹2,999 / mo",
    subtitle: "Targeted hypertrophy splits and progressive overload for aesthetics.",
    icon: Trophy,
    accentGradient: "from-rose-500/30 via-gym-primary/20 to-transparent",
    features: [
      "Targeted Muscle-Group Workout Splits",
      "Volume, Intensity & RPE Tracking",
      "Macro & Protein Optimization",
      "Symmetry & Weak-Point Training",
      "Contest Prep & Peak Week Conditioning"
    ],
    waMessage: "Hi Akash & Tanvi, I am interested in Physique & Bodybuilding Coaching."
  },
  {
    id: "fatloss",
    badge: "Transformation",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
    title: "Fat Loss & Body Recomposition",
    price: "₹699 – ₹1,499 / mo",
    subtitle: "Sustainable calorie deficits with zero starvation to burn stubborn fat.",
    icon: Flame,
    accentGradient: "from-red-500/30 via-gym-primary/20 to-transparent",
    features: [
      "Custom Calorie Deficit Strategy",
      "Step Count & Cardio Programming",
      "Weekly Body Measurement Audits",
      "Craving Control & Flexible Dieting",
      "Metabolic Rate Maintenance Protocols"
    ],
    waMessage: "Hi Akash & Tanvi, I want to start my Fat Loss & Transformation Coaching."
  },
  {
    id: "musclegain",
    badge: "Clean Bulking",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    title: "Clean Muscle Gain & Hypertrophy",
    price: "₹699 – ₹1,499 / mo",
    subtitle: "Controlled calorie surplus strategies for dense, lean muscle mass.",
    icon: TrendingUp,
    accentGradient: "from-emerald-500/30 via-teal-500/20 to-transparent",
    features: [
      "Calculated Calorie Surplus Diet Plan",
      "Protein Intake Timing & Synthesis",
      "Progressive Resistance Overload System",
      "Digestive Health & Nutrient Absorption",
      "Weekly Strength & Scale Tracking"
    ],
    waMessage: "Hi Akash & Tanvi, I want to enroll in Muscle Gain & Clean Hypertrophy Coaching."
  },
  {
    id: "pcod-pcos",
    badge: "Hormonal Health",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    title: "PCOS / PCOD Lifestyle Support",
    price: "₹999 – ₹1,999 / mo",
    subtitle: "Hormone-balancing anti-inflammatory nutrition & resistance training.",
    icon: Sparkles,
    accentGradient: "from-purple-500/30 via-pink-500/20 to-transparent",
    features: [
      "Anti-Inflammatory Nutritional Protocols",
      "Resistance Training for Insulin Sensitivity",
      "Cortisol & Stress Management Habits",
      "Menstrual Cycle Phase Awareness",
      "Works Alongside Doctor's Medical Advice"
    ],
    waMessage: "Hi Akash & Tanvi, I would like to consult regarding PCOS / PCOD Lifestyle Support."
  },
  {
    id: "clinical",
    badge: "Clinical Lifestyle",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    title: "Diabetes & Thyroid Fitness Support",
    price: "₹999 – ₹1,999 / mo",
    subtitle: "Metabolic rate optimization and low-GI nutritional structuring.",
    icon: HeartPulse,
    accentGradient: "from-cyan-500/30 via-blue-500/20 to-transparent",
    features: [
      "Low Glycemic Index (GI) Meal Structures",
      "Energy Regulation & Fatigue Reduction",
      "Metabolic Thyroid Conditioning Workouts",
      "Sustainable Micronutrient Planning",
      "Coordinated with Physician Guidance"
    ],
    waMessage: "Hi Akash & Tanvi, I want to enquire about Diabetes & Thyroid Fitness Support."
  },
  {
    id: "eight-step",
    badge: "Client Guarantee",
    badgeColor: "bg-gym-primary/20 text-gym-primary border-gym-primary/30",
    title: "8-Step Transformation System",
    price: "Included in All Plans",
    subtitle: "Our systematic protocol delivering proven, long-term results.",
    icon: Scale,
    accentGradient: "from-gym-primary/30 via-amber-500/20 to-transparent",
    features: [
      "1. Comprehensive Health Assessment",
      "2. Quantifiable Milestone Goal Setting",
      "3. Tailored Workout + 4. Macro Nutrition",
      "5. Tracking + 6. Review & Audit",
      "7. Load Adjustments + 8. Lasting Transformation"
    ],
    waMessage: "Hi Akash & Tanvi, I want to learn more about your 8-Step Transformation System."
  },
  {
    id: "form-guidance",
    badge: "Injury Prevention",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    title: "Exercise Form & Biomechanics",
    price: "Included in Basic+",
    subtitle: "Detailed video breakdown of your lifts to protect joints and lift heavier.",
    icon: Activity,
    accentGradient: "from-blue-500/30 via-indigo-500/20 to-transparent",
    features: [
      "Video Lift Breakdown & Angle Reviews",
      "Bar Path & Stance Width Optimizations",
      "Joint Stacking & Spine Neutrality",
      "Mobility Exercises for Hip & Ankle",
      "Safe Progressive Overload Guidance"
    ],
    waMessage: "Hi Akash & Tanvi, I need help with Exercise Form Correction & Lifting Technique."
  },
  {
    id: "supplements",
    badge: "Certified Specialist",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    title: "Evidence-Based Supplement Guidance",
    price: "Included in Coaching",
    subtitle: "Scientific, cost-effective recommendations from certified experts.",
    icon: Pill,
    accentGradient: "from-emerald-500/30 via-gym-primary/20 to-transparent",
    features: [
      "Scientifically Proven Supplement Selection",
      "Daily Timing, Dosing & Stacking Guidance",
      "Budget-Friendly Brand Suggestions",
      "Zero Harmful or Banned Substances",
      "Protein, Creatine & Micronutrient Planning"
    ],
    waMessage: "Hi Akash & Tanvi, I want expert advice on evidence-based fitness supplements."
  }
];

export default function CoachingCardsCarousel() {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  // Duplicate the array to create seamless loop
  const displayCards = [...carouselProgramCards, ...carouselProgramCards];

  return (
    <section 
      id="coaching-cards-carousel" 
      className="relative w-full py-14 sm:py-18 overflow-hidden bg-gym-black border-t border-white/5"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gym-primary/10 via-transparent to-transparent pointer-events-none" />

      {/* ── Section Heading & Controls ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gym-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Program Cards</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white tracking-tight">
            Specialized Programs & Pillars
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-xl leading-relaxed">
            Auto-scrolling programs catalog. Hover anywhere over a card to pause the auto-scroll and inspect details.
          </p>
        </div>

        {/* Carousel Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:border-gym-primary hover:bg-white/10 transition-all cursor-pointer"
            aria-label={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 text-gym-primary fill-gym-primary" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-gym-primary fill-gym-primary" />
                <span>Pause</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={scrollLeft}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-gray-300 hover:text-white hover:border-gym-primary hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={scrollRight}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-gray-300 hover:text-white hover:border-gym-primary hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Auto-Scrolling Marquee Carousel ── */}
      <div 
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left & Right Edge Vignette Fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-20 md:w-32 bg-gradient-to-r from-gym-black via-gym-black/90 to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-20 md:w-32 bg-gradient-to-l from-gym-black via-gym-black/90 to-transparent z-20" />

        {/* The Continuous Infinite Marquee Ribbon */}
        <div
          ref={containerRef}
          className="animate-infinite-marquee flex gap-5 sm:gap-6 py-4 px-4"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
            animationDuration: "50s"
          }}
        >
          {displayCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={`${card.id}-${index}`}
                className="group relative flex flex-col justify-between w-[295px] sm:w-[335px] md:w-[360px] shrink-0 rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] via-[#120301] to-[#0a0201] p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-gym-primary/60 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(230,80,27,0.3)]"
              >
                {/* Top Subtle Gradient Glow inside card */}
                <div className={`absolute top-0 left-0 right-0 h-32 rounded-t-3xl bg-gradient-to-b ${card.accentGradient} opacity-30 pointer-events-none`} />

                <div className="relative z-10">
                  {/* Top Bar: Badge & Price */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                    <span className="font-heading text-sm font-black text-gym-primary tracking-wide">
                      {card.price}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-gym-primary shadow-inner group-hover:scale-110 group-hover:border-gym-primary transition-all shrink-0">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg sm:text-xl font-bold uppercase text-white leading-tight group-hover:text-gym-primary transition-colors">
                        {card.title}
                      </h3>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs text-gray-400 leading-relaxed min-h-[36px] font-normal mb-4">
                    {card.subtitle}
                  </p>

                  {/* Feature Checklist */}
                  <div className="border-t border-white/10 pt-4 flex flex-col gap-2 mb-6">
                    {card.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-xs text-gray-300">
                        <Check className="h-3.5 w-3.5 text-gym-primary shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Direct WhatsApp Button */}
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(card.waMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="relative z-10 w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all shadow-md hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] cursor-pointer group/btn"
                >
                  <WhatsAppIcon variant="official" className="h-4 w-4 shrink-0 transition-transform group-hover/btn:scale-110" />
                  <span>Enquire On WhatsApp</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle indicator bar */}
      <div className="mx-auto mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-gym-primary animate-ping" />
        <span>Auto-scrolling continuously • Pause on hover to enrol</span>
      </div>
    </section>
  );
}
