"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import {
  useActivityContexts,
  useCreateActivityContext,
  useUpdateActivityContext,
  useDeleteActivityContext,
  useInvalidateActivityContextConsumers,
  useHandleActivityContextSuggestion,
} from "../hooks/use-activity-contexts";
import type { ActivityContext, ActivityContextSuggestion } from "../api/activity-context-api";
import { CreateContextForm } from "./create-context-form";
import { ContextRow } from "./context-row";
import { SuggestionRow } from "./suggestion-row";

type SourceKey = "workJournal" | "objectives" | "receivedFeedback" | "generic";

function resolveSourceKey(source: string | null): SourceKey {
  switch (source) {
    case "work-journal":
      return "workJournal";
    case "objectives":
      return "objectives";
    case "received-feedback":
      return "receivedFeedback";
    default:
      return "generic";
  }
}

function buildReturnUrl(returnTo: string, contextId: string): string {
  const url = new URL(returnTo, window.location.origin);
  url.searchParams.set("activityContextId", contextId);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function ActivityContextView() {
  const router = useRouter();
  const params = useSearchParams();
  const invalidateConsumers = useInvalidateActivityContextConsumers();
  const source = params.get("source");
  const returnTo = params.get("returnTo");
  const hasReturnTo = returnTo !== null;
  const isWorkJournal = source === "work-journal";

  const t = useTranslations("activityContexts");
  const query = useActivityContexts();
  const ctxCreator = useCreateActivityContext();
  const ctxUpdater = useUpdateActivityContext();
  const ctxDeleter = useDeleteActivityContext();
  const ctxSuggester = useHandleActivityContextSuggestion();

  const [lastCreated, setLastCreated] = useState<{ id: string; name: string } | null>(null);

  const contexts = query.data?.contexts ?? [];
  const suggestions = query.data?.suggestions ?? [];

  const visibleError =
    ctxCreator.error ?? ctxUpdater.error ?? ctxDeleter.error ?? ctxSuggester.error ?? null;

  const sortedContexts = useMemo(
    () =>
      [...contexts].sort(
        (a, b) =>
          Number(b.isDefault) - Number(a.isDefault) ||
          (a.status === b.status ? 0 : a.status === "active" ? -1 : 1) ||
          a.name.localeCompare(b.name)
      ),
    [contexts]
  );

  const navigateBackWithContext = useCallback(
    async (contextId: string) => {
      if (!returnTo) return;
      await invalidateConsumers();
      router.push(buildReturnUrl(returnTo, contextId));
    },
    [invalidateConsumers, returnTo, router]
  );

  const handleCreate = useCallback(
    async (input: { name: string; type: string }) => {
      setLastCreated(null);
      const created = await ctxCreator.create(input as Parameters<typeof ctxCreator.create>[0]);
      if (created && hasReturnTo) {
        await navigateBackWithContext(created.id);
        return;
      }
      if (created) {
        setLastCreated({ id: created.id, name: created.name });
      }
    },
    [ctxCreator, hasReturnTo, navigateBackWithContext]
  );

  const handleSelect = useCallback(
    async (context: ActivityContext) => {
      await navigateBackWithContext(context.id);
    },
    [navigateBackWithContext]
  );

  const handlePromote = useCallback(
    async (suggestion: ActivityContextSuggestion) => {
      setLastCreated(null);
      const result = await ctxSuggester.promote(suggestion);
      if (result && "id" in result && hasReturnTo) {
        await navigateBackWithContext((result as { id: string }).id);
        return;
      }
      if (result && "id" in result) {
        setLastCreated({ id: (result as { id: string; name: string }).id, name: suggestion.name });
      }
    },
    [ctxSuggester, hasReturnTo, navigateBackWithContext]
  );

  const handleHide = useCallback(
    async (suggestion: ActivityContextSuggestion) => {
      await ctxSuggester.hide(suggestion);
    },
    [ctxSuggester]
  );

  return (
    <FeatureScreenShell
      title={
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {hasReturnTo && (
              <button
                type="button"
                onClick={() => router.push(returnTo)}
                className="inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-soft"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("back")}
              </button>
            )}
            {hasReturnTo && (
              <span className="text-text-faint" aria-hidden="true">
                |
              </span>
            )}
            <h1 className="text-2xl font-semibold tracking-tight text-text-main">{t("title")}</h1>
          </div>
          {!isWorkJournal && t(`description.${resolveSourceKey(source)}`) && (
            <p className="mt-1 text-sm leading-relaxed text-text-muted">
              {t(`description.${resolveSourceKey(source)}`)}
            </p>
          )}
        </div>
      }
    >
      <div className={cn("grid gap-6", !isWorkJournal ? "xl:grid-cols-[minmax(0,1fr)_380px]" : "w-full")}>
        <section className="space-y-4">
          {visibleError && (
            <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>{visibleError}</AlertBanner>
          )}

          {lastCreated && hasReturnTo && (
            <div className="flex items-center gap-3 rounded-lg border border-success-border bg-success/[0.06] px-4 py-3">
              <Check className="h-4 w-4 shrink-0 text-success-text" />
              <p className="flex-1 text-sm text-text-soft">
                {t("created", { name: lastCreated.name })}
              </p>
              <IconTextButton
                icon={ArrowLeft}
                tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
                onClick={() => router.push(buildReturnUrl(returnTo, lastCreated.id))}
                className="shrink-0"
              >
                {t("selectAndReturn")}
              </IconTextButton>
            </div>
          )}

          <CreateContextForm
            isPending={ctxCreator.isPending}
            hasReturnTo={hasReturnTo}
            onCreate={handleCreate}
          />

          {query.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-text-faint" />
            </div>
          ) : sortedContexts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line/[0.08] px-6 py-10 text-center">
              <p className="text-sm text-text-faint">{t("empty")}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedContexts.map((context) => (
                <ContextRow
                  key={context.id}
                  context={context}
                  hasReturnTo={hasReturnTo}
                  onSelect={handleSelect}
                  onUpdate={ctxUpdater.update}
                  onDelete={ctxDeleter.remove}
                  isUpdating={ctxUpdater.isPending}
                />
              ))}
            </div>
          )}
        </section>

        {!isWorkJournal && (
          <aside className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-warning-text" />
              {t("suggestionsTitle")}
            </div>
            {suggestions.length === 0 ? (
              <p className="text-xs leading-5 text-text-faint">
                {t("suggestionsEmpty")}
              </p>
            ) : (
              <div className="space-y-1">
                {suggestions.map((suggestion) => (
                  <SuggestionRow
                    key={`${suggestion.type}:${suggestion.name}`}
                    suggestion={suggestion}
                    isPending={ctxSuggester.isPending}
                    hasReturnTo={hasReturnTo}
                    onPromote={handlePromote}
                    onHide={handleHide}
                  />
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </FeatureScreenShell>
  );
}
