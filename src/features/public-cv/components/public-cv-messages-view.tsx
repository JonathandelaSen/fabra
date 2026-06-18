"use client";

import { useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Inbox, Calendar, User } from "lucide-react";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import { SidebarListItem } from "@/components/shared/sidebar-list-item";
import { BasicPanel } from "@/components/shared/basic-panel";
import { DeleteButton } from "@/components/shared/action-buttons";
import { useConfirm } from "@/components/shared/confirm-provider";
import { SidebarEmptyState } from "@/components/shared/sidebar-empty-state";
import { FeatureEmptyState } from "@/components/shared/feature-empty-state";
import { useIsDesktopLayout } from "@/components/shared/use-is-desktop-layout";
import { usePublicCVFeedback } from "../hooks/use-public-cv-feedback";
import { useCVDocumentList } from "@/features/cv-library";
import { usePublicCVMessagesRouteState } from "../hooks/use-public-cv-messages-route-state";
import { PublicCVMessagesListSkeleton, PublicCVMessagesDetailSkeleton } from "./public-cv-messages-skeleton";
import { shouldShowPublicCVMessagesLoader } from "./public-cv-messages-loading-state";

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % 8);
  return `var(--ui-avatar-${index})`;
}

export function PublicCVMessagesView() {
  const t = useTranslations("publicCvMessages");
  const confirm = useConfirm();
  const cvsQuery = useCVDocumentList();
  const publicCVs = (cvsQuery.data ?? []).filter((cv) => cv.publicEnabled);
  const { cvId, messageId, selectCV, selectMessage, clearSelection, replaceMessage } = usePublicCVMessagesRouteState();
  const { query, remove } = usePublicCVFeedback(cvId);
  const isDesktopLayout = useIsDesktopLayout();

  const items = useMemo(() => query.data ?? [], [query.data]);
  const loading = shouldShowPublicCVMessagesLoader({ cvsPending: cvsQuery.isPending, feedbackPending: query.isPending, cvId, publicCVCount: publicCVs.length, desktop: isDesktopLayout, messageId, messageCount: items.length });

  // Auto-select first item on desktop if no ID in URL
  useEffect(() => {
    if (!cvId && publicCVs.length > 0) {
      selectCV(publicCVs[0].id);
    }
  }, [cvId, publicCVs, selectCV]);

  useEffect(() => {
    if (isDesktopLayout && !messageId && items.length > 0) {
      replaceMessage(items[0].id);
    }
  }, [messageId, items, isDesktopLayout, replaceMessage]);

  const activeId = messageId;
  const selected = useMemo(() => items.find((item) => item.id === activeId) ?? null, [activeId, items]);

  const handleDelete = async (id: string) => {
    if (!(await confirm({ title: t("confirmDelete") }))) return;
    try {
      await remove.mutateAsync(id);
      // Clear selection or select another item
      const remainingItems = items.filter((item) => item.id !== id);
      if (remainingItems.length > 0) {
        if (isDesktopLayout) {
          replaceMessage(remainingItems[0].id);
        } else {
          clearSelection();
        }
      } else {
        clearSelection();
      }
    } catch {
      // handled by mutation
    }
  };

  const nameForAvatar = selected?.giverName || t("visitor");
  const initials = nameForAvatar
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarColor = getAvatarColor(nameForAvatar);

  return (
    <FeatureScreenShell
      title={t("title")}
      mobileBackActive={Boolean(messageId)}
      onMobileBack={clearSelection}
    >
      <FeatureTwoPaneLayout
        mobileDetailActive={Boolean(messageId)}
        sidebar={
          <FeatureSidebarPanel
            header={
              <select aria-label={t("cvSelector")} value={cvId ?? ""} onChange={(event) => selectCV(event.target.value)} className="w-full rounded-md border border-line bg-panel-control px-3 py-2 text-sm text-text-on-bright">
                {publicCVs.map((cv) => <option key={cv.id} value={cv.id}>{cv.name}</option>)}
              </select>
            }
          >
            {loading ? (
              <PublicCVMessagesListSkeleton />
            ) : items.length === 0 ? (
              <SidebarEmptyState icon={Inbox} message={t("empty")} />
            ) : (
              items.map((item) => (
                <SidebarListItem
                  key={item.id}
                  title={item.giverName || t("visitor")}
                  selected={item.id === activeId}
                  onClick={() => selectMessage(item.id)}
                  subtitle={
                    <p className="line-clamp-2 text-xs text-text-muted">
                      {item.feedbackText}
                    </p>
                  }
                  footer={
                    <span className="text-[10px] text-text-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  }
                />
              ))
            )}
          </FeatureSidebarPanel>
        }
      >
        {loading ? (
          <PublicCVMessagesDetailSkeleton />
        ) : items.length === 0 ? (
          <FeatureEmptyState
            icon={MessageSquare}
            title={t("title")}
            description={t("empty")}
          />
        ) : selected ? (
          <BasicPanel className="h-full p-6 flex flex-col min-w-0 w-full bg-panel">
            <div className="flex h-full w-full flex-col">
              <div className="flex items-start justify-between gap-4 border-b border-line pb-6">
                <div className="flex items-start gap-4">
                  <div
                    style={{ backgroundColor: avatarColor }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-text-main text-base font-bold shadow-sm ring-2 ring-line-default"
                  >
                    {initials || <User className="h-5 w-5" />}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <h2 className="text-xl font-bold tracking-tight text-text-main truncate">
                      {selected.giverName || t("visitor")}
                    </h2>
                    {selected.giverContext && (
                      <span className="inline-flex items-center rounded-md bg-panel-subtle px-2 py-1 text-xs font-semibold text-text-soft border border-line-default">
                        {selected.giverContext}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(selected.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <DeleteButton
                  onClick={() => handleDelete(selected.id)}
                  loading={remove.isPending}
                >
                  {t("delete")}
                </DeleteButton>
              </div>

              <div className="flex-1 overflow-y-auto py-6 min-w-0 w-full">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-main font-normal tracking-wide">
                  {selected.feedbackText}
                </p>
              </div>
            </div>
          </BasicPanel>
        ) : (
          <FeatureEmptyState
            icon={MessageSquare}
            title={t("title")}
            description={t("select")}
          />
        )}
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
