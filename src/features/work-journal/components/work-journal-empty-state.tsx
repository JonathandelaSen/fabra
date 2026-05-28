"use client";

import type { LucideIcon } from "lucide-react";
import { SidebarEmptyState } from "@/components/shared/sidebar-empty-state";

interface WorkJournalEmptyStateProps {
  icon: LucideIcon;
  text: string;
}

export function WorkJournalEmptyState({ icon, text }: WorkJournalEmptyStateProps) {
  return <SidebarEmptyState icon={icon} message={text} />;
}
