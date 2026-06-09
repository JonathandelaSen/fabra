"use client";

import { Inbox } from "lucide-react";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import type { ActivityContext, ReceivedFeedbackItem } from "../types";
import { ReceivedFeedbackListItem } from "./received-feedback-list-item";
import { ReceivedFeedbackListSkeleton } from "./received-feedback-skeleton";

interface ReceivedFeedbackSidebarProps {
  contexts: ActivityContext[];
  items: ReceivedFeedbackItem[];
  loading: boolean;
  searchQuery: string;
  selectedId: string | null;
  onSearchChange: (value: string) => void;
  onSelectItem: (id: string) => void;
  t: (key: string) => string;
}

export function ReceivedFeedbackSidebar({
  contexts,
  items,
  loading,
  searchQuery,
  selectedId,
  onSearchChange,
  onSelectItem,
  t,
}: ReceivedFeedbackSidebarProps) {
  return (
    <FeatureSidebarPanel
      header={
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder={t("placeholders.search")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-line-default bg-panel-subtle px-3 py-1.5 text-xs text-text-soft outline-none placeholder:text-text-faint focus:border-action-border"
          />
        </div>
      }
    >
      {loading ? (
        <ReceivedFeedbackListSkeleton />
      ) : items.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10">
            <Inbox className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-zinc-400">
            {searchQuery ? t("emptySearch") : t("empty")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ReceivedFeedbackListItem
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              contextName={contexts.find((c) => c.id === item.activityContextId)?.name}
              onClick={() => onSelectItem(item.id)}
            />
          ))}
        </div>
      )}
    </FeatureSidebarPanel>
  );
}
