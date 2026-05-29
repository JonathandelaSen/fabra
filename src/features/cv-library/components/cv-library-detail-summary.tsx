"use client";

import { FileSearch, MessageSquareQuote, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisSummary } from "@/lib/analysis-types";
import type { InterviewQuestionResponse } from "@/app/api/interview-questions/responses";
import type { CVDocumentListItem } from "../api/cv-library-api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CVLibraryAtsScoreCircle } from "./cv-library-ats-score-circle";
import { CVLibraryAssociatedAnalyses } from "./cv-library-associated-analyses";
import { CVLibraryAssociatedQuestions } from "./cv-library-associated-questions";
import { CVLibraryTemplateVersions } from "./cv-library-template-versions";

interface CVLibraryDetailSummaryProps {
  selectedCvId: string;
  analyses: AnalysisSummary[];
  questions: InterviewQuestionResponse[];
  templateVersions: CVDocumentListItem[];
  displayScore: number | null;
  onOpenAnalysis: (id: string) => void;
  onOpenQuestions: (cvId: string) => void;
  onOpenEditor: (cvId: string) => void;
}

export function CVLibraryDetailSummary({
  selectedCvId,
  analyses,
  questions,
  templateVersions,
  displayScore,
  onOpenAnalysis,
  onOpenQuestions,
  onOpenEditor,
}: CVLibraryDetailSummaryProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <div className="grid gap-5 border-b border-white/[0.06] bg-white/[0.015] p-5 lg:grid-cols-[auto_1fr]">
      <CVLibraryAtsScoreCircle displayScore={displayScore} />

      {/* Panel Lateral de Pestañas y Acciones */}
      <div className="flex min-w-0 flex-col justify-between">
        <Tabs defaultValue="analyses" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList variant="default" className="mb-4 bg-zinc-950/40">
            <TabsTrigger value="analyses" className="flex items-center gap-1.5">
              <FileSearch className="h-3.5 w-3.5" />
              <span>{t("associatedAnalyses")}</span>
              <span className="rounded-full bg-white/[0.04] px-1.5 py-0.2 text-[10px] font-bold text-zinc-500">
                {analyses.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-1.5">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              <span>Preguntas</span>
              <span className="rounded-full bg-white/[0.04] px-1.5 py-0.2 text-[10px] font-bold text-zinc-500">
                {questions.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              <span>{t("templateVersions")}</span>
              <span className="rounded-full bg-white/[0.04] px-1.5 py-0.2 text-[10px] font-bold text-zinc-500">
                {templateVersions.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyses" className="min-h-0 flex-1 overflow-y-auto">
            <CVLibraryAssociatedAnalyses
              analyses={analyses}
              onOpenAnalysis={onOpenAnalysis}
            />
          </TabsContent>

          <TabsContent value="questions" className="min-h-0 flex-1 overflow-y-auto">
            <CVLibraryAssociatedQuestions
              selectedCvId={selectedCvId}
              questions={questions}
              onOpenQuestions={onOpenQuestions}
            />
          </TabsContent>

          <TabsContent value="templates" className="min-h-0 flex-1 overflow-y-auto">
            <CVLibraryTemplateVersions
              templateVersions={templateVersions}
              onOpenEditor={onOpenEditor}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
