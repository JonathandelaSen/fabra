"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { ClipboardCheck, Plus } from "lucide-react";
import { FeatureEmptyState } from "@/components/shared/feature-empty-state";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";
import { useIsDesktopLayout } from "@/components/shared/use-is-desktop-layout";
import { DeleteButton, EditButton } from "@/components/shared/action-buttons";
import {
  getAIRequestConfigForProvider,
  type StoredAIProvider,
} from "@/lib/browser-preferences";
import { usePerformanceReviewActions } from "../hooks/use-performance-review-actions";
import { usePerformanceReviewRouteState } from "../hooks/use-performance-review-route-state";
import {
  useEvidenceCandidates,
  useEvidenceItems,
  useReviewActivityContexts,
  useReviewDetail,
  useReviewsList,
} from "../hooks/use-performance-review-queries";
import { PerformanceReviewDetail } from "./performance-review-detail";
import { PerformanceReviewForm } from "./performance-review-form";
import { PerformanceReviewList } from "./performance-review-list";
import { PerformanceReviewDetailSkeleton } from "./performance-review-skeleton";
import { ReviewCopyPasteModal } from "./review-copy-paste-modal";

interface PerformanceReviewViewProps {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
}

export function PerformanceReviewView({
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
}: PerformanceReviewViewProps) {
  const t = useTranslations("performanceReview");
  const router = useRouter();
  const route = usePerformanceReviewRouteState();
  const { pathname, reviewId, selectReview } = route;
  const list = useReviewsList();
  const detail = useReviewDetail(reviewId);
  const evidence = useEvidenceItems(reviewId);
  const candidates = useEvidenceCandidates(reviewId);
  const contextsQuery = useReviewActivityContexts();
  const actions = usePerformanceReviewActions(reviewId);
  const isDesktopLayout = useIsDesktopLayout();

  const [provider, setProvider] = useState<StoredAIProvider>(aiProvider);
  const [model, setModel] = useState<string>(aiModel);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isCopyPasteOpen, setIsCopyPasteOpen] = useState(false);
  const pendingAutoSelectionRef = useRef<string | null>(null);

  const contexts = contextsQuery.data?.contexts ?? [];
  const reviews = useMemo(() => list.data ?? [], [list.data]);
  const isAutoSelectionPending =
    isDesktopLayout &&
    pathname === "/reviews" &&
    !reviewId &&
    reviews.length > 0;
  const contextName = detail.data?.activityContextId
    ? contexts.find((context) => context.id === detail.data.activityContextId)
        ?.name ?? null
    : null;

  const runIntegrated = async () => {
    setGenerationError(null);
    const config = getAIRequestConfigForProvider(provider, aiApiKey, model);
    if (config.error) {
      setGenerationError(config.error);
      return;
    }
    try {
      await actions.generateIntegrated({
        provider: config.provider,
        apiKey: config.apiKey || undefined,
        model: config.model,
      });
    } catch (error: unknown) {
      setGenerationError(
        error instanceof Error ? error.message : t("selfAssessment.generateError"),
      );
    }
  };

  useEffect(() => {
    if (pathname !== "/reviews") {
      pendingAutoSelectionRef.current = null;
      return;
    }

    const firstReviewId = reviews[0]?.id;
    if (
      isDesktopLayout &&
      !list.isPending &&
      firstReviewId &&
      pendingAutoSelectionRef.current !== firstReviewId
    ) {
      pendingAutoSelectionRef.current = firstReviewId;
      selectReview(firstReviewId);
    }
  }, [isDesktopLayout, list.isPending, pathname, reviews, selectReview]);

  return (
    <FeatureScreenShell
      title={t("title")}
      mobileBackActive={route.isCreating || route.isEditing || Boolean(reviewId)}
      onMobileBack={route.goToList}
      actions={
        <>
          <FeatureHeaderActionButton
            label={t("actions.create")}
            onClick={route.startCreate}
          />
          {reviewId && detail.data && (
            <>
              <EditButton
                aria-label={t("actions.edit")}
                onClick={() => route.editReview(reviewId)}
              />
              <DeleteButton
                aria-label={t("actions.delete")}
                onClick={async () => {
                  await actions.deleteReview(reviewId);
                  route.goToList();
                }}
              />
            </>
          )}
        </>
      }
    >
      <FeatureTwoPaneLayout
        mobileDetailActive={route.isCreating || route.isEditing || Boolean(reviewId)}
        sidebar={
          <PerformanceReviewList
            reviews={reviews}
            contexts={contexts}
            isLoading={list.isPending}
            selectedId={reviewId}
            onSelect={route.selectReview}
          />
        }
      >
        {list.isPending || isAutoSelectionPending ? (
          <PerformanceReviewDetailSkeleton />
        ) : route.isCreating ? (
          <PerformanceReviewForm
            key={`new-${contexts.map((context) => context.id).join("-")}`}
            review={null}
            contexts={contexts}
            isSaving={actions.isSaving}
            onCancel={route.goToList}
            onManageContexts={() =>
              router.push(
                `/activity-contexts?source=reviews&returnTo=${encodeURIComponent("/reviews/new")}`,
              )
            }
            onSave={async (input) => {
              const review = await actions.createReview(input);
              route.selectReview(review.id);
            }}
          />
        ) : route.isEditing && detail.isPending ? (
          <PerformanceReviewDetailSkeleton />
        ) : route.isEditing && detail.data ? (
          <PerformanceReviewForm
            key={`${detail.data.id}-${detail.data.updatedAt}`}
            review={detail.data}
            contexts={contexts}
            isSaving={actions.isSaving}
            onCancel={() => route.selectReview(detail.data.id)}
            onManageContexts={() =>
              router.push(
                `/activity-contexts?source=reviews&returnTo=${encodeURIComponent(`/reviews/${detail.data.id}/edit`)}`,
              )
            }
            onSave={async (input) => {
              await actions.updateReview(input);
              route.selectReview(detail.data.id);
            }}
          />
        ) : reviewId && detail.isPending ? (
          <PerformanceReviewDetailSkeleton />
        ) : reviewId && detail.data ? (
          <PerformanceReviewDetail
            key={detail.data.id}
            review={detail.data}
            contextName={contextName}
            candidates={candidates.data ?? []}
            evidence={evidence.data ?? []}
            isSaving={actions.isSaving}
            isGenerating={actions.isGenerating}
            generationError={generationError}
            provider={provider}
            model={model}
            hasAIApiKey={hasAIApiKey}
            onProviderChange={setProvider}
            onModelChange={setModel}
            onRunIntegrated={runIntegrated}
            onOpenCopyPaste={() => setIsCopyPasteOpen(true)}
            onOpenSettings={onOpenSettings}
            onAddCandidate={actions.addCandidate}
            onAddCustomEvidence={actions.addCustomEvidence}
            onToggleHighlight={actions.toggleHighlight}
            onRemoveEvidence={actions.removeEvidence}
            onReorder={actions.reorderEvidence}
            onSaveManual={actions.saveManual}
          />
        ) : (
          <FeatureEmptyState
            icon={ClipboardCheck}
            title={t("empty.title")}
            description={t("empty.description")}
            action={
              <IconTextButton
                icon={Plus}
                tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
                onClick={route.startCreate}
              >
                {t("actions.create")}
              </IconTextButton>
            }
          />
        )}
      </FeatureTwoPaneLayout>
      {isCopyPasteOpen && (
        <ReviewCopyPasteModal
          open
          onClose={() => setIsCopyPasteOpen(false)}
          onPrepare={actions.prepareCopyPaste}
          onApply={actions.applyCopyPaste}
        />
      )}
    </FeatureScreenShell>
  );
}
