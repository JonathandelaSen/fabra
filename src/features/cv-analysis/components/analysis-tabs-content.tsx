"use client";

import type { AnalysisMode, JobKeyData, OfferStatus } from "@/lib/analysis-types";
import { TabsContent } from "@/components/ui/tabs";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import type { InterviewQuestionSummary } from "../types";
import TabResumen from "./tab-resumen";
import TabOferta from "./tab-oferta";
import TabEntrevista from "./tab-entrevista";
import TabSeguimiento from "./tab-seguimiento";
import TabChatOferta from "./tab-chat-oferta";
import { AnalysisContextTab } from "./analysis-context-tab";

interface AnalysisTabsContentProps {
  isJobMatch: boolean;
  improvements: string[];
  keywords: string[];
  jobKeywords: string[];
  cvKeywords: string[];
  matchingKeywords: string[];
  missingKeywords: string[];
  analysisMode: AnalysisMode;
  jobKeyData: JobKeyData | null;
  jobDescription: string | null;
  interviewQuestions: InterviewQuestionSummary[];
  onOpenQuestions?: () => void;
  quickQuestion: string;
  onQuickQuestionChange: (value: string) => void;
  quickQuestionContext: string;
  onQuickQuestionContextChange: (value: string) => void;
  quickQuestionModel: string;
  onQuickQuestionModelChange: (value: string) => void;
  isCreatingQuestion: boolean;
  onCreateQuestion: (generateAfter?: boolean) => void;
  analysisId: string;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  offerStatus: OfferStatus;
  onOfferStatusChange: (value: OfferStatus) => void;
  offerNotes: string;
  onOfferNotesChange: (value: string) => void;
  offerNextAction: string;
  onOfferNextActionChange: (value: string) => void;
  offerNextActionAt: string;
  onOfferNextActionAtChange: (value: string) => void;
  isSavingTracking: boolean;
  onSaveTracking: () => void;
  additionalContext?: string;
  onOpenSettings?: () => void;
}

export function AnalysisTabsContent({
  isJobMatch,
  improvements,
  keywords,
  jobKeywords,
  cvKeywords,
  matchingKeywords,
  missingKeywords,
  analysisMode,
  jobKeyData,
  jobDescription,
  interviewQuestions,
  onOpenQuestions,
  quickQuestion,
  onQuickQuestionChange,
  quickQuestionContext,
  onQuickQuestionContextChange,
  quickQuestionModel,
  onQuickQuestionModelChange,
  isCreatingQuestion,
  onCreateQuestion,
  analysisId,
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  offerStatus,
  onOfferStatusChange,
  offerNotes,
  onOfferNotesChange,
  offerNextAction,
  onOfferNextActionChange,
  offerNextActionAt,
  onOfferNextActionAtChange,
  isSavingTracking,
  onSaveTracking,
  additionalContext,
  onOpenSettings,
}: AnalysisTabsContentProps) {
  return (
    <div className="min-h-0">
      <TabsContent value="resumen">
        <TabResumen
          improvements={improvements}
          keywords={keywords}
          jobKeywords={jobKeywords}
          cvKeywords={cvKeywords}
          matchingKeywords={matchingKeywords}
          missingKeywords={missingKeywords}
          analysisMode={analysisMode}
        />
      </TabsContent>

      {isJobMatch && (
        <>
          <TabsContent value="oferta">
            <TabOferta jobKeyData={jobKeyData} jobDescription={jobDescription} />
          </TabsContent>

          <TabsContent value="entrevista">
            <TabEntrevista
              interviewQuestions={interviewQuestions}
              onOpenQuestions={onOpenQuestions}
              quickQuestion={quickQuestion}
              onQuickQuestionChange={onQuickQuestionChange}
              quickQuestionContext={quickQuestionContext}
              onQuickQuestionContextChange={onQuickQuestionContextChange}
              quickQuestionModel={quickQuestionModel}
              onQuickQuestionModelChange={onQuickQuestionModelChange}
              isCreatingQuestion={isCreatingQuestion}
              onCreateQuestion={onCreateQuestion}
              aiProvider={aiProvider}
              hasAIApiKey={hasAIApiKey}
              onOpenSettings={onOpenSettings}
            />
          </TabsContent>

          <TabsContent value="chat">
            <TabChatOferta
              analysisId={analysisId}
              aiProvider={aiProvider}
              aiApiKey={aiApiKey}
              aiModel={aiModel}
              hasAIApiKey={hasAIApiKey}
            />
          </TabsContent>

          <TabsContent value="seguimiento">
            <TabSeguimiento
              offerStatus={offerStatus}
              onOfferStatusChange={onOfferStatusChange}
              offerNotes={offerNotes}
              onOfferNotesChange={onOfferNotesChange}
              offerNextAction={offerNextAction}
              onOfferNextActionChange={onOfferNextActionChange}
              offerNextActionAt={offerNextActionAt}
              onOfferNextActionAtChange={onOfferNextActionAtChange}
              isSavingTracking={isSavingTracking}
              onSaveTracking={onSaveTracking}
            />
          </TabsContent>
        </>
      )}

      {!isJobMatch && additionalContext && (
        <AnalysisContextTab additionalContext={additionalContext} />
      )}
    </div>
  );
}
