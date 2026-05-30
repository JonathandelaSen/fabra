"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import type { ActivityContext, ReceivedFeedbackItem } from "../types";
import { useReceivedFeedbackMutations } from "../hooks/use-received-feedback-mutations";
import { useReceivedFeedbackContexts, useReceivedFeedbackList } from "../hooks/use-received-feedback-queries";
import { useReceivedFeedbackRouteState } from "../hooks/use-received-feedback-route-state";
import type { FormState } from "./received-feedback-form";
import { ReceivedFeedbackMain } from "./received-feedback-main";
import { ReceivedFeedbackSidebar } from "./received-feedback-sidebar";

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
    const sorted = [...rawItems].sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime());
    if (!searchQuery.trim()) return sorted;
    const query = searchQuery.toLowerCase();
    return sorted.filter((item) => item.giverName.toLowerCase().includes(query) || item.feedbackText.toLowerCase().includes(query) || (item.userNote && item.userNote.toLowerCase().includes(query)));
  }, [rawItems, searchQuery]);

  const selectedItem = useMemo(() => {
    return rawItems.find((item) => item.id === selectedId) ?? null;
  }, [rawItems, selectedId]);

  const saving = mutations.createFeedback.isPending || mutations.updateFeedback.isPending || mutations.deleteFeedback.isPending;
  const loading = feedbackQuery.isLoading || contextsQuery.isLoading;

  const queryError = feedbackQuery.error ? getErrorMessage(feedbackQuery.error) : contextsQuery.error ? getErrorMessage(contextsQuery.error) : null;
  const visibleError = error ?? queryError;

  useEffect(() => {
    if (!selectedId && !isCreating && items.length > 0) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId, isCreating]);

  useEffect(() => {
    const selectedContextId = searchParams.get("activityContextId");
    if (selectedContextId) {
      const defaultContext = contexts.find((c) => c.id === selectedContextId) ?? findDefaultContext(contexts);
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
      setForm((current) => ({ ...current, activityContextId: defaultContext.id }));
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
    router.push(`/activity-contexts?source=received-feedback&returnTo=${encodeURIComponent("/received-feedback")}`);
  };

  const saveFeedback = async () => {
    if (!form.receivedDate || !form.giverName.trim() || !form.feedbackText.trim()) {
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
        await mutations.updateFeedback.mutateAsync({ id: selectedId, updates: payload });
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
      const nextSelection = items[currentIndex + 1]?.id ?? items[currentIndex - 1]?.id ?? null;

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
          <ReceivedFeedbackSidebar
            contexts={contexts}
            items={items}
            loading={loading}
            searchQuery={searchQuery}
            selectedId={selectedId}
            onSearchChange={setSearchQuery}
            onSelectItem={selectItem}
            t={t}
          />
        }
      >
        <ReceivedFeedbackMain
          contexts={contexts}
          form={form}
          isCreating={isCreating}
          isEditing={isEditing}
          loading={loading}
          saving={saving}
          selectedItem={selectedItem}
          today={today}
          visibleError={visibleError}
          onCancel={cancelAction}
          onCreate={startCreate}
          onDelete={(item) => void deleteFeedback(item)}
          onEdit={startEdit}
          onManageContexts={manageContexts}
          onSave={() => void saveFeedback()}
          setForm={setForm}
          t={t}
        />
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
