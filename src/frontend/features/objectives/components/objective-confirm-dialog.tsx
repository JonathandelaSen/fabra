"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface ObjectiveConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ObjectiveConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ObjectiveConfirmDialogProps) {
  return (
    <ConfirmDialog
      open
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
