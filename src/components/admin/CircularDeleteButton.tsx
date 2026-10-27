"use client";

import { deleteCircular } from "@/actions/cms.actions";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CircularDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    setIsDeleting(true);
    const res = await deleteCircular(id);
    setIsDeleting(false);

    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Failed to delete circular.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete Circular"
      className="p-2 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer disabled:opacity-50 shrink-0"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
