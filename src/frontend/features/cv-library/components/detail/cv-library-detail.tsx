"use client";

import { useTranslations } from "next-intl";
import { CV_TYPE, type AnalysisMode, type AnalysisSummary } from "@/lib/analysis-types";
import type { InterviewQuestionResponse } from "@/app/api/interview-questions/responses";
import type { CVDocumentListItem } from "../../api/cv-library-api";
import type { CVProfilePrimitives } from "@/lib/cv-profile";
import { CVLibraryDetailHeader } from "./cv-library-detail-header";
import { CVLibraryDetailSummary } from "./cv-library-detail-summary";
import { CVLibraryDetailPreview } from "./cv-library-detail-preview";
import { CVLibraryJsonPreview } from "./cv-library-json-preview";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";
import { MessageCircle, PanelsTopLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import CVLibraryChat from "./cv-library-chat";

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
        <div className="flex min-h-[520px] items-center justify-center text-sm text-text-muted">
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

        <Tabs defaultValue="overview" className="min-w-0">
          <div className="border-b border-line/[0.06] px-5 pt-4">
            <TabsList className="w-fit">
              <TabsTrigger value="overview" className="gap-2">
                <PanelsTopLeft className="size-4" />
                {t("overviewTab")}
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-2">
                <MessageCircle className="size-4" />
                {t("chatTab")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
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
                profile={selected.profile as CVProfilePrimitives | null}
              />
            ) : (
              <CVLibraryDetailPreview
                pdfPath={pdfPath}
                title={t("previewTitle")}
              />
            )}
          </TabsContent>

          <TabsContent value="chat" className="p-4 sm:p-5">
            <CVLibraryChat cvId={selected.id} />
          </TabsContent>
        </Tabs>
      </div>
    </BasicPanel>
  );
}
