"use client";

import { loginUser } from "@/actions/auth.actions";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageNavigation } from "@/components/ui/PageNavigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isRegistered && typeof window !== "undefined") {
      localStorage.setItem("federation_has_joined", "true");
      document.cookie = "federation_has_joined=true; path=/; max-age=31536000";
      window.dispatchEvent(new Event("federation_joined"));
    }
  }, [isRegistered]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (typeof window !== "undefined") {
      localStorage.setItem("federation_has_joined", "true");
      document.cookie = "federation_has_joined=true; path=/; max-age=31536000";
      window.dispatchEvent(new Event("federation_joined"));
    }

    const result = await loginUser(new FormData(event.currentTarget));
    if (result && !result.success) {
      setError(result.error ?? "Login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl md:p-10 rounded-2xl">
      <div className="mb-8 text-center">
        <Shield className="mx-auto mb-4 h-9 w-9 text-gym-primary" />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-white">
          Athlete <span className="text-gym-primary">Portal</span>
        </h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          Sign in to access your federation credentials
        </p>
      </div>

      {isRegistered && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Account created successfully! Please sign in below.</span>
        </div>
      )}

      {error && (
        <p className="mb-6 border border-red-500/30 bg-red-500/10 p-4 text-center text-xs font-bold text-red-400 rounded-lg">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white focus:border-gym-primary focus:outline-none transition-colors"
          />
        </label>
        <div>
          <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-[#151515] px-4 py-3 pr-11 text-sm text-white focus:border-gym-primary focus:outline-none transition-colors"
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
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-gym-primary px-4 py-3 font-bold uppercase tracking-widest text-black transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
        Need an account?{" "}
        <Link href="/register" className="font-bold text-gym-primary hover:underline">
          Register / Join Now
        </Link>
      </p>

      <div className="mt-4 rounded-xl border border-gym-primary/20 bg-gym-primary/[0.04] p-3 text-center">
        <p className="text-xs text-gray-400">
          Official Technical Official?{" "}
          <Link href="/referee/login" className="font-bold text-gym-primary hover:text-orange-400 hover:underline">
            Referee Sign In →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gym-black px-6 pt-32 sm:pt-36 lg:pt-40 pb-16">
      <div className="w-full max-w-md mb-4">
        <PageNavigation
          backHref="/"
          backLabel="Back to Home"
          breadcrumbs={[
            { label: "Public Hub", href: "/" },
            { label: "Athlete Sign In" },
          ]}
          badge="Member Portal"
        />
      </div>
      <Suspense fallback={<div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}