/**
 * Referee category and role constants.
 * Kept in a plain (non-"use server") file so they can be safely imported
 * by both client components and server actions without violating Next.js rules.
 */

export type RefereeCategoryType =
  | "STATE_CAT_2"
  | "NATIONAL_CAT_2"
  | "NATIONAL_CAT_1"
  | "IPF_INTERNATIONAL";

export type OfficialRoleType =
  | "CHIEF_REFEREE"
  | "SIDE_REFEREE_LEFT"
  | "SIDE_REFEREE_RIGHT"
  | "JURY_PRESIDENT"
  | "JURY_MEMBER"
  | "TECHNICAL_CONTROLLER";

export const CATEGORY_META: Record<
  RefereeCategoryType,
  { label: string; badgeClass: string; desc: string }
> = {
  STATE_CAT_2: {
    label: "State Category 2 Referee",
    badgeClass: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    desc: "Qualified for District & State Level Sanctioned Championships",
  },
  NATIONAL_CAT_2: {
    label: "National Category 2 Referee",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    desc: "Qualified for Inter-State & National Selection Trials",
  },
  NATIONAL_CAT_1: {
    label: "National Category 1 Senior Referee",
    badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    desc: "Eligible for Chief Referee & National Championship Jury Duty",
  },
  IPF_INTERNATIONAL: {
    label: "IPF International Technical Official",
    badgeClass: "border-purple-500/40 bg-purple-500/10 text-purple-400",
    desc: "Global IPF Technical Clearance for World & Continental Championships",
  },
};

export const ROLE_LABELS: Record<OfficialRoleType, string> = {
  CHIEF_REFEREE: "Chief Referee (Center)",
  SIDE_REFEREE_LEFT: "Side Referee (Left)",
  SIDE_REFEREE_RIGHT: "Side Referee (Right)",
  JURY_PRESIDENT: "Jury President / Chief Controller",
  JURY_MEMBER: "Jury Panel Member",
  TECHNICAL_CONTROLLER: "Technical Marshall / Scale Marshall",
};
