"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  Clock,
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
  X,
  AlertTriangle,
} from "lucide-react";
import {
  updateAdminProfileAction,
  deleteAdminPhotoAction,
  sendAdminPasswordOtpAction,
  verifyAndChangeAdminPasswordAction,
  deleteAdminAccountAction,
} from "@/actions/profile.actions";
import { signOut } from "next-auth/react";
import { PageNavigation } from "@/components/ui/PageNavigation";

interface AdminProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminProfileEditorProps {
  initialData: AdminProfileData;
}

// Web Audio API chime helper for celebration feedback
function playSuccessChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    // Note 1: E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Note 2: G#5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(830.61, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);

    // Note 3: B5
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.frequency.setValueAtTime(987.77, now + 0.24);
    gain3.gain.setValueAtTime(0.25, now + 0.24);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.24);
    osc3.stop(now + 0.7);
  } catch {
    // Ignore audio failures if browser restricts audio context
  }
}

export default function AdminProfileEditor({ initialData }: AdminProfileEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab: 'details' | 'password' | 'danger'
  const [activeTab, setActiveTab] = useState<"details" | "password" | "danger">("details");

  // Profile Form States
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [image, setImage] = useState<string | null>(initialData.image);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  // Password Change Form States
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

  // Danger Zone States
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Global Alert / Modal States
  const [bannerNotice, setBannerNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [celebrationModal, setCelebrationModal] = useState<{ title: string; subtitle: string } | null>(null);

  // Resend Cooldown and Expiry Timers
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

  // Format MM:SS
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
      setBannerNotice({ type: "error", text: "Selected image exceeds 5MB limit. Please choose a smaller image." });
      return;
    }

    setIsUploadingPhoto(true);
    setBannerNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload avatar.");
      }

      setImage(data.fileUrl);
      playSuccessChime();
      setCelebrationModal({
        title: "Photo Updated Successfully",
        subtitle: "Your Supreme Administrator avatar is now live across the platform.",
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
    if (!confirm("Are you sure you want to delete your profile photo and reset to the default emblem?")) {
      return;
    }

    setIsDeletingPhoto(true);
    setBannerNotice(null);

    try {
      const res = await deleteAdminPhotoAction();
      if (!res.success) {
        throw new Error(res.error);
      }

      setImage(null);
      playSuccessChime();
      setCelebrationModal({
        title: "Photo Removed",
        subtitle: "Profile photo deleted. Default Federation emblem restored.",
      });
      router.refresh();
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to remove photo." });
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  // 3. Update Profile Details Handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setBannerNotice(null);

    try {
      const res = await updateAdminProfileAction({ name, email });
      if (!res.success) {
        throw new Error(res.error);
      }

      playSuccessChime();
      setCelebrationModal({
        title: "Profile Saved Successfully",
        subtitle: "Administrative credentials and display parameters updated.",
      });
      router.refresh();
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to save profile changes." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 4. Request Password Change OTP
  const handleRequestPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      setBannerNotice({ type: "error", text: "Please enter your current administrator password." });
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
      setBannerNotice({ type: "error", text: "New password cannot be identical to the current password." });
      return;
    }

    setIsSendingOtp(true);
    setBannerNotice(null);

    try {
      const res = await sendAdminPasswordOtpAction({ currentPassword });
      if (!res.success) {
        throw new Error(res.error);
      }

      setResendCooldown(60);
      setOtpExpirySeconds(600);
      setOtpCode("");

      setIsOtpModalOpen(true);
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Could not dispatch verification OTP." });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 5. Resend Password OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    setBannerNotice(null);

    try {
      const res = await sendAdminPasswordOtpAction({ currentPassword });
      if (!res.success) {
        throw new Error(res.error);
      }

      setResendCooldown(60);
      setOtpExpirySeconds(600);
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to resend OTP." });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 6. Verify OTP and Finalize Password Update
  const handleVerifyOtpAndUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      setBannerNotice({ type: "error", text: "Please enter the complete 6-digit security OTP code." });
      return;
    }

    setIsVerifyingOtp(true);
    setBannerNotice(null);

    try {
      const res = await verifyAndChangeAdminPasswordAction({
        currentPassword,
        newPassword,
        otp: otpCode,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      setIsOtpModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpCode("");

      playSuccessChime();
      setCelebrationModal({
        title: "Master Password Updated!",
        subtitle: "Your credentials have been securely re-hashed and verified with dual-factor OTP.",
      });
      router.refresh();
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Password update verification failed." });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 7. Delete Admin Account Handler
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteConfirmation !== "DELETE MY ADMIN ACCOUNT") {
      setBannerNotice({
        type: "error",
        text: "Please type the exact confirmation phrase: 'DELETE MY ADMIN ACCOUNT'",
      });
      return;
    }

    if (!deletePassword) {
      setBannerNotice({ type: "error", text: "Master password is required to authorize account deletion." });
      return;
    }

    setIsDeletingAccount(true);
    setBannerNotice(null);

    try {
      const res = await deleteAdminAccountAction({
        confirmationText: deleteConfirmation,
        password: deletePassword,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      alert("Admin account has been permanently removed. Redirecting to home page...");
      await signOut({ callbackUrl: "/" });
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to delete account." });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Password strength calculation
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
    <div className="min-h-screen bg-[#080201] text-white px-4 pt-32 sm:pt-36 lg:pt-40 pb-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        {/* ── Top Navigation Bar ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <PageNavigation
            backHref="/admin"
            backLabel="Back to Command Center"
            breadcrumbs={[
              { label: "Admin Hub", href: "/admin" },
              { label: "Admin Profile & Security" },
            ]}
            className="mb-0"
          />

          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              Session Authenticated (Role: ADMIN)
            </span>
          </div>
        </div>

        {/* ── Banner Alerts ── */}
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

        {/* ── Hero Identity Header Card ── */}
        <div className="mb-10 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#180503] via-[#100302] to-[#0a0201] p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-gym-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar & Photo Actions */}
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
                    <div className="flex flex-col items-center justify-center text-gym-primary/80">
                      <Shield className="h-16 w-16" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-1">
                        IPF ADMIN
                      </span>
                    </div>
                  )}

                  {/* Loading Spinner Overlay */}
                  {(isUploadingPhoto || isDeletingPhoto) && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-gym-primary">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Processing</span>
                    </div>
                  )}
                </div>

                {/* Quick Camera Icon Button */}
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

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
              />

              {/* Avatar Action Buttons */}
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

              <span className="text-[10px] text-gray-400">JPG, PNG, WEBP (Max 5MB)</span>
            </div>

            {/* Profile Overview Details */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-gym-primary mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Executive Command Tier</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
                {name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Mail className="h-3.5 w-3.5 text-gym-primary" />
                  <span>{email}</span>
                </span>
                <span className="h-1 w-1 rounded-full bg-gray-600 hidden sm:inline-block" />
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Multi-Factor OTP Guard Active</span>
                </span>
              </div>

              <p className="mt-4 text-xs text-gray-400 max-w-2xl leading-relaxed">
                Supreme Administrative Profile. You possess unilateral executive authority to manage championship meets,
                accreditations, document releases, and platform access. Keep your master security credentials protected.
              </p>

              {/* Badges Grid */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Role</span>
                  <span className="text-xs font-black text-white">{initialData.role}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Status</span>
                  <span className="text-xs font-black text-emerald-400">ACTIVE MASTER</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Joined</span>
                  <span className="text-xs font-black text-gray-300">
                    {new Date(initialData.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Security</span>
                  <span className="text-xs font-black text-gym-primary">DUAL-FACTOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
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
            <span>1. Admin Details & Photo</span>
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
            onClick={() => setActiveTab("danger")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "danger"
                ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>3. Danger Zone</span>
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
              <h2 className="font-heading text-xl font-bold uppercase text-white">Administrative Identity</h2>
              <p className="text-xs text-gray-400 mt-1">
                Update the official name and email address associated with your administrator account.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Administrator Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Administrator Patel"
                      className="w-full rounded-2xl border border-white/15 bg-black/60 pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none focus:ring-1 focus:ring-gym-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Official Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@federation.org"
                      className="w-full rounded-2xl border border-white/15 bg-black/60 pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none focus:ring-1 focus:ring-gym-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-white block">Federation Supreme Role</span>
                  <span className="text-[11px] text-gray-400">
                    Highest platform clearance: Cannot be demoted from profile editor.
                  </span>
                </div>
                <span className="rounded-full bg-gym-primary/15 border border-gym-primary/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary">
                  SUPREME ADMIN
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
                  To safeguard the Federation against unauthorized takeover, changing your administrator password
                  requires verifying your current master password and approving a cryptographic 6-digit OTP sent
                  directly to your registered email.
                </p>
              </div>
            </div>

            <form onSubmit={handleRequestPasswordOtp} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Current Master Password
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

              {/* New Password & Confirmation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    New Master Password
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

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                        <span className="text-gray-400">Strength Rating:</span>
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
                    Confirm New Master Password
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

              {/* Security Notice Box */}
              <div className="rounded-2xl border border-gym-primary/30 bg-gym-primary/5 p-4 text-xs text-gray-300 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-gym-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Dual-Factor Email Verification Notice</span>
                  Clicking the button below will immediately dispatch a 6-digit authorization OTP to{" "}
                  <strong className="text-white">{email}</strong>. You will be prompted to enter that code before the
                  password update is finalized.
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
                      <span>Dispatching Security OTP...</span>
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

        {/* ── TAB 3: Danger Zone ── */}
        {activeTab === "danger" && (
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
                  Danger Zone: Account Deletion
                </h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Permanently erase this administrator account and all associated access privileges. This action cannot
                  be undone. If you are the sole administrator, deletion will be blocked by system safety guards to
                  prevent platform lockout.
                </p>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Confirm Phrase
                </label>
                <p className="text-[11px] text-gray-400 mb-2">
                  Type <strong className="text-red-400 select-all">DELETE MY ADMIN ACCOUNT</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE MY ADMIN ACCOUNT"
                  className="w-full rounded-2xl border border-red-500/30 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Administrator Master Password
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter current password to authorize deletion"
                  className="w-full rounded-2xl border border-red-500/30 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    isDeletingAccount ||
                    deleteConfirmation !== "DELETE MY ADMIN ACCOUNT" ||
                    !deletePassword
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isDeletingAccount ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Permanently Delete Admin Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── POPUP MODAL 1: OTP Verification Modal ── */}
        <AnimatePresence>
          {isOtpModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-lg rounded-3xl border border-gym-primary/40 bg-gradient-to-b from-[#1c0603] via-[#120302] to-[#080201] p-6 sm:p-8 shadow-[0_0_50px_rgba(230,80,27,0.35)]"
              >
                {/* Close Button */}
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
                    <strong className="text-white font-mono text-sm">{email}</strong>
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

                  {/* Timer Displays */}
                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-b border-white/10 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gym-primary" />
                      <span>Code Expiry:</span>
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
                          <span>Resend OTP Code</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={isVerifyingOtp || otpCode.length !== 6 || otpExpirySeconds === 0}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red py-4 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(230,80,27,0.5)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Authorizing Credentials...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Verify OTP & Finalize Password Change</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsOtpModalOpen(false)}
                      className="w-full py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel Authorization
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── POPUP MODAL 2: Celebration Modal ── */}
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
                  Return to Dashboard
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
