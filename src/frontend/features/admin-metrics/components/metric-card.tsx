import { Card } from "@/frontend/components/ui/card";
import { useTranslations } from "next-intl";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  metricKey: string;
  label: string;
  total: number | undefined;
  windowCount: number | undefined;
  windowDays: number | null;
}

export function MetricCard({
  metricKey,
  label,
  total,
  windowCount,
  windowDays,
}: MetricCardProps) {
  const t = useTranslations("admin.dashboard");
  const hasDelta = windowDays !== null && windowCount !== undefined;

  return (
    <Card className="border border-line bg-card/65 p-5 flex flex-col justify-between h-[120px] shadow-sm select-none">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground line-clamp-2 leading-tight">
          {label}
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-auto">
        <div className="flex flex-row items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight text-text-main">
            {total ?? "-"}
          </span>
          
          {hasDelta && (
            <div>
              {windowCount > 0 ? (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success-text dark:text-success-text">
                  <ArrowUpRight className="h-3 w-3" />
                  {t("windowDelta", { count: windowCount, days: windowDays })}
                </span>
              ) : windowCount < 0 ? (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning/10 text-warning-text dark:text-warning-text">
                  <ArrowDownRight className="h-3 w-3" />
                  {t("windowDelta", { count: windowCount, days: windowDays })}
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                  <Minus className="h-2.5 w-2.5" />
                  {t("windowDelta", { count: windowCount, days: windowDays })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
