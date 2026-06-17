"use client";

import type { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

export default function SidebarNavItem({
  icon: Icon,
  label,
  active,
  collapsed,
  onClick,
}: SidebarNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 rounded-lg font-medium cursor-pointer transition-all duration-150
        ${active ? "bg-linear-to-t from-sidebar-active-from to-sidebar-active-to text-sidebar-accent-foreground" : "text-text-muted hover:bg-panel-hover hover:text-text-soft"}
        ${collapsed ? "justify-center p-2" : "px-3 py-2 text-sm"}
      `}
      title={collapsed ? label : undefined}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-action" : ""}`} />
      {!collapsed && <span className="flex-1 text-left">{label}</span>}
    </button>
  );
}
