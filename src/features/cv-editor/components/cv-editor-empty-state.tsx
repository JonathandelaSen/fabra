"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { LayoutTemplate, Loader2 } from "lucide-react";
import { getCVTemplate } from "@/lib/cv-templates";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";

const PDFPreview = dynamic(
  () => import("@/components/shared/pdf-preview").then((mod) => mod.PDFPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-32 w-full items-center justify-center bg-zinc-950 text-zinc-600">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    ),
  },
);

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
        <div className="hidden sm:block">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
            <LayoutTemplate className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t("empty.title")}
          </h2>
          <p className="text-zinc-500 mb-8">
            {t("empty.description")}
          </p>
        </div>

        {templateCvs.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6 w-full">
            {templateCvs.map((cv) => (
              <div
                key={cv.id}
                onClick={() => onSelectVersion(cv.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectVersion(cv.id);
                  }
                }}
                className="flex w-full sm:w-64 flex-col items-start rounded-xl border border-white/5 bg-white/5 hover:border-teal-500/30 hover:bg-white/10 transition-all duration-300 shadow-md hover:shadow-teal-500/5 hover:-translate-y-0.5 group overflow-hidden cursor-pointer select-none"
              >
                <div className="relative w-full h-48 bg-zinc-950/85 border-b border-white/5 flex items-start justify-center overflow-hidden transition-colors duration-300 group-hover:bg-zinc-950">
                  <div className="w-full pointer-events-none">
                    <PDFPreview url={`/api/cvs/${cv.id}/template-pdf`} mini />
                  </div>
                </div>
                <div className="w-full p-4 flex flex-col items-start text-left">
                  <span className="font-semibold text-white truncate w-full group-hover:text-teal-400 transition-colors duration-300">
                    {cv.name}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                      {getCVTemplate(cv.templateId!)?.name || cv.templateId}
                    </span>
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                      {cv.templateLocale}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 mx-auto max-w-md">
            <p className="text-zinc-500 mb-6">
              {t("empty.noTemplateCvs")}
            </p>
            <IconTextButton
              icon={LayoutTemplate}
              tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
              onClick={onOpenTemplates}
              strong
            >
              {t("empty.openTemplates")}
            </IconTextButton>
          </div>
        )}
      </div>
    </div>
  );
}
