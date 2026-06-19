"use client";

import { Check, LayoutTemplate } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import {
  CV_TEMPLATES,
  type CVTemplateId,
  type CVTemplateLocale,
} from "@/lib/cv-templates";
import { cn } from "@/lib/utils";

interface CVTemplateChangeSheetProps {
  activeTemplateId: CVTemplateId;
  changing: boolean;
  locale: CVTemplateLocale;
  open: boolean;
  onChangeTemplate: (input: {
    templateId: CVTemplateId;
    locale: CVTemplateLocale;
  }) => void;
  onOpenChange: (open: boolean) => void;
}

export function CVTemplateChangeSheet({
  activeTemplateId,
  changing,
  locale,
  open,
  onChangeTemplate,
  onOpenChange,
}: CVTemplateChangeSheetProps) {
  const t = useTranslations("cvEditor.changeTemplate");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<CVTemplateId | null>(null);
  const [selectedLocale, setSelectedLocale] =
    useState<CVTemplateLocale>(locale);

  const selectedTemplate = useMemo(
    () =>
      CV_TEMPLATES.find((template) => template.templateId === selectedTemplateId) ??
      null,
    [selectedTemplateId],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (changing) return;
    if (nextOpen) {
      setSelectedTemplateId(null);
      setSelectedLocale(locale);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        closeLabel={t("close")}
        className="!w-[min(92dvw,560px)] gap-0 border-line bg-panel-base p-0 sm:max-w-none"
      >
        <SheetHeader className="border-b border-line px-5 py-4">
          <SheetTitle className="text-base text-text-main">
            {t("title")}
          </SheetTitle>
          <SheetDescription className="text-xs text-text-muted">
            {t("description")}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {CV_TEMPLATES.map((template) => {
              const isCurrent = template.templateId === activeTemplateId;
              const isSelected = template.templateId === selectedTemplateId;
              return (
                <button
                  key={template.templateId}
                  type="button"
                  disabled={isCurrent || changing}
                  onClick={() => setSelectedTemplateId(template.templateId)}
                  className={cn(
                    "flex min-h-28 flex-col justify-between rounded-lg border p-3 text-left transition-colors",
                    isCurrent
                      ? "cursor-not-allowed border-line bg-panel-hover text-text-faint"
                      : "border-line bg-panel-subtle text-text-muted hover:border-line-default hover:bg-panel-hover",
                    isSelected &&
                      "border-template-language-border bg-template-language-soft text-template-language-text",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-text-main">
                        {template.name}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5">
                        {template.description}
                      </p>
                    </div>
                    {isSelected ? (
                      <Check className="h-4 w-4 shrink-0" />
                    ) : (
                      <LayoutTemplate className="h-4 w-4 shrink-0 opacity-60" />
                    )}
                  </div>
                  {isCurrent && (
                    <span className="mt-3 text-[10px] font-semibold uppercase text-text-faint">
                      {t("current")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-lg border border-line bg-panel-subtle p-3">
            <span className="text-xs font-medium text-text-muted">
              {t("language")}
            </span>
            <div className="flex gap-1 rounded-lg border border-line bg-panel-hover p-1">
              {(["es", "en"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={changing}
                  onClick={() => setSelectedLocale(option)}
                  className={cn(
                    "rounded-md px-3 py-1 text-[10px] font-bold uppercase transition-colors",
                    selectedLocale === option
                      ? "bg-panel-active text-text-main"
                      : "text-text-muted hover:text-text-soft",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-line px-5 py-4">
          <IconTextButton
            icon={LayoutTemplate}
            loading={changing}
            disabled={!selectedTemplate || changing}
            tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
            onClick={() => {
              if (!selectedTemplate) return;
              onChangeTemplate({
                templateId: selectedTemplate.templateId,
                locale: selectedLocale,
              });
            }}
          >
            {t("createVersion")}
          </IconTextButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
