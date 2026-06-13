"use client";

import React, { useState, useMemo } from "react";
import type { ListAdminAIInteractionsResponse } from "@/app/api/admin/ai-interactions/responses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIInteractionContentBlock } from "./ai-interaction-content-block";
import { useTranslations } from "next-intl";
import {
  Clock,
  Check,
  FileCode2,
  Terminal,
  Activity,
  AlertOctagon,
} from "lucide-react";
import { CopyableField } from "./copyable-field";
import { ComparisonColumn } from "./comparison-column";
import { JSONTreeViewer } from "./json-tree-viewer";
import { parseJSONResponse } from "./parse-json-response";
import { ReviewFeedbackCard } from "./review-feedback-card";

type Interaction = ListAdminAIInteractionsResponse[number];

export function AIInteractionComparison({ interactions }: { interactions: Interaction[] }) {
  const t = useTranslations("admin.aiInteractions");

  if (interactions.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 text-center p-6 border border-dashed border-border rounded-xl">
        <Activity className="h-8 w-8 text-text-muted animate-pulse" />
        <p className="text-sm font-medium text-text-soft">{t("selectToCompare")}</p>
      </div>
    );
  }

  if (interactions.length === 1) {
    return <DetailedInteractionView key={interactions[0].interactionId} interaction={interactions[0]} />;
  }

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-2">
      {interactions.map((interaction) => (
        <ComparisonColumn key={interaction.interactionId} interaction={interaction} />
      ))}
    </div>
  );
}

function DetailedInteractionView({ interaction }: { interaction: Interaction }) {
  const t = useTranslations("admin.aiInteractions");
  const latestEventName = interaction.eventNames.at(-1);
  const [activeTab, setActiveTab] = useState<"overview" | "parsedOutput" | "request" | "response">("parsedOutput");

  const statusColors = {
    applied: "bg-success-soft text-success-text border-success-border dark:bg-success-soft/20",
    failed: "bg-danger-soft text-danger-text border-danger-border dark:bg-danger-soft/20",
    validated: "bg-info-soft text-info-text border-info-border dark:bg-info-soft/20",
    prepared: "bg-warning-soft text-warning-text border-warning-border dark:bg-warning-soft/20",
  }[interaction.status] || "bg-muted text-muted-foreground";

  const tabs = [
    { id: "overview", label: t("tabOverview"), icon: Activity },
    { id: "parsedOutput", label: t("tabParsed"), icon: Check },
    { id: "request", label: t("tabRequest"), icon: FileCode2 },
    { id: "response", label: t("tabResponse"), icon: Terminal },
  ] as const;

  const parsedResponse = useMemo(() => {
    if (!interaction.rawResponse) return null;
    return parseJSONResponse(interaction.rawResponse);
  }, [interaction.rawResponse]);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="border-b border-border/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-text-muted font-bold block mb-1">
                {interaction.module}
              </span>
              <CardTitle className="text-xl font-bold text-text-main flex items-center gap-2.5">
                {interaction.operation}
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColors}`}>
                  {interaction.status}
                </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-text-soft">
              {interaction.durationMs && (
                <div className="flex items-center gap-1.5 bg-accent/40 rounded-lg px-2.5 py-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{(interaction.durationMs / 1000).toFixed(2)}s</span>
                </div>
              )}
              <div className="bg-accent/40 rounded-lg px-2.5 py-1">
                <span>{new Date(interaction.occurredAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pb-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-text-muted font-mono bg-zinc-800/40 border border-zinc-700/30 rounded-lg px-2.5 py-1">
            {interaction.provider}
          </span>
          {interaction.model && (
            <span className="text-xs font-semibold text-text-muted font-mono bg-zinc-800/40 border border-zinc-700/30 rounded-lg px-2.5 py-1">
              {interaction.model}
            </span>
          )}
          {latestEventName && (
            <span
              className="text-xs font-semibold text-text-muted font-mono bg-zinc-800/40 border border-zinc-700/30 rounded-lg px-2.5 py-1"
              title={interaction.eventNames.join("\n")}
            >
              {t("eventName")}: {latestEventName}
            </span>
          )}
          <span className="text-xs font-semibold text-text-muted font-mono bg-zinc-800/40 border border-zinc-700/30 rounded-lg px-2.5 py-1 ml-auto">
            UUID: {interaction.interactionId}
          </span>
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex border-b border-border/60 gap-1.5 p-1 bg-accent/30 rounded-xl max-w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    active
                      ? "bg-card text-text-main shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                      : "text-text-muted hover:text-text-main hover:bg-card/40"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="min-h-0 min-w-0 flex-1">
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                <Card className="border-border/60 shadow-xs">
                  <CardContent className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <CopyableField label="Interaction ID" value={interaction.interactionId} />
                      <CopyableField label="Entity Type" value={interaction.entityType} />
                      <CopyableField label="Entity ID" value={interaction.entityId} />
                      <CopyableField label="Prompt Hash" value={interaction.promptHash || "N/A"} />
                      <CopyableField label="Provider" value={interaction.provider} />
                      <CopyableField label="Model" value={interaction.model || "N/A"} />
                      <CopyableField label="Prompt Version" value={interaction.promptVersion || "N/A"} />
                      <CopyableField label={t("eventNames")} value={interaction.eventNames.join("\n")} />
                      <CopyableField label="Occurred At" value={new Date(interaction.occurredAt).toLocaleString()} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "parsedOutput" && (
              <div>
                {interaction.parsedResult ? (
                  <JSONTreeViewer data={interaction.parsedResult} />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border rounded-xl bg-panel-subtle">
                    <Check className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">{t("notCaptured")}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "request" && (
              <div className="flex flex-col gap-4">
                <Card className="border-border/60 shadow-xs">
                  <CardContent className="p-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted block">{t("filterProvider")}</span>
                      <span className="font-mono mt-0.5 block text-text-main font-semibold">{interaction.provider}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted block">{t("filterModel")}</span>
                      <span className="font-mono mt-0.5 block text-text-main font-semibold">{interaction.model || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted block">{t("promptVersionLabel")}</span>
                      <span className="font-mono mt-0.5 block text-text-main font-semibold">{interaction.promptVersion || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>
                <AIInteractionContentBlock
                  title={t("prompt")}
                  content={interaction.prompt}
                  emptyLabel={t("notCaptured")}
                />
              </div>
            )}

            {activeTab === "response" && (
              <div className="flex flex-col gap-4">
                <Card className="border-border/60 shadow-xs">
                  <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted block">{t("runStatusLabel")}</span>
                      <span className="font-mono mt-0.5 block uppercase tracking-wider text-text-main font-semibold">{interaction.status}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted block">{t("latencyLabel")}</span>
                      <span className="font-mono mt-0.5 block text-text-main font-semibold">{interaction.durationMs ? `${(interaction.durationMs / 1000).toFixed(2)}s` : "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                {interaction.error && (
                  <div className="flex items-start gap-3 rounded-xl border border-danger-border bg-danger-soft p-4 dark:bg-danger-soft/20 text-danger-text">
                    <AlertOctagon className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">{t("error")}</h4>
                      <p className="text-sm mt-1 leading-relaxed font-mono">{interaction.error}</p>
                    </div>
                  </div>
                )}

                {interaction.rawResponse ? (
                  <JSONTreeViewer
                    data={parsedResponse ?? interaction.rawResponse}
                    title={t("rawResponse")}
                    rawContent={interaction.rawResponse}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border rounded-xl bg-panel-subtle">
                    <Terminal className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">{t("notCaptured")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full">
          <ReviewFeedbackCard key={interaction.interactionId} interaction={interaction} />
        </div>
      </div>
    </div>
  );
}
