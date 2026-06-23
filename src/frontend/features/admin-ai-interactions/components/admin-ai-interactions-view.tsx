"use client";

import { useMemo, useState } from "react";
import { FeatureScreenShell } from "@/frontend/components/shared/feature-screen-shell";
import { Button } from "@/frontend/components/ui/button";
import { useAdminAIInteractions } from "../hooks/use-admin-ai-interactions";
import { AIInteractionCard } from "./ai-interaction-card";
import { AIInteractionComparison } from "./ai-interaction-comparison";
import { AIInteractionsStats } from "./ai-interactions-stats";
import { QueryControlsPanel } from "./query-controls-panel";
import { useTranslations } from "next-intl";
import { Sparkles, RotateCw } from "lucide-react";

export function AdminAIInteractionsView() {
  const query = useAdminAIInteractions();
  const t = useTranslations("admin.aiInteractions");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  type SortOrder = "newest" | "oldest";
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const filterOptions = useMemo(() => {
    const data = query.data ?? [];
    const providers = new Set<string>();
    const models = new Set<string>();
    const modules = new Set<string>();
    for (const item of data) {
      if (item.provider) providers.add(item.provider);
      if (item.model) models.add(item.model);
      if (item.module) modules.add(item.module);
    }
    return {
      providers: Array.from(providers),
      models: Array.from(models),
      modules: Array.from(modules),
    };
  }, [query.data]);

  const filteredInteractions = useMemo(() => {
    let result = query.data ?? [];

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        `${item.operation} ${item.provider} ${item.model ?? ""} ${item.entityId} ${item.error ?? ""}`.toLowerCase().includes(q)
      );
    }

    if (providerFilter !== "all") {
      result = result.filter((item) => item.provider === providerFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (modelFilter !== "all") {
      result = result.filter((item) => item.model === modelFilter);
    }

    if (moduleFilter !== "all") {
      result = result.filter((item) => item.module === moduleFilter);
    }

    result = [...result].sort((a, b) => {
      const timeA = new Date(a.occurredAt).getTime();
      const timeB = new Date(b.occurredAt).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [query.data, search, providerFilter, statusFilter, modelFilter, moduleFilter, sortOrder]);

  const effectiveActiveId = useMemo(() => {
    if (filteredInteractions.length === 0) return null;
    const exists = filteredInteractions.some((item) => item.interactionId === activeId);
    return exists ? activeId : filteredInteractions[0].interactionId;
  }, [filteredInteractions, activeId]);

  const activeInteraction = useMemo(() => {
    return filteredInteractions.find((item) => item.interactionId === effectiveActiveId) || null;
  }, [filteredInteractions, effectiveActiveId]);

  const comparedInteractions = useMemo(() => {
    return filteredInteractions.filter((item) => compareIds.includes(item.interactionId));
  }, [filteredInteractions, compareIds]);

  const toggleCompare = (id: string) => {
    setCompareIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current.slice(-2), id]
    );
  };

  const displayedInteractions = comparedInteractions.length > 0
    ? comparedInteractions
    : (activeInteraction ? [activeInteraction] : []);

  const queryError = query.error instanceof Error ? query.error.message : null;

  const errorStats = useMemo(() => {
    const total = filteredInteractions.length;
    if (total === 0) return { percent: 0, count: 0 };
    const failedCount = filteredInteractions.filter(i => i.status === "failed" || i.error).length;
    return {
      percent: Math.round((failedCount / total) * 100),
      count: failedCount
    };
  }, [filteredInteractions]);

  const modelsCount = useMemo(() => {
    const models = new Set(filteredInteractions.map(i => i.model).filter(Boolean));
    return models.size;
  }, [filteredInteractions]);

  const avgLatency = useMemo(() => {
    const itemsWithDuration = filteredInteractions.filter(i => typeof i.durationMs === "number");
    if (itemsWithDuration.length === 0) return "0s";
    const sum = itemsWithDuration.reduce((acc, curr) => acc + (curr.durationMs ?? 0), 0);
    const avg = sum / itemsWithDuration.length;
    return `${(avg / 1000).toFixed(1)} s`;
  }, [filteredInteractions]);

  const reviewedCount = useMemo(() => {
    return filteredInteractions.filter(i => i.review).length;
  }, [filteredInteractions]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (providerFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (modelFilter !== "all") count++;
    if (moduleFilter !== "all") count++;
    if (search.trim() !== "") count++;
    return count;
  }, [providerFilter, statusFilter, modelFilter, moduleFilter, search]);

  const resetFilters = () => {
    setSearch("");
    setProviderFilter("all");
    setStatusFilter("all");
    setModelFilter("all");
    setModuleFilter("all");
    setSortOrder("newest");
  };

  return (
    <FeatureScreenShell
      title={t("title")}
      actions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => query.refetch()}
          disabled={query.isRefetching || query.isLoading}
          className="gap-1.5 h-8.5 rounded-lg"
        >
          <RotateCw className={`h-3.5 w-3.5 ${query.isRefetching ? "animate-spin" : ""}`} />
          <span>{t("refresh")}</span>
        </Button>
      }
      contentClassName="max-w-none px-4 lg:px-6"
      bodyContentClassName="flex min-h-0 max-w-none w-full flex-col"
      bodyClassName="overflow-hidden flex flex-col h-full min-h-0"
    >
      <div className="mb-3 shrink-0">
        <AIInteractionsStats
          visibleRuns={filteredInteractions.length}
          errorPercent={errorStats.percent}
          errorCount={errorStats.count}
          modelsCount={modelsCount}
          avgLatency={avgLatency}
          reviewedCount={reviewedCount}
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[370px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col gap-3">
          <QueryControlsPanel
            search={search}
            setSearch={setSearch}
            providerFilter={providerFilter}
            setProviderFilter={setProviderFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            moduleFilter={moduleFilter}
            setModuleFilter={setModuleFilter}
            modelFilter={modelFilter}
            setModelFilter={setModelFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            activeFiltersCount={activeFiltersCount}
            resetFilters={resetFilters}
            filterOptions={filterOptions}
          />

          <div className="flex items-center justify-between px-1 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              {t("runIndex")}
            </span>
            <span className="text-[10px] font-mono text-text-soft">
              {t("runsReadyToInspect", { count: filteredInteractions.length })}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain rounded-lg border border-line bg-panel-subtle/40 p-1.5 [scrollbar-gutter:stable]">
            {query.isLoading ? (
              <div className="flex h-full min-h-[260px] items-center justify-center text-sm text-text-muted">
                {t("loading")}
              </div>
            ) : queryError ? (
              <div className="flex h-full min-h-[260px] items-center justify-center text-sm text-danger-text p-4 text-center">
                {queryError}
              </div>
            ) : filteredInteractions.length === 0 ? (
              <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 text-center text-text-muted">
                <Sparkles className="h-7 w-7 text-text-muted opacity-60" />
                <p className="text-sm">{t("empty")}</p>
              </div>
            ) : (
              filteredInteractions.map((interaction) => (
                <AIInteractionCard
                  key={interaction.interactionId}
                  interaction={interaction}
                  active={effectiveActiveId === interaction.interactionId}
                  selected={compareIds.includes(interaction.interactionId)}
                  onClick={() => {
                    setActiveId(interaction.interactionId);
                    setCompareIds([]);
                  }}
                  onCompareToggle={() => {
                    toggleCompare(interaction.interactionId);
                  }}
                />
              ))
            )}
          </div>
        </aside>
        <main className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          <AIInteractionComparison interactions={displayedInteractions} />
        </main>
      </div>
    </FeatureScreenShell>
  );
}
