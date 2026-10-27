"use client";

import React, { useState } from "react";
import {
  X,
  Ruler,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface SizingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizingGuideModal({ isOpen, onClose }: SizingGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"BELTS" | "SLEEVES" | "SINGLETS">("BELTS");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-zinc-950 p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl bg-white/5 border border-white/10 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-gym-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">
              Official Technical Measurement Standard
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
            IPF Equipment Sizing Guide
          </h2>
          <p className="text-xs text-zinc-400">
            Ensure competition platform compliance and maximum mechanical leverage by taking precise body measurements.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="my-5 flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("BELTS")}
            className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "BELTS"
                ? "border-gym-primary text-gym-primary"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            13mm &amp; 10mm Lever Belts
          </button>
          <button
            onClick={() => setActiveTab("SLEEVES")}
            className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "SLEEVES"
                ? "border-gym-primary text-gym-primary"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            7mm Stiff Knee Sleeves
          </button>
          <button
            onClick={() => setActiveTab("SINGLETS")}
            className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "SINGLETS"
                ? "border-gym-primary text-gym-primary"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            Competition Singlets
          </button>
        </div>

        {/* ── TAB CONTENT ── */}
        {activeTab === "BELTS" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>CRITICAL RULE:</strong> DO NOT use your pants / jeans size! Measure around your belly button (navel) with relaxed abdomen where your belt will sit.
              </span>
            </div>

            <table className="w-full text-left border-collapse border border-zinc-800 text-xs">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase font-black">
                  <th className="p-2.5 border-r border-zinc-800">Size</th>
                  <th className="p-2.5 border-r border-zinc-800">Navel Circumference (Inches)</th>
                  <th className="p-2.5">Navel Circumference (CM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-mono">
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">Small (S)</td>
                  <td className="p-2.5 border-r border-zinc-800">26" - 32"</td>
                  <td className="p-2.5">66 cm - 81 cm</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">Medium (M)</td>
                  <td className="p-2.5 border-r border-zinc-800">30" - 36"</td>
                  <td className="p-2.5">76 cm - 91 cm</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">Large (L)</td>
                  <td className="p-2.5 border-r border-zinc-800">34" - 40"</td>
                  <td className="p-2.5">86 cm - 101 cm</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">X-Large (XL)</td>
                  <td className="p-2.5 border-r border-zinc-800">38" - 44"</td>
                  <td className="p-2.5">96 cm - 111 cm</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">2X-Large (2XL)</td>
                  <td className="p-2.5 border-r border-zinc-800">42" - 48"</td>
                  <td className="p-2.5">106 cm - 121 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "SLEEVES" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5 text-xs text-blue-300 flex items-start gap-2.5">
              <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
              <span>
                <strong>Measurement Technique:</strong> Measure directly around the center of your kneecap (patella) with your leg fully locked out straight and quad relaxed.
              </span>
            </div>

            <table className="w-full text-left border-collapse border border-zinc-800 text-xs">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase font-black">
                  <th className="p-2.5 border-r border-zinc-800">Sleeve Size</th>
                  <th className="p-2.5 border-r border-zinc-800">Knee Joint Circumference</th>
                  <th className="p-2.5">Typical Lifter Division</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-mono">
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">XS</td>
                  <td className="p-2.5 border-r border-zinc-800">28.0 cm - 31.0 cm</td>
                  <td className="p-2.5 font-sans">Under 59kg (Sub-Junior / Women)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">Small (S)</td>
                  <td className="p-2.5 border-r border-zinc-800">31.0 cm - 33.5 cm</td>
                  <td className="p-2.5 font-sans">59kg - 66kg Class</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">Medium (M)</td>
                  <td className="p-2.5 border-r border-zinc-800">33.5 cm - 36.0 cm</td>
                  <td className="p-2.5 font-sans">74kg - 83kg Class</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">Large (L)</td>
                  <td className="p-2.5 border-r border-zinc-800">36.0 cm - 38.5 cm</td>
                  <td className="p-2.5 font-sans">83kg - 93kg Class</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">X-Large (XL)</td>
                  <td className="p-2.5 border-r border-zinc-800">38.5 cm - 41.0 cm</td>
                  <td className="p-2.5 font-sans">93kg - 105kg Class</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">2X-Large (2XL)</td>
                  <td className="p-2.5 border-r border-zinc-800">41.0 cm - 44.0 cm</td>
                  <td className="p-2.5 font-sans">105kg - 120kg Class</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "SINGLETS" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>
                <strong>IPF Rule Section 3.1:</strong> Singlets must conform to body contours so referees can clearly observe hip crease depth on squats.
              </span>
            </div>

            <table className="w-full text-left border-collapse border border-zinc-800 text-xs">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase font-black">
                  <th className="p-2.5 border-r border-zinc-800">Singlet Size</th>
                  <th className="p-2.5 border-r border-zinc-800">Competitor Bodyweight</th>
                  <th className="p-2.5">Chest Circumference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-mono">
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">XS</td>
                  <td className="p-2.5 border-r border-zinc-800 font-sans">Under 52 KG</td>
                  <td className="p-2.5">76 cm - 84 cm</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">Small (S)</td>
                  <td className="p-2.5 border-r border-zinc-800 font-sans">52 KG - 66 KG</td>
                  <td className="p-2.5">84 cm - 92 cm</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">Medium (M)</td>
                  <td className="p-2.5 border-r border-zinc-800 font-sans">66 KG - 74 KG</td>
                  <td className="p-2.5">92 cm - 100 cm</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">Large (L)</td>
                  <td className="p-2.5 border-r border-zinc-800 font-sans">74 KG - 83 KG</td>
                  <td className="p-2.5">100 cm - 108 cm</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">XL</td>
                  <td className="p-2.5 border-r border-zinc-800 font-sans">83 KG - 93 KG</td>
                  <td className="p-2.5">108 cm - 116 cm</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">2XL</td>
                  <td className="p-2.5 border-r border-zinc-800 font-sans">93 KG - 105 KG</td>
                  <td className="p-2.5">116 cm - 126 cm</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white border-r border-zinc-800">3XL</td>
                  <td className="p-2.5 border-r border-zinc-800 font-sans">105 KG - 120 KG+</td>
                  <td className="p-2.5">126 cm+</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
