"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import SidebarNavItem from "./sidebar-nav-item";

interface SidebarNavSectionItem {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface SidebarNavSectionProps {
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  items: SidebarNavSectionItem[];
}

export default function SidebarNavSection({
  icon: Icon,
  label,
  collapsed,
  open,
  onToggle,
  items,
}: SidebarNavSectionProps) {
  return (
    <>
      {!collapsed && (
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-soft hover:bg-panel-hover transition-colors mt-1 cursor-pointer"
        >
          <Icon className="w-3 h-3 shrink-0" />
          <span className="flex-1 text-left">{label}</span>
          <ChevronDown
            className={`w-3 h-3 shrink-0 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          />
        </button>
      )}
      {(collapsed || open) && (
        <div className={`space-y-0.5 ${!collapsed ? "pl-2" : ""}`}>
          {items.map((item) => (
            <SidebarNavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={item.active}
              collapsed={collapsed}
              onClick={item.onClick}
            />
          ))}
        </div>
      )}
    </>
  );
}
