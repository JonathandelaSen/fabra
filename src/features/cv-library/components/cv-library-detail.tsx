"use client";

import {
  Briefcase,
  Clock,
  Download,
  ExternalLink,
  FileSearch,
  MessageSquareQuote,
  Pencil,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisSummary } from "@/lib/analysis-types";
import type { InterviewQuestionResponse } from "@/app/api/interview-questions/responses";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import type { CVDocumentListItem } from "../api/cv-library-api";

interface CVLibraryDetailProps {
  selected: CVDocumentListItem | null;
  cvs: CVDocumentListItem[];
  analyses: AnalysisSummary[];
  questions: InterviewQuestionResponse[];
  onOpenAnalysis: (id: string) => void;
  onOpenEditor: (cvId: string) => void;
  onOpenQuestions: (cvId: string) => void;
}

export function CVLibraryDetail({
  selected,
  cvs,
  analyses,
  questions,
  onOpenAnalysis,
  onOpenEditor,
  onOpenQuestions,
}: CVLibraryDetailProps) {
  const t = useTranslations("analysisFlow.cvLibrary");
  const { locale } = useInterfaceLanguage();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (!selected) {
    return (
      <section className="min-h-0 overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
        <div className="flex h-full min-h-[520px] items-center justify-center text-sm text-zinc-600">
          {t("selectToPreview")}
        </div>
      </section>
    );
  }

  const templateVersions = cvs.filter(
    (cv) => cv.type === "template" && cv.sourceCvId === selected.id
  );
  const pdfPath =
    selected.type === "template"
      ? `/api/cvs/${selected.id}/template-pdf`
      : `/api/cvs/${selected.id}/pdf`;

  return (
    <section className="min-h-0 overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
      <div className="flex h-full min-h-[520px] flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-100">
              {selected.name}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {selected.filename}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {selected.type === "template" && (
              <button
                type="button"
                onClick={() => onOpenEditor(selected.id)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 text-xs font-semibold text-teal-300 transition-colors hover:bg-teal-500/20"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t("editWithAI")}
              </button>
            )}
            <a
              href={pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
              title={t("viewPdf")}
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="border-b border-white/[0.06] px-4 py-3">
          <div className="mb-4">
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Pencil className="h-3.5 w-3.5 text-teal-300" />
              {t("templateVersions")}
            </p>
            {templateVersions.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2">
                {templateVersions.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onOpenEditor(template.id)}
                    className="rounded-lg border border-teal-500/15 bg-teal-500/10 px-3 py-2 text-left text-xs font-semibold text-teal-200 hover:bg-teal-500/20"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-white/[0.04] bg-[#0a0a12]/70 px-3 py-2 text-xs text-zinc-600">
                {t("noTemplateVersions")}
              </p>
            )}
          </div>

          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <FileSearch className="h-3.5 w-3.5 text-sky-300" />
              {t("associatedAnalyses")}
            </p>
            <span className="rounded-md bg-zinc-800/70 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
              {analyses.length}
            </span>
          </div>
          {analyses.length > 0 ? (
            <div className="grid max-h-40 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
              {analyses.map((analysis) => (
                <a
                  key={analysis.id}
                  href={
                    analysis.analysis_mode === "job_match"
                      ? `/job-analyses/${encodeURIComponent(analysis.id)}`
                      : `/cv-analysis/${encodeURIComponent(analysis.id)}`
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    onOpenAnalysis(analysis.id);
                  }}
                  className="group flex min-w-0 items-center gap-2 rounded-lg border border-white/[0.05] bg-[#0a0a12] px-3 py-2 text-left transition-colors hover:border-sky-500/25 hover:bg-sky-500/10"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/70 text-zinc-500 group-hover:text-sky-300">
                    {analysis.analysis_mode === "job_match" ? (
                      <Briefcase className="h-3.5 w-3.5" />
                    ) : (
                      <FileSearch className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-zinc-200">
                      {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-600">
                      <Clock className="h-3 w-3" />
                      {formatDate(analysis.created_at)}
                    </span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-sky-300" />
                </a>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-white/[0.04] bg-[#0a0a12]/70 px-3 py-2 text-xs text-zinc-600">
              {t("noAssociatedAnalyses")}
            </p>
          )}

          <div className="mt-4 mb-2 flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <MessageSquareQuote className="h-3.5 w-3.5 text-fuchsia-300" />
              {t("associatedQuestions")}
            </p>
            <button
              type="button"
              onClick={() => onOpenQuestions(selected.id)}
              className="inline-flex items-center gap-1 rounded-md border border-fuchsia-500/20 bg-fuchsia-500/10 px-2 py-1 text-[10px] font-semibold text-fuchsia-300 hover:bg-fuchsia-500/20"
            >
              <Plus className="h-3 w-3" />
              {t("create")}
            </button>
          </div>
          {questions.length > 0 ? (
            <div className="grid max-h-32 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
              {questions.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => onOpenQuestions(selected.id)}
                  className="group flex min-w-0 items-center gap-2 rounded-lg border border-white/[0.05] bg-[#0a0a12] px-3 py-2 text-left transition-colors hover:border-fuchsia-500/25 hover:bg-fuchsia-500/10"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/70 text-zinc-500 group-hover:text-fuchsia-300">
                    <MessageSquareQuote className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-zinc-200">
                      {question.question}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-zinc-600">
                      {question.answer ? t("answered") : t("pending")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-white/[0.04] bg-[#0a0a12]/70 px-3 py-2 text-xs text-zinc-600">
              {t("noAssociatedQuestions")}
            </p>
          )}
        </div>

        <iframe
          src={`${pdfPath}#toolbar=0`}
          className="min-h-0 flex-1 bg-zinc-950"
          title={t("previewTitle")}
        />
      </div>
    </section>
  );
}
