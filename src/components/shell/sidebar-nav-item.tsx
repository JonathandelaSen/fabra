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
        w-full flex items-center gap-2 rounded-lg font-medium transition-all duration-150
        ${active ? "bg-white/[0.08] text-zinc-100" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"}
        ${collapsed ? "justify-center p-2" : "px-3 py-2 text-sm"}
      `}
      title={collapsed ? label : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="flex-1 text-left">{label}</span>}
    </button>
  );
}
