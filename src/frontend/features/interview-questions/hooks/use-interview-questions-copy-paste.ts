"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  prepareInterviewQuestionCopyPaste,
  type PrepareInterviewQuestionCopyPasteResponse,
  type PrepareInterviewQuestionCopyPasteMode,
} from "../api/interview-questions-api";

export function useInterviewQuestionsCopyPaste(questionId: string) {
  const t = useTranslations("interviewQuestions.copyPaste");
  const [mode, setMode] = useState<PrepareInterviewQuestionCopyPasteMode>("generate");
  const [instruction, setInstruction] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [prepared, setPrepared] =
    useState<PrepareInterviewQuestionCopyPasteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePrepare = async () => {
    setPreparing(true);
    setError(null);
    try {
      const result = await prepareInterviewQuestionCopyPaste({
        id: questionId,
        input: {
          mode,
          instruction: mode === "edit" ? instruction : undefined,
        },
      });
      setPrepared(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("prepareError"));
    } finally {
      setPreparing(false);
    }
  };

  const handleReset = () => {
    setPrepared(null);
    setError(null);
    setInstruction("");
  };

  return {
    mode,
    setMode,
    instruction,
    setInstruction,
    preparing,
    prepared,
    error,
    handlePrepare,
    handleReset,
  };
}
