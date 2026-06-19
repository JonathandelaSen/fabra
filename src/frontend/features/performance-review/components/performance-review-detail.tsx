"use client";

import { useState } from "react";
import { Briefcase, CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { LabelBadge } from "@/frontend/components/shared/label-badge";
import { IconLabelBadge } from "@/frontend/components/shared/icon-label-badge";
import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";
import type {
  EvidenceCandidate,
  EvidenceItem,
  PerformanceReviewItem,
} from "../api/performance-review-api";
import { ReviewEvidencePanel } from "./review-evidence-panel";
import { ReviewSelfAssessmentPanel } from "./review-self-assessment-panel";
import { ReviewStepNav, type ReviewStep } from "./review-step-nav";

interface PerformanceReviewDetailProps {
  review: PerformanceReviewItem;
  contextName: string | null;
  candidates: EvidenceCandidate[];
  evidence: EvidenceItem[];
  isSaving: boolean;
  isGenerating: boolean;
  generationError: string | null;
  provider: StoredAIProvider;
  model: string;
  hasAIApiKey: boolean;
  onProviderChange: (provider: StoredAIProvider) => void;
  onModelChange: (model: string) => void;
  onRunIntegrated: () => void;
  onOpenCopyPaste: () => void;
  onOpenSettings: () => void;
  onAddCandidate: (candidate: EvidenceCandidate) => Promise<unknown>;
  onAddCustomEvidence: (content: string) => Promise<unknown>;
  onToggleHighlight: (id: string, highlighted: boolean) => Promise<unknown>;
  onRemoveEvidence: (id: string) => Promise<unknown>;
  onReorder: (ids: string[]) => Promise<unknown>;
  onSaveManual: (content: string) => Promise<unknown>;
}

export function PerformanceReviewDetail(props: PerformanceReviewDetailProps) {
  const t = useTranslations("performanceReview");
  const [step, setStep] = useState<ReviewStep>("evidence");
  const [today] = useState(() => Date.now());
  const days = Math.ceil((Date.parse(props.review.reviewDate) - today) / 86400000);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-text-main">{props.review.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <LabelBadge>{t(`types.${props.review.reviewType}`)}</LabelBadge>
            <LabelBadge>{t(`status.${props.review.status}`)}</LabelBadge>
            <IconLabelBadge
              icon={Briefcase}
              text={props.contextName ?? t("detail.noContext")}
            />
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" /> {props.review.reviewDate}
            </span>
            <span>
              {t("detail.period", {
                start: props.review.periodStart,
                end: props.review.periodEnd,
              })}
            </span>
            <span>
              {days >= 0 ? t("detail.daysRemaining", { days }) : t("detail.past")}
            </span>
          </div>
        </div>
      </div>

      <ReviewStepNav
        step={step}
        evidenceCount={props.evidence.length}
        hasSelfAssessment={Boolean(props.review.selfAssessmentContent)}
        onStepChange={setStep}
      />

      {step === "evidence" ? (
        <ReviewEvidencePanel
          contextName={props.contextName}
          candidates={props.candidates}
          evidence={props.evidence}
          isSaving={props.isSaving}
          onAddCandidate={props.onAddCandidate}
          onAddCustomEvidence={props.onAddCustomEvidence}
          onToggleHighlight={props.onToggleHighlight}
          onRemove={props.onRemoveEvidence}
          onReorder={props.onReorder}
        />
      ) : (
        <ReviewSelfAssessmentPanel
          review={props.review}
          evidence={props.evidence}
          isSaving={props.isSaving}
          isGenerating={props.isGenerating}
          generationError={props.generationError}
          provider={props.provider}
          model={props.model}
          hasAIApiKey={props.hasAIApiKey}
          onProviderChange={props.onProviderChange}
          onModelChange={props.onModelChange}
          onRunIntegrated={props.onRunIntegrated}
          onOpenCopyPaste={props.onOpenCopyPaste}
          onOpenSettings={props.onOpenSettings}
          onSaveManual={props.onSaveManual}
          onGoToEvidence={() => setStep("evidence")}
        />
      )}
    </div>
  );
}
