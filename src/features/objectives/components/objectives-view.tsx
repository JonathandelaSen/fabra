"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Target } from "lucide-react";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import type {
  ObjectiveItem,
  ObjectiveItemStatus,
  ObjectiveOutcome,
  ObjectiveOutcomeStatus,
  ObjectiveOutcomeType,
  ObjectivePriority,
  ObjectiveSource,
  ObjectiveWithRelations,
} from "../api/objectives-api";
import { getErrorMessage } from "@/lib/errors";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import { useObjectivesMutations } from "../hooks/use-objectives-mutations";
import { useObjectivesWorkspace } from "../hooks/use-objectives-queries";
import { useObjectivesRouteState } from "../hooks/use-objectives-route-state";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { ObjectiveDetail } from "./objective-detail";
import { ObjectiveFormPanel } from "./objective-form-panel";
import { ObjectivesDetailSkeleton } from "./objectives-skeleton";
import { ObjectivesSidebar } from "./objectives-sidebar";
import { ObjectiveConfirmDialog } from "./objective-confirm-dialog";
import type {
  ItemEditForm,
  ObjectiveForm,
  OutcomeEditForm,
} from "./objectives-ui";

export default function ObjectivesView() {
  const t = useTranslations("objectives");
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceQuery = useObjectivesWorkspace();
  const mutations = useObjectivesMutations();
  const routeState = useObjectivesRouteState();
  const {
    clearObjective,
    objectiveId,
    replaceObjective,
    selectObjective,
  } = routeState;
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<ObjectiveForm | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newOutcomeTitle, setNewOutcomeTitle] = useState("");
  const [newOutcomeType, setNewOutcomeType] =
    useState<ObjectiveOutcomeType>("leadership");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<ItemEditForm | null>(null);
  const [editingOutcomeId, setEditingOutcomeId] = useState<string | null>(null);
  const [outcomeForm, setOutcomeForm] = useState<OutcomeEditForm | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "objective" | "item" | "outcome";
    item?: ObjectiveItem;
    outcome?: ObjectiveOutcome;
  } | null>(null);

  const contexts = workspaceQuery.data?.contexts ?? [];
  const commitments = workspaceQuery.data?.commitments ?? [];
  const loading = workspaceQuery.isLoading;
  const saving = Object.values(mutations).some((mutation) => mutation.isPending);
  const hasLoadedWorkspace = !loading || commitments.length > 0 || contexts.length > 0;
  const isEmpty = commitments.length === 0;

  const selected =
    commitments.find((item) => item.id === objectiveId) ??
    (objectiveId ? null : commitments[0] ?? null);
  const selectedIdInCurrentList =
    commitments.find((item) => item.id === objectiveId)?.id ?? null;
  const selectedContext = selected
    ? contexts.find((context) => context.id === selected.contextId) ?? null
    : null;
  const queryError = workspaceQuery.error
    ? getErrorMessage(workspaceQuery.error)
    : null;
  const visibleError = error ?? queryError;

  useEffect(() => {
    if (!objectiveId && commitments[0]?.id) {
      replaceObjective(commitments[0].id);
    }
  }, [commitments, objectiveId, replaceObjective]);

  useEffect(() => {
    const activityContextId = searchParams.get("activityContextId");
    if (!activityContextId) return;
    if (form) {
      setForm((current) => (current ? { ...current, contextId: activityContextId } : current));
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setIsCreating(true);
      setForm({
        contextId: activityContextId,
        title: "",
        description: "",
        successCriteria: "",
        resultNotes: "",
        source: "self",
        status: "active",
        priority: "",
        startDate: today,
        targetDate: "",
      });
    }
  }, [searchParams]);

  const clearInlineEdits = () => {
    setForm(null);
    setEditingItemId(null);
    setEditingOutcomeId(null);
  };

  const startCreate = () => {
    const defaultContext = contexts.find((context) => context.isDefault) ?? contexts[0];
    const today = new Date().toISOString().slice(0, 10);
    setIsCreating(true);
    setForm({
      contextId: defaultContext?.id ?? "",
      title: "",
      description: "",
      successCriteria: "",
      resultNotes: "",
      source: "self",
      status: "active",
      priority: "",
      startDate: today,
      targetDate: "",
    });
  };

  const startEdit = (commitment: ObjectiveWithRelations) => {
    setIsCreating(false);
    setForm({
      contextId: commitment.contextId,
      title: commitment.title,
      description: commitment.description ?? "",
      successCriteria: commitment.successCriteria ?? "",
      resultNotes: commitment.resultNotes ?? "",
      source: commitment.source,
      status: commitment.status,
      priority: commitment.priority ?? "",
      startDate: commitment.startDate,
      targetDate: commitment.targetDate ?? "",
    });
  };

  const saveObjective = async () => {
    if (!form || !form.title.trim() || !form.contextId) {
      setError(t("errors.required"));
      return;
    }
    setError(null);
    const payload = objectivePayload(form);
    const targetId = isCreating ? null : selected?.id;

    if (targetId) {
      setForm(null);
      setIsCreating(false);
      void runMutation(
        () =>
          mutations.updateObjective.mutateAsync({
            id: targetId,
            updates: payload,
          }),
        t("errors.saveObjective")
      );
      return;
    }

    try {
      setForm(null);
      setIsCreating(false);
      const optimisticId = `optimistic-objective-${Date.now()}`;
      selectObjective(optimisticId);
      const data = await mutations.createObjective.mutateAsync({
        input: payload,
        optimisticId,
      });
      selectObjective(data.id);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      clearObjective();
    }
  };

  const manageContexts = () => {
    router.push(
      `/activity-contexts?source=objectives&returnTo=${encodeURIComponent("/objectives")}`
    );
  };

  const updateItemStatus = async (item: ObjectiveItem, status: ObjectiveItemStatus) => {
    if (isEmpty) return;
    const completedAt = status === "done" ? new Date().toISOString() : null;
    await runMutation(
      () => mutations.updateItem.mutateAsync({ id: item.id, updates: { status, completedAt } }),
      t("errors.saveChanges")
    );
  };

  const startEditItem = (item: ObjectiveItem) => {
    if (isEmpty) return;
    setEditingItemId(item.id);
    setItemForm({
      title: item.title,
      notes: item.notes ?? "",
      evidenceNotes: item.evidenceNotes ?? "",
      status: item.status,
      dueDate: item.dueDate ?? "",
    });
  };

  const saveItem = async () => {
    if (!editingItemId || !itemForm || !itemForm.title.trim()) return;
    const completedAt = itemForm.status === "done" ? new Date().toISOString() : null;
    const itemId = editingItemId;
    const updates = {
      title: itemForm.title,
      notes: itemForm.notes || null,
      evidenceNotes: itemForm.evidenceNotes || null,
      status: itemForm.status,
      dueDate: itemForm.dueDate || null,
      completedAt,
    };
    stopEditingItem();
    void runMutation(
      () =>
        mutations.updateItem.mutateAsync({
          id: itemId,
          updates,
        }),
      t("errors.saveChanges")
    );
  };

  const startEditOutcome = (outcome: ObjectiveOutcome) => {
    if (isEmpty) return;
    setEditingOutcomeId(outcome.id);
    setOutcomeForm({
      title: outcome.title,
      description: outcome.description ?? "",
      type: outcome.type,
      status: outcome.status,
      amount: outcome.amount?.toString() ?? "",
      currency: outcome.currency ?? "EUR",
    });
  };

  const saveOutcome = async () => {
    if (!editingOutcomeId || !outcomeForm || !outcomeForm.title.trim()) return;
    const decidedAt = outcomeForm.status !== "expected" ? new Date().toISOString() : null;
    await runMutation(
      () =>
        mutations.updateOutcome.mutateAsync({
          id: editingOutcomeId,
          updates: {
            title: outcomeForm.title,
            description: outcomeForm.description || null,
            type: outcomeForm.type,
            status: outcomeForm.status,
            amount: outcomeForm.amount ? Number(outcomeForm.amount) : null,
            currency: outcomeForm.currency || null,
            decidedAt,
          },
        }),
      t("errors.saveChanges")
    );
    stopEditingOutcome();
  };

  const createItem = async () => {
    if (!selected || !newItemTitle.trim() || isEmpty) return;
    const title = newItemTitle;
    const objectiveId = selected.id;
    const orderIndex = selected.items.length;
    setNewItemTitle("");
    void runMutation(
      () =>
        mutations.createItem.mutateAsync({
          objectiveId,
          input: { title, orderIndex },
        }),
      t("errors.saveChanges")
    );
  };

  const createOutcome = async () => {
    if (!selected || !newOutcomeTitle.trim() || isEmpty) return;
    const title = newOutcomeTitle;
    const type = newOutcomeType;
    const objectiveId = selected.id;
    setNewOutcomeTitle("");
    void runMutation(
      () =>
        mutations.createOutcome.mutateAsync({
          objectiveId,
          input: { title, type, status: "expected" },
        }),
      t("errors.saveChanges")
    );
  };

  const updateOutcomeStatus = async (
    outcome: ObjectiveOutcome,
    status: ObjectiveOutcomeStatus
  ) => {
    if (isEmpty) return;
    await runMutation(
      () =>
        mutations.updateOutcome.mutateAsync({
          id: outcome.id,
          updates: {
            status,
            decidedAt: status === "expected" ? null : new Date().toISOString(),
          },
        }),
      t("errors.saveChanges")
    );
  };

  const deleteItem = async (item: ObjectiveItem) => {
    if (isEmpty) return;
    setConfirmDelete({ type: "item", item });
  };

  const confirmDeleteItem = async (item: ObjectiveItem) => {
    await runMutation(
      () => mutations.deleteItem.mutateAsync(item.id),
      t("errors.saveChanges")
    );
  };

  const deleteOutcome = async (outcome: ObjectiveOutcome) => {
    if (isEmpty) return;
    setConfirmDelete({ type: "outcome", outcome });
  };

  const confirmDeleteOutcome = async (outcome: ObjectiveOutcome) => {
    await runMutation(
      () => mutations.deleteOutcome.mutateAsync(outcome.id),
      t("errors.saveChanges")
    );
  };

  const deleteObjective = async () => {
    if (!selected || isEmpty) return;
    setConfirmDelete({ type: "objective" });
  };

  const confirmDeleteObjective = async () => {
    if (!selected) return;
    const deletedId = selected.id;
    const currentIndex = commitments.findIndex((item) => item.id === deletedId);
    const nextObjective =
      commitments[currentIndex + 1] ??
      commitments[currentIndex - 1] ??
      commitments.find((item) => item.id !== deletedId) ??
      null;

    clearInlineEdits();
    if (nextObjective) {
      replaceObjective(nextObjective.id);
    } else {
      clearObjective();
    }

    setError(null);
    try {
      await mutations.deleteObjective.mutateAsync(deletedId);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t("errors.saveChanges"));
      replaceObjective(deletedId);
    }
  };

  const stopEditingItem = () => {
    setEditingItemId(null);
    setItemForm(null);
  };

  const stopEditingOutcome = () => {
    setEditingOutcomeId(null);
    setOutcomeForm(null);
  };

  const runMutation = async <TResult,>(
    action: () => Promise<TResult>,
    fallbackMessage: string
  ) => {
    setError(null);
    try {
      return await action();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || fallbackMessage);
      return null;
    }
  };

  const itemStatusLabel = (status: ObjectiveItemStatus) => t(`itemStatus.${status}`);
  const outcomeLabel = (type: ObjectiveOutcomeType) => t(`outcomeTypes.${type}`);
  const outcomeStatusLabel = (status: ObjectiveOutcomeStatus) =>
    t(`outcomeStatus.${status}`);
  const priorityLabel = (priority: ObjectivePriority) => t(`priority.${priority}`);
  const sourceLabel = (source: ObjectiveSource) => t(`source.${source}`);

  return (
    <FeatureScreenShell
      title={
        <span className="flex items-center gap-2">
          <Target className="h-6 w-6 text-zinc-400" />
          {t("title")}
        </span>
      }
      actions={
        <FeatureHeaderActionButton
          label={t("newObjective")}
          onClick={startCreate}
          disabled={saving}
        />
      }
    >
      <FeatureTwoPaneLayout
        sidebar={
          <ObjectivesSidebar
            contexts={contexts}
            commitments={commitments}
            hasLoadedWorkspace={hasLoadedWorkspace}
            selectedId={selectedIdInCurrentList}
            onSelect={(id) => {
              selectObjective(id);
              clearInlineEdits();
            }}
            t={t}
          />
        }
      >
        {visibleError && (
          <AlertBanner tone={ALERT_BANNER_TONES.DANGER} className="mb-4">
            {visibleError}
          </AlertBanner>
        )}

        {!hasLoadedWorkspace ? (
          <ObjectivesDetailSkeleton />
        ) : form ? (
          <ObjectiveFormPanel
            contexts={contexts}
            form={form}
            isCreating={isCreating}
            saving={saving}
            onCancel={() => setForm(null)}
            onFormChange={setForm}
            onManageContexts={manageContexts}
            onSave={saveObjective}
            priorityLabel={priorityLabel}
            sourceLabel={sourceLabel}
            t={t}
          />
        ) : selected ? (
          <ObjectiveDetail
            editingItemId={editingItemId}
            editingOutcomeId={editingOutcomeId}
            isEmpty={isEmpty}
            itemForm={itemForm}
            newItemTitle={newItemTitle}
            newOutcomeTitle={newOutcomeTitle}
            newOutcomeType={newOutcomeType}
            outcomeForm={outcomeForm}
            saving={saving}
            selected={selected}
            selectedContext={selectedContext}
            onCreateItem={createItem}
            onCreateOutcome={createOutcome}
            onDeleteItem={deleteItem}
            onDeleteObjective={deleteObjective}
            onDeleteOutcome={deleteOutcome}
            onEditItem={startEditItem}
            onEditObjective={startEdit}
            onEditOutcome={startEditOutcome}
            onItemFormChange={setItemForm}
            onItemTitleChange={setNewItemTitle}
            onNewOutcomeTitleChange={setNewOutcomeTitle}
            onNewOutcomeTypeChange={setNewOutcomeType}
            onOutcomeFormChange={setOutcomeForm}
            onSaveItem={saveItem}
            onSaveOutcome={saveOutcome}
            onStopEditingItem={stopEditingItem}
            onStopEditingOutcome={stopEditingOutcome}
            onUpdateItemStatus={updateItemStatus}
            onUpdateOutcomeStatus={updateOutcomeStatus}
            itemStatusLabel={itemStatusLabel}
            outcomeLabel={outcomeLabel}
            outcomeStatusLabel={outcomeStatusLabel}
            priorityLabel={priorityLabel}
            sourceLabel={sourceLabel}
            t={t}
          />
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-zinc-500">{t("emptySelection")}</p>
          </div>
        )}
      </FeatureTwoPaneLayout>

      {confirmDelete && (
        <ObjectiveConfirmDialog
          title={
            confirmDelete.type === "objective"
              ? t("confirmDeleteObjectiveTitle")
              : confirmDelete.type === "item"
                ? t("confirmDeleteItemTitle")
                : t("confirmDeleteOutcomeTitle")
          }
          description={
            confirmDelete.type === "objective"
              ? t("confirmDeleteObjectiveDescription")
              : confirmDelete.type === "item"
                ? t("confirmDeleteItemDescription")
                : t("confirmDeleteOutcomeDescription")
          }
          confirmLabel={t("actions.delete") || "Delete"}
          cancelLabel={t("actions.cancel") || "Cancel"}
          onConfirm={() => {
            if (confirmDelete.type === "objective") {
              void confirmDeleteObjective();
            } else if (confirmDelete.type === "item" && confirmDelete.item) {
              void confirmDeleteItem(confirmDelete.item);
            } else if (confirmDelete.type === "outcome" && confirmDelete.outcome) {
              void confirmDeleteOutcome(confirmDelete.outcome);
            }
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </FeatureScreenShell>
  );
}

function objectivePayload(form: ObjectiveForm) {
  return {
    ...form,
    description: form.description || null,
    successCriteria: form.successCriteria || null,
    resultNotes: form.resultNotes || null,
    priority: form.priority || null,
    targetDate: form.targetDate || null,
  };
}
