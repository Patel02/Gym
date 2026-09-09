"use client";

import { submitWeighIn } from "@/actions/weighin.actions";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

type WeighInRegistration = {
  id: string;
  bodyweight: number | null;
  lotNumber: number | null;
  user: {
    name: string | null;
    profile: { weightClass: string } | null;
  };
  event: { title: string };
};

export function WeighInRow({ registration }: { registration: WeighInRegistration }) {
  const [bodyweight, setBodyweight] = useState(registration.bodyweight?.toString() ?? "");
  const [lotNumber, setLotNumber] = useState(registration.lotNumber?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const parsedBodyweight = Number.parseFloat(bodyweight);
    const parsedLotNumber = Number.parseInt(lotNumber, 10);

    if (!Number.isFinite(parsedBodyweight) || parsedBodyweight <= 0 || !Number.isInteger(parsedLotNumber) || parsedLotNumber <= 0) {
      setError("Enter a valid bodyweight and lot number.");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError(null);

    const result = await submitWeighIn({
      registrationId: registration.id,
      bodyweight: parsedBodyweight,
      lotNumber: parsedLotNumber,
    });

    if (result.success) {
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 2000);
    } else {
      setError(result.error ?? "Weigh-in submission failed.");
    }
    setLoading(false);
  };

  return (
    <tr className="border-b border-white/5 hover:bg-[#111]">
      <td className="px-6 py-3 font-bold text-white">{registration.user.name ?? "Unknown athlete"}</td>
      <td className="px-6 py-3 text-xs font-black text-gym-orange">
        {registration.user.profile?.weightClass?.replace("WC_", "") ?? "-"}KG
      </td>
      <td className="px-6 py-3 text-xs text-gray-400">{registration.event.title}</td>
      <td className="px-6 py-3">
        <input
          aria-label={`Bodyweight for ${registration.user.name ?? "athlete"}`}
          type="number"
          min="0.01"
          step="0.01"
          value={bodyweight}
          onChange={(event) => setBodyweight(event.target.value)}
          className="w-24 rounded border border-white/10 bg-[#151515] px-2 py-1 text-sm text-white focus:border-gym-orange focus:outline-none"
          placeholder="82.4"
        />
      </td>
      <td className="px-6 py-3">
        <input
          aria-label={`Lot number for ${registration.user.name ?? "athlete"}`}
          type="number"
          min="1"
          step="1"
          value={lotNumber}
          onChange={(event) => setLotNumber(event.target.value)}
          className="w-16 rounded border border-white/10 bg-[#151515] px-2 py-1 text-sm text-white focus:border-gym-orange focus:outline-none"
          placeholder="Lot"
        />
      </td>
      <td className="px-6 py-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex min-w-20 items-center justify-center gap-2 rounded bg-gym-orange px-4 py-1.5 text-xs font-bold uppercase text-black transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <Check className="h-4 w-4" /> : "Save"}
          </button>
          {error && <p className="max-w-40 text-right text-xs text-red-400">{error}</p>}
        </div>
      </td>
    </tr>
  );
}