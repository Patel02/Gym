"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Send,
  Printer,
  Sparkles,
  Wifi,
  WifiOff,
  RotateCcw,
  Clock,
  ShieldAlert,
  Scale,
  Award,
} from "lucide-react";

interface MatchReportBuilderProps {
  onOpenAiAssistant?: () => void;
}

export function MatchReportBuilder({ onOpenAiAssistant }: MatchReportBuilderProps) {
  const [sessionTitle, setSessionTitle] = useState(
    "Gujarat State Powerlifting Championship 2026 — Session 2 (Men 83kg / 93kg)"
  );
  const [platform, setPlatform] = useState("Platform 1 (Main Stage)");
  const [juryPresident, setJuryPresident] = useState("K. V. Parmar (IPF Cat 1)");
  const [chiefReferee, setChiefReferee] = useState("Official Chief Technical Referee");
  const [totalAttempts, setTotalAttempts] = useState(42);
  const [goodLifts, setGoodLifts] = useState(34);
  const [noLifts, setNoLifts] = useState(8);
  const [stateRecordsWitnessed, setStateRecordsWitnessed] = useState("2 Records (Squat 245kg Patel Rakesh, Total 705kg)");
  const [disciplinaryIncidents, setDisciplinaryIncidents] = useState(
    "None. Minor verbal advisory given to Baroda coach regarding coaching box perimeter during Flight B Deadlift 3."
  );
  const [equipmentMalfunctions, setEquipmentMalfunctions] = useState(
    "None. Combo rack pin lubricated before Flight A. All lights functional."
  );
  const [generalRemarks, setGeneralRemarks] = useState(
    "Competition ran on schedule. 1-minute platform clock strictly adhered to. Spotters performed flawlessly."
  );

  const [isOnline, setIsOnline] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"SAVED" | "SAVING" | "IDLE">("SAVED");
  const [lastSavedTime, setLastSavedTime] = useState<string>("Just now");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Monitor online status
  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Autosave to localStorage on changes
  useEffect(() => {
    setSaveStatus("SAVING");
    const timer = setTimeout(() => {
      try {
        const reportData = {
          sessionTitle,
          platform,
          juryPresident,
          chiefReferee,
          totalAttempts,
          goodLifts,
          noLifts,
          stateRecordsWitnessed,
          disciplinaryIncidents,
          equipmentMalfunctions,
          generalRemarks,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("wpi_referee_match_report_draft", JSON.stringify(reportData));
        setSaveStatus("SAVED");
        setLastSavedTime(
          new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      } catch (e) {
        setSaveStatus("IDLE");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    sessionTitle,
    platform,
    juryPresident,
    chiefReferee,
    totalAttempts,
    goodLifts,
    noLifts,
    stateRecordsWitnessed,
    disciplinaryIncidents,
    equipmentMalfunctions,
    generalRemarks,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#130904] to-[#080201] p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header & Autosave Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gym-primary/20 text-gym-primary">
              <FileText className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gym-primary">
              Post-Session Submission • Phase 2
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            Official Technical Match &amp; Session Report
          </h2>
          <p className="text-xs text-zinc-400">
            Formal technical jury record submitted to the WPI Gujarat Federation Technical Committee.
          </p>
        </div>

        {/* Real-Time Autosave & Network Status Badge */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              isOnline
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{isOnline ? "Cloud Online" : "Offline Draft"}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300">
            {saveStatus === "SAVING" ? (
              <span className="flex items-center gap-1 text-gym-primary animate-pulse">
                <Save className="h-3 w-3" /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Saved ({lastSavedTime})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Session Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
              Championship Session
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-gym-primary"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
              Platform
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-gym-primary"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
              Jury President
            </label>
            <input
              type="text"
              value={juryPresident}
              onChange={(e) => setJuryPresident(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-gym-primary"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
              Chief Technical Referee
            </label>
            <input
              type="text"
              value={chiefReferee}
              onChange={(e) => setChiefReferee(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-gym-primary"
            />
          </div>
        </div>

        {/* Statistical Summary */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-900/60 border border-white/5">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Attempts</span>
            <div className="font-heading text-2xl font-bold text-white mt-1">{totalAttempts}</div>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Good Lifts (White)</span>
            <div className="font-heading text-2xl font-bold text-emerald-400 mt-1">{goodLifts}</div>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">No Lifts (Red)</span>
            <div className="font-heading text-2xl font-bold text-red-400 mt-1">{noLifts}</div>
          </div>
        </div>

        {/* Records Witnessed */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 flex items-center justify-between">
            <span>State / National Records Witnessed &amp; Certified</span>
            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
              <Award className="h-3 w-3" /> Official Ratification
            </span>
          </label>
          <input
            type="text"
            value={stateRecordsWitnessed}
            onChange={(e) => setStateRecordsWitnessed(e.target.value)}
            className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Disciplinary & Technical Incidents with AI formatting shortcut */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
              <span>Technical Infractions &amp; Conduct Cards Issued</span>
            </label>
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-400 hover:text-purple-300 hover:underline"
            >
              <Sparkles className="h-3 w-3" />
              <span>Format with AI Assistant</span>
            </button>
          </div>
          <textarea
            rows={3}
            value={disciplinaryIncidents}
            onChange={(e) => setDisciplinaryIncidents(e.target.value)}
            className="w-full rounded-xl bg-zinc-900 border border-white/10 p-3 text-xs text-zinc-200 focus:outline-none focus:border-gym-primary"
          />
        </div>

        {/* Equipment & General Remarks */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
            General Technical Jury Remarks &amp; Feedback
          </label>
          <textarea
            rows={2}
            value={generalRemarks}
            onChange={(e) => setGeneralRemarks(e.target.value)}
            className="w-full rounded-xl bg-zinc-900 border border-white/10 p-3 text-xs text-zinc-200 focus:outline-none focus:border-gym-primary"
          />
        </div>

        {/* Submission Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400">
            {isSubmitted ? (
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Report Submitted to Federation Technical Secretariat
              </span>
            ) : (
              <span>Draft automatically retained in offline browser cache</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 inline mr-1.5" />
              Print Preview
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-red-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitted ? "Submitted Successfully ✓" : "Submit Official Report"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
