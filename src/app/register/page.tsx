"use client";

import { useState, useEffect } from "react";
import { sendRegistrationOtp, verifyAndRegister } from "@/actions/auth.actions";
import { Shield, Loader2, Mail, CheckCircle, RefreshCw, Clock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageNavigation } from "@/components/ui/PageNavigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Details form, Step 2: OTP verification
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form Field States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");

  // Countdown Timers for Step 2
  const [resendCooldown, setResendCooldown] = useState(60); // 1-minute active timer
  const [totalValidity, setTotalValidity] = useState(600); // 10-minute code validity

  // Timer Tick
  useEffect(() => {
    if (step !== 2) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setTotalValidity((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // Step 1: Send OTP handler
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await sendRegistrationOtp(email);
      if (res.success) {
        setStep(2);
        setResendCooldown(60);
        setTotalValidity(600);
        setMessage({ type: "success", text: res.message || "Verification OTP sent successfully." });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to send OTP." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler (active after 1 minute)
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await sendRegistrationOtp(email);
      if (res.success) {
        setResendCooldown(60); // restart 1 min cooldown
        setTotalValidity(600); // restart 10 min validity
        setOtp(""); // clear previous entry
        setMessage({
          type: "success",
          text: res.message || "Fresh 6-digit OTP dispatched to your email."
        });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to resend OTP." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred while resending OTP." });
    } finally {
      setResendLoading(false);
    }
  };

  // Step 2: Verify OTP and Create Account handler
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await verifyAndRegister({ name, email, password, otp });
      if (res.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("federation_has_joined", "true");
          document.cookie = "federation_has_joined=true; path=/; max-age=31536000";
          window.dispatchEvent(new Event("federation_joined"));
        }
        setMessage({ type: "success", text: res.message || "Account created successfully! Please sign in with your credentials." });
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 1500);
      } else {
        setMessage({ type: "error", text: res.error || "Verification failed." });
        setLoading(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred during registration." });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gym-black flex flex-col items-center justify-center px-6 relative overflow-hidden pt-32 sm:pt-36 lg:pt-40 pb-16">
      {/* Background glow element */}
      <div className="absolute w-[500px] h-[500px] bg-gym-primary/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md mb-4 relative z-10">
        <PageNavigation
          backHref="/"
          backLabel="Back to Home"
          breadcrumbs={[
            { label: "Public Hub", href: "/" },
            { label: "Athlete Registration" },
          ]}
          badge="Instant OTP Verification"
        />
      </div>

      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative z-10">
        
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-[#151515] border border-white/10 rounded-xl mb-4 text-gym-primary">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-wider">
            Athlete <span className="text-gym-primary">Registration</span>
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
            {step === 1 ? "Enter your credentials to receive a secure email OTP" : "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        {/* Feedback Message Banner */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-xs font-bold uppercase tracking-wider text-center border ${
            message.type === "success" 
              ? "bg-green-500/10 border-green-500/30 text-green-500" 
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}>
            {message.text}
          </div>
        )}

        {/* STEP 1: Details Form */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rakesh Patel"
                className="w-full bg-[#151515] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gym-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@federation.com"
                className="w-full bg-[#151515] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gym-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={12}
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#151515] border border-white/10 rounded-lg px-4 py-3 pr-11 text-white text-sm focus:border-gym-primary focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gym-primary transition-colors p-1 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gym-primary hover:bg-orange-600 text-black font-bold uppercase tracking-widest py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs shadow-lg shadow-gym-primary/10 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Verification OTP <Mail className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Verification Form */
          <form onSubmit={handleCompleteRegistration} className="flex flex-col gap-5">
            <div className="bg-[#151515] border border-white/10 p-4 rounded-xl text-center mb-1">
              <span className="text-[10px] text-gray-400 block mb-1 uppercase font-bold tracking-widest">Verification code dispatched to</span>
              <span className="text-white font-mono font-bold text-sm">{email}</span>
            </div>

            {/* OTP Input Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  6-Digit OTP Code
                </label>
                {/* 2-Minute Expiry Countdown */}
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                  <Clock className="w-3 h-3 text-gym-primary" />
                  <span className={totalValidity <= 20 ? "text-red-400" : "text-gray-400"}>
                    Expires in {Math.floor(totalValidity / 60)}:{String(totalValidity % 60).padStart(2, "0")}
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
                className="w-full bg-[#151515] border border-white/10 rounded-lg px-4 py-3 text-center text-3xl font-mono font-bold tracking-[8px] text-gym-primary focus:border-gym-primary focus:outline-none transition-colors"
              />

              {totalValidity === 0 && (
                <p className="text-[11px] text-red-400 font-bold uppercase tracking-wider mt-1 text-center">
                  ⚠️ This code has expired. Please click &quot;Resend OTP&quot; below.
                </p>
              )}
            </div>

            {/* Resend OTP Section with 1-Minute Cooldown */}
            <div className="flex items-center justify-between bg-[#140402] border border-white/10 rounded-xl p-3 px-4">
              <span className="text-xs text-gray-400">Didn&apos;t receive email?</span>
              {resendCooldown > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 bg-white/5 py-1 px-3 rounded-lg border border-white/10">
                  <RefreshCw className="w-3 h-3 animate-spin text-gym-primary" />
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResendOtp}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gym-primary hover:text-white transition-colors bg-gym-primary/15 hover:bg-gym-primary/30 border border-gym-primary/40 py-1.5 px-3.5 rounded-lg disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(230,80,27,0.2)]"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Resend OTP
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Submit Registration Button */}
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full mt-1 bg-gym-primary hover:bg-orange-600 text-black font-bold uppercase tracking-widest py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs shadow-lg shadow-gym-primary/10 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Complete Registration <CheckCircle className="w-4 h-4" /></>}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setOtp(""); }}
              className="text-[11px] text-gray-500 hover:text-white font-bold uppercase tracking-widest text-center mt-1 transition-colors cursor-pointer"
            >
              ← Back to Details Form
            </button>
          </form>
        )}

        {/* Footer Link to Login & Referee Registration */}
        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-gray-500 text-xs font-medium">
            Already registered?{" "}
            <Link href="/login" className="text-gym-primary font-bold uppercase hover:underline">
              Sign In Here
            </Link>
          </p>

          <div className="mt-4 rounded-xl border border-gym-primary/20 bg-gym-primary/[0.04] p-3 text-center">
            <p className="text-xs text-gray-400">
              Technical Official accreditation?{" "}
              <Link href="/referee/register" className="font-bold text-gym-primary hover:text-orange-400 hover:underline">
                Register as Referee with Invite Code →
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}