"use client";

import type { ActivityContext, ReceivedFeedbackItem } from "../types";
import { ReceivedFeedbackDetail } from "./received-feedback-detail";
import { ReceivedFeedbackEmptyState } from "./received-feedback-empty-state";
import { ReceivedFeedbackForm, type FormState } from "./received-feedback-form";
import { ReceivedFeedbackDetailSkeleton } from "./received-feedback-skeleton";

interface ReceivedFeedbackMainProps {
  contexts: ActivityContext[];
  form: FormState;
  isCreating: boolean;
  isEditing: boolean;
  loading: boolean;
  saving: boolean;
  selectedItem: ReceivedFeedbackItem | null;
  today: string;
  visibleError: string | null;
  onCancel: () => void;
  onCreate: () => void;
  onDelete: (item: ReceivedFeedbackItem) => void;
  onEdit: (item: ReceivedFeedbackItem) => void;
  onManageContexts: () => void;
  onSave: () => void;
  setForm: (form: FormState | ((current: FormState) => FormState)) => void;
  t: (key: string) => string;
}

export function ReceivedFeedbackMain({
  contexts,
  form,
  isCreating,
  isEditing,
  loading,
  saving,
  selectedItem,
  today,
  visibleError,
  onCancel,
  onCreate,
  onDelete,
  onEdit,
  onManageContexts,
  onSave,
  setForm,
  t,
}: ReceivedFeedbackMainProps) {
  return (
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
          onSave={onSave}
          onCancel={onCancel}
          onManageContexts={onManageContexts}
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
            onSave={onSave}
            onCancel={onCancel}
            onManageContexts={onManageContexts}
            title={t("editFeedback")}
            subtitle={t("subtitles.edit")}
          />
        ) : (
          <ReceivedFeedbackDetail
            item={selectedItem}
            contexts={contexts}
            onEdit={() => onEdit(selectedItem)}
            onDelete={() => onDelete(selectedItem)}
          />
        )
      ) : (
        <ReceivedFeedbackEmptyState onCreate={onCreate} />
      )}
    </div>
  );
}
