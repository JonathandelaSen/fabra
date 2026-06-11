"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Briefcase, Plus, Star, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { LabelBadge } from "@/components/shared/label-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { EvidenceCandidate, EvidenceItem } from "../api/performance-review-api";

const CANDIDATE_SOURCE_ORDER = [
  "journal_entry",
  "received_feedback",
  "commitment",
] as const;

interface ReviewEvidencePanelProps {
  candidates: EvidenceCandidate[];
  contextName: string | null;
  evidence: EvidenceItem[];
  isSaving: boolean;
  onAddCandidate: (candidate: EvidenceCandidate) => Promise<unknown>;
  onAddCustomEvidence: (content: string) => Promise<unknown>;
  onToggleHighlight: (id: string, highlighted: boolean) => Promise<unknown>;
  onRemove: (id: string) => Promise<unknown>;
  onReorder: (ids: string[]) => Promise<unknown>;
}

export function ReviewEvidencePanel(props: ReviewEvidencePanelProps) {
  const t = useTranslations("performanceReview");
  const [customEvidence, setCustomEvidence] = useState("");
  const curatedSourceIds = new Set(props.evidence.map((item) => item.sourceId));
  const available = props.candidates.filter(
    (candidate) => !curatedSourceIds.has(candidate.sourceId),
  );
  const groups = CANDIDATE_SOURCE_ORDER.map((source) => ({
    source,
    items: available
      .filter((candidate) => candidate.source === source)
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")),
  }));

  const move = (index: number, offset: number) => {
    const next = [...props.evidence];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    void props.onReorder(next.map((item) => item.id));
  };

  const addCustomEvidence = async () => {
    const content = customEvidence.trim();
    if (!content) return;
    await props.onAddCustomEvidence(content);
    setCustomEvidence("");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>{t("evidence.candidatesTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-text-muted">
              {t("evidence.candidatesDescription")}
            </p>
            {props.contextName && (
              <div className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-text-muted">
                <Briefcase className="h-4 w-4" />
                {t("evidence.contextScope", { context: props.contextName })}
              </div>
            )}
            {available.length === 0 && (
              <div className="rounded-lg border border-dashed border-line p-4">
                <p className="text-sm font-medium text-text-main">
                  {t("evidence.emptyTitle")}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  {t("evidence.emptyDescription")}
                </p>
              </div>
            )}
            <Tabs defaultValue={CANDIDATE_SOURCE_ORDER[0]}>
              <TabsList className="w-full justify-start overflow-x-auto">
                {groups.map((group) => (
                  <TabsTrigger key={group.source} value={group.source}>
                    {t(`sources.${group.source}`)} · {group.items.length}
                  </TabsTrigger>
                ))}
              </TabsList>
              {groups.map((group) => (
                <TabsContent key={group.source} value={group.source} className="space-y-2">
                  {group.items.length === 0 && (
                    <p className="rounded-lg border border-dashed border-line p-4 text-sm text-text-muted">
                      {t("evidence.sourceEmpty", { source: t(`sources.${group.source}`) })}
                    </p>
                  )}
                  {group.items.map((candidate) => (
                  <div
                    key={`${candidate.source}-${candidate.sourceId}`}
                    className="rounded-lg border border-line p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-text-main">{candidate.content}</p>
                        {candidate.date && (
                          <p className="mt-1.5 text-xs text-text-muted">
                            {candidate.date}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={props.isSaving}
                        onClick={() => props.onAddCandidate(candidate)}
                      >
                        <Plus /> {t("actions.add")}
                      </Button>
                    </div>
                  </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>
            {t("evidence.curatedTitle")}
            {props.evidence.length > 0 ? ` · ${props.evidence.length}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 rounded-lg border border-line bg-panel-subtle p-3">
            <p className="text-sm font-medium text-text-main">
              {t("evidence.customTitle")}
            </p>
            <p className="text-xs text-text-muted">
              {t("evidence.customDescription")}
            </p>
            <Textarea
              value={customEvidence}
              onChange={(event) => setCustomEvidence(event.target.value)}
              placeholder={t("evidence.customPlaceholder")}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={props.isSaving || !customEvidence.trim()}
                onClick={addCustomEvidence}
              >
                <Plus /> {t("evidence.addCustom")}
              </Button>
            </div>
          </div>
          <p className="text-sm text-text-muted">{t("evidence.highlightDescription")}</p>
          {props.evidence.length === 0 && (
            <p className="text-sm text-text-muted">{t("evidence.curatedEmpty")}</p>
          )}
          {props.evidence.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                item.highlighted
                  ? "border-amber-400/35 bg-amber-400/[0.06]"
                  : "border-line",
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <LabelBadge>{t(`sources.${item.source}`)}</LabelBadge>
                <div className="flex gap-1">
                  <Button
                    size="icon-sm"
                    variant={item.highlighted ? "secondary" : "ghost"}
                    disabled={props.isSaving}
                    onClick={() => props.onToggleHighlight(item.id, !item.highlighted)}
                    aria-label={
                      item.highlighted
                        ? t("actions.unhighlight")
                        : t("actions.highlight")
                    }
                    title={
                      item.highlighted
                        ? t("actions.unhighlight")
                        : t("actions.highlight")
                    }
                  >
                    <Star
                      className={cn(
                        item.highlighted && "fill-current text-amber-400",
                      )}
                    />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => move(index, -1)}
                    aria-label={t("actions.moveUp")}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => move(index, 1)}
                    aria-label={t("actions.moveDown")}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => props.onRemove(item.id)}
                    aria-label={t("actions.remove")}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-text-main">{item.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
