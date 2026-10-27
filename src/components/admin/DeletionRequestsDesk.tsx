"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Dumbbell,
  Mail,
  RefreshCw,
  ShieldAlert,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  approveDeletionRequestAction,
  rejectDeletionRequestAction,
} from "@/actions/admin-deletion.actions";

interface DeletionRequestItem {
  id: string;
  userId: string;
  reason: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    joinedDate: string;
    gender: string;
    weightClass: string;
    activeMembership: {
      cardNumber: string;
      planType: string;
      endDate: string;
    } | null;
  };
}

interface DeletionRequestsDeskProps {
  initialRequests: DeletionRequestItem[];
}

export default function DeletionRequestsDesk({ initialRequests }: DeletionRequestsDeskProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<DeletionRequestItem[]>(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<DeletionRequestItem | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Approve Deletion
  const handleApprove = async (req: DeletionRequestItem) => {
    setProcessingId(req.id);
    setNotice(null);

    try {
      const res = await approveDeletionRequestAction({
        requestId: req.id,
        userId: req.userId,
      });

      if (!res.success) throw new Error(res.error);

      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      setConfirmModal(null);
      setNotice({
        type: "success",
        text: `Account for ${req.user.name} (${req.user.email}) was permanently deleted.`,
      });
      router.refresh();
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to approve deletion." });
    } finally {
      setProcessingId(null);
    }
  };

  // 2. Reject Deletion
  const handleReject = async (req: DeletionRequestItem) => {
    if (!confirm(`Reject deletion request for ${req.user.name}? Their account will remain active.`)) return;

    setProcessingId(req.id);
    setNotice(null);

    try {
      const res = await rejectDeletionRequestAction({
        requestId: req.id,
        note: "Rejected by Administrator review",
      });

      if (!res.success) throw new Error(res.error);

      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      setNotice({
        type: "success",
        text: `Deletion request rejected. Athlete account for ${req.user.name} preserved.`,
      });
      router.refresh();
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to reject request." });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080201] text-white px-4 pt-32 sm:pt-36 lg:pt-40 pb-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* ── Top Navigation ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gym-primary transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Command Center</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              {requests.length} Pending Deletion {requests.length === 1 ? "Request" : "Requests"}
            </span>
          </div>
        </div>

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-red-400 mb-2">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Federation Governance</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Account Deletion <span className="text-gym-primary">Approval Desk</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Athletes who submitted account deletion requests require explicit Administrator sign-off.
            Review reasons, check membership/meet commitments, and authorize permanent database removal.
          </p>
        </div>

        {/* ── Notice Banner ── */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 flex items-center justify-between gap-3 rounded-2xl p-4 border text-sm font-medium ${
                notice.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/40 border-red-500/40 text-red-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {notice.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                )}
                <span>{notice.text}</span>
              </div>
              <button
                onClick={() => setNotice(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Requests List ── */}
        {requests.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#120302] p-12 text-center shadow-xl">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-xl font-bold uppercase text-white">
              No Pending Deletion Requests
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 leading-relaxed">
              All athlete accounts are in good standing. When an athlete requests account removal,
              it will appear here for review and permanent deletion authorization.
            </p>
            <div className="mt-6">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all"
              >
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#160402] via-[#100302] to-[#0a0201] p-6 sm:p-7 shadow-xl hover:border-gym-primary/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* User Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-gym-primary/40 bg-zinc-900 shrink-0 flex items-center justify-center">
                    {req.user.image ? (
                      <Image
                        src={req.user.image}
                        alt={req.user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-heading text-2xl font-bold text-gym-primary">
                        {(req.user.name || "A").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-heading text-xl font-bold uppercase text-white">
                        {req.user.name}
                      </h3>
                      <span className="rounded-full bg-gym-primary/15 border border-gym-primary/30 px-2.5 py-0.5 text-[10px] font-bold text-gym-primary uppercase">
                        {req.user.weightClass.replace("WC_", "")} KG · {req.user.gender}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1 text-gray-300">
                        <Mail className="h-3.5 w-3.5 text-gym-primary" />
                        <span>{req.user.email}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Requested on {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </span>
                    </div>

                    {/* Reason Callout */}
                    <div className="mt-3 rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-200">
                      <span className="font-bold text-red-400 uppercase text-[10px] block mb-0.5">
                        Stated Reason:
                      </span>
                      &ldquo;{req.reason}&rdquo;
                    </div>
                  </div>
                </div>

                {/* Membership & Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                      Affiliation Status
                    </span>
                    <span className="text-xs font-bold text-white">
                      {req.user.activeMembership
                        ? `Active Pass (${req.user.activeMembership.cardNumber})`
                        : "No Active Pass"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleReject(req)}
                      disabled={processingId === req.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmModal(req)}
                      disabled={processingId === req.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {processingId === req.id ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Approve & Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Double Confirmation Modal ── */}
        <AnimatePresence>
          {confirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md rounded-3xl border border-red-500/50 bg-gradient-to-b from-[#1c0302] via-[#120201] to-[#080101] p-6 sm:p-8 shadow-[0_0_50px_rgba(220,38,38,0.4)] text-center"
              >
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 mb-4">
                  <Trash2 className="h-8 w-8" />
                </div>

                <h3 className="font-heading text-2xl font-bold uppercase text-white mb-2">
                  Confirm Permanent Deletion
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  You are about to permanently delete the athlete account for:
                  <br />
                  <strong className="text-white text-sm">{confirmModal.user.name}</strong> ({confirmModal.user.email})
                </p>

                <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-[11px] text-red-200 text-left mb-6">
                  ⚠️ This action will permanently erase:
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-300">
                    <li>Athlete profile, weight category, and photos</li>
                    <li>All sanctioned meet registrations & weigh-ins</li>
                    <li>Attempt results, Wilks scores, and PR records</li>
                    <li>Active membership credentials and login access</li>
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleApprove(confirmModal)}
                    disabled={processingId === confirmModal.id}
                    className="w-full rounded-full bg-red-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-red-700 active:scale-95 transition-all"
                  >
                    {processingId === confirmModal.id ? "Erasing Account..." : "Yes, Permanently Delete Account"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    className="w-full py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
