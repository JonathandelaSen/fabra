"use client";

import { Settings, ShieldCheck, UserCircle } from "lucide-react";
import type { SidebarActiveView } from "./sidebar-types";

interface SidebarFooterProps {
  activeView: SidebarActiveView;
  collapsed: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  settingsLabel: string;
  observabilityLabel: string;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

export default function SidebarFooter({
  activeView,
  collapsed,
  isAdmin,
  userEmail,
  settingsLabel,
  observabilityLabel,
  onOpenSettings,
  onOpenAdmin,
}: SidebarFooterProps) {
  return (
    <div className="px-3 py-3 border-t border-white/[0.06] shrink-0 space-y-3">
      <button
        onClick={onOpenSettings}
        className={`
          w-full flex items-center gap-2 rounded-lg font-medium transition-all duration-150
          ${activeView === "settings" ? "bg-white/[0.08] text-zinc-100" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"}
          ${collapsed ? "justify-center p-2" : "px-3 py-2.5 text-sm"}
        `}
        title={settingsLabel}
      >
        <Settings className="w-4 h-4 shrink-0" />
        {!collapsed && <span>{settingsLabel}</span>}
      </button>
      {isAdmin && (
        <button
          type="button"
          onClick={onOpenAdmin}
          className={`
            w-full flex items-center gap-2 rounded-lg font-medium transition-all duration-150
            ${activeView === "admin" ? "bg-emerald-500/10 text-emerald-200" : "text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"}
            ${collapsed ? "justify-center p-2" : "px-3 py-2.5 text-sm"}
          `}
          title={observabilityLabel}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{observabilityLabel}</span>}
        </button>
      )}
      {!collapsed && (
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0 text-[11px] text-zinc-500">
            <UserCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{userEmail}</span>
          </div>
        </div>
      )}
    </div>
  );
}
