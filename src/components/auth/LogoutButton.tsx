"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "compact" | "mobile";
}

export function LogoutButton({ className, variant = "default" }: LogoutButtonProps) {
  const handleSignOut = async () => {
    try {
      localStorage.removeItem("federation_has_joined");
      sessionStorage.clear();
      await signOut({ callbackUrl: "/login" });
    } catch {
      window.location.href = "/login";
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        className={
          className ||
          "flex items-center justify-center h-8 w-8 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] shrink-0 cursor-pointer"
        }
        title="Sign Out of Federation Account"
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        className={
          className ||
          "w-full flex items-center justify-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-md cursor-pointer"
        }
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={
        className ||
        "flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-[0_0_12px_rgba(239,68,68,0.25)] shrink-0 whitespace-nowrap cursor-pointer"
      }
      title="Sign Out of Federation Account"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>Sign Out</span>
    </button>
  );
}