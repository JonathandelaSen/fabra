"use client";

import { useTranslations } from "next-intl";
import { LayoutTemplate } from "lucide-react";
import { getCVTemplate } from "@/lib/cv-templates";
import { Button } from "@/components/ui/button";

interface TemplateCv {
  id: string;
  name: string;
  templateId: string | null;
  templateLocale: string | null;
}

interface CVEditorEmptyStateProps {
  templateCvs: TemplateCv[];
  onSelectVersion: (id: string) => void;
  onOpenTemplates: () => void;
}

export function CVEditorEmptyState({
  templateCvs,
  onSelectVersion,
  onOpenTemplates,
}: CVEditorEmptyStateProps) {
  const t = useTranslations("cvEditor");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#050509] p-10 text-center overflow-y-auto">
      <div className="max-w-3xl w-full">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
          <LayoutTemplate className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t("empty.title")}
        </h2>
        <p className="text-zinc-500 mb-8">
          {t("empty.description")}
        </p>

        {templateCvs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {templateCvs.map((cv) => (
              <button
                key={cv.id}
                onClick={() => onSelectVersion(cv.id)}
                className="flex flex-col items-start rounded-xl border border-white/5 bg-white/5 p-4 hover:border-teal-500/30 hover:bg-white/10 transition-colors"
              >
                <span className="font-semibold text-white truncate w-full">
                  {cv.name}
                </span>
                <div className="flex items-center gap-2 mt-3">
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                    {getCVTemplate(cv.templateId!)?.name || cv.templateId}
                  </span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                    {cv.templateLocale}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 mx-auto max-w-md">
            <p className="text-zinc-500 mb-6">
              {t("empty.noTemplateCvs")}
            </p>
            <Button
              onClick={onOpenTemplates}
              className="bg-teal-500 text-black hover:bg-teal-400"
            >
              {t("empty.openTemplates")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
