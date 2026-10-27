"use client";

import { useState } from "react";
import { changeInitialPasswordAction } from "@/actions/initial-password.actions";

export function InitialPasswordChangeForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    try {
      const result = await changeInitialPasswordAction(formData);
      if (!result?.success) setError(result?.error ?? "Password update failed.");
    } catch {
      setError("Password update failed. Please sign in and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="space-y-4">
      <label className="block text-sm text-gray-300">
        Current password
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
        />
      </label>
      <label className="block text-sm text-gray-300">
        New password
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
        />
      </label>
      <label className="block text-sm text-gray-300">
        Confirm new password
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gym-primary px-4 py-3 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Updating password..." : "Update password"}
      </button>
    </form>
  );
}
