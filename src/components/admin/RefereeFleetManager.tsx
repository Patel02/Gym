"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Shield,
  ShieldAlert,
  UserPlus,
  Users,
  Search,
  Check,
  Copy,
  Calendar,
  Layers,
  Award,
  ExternalLink,
  Plus,
  Trash2,
  X,
  CreditCard,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Phone,
  Edit3,
} from "lucide-react";
import {
  createOrRegisterRefereeAction,
  updateRefereeLicenseAction,
  assignRefereeToMeetAction,
  removeRefereeAssignmentAction,
  getRefereeCredentialPassAction,
  seedSampleRefereesAction,
  RefereePassPayload,
} from "@/actions/referee-management.actions";
import {
  type RefereeCategoryType,
  type OfficialRoleType,
  CATEGORY_META,
  ROLE_LABELS,
} from "@/lib/referee-constants";
import { RefereeCredentialPassModal } from "@/components/credentials/RefereeCredentialPassModal";

interface RefereeFleetManagerProps {
  initialReferees: any[];
  availableMeets: any[];
  currentRole?: string;
}

export default function RefereeFleetManager({
  initialReferees,
  availableMeets,
  currentRole = "ADMIN",
}: RefereeFleetManagerProps) {
  const [referees, setReferees] = useState(initialReferees || []);
  const [meets] = useState(availableMeets || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modals state
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [assigningReferee, setAssigningReferee] = useState<any | null>(null);
  const [editingReferee, setEditingReferee] = useState<any | null>(null);
  const [selectedPass, setSelectedPass] = useState<RefereePassPayload | null>(null);
  const [copiedLicense, setCopiedLicense] = useState<string | null>(null);

  // Recruit Form state
  const [recruitName, setRecruitName] = useState("");
  const [recruitEmail, setRecruitEmail] = useState("");
  const [recruitPhone, setRecruitPhone] = useState("");
  const [recruitPassword, setRecruitPassword] = useState("");
  const [recruitCategory, setRecruitCategory] = useState<RefereeCategoryType>("NATIONAL_CAT_2");
  const [recruitState, setRecruitState] = useState("Gujarat State Powerlifting Association");
  const [recruitYears, setRecruitYears] = useState(2);

  // Edit Official Form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCategory, setEditCategory] = useState<RefereeCategoryType>("NATIONAL_CAT_2");
  const [editState, setEditState] = useState("Gujarat");
  const [editExtendYears, setEditExtendYears] = useState(0);

  // Assign Form state
  const [assignEventId, setAssignEventId] = useState(meets[0]?.id || "");
  const [assignPlatform, setAssignPlatform] = useState("Platform 1");
  const [assignRole, setAssignRole] = useState<OfficialRoleType>("CHIEF_REFEREE");
  const [assignFlight, setAssignFlight] = useState("Flight A");
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split("T")[0]);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedLicense(text);
      setTimeout(() => setCopiedLicense(null), 2000);
    }
  };

  const handleRecruitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recruitPassword.length < 12 || new TextEncoder().encode(recruitPassword).length > 72) {
      showToast("error", "Use a password of at least 12 characters and no more than 72 bytes.");
      return;
    }

    startTransition(async () => {
      const res = await createOrRegisterRefereeAction({
        name: recruitName,
        email: recruitEmail,
        phone: recruitPhone.trim() || undefined,
        password: recruitPassword,
        category: recruitCategory,
        stateAffiliation: recruitState,
        validYears: recruitYears,
      });

      if (res.success && res.referee) {
        showToast("success", res.message || "Referee licensed successfully!");
        setReferees((prev) => [res.referee, ...prev]);
        setShowRecruitModal(false);
        setRecruitName("");
        setRecruitEmail("");
        setRecruitPhone("");
        setRecruitPassword("");
      } else {
        showToast("error", res.error || "Failed to create referee.");
      }
    });
  };

  const openEditRefereeModal = (ref: any) => {
    setEditingReferee(ref);
    setEditName(ref.name || "");
    setEditPhone(ref.phone || ref.profile?.phoneNumber || "");
    setEditCategory(ref.refereeProfile?.category || "NATIONAL_CAT_2");
    setEditState(ref.refereeProfile?.stateAffiliation || "Gujarat");
    setEditExtendYears(0);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReferee) return;

    startTransition(async () => {
      const res = await updateRefereeLicenseAction({
        refereeProfileId: editingReferee.refereeProfile.id,
        name: editName,
        phone: editPhone,
        category: editCategory,
        stateAffiliation: editState,
        extendYears: editExtendYears > 0 ? editExtendYears : undefined,
      });

      if (res.success) {
        showToast("success", "Official details and phone number updated!");
        setReferees((prev) =>
          prev.map((r) =>
            r.id === editingReferee.id
              ? {
                  ...r,
                  name: editName,
                  phone: editPhone.trim() || null,
                  refereeProfile: {
                    ...r.refereeProfile,
                    category: editCategory,
                    stateAffiliation: editState,
                  },
                }
              : r
          )
        );
        setEditingReferee(null);
      } else {
        showToast("error", res.error || "Failed to update referee details.");
      }
    });
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningReferee) return;

    startTransition(async () => {
      const res = await assignRefereeToMeetAction({
        refereeProfileId: assigningReferee.refereeProfile.id,
        eventId: assignEventId,
        platformName: assignPlatform,
        role: assignRole,
        flightGroup: assignFlight,
        shiftDate: assignDate,
      });

      if (res.success && res.assignment) {
        showToast("success", res.message || "Referee assigned successfully!");
        setReferees((prev) =>
          prev.map((r) => {
            if (r.refereeProfile?.id === assigningReferee.refereeProfile.id) {
              const matchedEvent = meets.find((m) => m.id === assignEventId);
              const newAsg = {
                ...res.assignment,
                event: matchedEvent || { title: "Sanctioned Championship" },
              };
              return {
                ...r,
                refereeProfile: {
                  ...r.refereeProfile,
                  totalMeetsJudged: (r.refereeProfile.totalMeetsJudged || 0) + 1,
                  assignments: [newAsg, ...(r.refereeProfile.assignments || [])],
                },
              };
            }
            return r;
          })
        );
        setAssigningReferee(null);
      } else {
        showToast("error", res.error || "Failed to assign referee.");
      }
    });
  };

  const handleRemoveAssignment = (assignmentId: string, refereeId: string) => {
    startTransition(async () => {
      const res = await removeRefereeAssignmentAction(assignmentId);
      if (res.success) {
        showToast("success", "Assignment removed.");
        setReferees((prev) =>
          prev.map((r) => {
            if (r.id === refereeId && r.refereeProfile) {
              return {
                ...r,
                refereeProfile: {
                  ...r.refereeProfile,
                  assignments: r.refereeProfile.assignments.filter(
                    (a: any) => a.id !== assignmentId
                  ),
                },
              };
            }
            return r;
          })
        );
      } else {
        showToast("error", res.error || "Failed to remove assignment.");
      }
    });
  };

  const handleViewPass = async (userId: string) => {
    startTransition(async () => {
      const res = await getRefereeCredentialPassAction(userId);
      if (res.success && res.pass) {
        setSelectedPass(res.pass);
      } else {
        showToast("error", res.error || "Failed to generate pass.");
      }
    });
  };

  const handleSeedReferees = () => {
    startTransition(async () => {
      const res = await seedSampleRefereesAction();
      if (res.success) {
        showToast("success", res.message || "Sample referees seeded!");
        window.location.reload();
      } else {
        showToast("error", res.error || "Seed failed.");
      }
    });
  };

  // Filtered Referees
  const filteredReferees = referees.filter((ref) => {
    const prof = ref.refereeProfile;
    const name = ref.name?.toLowerCase() || "";
    const email = ref.email?.toLowerCase() || "";
    const license = prof?.licenseNumber?.toLowerCase() || "";
    const state = prof?.stateAffiliation?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      name.includes(q) || email.includes(q) || license.includes(q) || state.includes(q);

    const matchesCategory =
      categoryFilter === "ALL" ? true : prof?.category === categoryFilter;

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
        ? prof?.isActive === true
        : statusFilter === "ASSIGNED"
        ? (prof?.assignments?.length || 0) > 0
        : prof?.isActive === false;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalOfficials = referees.length;
  const internationalOfficials = referees.filter(
    (r) => r.refereeProfile?.category === "IPF_INTERNATIONAL"
  ).length;
  const activeAssignmentsCount = referees.reduce(
    (acc, r) => acc + (r.refereeProfile?.assignments?.length || 0),
    0
  );

  return (
    <div className="space-y-6 text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200 border ${
            toastMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/90 text-emerald-300"
              : "border-red-500/40 bg-red-950/90 text-red-300"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── HEADER & TELEMETRY ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/20 text-purple-300 shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-white">
                Technical Officials &amp; Jury Fleet
              </h2>
              <p className="text-xs text-zinc-400">
                Manage accredited IPF referees, jury presidents, and platform station allocations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {totalOfficials === 0 && (
            <button
              onClick={handleSeedReferees}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/15 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Seed Sample Referees</span>
            </button>
          )}

          <button
            onClick={() => setShowRecruitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Recruit Official</span>
          </button>
        </div>
      </div>

      {/* ── METRICS SUMMARY ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/20 via-zinc-900/60 to-black p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
            Total Licensed Officials
          </span>
          <div className="mt-2 font-heading text-3xl font-black text-white">
            {totalOfficials}
          </div>
          <span className="text-[11px] text-purple-400 mt-0.5 block">
            IPF &amp; State Accredited
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/20 via-zinc-900/60 to-black p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
            IPF International Tier
          </span>
          <div className="mt-2 font-heading text-3xl font-black text-indigo-300">
            {internationalOfficials}
          </div>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">
            Global Technical Clearance
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-950/20 via-zinc-900/60 to-black p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
            Active Duty Assignments
          </span>
          <div className="mt-2 font-heading text-3xl font-black text-emerald-400">
            {activeAssignmentsCount}
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-0.5 block">
            Across Sanctioned Meets
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-950/20 via-zinc-900/60 to-black p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
            Championship Meets
          </span>
          <div className="mt-2 font-heading text-3xl font-black text-amber-300">
            {meets.length}
          </div>
          <span className="text-[11px] text-amber-400/80 mt-0.5 block">
            Ready for Platform Allocations
          </span>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search name, license no., state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/60 pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="IPF_INTERNATIONAL">IPF International</option>
            <option value="NATIONAL_CAT_1">National Cat 1</option>
            <option value="NATIONAL_CAT_2">National Cat 2</option>
            <option value="STATE_CAT_2">State Cat 2</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ASSIGNED">Assigned on Duty</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* ── REFEREES TABLE / CARDS ── */}
      {filteredReferees.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            No Technical Officials Found
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
            {searchQuery
              ? `No officials match "${searchQuery}".`
              : "No referee records found in the official registry. Click 'Recruit Official' or 'Seed Sample Referees' to license officials."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/5 uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Official &amp; Credentials</th>
                  <th className="py-3.5 px-4 font-bold">Category Level</th>
                  <th className="py-3.5 px-4 font-bold">State Affiliation</th>
                  <th className="py-3.5 px-4 font-bold">Meets Judged</th>
                  <th className="py-3.5 px-4 font-bold">Current Assignment</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReferees.map((ref) => {
                  const prof = ref.refereeProfile;
                  const cat = prof ? CATEGORY_META[prof.category as RefereeCategoryType] : null;
                  const assignments = prof?.assignments || [];

                  return (
                    <tr key={ref.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & License */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-purple-500/40 bg-black shrink-0 flex items-center justify-center font-heading text-sm font-bold text-purple-400">
                            {ref.name?.charAt(0).toUpperCase() || "R"}
                          </div>
                          <div>
                            <div className="font-heading text-sm font-bold text-white">
                              {ref.name || "Referee Official"}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-purple-300 font-bold bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.2 rounded">
                                {prof?.licenseNumber || "UNLICENSED"}
                              </span>
                              {prof && (
                                <button
                                  onClick={() => handleCopy(prof.licenseNumber)}
                                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                  title="Copy license code"
                                >
                                  {copiedLicense === prof.licenseNumber ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate max-w-[180px]">
                              {ref.email}
                            </div>
                            {ref.phone ? (
                              <a
                                href={`https://wa.me/${ref.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline mt-0.5"
                                title="1-Click WhatsApp Direct Chat"
                              >
                                <Phone className="h-3 w-3 text-emerald-400" />
                                {ref.phone}
                              </a>
                            ) : (
                              <div className="text-[10px] text-zinc-500 italic mt-0.5">
                                No WhatsApp added
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        {cat ? (
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cat.badgeClass}`}
                          >
                            {cat.label}
                          </span>
                        ) : (
                          <span className="text-zinc-500">Unspecified</span>
                        )}
                      </td>

                      {/* State */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-zinc-300">
                          <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {prof?.stateAffiliation || "Gujarat"}
                          </span>
                        </div>
                      </td>

                      {/* Meets Judged */}
                      <td className="py-3.5 px-4">
                        <div className="font-heading text-sm font-bold text-white">
                          {prof?.totalMeetsJudged || 0}
                        </div>
                        <span className="text-[9px] text-zinc-500 uppercase">Sanctioned</span>
                      </td>

                      {/* Current Assignments */}
                      <td className="py-3.5 px-4">
                        {assignments.length > 0 ? (
                          <div className="space-y-1">
                            {assignments.map((asg: any) => (
                              <div
                                key={asg.id}
                                className="group/asg flex items-center justify-between gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2 py-1 text-[10px]"
                              >
                                <div>
                                  <div className="font-bold text-purple-200 truncate max-w-[150px]">
                                    {asg.event?.title || "Championship"}
                                  </div>
                                  <div className="text-[9px] text-purple-400">
                                    {asg.platformName} • {ROLE_LABELS[asg.role as OfficialRoleType] || asg.role}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleRemoveAssignment(asg.id, ref.id)}
                                  className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                                  title="Unassign"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">Standby Official</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Official Button */}
                          <button
                            onClick={() => openEditRefereeModal(ref)}
                            className="inline-flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all cursor-pointer"
                            title="Edit Official & WhatsApp Number"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit</span>
                          </button>

                          {/* Assign Button */}
                          <button
                            onClick={() => setAssigningReferee(ref)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all cursor-pointer"
                          >
                            <Calendar className="h-3 w-3" />
                            <span>Assign</span>
                          </button>

                          {/* Digital Pass Button */}
                          <button
                            onClick={() => handleViewPass(ref.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                            title="View Official Digital Pass"
                          >
                            <CreditCard className="h-3 w-3 text-gym-primary" />
                            <span>Pass</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: RECRUIT OFFICIAL ── */}
      {showRecruitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-gradient-to-b from-[#14081c] via-[#09030e] to-black p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/20 text-purple-300">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase text-white">
                    Recruit Official Referee
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Issue official credentials and technical jury clearance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRecruitModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecruitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={recruitName}
                  onChange={(e) => setRecruitName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. referee@wpigujarat.in"
                  value={recruitEmail}
                  onChange={(e) => setRecruitEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1 flex items-center justify-between">
                  <span>WhatsApp Mobile (Official)</span>
                  <span className="text-[10px] text-purple-400 font-normal">Optional</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={recruitPhone}
                    onChange={(e) => setRecruitPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 pl-10 pr-3.5 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    License Category
                  </label>
                  <select
                    value={recruitCategory}
                    onChange={(e) => setRecruitCategory(e.target.value as RefereeCategoryType)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="NATIONAL_CAT_2">National Cat 2</option>
                    <option value="NATIONAL_CAT_1">National Cat 1</option>
                    <option value="IPF_INTERNATIONAL">IPF International</option>
                    <option value="STATE_CAT_2">State Cat 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    License Validity
                  </label>
                  <select
                    value={recruitYears}
                    onChange={(e) => setRecruitYears(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value={1}>1 Year Term</option>
                    <option value={2}>2 Years (Standard)</option>
                    <option value={3}>3 Years</option>
                    <option value={5}>5 Years (Quadrennial)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  State Federation Affiliation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat State Powerlifting Association"
                  value={recruitState}
                  onChange={(e) => setRecruitState(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Set Initial Password
                </label>
                <input
                  type="password"
                  required
                  minLength={12}
                  maxLength={72}
                  autoComplete="new-password"
                  value={recruitPassword}
                  onChange={(e) => setRecruitPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Share this securely with the official; it is never returned by the server.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRecruitModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold uppercase text-zinc-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold uppercase text-white shadow-lg shadow-purple-900/40"
                >
                  {isPending ? "Licensing..." : "Issue Official License"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT OFFICIAL REFEREE ── */}
      {editingReferee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#14081c] via-[#09030e] to-black p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/20 text-purple-300">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase text-white">
                    Edit Official Referee
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Update contact WhatsApp number, state affiliation, and license
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingReferee(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1 flex items-center justify-between">
                  <span>WhatsApp Mobile / Contact</span>
                  <span className="text-[10px] text-purple-400 font-normal">If SIM is closed, replace with new number</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 pl-10 pr-3.5 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    License Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as RefereeCategoryType)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="NATIONAL_CAT_2">National Cat 2</option>
                    <option value="NATIONAL_CAT_1">National Cat 1</option>
                    <option value="IPF_INTERNATIONAL">IPF International</option>
                    <option value="STATE_CAT_2">State Cat 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    Extend Validity Term
                  </label>
                  <select
                    value={editExtendYears}
                    onChange={(e) => setEditExtendYears(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value={0}>Keep Existing Validity</option>
                    <option value={1}>+1 Year Extension</option>
                    <option value={2}>+2 Years Extension</option>
                    <option value={4}>+4 Years (Quadrennial)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  State Federation Affiliation
                </label>
                <input
                  type="text"
                  required
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingReferee(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold uppercase text-zinc-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold uppercase text-white shadow-lg shadow-purple-900/40"
                >
                  {isPending ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ASSIGN REFEREE TO MEET ── */}
      {assigningReferee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-gradient-to-b from-[#14081c] via-[#09030e] to-black p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="font-heading text-lg font-bold uppercase text-white">
                  Assign Platform Official
                </h3>
                <p className="text-xs text-purple-300">
                  Assigning {assigningReferee.name} ({assigningReferee.refereeProfile?.licenseNumber})
                </p>
              </div>
              <button
                onClick={() => setAssigningReferee(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Championship Event
                </label>
                <select
                  value={assignEventId}
                  onChange={(e) => setAssignEventId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
                >
                  {meets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    Platform Stage
                  </label>
                  <select
                    value={assignPlatform}
                    onChange={(e) => setAssignPlatform(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Platform 1">Platform 1 (Main Stage)</option>
                    <option value="Platform 2">Platform 2 (Warm-up / Hall B)</option>
                    <option value="Jury Desk">Central Jury Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    Official Station / Role
                  </label>
                  <select
                    value={assignRole}
                    onChange={(e) => setAssignRole(e.target.value as OfficialRoleType)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="CHIEF_REFEREE">Chief Referee (Center)</option>
                    <option value="SIDE_REFEREE_LEFT">Side Referee (Left)</option>
                    <option value="SIDE_REFEREE_RIGHT">Side Referee (Right)</option>
                    <option value="JURY_PRESIDENT">Jury President</option>
                    <option value="JURY_MEMBER">Jury Member</option>
                    <option value="TECHNICAL_CONTROLLER">Technical Marshall</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    Flight Session
                  </label>
                  <input
                    type="text"
                    value={assignFlight}
                    onChange={(e) => setAssignFlight(e.target.value)}
                    placeholder="e.g. Flight A, Senior Men"
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    Shift Date
                  </label>
                  <input
                    type="date"
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAssigningReferee(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold uppercase text-zinc-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold uppercase text-white shadow-lg shadow-purple-900/40"
                >
                  {isPending ? "Assigning..." : "Confirm Platform Duty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DIGITAL PASS MODAL ── */}
      {selectedPass && (
        <RefereeCredentialPassModal
          pass={selectedPass}
          isOpen={!!selectedPass}
          onClose={() => setSelectedPass(null)}
        />
      )}
    </div>
  );
}
