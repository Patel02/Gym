"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  Copy,
  Check,
  Wand2,
  FileText,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface AiReportAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText?: (formattedText: string) => void;
}

export function AiReportAssistantModal({
  isOpen,
  onClose,
  onApplyText,
}: AiReportAssistantModalProps) {
  const [roughNotes, setRoughNotes] = useState(
    "Lifter Patel Rakesh 83kg bench attempt 2 165kg bar moved downward after press call. Right referee gave white, head and left gave red. Coach from Baroda stepped onto platform perimeter arguing. Yellow card issued to coach by Chief Referee."
  );

  const [formattedReport, setFormattedReport] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = `[OFFICIAL TECHNICAL JURY INCIDENT REPORT — IPF RULEBOOK SECTION 8]
INCIDENT ID: INC-2026-GUJ-083

1. TECHNICAL PLATFORM OBSERVATION:
During Men's Open 83kg category Bench Press Attempt #2 (165.0 kg declared), competitor Patel Rakesh received a 2-1 NO LIFT decision. Video review confirmed observable downward movement of the barbell during the upward press phase following the Chief Referee's audible "PRESS" signal (Technical Infraction: IPF Rulebook Item 8.4.1).

2. REFEREE DECISION VERIFICATION:
- Head Referee: RED (Downward Bar Motion)
- Left Side Referee: RED (Downward Bar Motion)
- Right Side Referee: WHITE
Decision upheld unanimously by Technical Jury without overturn requirement.

3. DISCIPLINARY & CODE OF CONDUCT RECORD:
Accredited coach representing Baroda District breached the designated 1.0-meter technical coaching perimeter and approached the platform apron in an aggressive manner to contest the decision. In accordance with IPF Code of Ethics & Conduct Guidelines Article 14.2:
- Action Taken: Chief Technical Referee issued an Official YELLOW CONDUCT WARNING CARD.
- Status: Recorded in match ledger. Second violation shall result in full arena disqualification.

4. CLOSING CERTIFICATION:
Session resumed with minimal platform disruption. Barbell recalibrated and platform certified secure.
Technical Sign-Off: Chief Technical Referee & Jury President`;

      setFormattedReport(generated);
      setIsGenerating(false);
    }, 700);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyText) {
      onApplyText(formattedReport);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-purple-500/30 bg-[#0c0512] p-6 shadow-[0_0_60px_rgba(168,85,247,0.2)] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                AI Technical Incident Report Assistant
              </h3>
              <p className="text-[11px] text-zinc-400">
                Transforms rough notes into formal IPF Section 8 Technical Jury Incident language.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Rough Notes */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center justify-between">
            <span>Referee Rough Notes &amp; Observations</span>
            <span className="text-zinc-500">Plain text / bullet points</span>
          </label>
          <textarea
            rows={3}
            value={roughNotes}
            onChange={(e) => setRoughNotes(e.target.value)}
            placeholder="Type quick bullet points, e.g. lifter name, attempt #, reason for red light, coach argument, card issued..."
            className="w-full rounded-xl bg-black/60 border border-white/15 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !roughNotes.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            <span>{isGenerating ? "Formatting Official Language..." : "Generate Standardized IPF Report"}</span>
          </button>
        </div>

        {/* Output Standardized Box */}
        {formattedReport && (
          <div className="space-y-2 pt-2 border-t border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                Generated IPF Formal Technical Incident Record
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-300 hover:text-white"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <pre className="w-full max-h-56 overflow-y-auto rounded-xl bg-black/80 border border-purple-500/30 p-3.5 text-[11px] font-mono text-purple-100/90 whitespace-pre-wrap leading-relaxed">
              {formattedReport}
            </pre>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-1.5 rounded-xl bg-gym-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-600 transition-colors"
              >
                <span>Insert into Session Report</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
