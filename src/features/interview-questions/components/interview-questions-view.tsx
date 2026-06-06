"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { useIsDesktopLayout } from "@/components/shared/use-is-desktop-layout";
import type {
  InterviewQuestion,
  UpdateInterviewQuestionInput,
} from "../api/interview-questions-api";
import { useInterviewQuestionsMutations } from "../hooks/use-interview-questions-mutations";
import {
  useInterviewQuestionDetail,
  useInterviewQuestionOptions,
  useInterviewQuestionsList,
} from "../hooks/use-interview-questions-queries";
import { useInterviewQuestionsRouteState } from "../hooks/use-interview-questions-route-state";
import { InterviewQuestionCopyPastePanel } from "./interview-question-copy-paste-panel";
import { InterviewQuestionDetail } from "./interview-question-detail";
import {
  shouldAutoSelectInterviewQuestion,
  shouldShowInterviewQuestionsDetailLoader,
  shouldShowInterviewQuestionsShellLoader,
} from "./interview-questions-loading-state";
import { InterviewQuestionsSidebar } from "./interview-questions-sidebar";
import {
  InterviewQuestionsDetailSkeleton,
  InterviewQuestionsSkeleton,
} from "./interview-questions-skeleton";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import { getAIRequestConfigForProvider, type StoredAIProvider } from "@/lib/browser-preferences";

interface InterviewQuestionsViewProps {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onOpenAnalysis: (id: string) => void;
}

export default function InterviewQuestionsView({
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
  onOpenAnalysis,
}: InterviewQuestionsViewProps) {
  const t = useTranslations("interviewQuestions");
  const routeState = useInterviewQuestionsRouteState();
  const {
    questionId,
    pathname,
    filters,
    setFilters,
    selectQuestion,
    replaceQuestion,
    clearQuestion,
  } = routeState;
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(questionId);

  useEffect(() => {
    setSelectedQuestionId(questionId);
  }, [questionId]);

  const listQuery = useInterviewQuestionsList(filters);
  const detailQuery = useInterviewQuestionDetail(selectedQuestionId);
  const optionsQuery = useInterviewQuestionOptions();
  const mutations = useInterviewQuestionsMutations(filters);
  const [provider, setProvider] = useState<StoredAIProvider>("gemini");
  const [model, setModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [error, setError] = useState<string | null>(null);
  const [isCopyPasteOpen, setIsCopyPasteOpen] = useState(false);

  const questions = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const cvs = optionsQuery.data?.cvs ?? [];
  const analyses = optionsQuery.data?.analyses ?? [];
  const selectedFromList =
    questions.find((question) => question.id === selectedQuestionId) ?? null;
  const selected = detailQuery.data ?? selectedFromList;
  const isSaving =
    mutations.updateQuestion.isPending ||
    mutations.deleteQuestion.isPending;
  const aiLoading = mutations.generateAnswer.isPending
    ? "generate"
    : mutations.editAnswer.isPending
      ? "edit"
      : null;
  const isListPending = listQuery.isPending;
  const isDetailPending = detailQuery.isPending;
  const isDesktopLayout = useIsDesktopLayout();

  useEffect(() => {
    if (
      isDesktopLayout &&
      shouldAutoSelectInterviewQuestion({
        isListPending,
        pathname,
        questionCount: questions.length,
        questionId,
      }) &&
      questions[0]?.id
    ) {
      setSelectedQuestionId(questions[0].id);
      replaceQuestion(questions[0].id);
    }
  }, [isDesktopLayout, isListPending, pathname, questions, questionId, replaceQuestion]);

  const setMutationError = (err: unknown) => setError(getErrorMessage(err));

  const updateQuestion = async (updates: Partial<UpdateInterviewQuestionInput>) => {
    if (!selected) return;
    setError(null);
    try {
      await mutations.updateQuestion.mutateAsync({ id: selected.id, updates });
    } catch (err: unknown) {
      setMutationError(err);
    }
  };

  const deleteQuestion = async () => {
    if (!selected) return;
    if (!confirm(t("errors.confirmDelete"))) return;
    const selectedIndex = questions.findIndex((item) => item.id === selected.id);
    const nextSelection =
      questions[selectedIndex + 1]?.id ?? questions[selectedIndex - 1]?.id ?? null;
    setError(null);
    if (nextSelection) {
      setSelectedQuestionId(nextSelection);
      replaceQuestion(nextSelection);
    } else {
      setSelectedQuestionId(null);
      clearQuestion();
    }
    try {
      await mutations.deleteQuestion.mutateAsync(selected.id);
    } catch (err: unknown) {
      setSelectedQuestionId(selected.id);
      replaceQuestion(selected.id);
      setMutationError(err);
    }
  };

  const runAI = async (mode: "generate" | "edit", instruction: string) => {
    if (!selected) return;
    const resolvedProvider = provider || aiProvider;
    const aiConfig = getAIRequestConfigForProvider(resolvedProvider, aiApiKey, model || aiModel);
    if (aiConfig.error) {
      setError(aiConfig.error);
      return;
    }
    setError(null);
    try {
      const result = await (mode === "generate"
        ? mutations.generateAnswer.mutateAsync({
            id: selected.id,
            input: {
              provider: aiConfig.provider,
              apiKey: aiConfig.apiKey,
              baseUrl: aiConfig.baseUrl,
              model: aiConfig.model,
              context: selected.context,
              cvId: selected.cvId,
              analysisId: selected.analysisId,
            },
          })
        : mutations.editAnswer.mutateAsync({
            id: selected.id,
            input: {
              provider: aiConfig.provider,
              apiKey: aiConfig.apiKey,
              baseUrl: aiConfig.baseUrl,
              model: aiConfig.model,
              context: selected.context,
              instruction,
              cvId: selected.cvId,
              analysisId: selected.analysisId,
            },
          }));
      if (result) {
        setSelectedQuestionId(result.id);
        replaceQuestion(result.id);
      }
    } catch (err: unknown) {
      setMutationError(err);
    }
  };

  const handlePasteAnswer = (answer: string) => {
    if (!selected) return;
    updateQuestion({ answer });
  };

  if (
    shouldShowInterviewQuestionsShellLoader({
      isDetailPending,
      isListPending,
      pathname,
      questionCount: questions.length,
      questionId: selectedQuestionId,
    })
  ) {
    return <InterviewQuestionsSkeleton />;
  }

  return (
    <FeatureScreenShell
      title={t("title")}
      mobileBackActive={Boolean(questionId)}
      onMobileBack={clearQuestion}
    >
      <FeatureTwoPaneLayout
        mobileDetailActive={questionId ? true : false}
        sidebar={
          <InterviewQuestionsSidebar
            questions={questions}
            selectedId={selectedQuestionId}
            filters={filters}
            cvs={cvs}
            analyses={analyses}
            onSelect={(id) => {
              setSelectedQuestionId(id);
              selectQuestion(id);
            }}
            onFiltersChange={setFilters}
          />
        }
      >
        {error && (
          <AlertBanner tone={ALERT_BANNER_TONES.DANGER} className="mb-4">
            {error}
          </AlertBanner>
        )}

        {shouldShowInterviewQuestionsDetailLoader({
          isDetailPending,
          isListPending,
          pathname,
          questionCount: questions.length,
          questionId: selectedQuestionId,
        }) ? (
          <div className="min-h-[300px]">
            <InterviewQuestionsDetailSkeleton />
          </div>
        ) : selected ? (
          <InterviewQuestionDetail
            question={selected as InterviewQuestion}
            cvs={cvs}
            analyses={analyses}
            provider={provider}
            onProviderChange={setProvider}
            model={model}
            isSaving={isSaving}
            aiLoading={aiLoading}
            hasAIApiKey={hasAIApiKey}
            onModelChange={setModel}
            onUpdate={updateQuestion}
            onDelete={deleteQuestion}
            onRunAI={runAI}
            onOpenSettings={onOpenSettings}
            onOpenAnalysis={onOpenAnalysis}
            onOpenCopyPaste={() => setIsCopyPasteOpen(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600 min-h-[300px]">
            {t("selectQuestion")}
          </div>
        )}
      </FeatureTwoPaneLayout>

      {isCopyPasteOpen && selected && (
        <InterviewQuestionCopyPastePanel
          questionId={selected.id}
          hasAnswer={!!selected.answer}
          onPasteAnswer={handlePasteAnswer}
          onClose={() => setIsCopyPasteOpen(false)}
        />
      )}
    </FeatureScreenShell>
  );
}
