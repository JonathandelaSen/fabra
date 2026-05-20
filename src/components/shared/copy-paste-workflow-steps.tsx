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
    <div className="flex gap-2 border-b border-white/10 px-5 py-3 text-xs text-zinc-500">
      <span className={step === "copy" ? "text-indigo-300" : ""}>
        {t("stepCopy")}
      </span>
      <span>/</span>
      <span className={step === "paste" ? "text-indigo-300" : ""}>
        {t("stepPaste")}
      </span>
      <span>/</span>
      <span className={step === "review" ? "text-indigo-300" : ""}>
        {t("stepReview")}
      </span>
    </div>
  );
}
