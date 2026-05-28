"use client";

import { useTranslations } from "next-intl";

type Step = "copy" | "paste" | "review";

interface CopyPasteWorkflowStepsProps {
  step: Step;
}

export default function CopyPasteWorkflowSteps({
  step,
}: CopyPasteWorkflowStepsProps) {
  const t = useTranslations("analysisFlow.copyPaste");

  return (
    <div className="flex gap-2 border-b border-line-default px-5 py-3 text-xs text-text-muted">
      <span className={step === "copy" ? "text-action-text" : ""}>
        {t("stepCopy")}
      </span>
      <span>/</span>
      <span className={step === "paste" ? "text-action-text" : ""}>
        {t("stepPaste")}
      </span>
      <span>/</span>
      <span className={step === "review" ? "text-action-text" : ""}>
        {t("stepReview")}
      </span>
    </div>
  );
}
