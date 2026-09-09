"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 transition-colors hover:text-red-400">
      <LogOut className="h-4 w-4" /> Sign Out
    </button>
  );
}