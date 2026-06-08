"use client";

import { useTranslations } from "next-intl";
import { CV_TYPE, type AnalysisMode, type AnalysisSummary } from "@/lib/analysis-types";
import type { InterviewQuestionResponse } from "@/app/api/interview-questions/responses";
import type { CVDocumentListItem } from "../../api/cv-library-api";
import type { StandardCVProfile } from "@/lib/cv-profile";
import { CVLibraryDetailHeader } from "./cv-library-detail-header";
import { CVLibraryDetailSummary } from "./cv-library-detail-summary";
import { CVLibraryDetailPreview } from "./cv-library-detail-preview";
import { CVLibraryJsonPreview } from "./cv-library-json-preview";
import { BasicPanel } from "@/components/shared/basic-panel";

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
  onOpenAnalysis: (id: string, mode?: AnalysisMode) => void;
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
      <BasicPanel as="section" radius="xl" className="overflow-hidden">
        <div className="flex min-h-[520px] items-center justify-center text-sm text-zinc-500">
          {t("selectToPreview")}
        </div>
      </BasicPanel>
    );
  }

  const templateVersions = cvs.filter(
    (cv) => cv.type === CV_TYPE.TEMPLATE && cv.sourceCvId === selected.id
  );
  const pdfPath =
    selected.type === CV_TYPE.TEMPLATE
      ? `/api/cvs/${selected.id}/template-pdf`
      : `/api/cvs/${selected.id}/pdf`;

  const latestWithScore = analyses.find(
    (a) => a.ai_score !== undefined && a.ai_score !== null
  );
  const displayScore = latestWithScore ? Math.round(latestWithScore.ai_score!) : null;

  return (
    <BasicPanel as="section" radius="xl" className="shrink-0 overflow-hidden">
      <div className="flex flex-col">
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

        {selected.type === CV_TYPE.JSON_RESUME ? (
          <CVLibraryJsonPreview
            profile={selected.profile as StandardCVProfile | null}
          />
        ) : (
          <CVLibraryDetailPreview
            pdfPath={pdfPath}
            title={t("previewTitle")}
          />
        )}
      </div>
    </BasicPanel>
  );
}
