"use client";

import { useTranslations } from "next-intl";

export type ReviewStep = "evidence" | "selfAssessment";

interface ReviewStepNavProps {
  step: ReviewStep;
  evidenceCount: number;
  hasSelfAssessment: boolean;
  onStepChange: (step: ReviewStep) => void;
}

export function ReviewStepNav({
  step,
  evidenceCount,
  hasSelfAssessment,
  onStepChange,
}: ReviewStepNavProps) {
  const t = useTranslations("performanceReview.steps");

  const steps: Array<{ key: ReviewStep; label: string; done: boolean }> = [
    { key: "evidence", label: t("evidence"), done: evidenceCount > 0 },
    {
      key: "selfAssessment",
      label: t("selfAssessment"),
      done: hasSelfAssessment,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((item, index) => {
        const active = step === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onStepChange(item.key)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
              active
                ? "border-action-border bg-action-soft text-action-text"
                : "border-line bg-card text-text-muted hover:bg-panel-hover"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                item.done
                  ? "bg-success/20 text-success-text"
                  : active
                    ? "bg-action-soft text-action-text"
                    : "bg-panel-subtle text-text-muted"
              }`}
            >
              {index + 1}
            </span>
            <span className="font-medium">{item.label}</span>
            {item.key === "evidence" && (
              <span className="rounded-full bg-panel-subtle px-2 py-0.5 text-xs">
                {evidenceCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
