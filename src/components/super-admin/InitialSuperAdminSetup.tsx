"use client";

import React, { useState, useTransition } from "react";
import { Crown, ShieldCheck, KeyRound, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { initializeFirstSuperAdminAction } from "@/actions/super-admin.actions";
import { signIn } from "next-auth/react";

export default function InitialSuperAdminSetup() {
  const [name, setName] = useState("Federation Master Owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !setupKey) {
      setError("Please fill in the email, password, and setup key.");
      return;
    }

    if (password.length < 12 || new TextEncoder().encode(password).length > 72) {
      setError("Password must be 12 or more characters and no more than 72 bytes.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await initializeFirstSuperAdminAction({
        name,
        email,
        password,
        masterSetupKey: setupKey,
      });

      if (res.success) {
        setSuccess(res.message || "Super Admin initialized!");
        setTimeout(async () => {
          // Auto sign in or redirect
          await signIn("credentials", {
            email,
            password,
            callbackUrl: "/super-admin",
          });
        }, 1200);
      } else {
        setError(res.error || "Initialization failed.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[#0d1322] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-0.5 shadow-lg shadow-amber-500/30 mb-2">
            <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
              <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            INITIALIZE SUPER ADMIN
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            First-admin setup requires the private key configured by the system operator.
          </p>
        </div>

        {error && (
          <div className="mt-6 p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success} Logging you in...</span>
          </div>
        )}

        <form onSubmit={handleSetup} className="mt-6 space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Super Admin Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#131b2c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Your Email Address (Login ID) *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. patel01021@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#131b2c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              First-Admin Setup Key *
            </label>
            <input
              type="password"
              required
              minLength={32}
              value={setupKey}
              onChange={(e) => setSetupKey(e.target.value)}
              autoComplete="off"
              className="w-full bg-[#131b2c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Master Password *
              </label>
              <input
                type="password"
                required
                minLength={12}
                maxLength={72}
                placeholder="At least 12 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131b2c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#131b2c] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02]"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>{isPending ? "Claiming Super Admin Seat..." : "Initialize & Claim Super Admin"}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            🔒 Once created, this initial setup page is permanently locked.
            Only 1 Super Admin is allowed in the entire database.
          </p>
        </div>
      </div>
    </div>
  );
}
