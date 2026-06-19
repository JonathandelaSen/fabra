"use client";

import { Bold, Italic, LinkIcon } from "lucide-react";
import type { ChangeEvent, ComponentType, KeyboardEvent, RefObject } from "react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/frontend/components/ui/tooltip";

interface CVInlineMarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  multiline?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
}

type MarkdownAction = "bold" | "italic" | "boldItalic" | "link";

const actionConfig: Array<{
  action: MarkdownAction;
  icon: ComponentType<{ className?: string }>;
  secondaryIcon?: ComponentType<{ className?: string }>;
  marker?: string;
}> = [
  { action: "bold", icon: Bold, marker: "**" },
  { action: "italic", icon: Italic, marker: "*" },
  { action: "boldItalic", icon: Bold, secondaryIcon: Italic, marker: "***" },
  { action: "link", icon: LinkIcon },
];

const inputClass =
  "w-full rounded-xl border border-line bg-panel-hover px-3 py-2 text-sm text-text-main placeholder:text-text-faint focus:border-accent-teal-border focus:outline-none";

function formatValue(
  value: string,
  action: MarkdownAction,
  selectionStart: number,
  selectionEnd: number,
  linkText: string,
  linkUrl: string
) {
  const selected = value.slice(selectionStart, selectionEnd);
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);

  if (action === "link") {
    const text = selected || linkText;
    const replacement = `[${text}](${linkUrl})`;
    return {
      next: `${before}${replacement}${after}`,
      selectionStart: before.length + 1,
      selectionEnd: before.length + 1 + text.length,
    };
  }

  const marker = actionConfig.find((item) => item.action === action)?.marker ?? "";
  const replacement = selected
    ? `${marker}${selected}${marker}`
    : `${marker}${linkText}${marker}`;
  const startOffset = marker.length;
  const textLength = selected ? selected.length : linkText.length;

  return {
    next: `${before}${replacement}${after}`,
    selectionStart: before.length + startOffset,
    selectionEnd: before.length + startOffset + textLength,
  };
}

export function CVInlineMarkdownField({
  value,
  onChange,
  placeholder,
  rows = 3,
  multiline = true,
  onKeyDown,
}: CVInlineMarkdownFieldProps) {
  const t = useTranslations("cvEditor.manual.markdown");
  const fieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const fallbackText = t("selectedText");
  const fallbackUrl = "https://example.com";

  const apply = (action: MarkdownAction) => {
    const field = fieldRef.current;
    const selectionStart = field?.selectionStart ?? value.length;
    const selectionEnd = field?.selectionEnd ?? value.length;
    const formatted = formatValue(
      value,
      action,
      selectionStart,
      selectionEnd,
      fallbackText,
      fallbackUrl
    );

    onChange(formatted.next);
    window.requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(formatted.selectionStart, formatted.selectionEnd);
    });
  };

  const handleChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => onChange(event.target.value);

  return (
    <div className="space-y-1.5">
      <TooltipProvider>
        <div className="flex items-center gap-1 rounded-lg border border-line bg-panel/60 p-1">
          {actionConfig.map(({ action, icon: Icon, secondaryIcon: SecondaryIcon }) => (
            <Tooltip key={action}>
              <TooltipTrigger
                type="button"
                onClick={() => apply(action)}
                aria-label={t(action)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-panel-hover hover:text-text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal-border"
              >
                {SecondaryIcon ? (
                  <span className="flex items-center -space-x-1">
                    <Icon className="h-3.5 w-3.5" />
                    <SecondaryIcon className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </TooltipTrigger>
              <TooltipContent>{t(action)}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
      {multiline ? (
        <textarea
          ref={fieldRef as RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`${inputClass} resize-none`}
          rows={rows}
        />
      ) : (
        <input
          ref={fieldRef as RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}
