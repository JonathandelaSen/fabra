"use client";

import { Briefcase, CalendarDays, ClipboardCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureSidebarPanel } from "@/frontend/components/shared/feature-sidebar-panel";
import { LabelBadge } from "@/frontend/components/shared/label-badge";
import { SidebarListItem } from "@/frontend/components/shared/sidebar-list-item";
import { PerformanceReviewSidebarSkeleton } from "./performance-review-skeleton";
import type {
  ActivityContext,
  PerformanceReviewItem,
} from "../api/performance-review-api";

interface PerformanceReviewListProps {
  reviews: PerformanceReviewItem[];
  contexts: ActivityContext[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PerformanceReviewList(props: PerformanceReviewListProps) {
  const t = useTranslations("performanceReview");
  const contextNameById = new Map(
    props.contexts.map((context) => [context.id, context.name]),
  );

  return (
    <FeatureSidebarPanel>
      {props.isLoading && (
        <PerformanceReviewSidebarSkeleton />
      )}
      {!props.isLoading && props.reviews.length === 0 && (
        <div className="px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-action/10">
            <ClipboardCheck className="h-5 w-5 text-action-text" />
          </div>
          <p className="text-sm font-medium text-text-muted">{t("empty.sidebar")}</p>
        </div>
      )}
      {!props.isLoading && <div className="space-y-1">
        {props.reviews.map((review) => {
          const contextName = review.activityContextId
            ? contextNameById.get(review.activityContextId) ?? null
            : null;
          return (
            <SidebarListItem
              key={review.id}
              onClick={() => props.onSelect(review.id)}
              selected={props.selectedId === review.id}
              title={review.title}
              subtitle={
                <div className="mt-1.5 space-y-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {review.reviewDate}
                  </span>
                  {contextName && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {contextName}
                    </span>
                  )}
                </div>
              }
              footer={<LabelBadge>{t(`status.${review.status}`)}</LabelBadge>}
            />
          );
        })}
      </div>}
    </FeatureSidebarPanel>
  );
}
