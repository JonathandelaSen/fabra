"use client";

import type { RefObject } from "react";
import { CheckCircle2, Copy, Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/frontend/components/shared/action-buttons";
import { Textarea } from "@/frontend/components/ui/textarea";
import AIActionLauncher from "@/frontend/components/shared/ai-action-launcher";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";
import type { InterviewQuestion, UpdateInterviewQuestionInput } from "../api/interview-questions-api";
import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";
import type { InterviewQuestionAIMode } from "./interview-questions-types";

interface InterviewQuestionAnswerPanelProps {
  question: InterviewQuestion;
  isEditing: boolean;
  copied: boolean;
  isSaving: boolean;
  aiLoading: InterviewQuestionAIMode | null;
  hasAIApiKey: boolean;
  provider: StoredAIProvider;
  model: string;
  answerRef: RefObject<HTMLTextAreaElement | null>;
  shouldSkipBlurSave: () => boolean;
  onUpdate: (updates: Partial<UpdateInterviewQuestionInput>) => void;
  onProviderChange: (provider: StoredAIProvider) => void;
  onModelChange: (model: string) => void;
  onRunAI: (mode: InterviewQuestionAIMode, instruction: string) => void;
  onOpenSettings: () => void;
  onOpenCopyPaste: () => void;
  onMarkSaveIntent: () => void;
  onSaveManualDetail: () => void;
  onCopy: () => void;
}

export default function InterviewQuestionAnswerPanel({
  question,
  isEditing,
  copied,
  isSaving,
  aiLoading,
  hasAIApiKey,
  provider,
  model,
  answerRef,
  shouldSkipBlurSave,
  onUpdate,
  onProviderChange,
  onModelChange,
  onRunAI,
  onOpenSettings,
  onOpenCopyPaste,
  onMarkSaveIntent,
  onSaveManualDetail,
  onCopy,
}: InterviewQuestionAnswerPanelProps) {
  const t = useTranslations("interviewQuestions");

  return (
    <BasicPanel className="p-5 flex flex-col gap-4 animate-fade-in">
      <h3 className="text-sm font-semibold tracking-tight text-text-soft flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-success-text" />
        {t("answer")}
      </h3>
      {isEditing ? (
        <>
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="answer-textarea" className="text-xs font-medium text-text-muted">
              {t("answer")}
            </label>
            <Textarea
              id="answer-textarea"
              ref={answerRef}
              defaultValue={question.answer ?? ""}
              key={`answer-${question.id}-${question.updatedAt}`}
              onBlur={(event) =>
                !shouldSkipBlurSave() &&
                event.target.value !== (question.answer ?? "") &&
                onUpdate({ answer: event.target.value || null })
              }
              className="min-h-64 flex-1 bg-panel/[0.01] border-line focus-visible:ring-action-border leading-relaxed"
              placeholder={t("manualAnswer")}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
            <div className="flex flex-wrap items-center gap-3">
              <AIActionLauncher
                actionLabel={t("generateWithAI")}
                loading={aiLoading !== null}
                integrated={{
                  available: hasAIApiKey,
                  selectedProvider: provider,
                  onProviderChange,
                  selectedModelId: model,
                  onModelChange,
                  onRun: () => onRunAI("generate", ""),
                  onConfigure: onOpenSettings,
                }}
                copyPaste={{
                  available: true,
                  onOpenFlow: onOpenCopyPaste,
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              {isSaving && (
                <p className="inline-flex items-center gap-2 text-xs text-text-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("saving")}
                </p>
              )}
              <IconTextButton
                icon={Save}
                loading={isSaving}
                tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
                onMouseDown={onMarkSaveIntent}
                onClick={onSaveManualDetail}
                disabled={isSaving}
              >
                {t("saveManualChanges")}
              </IconTextButton>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-text-muted">
              {t("answer")}
            </span>
            {question.answer ? (
              <div className="rounded-lg border border-line bg-panel/[0.01] p-4 text-sm leading-relaxed text-text-soft min-h-[16rem] whitespace-pre-wrap">
                {question.answer}
              </div>
            ) : (
              <div className="flex flex-col rounded-lg border border-dashed border-line bg-panel/[0.005] p-4 text-sm italic text-text-muted min-h-[16rem] items-center justify-center text-center">
                {t("noAnswerGenerated")}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-line">
            {question.answer && (
              <IconTextButton
                icon={copied ? CheckCircle2 : Copy}
                tone={copied ? ICON_TEXT_BUTTON_TONES.SUCCESS : ICON_TEXT_BUTTON_TONES.DEFAULT}
                onClick={onCopy}
              >
                {copied ? t("copied") : t("copyAnswer")}
              </IconTextButton>
            )}
          </div>
        </>
      )}
    </BasicPanel>
  );
}
