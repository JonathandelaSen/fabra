"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import type {
  ActivityContext,
  ReceivedFeedbackItem,
} from "../api/received-feedback-api";
import { useReceivedFeedbackMutations } from "../hooks/use-received-feedback-mutations";
import {
  useReceivedFeedbackContexts,
  useReceivedFeedbackList,
} from "../hooks/use-received-feedback-queries";
import { useReceivedFeedbackRouteState } from "../hooks/use-received-feedback-route-state";
import { ReceivedFeedbackDetail } from "./received-feedback-detail";
import { ReceivedFeedbackEmptyState } from "./received-feedback-empty-state";
import { ReceivedFeedbackForm } from "./received-feedback-form";
import type { FormState } from "./received-feedback-form";
import { ReceivedFeedbackListItem } from "./received-feedback-list-item";
import {
  ReceivedFeedbackListSkeleton,
  ReceivedFeedbackDetailSkeleton,
} from "./received-feedback-skeleton";

function emptyForm(): FormState {
  return {
    activityContextId: "",
    receivedDate: new Date().toISOString().slice(0, 10),
    giverName: "",
    feedbackText: "",
    userNote: "",
  };
}

function findDefaultContext(contexts: ActivityContext[]) {
  return contexts.find((context) => context.isDefault) ?? contexts[0] ?? null;
}

export default function ReceivedFeedbackView() {
  useReceivedFeedbackRouteState();
  const t = useTranslations("receivedFeedback");
  const router = useRouter();
  const searchParams = useSearchParams();

  const feedbackQuery = useReceivedFeedbackList();
  const contextsQuery = useReceivedFeedbackContexts();
  const mutations = useReceivedFeedbackMutations();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const rawItems = feedbackQuery.data ?? [];
  const contexts = contextsQuery.data?.contexts ?? [];

  const items = useMemo(() => {
    const sorted = [...rawItems].sort(
      (a, b) =>
        new Date(b.receivedDate).getTime() -
        new Date(a.receivedDate).getTime()
    );
    if (!searchQuery.trim()) return sorted;
    const query = searchQuery.toLowerCase();
    return sorted.filter(
      (item) =>
        item.giverName.toLowerCase().includes(query) ||
        item.feedbackText.toLowerCase().includes(query) ||
        (item.userNote && item.userNote.toLowerCase().includes(query))
    );
  }, [rawItems, searchQuery]);

  const selectedItem = useMemo(() => {
    return rawItems.find((item) => item.id === selectedId) ?? null;
  }, [rawItems, selectedId]);

  const saving =
    mutations.createFeedback.isPending ||
    mutations.updateFeedback.isPending ||
    mutations.deleteFeedback.isPending;
  const loading = feedbackQuery.isLoading || contextsQuery.isLoading;

  const queryError = feedbackQuery.error
    ? getErrorMessage(feedbackQuery.error)
    : contextsQuery.error
      ? getErrorMessage(contextsQuery.error)
      : null;
  const visibleError = error ?? queryError;

  useEffect(() => {
    if (!selectedId && !isCreating && items.length > 0) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId, isCreating]);

  useEffect(() => {
    const selectedContextId = searchParams.get("activityContextId");
    if (selectedContextId) {
      const defaultContext =
        contexts.find((c) => c.id === selectedContextId) ??
        findDefaultContext(contexts);
      setForm({
        ...emptyForm(),
        activityContextId: defaultContext?.id ?? selectedContextId,
      });
      setIsCreating(true);
      setSelectedId(null);
      setIsEditing(false);
      return;
    }
    const defaultContext = findDefaultContext(contexts);
    if (defaultContext && !form.activityContextId) {
      setForm((current) => ({
        ...current,
        activityContextId: defaultContext.id,
      }));
    }
  }, [contexts, form.activityContextId, searchParams]);

  const startCreate = () => {
    const defaultContext = findDefaultContext(contexts);
    setForm({ ...emptyForm(), activityContextId: defaultContext?.id ?? "" });
    setSelectedId(null);
    setIsCreating(true);
    setIsEditing(false);
    setError(null);
  };

  const startEdit = (item: ReceivedFeedbackItem) => {
    const fallbackContext = findDefaultContext(contexts);
    setForm({
      activityContextId: item.activityContextId ?? fallbackContext?.id ?? "",
      receivedDate: item.receivedDate,
      giverName: item.giverName,
      feedbackText: item.feedbackText,
      userNote: item.userNote ?? "",
    });
    setIsEditing(true);
    setIsCreating(false);
    setError(null);
  };

  const cancelAction = () => {
    setIsCreating(false);
    setIsEditing(false);
    if (items.length > 0) {
      setSelectedId(selectedId ?? items[0].id);
    } else {
      setSelectedId(null);
    }
    setForm(emptyForm());
  };

  const manageContexts = () => {
    router.push(
      `/activity-contexts?source=received-feedback&returnTo=${encodeURIComponent("/received-feedback")}`
    );
  };

  const saveFeedback = async () => {
    if (
      !form.receivedDate ||
      !form.giverName.trim() ||
      !form.feedbackText.trim()
    ) {
      setError(t("errors.required"));
      return;
    }

    const payload = {
      receivedDate: form.receivedDate,
      activityContextId: form.activityContextId,
      giverName: form.giverName,
      feedbackText: form.feedbackText,
      userNote: form.userNote || null,
    };

    setError(null);
    try {
      if (isEditing && selectedId) {
        await mutations.updateFeedback.mutateAsync({
          id: selectedId,
          updates: payload,
        });
        setIsEditing(false);
      } else {
        const result = await mutations.createFeedback.mutateAsync(payload);
        if (result?.id) {
          setSelectedId(result.id);
        }
        setIsCreating(false);
      }
      setForm(emptyForm());
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t("errors.saveFeedback"));
    }
  };

  const deleteFeedback = async (item: ReceivedFeedbackItem) => {
    if (!window.confirm(t("confirmDelete"))) return;

    setError(null);
    try {
      const deletedId = item.id;
      const currentIndex = items.findIndex((x) => x.id === deletedId);
      const nextSelection =
        items[currentIndex + 1]?.id ?? items[currentIndex - 1]?.id ?? null;

      await mutations.deleteFeedback.mutateAsync(item);

      if (selectedId === deletedId) {
        setSelectedId(nextSelection);
        setIsEditing(false);
        setIsCreating(false);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t("errors.deleteFeedback"));
    }
  };

  const selectItem = (id: string) => {
    setSelectedId(id);
    setIsEditing(false);
    setIsCreating(false);
    setError(null);
  };

  return (
    <FeatureScreenShell
      title={t("title")}
      actions={
        <FeatureHeaderActionButton
          label={t("newFeedback")}
          onClick={startCreate}
          disabled={saving}
        />
      }
    >
      <FeatureTwoPaneLayout
        sidebar={
          <FeatureSidebarPanel
            header={
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder={t("placeholders.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    contextName={
                      contexts.find((c) => c.id === item.activityContextId)
                        ?.name
                    }
                    onClick={() => selectItem(item.id)}
                  />
                ))}
              </div>
            )}
          </FeatureSidebarPanel>
        }
      >
        <div className="flex flex-col gap-4">
          {visibleError && (
            <div className="rounded-lg border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-text">
              {visibleError}
            </div>
          )}

          {loading ? (
            <ReceivedFeedbackDetailSkeleton />
          ) : isCreating ? (
            <ReceivedFeedbackForm
              form={form}
              setForm={setForm}
              contexts={contexts}
              today={today}
              saving={saving}
              onSave={() => void saveFeedback()}
              onCancel={cancelAction}
              onManageContexts={manageContexts}
              title={t("newFeedback")}
              subtitle={t("subtitles.create")}
            />
          ) : selectedItem ? (
            isEditing ? (
              <ReceivedFeedbackForm
                form={form}
                setForm={setForm}
                contexts={contexts}
                today={today}
                saving={saving}
                onSave={() => void saveFeedback()}
                onCancel={cancelAction}
                onManageContexts={manageContexts}
                title={t("editFeedback")}
                subtitle={t("subtitles.edit")}
              />
            ) : (
              <ReceivedFeedbackDetail
                item={selectedItem}
                contexts={contexts}
                onEdit={() => startEdit(selectedItem)}
                onDelete={() => void deleteFeedback(selectedItem)}
              />
            )
          ) : (
            <ReceivedFeedbackEmptyState onCreate={startCreate} />
          )}
        </div>
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
