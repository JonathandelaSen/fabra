"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquareQuote,
  ExternalLink,
  Loader2,
  Check,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { InterviewQuestionSummary } from "../../../types";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import AIActionLauncher from "@/frontend/components/shared/ai-action-launcher";

interface TabInterviewProps {
  interviewQuestions: InterviewQuestionSummary[];
  onOpenQuestions?: () => void;
  quickQuestion: string;
  onQuickQuestionChange: (value: string) => void;
  quickQuestionContext: string;
  onQuickQuestionContextChange: (value: string) => void;
  quickQuestionModel: string;
  onQuickQuestionModelChange: (value: string) => void;
  isCreatingQuestion: boolean;
  onCreateQuestion: (generateAfter: boolean) => void;
  aiProvider: StoredAIProvider;
  hasAIApiKey: boolean;
  onOpenSettings?: () => void;
}

export default function TabInterview({
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
  aiProvider,
  hasAIApiKey,
  onOpenSettings,
}: TabInterviewProps) {
  const [selectedProvider, setSelectedProvider] = useState<StoredAIProvider>(aiProvider);
  const t = useTranslations("analysisDetail.interview");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      <section className="rounded-2xl border border-action-border bg-action/[0.025] p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-action-border bg-action/10 text-action-text">
              <MessageSquareQuote className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-action-text">
                {t("title")}
              </h4>
              <p className="text-xs text-text-muted">
                {t("linkedCount", { count: interviewQuestions.length })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenQuestions}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-action-border bg-action/10 px-3 text-xs font-semibold text-action-text transition-colors hover:bg-action/20"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("openManager")}
          </button>
        </div>

        {interviewQuestions.length > 0 ? (
          <div className="mb-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {interviewQuestions.map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={onOpenQuestions}
                className="group rounded-xl border border-line bg-panel-elevated p-3 text-left transition-colors hover:border-action-border hover:bg-action/10"
              >
                <span className="block text-sm font-semibold leading-5 text-text-main">
                  {question.question}
                </span>
                {question.answer ? (
                  <span className="mt-2 line-clamp-3 block text-xs leading-5 text-text-muted group-hover:text-text-muted">
                    {question.answer}
                  </span>
                ) : (
                  <span className="mt-2 inline-flex rounded-md border border-warning-border bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning-text">
                    {t("pendingAnswer")}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="mb-5 rounded-xl border border-line bg-panel-subtle px-4 py-4 text-sm text-text-faint">
            {t("empty")}
          </p>
        )}

        <div className="rounded-xl border border-line bg-panel-elevated p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-faint">
            {t("createTitle")}
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            <textarea
              value={quickQuestion}
              onChange={(event) => onQuickQuestionChange(event.target.value)}
              placeholder={t("questionPlaceholder")}
              rows={2}
              className="resize-none rounded-lg border border-line bg-field px-3 py-2 text-sm text-text-main placeholder:text-text-faint focus:border-action-border focus:outline-none focus:ring-1 focus:ring-action-border"
            />
            <textarea
              value={quickQuestionContext}
              onChange={(event) =>
                onQuickQuestionContextChange(event.target.value)
              }
              placeholder={t("contextPlaceholder")}
              rows={2}
              className="resize-none rounded-lg border border-line bg-field px-3 py-2 text-sm text-text-main placeholder:text-text-faint focus:border-action-border focus:outline-none focus:ring-1 focus:ring-action-border"
            />
            <div className="flex flex-wrap items-center gap-2 lg:col-span-2">
              <button
                type="button"
                onClick={() => onCreateQuestion(false)}
                disabled={isCreatingQuestion || !quickQuestion.trim()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-light-button px-4 text-xs font-semibold text-light-button-text transition-colors hover:bg-light-button-hover hover:text-light-button-text disabled:opacity-50"
              >
                {isCreatingQuestion ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {t("saveWithoutAI")}
              </button>
              <AIActionLauncher
                actionLabel={t("createWithAI")}
                loading={isCreatingQuestion}
                disabled={!quickQuestion.trim()}
                integrated={{
                  available: hasAIApiKey,
                  selectedProvider,
                  onProviderChange: setSelectedProvider,
                  selectedModelId: quickQuestionModel,
                  onModelChange: onQuickQuestionModelChange,
                  onRun: () => onCreateQuestion(true),
                  onConfigure: onOpenSettings,
                }}
                copyPaste={{
                  available: false,
                  onOpenFlow: () => {},
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
