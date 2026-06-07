"use client";

import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { ObjectiveDetail } from "./objective-detail";
import { ObjectiveFormPanel } from "./objective-form-panel";
import { ObjectivesDetailSkeleton } from "./objectives-skeleton";
import { ObjectivesSidebar } from "./objectives-sidebar";
import { ObjectiveConfirmDialog } from "./objective-confirm-dialog";
import { useObjectivesViewState } from "../hooks/use-objectives-view-state";

export default function ObjectivesView() {
  const {
    t,
    contexts,
    commitments,
    hasLoadedWorkspace,
    selectedIdInCurrentList,
    objectiveId,
    selectObjective,
    clearObjective,
    clearInlineEdits,
    visibleError,
    saving,
    form,
    isCreating,
    setForm,
    manageContexts,
    saveObjective,
    selected,
    selectedContext,
    editingItemId,
    editingOutcomeId,
    isEmpty,
    itemForm,
    newItemTitle,
    newOutcomeTitle,
    newOutcomeType,
    outcomeForm,
    createItem,
    createOutcome,
    deleteItem,
    deleteObjective,
    deleteOutcome,
    startEditItem,
    startEdit,
    startEditOutcome,
    setItemForm,
    setNewItemTitle,
    setNewOutcomeTitle,
    setNewOutcomeType,
    setOutcomeForm,
    saveItem,
    saveOutcome,
    stopEditingItem,
    stopEditingOutcome,
    updateItemStatus,
    updateOutcomeStatus,
    itemStatusLabel,
    outcomeLabel,
    outcomeStatusLabel,
    priorityLabel,
    sourceLabel,
    startCreate,
    confirmDelete,
    setConfirmDelete,
    confirmDeleteObjective,
    confirmDeleteItem,
    confirmDeleteOutcome,
  } = useObjectivesViewState();

  return (
    <FeatureScreenShell
      mobileBackActive={Boolean(form) || Boolean(objectiveId)}
      onMobileBack={form ? () => setForm(null) : clearObjective}
      title={t("title")}
      actions={
        <FeatureHeaderActionButton
          label={t("newObjective")}
          onClick={startCreate}
          disabled={saving}
        />
      }
    >
      <FeatureTwoPaneLayout
        mobileDetailActive={form || objectiveId ? true : false}
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
