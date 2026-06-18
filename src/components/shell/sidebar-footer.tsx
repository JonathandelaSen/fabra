"use client";

import { Settings, ShieldCheck, UserCircle } from "lucide-react";
import type { SidebarActiveView } from "./sidebar-types";

interface SidebarFooterProps {
  activeView: SidebarActiveView;
  collapsed: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  settingsLabel: string;
  adminLabel: string;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

export default function SidebarFooter({
  activeView,
  collapsed,
  isAdmin,
  userEmail,
  settingsLabel,
  adminLabel,
  onOpenSettings,
  onOpenAdmin,
}: SidebarFooterProps) {
  return (
    <div className="px-3 py-3 border-t border-sidebar-border shrink-0 space-y-3">
      <button
        onClick={onOpenSettings}
        className={`
          w-full flex items-center gap-2 rounded-lg font-medium cursor-pointer transition-all duration-150
          ${activeView === "settings" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-text-muted hover:bg-panel-hover hover:text-text-soft"}
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
            w-full flex items-center gap-2 rounded-lg font-medium cursor-pointer transition-all duration-150
            ${activeView === "admin" ? "bg-success/10 text-success-text" : "text-success-text hover:bg-success/10 hover:text-success-text"}
            ${collapsed ? "justify-center p-2" : "px-3 py-2.5 text-sm"}
          `}
          title={adminLabel}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{adminLabel}</span>}
        </button>
      )}
      {!collapsed && (
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0 text-[11px] text-text-muted">
            <UserCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{userEmail}</span>
          </div>
        </div>
      )}
    </div>
  );
}
