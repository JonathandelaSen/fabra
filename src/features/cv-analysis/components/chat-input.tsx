"use client";

import { FormEvent, RefObject } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="border-t border-white/[0.06] p-3">
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
          className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-xl border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-cyan-500/20"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isSending || !draft.trim()}
          className="size-10 shrink-0 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-30"
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
