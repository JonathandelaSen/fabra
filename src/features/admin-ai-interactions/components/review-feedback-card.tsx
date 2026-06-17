"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useReviewAdminAIInteraction } from "../hooks/use-admin-ai-interactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserCheck, ThumbsUp, ThumbsDown, AlertTriangle, RotateCw, Check } from "lucide-react";
import type { ListAdminAIInteractionsResponse } from "@/app/api/admin/ai-interactions/responses";
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

export function ReviewFeedbackCard({ interaction }: { interaction: Interaction }) {
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
    <Card className="border-border/60 shadow-xs bg-card/60 backdrop-blur-xs">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-main">
          <UserCheck className="h-4 w-4 text-primary" />
          <span>{t("reviewFeedback")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              id: "good",
              label: t("good"),
              icon: ThumbsUp,
              activeClass: "border-success-border/60 bg-success-soft/20 text-success-text shadow-sm shadow-success-border/5",
              inactiveClass: "border-border/60 text-text-soft hover:border-success-border/30 hover:bg-success-soft/5 hover:text-success-text",
              iconClass: "text-success-text"
            },
            {
              id: "mixed",
              label: t("mixed"),
              icon: AlertTriangle,
              activeClass: "border-warning-border/60 bg-warning-soft/20 text-warning-text shadow-sm shadow-warning-border/5",
              inactiveClass: "border-border/60 text-text-soft hover:border-warning-border/30 hover:bg-warning-soft/5 hover:text-warning-text",
              iconClass: "text-warning-text"
            },
            {
              id: "bad",
              label: t("bad"),
              icon: ThumbsDown,
              activeClass: "border-danger-border/60 bg-danger-soft/20 text-danger-text shadow-sm shadow-danger-border/5",
              inactiveClass: "border-border/60 text-text-soft hover:border-danger-border/30 hover:bg-danger-soft/5 hover:text-danger-text",
              iconClass: "text-danger-text"
            },
          ].map((btn) => {
            const Icon = btn.icon;
            const isSelected = rating === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setRating(btn.id as typeof rating)}
                className={`group flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected ? btn.activeClass : btn.inactiveClass
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${
                  isSelected ? btn.iconClass : "text-text-muted group-hover:text-current"
                }`} />
                <span className="text-[11px] font-semibold">{btn.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5">
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("reviewNote")}
            className="min-h-[100px] resize-none rounded-xl text-sm border-border/80 focus-visible:ring-1 focus-visible:ring-primary p-3"
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                {t("discardChanges") || "Discard changes"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-mono hidden sm:inline">
              {t("keyboardShortcutHelp") || "⌘↵ to save"}
            </span>
            <Button
              type="button"
              onClick={hasUnsavedChanges && !review.isPending ? handleSaveReview : undefined}
              className={`h-9 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ${
                review.isPending
                  ? "bg-primary/85 cursor-wait text-primary-foreground"
                  : !hasUnsavedChanges
                  ? "bg-success-soft/20 border border-success-border/50 text-success-text hover:bg-success-soft/20 cursor-default pointer-events-none"
                  : "bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-xs active:scale-98 cursor-pointer"
              }`}
            >
              {review.isPending ? (
                <>
                  <RotateCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  {t("saving") || "Saving..."}
                </>
              ) : !hasUnsavedChanges ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  {t("saved") || "Saved"}
                </>
              ) : (
                t("saveReview")
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
