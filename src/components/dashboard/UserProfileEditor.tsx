"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Eye,
  EyeOff,
  Key,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  UserCheck,
  MessageSquare,
  Phone,
  X,
} from "lucide-react";
import {
  updateUserProfileDetailsAction,
  deleteUserPhotoAction,
  sendUserPasswordOtpAction,
  verifyAndChangeUserPasswordAction,
  submitAccountDeletionRequestAction,
  cancelAccountDeletionRequestAction,
} from "@/actions/user-profile.actions";

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  phone?: string;
  coachPhone?: string;
  coachName?: string;
  gender: string;
  weightClass: string;
  createdAt: string;
  activeMembership: {
    cardNumber: string;
    planType: string;
    status: string;
    endDate: string;
  } | null;
  deletionRequest: {
    id: string;
    status: string;
    reason: string;
    createdAt: string;
  } | null;
}

interface UserProfileEditorProps {
  initialData: UserProfileData;
}

// Synthesized audio feedback
function playSuccessChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch {}
}

const WEIGHT_CLASSES = [
  { value: "WC_47", label: "47 kg Class (Women)" },
  { value: "WC_52", label: "52 kg Class (Women)" },
  { value: "WC_57", label: "57 kg Class (Women)" },
  { value: "WC_59", label: "59 kg Class (Men)" },
  { value: "WC_63", label: "63 kg Class (Women)" },
  { value: "WC_66", label: "66 kg Class (Men)" },
  { value: "WC_69", label: "69 kg Class (Women)" },
  { value: "WC_74", label: "74 kg Class (Men)" },
  { value: "WC_76", label: "76 kg Class (Women)" },
  { value: "WC_83", label: "83 kg Class (Men)" },
  { value: "WC_84", label: "84 kg Class (Women)" },
  { value: "WC_84_PLUS", label: "84+ kg Class (Women)" },
  { value: "WC_93", label: "93 kg Class (Men)" },
  { value: "WC_105", label: "105 kg Class (Men)" },
  { value: "WC_120", label: "120 kg Class (Men)" },
  { value: "WC_120_PLUS", label: "120+ kg Class (Men)" },
];

export default function UserProfileEditor({ initialData }: UserProfileEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"details" | "password" | "deletion">("details");

  // Profile States
  const [name, setName] = useState(initialData.name);
  const [phone, setPhone] = useState(initialData.phone || "");
  const [coachPhone, setCoachPhone] = useState(initialData.coachPhone || "");
  const [coachName, setCoachName] = useState(initialData.coachName || "");
  const [gender, setGender] = useState(initialData.gender);
  const [weightClass, setWeightClass] = useState(initialData.weightClass);
  const [image, setImage] = useState<string | null>(initialData.image);
  const [deletionRequest, setDeletionRequest] = useState(initialData.deletionRequest);

  // Action Spinners
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // OTP Modal States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(600);

  // Deletion Request States
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionPassword, setDeletionPassword] = useState("");
  const [isSubmittingDeletion, setIsSubmittingDeletion] = useState(false);
  const [isCancellingDeletion, setIsCancellingDeletion] = useState(false);

  // Notifications
  const [bannerNotice, setBannerNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [celebrationModal, setCelebrationModal] = useState<{ title: string; subtitle: string } | null>(null);

  // Timers
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpModalOpen && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpModalOpen, resendCooldown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpModalOpen && otpExpirySeconds > 0) {
      timer = setInterval(() => {
        setOtpExpirySeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpModalOpen, otpExpirySeconds]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 1. Photo Upload Handler
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setBannerNotice({ type: "error", text: "Selected photo exceeds 5MB limit. Please choose a smaller image." });
      return;
    }

    setIsUploadingPhoto(true);
    setBannerNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload photo.");
      }

      setImage(data.fileUrl);
      playSuccessChime();
      setCelebrationModal({
        title: "Photo Updated Successfully",
        subtitle: "Your athlete avatar is now live across the platform.",
      });
      router.refresh();
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to upload photo." });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 2. Photo Delete Handler
  const handleDeletePhoto = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;

    setIsDeletingPhoto(true);
    setBannerNotice(null);

    try {
      const res = await deleteUserPhotoAction();
      if (!res.success) throw new Error(res.error);

      setImage(null);
      playSuccessChime();
      setCelebrationModal({
        title: "Photo Removed",
        subtitle: "Your profile picture has been reset to default badge.",
      });
      router.refresh();
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to remove photo." });
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  // 3. Save Profile Details
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setBannerNotice(null);

    try {
      const res = await updateUserProfileDetailsAction({
        name,
        gender,
        weightClass,
        phone,
        coachPhone,
        coachName,
      });
      if (!res.success) throw new Error(res.error);

      playSuccessChime();
      setCelebrationModal({
        title: "Profile Updated",
        subtitle: "Your athlete details and lifting class have been saved.",
      });
      router.refresh();
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to save profile." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 4. Request Password Change OTP
  const handleRequestPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      setBannerNotice({ type: "error", text: "Please enter your current account password." });
      return;
    }

    if (!newPassword || newPassword.length < 12) {
      setBannerNotice({ type: "error", text: "New password must be at least 12 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setBannerNotice({ type: "error", text: "New password and confirmation password do not match." });
      return;
    }

    if (newPassword === currentPassword) {
      setBannerNotice({ type: "error", text: "New password cannot be identical to current password." });
      return;
    }

    setIsSendingOtp(true);
    setBannerNotice(null);

    try {
      const res = await sendUserPasswordOtpAction({ currentPassword });
      if (!res.success) throw new Error(res.error);

      setResendCooldown(60);
      setOtpExpirySeconds(600);
      setOtpCode("");

      setIsOtpModalOpen(true);
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to dispatch verification OTP." });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 5. Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    setBannerNotice(null);

    try {
      const res = await sendUserPasswordOtpAction({ currentPassword });
      if (!res.success) throw new Error(res.error);

      setResendCooldown(60);
      setOtpExpirySeconds(600);
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to resend OTP." });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 6. Verify OTP & Finalize Password Change
  const handleVerifyOtpAndUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      setBannerNotice({ type: "error", text: "Please enter the full 6-digit OTP code." });
      return;
    }

    setIsVerifyingOtp(true);
    setBannerNotice(null);

    try {
      const res = await verifyAndChangeUserPasswordAction({
        currentPassword,
        newPassword,
        otp: otpCode,
      });

      if (!res.success) throw new Error(res.error);

      setIsOtpModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpCode("");

      playSuccessChime();
      setCelebrationModal({
        title: "Password Changed Successfully",
        subtitle: "Your credentials have been securely verified and updated with OTP protection.",
      });
      router.refresh();
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Password update failed." });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 7. Submit Account Deletion Request
  const handleSubmitDeletionRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deletionPassword) {
      setBannerNotice({ type: "error", text: "Current password is required to verify your identity." });
      return;
    }

    setIsSubmittingDeletion(true);
    setBannerNotice(null);

    try {
      const res = await submitAccountDeletionRequestAction({
        currentPassword: deletionPassword,
        reason: deletionReason,
      });

      if (!res.success) throw new Error(res.error);

      setDeletionRequest({
        id: "temp-id",
        status: "PENDING",
        reason: deletionReason,
        createdAt: new Date().toISOString(),
      });
      setDeletionPassword("");
      setDeletionReason("");

      playSuccessChime();
      setCelebrationModal({
        title: "Deletion Request Submitted",
        subtitle: "Your request has been queued for Administrator review and permanent deletion.",
      });
      router.refresh();
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to submit deletion request." });
    } finally {
      setIsSubmittingDeletion(false);
    }
  };

  // 8. Cancel Account Deletion Request
  const handleCancelDeletionRequest = async () => {
    if (!confirm("Do you want to cancel your account deletion request and keep your athlete account active?")) {
      return;
    }

    setIsCancellingDeletion(true);
    setBannerNotice(null);

    try {
      const res = await cancelAccountDeletionRequestAction();
      if (!res.success) throw new Error(res.error);

      setDeletionRequest(null);
      playSuccessChime();
      setCelebrationModal({
        title: "Deletion Request Cancelled",
        subtitle: "Your athlete account remains active and in good standing.",
      });
      router.refresh();
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to cancel deletion request." });
    } finally {
      setIsCancellingDeletion(false);
    }
  };

  // Password strength
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: "Empty", color: "bg-gray-700" };
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (pw.length >= 10) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Strong", color: "bg-amber-500" };
    return { score, label: "Maximum Security", color: "bg-emerald-500" };
  };

  const pwStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-[#080201] text-white px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        {/* ── Top Navigation ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gym-primary transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Athlete Headquarters</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gym-primary bg-gym-primary/10 border border-gym-primary/30 px-3 py-1 rounded-full">
              Athlete Profile & Security
            </span>
          </div>
        </div>

        {/* ── Global Alert Banner ── */}
        <AnimatePresence>
          {bannerNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 flex items-center justify-between gap-3 rounded-2xl p-4 border text-sm font-medium ${
                bannerNotice.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/40 border-red-500/40 text-red-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {bannerNotice.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                )}
                <span>{bannerNotice.text}</span>
              </div>
              <button
                onClick={() => setBannerNotice(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pending Deletion Notice Banner ── */}
        {deletionRequest && deletionRequest.status === "PENDING" && (
          <div className="mb-6 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-[#180e03] to-[#120802] p-5 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold uppercase text-amber-300">
                  Account Deletion Request Pending Admin Review
                </h4>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                  You submitted a request to permanently delete this athlete account on{" "}
                  <strong suppressHydrationWarning>{new Date(deletionRequest.createdAt).toLocaleDateString()}</strong>. An Administrator will
                  review and approve your request.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelDeletionRequest}
              disabled={isCancellingDeletion}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500 hover:text-black transition-all shrink-0"
            >
              {isCancellingDeletion ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Withdraw Request</span>
              )}
            </button>
          </div>
        )}

        {/* ── Hero Identity Card ── */}
        <div className="mb-10 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#180503] via-[#100302] to-[#0a0201] p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-gym-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Photo Frame */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full overflow-hidden border-4 border-gym-primary/50 shadow-[0_0_30px_rgba(230,80,27,0.3)] bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
                  {image ? (
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 144px, 160px"
                      priority
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gym-primary">
                      <span className="font-heading text-4xl font-bold">
                        {(name || "A").charAt(0).toUpperCase()}
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mt-1">
                        ATHLETE
                      </span>
                    </div>
                  )}

                  {(isUploadingPhoto || isDeletingPhoto) && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-gym-primary">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Processing</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto || isDeletingPhoto}
                  className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-gym-primary text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-black"
                  title="Upload New Photo"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
              />

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto || isDeletingPhoto}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gym-primary/40 bg-gym-primary/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white transition-all"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{image ? "Change Photo" : "Upload Photo"}</span>
                </button>

                {image && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    disabled={isUploadingPhoto || isDeletingPhoto}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <span className="text-[10px] text-gray-500">JPG, PNG, WEBP (Max 5MB)</span>
            </div>

            {/* Profile Overview */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-gym-primary mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Affiliated Athlete Profile</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
                {name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Mail className="h-3.5 w-3.5 text-gym-primary" />
                  <span>{initialData.email}</span>
                </span>
                <span className="h-1 w-1 rounded-full bg-gray-600 hidden sm:inline-block" />
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>OTP Protected</span>
                </span>
              </div>

              {/* Badges Grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Class</span>
                  <span className="text-xs font-black text-gym-primary">{weightClass.replace("WC_", "")} KG</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Gender</span>
                  <span className="text-xs font-black text-white">{gender}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Federation ID</span>
                  <span className="text-xs font-black text-gray-300">
                    {initialData.activeMembership ? initialData.activeMembership.cardNumber : "PENDING"}
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Status</span>
                  <span className="text-xs font-black text-emerald-400">
                    {initialData.activeMembership ? "ACTIVE LIFTER" : "REGISTERED"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="mb-8 flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "details"
                ? "bg-gym-primary text-white shadow-[0_0_20px_rgba(230,80,27,0.4)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <User className="h-4 w-4" />
            <span>1. Profile Details & Photo</span>
          </button>

          <button
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "password"
                ? "bg-gym-primary text-white shadow-[0_0_20px_rgba(230,80,27,0.4)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>2. Password & OTP Security</span>
          </button>

          <button
            onClick={() => setActiveTab("deletion")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "deletion"
                ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>3. Account Deletion Request</span>
          </button>
        </div>

        {/* ── TAB 1: Profile Details ── */}
        {activeTab === "details" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-[#120302] p-6 sm:p-8 shadow-xl"
          >
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold uppercase text-white">Athlete Details & Category</h2>
              <p className="text-xs text-gray-400 mt-1">
                Keep your official athlete name and competitive lifting category updated for meet entries.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Athlete Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Rahul Verma"
                      className="w-full rounded-2xl border border-white/15 bg-black/60 pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none focus:ring-1 focus:ring-gym-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="email"
                      value={initialData.email}
                      disabled
                      className="w-full rounded-2xl border border-white/10 bg-zinc-900/60 pl-11 pr-4 py-3.5 text-sm text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">Primary athlete communication address</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Gender Category
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-3.5 text-sm text-white focus:border-gym-primary focus:outline-none focus:ring-1 focus:ring-gym-primary transition-all"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    IPF Weight Class Category
                  </label>
                  <select
                    value={weightClass}
                    onChange={(e) => setWeightClass(e.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-3.5 text-sm text-white focus:border-gym-primary focus:outline-none focus:ring-1 focus:ring-gym-primary transition-all"
                  >
                    {WEIGHT_CLASSES.map((wc) => (
                      <option key={wc.value} value={wc.value}>
                        {wc.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* WhatsApp Live Queue Alerts & Coach Contact */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-500/20">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-white tracking-wider">
                      WhatsApp Live Queue Alerts & Coach Staging
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Enables real-time WhatsApp alerts during meets (&quot;In The Hole ~1.5m&quot;, &quot;Now On Platform&quot;).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Athlete Mobile (WhatsApp)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full rounded-xl border border-white/15 bg-black/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none transition-all font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">With country code (e.g. +91)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Coach Name (Optional)
                    </label>
                    <div className="relative">
                      <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                      <input
                        type="text"
                        value={coachName}
                        onChange={(e) => setCoachName(e.target.value)}
                        placeholder="Coach Rahul Sharma"
                        className="w-full rounded-xl border border-white/15 bg-black/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-all"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">Accompanying warm-up coach</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Coach Mobile (WhatsApp)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                      <input
                        type="text"
                        value={coachPhone}
                        onChange={(e) => setCoachPhone(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full rounded-xl border border-white/15 bg-black/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-all font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">Receives duplicate staging pings</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-8 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(230,80,27,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdatingProfile ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── TAB 2: Password Change with OTP ── */}
        {activeTab === "password" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-[#120302] p-6 sm:p-8 shadow-xl"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gym-primary/15 text-gym-primary border border-gym-primary/30 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold uppercase text-white">
                  Multi-Factor OTP Password Security
                </h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Changing your password requires entering your existing password and confirming a 6-digit
                  verification code sent to your registered email address.
                </p>
              </div>
            </div>

            <form onSubmit={handleRequestPasswordOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter existing password"
                    className="w-full rounded-2xl border border-white/15 bg-black/60 pl-11 pr-12 py-3.5 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none focus:ring-1 focus:ring-gym-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-2xl border border-white/15 bg-black/60 pl-11 pr-12 py-3.5 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none focus:ring-1 focus:ring-gym-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                        <span className="text-gray-400">Strength:</span>
                        <span className="text-white">{pwStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full ${pwStrength.color} transition-all duration-300`}
                          style={{ width: `${(pwStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-type new password"
                      className="w-full rounded-2xl border border-white/15 bg-black/60 pl-11 pr-12 py-3.5 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none focus:ring-1 focus:ring-gym-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                      {newPassword === confirmPassword ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <Check className="h-3.5 w-3.5" /> Passwords Match
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <X className="h-3.5 w-3.5" /> Passwords Do Not Match
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(230,80,27,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Request Security OTP & Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── TAB 3: Account Deletion Request ── */}
        {activeTab === "deletion" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-red-500/30 bg-gradient-to-b from-[#180302] to-[#0d0101] p-6 sm:p-8 shadow-xl"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-500 border border-red-500/30 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold uppercase text-red-400">
                  Account Deletion Request Desk
                </h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Federation policy mandates that account deletion is a moderated administrative procedure to prevent
                  accidental data loss of your competitive sanction records and Wilks rankings. Submitting this form sends
                  an authorization request directly to the Federation Administrator desk.
                </p>
              </div>
            </div>

            {deletionRequest && deletionRequest.status === "PENDING" ? (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-3">
                  <Clock className="h-6 w-6 animate-pulse" />
                </div>
                <h3 className="font-heading text-lg font-bold uppercase text-amber-300">
                  Your Deletion Request is Under Review
                </h3>
                <p className="text-xs text-gray-300 max-w-lg mx-auto mt-1 leading-relaxed">
                  Submitted on <span suppressHydrationWarning>{new Date(deletionRequest.createdAt).toLocaleDateString()}</span>. Once approved by an
                  Administrator, your account and historical records will be permanently removed.
                </p>
                {deletionRequest.reason && (
                  <p className="text-[11px] text-gray-400 mt-2 italic bg-black/40 p-2.5 rounded-xl max-w-md mx-auto">
                    Reason: &ldquo;{deletionRequest.reason}&rdquo;
                  </p>
                )}

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCancelDeletionRequest}
                    disabled={isCancellingDeletion}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-500/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-200 hover:bg-amber-500 hover:text-black transition-all"
                  >
                    {isCancellingDeletion ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Withdrawing...</span>
                      </>
                    ) : (
                      <span>Cancel Deletion Request</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitDeletionRequest} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Reason for Leaving / Deletion Request (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    placeholder="e.g. Taking a break from competitive powerlifting / registered with another club..."
                    className="w-full rounded-2xl border border-red-500/30 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Verify Current Password
                  </label>
                  <input
                    type="password"
                    value={deletionPassword}
                    onChange={(e) => setDeletionPassword(e.target.value)}
                    required
                    placeholder="Enter password to authorize request"
                    className="w-full rounded-2xl border border-red-500/30 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingDeletion || !deletionPassword}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 transition-all disabled:opacity-40"
                  >
                    {isSubmittingDeletion ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        <span>Send Account Deletion Request to Admin</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* ── OTP Verification Modal ── */}
        <AnimatePresence>
          {isOtpModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-lg rounded-3xl border border-gym-primary/40 bg-gradient-to-b from-[#1c0603] via-[#120302] to-[#080201] p-6 sm:p-8 shadow-[0_0_50px_rgba(230,80,27,0.35)]"
              >
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gym-primary/15 text-gym-primary border border-gym-primary/30 shadow-[0_0_20px_rgba(230,80,27,0.3)] mb-4">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold uppercase text-white">
                    Enter Verification OTP
                  </h3>
                  <p className="text-xs text-gray-300 mt-2">
                    A 6-digit security code was dispatched to:
                    <br />
                    <strong className="text-white font-mono text-sm">{initialData.email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpAndUpdatePassword} className="space-y-6">
                  <div>
                    <label className="block text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                      6-Digit Authorization Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      autoFocus
                      className="w-full text-center rounded-2xl border-2 border-gym-primary/50 bg-black/80 py-4 text-3xl font-bold tracking-[12px] text-white focus:border-gym-primary focus:outline-none focus:ring-2 focus:ring-gym-primary/50 font-mono transition-all shadow-inner"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-b border-white/10 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gym-primary" />
                      <span>Expires in:</span>
                      <span className={`font-mono font-bold ${otpExpirySeconds < 30 ? "text-red-400" : "text-white"}`}>
                        {formatTimer(otpExpirySeconds)}
                      </span>
                    </div>

                    <div>
                      {resendCooldown > 0 ? (
                        <span className="text-gray-400">Resend in {resendCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isSendingOtp}
                          className="inline-flex items-center gap-1 text-gym-primary hover:text-white font-bold transition-colors"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
                          <span>Resend Code</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={isVerifyingOtp || otpCode.length !== 6 || otpExpirySeconds === 0}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red py-4 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(230,80,27,0.5)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Authorizing...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Verify OTP & Update Password</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsOtpModalOpen(false)}
                      className="w-full py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── Celebration Popup Modal ── */}
        <AnimatePresence>
          {celebrationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md rounded-3xl border border-emerald-500/50 bg-gradient-to-b from-[#0a1e12] via-[#051009] to-[#020503] p-8 text-center shadow-[0_0_60px_rgba(16,185,129,0.35)]"
              >
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.4)] mb-5">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <h3 className="font-heading text-2xl font-bold uppercase text-white mb-2">
                  {celebrationModal.title}
                </h3>
                <p className="text-xs text-emerald-200/80 leading-relaxed mb-6">
                  {celebrationModal.subtitle}
                </p>

                <button
                  type="button"
                  onClick={() => setCelebrationModal(null)}
                  className="w-full rounded-full bg-emerald-500 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:bg-emerald-400 active:scale-95 transition-all"
                >
                  Return to Profile
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
