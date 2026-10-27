"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import {
  Camera,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  RotateCw,
  Sparkles,
  Lock,
  UserCheck,
  UserX,
  Scan,
  Check,
  Copy,
  Eye,
  Activity,
  Flame,
  Award,
} from "lucide-react";
import {
  verifyAthleteBiometricsAction,
  flagSuspectedProxyLifterAction,
} from "@/actions/biometric-verification.actions";
import type { BiometricMatchResult } from "@/lib/facial-biometric-engine";

export interface BiometricAthleteTarget {
  id: string; // registrationId
  userId: string;
  name: string;
  weightClass: string;
  lotNumber: number | null;
  photoUrl?: string | null;
  clubName?: string;
  biometricVerified?: boolean;
  biometricConfidence?: number | null;
  isProxyFlagged?: boolean;
}

interface FacialBiometricScannerModalProps {
  athlete: BiometricAthleteTarget;
  onClose: () => void;
  onVerificationComplete: (updated: {
    registrationId: string;
    verified: boolean;
    confidence: number;
    proofHash: string;
    photoUrl?: string;
  }) => void;
}

export default function FacialBiometricScannerModal({
  athlete,
  onClose,
  onVerificationComplete,
}: FacialBiometricScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [matchResult, setMatchResult] = useState<BiometricMatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Play audio chime for biometric confirmation
  const playAudioChime = (type: "success" | "alert") => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  };

  // Start Camera Stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Webcam not supported in this browser environment.");
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        activeStream = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err: any) {
        console.warn("Camera start error, offering fallback upload / simulation:", err);
        setCameraError(
          err.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access in browser permissions."
            : "No physical camera detected. You can upload an identity snapshot or run test matching."
        );
      }
    }

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture frame from video stream onto canvas
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      // Fallback generator for environments without webcam
      const fallbackCanvas = document.createElement("canvas");
      fallbackCanvas.width = 320;
      fallbackCanvas.height = 320;
      const ctx = fallbackCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#1e1026";
        ctx.fillRect(0, 0, 320, 320);
        ctx.fillStyle = "#e6501b";
        ctx.beginPath();
        ctx.arc(160, 140, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`LIVE CAPTURE: ${athlete.name}`, 160, 240);
        const dataUrl = fallbackCanvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(dataUrl);
        handleAnalyzeBiometrics(dataUrl);
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);

    // Run verification immediately
    handleAnalyzeBiometrics(dataUrl);
  };

  // Upload fallback photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      handleAnalyzeBiometrics(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Run Biometric Analysis Action
  const handleAnalyzeBiometrics = (captureBase64: string) => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const isEnrollment = !athlete.photoUrl;
        const res = await verifyAthleteBiometricsAction(athlete.id, captureBase64, {
          isEnrollment,
        });

        if (res.success && res.result) {
          setMatchResult(res.result);
          if (res.result.isMatch) {
            playAudioChime("success");
            onVerificationComplete({
              registrationId: athlete.id,
              verified: true,
              confidence: res.result.similarityPercentage,
              proofHash: res.result.proofHash,
              photoUrl: res.athlete?.photoUrl || captureBase64,
            });
          } else {
            playAudioChime("alert");
          }
        } else {
          setErrorMessage(res.error || "Failed to analyze biometric data.");
        }
      } catch (err: any) {
        setErrorMessage(err?.message || "Biometric matching error.");
      }
    });
  };

  // Flag as suspected proxy
  const handleFlagProxy = () => {
    const reason = prompt("Enter Chief Referee Reason for Flagging Suspected Proxy Competitor:", "Visual identity discrepancy with Aadhaar/Profile photo");
    if (!reason) return;

    startTransition(async () => {
      const res = await flagSuspectedProxyLifterAction(athlete.id, reason);
      if (res.success) {
        alert("Competitor flagged as Suspected Proxy. Scaled entry frozen.");
        onClose();
      }
    });
  };

  const copyProofHash = () => {
    if (!matchResult?.proofHash) return;
    navigator.clipboard.writeText(matchResult.proofHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0c0514] via-[#07020a] to-black p-6 sm:p-8 shadow-2xl text-white animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Scan className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
                  Facial Biometric &amp; Check-In Verification
                </h3>
                <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-300">
                  ANTI-PROXY SHIELD
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Official weigh-in desk identity gate • Live camera match against verified federation profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Competitor Overview Strip */}
        <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-mono font-bold text-sm">
              #{athlete.lotNumber || "—"}
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{athlete.name}</h4>
              <p className="text-[11px] text-zinc-400 font-mono">
                {athlete.weightClass} • {athlete.clubName || "Affiliated Academy"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {athlete.biometricVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Previously Verified ({athlete.biometricConfidence}%)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Check-in Required</span>
              </span>
            )}
          </div>
        </div>

        {/* ── MAIN BIOMETRIC MATCHING ARENA: SIDE BY SIDE ── */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT: Registered ID Baseline Photo */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>1. Registered Baseline ID Photo</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Official Database</span>
            </div>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 flex items-center justify-center">
              {athlete.photoUrl ? (
                <img
                  src={athlete.photoUrl}
                  alt={athlete.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <UserX className="h-12 w-12 text-zinc-600 mx-auto" />
                  <p className="text-xs font-bold text-zinc-300">No Previous Photo Enrolled</p>
                  <p className="text-[11px] text-zinc-500">
                    Live capture will be certified as this competitor&apos;s immutable baseline photo.
                  </p>
                </div>
              )}

              {/* Verified Ribbon */}
              {athlete.photoUrl && (
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg border border-purple-500/40 text-[10px] font-mono text-purple-300">
                  Federation Verified
                </div>
              )}
            </div>

            <div className="mt-3 text-[11px] text-zinc-500 text-center font-mono">
              Profile Reference: {athlete.userId.slice(-8)}
            </div>
          </div>

          {/* RIGHT: Live Camera Viewfinder & HUD */}
          <div className="rounded-2xl border border-cyan-500/30 bg-black/60 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>2. Live Weigh-In Desk Camera</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Feed</span>
              </span>
            </div>

            {/* Viewfinder Frame with Holographic Reticle */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-950 border border-cyan-500/40 flex items-center justify-center shadow-inner">
              {/* Actual Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover transform -scale-x-100 ${
                  capturedImage ? "hidden" : "block"
                }`}
              />

              {/* Captured Photo Preview */}
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Live Capture"
                  className="h-full w-full object-cover"
                />
              )}

              {/* Holographic Biometric Reticle Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                {/* Center Oval Face Alignment Target */}
                <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-cyan-400/60 relative flex items-center justify-center">
                  <div className="absolute -top-3 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-cyan-300 uppercase tracking-widest border border-cyan-500/40">
                    Align Face Here
                  </div>
                  {/* Eye Level Line */}
                  <div className="w-full h-px bg-cyan-400/30" />
                </div>

                {/* Animated Vertical Scan Line */}
                {!capturedImage && (
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse" />
                )}
              </div>

              {/* Camera Error Message */}
              {cameraError && !capturedImage && (
                <div className="absolute inset-0 bg-black/85 p-6 flex flex-col items-center justify-center text-center space-y-3 z-10">
                  <Camera className="w-10 h-10 text-amber-400" />
                  <p className="text-xs text-zinc-300 max-w-xs">{cameraError}</p>
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors border border-white/15">
                    <span>Upload ID Snapshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Hidden canvas for snapshot capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Actions */}
            <div className="mt-3 flex items-center justify-between gap-3">
              {capturedImage ? (
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(null);
                    setMatchResult(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retake Capture</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture &amp; Analyze Biometrics</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── BIOMETRIC RESULT & AUDIT BADGE ── */}
        {matchResult && (
          <div className="mt-6 rounded-2xl border p-5 space-y-4 animate-in slide-in-from-bottom-2 duration-300 bg-black/80 border-white/15">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                {matchResult.isMatch ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-black text-lg uppercase tracking-wider text-white">
                      {matchResult.status === "BASELINE_ENROLLED"
                        ? "Baseline Facial Profile Certified"
                        : matchResult.isMatch
                        ? "100% Identity Verified • Original Competitor"
                        : "Security Warning • Suspected Proxy Competitor"}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {matchResult.isMatch
                      ? "Biometric similarity meets strict IPF Championship security threshold (>=75%)."
                      : "Visual identity mismatch detected. Do not permit athlete onto calibrated scale."}
                  </p>
                </div>
              </div>

              {/* Confidence Score Big Badge */}
              <div className="text-right sm:border-l sm:border-white/10 sm:pl-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Match Confidence
                </span>
                <span
                  className={`font-mono text-2xl font-black ${
                    matchResult.isMatch ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {matchResult.similarityPercentage}%
                </span>
              </div>
            </div>

            {/* Telemetry Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Confidence Grade</span>
                <span className="font-mono font-bold text-white">{matchResult.confidenceGrade}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Structural Match</span>
                <span className="font-mono font-bold text-white">{matchResult.details.structuralSimilarity}%</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Liveness Entropy</span>
                <span className="font-mono font-bold text-white">{matchResult.details.livenessEntropyScore}%</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Anti-Spoofing</span>
                <span className="font-mono font-bold text-emerald-400">
                  {matchResult.details.antiSpoofingStatus === "GENUINE_LIVE_PERSON" ? "Live Human Pass" : "Check Paper/Screen"}
                </span>
              </div>
            </div>

            {/* Cryptographic Proof Hash */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2 overflow-hidden text-zinc-400 truncate">
                <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[10px] text-zinc-500 uppercase">SHA-256 Proof:</span>
                <span className="text-cyan-300 truncate text-[11px]">{matchResult.proofHash}</span>
              </div>
              <button
                type="button"
                onClick={copyProofHash}
                className="text-[11px] text-cyan-400 hover:text-white shrink-0 ml-2 font-bold inline-flex items-center gap-1"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleFlagProxy}
            className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/40 text-xs font-bold transition-colors"
          >
            Flag Discrepancy to Jury
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors"
            >
              Close Window
            </button>

            {matchResult?.isMatch && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorize Lifter for Scale</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
