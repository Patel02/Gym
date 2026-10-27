"use client";

import React from "react";
import { Keyboard, X, Sparkles, Command } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  action: string;
  category: "Lights" | "Voice Commands" | "Platform Clock" | "Navigation";
}

const SHORTCUTS: ShortcutItem[] = [
  // Lights
  { keys: ["1"], action: "Left Side Ref (Ref 1) — White Light ⚪", category: "Lights" },
  { keys: ["2"], action: "Left Side Ref (Ref 1) — Red Light 🔴", category: "Lights" },
  { keys: ["3"], action: "Center Chief Ref (Lead) — White Light ⚪", category: "Lights" },
  { keys: ["4"], action: "Center Chief Ref (Lead) — Red Light 🔴", category: "Lights" },
  { keys: ["5"], action: "Right Side Ref (Ref 3) — White Light ⚪", category: "Lights" },
  { keys: ["6"], action: "Right Side Ref (Ref 3) — Red Light 🔴", category: "Lights" },
  { keys: ["Space"], action: "Submit Platform Verdict Broadcast", category: "Lights" },
  { keys: ["R"], action: "Reset Switchboard to ⚪⚪⚪ All White", category: "Lights" },

  // Platform Clock
  { keys: ["T"], action: "Start / Pause Official 60s Attempt Timer", category: "Platform Clock" },

  // Voice Commands
  { keys: ["S"], action: 'Audible Voice: "Squat!" Command', category: "Voice Commands" },
  { keys: ["P"], action: 'Audible Voice: "Press!" Command', category: "Voice Commands" },
  { keys: ["K"], action: 'Audible Voice: "Rack!" Command', category: "Voice Commands" },
  { keys: ["D"], action: 'Audible Voice: "Down!" Command', category: "Voice Commands" },

  // Navigation
  { keys: ["←"], action: "Previous Lifter in Flight Queue", category: "Navigation" },
  { keys: ["→"], action: "Next Lifter in Flight Queue", category: "Navigation" },
  { keys: ["?"], action: "Toggle Keyboard Shortcuts Modal", category: "Navigation" },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const categories = ["Lights", "Voice Commands", "Platform Clock", "Navigation"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-gradient-to-b from-[#180e0a] to-[#0a0503] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gym-primary/20 border border-gym-primary/40 flex items-center justify-center text-gym-primary">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                Referee Platform Keyboard Shortcuts
              </h3>
              <p className="text-[11px] text-zinc-400">
                Operate the entire platform console without using your mouse.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content list by category */}
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const items = SHORTCUTS.filter((s) => s.category === cat);
            return (
              <div key={cat} className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gym-primary block">
                  {cat}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                    >
                      <span className="text-xs text-zinc-300 font-medium truncate pr-2">
                        {item.action}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k) => (
                          <kbd
                            key={k}
                            className="px-2 py-1 rounded-lg border border-white/20 bg-black/60 font-mono text-[11px] font-bold text-white shadow-inner"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
          <span>Press any listed hotkey anytime to trigger its action immediately.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
