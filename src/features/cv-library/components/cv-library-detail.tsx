"use client";

import { useTranslations } from "next-intl";
import type { AnalysisSummary } from "@/lib/analysis-types";
import type { InterviewQuestionResponse } from "@/app/api/interview-questions/responses";
import type { CVDocumentListItem } from "../api/cv-library-api";
import { CVLibraryDetailHeader } from "./cv-library-detail-header";
import { CVLibraryDetailSummary } from "./cv-library-detail-summary";
import { CVLibraryDetailPreview } from "./cv-library-detail-preview";

interface CVLibraryDetailProps {
  selected: CVDocumentListItem | null;
  cvs: CVDocumentListItem[];
  analyses: AnalysisSummary[];
  questions: InterviewQuestionResponse[];
  editing: boolean;
  draftName: string;
  saving: boolean;
  onStartEditing: () => void;
  onDraftNameChange: (name: string) => void;
  onSaveName: () => void;
  onCancelEditing: () => void;
  onDelete: () => void;
  onOpenAnalysis: (id: string) => void;
  onOpenEditor: (cvId: string) => void;
  onOpenQuestions: (cvId: string) => void;
}

export function CVLibraryDetail({
  selected,
  cvs,
  analyses,
  questions,
  editing,
  draftName,
  saving,
  onStartEditing,
  onDraftNameChange,
  onSaveName,
  onCancelEditing,
  onDelete,
  onOpenAnalysis,
  onOpenEditor,
  onOpenQuestions,
}: CVLibraryDetailProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  if (!selected) {
    return (
      <section className="min-h-0 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex h-full min-h-[520px] items-center justify-center text-sm text-zinc-500">
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

  // Calcular el último score de análisis ATS
  const latestWithScore = analyses.find(
    (a) => a.ai_score !== undefined && a.ai_score !== null
  );
  const displayScore = latestWithScore ? Math.round(latestWithScore.ai_score!) : null;

  return (
    <section className="min-h-0 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
      <div className="flex h-full min-h-[620px] flex-col">
        <CVLibraryDetailHeader
          selected={selected}
          editing={editing}
          draftName={draftName}
          saving={saving}
          onStartEditing={onStartEditing}
          onDraftNameChange={onDraftNameChange}
          onSaveName={onSaveName}
          onCancelEditing={onCancelEditing}
          onDelete={onDelete}
          onOpenEditor={onOpenEditor}
          pdfPath={pdfPath}
        />

        <CVLibraryDetailSummary
          selectedCvId={selected.id}
          analyses={analyses}
          questions={questions}
          templateVersions={templateVersions}
          displayScore={displayScore}
          onOpenAnalysis={onOpenAnalysis}
          onOpenQuestions={onOpenQuestions}
          onOpenEditor={onOpenEditor}
        />

        <CVLibraryDetailPreview
          pdfPath={pdfPath}
          title={t("previewTitle")}
        />
      </div>
    </section>
  );
}
