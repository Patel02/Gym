"use client";

import { approveRecord, type RecordApprovalData } from "@/actions/records.actions";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export function RecordApprovalButton({ data }: { data: RecordApprovalData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    const result = await approveRecord(data);
    if (!result.success) {
      setError(result.error ?? "Record approval failed.");
      setLoading(false);
      return;
    }
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button type="button" onClick={handleApprove} disabled={loading} className="flex items-center gap-2 bg-gym-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-orange-600 disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
        {loading ? "Sealing..." : "Ratify"}
      </button>
      {error && <p className="max-w-48 text-right text-xs text-red-400">{error}</p>}
    </div>
  );
}