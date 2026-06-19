"use client";

import type React from "react";
import type { ListAdminAIInteractionsResponse } from "@/app/api/admin/ai-interactions/responses";
import { LabelBadge } from "@/components/shared/label-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";

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

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:bg-panel-hover hover:shadow-sm border-2 ${
        active
          ? "border-primary bg-panel-selected/40 shadow-sm"
          : "border-border/60"
      }`}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-1">
              {interaction.module}
            </span>
            <CardTitle className="text-sm font-semibold truncate text-text-main">
              {interaction.operation}
            </CardTitle>
            <p className="truncate text-[10px] text-text-muted mt-0.5 font-mono">
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
      <CardContent className="p-4 pt-0 flex flex-wrap gap-1.5 items-center">
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
      </CardContent>
    </Card>
  );
}
