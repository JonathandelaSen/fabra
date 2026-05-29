"use client";

import { AlertTriangle, X } from "lucide-react";
import {
  ActionIconButton,
  DeleteButton,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div
            className={`flex items-center gap-2 font-semibold text-sm ${
              variant === "danger" ? "text-rose-400" : "text-zinc-200"
            }`}
          >
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>Confirm Action</span>
          </div>
          <ActionIconButton
            icon={X}
            onClick={onCancel}
          />
        </div>

        <div className="p-5 space-y-2">
          <h3 className="text-base font-bold text-zinc-100 leading-snug">
            {title}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-white/[0.06] bg-white/[0.01] px-5 py-3.5">
          <IconTextButton
            icon={X}
            onClick={onCancel}
            strong
          >
            {cancelLabel}
          </IconTextButton>
          {variant === "danger" ? (
            <DeleteButton onClick={onConfirm} strong>
              {confirmLabel}
            </DeleteButton>
          ) : (
            <IconTextButton
              icon={AlertTriangle}
              tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
              onClick={onConfirm}
              strong
            >
              {confirmLabel}
            </IconTextButton>
          )}
        </div>
      </div>
    </div>
  );
}
