"use client";

import React from "react";
import {
  LayoutDashboard,
  SlidersHorizontal,
  CheckSquare,
  FileText,
  Calendar,
  CreditCard,
} from "lucide-react";

export type RefereeMobileNavTab =
  | "overview"
  | "platform"
  | "checklist"
  | "report"
  | "calendar"
  | "earnings";

interface RefereeMobileBottomNavProps {
  activeTab: RefereeMobileNavTab;
  onChangeTab: (tab: RefereeMobileNavTab) => void;
  urgentCount?: number;
}

export function RefereeMobileBottomNav({
  activeTab,
  onChangeTab,
  urgentCount = 2,
}: RefereeMobileBottomNavProps) {
  const tabs = [
    { key: "overview" as const, label: "Command", icon: LayoutDashboard },
    { key: "platform" as const, label: "Switchboard", icon: SlidersHorizontal },
    { key: "checklist" as const, label: "Checklist", icon: CheckSquare, badge: urgentCount > 0 ? urgentCount : undefined },
    { key: "report" as const, label: "Report", icon: FileText },
    { key: "calendar" as const, label: "Roster", icon: Calendar },
    { key: "earnings" as const, label: "Ledger", icon: CreditCard },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-[#070201]/95 border-t border-white/10 backdrop-blur-xl px-2 py-1.5 shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeTab(tab.key)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? "text-gym-primary"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-bold mt-1 tracking-tight ${isActive ? "text-white" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
