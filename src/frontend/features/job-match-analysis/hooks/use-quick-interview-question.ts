"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/utils/ai-models";
import {
  createLinkedInterviewQuestion,
  generateLinkedInterviewQuestionAnswer,
  type CreateLinkedInterviewQuestionInput,
  type GenerateLinkedInterviewQuestionAnswerInput,
} from "../api/job-match-analysis-api";
import { getAIRequestConfigForProvider } from "@/lib/browser-preferences";

interface UseQuickInterviewQuestionParams {
  analysisId: string;
  cvId: string | null;
  aiProvider: GenerateLinkedInterviewQuestionAnswerInput["provider"];
  aiApiKey: string;
  hasAIApiKey: boolean;
  onCreated?: () => void;
}

export function useQuickInterviewQuestion({
  analysisId,
  cvId,
  aiProvider,
  aiApiKey,
  hasAIApiKey,
  onCreated,
}: UseQuickInterviewQuestionParams) {
  const t = useTranslations("analysisDetail");
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [model, setModel] = useState<string>(DEFAULT_GEMINI_MODEL);

  const createQuestion = useMutation({
    mutationFn: (input: CreateLinkedInterviewQuestionInput) =>
      createLinkedInterviewQuestion(input),
  });

  const generateAnswer = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: GenerateLinkedInterviewQuestionAnswerInput;
    }) => generateLinkedInterviewQuestionAnswer({ id, input }),
  });

  const create = async (generateAfter = false) => {
    const trimmedQuestion = question.trim();
    const trimmedContext = context.trim();
    if (!trimmedQuestion) return;
    const aiConfig = getAIRequestConfigForProvider(aiProvider, aiApiKey, model);
    if (generateAfter && aiConfig.error) {
      alert(aiConfig.error);
      return;
    }
    if (generateAfter && !trimmedContext) {
      alert(t("alerts.missingContextForAnswer"));
      return;
    }

    try {
      const created = await createQuestion.mutateAsync({
        question: trimmedQuestion,
        context: trimmedContext || null,
        cvId,
        analysisId,
      });

      if (generateAfter) {
        await generateAnswer.mutateAsync({
          id: created.id,
          input: {
            provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            baseUrl: aiConfig.baseUrl,
            model: aiConfig.model,
            context: trimmedContext,
            cvId,
            analysisId,
          },
        });
      }

      setQuestion("");
      setContext("");
      onCreated?.();
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : t("alerts.createLinkedQuestionFailed")
      );
    }
  };

  return {
    question,
    setQuestion,
    context,
    setContext,
    model,
    setModel,
    isCreating: createQuestion.isPending || generateAnswer.isPending,
    create,
  };
}
