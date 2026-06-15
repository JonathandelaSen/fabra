"use client";

import { useId } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ActionIconButton,
  DeleteButton,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";

export type ConfirmDialogVariant = "danger" | "default";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  headerTitle?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  headerTitle,
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslations("common.actions");
  const titleId = useId();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex h-full w-full sm:h-auto sm:max-h-[90vh] sm:max-w-md flex-col overflow-hidden rounded-none sm:rounded-xl border-0 sm:border border-line bg-modal shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div
            className={`flex items-center gap-2 font-semibold text-sm ${
              variant === "danger" ? "text-danger" : "text-text-main"
            }`}
          >
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>{headerTitle || t("confirmAction")}</span>
          </div>
          <ActionIconButton
            icon={X}
            onClick={onCancel}
            aria-label={t("close")}
          />
        </div>

        <div className="p-5 space-y-2 flex-1 sm:flex-initial">
          <h3
            id={titleId}
            className="text-base font-bold text-text-main leading-snug"
          >
            {title}
          </h3>
          {description ? (
            <p className="text-sm text-text-muted leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-line bg-panel-subtle px-5 py-3.5">
          <IconTextButton
            icon={X}
            onClick={onCancel}
            strong
          >
            {cancelLabel ?? t("cancel")}
          </IconTextButton>
          {variant === "danger" ? (
            <DeleteButton onClick={onConfirm} strong>
              {confirmLabel ?? t("confirmAction")}
            </DeleteButton>
          ) : (
            <IconTextButton
              icon={AlertTriangle}
              tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
              onClick={onConfirm}
              strong
            >
              {confirmLabel ?? t("confirmAction")}
            </IconTextButton>
          )}
        </div>
      </div>
    </div>
  );
}
