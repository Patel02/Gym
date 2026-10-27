"use client";

import { purchaseMembership } from "@/actions/membership.actions";
import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";

export function MembershipCheckout() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePurchase = async () => {
    setLoading(true);
    setMessage("");

    const result = await purchaseMembership({
      planType: "ANNUAL_ATHLETE",
      amountPaid: 1500,
      durationMonths: 12,
    });

    setMessage(result.success ? `Success! ID: ${result.cardNumber}` : result.error ?? "Payment failed");
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-linear-to-br from-[#151515] to-[#0a0a0a] p-6 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-heading font-bold uppercase tracking-wider text-white">Activate Federation Pass</h2>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gym-primary border border-gym-primary/30 bg-gym-primary/10 px-2 py-0.5 rounded-full">Annual</span>
      </div>
      <p className="mb-5 text-xs text-gray-400">₹1,500 / year. Unlock sanctioned national championship meets and verified rankings.</p>
      <button
        type="button"
        onClick={handlePurchase}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gym-primary px-4 py-3 font-bold uppercase tracking-widest text-xs text-black transition-colors hover:bg-orange-600 disabled:opacity-50 cursor-pointer shadow-lg shadow-gym-primary/10"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        {loading ? "Processing..." : "Pay ₹1,500 Securely"}
      </button>
      {message && <p className="mt-3 text-sm font-medium text-gym-primary">{message}</p>}
    </div>
  );
}