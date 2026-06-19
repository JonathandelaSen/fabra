"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { MessageSquareQuote, Plus, RefreshCw } from "lucide-react";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import { SegmentedControl } from "@/components/shared/segmented-control";
import type { FeedbackFilter, FeedbackListItem } from "../api/feedback-notes-api";
import { ActivityContextSelector, type ActivityContext } from "@/features/activity-context";
import { FeedbackNotesListSkeleton } from "./feedback-notes-skeleton";
import { FeedbackNoteListItem } from "./feedback-note-list-item";

interface FeedbackNotesSidebarProps {
  feedbacks: FeedbackListItem[];
  contexts: ActivityContext[];
  selectedId: string | null;
  status: FeedbackFilter;
  isLoading: boolean;
  isCreating: boolean;
  isCreateOpen: boolean;
  onToggleCreate: () => void;
  onStatusChange: (status: FeedbackFilter) => void;
  onSelect: (feedbackId: string) => void;
  onCreate: (personName: string, activityContextId: string) => void;
}

export function FeedbackNotesSidebar({
  feedbacks,
  contexts,
  selectedId,
  status,
  isLoading,
  isCreating,
  isCreateOpen,
  onToggleCreate,
  onStatusChange,
  onSelect,
// onRefresh,
  onCreate,
}: FeedbackNotesSidebarProps) {
  const t = useTranslations("feedbackNotes");
  const router = useRouter();
  const [personName, setPersonName] = useState("");
  const [selectedContextId, setSelectedContextId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreateOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCreateOpen]);

  const defaultContextId =
    contexts.find((c) => c.isDefault)?.id ?? contexts[0]?.id ?? "";

  const submit = () => {
    const trimmedName = personName.trim();
    if (!trimmedName) return;
    onCreate(trimmedName, selectedContextId || defaultContextId);
    setPersonName("");
    onToggleCreate();
  };

  const openActivityContextManager = () => {
    router.push(
      `/activity-contexts?source=feedback-notes&returnTo=${encodeURIComponent("/feedback-notes")}`
    );
  };

  return (
    <FeatureSidebarPanel
      header={
        <>
          <SegmentedControl
            options={(["active", "closed", "all"] as FeedbackFilter[]).map((item) => ({
              value: item,
              label: t(`filters.${item}`),
            }))}
            value={status}
            onChange={onStatusChange}
            className="mb-4"
          />
          <div className="mb-2">
            <IconTextButton
              type="button"
              icon={Plus}
              tone={
                isCreateOpen
                  ? ICON_TEXT_BUTTON_TONES.DANGER
                  : ICON_TEXT_BUTTON_TONES.PRIMARY
              }
              fullWidth
              strong
              onClick={onToggleCreate}
            >
              {isCreateOpen ? t("actions.cancel") : t("actions.newNote")}
            </IconTextButton>
          </div>

          <AnimatePresence initial={false}>
            {isCreateOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex flex-col gap-3 border-t border-line/[0.04] pt-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="feedback-person-name" className="text-xs font-medium text-text-muted">
                      {t("fields.personName")}
                    </label>
                    <input
                      ref={inputRef}
                      id="feedback-person-name"
                      value={personName}
                      onChange={(event) => setPersonName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") submit();
                      }}
                      placeholder={t("placeholders.personName")}
                      className="h-9 w-full rounded-lg border border-input bg-panel/[0.03] px-2.5 py-1 text-sm text-text-main outline-none transition-colors placeholder:text-text-faint focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <ActivityContextSelector
                      id="feedback-activity-context"
                      label={t("fields.activityContext")}
                      manageLabel={t("actions.manageContexts")}
                      value={selectedContextId || defaultContextId}
                      onChange={setSelectedContextId}
                      contexts={contexts}
                      onManageClick={openActivityContextManager}
                    />
                    <div className="mt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={submit}
                        disabled={isCreating || !personName.trim()}
                        className="inline-flex h-7 items-center justify-center gap-1 rounded-lg bg-action px-2.5 text-[0.8rem] font-medium text-text-on-dark transition-colors hover:bg-action disabled:pointer-events-none disabled:opacity-50"
                      >
                        {isCreating ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            {t("actions.add")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      }
    >
      {isLoading ? (
        <FeedbackNotesListSkeleton />
      ) : feedbacks.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-action/10">
            <MessageSquareQuote className="h-5 w-5 text-action-text" />
          </div>
          <p className="text-sm font-medium text-text-muted">
            {t("empty")}
          </p>
        </div>
      ) : (
        feedbacks.map((feedback) => (
          <FeedbackNoteListItem
            key={feedback.id}
            feedback={feedback}
            isSelected={selectedId === feedback.id}
            onSelect={() => onSelect(feedback.id)}
          />
        ))
      )}
    </FeatureSidebarPanel>
  );
}
