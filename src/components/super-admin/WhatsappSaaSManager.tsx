"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  MessageSquare,
  Zap,
  Send,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Radio,
  Sliders,
  LifeBuoy,
  UserCheck,
  Sparkles,
  Search,
  Phone,
  User,
  Edit3,
  X,
  Users,
} from "lucide-react";
import {
  getWhatsappSaaSConfigAction,
  saveWhatsappSaaSConfigAction,
  getWhatsappAlertLogsAction,
  testSendWhatsappAlertAction,
} from "@/actions/whatsapp-alerts.actions";
import {
  searchAllSystemUsersForPhoneAction,
  updateAnyUserPhoneBySuperAdminAction,
} from "@/actions/super-admin.actions";

export default function WhatsappSaaSManager() {
  const [config, setConfig] = useState({
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioPhoneNumber: "whatsapp:+14155238886",
    isAutoDispatchEnabled: false,
    alertCurtainMinutes: 3,
    hasAuthToken: false,
  });

  const [showAuthToken, setShowAuthToken] = useState(false);
  const [authTokenInput, setAuthTokenInput] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isSavingConfig, startSaveConfig] = useTransition();
  const [isTesting, startTestSend] = useTransition();

  // Test tool state
  const [testPhone, setTestPhone] = useState("+91");
  const [testPosition, setTestPosition] = useState<"ON_PLATFORM" | "IN_HOLE" | "IN_RACK">("IN_HOLE");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    waUrl?: string;
    method?: string;
    error?: string;
  } | null>(null);

  // Directory & Override state
  const [directoryUsers, setDirectoryUsers] = useState<any[]>([]);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [editingDirectoryUser, setEditingDirectoryUser] = useState<any | null>(null);
  const [overridePhone, setOverridePhone] = useState("");
  const [overrideCoachPhone, setOverrideCoachPhone] = useState("");
  const [overrideCoachName, setOverrideCoachName] = useState("");
  const [isSavingOverride, startSaveOverride] = useTransition();

  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  };

  // Load SaaS config, logs & user directory on mount
  useEffect(() => {
    async function loadData() {
      try {
        const configRes = await getWhatsappSaaSConfigAction();
        if (configRes.success && configRes.config) {
          setConfig({
            twilioAccountSid: configRes.config.twilioAccountSid,
            twilioAuthToken: "",
            twilioPhoneNumber: configRes.config.twilioPhoneNumber,
            isAutoDispatchEnabled: configRes.config.isAutoDispatchEnabled,
            alertCurtainMinutes: configRes.config.alertCurtainMinutes,
            hasAuthToken: configRes.config.hasAuthToken,
          });
        }
      } catch (err) {
        console.error("Failed to load config:", err);
      }

      fetchLogs();
      fetchDirectoryUsers();
    }

    loadData();
  }, []);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logsRes = await getWhatsappAlertLogsAction();
      if (logsRes.success && logsRes.logs) {
        setLogs(logsRes.logs);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchDirectoryUsers = async (query = "") => {
    setIsLoadingDirectory(true);
    try {
      const res = await searchAllSystemUsersForPhoneAction(query);
      if (res.success && res.users) {
        setDirectoryUsers(res.users);
      } else if (!res.success && res.error) {
        showNotification("error", res.error);
      }
    } catch (err: any) {
      console.error("Failed to load user directory:", err);
      showNotification("error", err?.message || "Failed to load directory");
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  const openOverrideModal = (user: any) => {
    setEditingDirectoryUser(user);
    setOverridePhone(user.phone || user.profile?.phoneNumber || "");
    setOverrideCoachPhone(user.profile?.coachPhone || "");
    setOverrideCoachName(user.profile?.coachName || "");
  };

  const handleSavePhoneOverride = () => {
    if (!editingDirectoryUser) return;
    startSaveOverride(async () => {
      try {
        const res = await updateAnyUserPhoneBySuperAdminAction({
          userId: editingDirectoryUser.id,
          phone: overridePhone,
          coachPhone: overrideCoachPhone,
          coachName: overrideCoachName,
        });

        if (res.success) {
          showNotification("success", res.message || "Contact details updated successfully!");
          setEditingDirectoryUser(null);
          fetchDirectoryUsers(directoryQuery);
        } else {
          showNotification("error", res.error || "Failed to update user phone.");
        }
      } catch (err: any) {
        showNotification("error", err.message || "Error updating phone number.");
      }
    });
  };

  const handleSaveConfig = () => {
    startSaveConfig(async () => {
      const payload: any = {
        twilioAccountSid: config.twilioAccountSid.trim(),
        twilioPhoneNumber: config.twilioPhoneNumber.trim(),
        isAutoDispatchEnabled: config.isAutoDispatchEnabled,
        alertCurtainMinutes: Number(config.alertCurtainMinutes) || 3,
      };

      if (authTokenInput.trim()) {
        payload.twilioAuthToken = authTokenInput.trim();
      }

      const res = await saveWhatsappSaaSConfigAction(payload);
      if (res.success) {
        showNotification("success", res.message || "WhatsApp SaaS configuration updated.");
        if (authTokenInput.trim()) {
          setConfig((prev) => ({ ...prev, hasAuthToken: true }));
          setAuthTokenInput("");
        }
      } else {
        showNotification("error", res.error || "Failed to update configuration.");
      }
    });
  };

  const handleRunTest = () => {
    if (!testPhone.trim() || testPhone === "+91") {
      showNotification("error", "Please provide a valid recipient phone number with country code.");
      return;
    }

    setTestResult(null);
    startTestSend(async () => {
      const res = await testSendWhatsappAlertAction({
        testPhoneNumber: testPhone.trim(),
        queuePosition: testPosition,
      });

      setTestResult(res);
      fetchLogs();

      if (res.success) {
        showNotification("success", res.message);
      } else {
        showNotification("error", res.error || res.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Toast Banner */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold backdrop-blur-xl animate-in fade-in slide-in-from-top duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-950/40"
              : "bg-red-950/90 border-red-500/50 text-red-200 shadow-red-950/40"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-[90px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <MessageSquare className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                SaaS WhatsApp Call Room Hub
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Hybrid Queue Alerts & Twilio Fail-Safe System
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Provides automated WhatsApp alerts for live meets, with a guaranteed 100% free{" "}
              <span className="text-emerald-400 font-semibold font-mono">wa.me</span> direct fallback
              that never stops working even during API downtime or exhausted account balance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">System Status</div>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-black text-emerald-300">
                  {config.isAutoDispatchEnabled ? "⚡ Auto Twilio + Fallback" : "📲 Free 1-Click Active"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Resilience Architecture Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card A: Automated Twilio API */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Channel A: Automated Twilio API</h3>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border ${
                config.isAutoDispatchEnabled
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {config.isAutoDispatchEnabled ? "Enabled" : "Manual Only"}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Sends automated WhatsApp messages in the background directly when referee decisions are recorded.
            Athletes and coaches get notified on their lock screens without meet marshals lifting a finger.
          </p>
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-amber-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Requires API Balance</span>
            </div>
            <p className="text-[11px] text-amber-200/80">
              If Twilio balance expires or network times out, Channel B instantly takes over with zero disruption.
            </p>
          </div>
        </div>

        {/* Card B: 100% Free 1-Click wa.me Direct Link */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Channel B: 1-Click Free WhatsApp Link</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-500/30 text-emerald-200 border border-emerald-500/50">
              100% Free • Zero Downtime
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Pre-formats official IPF-grade queue directives into direct <code className="text-emerald-400">wa.me</code> links.
            Coaches, desk marshals, and admins can tap 1 button on their phone or laptop to launch WhatsApp and ping lifters instantly.
          </p>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Role Accessibility</span>
            </div>
            <p className="text-[11px] text-emerald-200/80">
              Available to Coaches in Warmup Room (`/live/warmup`), Admins on Platform Console (`/admin/live-scoring`), and Super Admin.
            </p>
          </div>
        </div>
      </div>

      {/* Main SaaS Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Twilio API & SaaS Fleet Configuration</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Target: Global Platform</span>
            </div>

            <div className="space-y-5">
              {/* Auto Dispatch Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950/70">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Automated Twilio Dispatch</span>
                    {config.isAutoDispatchEnabled ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        MANUAL ONLY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Automatically trigger Twilio WhatsApp API on attempt completion for next 3 lifters.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.isAutoDispatchEnabled}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, isAutoDispatchEnabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Twilio Account SID */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-2">
                  Twilio Account SID
                </label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={config.twilioAccountSid}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, twilioAccountSid: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                />
              </div>

              {/* Twilio Auth Token */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400">
                    Twilio Auth Token
                  </label>
                  {config.hasAuthToken && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Configured in database</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showAuthToken ? "text" : "password"}
                    placeholder={
                      config.hasAuthToken
                        ? "•••••••••••••••••••••••••••••••• (Leave blank to keep current)"
                        : "Enter Twilio Auth Token..."
                    }
                    value={authTokenInput}
                    onChange={(e) => setAuthTokenInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 pr-12 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthToken(!showAuthToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showAuthToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Twilio From Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-2">
                    From WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="whatsapp:+14155238886"
                    value={config.twilioPhoneNumber}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, twilioPhoneNumber: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Twilio Sandbox or Approved Sender</p>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-2">
                    Alert Curtain Lead Time
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={config.alertCurtainMinutes}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          alertCurtainMinutes: Number(e.target.value) || 3,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                      Minutes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Estimated warm-up alert margin</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSavingConfig ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Save WhatsApp SaaS Config</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Test Dispatch Tool */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Send className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Live Alert Testing Tool</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Test the dispatch engine in real time. Sends an official queue directive to verify
                both automated Twilio delivery and instant <code className="text-emerald-400">wa.me</code> fallback link.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1.5">
                    Test Mobile Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+919876543210"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1.5">
                    Test Directive Position
                  </label>
                  <select
                    value={testPosition}
                    onChange={(e) => setTestPosition(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="ON_PLATFORM">1. NOW ON PLATFORM (Urgent call to chalk box)</option>
                    <option value="IN_HOLE">2. IN THE HOLE (Next Lifter - Wraps on, to curtain)</option>
                    <option value="IN_RACK">3. IN THE RACK (2nd Next - Final warmup prep)</option>
                  </select>
                </div>

                <button
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Test Alert...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Test Alert</span>
                    </>
                  )}
                </button>

                {testResult && (
                  <div
                    className={`mt-4 rounded-2xl p-4 border text-xs space-y-2 ${
                      testResult.success
                        ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
                        : "border-red-500/40 bg-red-950/40 text-red-200"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{testResult.message}</span>
                    </div>

                    {testResult.error && (
                      <p className="text-[11px] opacity-80 font-mono">{testResult.error}</p>
                    )}

                    {testResult.waUrl && (
                      <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                        <span className="text-[10px] text-slate-300">1-Click Fallback Link:</span>
                        <a
                          href={testResult.waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow"
                        >
                          <span>Open WhatsApp Web/App</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
              <p>• Zero credit required for 1-Click WhatsApp links.</p>
              <p>• Coaches and desk marshals can launch on mobile or desktop.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Universal WhatsApp & Contact Directory (Super Admin Master Overrider) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Universal WhatsApp & Contact Directory</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ROOT OVERRIDE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Super Admin can search and override active WhatsApp numbers for ANY Admin, Coach, Referee, or Athlete if their SIM is closed or changed.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={directoryQuery}
                onChange={(e) => setDirectoryQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchDirectoryUsers(directoryQuery);
                }}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64"
              />
            </div>
            <button
              onClick={() => fetchDirectoryUsers(directoryQuery)}
              disabled={isLoadingDirectory}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDirectory ? "animate-spin" : ""}`} />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Active WhatsApp Number</th>
                <th className="py-3 px-4">Coach WhatsApp (If Lifter)</th>
                <th className="py-3 px-4 text-right">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {directoryUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                    {isLoadingDirectory ? "Loading user directory..." : "No users found matching query."}
                  </td>
                </tr>
              ) : (
                directoryUsers.map((u) => {
                  const activePhone = u.phone || u.profile?.phoneNumber;
                  const coachPhone = u.profile?.coachPhone;
                  const coachName = u.profile?.coachName;
                  const isSuperAdminRole = u.role === "SUPER_ADMIN";
                  const isAdminRole = u.role === "ADMIN";
                  const isRefereeRole = u.role === "REFEREE";

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{u.name || "Unnamed"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            isSuperAdminRole
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              : isAdminRole
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : isRefereeRole
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {activePhone ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{activePhone}</span>
                            <a
                              href={`https://wa.me/${activePhone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Direct WhatsApp 1-Click Chat"
                              className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all border border-emerald-500/30"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-amber-400/80 font-mono text-[11px] italic">
                            ⚠️ No number configured
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {coachPhone ? (
                          <div className="flex items-center gap-2">
                            <div className="text-[11px]">
                              {coachName && <span className="text-slate-300 block">{coachName}</span>}
                              <span className="text-slate-400">{coachPhone}</span>
                            </div>
                            <a
                              href={`https://wa.me/${coachPhone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat with Coach"
                              className="p-1 rounded-md bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all border border-cyan-500/30"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activePhone && (
                            <button
                              onClick={() => {
                                setTestPhone(activePhone);
                                showNotification("success", `Target set to ${u.name} (${activePhone})`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-all"
                              title="Fill into live dispatch test box"
                            >
                              Use in Test
                            </button>
                          )}
                          <button
                            onClick={() => openOverrideModal(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 font-semibold text-xs transition-all shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Change Number</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Super Admin Override Modal */}
      {editingDirectoryUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Override Contact Number</h3>
                  <p className="text-xs text-slate-400">
                    Super Admin master override for {editingDirectoryUser.name} ({editingDirectoryUser.role})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingDirectoryUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div><span className="text-slate-500 font-mono">User:</span> <strong className="text-white">{editingDirectoryUser.name}</strong></div>
                <div><span className="text-slate-500 font-mono">Email:</span> <span className="font-mono text-cyan-400">{editingDirectoryUser.email}</span></div>
                <div><span className="text-slate-500 font-mono">Role:</span> <span className="font-bold uppercase text-amber-400">{editingDirectoryUser.role}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Active WhatsApp / Mobile Number <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={overridePhone}
                  onChange={(e) => setOverridePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Always include country code (e.g. +91 for India). Old or closed SIM can be replaced here.
                </p>
              </div>

              {editingDirectoryUser.role === "MEMBER" && (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Lifter Coach Contact (Optional)
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Coach Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Coach Vikram Singh"
                      value={overrideCoachName}
                      onChange={(e) => setOverrideCoachName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Coach Active WhatsApp Number
                    </label>
                    <input
                      type="text"
                      placeholder="+919876543210"
                      value={overrideCoachPhone}
                      onChange={(e) => setOverrideCoachPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingDirectoryUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingOverride}
                onClick={handleSavePhoneOverride}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isSavingOverride ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Override...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Contact Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Dispatch Audit Log Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Live Queue Alert Dispatch Log</h3>
              <p className="text-xs text-slate-400">
                Audit trail of automated Twilio messages and 1-Click manual links clicked
              </p>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            disabled={isLoadingLogs}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? "animate-spin" : ""}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Lifter</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Queue Directive</th>
                <th className="py-3 px-4">Attempt Info</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Sender Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                    {isLoadingLogs ? "Loading recent alert logs..." : "No queue alerts dispatched yet."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSent = log.status === "SENT";
                  const isClicked = log.status === "CLICKED";
                  const isFailed = log.status === "FAILED";

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="py-3 px-4 font-bold text-white uppercase">{log.lifterName}</td>

                      <td className="py-3 px-4 font-mono text-slate-300">{log.phoneNumber}</td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            log.queuePosition === "ON_PLATFORM"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : log.queuePosition === "IN_HOLE"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          }`}
                        >
                          {log.queuePosition?.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                        {log.attemptInfo}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`text-[10px] font-bold ${
                            log.channel === "TWILIO_API" ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          {log.channel === "TWILIO_API" ? "⚡ Twilio API" : "📲 wa.me Free"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            isSent
                              ? "bg-emerald-500/20 text-emerald-300"
                              : isClicked
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {isSent && <CheckCircle2 className="w-3 h-3" />}
                          {isClicked && <Sparkles className="w-3 h-3" />}
                          {isFailed && <XCircle className="w-3 h-3" />}
                          <span>{log.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {log.sentByRole || "SYSTEM"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
