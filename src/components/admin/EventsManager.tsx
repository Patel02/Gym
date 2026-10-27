"use client";

import { useState } from "react";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Loader2, 
  FileText, 
  AlertTriangle, 
  Clock, 
  X,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Upload,
  Copy,
  Check,
  Sparkles,
  FileCheck
} from "lucide-react";
import Link from "next/link";
import { saveFederationEventsAction } from "@/actions/events.actions";

export interface MeetItem {
  id: string;
  title: string;
  category: string;
  dates: string;
  city: string;
  venue: string;
  status: "REGISTRATION OPEN" | "UPCOMING" | "SELECTION TRIALS" | "COMPLETED";
  statusColor: string;
  prizePool: string;
  divisions: string[];
  daysLeft: number;
  entryFee?: string;
  circularUrl?: string;
  isFeaturedOnHome?: boolean;
  tenantId?: string;
  organizationName?: string;
}

export interface AnnouncementItem {
  id: number | string;
  date: string;
  title: string;
  type: "alert" | "rule" | "info";
  fileUrl?: string;
}

export interface FederationEventsData {
  events: MeetItem[];
  announcements: AnnouncementItem[];
}

const STATUS_OPTIONS: Array<{
  value: MeetItem["status"];
  label: string;
  colorClass: string;
}> = [
  {
    value: "REGISTRATION OPEN",
    label: "Registration Open",
    colorClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
  },
  {
    value: "UPCOMING",
    label: "Upcoming",
    colorClass: "bg-gym-primary/20 text-gym-primary border-gym-primary/40"
  },
  {
    value: "SELECTION TRIALS",
    label: "Selection Trials",
    colorClass: "bg-purple-500/20 text-purple-400 border-purple-500/40"
  },
  {
    value: "COMPLETED",
    label: "Completed / Past",
    colorClass: "bg-zinc-700/40 text-zinc-400 border-zinc-600/40"
  }
];

export default function EventsManager({
  initialData
}: {
  initialData: FederationEventsData;
}) {
  const [events, setEvents] = useState<MeetItem[]>(initialData.events || []);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(
    initialData.announcements || []
  );

  const [activeTab, setActiveTab] = useState<"meets" | "circulars">("meets");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isSaving, setIsSaving] = useState(false);
  const [isModalSaving, setIsModalSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Modal form state
  const [formState, setFormState] = useState<MeetItem>({
    id: "",
    title: "",
    category: "National Championship",
    dates: "",
    city: "",
    venue: "",
    status: "REGISTRATION OPEN",
    statusColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    prizePool: "₹5,00,000",
    divisions: ["Open Men", "Open Women"],
    daysLeft: 30,
    entryFee: "₹2,000",
    circularUrl: "/circulars",
    isFeaturedOnHome: true
  });

  // Delete Confirmation Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Announcements Modal
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementItem>({
    id: Date.now(),
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase(),
    title: "",
    type: "info",
    fileUrl: "/circulars"
  });
  const [announcementFile, setAnnouncementFile] = useState<File | null>(null);
  const [isUploadingCircular, setIsUploadingCircular] = useState(false);

  // Live Popup Notification Modal for Admin
  const [livePopup, setLivePopup] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    viewUrl: string;
    fileUrl?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Central Persistence Function: immediately syncs state and writes to backend
  const persistEvents = async (
    nextEvents: MeetItem[],
    nextAnnouncements: AnnouncementItem[] = announcements,
    successMsg = "Published to live website!"
  ) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    // Optimistically update UI
    setEvents(nextEvents);
    setAnnouncements(nextAnnouncements);

    try {
      // 1. Try Server Action with direct fs + revalidatePath
      const actionRes = await saveFederationEventsAction(nextEvents, nextAnnouncements);
      
      if (actionRes.success) {
        setSuccessToast(successMsg);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setSuccessToast(null);
        }, 4000);
        return true;
      }

      // 2. Fallback to API route if Server Action hit auth issue
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: nextEvents, announcements: nextAnnouncements }),
        cache: "no-store"
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || actionRes.error || "Failed to persist changes.");
      }

      setSuccessToast(successMsg);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSuccessToast(null);
      }, 4000);
      return true;
    } catch (err: any) {
      console.error("Persistence error:", err);
      setErrorMessage(err.message || "An error occurred while saving to live website.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingEventId(null);
    setFormState({
      id: `meet-${Date.now()}`,
      title: "",
      category: "Equipped & Classic Open",
      dates: "July 2026",
      city: "",
      venue: "",
      status: "REGISTRATION OPEN",
      statusColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      prizePool: "₹5,00,000",
      divisions: ["Senior Men", "Senior Women"],
      daysLeft: 45,
      entryFee: "₹2,500",
      circularUrl: "/circulars",
      isFeaturedOnHome: true
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: MeetItem) => {
    setEditingEventId(item.id);
    setFormState({ ...item });
    setIsModalOpen(true);
  };

  // Save Modal Form (Add or Edit) with AUTO-PERSISTENCE
  const handleSaveModalForm = async () => {
    if (!formState.title.trim()) {
      alert("Please provide an Event Title.");
      return;
    }

    const selectedOption = STATUS_OPTIONS.find((s) => s.value === formState.status);
    const updatedStatusColor = selectedOption?.colorClass || formState.statusColor;

    const finalItem: MeetItem = {
      ...formState,
      statusColor: updatedStatusColor
    };

    let nextEvents: MeetItem[];
    if (editingEventId) {
      nextEvents = events.map((item) => (item.id === editingEventId ? finalItem : item));
    } else {
      nextEvents = [finalItem, ...events];
    }

    setIsModalSaving(true);
    const ok = await persistEvents(
      nextEvents, 
      announcements, 
      editingEventId ? "Championship details updated & published live!" : "New Championship successfully published to live website!"
    );
    setIsModalSaving(false);

    if (ok) {
      setIsModalOpen(false);
      setLivePopup({
        isOpen: true,
        title: finalItem.title,
        subtitle: editingEventId ? "Championship meet details updated on live calendar & homepage." : "New Championship meet successfully published live to website!",
        viewUrl: "/championships",
        fileUrl: finalItem.circularUrl
      });
    }
  };

  // Quick Status Toggle directly from card with AUTO-PERSISTENCE
  const handleQuickStatusChange = async (id: string, newStatus: MeetItem["status"]) => {
    const selectedOption = STATUS_OPTIONS.find((s) => s.value === newStatus);
    const updatedStatusColor = selectedOption?.colorClass || "";

    const nextEvents = events.map((item) =>
      item.id === id
        ? {
            ...item,
            status: newStatus,
            statusColor: updatedStatusColor
          }
        : item
    );

    await persistEvents(nextEvents, announcements, `Status updated to ${newStatus} & published live!`);
  };

  // Toggle Featured on Homepage with AUTO-PERSISTENCE
  const handleToggleFeatured = async (id: string) => {
    const nextEvents = events.map((item) =>
      item.id === id ? { ...item, isFeaturedOnHome: !item.isFeaturedOnHome } : item
    );

    await persistEvents(nextEvents, announcements, "Homepage event visibility updated!");
  };

  // Confirm Delete with AUTO-PERSISTENCE
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    const nextEvents = events.filter((item) => item.id !== deleteConfirmId);
    const ok = await persistEvents(nextEvents, announcements, "Event permanently deleted from live website!");
    setIsDeleting(false);
    if (ok) {
      setDeleteConfirmId(null);
    }
  };

  // Add / Edit Announcement with AUTO-PERSISTENCE and FILE UPLOAD
  const handleSaveAnnouncement = async () => {
    if (!announcementForm.title.trim() && !announcementFile) {
      alert("Please enter circular announcement title or choose a file.");
      return;
    }

    let finalFileUrl = announcementForm.fileUrl || "/circulars";
    let finalTitle = announcementForm.title.trim();

    if (announcementFile) {
      setIsUploadingCircular(true);
      try {
        const cleanName = announcementFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
        if (!finalTitle) {
          finalTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }

        const formData = new FormData();
        formData.append("title", finalTitle);
        formData.append("file", announcementFile);

        const res = await fetch("/api/admin/circulars", {
          method: "POST",
          body: formData,
        });
        const data: { success?: boolean; circular?: { fileUrl?: string }; error?: string } =
          await res.json();
        if (!res.ok || !data.success || !data.circular?.fileUrl) {
          throw new Error(data.error || "Failed to upload the circular.");
        }
        finalFileUrl = data.circular.fileUrl;
      } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to upload the circular.");
        return;
      } finally {
        setIsUploadingCircular(false);
      }
    }

    if (!finalTitle) {
      finalTitle = "Official Federation Circular";
    }

    const nextAnnouncements = [
      {
        ...announcementForm,
        title: finalTitle,
        fileUrl: finalFileUrl,
        id: typeof announcementForm.id === "number" ? announcementForm.id : Date.now()
      },
      ...announcements
    ];

    setIsAnnouncementModalOpen(false);
    setAnnouncementFile(null);

    const ok = await persistEvents(events, nextAnnouncements, "New circular announcement published live!");
    if (ok) {
      setLivePopup({
        isOpen: true,
        title: finalTitle,
        subtitle: "Official circular document has been published live to /circulars and the Homepage!",
        viewUrl: "/circulars",
        fileUrl: finalFileUrl
      });
    }
  };

  const handleDeleteAnnouncement = async (id: number | string) => {
    if (confirm("Permanently delete this circular announcement?")) {
      const nextAnnouncements = announcements.filter((a) => a.id !== id);
      await persistEvents(events, nextAnnouncements, "Circular announcement deleted from website!");
    }
  };

  // Reset to initial
  const handleReset = async () => {
    if (confirm("Reset all events and circulars back to initial saved state?")) {
      await persistEvents(
        initialData.events || [], 
        initialData.announcements || [],
        "Events reset to initial state & published live!"
      );
    }
  };

  // Manual Save All button
  const handleSaveAll = async () => {
    await persistEvents(events, announcements, "All events & circulars published live!");
  };

  // Filtered meets
  const filteredEvents = events.filter((e) => {
    if (statusFilter === "ALL") return true;
    return e.status === statusFilter;
  });

  const completedCount = events.filter((e) => e.status === "COMPLETED").length;
  const activeCount = events.filter((e) => e.status !== "COMPLETED").length;

  return (
    <div className="space-y-8 relative">

      {/* ── Fixed Floating Real-Time Toast ── */}
      {successToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-emerald-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_35px_rgba(16,185,129,0.8)] border border-emerald-400/60 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border border-white/10 bg-[#120402]/90 p-6 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gym-primary mb-1">
            <Trophy className="h-4 w-4" />
            <span>National Meet Management Portal</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
            Events & <span className="text-gym-primary">Championships</span> Manager
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Add new national meets, edit details, toggle status, and delete completed/expired events.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/championships"
            target="_blank"
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:border-gym-primary transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5 text-gym-primary" />
            <span>View Live Page</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Championship</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSaving ? "Saving Live..." : "Save Live"}</span>
          </button>
        </div>
      </div>

      {/* ── Commercial SaaS Quota Alert & Quick Top-up ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#210c05] via-[#140602] to-black px-5 py-3 text-xs shadow-lg">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-gym-primary shrink-0" />
          <span className="text-gray-300">
            <strong className="text-white">Commercial SaaS Tier:</strong> Plans include up to <strong className="text-gym-primary">4 meets per month</strong>. Sponsoring additional events requires Extra Event Top-up credits.
          </span>
        </div>
        <Link
          href="/admin/subscription"
          className="inline-flex items-center gap-1.5 rounded-full border border-gym-primary/40 bg-gym-primary/10 px-3.5 py-1 font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white transition-all text-[11px]"
        >
          <span>Manage Quota &amp; Top-ups</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Notifications Banner */}

      {saveSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-sm font-semibold shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>Events and circulars successfully published to live website!</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-500/40 bg-red-950/40 text-red-300 text-sm font-semibold shadow-lg">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Main Tabs: Meets vs Circulars ── */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("meets")}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "meets"
              ? "bg-gym-primary text-white shadow-lg"
              : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Championship Meets ({events.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("circulars")}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "circulars"
              ? "bg-gym-primary text-white shadow-lg"
              : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Official Circulars ({announcements.length})</span>
        </button>
      </div>

      {/* ══════════════ TAB 1: MEETS & CHAMPIONSHIPS ══════════════ */}
      {activeTab === "meets" && (
        <div className="space-y-6">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-1">Filter:</span>
              {[
                { id: "ALL", label: `All (${events.length})` },
                { id: "REGISTRATION OPEN", label: "Registration Open" },
                { id: "UPCOMING", label: "Upcoming" },
                { id: "SELECTION TRIALS", label: "Selection Trials" },
                { id: "COMPLETED", label: `Completed (${completedCount})` }
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === pill.id
                      ? "bg-white text-black font-black"
                      : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {completedCount > 0 && (
              <div className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Tip: Click trash icon on completed events to permanently remove them.</span>
              </div>
            )}
          </div>

          {/* Meets Grid */}
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-[#0e0302]">
              <Trophy className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">No events found in this category.</p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gym-primary hover:underline cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add a new championship meet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map((meet) => {
                const isCompleted = meet.status === "COMPLETED";

                return (
                  <div
                    key={meet.id}
                    className={`group relative rounded-3xl border p-6 backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col justify-between ${
                      isCompleted
                        ? "border-zinc-800 bg-[#0d0d0d]/80 opacity-80"
                        : "border-white/10 bg-[#120402]/80 hover:border-gym-primary/40"
                    }`}
                  >
                    <div>
                      {/* Top Bar: Status Dropdown + Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Quick Status Selector */}
                          <select
                            value={meet.status}
                            onChange={(e) =>
                              handleQuickStatusChange(meet.id, e.target.value as MeetItem["status"])
                            }
                            className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none transition-all ${
                              meet.status === "REGISTRATION OPEN"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                : meet.status === "UPCOMING"
                                ? "bg-gym-primary/20 text-gym-primary border-gym-primary/40"
                                : meet.status === "SELECTION TRIALS"
                                ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                                : "bg-zinc-700/40 text-zinc-400 border-zinc-600/40"
                            }`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value} className="bg-black text-white">
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          {meet.isFeaturedOnHome && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gym-primary bg-gym-primary/10 border border-gym-primary/30 px-2.5 py-0.5 rounded-full">
                              Homepage
                            </span>
                          )}
                        </div>

                        {/* Edit & Delete Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Edit Event Details"
                            onClick={() => handleOpenEditModal(meet)}
                            className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:border-gym-primary/50 hover:bg-gym-primary/15 transition-all cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            title="Delete Event"
                            onClick={() => setDeleteConfirmId(meet.id)}
                            className="p-2 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:text-white hover:bg-red-600 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Category & Title */}
                      <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-1">
                        {meet.category}
                      </div>
                      <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase text-white leading-tight mb-3">
                        {meet.title}
                      </h3>

                      {/* Meta information */}
                      <div className="space-y-2 text-xs text-gray-300 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gym-primary shrink-0" />
                          <span className="font-semibold text-white">{meet.dates}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gym-primary shrink-0" />
                          <span>
                            {meet.venue}, {meet.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />
                          <span>
                            Prize Pool: <strong className="text-yellow-400">{meet.prizePool}</strong>
                          </span>
                        </div>
                        {meet.entryFee && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="text-gym-primary font-bold">Entry Fee:</span>
                            <span>{meet.entryFee}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>
                            Days Left: <strong className="text-white">{meet.daysLeft} days</strong>
                          </span>
                        </div>
                      </div>

                      {/* Divisions */}
                      {meet.divisions && meet.divisions.length > 0 && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                            Divisions
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {meet.divisions.map((div, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-medium text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md"
                              >
                                {div}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Features Toggle */}
                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={meet.isFeaturedOnHome ?? false}
                          onChange={() => handleToggleFeatured(meet.id)}
                          className="h-4 w-4 rounded accent-gym-primary cursor-pointer"
                        />
                        <span>Show on Homepage Events</span>
                      </label>

                      {isCompleted && (
                        <span className="text-[11px] font-bold uppercase text-red-400">
                          Past / Expired Event
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ TAB 2: CIRCULARS & ANNOUNCEMENTS ══════════════ */}
      {activeTab === "circulars" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Manage official federation circulars, rule changes, and platform announcements.
            </p>
            <button
              type="button"
              onClick={() => {
                setAnnouncementForm({
                  id: Date.now(),
                  date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase(),
                  title: "",
                  type: "info",
                  fileUrl: "/circulars"
                });
                setIsAnnouncementModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-full bg-gym-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Circular</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-[#120402]/80 gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {ann.type === "alert" ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-gym-primary" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gym-primary">
                      {ann.date} • TYPE: {ann.type.toUpperCase()}
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">{ann.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Link: {ann.fileUrl || "/circulars"}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-2 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: ADD / EDIT CHAMPIONSHIP ══════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-gym-primary/40 bg-[#140402] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-gym-primary">
                <Trophy className="h-5 w-5" />
                <h3 className="font-heading text-lg sm:text-xl font-bold uppercase text-white">
                  {editingEventId ? "Edit Championship Meet" : "Add New Championship Meet"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Championship Title *
                </label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. National Senior Powerlifting Championship 2026"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Category / Subheading
                </label>
                <input
                  type="text"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  placeholder="e.g. Equipped & Classic Open, Youth & Rising Stars"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              {/* Dates & Countdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Dates
                  </label>
                  <input
                    type="text"
                    value={formState.dates}
                    onChange={(e) => setFormState({ ...formState, dates: e.target.value })}
                    placeholder="e.g. July 18 – 22, 2026"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Days Countdown (Days Left)
                  </label>
                  <input
                    type="number"
                    value={formState.daysLeft}
                    onChange={(e) =>
                      setFormState({ ...formState, daysLeft: parseInt(e.target.value) || 0 })
                    }
                    placeholder="e.g. 120"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* City & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    City & State
                  </label>
                  <input
                    type="text"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Venue / Stadium
                  </label>
                  <input
                    type="text"
                    value={formState.venue}
                    onChange={(e) => setFormState({ ...formState, venue: e.target.value })}
                    placeholder="e.g. Kanteerava Indoor Stadium"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Status & Prize Pool */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Meet Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        status: e.target.value as MeetItem["status"]
                      })
                    }
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-black text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Prize Pool / Accolade
                  </label>
                  <input
                    type="text"
                    value={formState.prizePool}
                    onChange={(e) => setFormState({ ...formState, prizePool: e.target.value })}
                    placeholder="e.g. ₹10,00,000"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Entry Fee & Circular URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Entry Fee
                  </label>
                  <input
                    type="text"
                    value={formState.entryFee || ""}
                    onChange={(e) => setFormState({ ...formState, entryFee: e.target.value })}
                    placeholder="e.g. ₹2,500"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Circular / Form Download Link
                  </label>
                  <input
                    type="text"
                    value={formState.circularUrl || ""}
                    onChange={(e) => setFormState({ ...formState, circularUrl: e.target.value })}
                    placeholder="e.g. /circulars or https://..."
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Divisions (Comma-separated) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Divisions (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formState.divisions.join(", ")}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      divisions: e.target.value
                        .split(",")
                        .map((d) => d.trim())
                        .filter(Boolean)
                    })
                  }
                  placeholder="e.g. Senior Men (59kg – 120kg+), Senior Women (47kg – 84kg+)"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              {/* Feature on Home checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-gray-200">
                  <input
                    type="checkbox"
                    checked={formState.isFeaturedOnHome ?? false}
                    onChange={(e) =>
                      setFormState({ ...formState, isFeaturedOnHome: e.target.checked })
                    }
                    className="h-5 w-5 rounded accent-gym-primary cursor-pointer"
                  />
                  <span>Feature this meet in the Homepage "Upcoming Meets" card</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-full border border-white/15 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isModalSaving}
                onClick={handleSaveModalForm}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gym-primary text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(230,80,27,0.4)] hover:brightness-110 cursor-pointer disabled:opacity-60"
              >
                {isModalSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{editingEventId ? "Update & Publish" : "Add & Publish Meet"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: DELETE CONFIRMATION ══════════════ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-[#160503] p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/30">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-white">Delete Championship Meet?</h4>
                <p className="text-xs text-gray-400">This action will remove the meet from the calendar.</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              Are you sure you want to permanently delete this event? It will be removed immediately from the public website.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 rounded-full border border-white/15 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-xs font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: ADD CIRCULAR ══════════════ */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-gym-primary/40 bg-[#140402] p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h4 className="font-heading text-lg font-bold uppercase text-white">
                Add Official Circular Announcement
              </h4>
              <button
                type="button"
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, title: e.target.value })
                  }
                  placeholder="e.g. WADA Anti-Doping Regulations 2026-27"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={announcementForm.type}
                    onChange={(e) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        type: e.target.value as "alert" | "rule" | "info"
                      })
                    }
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  >
                    <option value="alert" className="bg-black text-white">Alert (Red)</option>
                    <option value="rule" className="bg-black text-white">Rulebook</option>
                    <option value="info" className="bg-black text-white">Information</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Download URL (or upload below)
                  </label>
                  <input
                    type="text"
                    value={announcementForm.fileUrl || ""}
                    onChange={(e) =>
                      setAnnouncementForm({ ...announcementForm, fileUrl: e.target.value })
                    }
                    placeholder="/circulars or https://..."
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Direct PDF File Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Or Choose PDF File to Upload Directly
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,image/*,application/pdf"
                    id="events-circular-file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setAnnouncementFile(file);
                        if (!announcementForm.title.trim()) {
                          const clean = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
                          setAnnouncementForm({
                            ...announcementForm,
                            title: clean.charAt(0).toUpperCase() + clean.slice(1)
                          });
                        }
                      }
                    }}
                    className="hidden"
                  />
                  {!announcementFile ? (
                    <label
                      htmlFor="events-circular-file"
                      className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/20 bg-black/40 hover:border-gym-primary/60 hover:bg-gym-primary/5 cursor-pointer text-xs font-bold text-gray-300 transition-all"
                    >
                      <Upload className="h-4 w-4 text-gym-primary" />
                      <span>Click to select PDF document file</span>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold truncate">
                        <FileCheck className="h-4 w-4 shrink-0" />
                        <span className="truncate">{announcementFile.name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          ({(announcementFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnnouncementFile(null)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAnnouncementModalOpen(false);
                  setAnnouncementFile(null);
                }}
                className="px-5 py-2 rounded-full border border-white/15 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUploadingCircular || isSaving}
                onClick={handleSaveAnnouncement}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-gym-primary text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 cursor-pointer disabled:opacity-60"
              >
                {isUploadingCircular ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading & Publishing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                    <span>Publish Circular Live</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ GLOBAL POPUP NOTIFICATION MODAL (LIVE CONFIRMATION) ══════════════ */}
      {livePopup?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border-2 border-emerald-500/70 bg-[#120402] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.4)] relative">
            <button
              type="button"
              onClick={() => setLivePopup(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 mb-2">
                ✓ Live on Website
              </div>

              <h3 className="font-heading text-2xl font-bold uppercase text-white tracking-wide">
                Successfully Published!
              </h3>

              <p className="text-xs text-gray-300 mt-2">
                {livePopup.subtitle}
              </p>

              <div className="mt-5 text-left rounded-2xl border border-white/15 bg-black/70 p-4 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gym-primary">
                  Item Title
                </div>
                <div className="text-sm font-black text-white leading-snug">
                  {livePopup.title}
                </div>
                <div className="text-[11px] text-emerald-400 font-bold pt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Status: 100% Live & Active Now</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={livePopup.viewUrl}
                  target="_blank"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all cursor-pointer"
                >
                  <span>View Live Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/#events"
                  target="_blank"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
                >
                  <span>Homepage Events</span>
                  <ExternalLink className="h-3.5 w-3.5 text-gym-primary" />
                </Link>

                {livePopup.fileUrl && livePopup.fileUrl !== "/circulars" && (
                  <a
                    href={livePopup.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-200 hover:text-white transition-all"
                  >
                    <FileText className="h-3.5 w-3.5 text-gym-primary" />
                    <span>Open File</span>
                  </a>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setLivePopup(null)}
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
