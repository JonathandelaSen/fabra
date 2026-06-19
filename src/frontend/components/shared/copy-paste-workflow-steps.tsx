"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/frontend/utils/utils";

type Step = "copy" | "paste" | "review";

interface CopyPasteWorkflowStepsProps {
  step: Step;
  onStepChange?: (step: Step) => void;
  canReview?: boolean;
  disabled?: boolean;
}

export default function CopyPasteWorkflowSteps({
  step,
  onStepChange,
  canReview = false,
  disabled = false,
}: CopyPasteWorkflowStepsProps) {
  const t = useTranslations("analysisFlow.copyPaste");

  const steps: { id: Step; label: string; clickable: boolean }[] = [
    { id: "copy", label: t("stepCopy"), clickable: !disabled },
    { id: "paste", label: t("stepPaste"), clickable: !disabled },
    { id: "review", label: t("stepReview"), clickable: !disabled && canReview },
  ];

  return (
    <nav className="flex items-center gap-2 border-b border-line-default px-5 py-3 text-xs text-text-muted" aria-label={t("workflowProgress")}>
      {steps.map((item, index) => {
        const isActive = step === item.id;
        const isClickable = item.clickable && !isActive;

        return (
          <div key={item.id} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="select-none">/</span>}
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepChange?.(item.id)}
              className={cn(
                "transition-colors outline-none focus-visible:ring-1 focus-visible:ring-action/50 rounded px-1",
                isActive && "text-action-text font-medium",
                isClickable && "text-text-muted hover:text-text-soft hover:underline cursor-pointer",
                !isClickable && !isActive && "text-text-muted/40 cursor-not-allowed"
              )}
            >
              {item.label}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
