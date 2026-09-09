"use client";

import { loginUser } from "@/actions/auth.actions";
import { ArrowRight, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    const result = await loginUser(new FormData(event.currentTarget));
    if (result && !result.success) { setError(result.error ?? "Login failed."); setLoading(false); }
  };
  return <div className="flex min-h-screen items-center justify-center bg-gym-black px-6"><div className="w-full max-w-md border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl md:p-10"><div className="mb-8 text-center"><Shield className="mx-auto mb-4 h-9 w-9 text-gym-orange" /><h1 className="font-heading text-3xl font-black uppercase tracking-wider text-white">Athlete <span className="text-gym-orange">Portal</span></h1><p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-400">Sign in to access your federation credentials</p></div>{error && <p className="mb-6 border border-red-500/30 bg-red-500/10 p-4 text-center text-xs font-bold text-red-400">{error}</p>}<form onSubmit={handleSubmit} className="flex flex-col gap-5"><label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email<input name="email" type="email" required className="mt-2 w-full border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white focus:border-gym-orange focus:outline-none" /></label><label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password<input name="password" type="password" required className="mt-2 w-full border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white focus:border-gym-orange focus:outline-none" /></label><button disabled={loading} className="flex items-center justify-center gap-2 bg-gym-orange px-4 py-3 font-bold uppercase tracking-widest text-black disabled:opacity-50">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}</button></form><p className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-500">Need an account? <Link href="/register" className="font-bold text-gym-orange">Register Now</Link></p></div></div>;
}