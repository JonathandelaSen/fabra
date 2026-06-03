"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
import SidebarNavItem from "./sidebar-nav-item";

interface SidebarNavSectionItem {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface SidebarNavSectionProps {
  id: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  items: SidebarNavSectionItem[];
}

export default function SidebarNavSection({
  id,
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
      <AnimatePresence initial={false}>
        {(collapsed || open) && (
          <motion.div
            key={id}
            initial={collapsed ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
