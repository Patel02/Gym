"use client";

import { useState, useRef } from "react";
import { 
  FileText, 
  Loader2, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles,
  Upload,
  CheckCircle2,
  X,
  FileCheck,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publishCircular } from "@/actions/cms.actions";

export function CircularUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [useUrlMode, setUseUrlMode] = useState(false);

  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Popup Modal State for Admin Notification
  const [livePopup, setLivePopup] = useState<{
    isOpen: boolean;
    title: string;
    fileUrl: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
      // Auto-suggest title from filename if title is empty
      if (!title.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
      if (!title.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const handlePublishLive = async () => {
    setErrorMessage(null);

    const normalizedTitle = title.trim();
    if (!normalizedTitle && !selectedFile && !manualUrl.trim()) {
      setErrorMessage("Please select a PDF file first, or enter a document title.");
      fileInputRef.current?.click();
      return;
    }

    if (!selectedFile && !manualUrl.trim()) {
      setErrorMessage("Please choose a PDF / Image file to upload.");
      fileInputRef.current?.click();
      return;
    }

    const finalTitle = normalizedTitle || selectedFile?.name.replace(/\.[^/.]+$/, "") || "Official Federation Document";

    setIsPublishing(true);

    try {
      let publishedUrl = "";

      if (selectedFile) {
        // Direct FormData upload to /api/admin/circulars
        const formData = new FormData();
        formData.append("title", finalTitle);
        formData.append("file", selectedFile);

        const res = await fetch("/api/admin/circulars", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Upload failed. Please try again.");
        }

        publishedUrl = data.circular?.fileUrl || `/uploads/circulars/${selectedFile.name}`;
      } else {
        // Direct URL mode
        const res = await publishCircular(finalTitle, manualUrl.trim());
        if (!res.success) {
          throw new Error(res.error || "Failed to publish circular.");
        }
        publishedUrl = manualUrl.trim();
      }

      // Play success chime sound
      playSuccessChime();

      // Trigger POPUP NOTIFICATION for Admin
      setLivePopup({
        isOpen: true,
        title: finalTitle,
        fileUrl: publishedUrl,
      });

      // Reset Form fields
      setTitle("");
      setSelectedFile(null);
      setManualUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh page data so list below updates immediately
      router.refresh();
    } catch (err: any) {
      console.error("Publishing error:", err);
      setErrorMessage(err.message || "Failed to publish document. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    if (!livePopup?.fileUrl) return;
    const fullUrl = livePopup.fileUrl.startsWith("http")
      ? livePopup.fileUrl
      : `${window.location.origin}${livePopup.fileUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* ── Document Title Input ── */}
      <div>
        <label className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-300">
          <span>1. Document Title *</span>
          <span className="text-[11px] text-gym-primary font-bold">Visible on public pages</span>
        </label>
        <input
          type="text"
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. National Senior Powerlifting Championship 2026 Entry Circular"
          className="w-full rounded-2xl border border-white/15 bg-black/60 px-5 py-3.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-gym-primary focus:outline-none"
        />
      </div>

      {/* ── File Selector or Drag & Drop Zone ── */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-300">
          <span>2. Choose PDF or Image Document *</span>
          <button
            type="button"
            onClick={() => setUseUrlMode(!useUrlMode)}
            className="text-[11px] text-gray-400 hover:text-gym-primary underline cursor-pointer"
          >
            {useUrlMode ? "Switch to Local File Upload" : "Have an online PDF link? Click here"}
          </button>
        </div>

        {useUrlMode ? (
          <div>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://.../official-circular.pdf"
                className="w-full rounded-2xl border border-white/15 bg-black/60 pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="circular-file-input"
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-[#140604]/50 p-8 text-center cursor-pointer hover:border-gym-primary/60 hover:bg-gym-primary/5 transition-all group"
              >
                <div className="mb-3 rounded-full bg-white/5 p-4 text-gym-primary group-hover:scale-110 transition-transform">
                  <Upload className="h-7 w-7" />
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  Click to select file or drag & drop here
                </div>
                <div className="text-xs text-gray-400">
                  PDF documents, rulebooks, circulars, or images (Up to 25MB)
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4.5">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400">
                    <FileCheck className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                      File Ready to Publish
                    </div>
                    <div className="text-sm font-bold text-white truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for Live Server
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Error Message Alert ── */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-xs font-bold text-red-300 animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Big Prominent Publish & Make Live Button ── */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isPublishing}
          onClick={handlePublishLive}
          className={`w-full relative group overflow-hidden flex items-center justify-center gap-3.5 rounded-2xl px-8 py-5 font-heading text-base sm:text-lg font-bold uppercase tracking-wider text-white transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
            selectedFile || manualUrl.trim()
              ? "bg-gradient-to-r from-emerald-600 via-gym-primary to-gym-red shadow-[0_0_35px_rgba(230,80,27,0.6)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:scale-[1.01] active:scale-[0.99] ring-2 ring-emerald-400/60"
              : "bg-gradient-to-r from-gym-primary via-[#ff6a30] to-gym-red shadow-[0_0_25px_rgba(230,80,27,0.4)] hover:brightness-110"
          }`}
        >
          {/* Animated Sheen Overlay */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          {isPublishing ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-white" />
              <span>Uploading & Publishing Live to Website...</span>
            </>
          ) : selectedFile ? (
            <>
              <Sparkles className="h-6 w-6 text-yellow-300 animate-bounce" />
              <span>🚀 PUBLISH & MAKE DOCUMENT 100% LIVE NOW 🚀</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-white" />
              <span>Publish & Make Live to Website</span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2.5 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Clicking will upload, save to database, and push live instantly to <strong className="text-white">/circulars</strong> and <strong className="text-white">/#events</strong></span>
        </p>
      </div>

      {/* ══════════════ POPUP NOTIFICATION MODAL (SUCCESS) ══════════════ */}
      {livePopup?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-xl rounded-3xl border-2 border-emerald-500/70 bg-[#120402] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.4)] relative">
            
            {/* Close X */}
            <button
              type="button"
              onClick={() => setLivePopup(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Popup Content */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="h-11 w-11" />
              </div>

              <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-semibold uppercase tracking-widest text-emerald-300 mb-2">
                ✓ Successfully Published
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
                Document is Now 100% Live!
              </h3>
              
              <p className="text-xs sm:text-sm text-gray-300 mt-2">
                Your official document has been added to the database and is now live across all public federation pages.
              </p>

              {/* Document Summary Box */}
              <div className="mt-5 text-left rounded-2xl border border-white/15 bg-black/70 p-4 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gym-primary">
                  Published Document Title
                </div>
                <div className="text-sm sm:text-base font-bold text-white leading-snug">
                  {livePopup.title}
                </div>
                <div className="text-[11px] text-emerald-400 font-bold pt-1 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Status: Active & Downloadable by Public</span>
                </div>
              </div>

              {/* Quick Action Navigation Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/circulars"
                  target="_blank"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>View on /circulars Page</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>

                <Link
                  href="/#events"
                  target="_blank"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
                >
                  <span>View on Homepage</span>
                  <ExternalLink className="h-4 w-4 text-gym-primary" />
                </Link>

                <a
                  href={livePopup.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-200 hover:text-white transition-all"
                >
                  <FileText className="h-4 w-4 text-gym-primary" />
                  <span>Open PDF</span>
                </a>
              </div>

              {/* Copy Link & Done */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 text-gray-300 hover:text-gym-primary transition-colors cursor-pointer font-bold"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "Link Copied to Clipboard!" : "Copy Shareable Link"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLivePopup(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Done / Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}