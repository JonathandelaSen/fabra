"use client";

import React, { useState } from "react";
import type { ListAdminAIInteractionsResponse } from "@/app/api/admin/ai-interactions/responses";
import { LabelBadge } from "@/components/shared/label-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useReviewAdminAIInteraction } from "../hooks/use-admin-ai-interactions";
import { AIInteractionContentBlock } from "./ai-interaction-content-block";
import { useTranslations } from "next-intl";
import { Check, RotateCw } from "lucide-react";
import { AI_INTERACTION_RATINGS } from "@/shared/ai-interactions/constants";

type Interaction = ListAdminAIInteractionsResponse[number];
type AIInteractionRating =
  (typeof AI_INTERACTION_RATINGS)[keyof typeof AI_INTERACTION_RATINGS];

function toAIInteractionRating(value: string | undefined): AIInteractionRating {
  return value !== undefined &&
    Object.values(AI_INTERACTION_RATINGS).includes(value as AIInteractionRating)
    ? (value as AIInteractionRating)
    : "mixed";
}

export function ComparisonColumn({ interaction }: { interaction: Interaction }) {
  const t = useTranslations("admin.aiInteractions");
  const review = useReviewAdminAIInteraction();
  const [rating, setRating] = useState<AIInteractionRating>(
    toAIInteractionRating(interaction.review?.rating)
  );
  const [note, setNote] = useState(interaction.review?.note ?? "");

  const handleSaveReview = () => {
    review.mutate({
      interactionId: interaction.interactionId,
      rating,
      note: note.trim() || null,
    });
  };

  const hasUnsavedChanges =
    rating !== toAIInteractionRating(interaction.review?.rating) ||
    note.trim() !== (interaction.review?.note ?? "");

  const handleReset = () => {
    setRating(toAIInteractionRating(interaction.review?.rating));
    setNote(interaction.review?.note ?? "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (hasUnsavedChanges && !review.isPending) {
        handleSaveReview();
      }
    }
  };

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="p-4 border-b border-border/40">
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-1">
          {interaction.module}
        </span>
        <CardTitle className="text-sm font-semibold truncate text-text-main">
          {interaction.operation}
        </CardTitle>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <LabelBadge className="text-[9px]">{interaction.provider}</LabelBadge>
          <LabelBadge className="text-[9px]">{interaction.model ?? t("noModel")}</LabelBadge>
          <LabelBadge className="text-[9px]">v{interaction.promptVersion ?? "?"}</LabelBadge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col gap-4">
        <AIInteractionContentBlock title={t("prompt")} content={interaction.prompt} emptyLabel={t("notCaptured")} />
        <AIInteractionContentBlock title={t("rawResponse")} content={interaction.rawResponse} emptyLabel={t("notCaptured")} />
        <AIInteractionContentBlock
          title={t("parsedResult")}
          content={interaction.parsedResult ? JSON.stringify(interaction.parsedResult) : null}
          emptyLabel={t("notCaptured")}
        />
        {interaction.error && (
          <AIInteractionContentBlock title={t("error")} content={interaction.error} emptyLabel={t("notCaptured")} />
        )}
        
        <div className="grid grid-cols-3 gap-2">
          {([
            {
              id: "good",
              label: t("good"),
              activeClass: "border-success-border/60 bg-success-soft/20 text-success-text shadow-sm shadow-success-border/5",
              inactiveClass: "border-border/60 text-text-soft hover:border-success-border/30 hover:bg-success-soft/5 hover:text-success-text"
            },
            {
              id: "mixed",
              label: t("mixed"),
              activeClass: "border-warning-border/60 bg-warning-soft/20 text-warning-text shadow-sm shadow-warning-border/5",
              inactiveClass: "border-border/60 text-text-soft hover:border-warning-border/30 hover:bg-warning-soft/5 hover:text-warning-text"
            },
            {
              id: "bad",
              label: t("bad"),
              activeClass: "border-danger-border/60 bg-danger-soft/20 text-danger-text shadow-sm shadow-danger-border/5",
              inactiveClass: "border-border/60 text-text-soft hover:border-danger-border/30 hover:bg-danger-soft/5 hover:text-danger-text"
            },
          ] satisfies ReadonlyArray<{ id: AIInteractionRating; label: string; activeClass: string; inactiveClass: string }>).map((btn) => {
            const isSelected = rating === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setRating(btn.id as typeof rating)}
                className={`py-1.5 text-center text-[10px] font-semibold rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  isSelected ? btn.activeClass : btn.inactiveClass
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("reviewNote")}
          className="text-xs min-h-16 resize-none rounded-lg p-2 border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
        />

        <div className="flex items-center justify-between gap-2">
          <div>
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                {t("discardChanges") || "Discard"}
              </button>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={hasUnsavedChanges && !review.isPending ? handleSaveReview : undefined}
            className={`w-auto min-w-[70px] text-xs h-8 px-3 rounded-lg transition-all duration-200 ${
              review.isPending
                ? "bg-primary/85 cursor-wait text-primary-foreground"
                : !hasUnsavedChanges
                ? "bg-success-soft/20 border border-success-border/50 text-success-text hover:bg-success-soft/20 cursor-default pointer-events-none"
                : "bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
            }`}
          >
            {review.isPending ? (
              <RotateCw className="h-3 w-3 animate-spin" />
            ) : !hasUnsavedChanges ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              t("saveReview")
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
