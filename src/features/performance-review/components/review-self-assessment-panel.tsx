"use client";

import { useState } from "react";
import { Pencil, Save, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import { LabelBadge } from "@/components/shared/label-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import type { EvidenceItem, PerformanceReviewItem } from "../api/performance-review-api";

interface ReviewSelfAssessmentPanelProps {
  review: PerformanceReviewItem;
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
  onSaveManual: (content: string) => Promise<unknown>;
  onGoToEvidence: () => void;
}

export function ReviewSelfAssessmentPanel(props: ReviewSelfAssessmentPanelProps) {
  const t = useTranslations("performanceReview.selfAssessment");
  const tSources = useTranslations("performanceReview.sources");
  const [content, setContent] = useState(props.review.selfAssessmentContent ?? "");
  const [isEditing, setIsEditing] = useState(!props.review.selfAssessmentContent);
  const hasEvidence = props.evidence.length > 0;
  const orderedEvidence = [...props.evidence].sort(
    (a, b) => Number(b.highlighted) - Number(a.highlighted),
  );

  const save = async () => {
    await props.onSaveManual(content);
    setIsEditing(false);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-text-muted">{t("description")}</p>
          {props.generationError && (
            <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>
              {props.generationError}
            </AlertBanner>
          )}
          {isEditing ? (
            <>
              <Textarea
                rows={18}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={t("editorPlaceholder")}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <AIActionLauncher
                    actionLabel={t("generate")}
                    loading={props.isGenerating}
                    disabled={!hasEvidence}
                    integrated={{
                      available: props.hasAIApiKey,
                      selectedProvider: props.provider,
                      onProviderChange: props.onProviderChange,
                      selectedModelId: props.model,
                      onModelChange: props.onModelChange,
                      onRun: props.onRunIntegrated,
                      onConfigure: props.onOpenSettings,
                    }}
                    copyPaste={{
                      available: true,
                      onOpenFlow: props.onOpenCopyPaste,
                    }}
                  />
                  {!hasEvidence && (
                    <p className="text-xs text-text-muted">{t("noEvidenceHint")}</p>
                  )}
                </div>
                <Button
                  disabled={props.isSaving || !content.trim()}
                  onClick={save}
                >
                  <Save /> {t("save")}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="min-h-64 whitespace-pre-wrap rounded-xl border border-line bg-panel-subtle p-5 text-sm leading-7 text-text-main">
                {props.review.selfAssessmentContent}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Pencil /> {t("edit")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{t("evidenceSummaryTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-muted">
            {t("evidenceSummaryDescription")}
          </p>
          {!hasEvidence && (
            <div className="rounded-lg border border-dashed border-line p-4">
              <p className="text-sm text-text-main">{t("noEvidenceTitle")}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={props.onGoToEvidence}
              >
                {t("goToEvidence")}
              </Button>
            </div>
          )}
          {orderedEvidence.map((item) => (
            <div
              key={item.id}
              className={
                item.highlighted
                  ? "rounded-lg border border-amber-400/35 bg-amber-400/[0.06] p-3"
                  : "rounded-lg border border-line p-3"
              }
            >
              <div className="mb-1.5 flex items-center gap-2">
                <LabelBadge>{tSources(item.source)}</LabelBadge>
                {item.highlighted && (
                  <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                )}
              </div>
              <p className="line-clamp-3 text-sm text-text-main">{item.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
