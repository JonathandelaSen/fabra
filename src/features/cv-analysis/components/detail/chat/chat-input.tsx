"use client";

import { FormEvent, RefObject } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_SIZES,
  ACTION_ICON_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  draft: string;
  onDraftChange: (value: string) => void;
  isSending: boolean;
  onSubmit: (event: FormEvent) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({
  draft,
  onDraftChange,
  isSending,
  onSubmit,
  textareaRef,
}: ChatInputProps) {
  const t = useTranslations("analysisDetail.chat");

  return (
    <div className="border-t border-line/[0.06] p-3">
      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSubmit(e);
            }
          }}
          placeholder={t("inputPlaceholder")}
          rows={1}
          className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-xl border-line/[0.08] bg-panel/[0.03] px-3.5 py-2.5 text-sm text-text-soft placeholder:text-text-faint focus-visible:ring-info-border"
        />
        <ActionIconButton
          type="submit"
          icon={Send}
          loading={isSending}
          buttonSize={ACTION_ICON_BUTTON_SIZES.LG}
          tone={ACTION_ICON_BUTTON_TONES.PRIMARY}
          disabled={isSending || !draft.trim()}
        />
      </form>
    </div>
  );
}
