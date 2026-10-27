"use client";

import { getAthleteIdCardAction, type AthleteIdCardPayload } from "@/actions/certificate.actions";
import { AthleteIdCardModal } from "@/components/credentials/AthleteIdCardModal";
import { CalendarDays, Clock, CreditCard, Mail, ShieldCheck, UserCog, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type UserCardProps = {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    profile: {
      gender: string;
      weightClass: string;
    } | null;
    activeMembership: {
      cardNumber: string;
      planType: string;
      status: string;
      endDate: Date;
    } | null;
    deletionRequest?: {
      status: string;
    } | null;
  };
};

function formatDate(date: Date | string) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function UserCard({ user }: UserCardProps) {
  const [idCardData, setIdCardData] = useState<AthleteIdCardPayload | null>(null);
  const [isIdModalOpen, setIsIdModalOpen] = useState<boolean>(false);
  const [isLoadingId, setIsLoadingId] = useState<boolean>(false);

  const handleOpenIdCard = async () => {
    if (idCardData) {
      setIsIdModalOpen(true);
      return;
    }

    try {
      setIsLoadingId(true);
      const res = await getAthleteIdCardAction();
      if (res.success && res.idCard) {
        setIdCardData(res.idCard);
        setIsIdModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load athlete ID card:", err);
    } finally {
      setIsLoadingId(false);
    }
  };

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[#151515] to-[#080808] shadow-2xl">
        <div className="h-1 w-full bg-gym-primary" />
        <div className="p-6">
          {user.deletionRequest && user.deletionRequest.status === "PENDING" && (
            <div className="mb-4 rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
              <Clock className="h-4 w-4 animate-pulse shrink-0 text-amber-400" />
              <span>Account Deletion Pending Admin Review</span>
            </div>
          )}

          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover border-2 border-gym-primary/40"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gym-primary font-heading text-2xl text-black">
                  {(user.name ?? "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="font-heading text-2xl uppercase tracking-wider text-white">
                  {user.name ?? "Athlete"}
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-gym-primary">
                  {user.role}
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-gray-300 hover:border-gym-primary hover:bg-gym-primary hover:text-white transition-all shadow-sm"
              title="Edit Profile & Security"
            >
              <UserCog className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-4 text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gym-primary" />
              {user.email ?? "No email registered"}
            </div>
            {user.profile ? (
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-gym-primary" />
                <span>
                  {user.profile.gender} · {user.profile.weightClass ? `${user.profile.weightClass.replace("WC_", "")} KG` : "83 KG"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs text-gym-primary font-bold">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <Link href="/dashboard/profile" className="hover:underline">
                  Complete weight &amp; category profile →
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Link
              href="/dashboard/profile"
              className="flex items-center justify-center gap-2 rounded-xl border border-gym-primary/30 bg-gym-primary/10 py-2.5 text-xs font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white transition-all"
            >
              <UserCog className="h-3.5 w-3.5" />
              <span>Manage Profile & Security</span>
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-gym-primary/30 bg-gym-primary/5 p-4">
            {user.activeMembership ? (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Federation ID
                  </span>
                  <span className="text-xs font-bold uppercase text-gym-primary">
                    {user.activeMembership.status}
                  </span>
                </div>
                <p className="font-heading text-2xl tracking-widest text-white">
                  {user.activeMembership.cardNumber}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <CalendarDays className="h-4 w-4 text-gym-primary" />
                  <span>Valid until </span>
                  <span suppressHydrationWarning>
                    {formatDate(user.activeMembership.endDate)}
                  </span>
                </p>

                {/* Direct Button to open 3D Flip ID Pass */}
                <button
                  onClick={handleOpenIdCard}
                  disabled={isLoadingId}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{isLoadingId ? "Loading Pass..." : "View Official ID Card (Pass)"}</span>
                </button>

                {/* Warm-Up & Plate Loader Quick Tool */}
                <Link
                  href="/tools/warmup-calculator"
                  className="mt-2.5 w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:border-gym-primary/50 hover:bg-gym-primary/10 hover:text-white transition-all"
                >
                  <span>🏋️ Warm-Up &amp; Plate Loader</span>
                </Link>

                {/* Meet Day Coach Attempt War Room Quick Tool */}
                <Link
                  href="/tools/attempt-strategy"
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border border-gym-primary/30 bg-gym-primary/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white transition-all shadow-sm"
                >
                  <Target className="h-3.5 w-3.5" />
                  <span>🎯 Meet Day War Room</span>
                </Link>

                {/* Weigh-In Water Cut & Rapid Refeed Quick Tool */}
                <Link
                  href="/tools/weigh-in-planner"
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:border-gym-primary/50 hover:bg-gym-primary/10 hover:text-white transition-all"
                >
                  <span>🥗 Weigh-In &amp; Refeed Protocol</span>
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-400">
                No active membership. Choose a plan to receive your Federation ID.
              </p>
            )}
          </div>
        </div>
      </article>

      {/* Athlete ID Card Modal */}
      {idCardData && (
        <AthleteIdCardModal
          idCard={idCardData}
          isOpen={isIdModalOpen}
          onClose={() => setIsIdModalOpen(false)}
        />
      )}
    </>
  );
}