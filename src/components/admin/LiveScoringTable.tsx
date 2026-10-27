"use client";

import { updateLiftScore, type LiftField } from "@/actions/scoring.actions";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

type ResultRow = {
  id: string;
  version: number;
  squat1: number | null;
  squat2: number | null;
  squat3: number | null;
  bench1: number | null;
  bench2: number | null;
  bench3: number | null;
  deadlift1: number | null;
  deadlift2: number | null;
  deadlift3: number | null;
  total: number | null;
  user: {
    name: string | null;
    profile: { weightClass: string } | null;
  };
};

type ScoreMessage = { type: "error" | "success"; text: string } | null;

export function LiveScoringTable({ initialResults }: { initialResults: ResultRow[] }) {
  const [results, setResults] = useState(initialResults);
  const [loadingCell, setLoadingCell] = useState<string | null>(null);
  const [message, setMessage] = useState<ScoreMessage>(null);

  const handleScoreUpdate = async (result: ResultRow, field: LiftField, value: string) => {
    const weight = Number(value);
    if (!value || !Number.isFinite(weight)) {
      return;
    }

    const cellId = `${result.id}-${field}`;
    setLoadingCell(cellId);
    setMessage(null);

    const response = await updateLiftScore({
      resultId: result.id,
      liftField: field,
      weight,
      currentVersion: result.version,
    });

    if (response.success) {
      setResults((current) =>
        current.map((item) =>
          item.id === result.id
            ? {
                ...item,
                [field]: weight,
                bestSquat: response.bestSquat,
                bestBench: response.bestBench,
                bestDeadlift: response.bestDeadlift,
                total: response.total ?? item.total,
                version: response.newVersion ?? item.version + 1,
              }
            : item,
        ),
      );
      setMessage({ type: "success", text: "Score updated." });
    } else {
      setMessage({ type: "error", text: response.error ?? "Update failed." });
      if (response.error?.toLowerCase().includes("concurrency")) {
        window.setTimeout(() => window.location.reload(), 1500);
      }
    }

    setLoadingCell(null);
    window.setTimeout(() => setMessage(null), 3000);
  };

  const renderInput = (result: ResultRow, field: LiftField) => {
    const cellId = `${result.id}-${field}`;
    const isUpdating = loadingCell === cellId;
    const value = result[field];

    return (
      <div className="relative w-20">
        <input
          aria-label={`${result.user.name ?? "Lifter"} ${field}`}
          type="number"
          step="0.5"
          defaultValue={value ?? ""}
          onBlur={(event) => {
            if (event.target.value !== String(value ?? "")) {
              void handleScoreUpdate(result, field, event.target.value);
            }
          }}
          disabled={loadingCell !== null}
          className="w-full rounded border border-white/10 bg-[#151515] px-2 py-1 text-sm text-white focus:border-gym-primary focus:outline-none disabled:opacity-50"
        />
        {isUpdating && <Loader2 className="absolute right-2 top-1.5 h-4 w-4 animate-spin text-gym-primary" />}
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {message && (
        <div className={`flex items-center gap-2 border p-3 text-sm font-bold ${message.type === "error" ? "border-red-500 bg-red-500/10 text-red-500" : "border-green-500 bg-green-500/10 text-green-500"}`}>
          {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto border border-white/10 bg-[#0a0a0a]">
        <table className="w-full min-w-[1120px] text-left text-sm text-gray-300">
          <thead className="border-b border-white/10 bg-[#111] text-xs font-bold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Lifter</th>
              <th className="px-4 py-3">WC</th>
              <th className="border-l border-white/5 px-4 py-3 text-center" colSpan={3}>Squat</th>
              <th className="border-l border-white/5 px-4 py-3 text-center" colSpan={3}>Bench</th>
              <th className="border-l border-white/5 px-4 py-3 text-center" colSpan={3}>Deadlift</th>
              <th className="border-l border-white/5 px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="border-b border-white/5 hover:bg-[#111]">
                <td className="px-4 py-3 font-bold text-white">{result.user.name ?? "Unknown"}</td>
                <td className="px-4 py-3 text-xs font-black text-gym-primary">{result.user.profile?.weightClass.replace("WC_", "") ?? "-"}KG</td>
                {(["squat1", "squat2", "squat3"] as LiftField[]).map((field, index) => <td key={field} className={`px-2 py-3 ${index === 0 ? "border-l border-white/5" : ""}`}>{renderInput(result, field)}</td>)}
                {(["bench1", "bench2", "bench3"] as LiftField[]).map((field, index) => <td key={field} className={`px-2 py-3 ${index === 0 ? "border-l border-white/5" : ""}`}>{renderInput(result, field)}</td>)}
                {(["deadlift1", "deadlift2", "deadlift3"] as LiftField[]).map((field, index) => <td key={field} className={`px-2 py-3 ${index === 0 ? "border-l border-white/5" : ""}`}>{renderInput(result, field)}</td>)}
                <td className="border-l border-white/5 px-4 py-3 text-right font-black text-white">{result.total ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}