"use client";

import { useTranslations } from "next-intl";
import { Search, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input";
import { Button } from "@/frontend/components/ui/button";
import { Select } from "@/frontend/components/ui/select";

export type AIInteractionsSortOrder = "newest" | "oldest";

interface QueryControlsPanelProps {
  search: string;
  setSearch: (val: string) => void;
  providerFilter: string;
  setProviderFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  moduleFilter: string;
  setModuleFilter: (val: string) => void;
  modelFilter: string;
  setModelFilter: (val: string) => void;
  sortOrder: AIInteractionsSortOrder;
  setSortOrder: (val: AIInteractionsSortOrder) => void;
  activeFiltersCount: number;
  resetFilters: () => void;
  filterOptions: { providers: string[]; models: string[]; modules: string[] };
}

export function QueryControlsPanel({
  search,
  setSearch,
  providerFilter,
  setProviderFilter,
  statusFilter,
  setStatusFilter,
  moduleFilter,
  setModuleFilter,
  modelFilter,
  setModelFilter,
  sortOrder,
  setSortOrder,
  activeFiltersCount,
  resetFilters,
  filterOptions,
}: QueryControlsPanelProps) {
  const t = useTranslations("admin.aiInteractions");

  return (
    <Card className="border-border/60 shadow-xs shrink-0">
      <CardHeader className="flex flex-row items-center justify-between p-2.5 pb-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-text-soft flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          {t("queryControls")}
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {t("activeFiltersCount", { count: activeFiltersCount })}
          </span>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-2.5 pt-1">
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted opacity-60" />
            <Input 
              value={search} 
              onChange={(event) => setSearch(event.target.value)} 
              placeholder={t("filterPlaceholder")} 
              className="h-8 rounded-lg pl-9 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1 block">{t("filterProvider")}</label>
            <Select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} className="h-8 text-xs">
              <option value="all">{t("filterAll")}</option>
              {filterOptions.providers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1 block">{t("filterStatus")}</label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 text-xs">
              <option value="all">{t("filterAll")}</option>
              <option value="validated">{t("statusValidated")}</option>
              <option value="applied">{t("statusApplied")}</option>
              <option value="prepared">{t("statusPrepared")}</option>
              <option value="failed">{t("statusFailed")}</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1 block">{t("filterModule")}</label>
            <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="h-8 text-xs">
              <option value="all">{t("filterAll")}</option>
              {filterOptions.modules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1 block">{t("sortOrder")}</label>
            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as AIInteractionsSortOrder)} className="h-8 text-xs">
              <option value="newest">{t("sortNewest")}</option>
              <option value="oldest">{t("sortOldest")}</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1 block">{t("filterModel")}</label>
          <Select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} className="h-8 text-xs">
            <option value="all">{t("filterAll")}</option>
            {filterOptions.models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </div>

        {activeFiltersCount > 0 && (
          <Button 
            type="button" 
            variant="outline" 
            size="xs" 
            onClick={resetFilters} 
            className="w-full h-8 text-[11px] rounded-lg mt-1"
          >
            {t("resetFilters")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
