"use client";

import { FileSearch, MessageSquareQuote, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisMode, AnalysisSummary } from "@/lib/analysis-types";
import type { InterviewQuestionResponse, CVDocumentListItem } from "@/features/cv-library";
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
  onOpenAnalysis: (id: string, mode?: AnalysisMode) => void;
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

      <div className="flex min-w-0 flex-col justify-between">
        <Tabs defaultValue="analyses" className="w-full flex flex-col">
          <TabsList
            variant="default"
            className="mb-4 bg-zinc-950/40 w-full max-w-full overflow-x-auto justify-start flex-nowrap md:justify-center [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          >
            <TabsTrigger value="analyses" className="flex items-center gap-1.5">
              <FileSearch className="h-3.5 w-3.5" />
              <span>{t("associatedAnalyses")}</span>
              <span className="rounded-full bg-white/[0.04] px-1.5 py-0.2 text-[10px] font-bold text-zinc-500">
                {analyses.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-1.5">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              <span>{t("questionsTab")}</span>
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

          <TabsContent value="analyses" className="focus-visible:outline-none">
            <CVLibraryAssociatedAnalyses
              analyses={analyses}
              onOpenAnalysis={onOpenAnalysis}
            />
          </TabsContent>

          <TabsContent value="questions" className="focus-visible:outline-none">
            <CVLibraryAssociatedQuestions
              selectedCvId={selectedCvId}
              questions={questions}
              onOpenQuestions={onOpenQuestions}
            />
          </TabsContent>

          <TabsContent value="templates" className="focus-visible:outline-none">
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
