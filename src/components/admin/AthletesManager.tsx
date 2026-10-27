"use client";

import { useState, useTransition } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  CreditCard, 
  Dumbbell, 
  Calendar, 
  Mail, 
  User as UserIcon, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RefreshCw,
  Award,
  Phone
} from "lucide-react";
import { Gender, UserRole, WeightClass } from "@prisma/client";
import { 
  AdminAthleteDto, 
  createAdminAthleteAction, 
  updateAdminAthleteAction, 
  deleteAdminAthleteAction 
} from "@/actions/admin-athletes.actions";

const WEIGHT_CLASSES: Array<{ value: WeightClass; label: string; gender: "MALE" | "FEMALE" | "BOTH" }> = [
  { value: "WC_59", label: "59 KG (Men)", gender: "MALE" },
  { value: "WC_66", label: "66 KG (Men)", gender: "MALE" },
  { value: "WC_74", label: "74 KG (Men)", gender: "MALE" },
  { value: "WC_83", label: "83 KG (Men)", gender: "MALE" },
  { value: "WC_93", label: "93 KG (Men)", gender: "MALE" },
  { value: "WC_105", label: "105 KG (Men)", gender: "MALE" },
  { value: "WC_120", label: "120 KG (Men)", gender: "MALE" },
  { value: "WC_120_PLUS", label: "120+ KG (Men)", gender: "MALE" },
  { value: "WC_47", label: "47 KG (Women)", gender: "FEMALE" },
  { value: "WC_52", label: "52 KG (Women)", gender: "FEMALE" },
  { value: "WC_57", label: "57 KG (Women)", gender: "FEMALE" },
  { value: "WC_63", label: "63 KG (Women)", gender: "FEMALE" },
  { value: "WC_69", label: "69 KG (Women)", gender: "FEMALE" },
  { value: "WC_76", label: "76 KG (Women)", gender: "FEMALE" },
  { value: "WC_84", label: "84 KG (Women)", gender: "FEMALE" },
  { value: "WC_84_PLUS", label: "84+ KG (Women)", gender: "FEMALE" },
];

function formatWeightClassLabel(wc?: WeightClass | null): string {
  if (!wc) return "Unassigned";
  return wc.replace("WC_", "").replace("_PLUS", "+") + " KG";
}

export default function AthletesManager({
  initialAthletes
}: {
  initialAthletes: AdminAthleteDto[];
}) {
  const [athletes, setAthletes] = useState<AdminAthleteDto[]>(initialAthletes);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<AdminAthleteDto | null>(null);
  const [deletingAthlete, setDeletingAthlete] = useState<AdminAthleteDto | null>(null);

  // Form States for Add/Edit
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    coachPhone: string;
    coachName: string;
    password: string;
    role: UserRole;
    gender: Gender;
    weightClass: WeightClass;
  }>({
    name: "",
    email: "",
    phone: "",
    coachPhone: "",
    coachName: "",
    password: "",
    role: "MEMBER",
    gender: "MALE",
    weightClass: "WC_83",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filtered List
  const filteredAthletes = athletes.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q || 
      (a.name && a.name.toLowerCase().includes(q)) || 
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.phone && a.phone.includes(q)) ||
      (a.profile?.phoneNumber && a.profile.phoneNumber.includes(q)) ||
      (a.profile?.weightClass && formatWeightClassLabel(a.profile.weightClass).toLowerCase().includes(q));

    const matchesRole = roleFilter === "ALL" || a.role === roleFilter;
    const matchesGender = genderFilter === "ALL" || (a.profile?.gender === genderFilter);

    return matchesQuery && matchesRole && matchesGender;
  });

  const openAddModal = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      coachPhone: "",
      coachName: "",
      password: "",
      role: "MEMBER",
      gender: "MALE",
      weightClass: "WC_83",
    });
    setErrorMsg(null);
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const openEditModal = (athlete: AdminAthleteDto) => {
    setEditingAthlete(athlete);
    setFormData({
      name: athlete.name || "",
      email: athlete.email || "",
      phone: athlete.phone || athlete.profile?.phoneNumber || "",
      coachPhone: athlete.profile?.coachPhone || "",
      coachName: athlete.profile?.coachName || "",
      password: "",
      role: athlete.role,
      gender: athlete.profile?.gender || "MALE",
      weightClass: athlete.profile?.weightClass || "WC_83",
    });
    setErrorMsg(null);
    setShowPassword(false);
  };

  const handleCreateAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await createAdminAthleteAction(formData);
      if (res.success) {
        setSuccessMsg(res.message || "Athlete added successfully.");
        setIsAddModalOpen(false);
        // Refresh local list
        setAthletes((prev) => [
          {
            id: `temp-${Date.now()}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            image: null,
            role: formData.role,
            createdAt: new Date(),
            profile: {
              gender: formData.gender,
              weightClass: formData.weightClass,
              phoneNumber: formData.phone || null,
              coachPhone: formData.coachPhone || null,
              coachName: formData.coachName || null,
            },
            activeMembership: null,
            registrationsCount: 0,
          },
          ...prev,
        ]);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "Failed to create athlete.");
      }
    });
  };

  const handleUpdateAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await updateAdminAthleteAction({
        id: editingAthlete.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        coachPhone: formData.coachPhone,
        coachName: formData.coachName,
        role: formData.role,
        gender: formData.gender,
        weightClass: formData.weightClass,
        password: formData.password || undefined,
      });

      if (res.success) {
        setSuccessMsg(res.message || "Athlete updated.");
        setAthletes((prev) =>
          prev.map((a) =>
            a.id === editingAthlete.id
              ? {
                  ...a,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone || null,
                  role: formData.role,
                  profile: {
                    gender: formData.gender,
                    weightClass: formData.weightClass,
                    phoneNumber: formData.phone || null,
                    coachPhone: formData.coachPhone || null,
                    coachName: formData.coachName || null,
                  },
                }
              : a
          )
        );
        setEditingAthlete(null);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "Failed to update athlete.");
      }
    });
  };

  const handleDeleteAthlete = () => {
    if (!deletingAthlete) return;

    startTransition(async () => {
      const res = await deleteAdminAthleteAction(deletingAthlete.id);
      if (res.success) {
        setSuccessMsg(res.message || "Athlete deleted.");
        setAthletes((prev) => prev.filter((a) => a.id !== deletingAthlete.id));
        setDeletingAthlete(null);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "Failed to delete athlete.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Top Header Strip ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c0603] via-[#0e0302] to-[#070101] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Users className="h-3.5 w-3.5" />
              <span>Athlete Roster & IPF Profiles</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              Registered <span className="text-cyan-400">Athletes</span>
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              Complete administrative authority: register new national lifters, adjust verified weight categories, manage roles, or safely revoke accounts.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="group inline-flex items-center justify-center gap-2 self-start md:self-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
            <span>Add New Athlete</span>
          </button>
        </div>

        {/* Quick Stats Strip */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Total Lifters</span>
            <span className="font-heading text-2xl font-bold text-white">{athletes.length}</span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Active Members</span>
            <span className="font-heading text-2xl font-bold text-emerald-400">
              {athletes.filter((a) => a.activeMembership?.status === "ACTIVE").length}
            </span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Male Lifters</span>
            <span className="font-heading text-2xl font-bold text-cyan-400">
              {athletes.filter((a) => a.profile?.gender === "MALE").length}
            </span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Female Lifters</span>
            <span className="font-heading text-2xl font-bold text-pink-400">
              {athletes.filter((a) => a.profile?.gender === "FEMALE").length}
            </span>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-emerald-300 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Check className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/60 p-4 text-red-300 flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <span className="text-xs font-bold">{errorMsg}</span>
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0201] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by lifter name, email, or weight class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#160402] px-3 py-2.5 text-xs font-bold text-gray-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Genders</option>
            <option value="MALE">Male Lifters</option>
            <option value="FEMALE">Female Lifters</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#160402] px-3 py-2.5 text-xs font-bold text-gray-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="MEMBER">Member / Athlete</option>
            <option value="REFEREE">Referee</option>
            <option value="MEET_DIRECTOR">Meet Director</option>
            <option value="ADMIN">Administrator</option>
          </select>

          {(searchQuery || roleFilter !== "ALL" || genderFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("ALL");
                setGenderFilter("ALL");
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Athletes Roster Table ── */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0201] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#150402] text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-6 py-4">Athlete Identity</th>
                <th className="px-6 py-4">Role & Access</th>
                <th className="px-6 py-4">IPF Division / Weight</th>
                <th className="px-6 py-4">Membership Pass</th>
                <th className="px-6 py-4">Enrolled Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Users className="mx-auto h-8 w-8 text-gray-600 mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No athletes match your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredAthletes.map((athlete) => (
                  <tr key={athlete.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 font-heading font-bold text-lg uppercase shadow-inner">
                          {athlete.name ? athlete.name.charAt(0) : "A"}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{athlete.name || "Unnamed Lifter"}</span>
                            {athlete.role === "ADMIN" && (
                              <ShieldCheck className="h-3.5 w-3.5 text-gym-primary" />
                            )}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">
                            {athlete.email}
                          </div>
                          {athlete.phone ? (
                            <a
                              href={`https://wa.me/${athlete.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline mt-0.5"
                              title="1-Click WhatsApp Direct Chat"
                            >
                              <Phone className="h-3 w-3 text-emerald-400" />
                              {athlete.phone}
                            </a>
                          ) : (
                            <div className="text-[10px] text-gray-600 italic mt-0.5">
                              No WhatsApp added
                            </div>
                          )}
                          {athlete.profile?.coachPhone && (
                            <div className="text-[10px] text-cyan-400/80 font-mono flex items-center gap-1 mt-0.5">
                              <span>Coach {athlete.profile.coachName ? `(${athlete.profile.coachName}):` : ":"}</span>
                              <a
                                href={`https://wa.me/${athlete.profile.coachPhone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:underline text-cyan-300"
                              >
                                {athlete.profile.coachPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                          athlete.role === "ADMIN"
                            ? "bg-gym-primary/20 text-gym-primary border-gym-primary/30 shadow-[0_0_10px_rgba(230,80,27,0.2)]"
                            : athlete.role === "REFEREE"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            : athlete.role === "MEET_DIRECTOR"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-white/5 text-gray-300 border-white/10"
                        }`}
                      >
                        {athlete.role}
                      </span>
                    </td>

                    {/* Weight & Gender */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-block rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400">
                          {formatWeightClassLabel(athlete.profile?.weightClass)}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {athlete.profile?.gender || "MALE"}
                        </span>
                      </div>
                    </td>

                    {/* Membership */}
                    <td className="px-6 py-4">
                      {athlete.activeMembership ? (
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                            ACTIVE
                          </span>
                          <div className="text-[11px] font-mono text-gray-400 mt-1">
                            {athlete.activeMembership.cardNumber}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500 font-medium italic">
                          No Active Pass
                        </span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                      {new Date(athlete.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(athlete)}
                          className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10 hover:scale-105 active:scale-95 transition-all"
                          title="Edit Athlete Profile"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setDeletingAthlete(athlete)}
                          className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 hover:scale-105 active:scale-95 transition-all"
                          title="Delete Athlete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: Add Athlete ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-[#1c0603] to-[#0a0201] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase text-white">
                    Add New Athlete
                  </h3>
                  <p className="text-xs text-gray-400">Create new verified lifter account</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAthlete} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Full Athlete Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Singh"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikram@powerlifting.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Athlete Phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center justify-between">
                  <span>WhatsApp Mobile (Lifter)</span>
                  <span className="text-[10px] text-cyan-400 font-normal">For Queue Alerts & Match SMS</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Coach Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Coach Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coach Sandeep"
                    value={formData.coachName}
                    onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Coach WhatsApp Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.coachPhone}
                      onChange={(e) => setFormData({ ...formData, coachPhone: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Initial Password <span className="text-gray-500">(required; at least 12 characters)</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={12}
                    maxLength={72}
                    placeholder="Enter a strong initial password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Row: Role & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="MEMBER">Member (Athlete)</option>
                    <option value="REFEREE">Referee</option>
                    <option value="MEET_DIRECTOR">Meet Director</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              {/* Weight Class */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  IPF Weight Category
                </label>
                <select
                  value={formData.weightClass}
                  onChange={(e) => setFormData({ ...formData, weightClass: e.target.value as WeightClass })}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  {WEIGHT_CLASSES.filter((wc) => wc.gender === formData.gender || wc.gender === "BOTH").map((wc) => (
                    <option key={wc.value} value={wc.value}>
                      {wc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg transition-all disabled:opacity-50"
                >
                  {isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Lifter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit Athlete ── */}
      {editingAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-[#1c0603] to-[#0a0201] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase text-white">
                    Edit Athlete
                  </h3>
                  <p className="text-xs text-gray-400">Modify profile and competition credentials</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAthlete(null)}
                className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAthlete} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Full Athlete Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Athlete Phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center justify-between">
                  <span>WhatsApp Mobile (Lifter)</span>
                  <span className="text-[10px] text-cyan-400 font-normal">If SIM is closed, replace with new number</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Coach Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Coach Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coach Sandeep"
                    value={formData.coachName}
                    onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Coach WhatsApp Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.coachPhone}
                      onChange={(e) => setFormData({ ...formData, coachPhone: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Reset Password <span className="text-gray-500">(Leave empty to keep current password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    minLength={12}
                    maxLength={72}
                    placeholder="Enter new password (min 12 chars)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 pr-10 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="MEMBER">Member (Athlete)</option>
                    <option value="REFEREE">Referee</option>
                    <option value="MEET_DIRECTOR">Meet Director</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  IPF Weight Category
                </label>
                <select
                  value={formData.weightClass}
                  onChange={(e) => setFormData({ ...formData, weightClass: e.target.value as WeightClass })}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  {WEIGHT_CLASSES.filter((wc) => wc.gender === formData.gender || wc.gender === "BOTH").map((wc) => (
                    <option key={wc.value} value={wc.value}>
                      {wc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingAthlete(null)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg transition-all disabled:opacity-50"
                >
                  {isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Update Lifter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete Athlete ── */}
      {deletingAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-red-500/40 bg-gradient-to-b from-[#220603] to-[#0c0201] p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold uppercase text-white">
                  Permanent Athlete Deletion
                </h3>
                <p className="text-xs text-red-300">Irreversible administrative action</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete athlete{" "}
              <strong className="text-white font-bold">{deletingAthlete.name || deletingAthlete.email}</strong>?
            </p>

            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-950/40 p-3 text-[11px] text-red-300 space-y-1">
              <p className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                This will purge:
              </p>
              <ul className="list-disc list-inside text-gray-300 text-[10px] space-y-0.5">
                <li>Athlete user profile & login credentials</li>
                <li>All active or expired membership passes</li>
                <li>All championship meet registrations & scores</li>
                <li>All pending account deletion requests</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingAthlete(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDeleteAthlete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all disabled:opacity-50"
              >
                {isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirm & Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
