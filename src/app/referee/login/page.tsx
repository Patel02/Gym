"use client";

import { loginReferee } from "@/actions/auth.actions";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Scale,
  Shield,
} from "lucide-react";
import { PageNavigation } from "@/components/ui/PageNavigation";

function RefereeLoginForm() {
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await loginReferee(new FormData(e.currentTarget));
    if (result && !result.success) {
      setError(result.error ?? "Login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080201] flex items-center justify-center px-4 pt-32 sm:pt-36 lg:pt-40 pb-16 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gym-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-red-900/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <PageNavigation
          backHref="/"
          backLabel="Back to Home"
          breadcrumbs={[
            { label: "Public Hub", href: "/" },
            { label: "Technical Official Sign In" },
          ]}
          badge="Jury Clearance"
          className="mb-6"
        />

        {/* Top logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-gym-primary/70 shadow-[0_0_30px_rgba(230,80,27,0.4)] bg-black mb-4">
            <Image
              src="/images/wpi-logo-transparent.png"
              alt="WPI Association of Gujarat"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gym-primary">
            WPI Association of Gujarat
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0f0603] to-[#080201] shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Top accent stripe */}
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
                Referee <span className="text-gym-primary">Portal</span>
              </h1>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">
                Official Technical Official Command Access
              </p>
            </div>

            {/* Success banner */}
            {isRegistered && (
              <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Referee account created! Sign in below to access your dashboard.</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-center text-xs font-bold text-red-400">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mb-2">
                  Official Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="referee@wpigujarat.in"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-gym-primary/60 focus:outline-none focus:bg-white/[0.05] transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="ref-password"
                  className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="ref-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-11 text-sm text-white placeholder-gray-700 focus:border-gym-primary/60 focus:outline-none focus:bg-white/[0.05] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gym-primary transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary via-red-500 to-gym-primary bg-[length:200%] px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_24px_rgba(230,80,27,0.4)] hover:shadow-[0_0_36px_rgba(230,80,27,0.6)] hover:bg-right disabled:opacity-50 transition-all duration-300 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Access Referee Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Role info */}
            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 flex items-start gap-3">
              <Scale className="h-4 w-4 text-gym-primary/60 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-600 leading-relaxed">
                This portal is exclusively for <span className="text-gray-400 font-semibold">accredited WPI Technical Officials</span>. Athlete login is at{" "}
                <Link href="/login" className="text-gym-primary hover:underline font-bold">
                  /login
                </Link>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-white/[0.06] pt-6 text-center">
              <p className="text-xs text-gray-600">
                New referee?{" "}
                <Link
                  href="/referee/register"
                  className="font-bold text-gym-primary hover:text-orange-400 hover:underline transition-colors"
                >
                  Register with Invite Code →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom compliance note */}
        <p className="text-center text-[10px] text-gray-700 mt-5 uppercase tracking-widest">
          WPI Gujarat · IPF Affiliated · NADA Compliant
        </p>
      </div>
    </div>
  );
}

export default function RefereeLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080201] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gym-primary" />
      </div>
    }>
      <RefereeLoginForm />
    </Suspense>
  );
}
