"use client";

import { useMemo, useState } from "react";
import type { ListAdminAIInteractionsResponse } from "@/app/api/admin/ai-interactions/responses";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { useTranslations } from "next-intl";
import { Archive, Check, Loader2 } from "lucide-react";
import { useSaveAdminAIInteractionEvalCase } from "../hooks/use-admin-ai-interactions";

type Interaction = ListAdminAIInteractionsResponse[number];

export function EvalCaseCaptureCard({ interaction }: { interaction: Interaction }) {
  const t = useTranslations("admin.aiInteractions");
  const mutation = useSaveAdminAIInteractionEvalCase();
  const [name, setName] = useState(() => defaultCaseName(interaction));
  const [note, setNote] = useState("");

  const canSubmit = name.trim().length > 0 && Boolean(interaction.prompt) && !mutation.isPending;
  const savedCaseId = mutation.data?.caseId ?? null;
  const error = mutation.error instanceof Error ? mutation.error.message : null;
  const formId = `eval-case-form-${interaction.interactionId}`;

  const helperText = useMemo(() => {
    if (!interaction.prompt) return t("evalCaseMissingPrompt");
    if (savedCaseId) return t("evalCaseSavedId", { caseId: savedCaseId });
    return t("evalCaseDescription");
  }, [interaction.prompt, savedCaseId, t]);

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="border-b border-border/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-text-main">
            <Archive className="h-4 w-4" />
            {t("evalCaseTitle")}
          </CardTitle>
          {savedCaseId ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-success-border bg-success-soft px-2 py-0.5 text-xs font-semibold text-success-text">
              <Check className="h-3 w-3" />
              {t("evalCaseSaved")}
            </span>
          ) : (
            <Button
              type="submit"
              form={formId}
              size="sm"
              disabled={!canSubmit}
              className="gap-1.5"
            >
              {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Archive className="h-3.5 w-3.5" />}
              <span>{t("evalCaseSave")}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <p className="text-xs leading-relaxed text-text-muted">{helperText}</p>
        <form
          id={formId}
          className="flex min-w-0 flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit) return;
            mutation.mutate({
              interactionId: interaction.interactionId,
              name: name.trim(),
              note: note.trim() || null,
            });
          }}
        >
          <div className="grid gap-3 md:grid-cols-[minmax(160px,0.9fr)_minmax(180px,1.1fr)] md:items-end">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`eval-case-name-${interaction.interactionId}`}>{t("evalCaseNameLabel")}</Label>
              <Input
                id={`eval-case-name-${interaction.interactionId}`}
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("evalCaseNamePlaceholder")}
                maxLength={120}
                required
                disabled={!interaction.prompt || mutation.isPending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`eval-case-note-${interaction.interactionId}`}>{t("evalCaseNoteLabel")}</Label>
              <Textarea
                id={`eval-case-note-${interaction.interactionId}`}
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t("evalCaseNotePlaceholder")}
                maxLength={1000}
                disabled={!interaction.prompt || mutation.isPending}
                className="min-h-8 resize-y py-1.5 md:h-8 md:min-h-8"
              />
            </div>
          </div>
          {error && <p className="text-xs font-medium text-danger-text">{error}</p>}
        </form>
        </div>
      </CardContent>
    </Card>
  );
}

function defaultCaseName(interaction: Interaction): string {
  return `${interaction.module} ${interaction.operation}`;
}
