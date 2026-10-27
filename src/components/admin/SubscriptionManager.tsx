"use client";

import React, { useState, useTransition } from "react";
import {
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
  CreditCard,
  QrCode,
  Lock,
  Unlock,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import {
  PlanType,
  SubscriptionStatusResponse,
  requestReactivationAction,
  requestExtraEventCreditsAction,
} from "@/actions/subscription.actions";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

interface SubscriptionManagerProps {
  initialData: SubscriptionStatusResponse;
}

const PLAN_DETAILS: Record<PlanType, { name: string; duration: string; price: number; originalPrice: number; discount: string; features: string[] }> = {
  MONTHLY: {
    name: "Standard Monthly",
    duration: "1 Month (30 Days)",
    price: 2999,
    originalPrice: 3499,
    discount: "Save 14%",
    features: [
      "Up to 4 Federation Meets / Month",
      "Full 3-Referee VAR Command Center",
      "Electronic Live Match Day Arena (/live)",
      "Official IPF GL, DOTS & Wilks Scoring",
      "Athlete Directory & Digital Certificates",
      "Standard Technical Support",
    ],
  },
  SIX_MONTH: {
    name: "Semi-Annual Pro",
    duration: "6 Months (180 Days)",
    price: 14999,
    originalPrice: 17999,
    discount: "Save 17%",
    features: [
      "Up to 4 Meets / Month (24 Meets Total)",
      "Full 3-Referee VAR Command Center",
      "Priority Live Arena Broadcast Server",
      "National Records Ratification Engine",
      "Weigh-In Nutrition & Warmup Peaking Tools",
      "Priority WhatsApp Hotline Support",
    ],
  },
  YEARLY: {
    name: "Annual Federation Enterprise",
    duration: "12 Months (365 Days)",
    price: 26999,
    originalPrice: 35999,
    discount: "Save 25% (Best Value)",
    features: [
      "Up to 4 Meets / Month (48 Meets Total)",
      "Custom Subdomain & White-Label Federation Hub",
      "Unlimited Referee Certifications & Exams",
      "Multi-Platform Jumbotron & Livestream Overlay",
      "Bulk Athlete QR ID Card Generation",
      "Dedicated 24/7 Account Peaking Manager",
    ],
  },
};

export default function SubscriptionManager({ initialData }: SubscriptionManagerProps) {
  const [data, setData] = useState<SubscriptionStatusResponse>(initialData);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(data.subscription.planType || "MONTHLY");
  const [paymentUtr, setPaymentUtr] = useState(data.subscription.paymentUtr || "");
  const [contactPhone, setContactPhone] = useState(data.subscription.contactPhone || "+91 98765 43210");
  const [organizationName, setOrganizationName] = useState(data.subscription.organizationName || "");
  const [reactivationNotes, setReactivationNotes] = useState("");
  
  // Extra credits top-up state
  const [topupCredits, setTopupCredits] = useState<number>(1);
  const [topupUtr, setTopupUtr] = useState("");
  const [showTopupModal, setShowTopupModal] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const sub = data.subscription;
  const metrics = data.metrics;
  const isExpired = metrics.isExpired;
  const isPendingApproval = sub.status === "PENDING_APPROVAL";

  // Handle Reactivation Form Submission
  const handleRequestReactivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentUtr || paymentUtr.trim().length < 4) {
      setMessage({ text: "Please provide a valid Payment UTR or Transaction Reference ID.", type: "error" });
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const res = await requestReactivationAction({
        planType: selectedPlan,
        paymentUtr: paymentUtr.trim(),
        contactPhone: contactPhone.trim(),
        organizationName: organizationName.trim(),
        notes: reactivationNotes.trim(),
      });

      if (res.success) {
        setMessage({ text: res.message || "Request submitted successfully!", type: "success" });
        setData((prev) => ({
          ...prev,
          subscription: {
            ...prev.subscription,
            status: "PENDING_APPROVAL",
            paymentUtr,
            contactPhone,
            reactivationPlanType: selectedPlan,
          },
        }));
      } else {
        setMessage({ text: res.error || "Submission failed.", type: "error" });
      }
    });
  };

  // Handle Extra Event Top-up Submission
  const handleTopupCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topupUtr || topupUtr.trim().length < 4) {
      setMessage({ text: "Please enter the payment UTR for the extra credits.", type: "error" });
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const res = await requestExtraEventCreditsAction({
        credits: topupCredits,
        paymentUtr: topupUtr.trim(),
        notes: `Add-on top-up for +${topupCredits} event slots`,
      });

      if (res.success) {
        setMessage({ text: res.message || "Credit request submitted!", type: "success" });
        setShowTopupModal(false);
        setTopupUtr("");
      } else {
        setMessage({ text: res.error || "Request failed.", type: "error" });
      }
    });
  };

  // Quota progress calculation
  const quotaPercent = Math.min(100, Math.round((metrics.usedEventsThisMonth / metrics.totalAllowedEvents) * 100));

  return (
    <div className="space-y-8">
      {/* ── Status Flash Feedback ── */}
      {message && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 border text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
              : "border-red-500/40 bg-red-950/40 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div>{message.text}</div>
        </div>
      )}

      {/* ── Locked / Expired Paywall Alert ── */}
      {isExpired && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/80 bg-gradient-to-br from-red-950/90 via-[#180404]/95 to-black p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] backdrop-blur-2xl">
          <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-red-500/50 bg-red-900/40 p-3.5 shadow-lg shadow-red-900/50">
                <Lock className="h-8 w-8 text-red-400 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/60 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-red-400 mb-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span>Subscription Expired & Operations Locked</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                  Plan Expired on {new Date(sub.endDate).toLocaleDateString()}
                </h2>
                <p className="mt-1 text-sm text-gray-300 max-w-2xl leading-relaxed">
                  Your federation administrative powers (event creation, live platform scoring, referee switchboard) are locked.
                  To restore instant access, please make the subscription payment to the platform owner and submit the verification request below.
                </p>
              </div>
            </div>

            <a
              href="#reactivation-portal"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-gym-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:scale-105 transition-all shrink-0"
            >
              <span>Renew & Reactivate Now</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* ── Pending Approval Alert ── */}
      {isPendingApproval && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/60 bg-gradient-to-br from-amber-950/60 via-[#180e03]/80 to-black p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/60 p-3.5">
              <Clock className="h-7 w-7 text-amber-400 animate-spin" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/80 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 mb-2">
                <span>Awaiting Platform Owner Approval</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Reactivation Verification in Progress (UTR: {sub.paymentUtr || "Submitted"})
              </h3>
              <p className="mt-1 text-sm text-gray-300">
                Your payment confirmation has been transmitted directly to the platform owner. Once verified, your administrative powers will be restored immediately.
              </p>
              
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={`https://wa.me/919876543210?text=Hello%20Platform%20Owner,%20I%20have%20submitted%20the%20reactivation%20payment%20for%20${encodeURIComponent(sub.organizationName)}%20with%20UTR:%20${encodeURIComponent(sub.paymentUtr || "")}.%20Please%20approve%20my%20access.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all"
                >
                  <WhatsAppIcon className="h-4 w-4 fill-white" />
                  <span>Ping Owner on WhatsApp</span>
                </a>
                <span className="text-xs text-gray-400">Response time typically under 15 minutes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Key Subscription Telemetry Cards (3-Column Grid) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Active Plan & Expiry */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c0804]/90 via-[#0e0302]/95 to-black p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Current Plan</span>
            <span
              className={`rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                isExpired
                  ? "border-red-500/50 bg-red-950/60 text-red-400"
                  : isPendingApproval
                  ? "border-amber-500/50 bg-amber-950/60 text-amber-400"
                  : "border-emerald-500/50 bg-emerald-950/60 text-emerald-400"
              }`}
            >
              {sub.status}
            </span>
          </div>

          <div className="text-2xl font-bold uppercase text-white tracking-tight">
            {PLAN_DETAILS[sub.planType]?.name || sub.planType}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Organization: <span className="text-white font-medium">{sub.organizationName}</span>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <div>
              <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Days Remaining</div>
              <div className="text-lg font-bold text-white font-mono">
                {isExpired ? "0 Days" : `${metrics.daysRemaining} Days`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Valid Till</div>
              <div className="text-xs font-semibold text-gym-primary">
                {new Date(sub.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 4-Events Monthly Quota Meter */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c0804]/90 via-[#0e0302]/95 to-black p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Event Quota</span>
            <span className="text-[10px] font-bold text-gym-primary uppercase tracking-wider">
              {metrics.currentMonthName}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {metrics.usedEventsThisMonth}
            </span>
            <span className="text-sm font-semibold text-gray-400">
              / {metrics.totalAllowedEvents} Events
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Base quota: <strong className="text-white">4 events</strong>
            {metrics.extraCredits > 0 && (
              <span className="text-emerald-400 font-bold ml-1">
                (+{metrics.extraCredits} extra top-up credits)
              </span>
            )}
          </p>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  quotaPercent >= 100
                    ? "bg-red-500"
                    : quotaPercent >= 75
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-gym-primary to-emerald-500"
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 font-mono">
              <span>{metrics.remainingEvents} slots available</span>
              <span>{quotaPercent}% used</span>
            </div>
          </div>

          {/* Top-up Button */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Need &gt; 4 events?</span>
            <button
              type="button"
              onClick={() => setShowTopupModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gym-primary hover:text-white transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Buy Extra Event Slots</span>
            </button>
          </div>
        </div>

        {/* Card 3: Platform Owner Support & Licensing Contact */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c0804]/90 via-[#0e0302]/95 to-black p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">SaaS License & Support</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="text-base font-bold text-white">Platform Owner Helpdesk</div>
          <p className="text-xs text-gray-400 mt-1">
            Manual activations, custom event packages, & invoices are verified by the platform creator.
          </p>

          <div className="mt-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="h-3.5 w-3.5 text-gym-primary shrink-0" />
              <span>Helpline: +91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <CreditCard className="h-3.5 w-3.5 text-gym-primary shrink-0" />
              <span>UPI: <span className="font-mono text-white">powerlifting-saas@upi</span></span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10">
            <a
              href="https://wa.me/919876543210?text=Hi%20Platform%20Owner,%20I%20have%20a%20query%20regarding%20my%20Federation%20SaaS%20Subscription."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 py-2 text-xs font-bold text-white transition-all"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 fill-white" />
              <span>Direct WhatsApp Desk</span>
            </a>
          </div>
        </div>

      </div>

      {/* ── Subscription Plans Showcase (Monthly, 6 Months, Yearly) ── */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402]/90 to-black/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Commercial SaaS Licensing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
            Federation Subscription Tiers
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Every plan includes up to <strong>4 championships per month</strong>. Need to host more? Add-on event credits are available anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(Object.keys(PLAN_DETAILS) as PlanType[]).map((pKey) => {
            const plan = PLAN_DETAILS[pKey];
            const isCurrent = sub.planType === pKey && !isExpired;
            const isSelected = selectedPlan === pKey;

            return (
              <div
                key={pKey}
                onClick={() => setSelectedPlan(pKey)}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all cursor-pointer border ${
                  isSelected
                    ? "border-gym-primary bg-gradient-to-b from-[#2a0b06] to-[#120302] shadow-[0_0_35px_rgba(230,80,27,0.3)] scale-[1.02]"
                    : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
                }`}
              >
                {/* Popular / Best Value Badge */}
                {pKey === "YEARLY" && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-gym-primary px-3.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black shadow-lg">
                    {plan.discount}
                  </div>
                )}
                {pKey === "SIX_MONTH" && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-300">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{plan.duration}</span>
                    {isCurrent && (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold uppercase text-white tracking-tight">{plan.name}</h3>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold text-white font-mono">
                      ₹{plan.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      ₹{plan.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-gym-primary font-bold mt-0.5">{plan.discount}</div>

                  <ul className="mt-6 space-y-3 border-t border-white/10 pt-6 text-xs text-gray-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(pKey);
                      const el = document.getElementById("reactivation-portal");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full rounded-2xl py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                      isSelected
                        ? "bg-gradient-to-r from-gym-primary to-gym-red text-white shadow-gym-primary/30"
                        : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {isCurrent ? "Renew This Tier" : "Select & Reactivate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Reactivation Submission & Platform Owner Verification Desk ── */}
      <div
        id="reactivation-portal"
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a0604]/90 via-[#0d0202]/95 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary mb-3">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Platform Owner Approval Workflow</span>
          </div>
          <h2 className="text-2xl font-bold uppercase text-white tracking-tight">
            Submit Reactivation / Renewal Request
          </h2>
          <p className="mt-1 text-xs text-gray-400 leading-relaxed">
            As per platform governance, account reactivation requires verification by the Platform Owner.
            Please transfer the renewal fee via UPI/Bank, enter the Transaction Reference (UTR) below, and submit.
            Your account will be restored as soon as the owner verifies and approves your request.
          </p>
        </div>

        {/* Payment Transfer Instructions Box */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-black/60 p-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Step 1: Payment Details
            </div>
            <div className="space-y-1.5 text-xs text-gray-300">
              <div>• Account / Org: <strong className="text-white">Powerlifting SaaS Enterprise</strong></div>
              <div>• UPI ID: <strong className="text-gym-primary font-mono">powerlifting-saas@upi</strong></div>
              <div>• Bank: <strong className="text-white">HDFC Bank, Gujarat Central</strong></div>
              <div>• Selected Plan: <strong className="text-emerald-400 uppercase">{PLAN_DETAILS[selectedPlan].name} (₹{PLAN_DETAILS[selectedPlan].price.toLocaleString()})</strong></div>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-5 flex flex-col justify-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Step 2: Instant WhatsApp Verification
            </div>
            <p className="text-xs text-gray-400">
              After submitting the UTR below, send a screenshot on WhatsApp for priority approval within 10 minutes.
            </p>
            <div className="mt-3">
              <a
                href={`https://wa.me/919876543210?text=Hello%20Platform%20Owner,%20I%20am%20renewing%20my%20subscription%20for%20${encodeURIComponent(PLAN_DETAILS[selectedPlan].name)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-bold text-emerald-300 transition-colors"
              >
                <WhatsAppIcon className="h-3.5 w-3.5 fill-emerald-300" />
                <span>Open WhatsApp Desk</span>
              </a>
            </div>
          </div>
        </div>

        {/* Reactivation Form */}
        <form onSubmit={handleRequestReactivation} className="mt-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Renewal Plan Tier
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value as PlanType)}
                className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
              >
                <option value="MONTHLY">Standard Monthly (₹2,999 - 30 Days)</option>
                <option value="SIX_MONTH">Semi-Annual Pro (₹14,999 - 180 Days)</option>
                <option value="YEARLY">Annual Federation Enterprise (₹26,999 - 365 Days)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Organization / Federation Name
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Gujarat State Powerlifting Association"
                className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Payment UTR / Transaction Reference Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={paymentUtr}
                onChange={(e) => setPaymentUtr(e.target.value)}
                placeholder="e.g. 425678912345 or UPI/TXN ID"
                className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-3 text-sm font-mono text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Contact Phone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Optional Remarks / Notes for Platform Owner
            </label>
            <input
              type="text"
              value={reactivationNotes}
              onChange={(e) => setReactivationNotes(e.target.value)}
              placeholder="e.g. Payment completed via Google Pay. Need activation for upcoming state championship."
              className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none"
            />
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-gray-400">
              Approval Status:{" "}
              <strong className={isPendingApproval ? "text-amber-400" : isExpired ? "text-red-400" : "text-emerald-400"}>
                {sub.status}
              </strong>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gym-primary to-gym-red px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Send Reactivation Request to Owner</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Modal: Extra Event Top-Up Modal ── */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-b from-[#1c0804] to-black p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold uppercase text-white tracking-tight">
              Add-On: Extra Event Credits
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Need to organize more than 4 championships this month? Purchase additional event capacity slots:
            </p>

            <form onSubmit={handleTopupCredits} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Select Extra Event Capacity
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { count: 1, price: 999, label: "+1 Meet (₹999)" },
                    { count: 3, price: 2499, label: "+3 Meets (₹2,499)" },
                    { count: 5, price: 3999, label: "+5 Meets (₹3,999)" },
                  ].map((pkg) => (
                    <button
                      key={pkg.count}
                      type="button"
                      onClick={() => setTopupCredits(pkg.count)}
                      className={`rounded-2xl p-3 text-center border text-xs font-bold transition-all ${
                        topupCredits === pkg.count
                          ? "border-gym-primary bg-gym-primary/20 text-white"
                          : "border-white/10 bg-black/40 text-gray-400 hover:text-white"
                      }`}
                    >
                      <div>{pkg.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Payment Reference / UTR
                </label>
                <input
                  type="text"
                  required
                  value={topupUtr}
                  onChange={(e) => setTopupUtr(e.target.value)}
                  placeholder="Enter UPI / Bank UTR"
                  className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTopupModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-gym-primary px-6 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {isPending ? "Submitting..." : `Submit Top-up (+${topupCredits} Slots)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
