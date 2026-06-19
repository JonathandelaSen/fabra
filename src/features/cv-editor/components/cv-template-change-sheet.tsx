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
import { CVTemplatePreview } from "@/features/cv-templates";

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
        className="!w-full sm:!w-[800px] gap-0 border-line bg-panel-base p-0 sm:max-w-none"
      >
        <SheetHeader className="border-b border-line px-5 py-4">
          <SheetTitle className="text-base text-text-main">
            {t("title")}
          </SheetTitle>
          <SheetDescription className="text-xs text-text-muted">
            {t("description")}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 scrollbar-thin">
          <div className="grid grid-cols-1 gap-6">
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
                    "flex flex-col rounded-xl border p-3.5 text-left transition-all duration-200 group relative",
                    isCurrent
                      ? "cursor-not-allowed border-line bg-panel-hover text-text-faint opacity-80"
                      : "border-line bg-panel-subtle text-text-muted hover:border-line-strong hover:bg-panel-hover hover:shadow-md hover:-translate-y-0.5",
                    isSelected &&
                      "border-template-language-border bg-template-language-soft/20 text-template-language-text ring-2 ring-template-language-border/30",
                  )}
                >
                  {/* Visual Preview Container */}
                  <div className="w-full aspect-[794/1123] overflow-hidden rounded-lg border border-line/60 bg-white/95 shadow-sm transition-all duration-200 group-hover:border-line-strong group-hover:shadow-md mb-3 relative">
                    <svg
                      className="w-full h-full object-contain"
                      viewBox="0 0 794 1123"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <foreignObject width="794" height="1123">
                        <div className="w-[794px] h-[1123px] text-left select-none pointer-events-none origin-top-left scale-[1.0] bg-white">
                          <CVTemplatePreview
                            profile={template.fixtureProfile}
                            templateId={template.templateId}
                            locale={selectedLocale}
                          />
                        </div>
                      </foreignObject>
                    </svg>
                  </div>

                  {/* Template Info */}
                  <div className="flex flex-col justify-between flex-1 w-full px-1">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-text-main group-hover:text-text-main transition-colors">
                          {template.name}
                        </span>
                        {isSelected ? (
                          <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-template-language-border text-white shadow-sm">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <LayoutTemplate className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" />
                        )}
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-text-muted group-hover:text-text-soft transition-colors">
                        {template.description}
                      </p>
                    </div>

                    {isCurrent && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="inline-flex items-center rounded-md bg-panel-hover px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-muted border border-line/40">
                          {t("current")}
                        </span>
                      </div>
                    )}
                  </div>
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
