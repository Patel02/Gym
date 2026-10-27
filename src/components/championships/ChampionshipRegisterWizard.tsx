"use client";

import {
  registerAthleteForMeetAction,
  type DigitalMeetTicketPayload,
  type MeetRegistrationFormInput,
} from "@/actions/championship-registration.actions";
import { DigitalMeetPassModal } from "@/components/championships/DigitalMeetPassModal";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Dumbbell,
  ExternalLink,
  Flame,
  Info,
  Lock,
  MapPin,
  QrCode,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ChampionshipRegisterWizardProps {
  meet: {
    id: string;
    title: string;
    dates: string;
    city: string;
    venue: string;
    prizePool: string;
    entryFee: string;
    entryFeeNumeric: number;
    status: string;
    daysLeft: number;
    divisions: string[];
    circularUrl?: string;
  };
  currentUser: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    gender?: string;
    weightClass?: string;
    activeMembershipCard?: string;
    hasActiveMembership: boolean;
  } | null;
  existingRegistration?: DigitalMeetTicketPayload | null;
}

const MEN_WEIGHT_CLASSES = ["59", "66", "74", "83", "93", "105", "120", "+120"];
const WOMEN_WEIGHT_CLASSES = ["47", "52", "57", "63", "69", "76", "84", "+84"];

const DIVISIONS = [
  { id: "OPEN", label: "Open (Premier)", desc: "All ages 14+. Highest competitive standard." },
  { id: "JUNIOR", label: "Junior (19–23 Yrs)", desc: "Athletes aged 19 to 23 in current calendar year." },
  { id: "SUB_JUNIOR", label: "Sub-Junior (14–18 Yrs)", desc: "Developing lifters aged 14 to 18." },
  { id: "MASTER_1", label: "Masters 1 (40–49 Yrs)", desc: "Veteran competitive division 40 to 49." },
  { id: "MASTER_2", label: "Masters 2 (50–59 Yrs)", desc: "Veteran competitive division 50 to 59." },
  { id: "MASTER_3", label: "Masters 3 (60+ Yrs)", desc: "Senior master division 60 and above." },
] as const;

const EQUIPMENT_OPTIONS = [
  { id: "RAW", label: "Raw (Standard Sleeves)", desc: "Non-supportive neoprene sleeves, wrist wraps, & IPF legal belt." },
  { id: "CLASSIC_RAW", label: "Classic Raw (Wraps)", desc: "Allows 2-meter knee wraps + belt." },
  { id: "EQUIPPED", label: "Equipped (Suit & Shirt)", desc: "Supportive squat/deadlift suit and bench shirt." },
] as const;

export function ChampionshipRegisterWizard({
  meet,
  currentUser,
  existingRegistration: initialExistingTicket,
}: ChampionshipRegisterWizardProps) {
  const router = useRouter();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Active or generated ticket for modal
  const [activeTicket, setActiveTicket] = useState<DigitalMeetTicketPayload | null>(
    initialExistingTicket || null
  );
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);

  // Form Fields
  const [gender, setGender] = useState<"MALE" | "FEMALE">(
    currentUser?.gender === "FEMALE" ? "FEMALE" : "MALE"
  );
  const [weightClass, setWeightClass] = useState<string>(
    currentUser?.weightClass || (gender === "FEMALE" ? "63" : "83")
  );
  const [division, setDivision] = useState<MeetRegistrationFormInput["division"]>("OPEN");
  const [equipment, setEquipment] = useState<MeetRegistrationFormInput["equipment"]>("RAW");

  // Step 2: Openers & Rack Heights
  const [squatOpener, setSquatOpener] = useState<number>(200);
  const [benchOpener, setBenchOpener] = useState<number>(135);
  const [deadliftOpener, setDeadliftOpener] = useState<number>(225);
  const [squatRackPin, setSquatRackPin] = useState<number>(12);
  const [benchRackPin, setBenchRackPin] = useState<number>(8);
  const [coachName, setCoachName] = useState<string>("Coach Akash / Self");
  const [coachPhone, setCoachPhone] = useState<string>("+91 7043951377");

  // Step 3: Declarations
  const [antiDopingAccepted, setAntiDopingAccepted] = useState<boolean>(true);
  const [medicalClearanceAccepted, setMedicalClearanceAccepted] = useState<boolean>(true);

  // Step 4: Mock Payment
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI_QR");
  const [isSuccessComplete, setIsSuccessComplete] = useState<boolean>(false);

  const availableWeightClasses = gender === "MALE" ? MEN_WEIGHT_CLASSES : WOMEN_WEIGHT_CLASSES;

  const handleSubmitRegistration = async () => {
    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const payload: MeetRegistrationFormInput = {
        meetId: meet.id,
        gender,
        weightClass: `${weightClass} KG`,
        division,
        equipment,
        squatOpener,
        benchOpener,
        deadliftOpener,
        squatRackPin,
        benchRackPin,
        coachName,
        coachPhone,
        antiDopingAccepted,
        medicalClearanceAccepted,
        paymentMethod,
      };

      const res = await registerAthleteForMeetAction(payload);
      if (res.success && res.ticket) {
        setActiveTicket(res.ticket);
        setIsSuccessComplete(true);
        setIsTicketModalOpen(true);
        router.refresh();
      } else {
        setSubmissionError(res.error || "Failed to submit registration. Please try again.");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setSubmissionError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already registered and athlete hasn't initiated new registration
  if (activeTicket && !isSuccessComplete && currentStep === 1) {
    return (
      <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#0a1a10] via-[#0d130f] to-[#0a0f0d] p-6 sm:p-8 shadow-2xl text-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 mb-1">
                <ShieldCheck className="h-3 w-3" />
                Officially Registered Lifter
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
                You Are Confirmed For This Championship
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              <span>View Official Accreditation Pass</span>
            </button>
          </div>
        </div>

        {/* Existing Registration Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400">ASSIGNED LOT</span>
            <span className="font-heading text-3xl font-bold text-white mt-1">#{activeTicket.lotNumber}</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400">CLASS &amp; DIVISION</span>
            <span className="font-heading text-base font-bold text-gym-primary mt-2">
              {activeTicket.weightClass} • {activeTicket.division}
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400">OFFICIAL WEIGH-IN</span>
            <span className="font-heading text-sm font-black text-white mt-2">
              {activeTicket.weighInTime.split("(")[0]}
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400">NOMINATED OPENERS</span>
            <span className="font-mono text-xs font-black text-emerald-400 mt-2 block">
              S: {activeTicket.squatOpener} | B: {activeTicket.benchOpener} | D: {activeTicket.deadliftOpener} KG
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-400" />
            <span>Bring your printed pass or digital QR ticket with valid Govt ID to the weigh-in scale.</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tools/warmup-calculator"
              className="inline-flex items-center gap-1 font-bold text-gym-primary hover:underline"
            >
              <Dumbbell className="h-3.5 w-3.5" />
              <span>Launch Warm-Up &amp; Plate Planner →</span>
            </Link>
            <span>•</span>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-gray-400 hover:text-white underline cursor-pointer"
            >
              Modify / Re-submit Entry
            </button>
          </div>
        </div>

        {activeTicket && (
          <DigitalMeetPassModal
            ticket={activeTicket}
            isOpen={isTicketModalOpen}
            onClose={() => setIsTicketModalOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#180803] via-[#0e0301] to-[#120402] p-5 sm:p-8 shadow-2xl text-white">
      
      {/* ── STEP PROGRESS BAR ── */}
      <div className="border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gym-primary">
              OFFICIAL IPF ENTRY REGISTRATION
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase text-white mt-0.5">
              Championship Category &amp; Platform Nomination
            </h2>
          </div>
          <span className="font-heading text-sm font-black text-gray-400">
            Step <strong className="text-gym-primary">{currentStep}</strong> of 4
          </span>
        </div>

        {/* Steps Pills */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: "Category & Division" },
            { num: 2, label: "Openers & Rack Pin" },
            { num: 3, label: "Anti-Doping Clearance" },
            { num: 4, label: "Payment & Pass" },
          ].map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div
                key={s.num}
                className={`rounded-xl p-2.5 transition-all text-center ${
                  isCurrent
                    ? "bg-gym-primary/20 border border-gym-primary text-white"
                    : isCompleted
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border border-white/5 text-gray-500"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase">
                  {isCompleted ? <Check className="h-3 w-3" /> : <span>#{s.num}</span>}
                  <span className="hidden md:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ERROR ALERT IF ANY ── */}
      {submissionError && (
        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════
          STEP 1: WEIGHT CLASS, DIVISION & EQUIPMENT
         ══════════════════════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="space-y-6">
          
          {/* Gender Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              1. Competition Gender Division
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {(["MALE", "FEMALE"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGender(g);
                    setWeightClass(g === "MALE" ? "83" : "63");
                  }}
                  className={`py-3 px-4 rounded-2xl font-heading text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    gender === g
                      ? "bg-gym-primary text-white border-gym-primary shadow-[0_0_20px_rgba(230,80,27,0.3)]"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {g === "MALE" ? "Men's Division" : "Women's Division"}
                </button>
              ))}
            </div>
          </div>

          {/* Official IPF Weight Class Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                2. Official Weight Category (KG)
              </label>
              <span className="text-[10px] text-gym-primary font-bold">IPF Ratified Classes</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {availableWeightClasses.map((wc) => {
                const isSelected = weightClass === wc;
                return (
                  <button
                    key={wc}
                    type="button"
                    onClick={() => setWeightClass(wc)}
                    className={`py-3 px-2 rounded-xl text-center transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-gym-primary text-white border-gym-primary shadow-[0_0_20px_rgba(230,80,27,0.4)] scale-105"
                        : "bg-white/5 text-gray-300 border-white/10 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="block font-heading text-lg font-bold">{wc}</span>
                    <span className="block text-[9px] uppercase tracking-wider opacity-70">KG</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Division (Age / Seniority) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              3. Age Division Classification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DIVISIONS.map((divItem) => {
                const isSelected = division === divItem.id;
                return (
                  <button
                    key={divItem.id}
                    type="button"
                    onClick={() => setDivision(divItem.id as any)}
                    className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-gym-primary/15 border-gym-primary text-white shadow-md"
                        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-sm font-bold uppercase text-white">
                        {divItem.label}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-gym-primary" />}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{divItem.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment Classification */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              4. Technical Equipment Class
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EQUIPMENT_OPTIONS.map((eqItem) => {
                const isSelected = equipment === eqItem.id;
                return (
                  <button
                    key={eqItem.id}
                    type="button"
                    onClick={() => setEquipment(eqItem.id as any)}
                    className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-gym-primary/15 border-gym-primary text-white shadow-md"
                        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-sm font-bold uppercase text-white">
                        {eqItem.label}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-gym-primary" />}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{eqItem.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-gym-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>Continue to Platform Openers</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════
          STEP 2: PLATFORM NOMINATIONS & RACK SPECS
         ══════════════════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 flex items-center gap-3">
            <Info className="h-5 w-5 text-gym-primary shrink-0" />
            <p className="text-xs text-gray-300">
              Opening attempts must be within competition technical parameters (minimum 20 KG, multiple of 2.5 KG). You can modify openers with technical marshals up to 10 minutes prior to lifting.
            </p>
          </div>

          {/* 3 Openers Inputs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Planned Opening Lifts (Attempt 1)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Squat Opener */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gym-primary block mb-1">
                  1. SQUAT OPENER (KG)
                </span>
                <input
                  type="number"
                  step={2.5}
                  min={20}
                  max={500}
                  value={squatOpener}
                  onChange={(e) => setSquatOpener(Number(e.target.value) || 20)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 font-heading text-2xl font-bold text-white focus:border-gym-primary focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Recommended: 88-92% of gym 1RM
                </span>
              </div>

              {/* Bench Opener */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gym-primary block mb-1">
                  2. BENCH PRESS OPENER (KG)
                </span>
                <input
                  type="number"
                  step={2.5}
                  min={20}
                  max={400}
                  value={benchOpener}
                  onChange={(e) => setBenchOpener(Number(e.target.value) || 20)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 font-heading text-2xl font-bold text-white focus:border-gym-primary focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Recommended: 3-second pause ready
                </span>
              </div>

              {/* Deadlift Opener */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gym-primary block mb-1">
                  3. DEADLIFT OPENER (KG)
                </span>
                <input
                  type="number"
                  step={2.5}
                  min={20}
                  max={500}
                  value={deadliftOpener}
                  onChange={(e) => setDeadliftOpener(Number(e.target.value) || 20)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 font-heading text-2xl font-bold text-white focus:border-gym-primary focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Recommended: Confident speed pull
                </span>
              </div>

            </div>
          </div>

          {/* Technical Rack Heights */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Competition Rack Height Setup
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-200">Squat Rack Height (Pin 1–25)</span>
                  <span className="font-heading text-sm font-black text-gym-primary">Pin #{squatRackPin}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={22}
                  value={squatRackPin}
                  onChange={(e) => setSquatRackPin(Number(e.target.value))}
                  className="w-full accent-gym-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                  <span>Pin 5 (Low)</span>
                  <span>Pin 12 (Avg 5'8")</span>
                  <span>Pin 22 (Tall)</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-200">Bench Rack Height (Pin 1–15)</span>
                  <span className="font-heading text-sm font-black text-gym-primary">Pin #{benchRackPin}</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={benchRackPin}
                  onChange={(e) => setBenchRackPin(Number(e.target.value))}
                  className="w-full accent-gym-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                  <span>Pin 3 (Low)</span>
                  <span>Pin 8 (Standard)</span>
                  <span>Pin 15 (High)</span>
                </div>
              </div>

            </div>
          </div>

          {/* Coach / Corner Handler Info */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Corner Coach / Spotter Handler Contact
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-gray-400 block mb-1">Coach / Corner Support Name</span>
                <input
                  type="text"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gym-primary focus:outline-none"
                  placeholder="e.g. Coach Akash / Self"
                />
              </div>

              <div>
                <span className="text-[10px] text-gray-400 block mb-1">Coach WhatsApp Contact</span>
                <input
                  type="text"
                  value={coachPhone}
                  onChange={(e) => setCoachPhone(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gym-primary focus:outline-none"
                  placeholder="+91 7043951377"
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-gym-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>Anti-Doping &amp; Declarations</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════
          STEP 3: ANTI-DOPING & CLEAN SPORT DECLARATION
         ══════════════════════════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="space-y-6">
          
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
            <div className="flex items-center gap-2 text-amber-400 font-heading text-base font-bold uppercase mb-2">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>National Anti-Doping Strict Liability Code</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Powerlifting India &amp; the Indian Powerlifting Federation enforce strict compliance with NADA (National Anti-Doping Agency) and WADA (World Anti-Doping Agency). Under strict liability, athletes are solely responsible for any prohibited substance found in their biological specimens.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Agreement 1 */}
            <label className="flex items-start gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={antiDopingAccepted}
                onChange={(e) => setAntiDopingAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 text-gym-primary focus:ring-gym-primary"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  I agree to in-competition and out-of-competition testing (WADA/NADA Prohibited List 2026)
                </span>
                <span className="text-gray-400 mt-0.5 block">
                  I certify that I have not used any prohibited anabolic agents, peptide hormones, or unapproved supplements.
                </span>
              </div>
            </label>

            {/* Agreement 2 */}
            <label className="flex items-start gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={medicalClearanceAccepted}
                onChange={(e) => setMedicalClearanceAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 text-gym-primary focus:ring-gym-primary"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  Medical Clearance &amp; IPF Technical Rules Declaration
                </span>
                <span className="text-gray-400 mt-0.5 block">
                  I confirm that I am medically fit to compete on the national platform and will adhere to the official IPF technical rulebook and 3-light referee decisions.
                </span>
              </div>
            </label>

          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={!antiDopingAccepted || !medicalClearanceAccepted}
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-2 rounded-xl bg-gym-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════
          STEP 4: REVIEW & INSTANT PAYMENT CONFIRMATION
         ══════════════════════════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="space-y-6">
          
          {/* Review Grid */}
          <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#1c0803] to-black p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gym-primary">
                  NOMINATION SUMMARY
                </span>
                <h3 className="font-heading text-lg font-bold uppercase text-white">
                  {currentUser?.name || "Athlete Entry"} • {gender}
                </h3>
              </div>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-400">
                LOT ASSIGNMENT PENDING
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-white/5 p-3">
                <span className="text-gray-400 text-[10px] uppercase">Weight Category</span>
                <span className="block font-heading text-lg font-bold text-white mt-0.5">{weightClass} KG</span>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <span className="text-gray-400 text-[10px] uppercase">Division</span>
                <span className="block font-heading text-sm font-black text-gym-primary mt-1">{division}</span>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <span className="text-gray-400 text-[10px] uppercase">Equipment</span>
                <span className="block font-heading text-sm font-black text-white mt-1">{equipment}</span>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <span className="text-gray-400 text-[10px] uppercase">Openers Total</span>
                <span className="block font-heading text-base font-bold text-emerald-400 mt-1">
                  {squatOpener + benchOpener + deadliftOpener} KG
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-black/60 p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300">
              <span className="flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-gym-primary" />
                <span>Squat: <strong className="text-white">{squatOpener}kg</strong> (Pin {squatRackPin})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-gym-primary" />
                <span>Bench: <strong className="text-white">{benchOpener}kg</strong> (Pin {benchRackPin})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-gym-primary" />
                <span>Deadlift: <strong className="text-white">{deadliftOpener}kg</strong></span>
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Official Entry Fee &amp; Payment Gateway
            </label>
            
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs text-gray-400 block">Sanctioned Entry Fee</span>
                <span className="font-heading text-3xl font-bold text-white">
                  {meet.entryFee || "₹2,500"}
                </span>
                <span className="text-[10px] text-emerald-400 block font-bold mt-0.5">
                  ✓ Includes Drug Testing Levy &amp; Platform Scoring Badge
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[
                  { id: "UPI_QR", label: "UPI Instant QR", icon: QrCode },
                  { id: "CARD", label: "Card / Netbanking", icon: CreditCard },
                ].map((p) => {
                  const isSelected = paymentMethod === p.id;
                  const IconComp = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-gym-primary text-white border-gym-primary shadow-md"
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Final Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitRegistration}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              <span>{isSubmitting ? "Processing Entry & Generating Pass..." : "Confirm Entry & Generate Pass"}</span>
            </button>
          </div>

        </div>
      )}

      {/* Meet Pass Modal */}
      {activeTicket && (
        <DigitalMeetPassModal
          ticket={activeTicket}
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
        />
      )}

    </div>
  );
}
