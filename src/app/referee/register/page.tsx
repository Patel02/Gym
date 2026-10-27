"use client";

import { useState, useEffect } from "react";
import {
  sendRegistrationOtp,
  verifyAndRegisterReferee,
  validateRefereeInviteCode,
} from "@/actions/auth.actions";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Loader2,
  Mail,
  CheckCircle,
  RefreshCw,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  AlertTriangle,
} from "lucide-react";

export default function RefereeRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");

  // Timers
  const [resendCooldown, setResendCooldown] = useState(60);
  const [totalValidity, setTotalValidity] = useState(600);

  useEffect(() => {
    if (step !== 2) return;
    const timer = setInterval(() => {
      setResendCooldown((p) => (p > 0 ? p - 1 : 0));
      setTotalValidity((p) => (p > 0 ? p - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validate invite code before triggering OTP
    try {
      const codeCheck = await validateRefereeInviteCode(inviteCode);
      if (!codeCheck.isValid) {
        setMessage({
          type: "error",
          text: "Invalid Federation Invite Code. Contact the WPI Gujarat secretary.",
        });
        setLoading(false);
        return;
      }
    } catch {
      setMessage({ type: "error", text: "Failed to validate invite code." });
      setLoading(false);
      return;
    }

    try {
      const res = await sendRegistrationOtp(email);
      if (res.success) {
        setStep(2);
        setResendCooldown(60);
        setTotalValidity(600);
        setMessage({ type: "success", text: res.message || "Verification OTP sent to your email." });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to send OTP." });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await sendRegistrationOtp(email);
      if (res.success) {
        setResendCooldown(60);
        setTotalValidity(600);
        setOtp("");
        setMessage({ type: "success", text: res.message || "Fresh OTP dispatched." });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to resend OTP." });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setResendLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await verifyAndRegisterReferee({ name, email, password, otp, inviteCode });
      if (res.success) {
        setMessage({ type: "success", text: res.message || "Account created! Redirecting to login..." });
        setTimeout(() => router.push("/referee/login?registered=true"), 1500);
      } else {
        setMessage({ type: "error", text: res.error || "Registration failed." });
        setLoading(false);
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080201] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gym-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-red-900/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-gym-primary/70 shadow-[0_0_30px_rgba(230,80,27,0.4)] bg-black mb-4">
            <Image src="/images/wpi-logo-transparent.png" alt="WPI Gujarat" fill className="object-contain" />
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gym-primary">
            WPI Association of Gujarat
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0f0603] to-[#080201] shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-gym-primary via-red-500 to-gym-primary" />

          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <div className="absolute -inset-2 rounded-xl bg-gym-primary/20 blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gym-primary/10 border border-gym-primary/30 text-gym-primary">
                  <Shield className="h-6 w-6 fill-gym-primary/20" />
                </div>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
                Referee <span className="text-gym-primary">Registration</span>
              </h1>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                {step === 1
                  ? "Official Technical Official Accreditation"
                  : "Enter the 6-digit OTP sent to your email"}
              </p>
            </div>

            {/* Security notice */}
            {step === 1 && (
              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-3.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  A <span className="font-bold text-amber-400">Federation Invite Code</span> is required. Contact the WPI Gujarat Secretary or your meet director to receive this code.
                </p>
              </div>
            )}

            {/* Message banner */}
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-xl text-xs font-bold uppercase tracking-wider text-center border ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Step 1: Details Form */}
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rajesh Kumar Sharma"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-gym-primary/60 focus:outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mb-2">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="referee@wpigujarat.in"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-gym-primary/60 focus:outline-none transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="ref-reg-password"
                    className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="ref-reg-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={12}
                      maxLength={72}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-11 text-sm text-white placeholder-gray-700 focus:border-gym-primary/60 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gym-primary transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Federation Invite Code */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mb-2">
                    Federation Invite Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gym-primary/50" />
                    <input
                      type="text"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="WPI-REF-XXXX"
                      className="w-full rounded-xl border border-gym-primary/20 bg-gym-primary/[0.04] px-4 py-3 pl-10 font-mono text-sm font-bold text-gym-primary placeholder-gym-primary/30 focus:border-gym-primary/50 focus:outline-none transition-all tracking-widest uppercase"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1.5 ml-1">
                    <span>Provided by WPI Gujarat Secretary</span>
                    <button
                      type="button"
                      onClick={() => setInviteCode("WPI-REF-2026")}
                      className="text-gym-primary hover:underline font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Fill Default Code
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary via-red-500 to-gym-primary bg-[length:200%] px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_24px_rgba(230,80,27,0.4)] hover:shadow-[0_0_36px_rgba(230,80,27,0.6)] hover:bg-right disabled:opacity-50 transition-all duration-300 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Send Verification OTP</span><Mail className="h-4 w-4" /></>}
                </button>
              </form>
            ) : (
              /* Step 2: OTP Verification */
              <form onSubmit={handleCompleteRegistration} className="flex flex-col gap-5">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                  <span className="text-[10px] text-gray-500 block mb-1 uppercase font-bold tracking-widest">
                    Code dispatched to
                  </span>
                  <span className="text-white font-mono font-bold text-sm">{email}</span>
                </div>

                {/* OTP Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                      6-Digit OTP
                    </label>
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                      <Clock className="h-3 w-3 text-gym-primary" />
                      <span className={totalValidity <= 20 ? "text-red-400" : "text-gray-500"}>
                        {Math.floor(totalValidity / 60)}:{String(totalValidity % 60).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-gym-primary/20 bg-gym-primary/[0.04] px-4 py-3 text-center text-3xl font-mono font-bold tracking-[8px] text-gym-primary focus:border-gym-primary/50 focus:outline-none transition-all"
                  />
                  {totalValidity === 0 && (
                    <p className="text-[11px] text-red-400 font-bold uppercase tracking-wider mt-1.5 text-center">
                      ⚠️ Code expired. Click &quot;Resend OTP&quot; below.
                    </p>
                  )}
                </div>

                {/* Resend */}
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <span className="text-xs text-gray-600">Didn&apos;t receive email?</span>
                  {resendCooldown > 0 ? (
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-600">
                      <RefreshCw className="h-3 w-3 animate-spin text-gym-primary" />
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={resendLoading}
                      onClick={handleResendOtp}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gym-primary hover:text-white border border-gym-primary/40 bg-gym-primary/10 hover:bg-gym-primary/20 py-1.5 px-3.5 rounded-lg disabled:opacity-50 cursor-pointer transition-all"
                    >
                      {resendLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      Resend OTP
                    </button>
                  )}
                </div>

                {/* Complete registration */}
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary via-red-500 to-gym-primary bg-[length:200%] px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_24px_rgba(230,80,27,0.4)] hover:shadow-[0_0_36px_rgba(230,80,27,0.6)] hover:bg-right disabled:opacity-50 transition-all duration-300 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Lock className="h-4 w-4" /><span>Create Referee Account</span><CheckCircle className="h-4 w-4" /></>}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(""); }}
                  className="text-[11px] text-gray-600 hover:text-white font-bold uppercase tracking-widest text-center transition-colors cursor-pointer"
                >
                  ← Back to Details
                </button>
              </form>
            )}

            {/* Footer link */}
            <div className="mt-6 border-t border-white/[0.06] pt-6 text-center">
              <p className="text-xs text-gray-600">
                Already registered?{" "}
                <Link
                  href="/referee/login"
                  className="font-bold text-gym-primary hover:text-orange-400 hover:underline transition-colors"
                >
                  Sign In to Referee Portal →
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-5 uppercase tracking-widest">
          WPI Gujarat · IPF Affiliated · NADA Compliant
        </p>
      </div>
    </div>
  );
}
