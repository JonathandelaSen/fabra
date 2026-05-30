"use client";

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
        <div className="px-4 py-12 text-center text-xs text-text-faint">
          {searchQuery ? t("emptySearch") : t("empty")}
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
