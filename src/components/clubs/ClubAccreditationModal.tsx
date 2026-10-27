"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  Dumbbell, 
  Loader2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  User, 
  X 
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { applyClubAccreditationAction, ClubApplicationInput } from "@/actions/club-affiliation.actions";

interface ClubAccreditationModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableStates: string[];
}

export default function ClubAccreditationModal({
  isOpen,
  onClose,
  availableStates,
}: ClubAccreditationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{
    referenceId: string;
    clubName: string;
    state: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState<ClubApplicationInput>({
    clubName: "",
    state: "Maharashtra",
    city: "",
    fullAddress: "",
    headCoach: "",
    coachPhone: "+91 ",
    coachEmail: "",
    platformsCount: 3,
    equipmentSpecs: "IPF Approved Combo Racks with Calibrated Steel Discs",
    currentMembers: 25,
    gstOrRegistration: "",
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await applyClubAccreditationAction(formData);
      if (res.success && res.referenceId) {
        setSuccessData({
          referenceId: res.referenceId,
          clubName: formData.clubName,
          state: formData.state,
        });
        setStep(4);
      } else {
        setErrorMsg(res.message || "Failed to submit application.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gym-primary/30 bg-[#120402] p-6 sm:p-8 text-white shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gym-primary mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Official IPF Club Affiliation Program</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white pr-8">
            Apply for Club Accreditation
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Empower your facility with official charter status, athlete state quota representation, and technical directorate support.
          </p>
        </div>

        {/* Progress Tracker (Steps 1 to 3) */}
        {step < 4 && (
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 text-xs font-bold uppercase tracking-wider">
            <span className={step >= 1 ? "text-gym-primary" : "text-gray-500"}>
              1. Facility Info
            </span>
            <ChevronRight className="h-3 w-3 text-gray-600" />
            <span className={step >= 2 ? "text-gym-primary" : "text-gray-500"}>
              2. Equipment Specs
            </span>
            <ChevronRight className="h-3 w-3 text-gray-600" />
            <span className={step >= 3 ? "text-gym-primary" : "text-gray-500"}>
              3. Coaching & Verification
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Facility Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                Club / Training Gym Name *
              </label>
              <input
                type="text"
                required
                value={formData.clubName}
                onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                placeholder="e.g. Apex Iron Barbell Academy"
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                  Affiliated State Chapter *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
                >
                  {availableStates.map((st) => (
                    <option key={st} value={st} className="bg-black text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                  City / District *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Pune / Bandra"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                Full Physical Address *
              </label>
              <textarea
                rows={2}
                required
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                placeholder="Building name, street, locality, landmark, pincode"
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                Business Registration / GST (Optional)
              </label>
              <input
                type="text"
                value={formData.gstOrRegistration || ""}
                onChange={(e) => setFormData({ ...formData, gstOrRegistration: e.target.value })}
                placeholder="GSTIN / MSME / Sports Society Registration No."
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!formData.clubName || !formData.city || !formData.fullAddress) {
                    setErrorMsg("Please complete all required fields before continuing.");
                    return;
                  }
                  setErrorMsg("");
                  setStep(2);
                }}
                className="flex items-center gap-2 rounded-xl bg-gym-primary px-6 py-3 font-heading text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Next: Equipment Specs</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Equipment Specs */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                  Dedicated Lifting Platforms *
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.platformsCount}
                  onChange={(e) => setFormData({ ...formData, platformsCount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Number of rubber / wood deadlift & squat platforms.</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                  Current Competitive Lifters
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.currentMembers}
                  onChange={(e) => setFormData({ ...formData, currentMembers: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Approximate athletes training for competitions.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                Equipment & Platform Calibrated Details *
              </label>
              <textarea
                rows={3}
                value={formData.equipmentSpecs}
                onChange={(e) => setFormData({ ...formData, equipmentSpecs: e.target.value })}
                placeholder="Mention combo rack brands, calibrated steel discs, competition 20kg/15kg bars, chalk stand availability..."
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs text-gray-300">
              <span className="font-bold text-gym-primary uppercase block text-[11px] mb-1">
                IPF Affiliation Equipment Checklist
              </span>
              Minimum 1 Combo Rack (or heavy squat rack & flat bench), IPF specification 29mm bars, and calibrated or precision weight discs.
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-heading text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 rounded-xl bg-gym-primary px-6 py-3 font-heading text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Next: Coaching Leadership</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Coaching Leadership & Submit */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                Head Coach / Technical Director Name *
              </label>
              <input
                type="text"
                required
                value={formData.headCoach}
                onChange={(e) => setFormData({ ...formData, headCoach: e.target.value })}
                placeholder="e.g. Coach Vikram Singh (Certified Strength Coach)"
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                  Coach WhatsApp / Phone *
                </label>
                <input
                  type="text"
                  required
                  value={formData.coachPhone}
                  onChange={(e) => setFormData({ ...formData, coachPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                  Official Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.coachEmail}
                  onChange={(e) => setFormData({ ...formData, coachEmail: e.target.value })}
                  placeholder="coach@clubdomain.com"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                By submitting, the club declares 100% adherence to the Indian Powerlifting Federation Code of Ethics and zero tolerance for prohibited substances (WADA/NADA).
              </span>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-heading text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-[#ff7a45] px-7 py-3 font-heading text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Transmitting Application...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Submit Affiliation Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && successData && (
          <div className="text-center py-6 animate-in zoom-in-95 duration-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto mb-4 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Application Successfully Registered</span>
            </div>

            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mt-2">
              {successData.clubName}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Affiliated State Chapter: <span className="text-white font-bold">{successData.state}</span>
            </p>

            <div className="my-6 rounded-2xl border border-white/10 bg-black/50 p-4 max-w-sm mx-auto">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Official Reference Tracking ID</div>
              <div className="font-mono text-xl font-bold text-gym-primary mt-1">{successData.referenceId}</div>
            </div>

            <p className="text-xs text-gray-300 max-w-md mx-auto mb-6">
              Your facility application has been logged into the National Technical Directorate registry. The State General Secretary and Technical Committee will review your equipment verification within 48 business hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/917043951377?text=${encodeURIComponent(
                  `Hi National Technical Directorate, I have submitted a Club Affiliation Application for "${successData.clubName}" with Reference ID: ${successData.referenceId}. Looking forward to completing facility verification!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 font-heading text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-105 transition-all"
              >
                <WhatsAppIcon variant="badge" className="h-4 w-4" />
                <span>Notify Secretariat on WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-heading text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors"
              >
                Return to Directory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
