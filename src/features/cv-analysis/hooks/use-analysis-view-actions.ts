"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import type { OfferStatus } from "@/lib/analysis-types";
import {
  createInterviewQuestion,
  generateInterviewQuestionAnswer,
  updateJobMatchAnalysis,
} from "../api/cv-analysis-api";

interface UseAnalysisViewActionsParams {
  analysis: {
    id: string;
    cv_id: string | null;
    offer_status: OfferStatus | null;
    offer_notes: string | null;
    offer_next_action: string | null;
    offer_next_action_at: string | null;
  };
  aiProvider: "gemini" | "mock";
  aiApiKey: string;
  hasAIApiKey: boolean;
  onInterviewQuestionCreated?: () => void;
  onOpenQuestions?: () => void;
  onUpdate?: () => void;
  messages: {
    missingApiKeyForAnswer: string;
    missingContextForAnswer: string;
    createQuestionFailed: string;
    generateAnswerFailed: string;
    createLinkedQuestionFailed: string;
    saveTrackingFailed: string;
    saveUrlFailed: string;
  };
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function useAnalysisViewActions({
  analysis,
  aiProvider,
  aiApiKey,
  hasAIApiKey,
  onInterviewQuestionCreated,
  onOpenQuestions,
  onUpdate,
  messages,
}: UseAnalysisViewActionsParams) {
  const router = useRouter();
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [offerStatus, setOfferStatus] = useState<OfferStatus>(
    analysis.offer_status ?? "interesting",
  );
  const [offerNotes, setOfferNotes] = useState(analysis.offer_notes ?? "");
  const [offerNextAction, setOfferNextAction] = useState(
    analysis.offer_next_action ?? "",
  );
  const [offerNextActionAt, setOfferNextActionAt] = useState(
    toDateTimeLocalValue(analysis.offer_next_action_at),
  );
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [quickQuestion, setQuickQuestion] = useState("");
  const [quickQuestionContext, setQuickQuestionContext] = useState("");
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [quickQuestionModel, setQuickQuestionModel] = useState<string>(
    DEFAULT_GEMINI_MODEL,
  );

  const handleSaveUrl = async (url: string) => {
    setIsSavingUrl(true);
    try {
      await updateJobMatchAnalysis(analysis.id, { job_url: url || null });
      onUpdate?.();
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(messages.saveUrlFailed);
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleSaveTracking = async () => {
    setIsSavingTracking(true);
    try {
      await updateJobMatchAnalysis(analysis.id, {
        offer_status: offerStatus,
        offer_notes: offerNotes,
        offer_next_action: offerNextAction,
        offer_next_action_at: offerNextActionAt || null,
      });
      onUpdate?.();
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(messages.saveTrackingFailed);
    } finally {
      setIsSavingTracking(false);
    }
  };

  const handleCreateInterviewQuestion = async (generateAfter = false) => {
    if (!quickQuestion.trim()) return;
    if (generateAfter && !hasAIApiKey) {
      alert(messages.missingApiKeyForAnswer);
      return;
    }
    if (generateAfter && !quickQuestionContext.trim()) {
      alert(messages.missingContextForAnswer);
      return;
    }
    setIsCreatingQuestion(true);
    try {
      const created = await createInterviewQuestion({
        question: quickQuestion.trim(),
        context: quickQuestionContext.trim() || null,
        cv_id: analysis.cv_id ?? null,
        analysis_id: analysis.id,
      });
      if (generateAfter) {
        await generateInterviewQuestionAnswer(created.id, {
          provider: aiProvider,
          apiKey: aiApiKey,
          model: quickQuestionModel,
          context: quickQuestionContext,
          cv_id: analysis.cv_id,
          analysis_id: analysis.id,
        });
      }
      setQuickQuestion("");
      setQuickQuestionContext("");
      onInterviewQuestionCreated?.();
      onOpenQuestions?.();
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : messages.createLinkedQuestionFailed,
      );
    } finally {
      setIsCreatingQuestion(false);
    }
  };

  return {
    isSavingUrl,
    offerStatus,
    setOfferStatus,
    offerNotes,
    setOfferNotes,
    offerNextAction,
    setOfferNextAction,
    offerNextActionAt,
    setOfferNextActionAt,
    isSavingTracking,
    quickQuestion,
    setQuickQuestion,
    quickQuestionContext,
    setQuickQuestionContext,
    quickQuestionModel,
    setQuickQuestionModel,
    isCreatingQuestion,
    handleSaveUrl,
    handleSaveTracking,
    handleCreateInterviewQuestion,
  };
}
