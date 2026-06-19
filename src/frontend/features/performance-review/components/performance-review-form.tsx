"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ActivityContextSelector } from "@/frontend/features/activity-context";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Select } from "@/frontend/components/ui/select";
import type {
  ActivityContext,
  PerformanceReviewItem,
  SaveReviewInput,
} from "../api/performance-review-api";

interface PerformanceReviewFormProps {
  review: PerformanceReviewItem | null;
  contexts: ActivityContext[];
  isSaving: boolean;
  onCancel: () => void;
  onManageContexts: () => void;
  onSave: (input: SaveReviewInput) => Promise<unknown>;
}

function formFor(
  review: PerformanceReviewItem | null,
  contexts: ActivityContext[],
): SaveReviewInput {
  if (review) {
    return {
      title: review.title,
      reviewType: review.reviewType,
      reviewDate: review.reviewDate,
      periodStart: review.periodStart,
      periodEnd: review.periodEnd,
      activityContextId: review.activityContextId,
    };
  }
  const today = new Date().toISOString().slice(0, 10);
  const defaultContextId =
    contexts.find((context) => context.isDefault)?.id ?? contexts[0]?.id ?? null;
  return {
    title: "",
    reviewType: "performance_review",
    reviewDate: today,
    periodStart: `${today.slice(0, 4)}-01-01`,
    periodEnd: today,
    activityContextId: defaultContextId,
  };
}

export function PerformanceReviewForm(props: PerformanceReviewFormProps) {
  const t = useTranslations("performanceReview");
  const [form, setForm] = useState(() => formFor(props.review, props.contexts));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.review ? t("edit.title") : t("create.title")}</CardTitle>
      </CardHeader>
      <CardContent className="max-w-2xl space-y-4">
        <div className="space-y-2">
          <Label htmlFor="review-title">{t("fields.title")}</Label>
          <Input
            id="review-title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder={t("fields.titlePlaceholder")}
          />
        </div>
        <ActivityContextSelector
          id="review-context"
          label={t("fields.context")}
          manageLabel={t("fields.manageContexts")}
          value={form.activityContextId ?? ""}
          onChange={(value) => setForm({ ...form, activityContextId: value || null })}
          contexts={props.contexts}
          onManageClick={props.onManageContexts}
        />
        <div className="space-y-2">
          <Label>{t("fields.type")}</Label>
          <Select
            value={form.reviewType}
            onChange={(event) => setForm({ ...form, reviewType: event.target.value })}
          >
            <option value="performance_review">{t("types.performance_review")}</option>
            <option value="promotion_case">{t("types.promotion_case")}</option>
          </Select>
        </div>
        {(["reviewDate", "periodStart", "periodEnd"] as const).map((field) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{t(`fields.${field}`)}</Label>
            <Input
              id={field}
              type="date"
              value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
            />
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            disabled={props.isSaving || !form.title.trim()}
            onClick={() => props.onSave(form)}
          >
            {props.review ? t("actions.save") : t("actions.create")}
          </Button>
          <Button variant="ghost" onClick={props.onCancel}>
            {t("actions.cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
