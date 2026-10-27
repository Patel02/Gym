"use client";

import React, { useState, useMemo } from "react";
import {
  CutDiagnostics,
  DayHydrationPlan,
  TWO_HOUR_REFEED_SCHEDULE,
  BACKSTAGE_GROCERY_CHECKLIST,
} from "@/lib/weigh-in-nutrition";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import {
  Printer,
  Copy,
  Check,
  Share2,
  FileText,
  Shield,
  Utensils,
  Droplets,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface OfficialNutritionPdfPrintProps {
  athleteName: string;
  diagnostics: CutDiagnostics;
  schedule: DayHydrationPlan[];
}

export function OfficialNutritionPdfPrint({
  athleteName,
  diagnostics,
  schedule,
}: OfficialNutritionPdfPrintProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp formatted meal message
  const whatsappMessage = useMemo(() => {
    let msg = `🥗 *IPF WATER CUT & RAPID REFEED PROTOCOL*\n`;
    msg += `🏋️ Athlete: *${athleteName}*\n`;
    msg += `⚖️ Weight: *${diagnostics.currentWeightKg} KG* ➡️ Target: *${diagnostics.targetWeightKg} KG* (Cut: *${diagnostics.cutWeightKg} KG / ${diagnostics.cutPercentage}%*)\n`;
    msg += `🛡️ Safety Tier: *${diagnostics.safetyTier}*\n`;
    msg += `💧 Required Refeed Fluids: *${diagnostics.rehydrationFluidNeededLiters} LITERS*\n\n`;

    msg += `📅 *5-DAY WATER SCHEDULE:*\n`;
    schedule.forEach((d) => {
      msg += `• ${d.dayLabel}: *${d.waterLiters}L* | Sodium: *${d.sodiumStatus}* (${d.title})\n`;
    });

    msg += `\n⏱️ *2-HOUR POST WEIGH-IN REFEED:*\n`;
    TWO_HOUR_REFEED_SCHEDULE.forEach((m) => {
      msg += `• ${m.minuteRange}: ${m.fluidAmountMl}ml (${m.fluidType}) + ${m.carbsGrams}g carbs\n`;
    });

    msg += `\nCertified by Coach Akash & Coach Tanvi (Sports Nutritionists)\n`;
    msg += `A&T Official Powerlifting Hub`;

    return encodeURIComponent(msg);
  }, [athleteName, diagnostics, schedule]);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      let text = `IPF WATER CUT & REFEED PROTOCOL: ${athleteName}\n`;
      text += `Cut: ${diagnostics.currentWeightKg}kg -> ${diagnostics.targetWeightKg}kg (${diagnostics.cutWeightKg}kg / ${diagnostics.cutPercentage}%)\n`;
      text += `Safety: ${diagnostics.safetyTier} | Refeed Fluids: ${diagnostics.rehydrationFluidNeededLiters}L\n\n`;
      text += `5-DAY SCHEDULE:\n`;
      schedule.forEach((d) => {
        text += `${d.dayLabel}: ${d.waterLiters}L (${d.title}) - Sodium: ${d.sodiumStatus}\n`;
      });
      text += `\n2-HOUR REFEED:\n`;
      TWO_HOUR_REFEED_SCHEDULE.forEach((m) => {
        text += `${m.minuteRange}: ${m.title} (${m.fluidAmountMl}ml, ${m.carbsGrams}g carbs)\n`;
      });

      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const printStyles = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
      html, body {
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body > *:not(#print-nutrition-container) {
        display: none !important;
      }
      .no-print {
        display: none !important;
      }
      #print-nutrition-container {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        width: 100% !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      #print-nutrition-sheet {
        display: block !important;
        visibility: visible !important;
      }
    }
  `;

  return (
    <div className="space-y-8" id="print-nutrition-container">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* ── SCREEN VIEW: HEADER ACTIONS ── */}
      <div className="no-print relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gym-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">
                Certified Sports Nutrition Protocol
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider font-heading">
              Official Printable Refeed Sheet &amp; Packing List
            </h2>
            <p className="text-xs text-zinc-400">
              Clean clipboard layout for athletes and backstage coaches. Includes 5-day fluid ramp, 2-hour post weigh-in clock, and grocery packing list.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <WhatsAppIcon variant="official" className="h-4 w-4" />
              <span>WhatsApp Brief</span>
            </a>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Sheet (A4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── OFFICIAL NUTRITION PROTOCOL SHEET (DUAL SCREEN / PRINT RENDERING) ── */}
      <div
        id="print-nutrition-sheet"
        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl text-white print:border-2 print:border-black print:bg-white print:text-black print:p-6 print:rounded-none print:shadow-none"
      >
        {/* Top Federation Header */}
        <div className="border-b-2 border-zinc-800 print:border-black pb-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gym-primary print:text-black" />
              <span className="text-xs font-bold uppercase tracking-widest text-gym-primary print:text-black">
                A&amp;T FITNESS &amp; NUTRITION DIRECTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider font-heading text-white print:text-black">
              Official Weigh-In &amp; Rapid Refeed Protocol
            </h1>
            <p className="text-[11px] text-zinc-400 print:text-zinc-600">
              Approved by Coach Akash &amp; Coach Tanvi (Certified Sports Nutritionists &amp; IPF Directors)
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block rounded border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary print:border-black print:bg-zinc-100 print:text-black">
              SAFETY GRADE: {diagnostics.safetyTier}
            </span>
          </div>
        </div>

        {/* Athlete Diagnostic Summary */}
        <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-zinc-800 print:border-black rounded-xl p-4 bg-black/40 print:bg-zinc-50">
          <div>
            <span className="text-zinc-400 print:text-zinc-600 uppercase font-bold block text-[10px]">
              Athlete Name
            </span>
            <span className="font-black text-white print:text-black text-sm uppercase">
              {athleteName}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 print:text-zinc-600 uppercase font-bold block text-[10px]">
              Walk-Around Weight
            </span>
            <span className="font-black text-white print:text-black text-sm">
              {diagnostics.currentWeightKg} KG
            </span>
          </div>
          <div>
            <span className="text-zinc-400 print:text-zinc-600 uppercase font-bold block text-[10px]">
              Target Category Limit
            </span>
            <span className="font-black text-white print:text-black text-sm">
              {diagnostics.targetWeightKg} KG ({diagnostics.cutWeightKg}kg / {diagnostics.cutPercentage}% Cut)
            </span>
          </div>
          <div>
            <span className="text-zinc-400 print:text-zinc-600 uppercase font-bold block text-[10px]">
              Required Refeed Fluids
            </span>
            <span className="font-black text-gym-primary print:text-black text-sm">
              {diagnostics.rehydrationFluidNeededLiters} LITERS
            </span>
          </div>
        </div>

        {/* ── 5-DAY WATER SCHEDULE TABLE ── */}
        <div className="my-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white print:text-black">
            <Droplets className="h-4 w-4 text-blue-400 print:text-black" />
            <span>5-Day Water Loading &amp; Sodium Manipulation Table</span>
          </div>
          <table className="w-full text-left border-collapse border border-zinc-800 print:border-black text-xs">
            <thead>
              <tr className="bg-zinc-900 print:bg-zinc-200 border-b border-zinc-800 print:border-black">
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black border-r border-zinc-800 print:border-black">Day</th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black border-r border-zinc-800 print:border-black">Phase</th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black text-center border-r border-zinc-800 print:border-black">Water</th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black text-center border-r border-zinc-800 print:border-black">Sodium</th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black">Dietary Directives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 print:divide-black">
              {schedule.map((d) => (
                <tr key={d.dayLabel}>
                  <td className="p-2.5 font-black text-white print:text-black border-r border-zinc-800 print:border-black whitespace-nowrap">
                    {d.dayLabel}
                  </td>
                  <td className="p-2.5 font-bold text-zinc-300 print:text-black border-r border-zinc-800 print:border-black">
                    {d.title}
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-blue-400 print:text-black border-r border-zinc-800 print:border-black">
                    {d.waterLiters}L
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-zinc-300 print:text-black border-r border-zinc-800 print:border-black">
                    {d.sodiumStatus}
                  </td>
                  <td className="p-2.5 text-[11px] text-zinc-400 print:text-zinc-700">
                    {d.coachDirectives}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── 2-HOUR RAPID REFEED TIMELINE TABLE ── */}
        <div className="my-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white print:text-black">
            <Utensils className="h-4 w-4 text-gym-primary print:text-black" />
            <span>Post Weigh-In 120-Minute Rapid Refeed Sequence</span>
          </div>
          <table className="w-full text-left border-collapse border border-zinc-800 print:border-black text-xs">
            <thead>
              <tr className="bg-zinc-900 print:bg-zinc-200 border-b border-zinc-800 print:border-black">
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black border-r border-zinc-800 print:border-black">Time</th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black border-r border-zinc-800 print:border-black">Goal</th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black text-center border-r border-zinc-800 print:border-black">Fluids</th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black text-center border-r border-zinc-800 print:border-black">Carbs</th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black">Prescribed Fuel Sources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 print:divide-black">
              {TWO_HOUR_REFEED_SCHEDULE.map((m) => (
                <tr key={m.minuteRange}>
                  <td className="p-2.5 font-black text-white print:text-black border-r border-zinc-800 print:border-black whitespace-nowrap">
                    {m.minuteRange}
                  </td>
                  <td className="p-2.5 font-bold text-zinc-300 print:text-black border-r border-zinc-800 print:border-black">
                    {m.title}
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-blue-400 print:text-black border-r border-zinc-800 print:border-black">
                    {m.fluidAmountMl}ml
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-amber-400 print:text-black border-r border-zinc-800 print:border-black">
                    {m.carbsGrams}g
                  </td>
                  <td className="p-2.5 text-[11px] text-zinc-400 print:text-zinc-700">
                    {m.recommendedFoods.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── GROCERY PACKING CHECKLIST ── */}
        <div className="my-6 rounded-xl border border-zinc-800 print:border-black p-4 bg-zinc-900/40 print:bg-zinc-50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white print:text-black">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 print:text-black" />
            <span>Official Backstage Grocery &amp; Electrolyte Packing List</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {BACKSTAGE_GROCERY_CHECKLIST.map((item) => (
              <div key={item.name} className="flex items-start gap-2 text-zinc-300 print:text-black">
                <span className="font-bold text-gym-primary print:text-black">[ ]</span>
                <div>
                  <strong className="text-white print:text-black">{item.name}</strong> ({item.amountNeeded})
                  <span className="block text-[10px] text-zinc-500 print:text-zinc-600">{item.purpose}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures & Certification Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800 print:border-black grid grid-cols-2 gap-6 text-xs">
          <div className="border-t border-zinc-700 print:border-black pt-2 text-center">
            <span className="font-bold text-zinc-400 print:text-black block text-[10px] uppercase">
              Certified Sports Nutritionist
            </span>
            <span className="font-mono text-zinc-500 print:text-black text-[11px]">
              Coach Akash &amp; Coach Tanvi (Ratified)
            </span>
          </div>

          <div className="border-t border-zinc-700 print:border-black pt-2 text-center">
            <span className="font-bold text-zinc-400 print:text-black block text-[10px] uppercase">
              Competitor Lifter Declaration
            </span>
            <span className="font-mono text-zinc-500 print:text-black text-[11px]">
              {athleteName} (Confirmed NADA Strict Liability)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
