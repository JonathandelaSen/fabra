"use client";

import type React from "react";
import type { ListAdminAIInteractionsResponse } from "@/app/api/admin/ai-interactions/responses";
import { LabelBadge } from "@/frontend/components/shared/label-badge";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, FileJson2, MessageSquareText } from "lucide-react";

type Interaction = ListAdminAIInteractionsResponse[number];

export function AIInteractionCard({
  interaction,
  active,
  selected,
  onClick,
  onCompareToggle,
}: {
  interaction: Interaction;
  active: boolean;
  selected: boolean;
  onClick: () => void;
  onCompareToggle: (e: React.MouseEvent) => void;
}) {
  const t = useTranslations("admin.aiInteractions");

  const statusColors = {
    applied: "bg-success-soft text-success-text border-success-border dark:bg-success-soft/20",
    failed: "bg-danger-soft text-danger-text border-danger-border dark:bg-danger-soft/20",
    validated: "bg-info-soft text-info-text border-info-border dark:bg-info-soft/20",
    prepared: "bg-warning-soft text-warning-text border-warning-border dark:bg-warning-soft/20",
  }[interaction.status] || "bg-muted text-muted-foreground";

  const durationSec = interaction.durationMs ? `${(interaction.durationMs / 1000).toFixed(2)}s` : null;
  const latestEventName = interaction.eventNames.at(-1);
  const parsedScore = typeof interaction.parsedResult === "object" &&
    interaction.parsedResult !== null &&
    "score" in interaction.parsedResult
    ? String((interaction.parsedResult as { score?: unknown }).score)
    : null;

  return (
    <Card
      onClick={onClick}
      className={`group cursor-pointer border-2 transition-all hover:bg-panel-hover hover:shadow-sm ${
        active
          ? "border-primary bg-panel-selected/60 shadow-sm ring-2 ring-primary/10"
          : "border-border/60 bg-card/70"
      }`}
    >
      <CardHeader className="p-3.5 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-1">
              {interaction.module}
            </span>
            <CardTitle className="text-sm font-semibold leading-snug text-text-main line-clamp-2">
              {interaction.operation}
            </CardTitle>
            <p className="truncate text-[10px] text-text-muted mt-1 font-mono">
              ID: {interaction.entityId.substring(0, 8)}...
            </p>
          </div>
          <Button
            type="button"
            size="xs"
            variant={selected ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onCompareToggle(e);
            }}
            className="h-6 text-[10px] px-2 rounded-md shrink-0"
          >
            {selected ? t("selected") : t("compare")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3.5 pt-0">
        <div className="flex flex-wrap gap-1.5 items-center">
        <LabelBadge className="text-[9px] py-0.5 px-1.5">{interaction.provider}</LabelBadge>
        {interaction.model && (
          <LabelBadge className="text-[9px] py-0.5 px-1.5 max-w-[120px] truncate" title={interaction.model}>
            {interaction.model.split("/").pop()}
          </LabelBadge>
        )}
        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold transition-colors ${statusColors}`}>
          {interaction.status}
        </span>
        {latestEventName && (
          <LabelBadge className="max-w-full truncate px-1.5 py-0.5 font-mono text-[9px]" title={interaction.eventNames.join("\n")}>
            {latestEventName}
          </LabelBadge>
        )}
        {durationSec && (
          <span className="text-[9px] text-text-soft flex items-center gap-1 font-mono ml-auto">
            <Clock className="h-3 w-3 shrink-0" />
            {durationSec}
          </span>
        )}
        </div>

        <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-[9px] font-semibold text-text-muted">
          <span
            className={`inline-flex items-center justify-center gap-1 rounded-md border px-1.5 py-1 ${
              interaction.prompt ? "border-info-border/60 bg-info-soft/20 text-info-text" : "border-border/60 bg-panel-subtle"
            }`}
            title={t("prompt")}
          >
            <MessageSquareText className="h-3 w-3" />
            {interaction.prompt ? t("capturedShort") : t("missingShort")}
          </span>
          <span
            className={`inline-flex items-center justify-center gap-1 rounded-md border px-1.5 py-1 ${
              interaction.parsedResult ? "border-success-border/60 bg-success-soft/20 text-success-text" : "border-border/60 bg-panel-subtle"
            }`}
            title={t("parsedResult")}
          >
            <FileJson2 className="h-3 w-3" />
            {parsedScore ?? (interaction.parsedResult ? t("jsonShort") : t("missingShort"))}
          </span>
          <span
            className={`inline-flex items-center justify-center gap-1 rounded-md border px-1.5 py-1 ${
              interaction.review ? "border-success-border/60 bg-success-soft/20 text-success-text" : "border-border/60 bg-panel-subtle"
            }`}
            title={t("reviewFeedback")}
          >
            <CheckCircle2 className="h-3 w-3" />
            {interaction.review ? interaction.review.rating : t("unreviewedShort")}
          </span>
          <span className="inline-flex items-center justify-center rounded-md border border-border/60 bg-panel-subtle px-1.5 py-1 font-mono">
            {interaction.eventNames.length}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
